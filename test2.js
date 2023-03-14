Vue.createApp({
    data() {
        return {
            KEY: 'xOJnjrt9fhMMyvSANCOq9Cmrgiwa',
            SECRET: 'KruYoiK1rDkPfJ_P44Qy_zdfxL4a',
            stop: 'Sjömarkenskolan',
            stop2: 'svingeln',
            ACCESS_TOKEN: '',
            STOP_ID: '',
            STOP_ID2: '',
            departures: [],
            departures2: [],
        };
    },

    created() {
        this.getAccessToken()
            .then(() => Promise.all([
                this.getStopId('sjömarkenskolan'),
                this.getStopId('svingeln')
            ]))
            .then(([stopId1, stopId2]) => Promise.all([
                this.getDepartures(stopId1),
                this.getDepartures(stopId2)
            ]))
            .then(([departures1, departures2]) => {
                this.departures = departures1;
                this.departures2 = departures2;
            })
            .catch((error) => {
                console.error(error);
            });
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
            const params2 = new URLSearchParams({
                format: 'json',
                input: this.stop2,
            });

            const response = await Promise.all([
                fetch(`${url}?${params}`, { headers }),
                fetch(`${url}?${params2}`, { headers }),
            ]);

            const [data, data2] = await Promise.all([response[0].json(), response[1].json()]);

            this.STOP_ID = data.LocationList.StopLocation[0].id;
            this.STOP_ID2 = data2.LocationList.StopLocation[0].id;
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
            const params2 = new URLSearchParams({
                format: 'json',
                id: this.STOP_ID2,
                date: `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`,
                time: `${now.getHours()}:${now.getMinutes()}`,
            });

            const response = await Promise.all([
                fetch(`${url}?${params}`, { headers }),
                fetch(`${url}?${params2}`, { headers }),
            ]);

            const [data, data2] = await Promise.all([response[0].json(), response[1].json()]);

            const serverDateTime = new Date(`${data.DepartureBoard.serverdate} ${data.DepartureBoard.servertime}`);
            const serverDateTime2 = new Date(`${data2.DepartureBoard.serverdate} ${data2.DepartureBoard.servertime}`);

            this.departures = data.DepartureBoard.Departure
                .map((departure) => {
                    const { sname, direction, time, date, rtTime, rtDate } = departure;

                    const departureDateTime = rtTime
                        ? new Date(`${rtDate} ${rtTime}`)
                        : new Date(`${date} ${time}`);

                    const diff = Math.floor((departureDateTime - serverDateTime) / 1000 / 60);

                    return { sname, direction, time, diff };
                });

            this.departures2 = data2.DepartureBoard.Departure
                .map((departure) => {
                    const { sname, direction, time, date, rtTime, rtDate } = departure;

                    const departureDateTime = rtTime
                        ? new Date(`${rtDate} ${rtTime}`)
                        : new Date(`${date} ${time}`);

                    const diff2 = Math.floor((departureDateTime - serverDateTime2) / 1000 / 60);

                    return { sname2: sname, direction2: direction, time2: time, diff2 };
                });
        },
    }

}).mount('#app');
