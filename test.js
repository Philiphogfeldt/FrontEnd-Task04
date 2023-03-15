Vue.createApp({
    data() {
        return {
            KEY: 'xOJnjrt9fhMMyvSANCOq9Cmrgiwa',
            SECRET: 'KruYoiK1rDkPfJ_P44Qy_zdfxL4a',
            ACCESS_TOKEN: '67effa0e-f71e-393b-9012-e5117f0de90b',
            STOP_ID: '',
            departures: [[], [], []],
            currentListIndex: 0,
            stopName: 'sjömarkenskolan',
        };
    },
    created() {
        this.getAccessToken()
            .then(() => this.getStopId())
            .then(() => this.getDepartures());
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
              input: this.stopName,
            });
          
            const response = await fetch(`${url}?${params}`, {
              headers,
            });
          
            const data = await response.json();
            this.STOP_ID = data.LocationList.StopLocation[0].id;
          },          
          async getDepartures() {
            await this.getAccessToken();
            await this.getStopId();
          
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
          
            const newDepartures = data.DepartureBoard.Departure.map((departure) => {
              const { sname, direction, time, date, rtTime, rtDate } = departure;
          
              const departureDateTime = rtTime
                ? new Date(`${rtDate} ${rtTime}`)
                : new Date(`${date} ${time}`);
          
              return {
                name: sname,
                direction,
                departureTime: moment(departureDateTime).format('HH:mm'),
                minutes: moment(departureDateTime).diff(serverDateTime, 'minutes'),
              };
            });
          
            Vue.set(this.departures, this.currentListIndex, newDepartures);
          },          
          updateStop(stopName, listIndex) {
            this.stopName = stopName;
            this.currentListIndex = listIndex;
            this.getDepartures();
          },
          
    },
}).mount('#app');
