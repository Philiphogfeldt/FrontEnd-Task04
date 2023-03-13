Vue.createApp({
    data() {
      return {
        KEY: 'xOJnjrt9fhMMyvSANCOq9Cmrgiwa',
        SECRET: 'KruYoiK1rDkPfJ_P44Qy_zdfxL4a',
        stop: 'Sjömarkenskolan',
        stop2: 'svingeln',
        ACCESS_TOKEN: '67effa0e-f71e-393b-9012-e5117f0de90b',
        STOP_ID: '',
        STOP_ID2: '',
        departures: [],
        departures2: [],
      };
    },
    created() {
      this.getAccessToken()
        .then(() => this.getStopId())
        .then(() => this.getStopId2())
        .then(() => this.getDepartures())
        .then(() => this.getDepartures2())
    },
    methods: {
      async getAccessToken() {
        const url = 'https://api.vasttrafik.se/token';
        const headers = {
          Authorization: `Basic ${btoa(`${this.KEY}:${this.SECRET}`)}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        };
        const body = new URLSearchParams({
          format: 'json',
          grant_type: 'client_credentials',
        });
  
        const response = await fetch(url, {
          method: 'POST',
          headers,
          body,
        });
  
        const data = await response.json();
        this.ACCESS_TOKEN = data.access_token;
      },
      async getStopId() {
        const url = 'https://api.vasttrafik.se/bin/rest.exe/v2/location.name';
        const headers = {
          Authorization: `Bearer ${this.ACCESS_TOKEN}`,
        };
        const params = new URLSearchParams({
          format: 'json',
          input: this.stop,
        });
  
        const response = await fetch(`${url}?${params}`, {
          headers,
        });
  
        const data = await response.json();
        this.STOP_ID = data.LocationList.StopLocation[0].id;
      },
      async getStopId2() {
        const url = 'https://api.vasttrafik.se/bin/rest.exe/v2/location.name';
        const headers = {
          Authorization: `Bearer ${this.ACCESS_TOKEN}`,
        };
        const params = new URLSearchParams({
          format: 'json',
          input: this.stop2,
        });
  
        const response = await fetch(`${url}?${params}`, {
          headers,
        });
  
        const data = await response.json();
        this.STOP_ID2 = data.LocationList.StopLocation[0].id;
      },
      async getDepartures2() {
        const url = 'https://api.vasttrafik.se/bin/rest.exe/v2/departureBoard';
        const headers = {
            Authorization: `Bearer ${this.ACCESS_TOKEN}`,
        };
        const now = new Date();
        const params = new URLSearchParams({
            format: 'json',
            id: this.STOP_ID2,
            date: `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`,
            time: `${now.getHours()}:${now.getMinutes()}`,
        });
      
        const response = await fetch(`${url}?${params}`, {
            headers,
        });
      
        const data = await response.json();
        const serverDateTime = new Date(
            `${data.DepartureBoard.serverdate} ${data.DepartureBoard.servertime}`
        );
      
        this.departures2 = data.DepartureBoard.Departure.map((departure2) => {
            const { sname2, direction2, time2, date2, rtTime2, rtDate2 } = departure2;
      
            const departureDateTime = rtTime
                ? new Date(`${rtDate} ${rtTime}`)
                : new Date(`${date} ${time}`);
      
            const diff = Math.round(
                (departureDateTime.getTime() - serverDateTime.getTime()) / 1000 / 60
            );
            return { sname2, direction2, time2, rtTime2, diff2 };
        }).filter(departure2 => {
            const departureDateTime = new Date(`${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()} ${departure2.time}`);
            return departureDateTime.getTime() > now.getTime();
        });
        },
      
      async getDepartures() {
        const url = 'https://api.vasttrafik.se/bin/rest.exe/v2/departureBoard';
        const headers = {
            Authorization: `Bearer ${this.ACCESS_TOKEN}`,
        };
        const now = new Date();
        const params = new URLSearchParams({
            format: 'json',
            id: this.STOP_ID,
            date: `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`,
            time: `${now.getHours()}:${now.getMinutes()}`,
        });
    
        const response = await fetch(`${url}?${params}`, {
            headers,
        });
    
        const data = await response.json();
        const serverDateTime = new Date(
            `${data.DepartureBoard.serverdate} ${data.DepartureBoard.servertime}`
        );
    
        this.departures = data.DepartureBoard.Departure.map((departure) => {
            const { sname, direction, time, date, rtTime, rtDate } = departure;
    
            const departureDateTime = rtTime
                ? new Date(`${rtDate} ${rtTime}`)
                : new Date(`${date} ${time}`);
    
            const diff = Math.round(
                (departureDateTime.getTime() - serverDateTime.getTime()) / 1000 / 60
            );
            return { sname, direction, time, rtTime, diff };
        }).filter(departure => {
            const departureDateTime = new Date(`${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()} ${departure.time}`);
            return departureDateTime.getTime() > now.getTime();
        });
        },
    }

}).mount('#app');

  