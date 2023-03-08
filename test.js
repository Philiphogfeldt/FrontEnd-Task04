Vue.createApp({
    data() {
        return {
            KEY: 'xOJnjrt9fhMMyvSANCOq9Cmrgiwa',
            SECRET: 'KruYoiK1rDkPfJ_P44Qy_zdfxL4a',
            stop: 'svingeln',
            ACCESS_TOKEN: '94fff7a2-e999-3f6f-bd08-78a0b0c56dbc',
            STOP_ID: '',
            departures: [],
        };
    },
    created() {
        this.getAccessToken()
            .then(() => this.getStopId())
            .then(() => this.getDepartures())
            .catch((error) => console.error(error));
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
            });
        }     
        
    }
    
}).mount('#app');