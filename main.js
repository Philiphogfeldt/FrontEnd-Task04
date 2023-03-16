Vue.createApp({
    data() {
        return {
            key: 'xOJnjrt9fhMMyvSANCOq9Cmrgiwa',
            secret: 'KruYoiK1rDkPfJ_P44Qy_zdfxL4a',
            accessToken: '67effa0e-f71e-393b-9012-e5117f0de90b',
            stopId: '',
            departures: [[], [], []],
            nextList: 0,
            userInput: '',
        };
    },
    // created() {
    //     this.getAccessToken()
    //         .then(() => this.getStopId())
    //         .then(() => this.getDepartures())
    // },
    methods: {
        async getAccessToken() {
            const url = 'https://api.vasttrafik.se/token';
            const callInfo = {
                Authorization: `Basic ${btoa(`${this.key}:${this.secret}`)}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            };
            const body = new URLSearchParams({
                format: 'json',
                grant_type: 'client_credentials',
            });

            const response = await fetch(url, {
                method: 'POST',
                headers: callInfo,
                body,
            });

            const data = await response.json();
            this.accessToken = data.access_token;
        },
        async getStopId() {
            const url = 'https://api.vasttrafik.se/bin/rest.exe/v2/location.name';
            const callInfo = {
                Authorization: `Bearer ${this.accessToken}`,
            };
            const dataForSearch = new URLSearchParams({
                format: 'json',
                input: this.userInput,
            });

            const response = await fetch(`${url}?${dataForSearch}`, {
                headers: callInfo,
            });

            const data = await response.json();
            this.stopId = data.LocationList.StopLocation[0].id;
        },
        async getDepartures() {
            await this.getAccessToken();
            await this.getStopId();

            const url = 'https://api.vasttrafik.se/bin/rest.exe/v2/departureBoard';
            const callInfo = {
                Authorization: `Bearer ${this.accessToken}`,
            };
            const now = new Date();

            const dataForSearch = new URLSearchParams({
                format: 'json',
                id: this.stopId,
                date: `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`,
                time: `${now.getHours()}:${now.getMinutes()}`,
            });

            const response = await fetch(`${url}?${dataForSearch}`, {
                headers: callInfo,
            });

            const data = await response.json();
            const serverDateTime = new Date(
                `${data.DepartureBoard.serverdate} ${data.DepartureBoard.servertime}`
            );
            // if(this.nextList === 2){
            //     this.nextList = 0;
            // }
            // else{}
            this.departures[this.nextList] = data.DepartureBoard.Departure
                .map((departure) => {
                    const { sname, direction, time, date, realTime, realDate } = departure;

                    const departureDateTime = realTime
                        ? new Date(`${realDate} ${realTime}`)
                        : new Date(`${date} ${time}`);

                    const diff = Math.round(
                        (departureDateTime.getTime() - serverDateTime.getTime()) / 1000 / 60
                    );
                    return { sname, direction, time, realTime, diff };
                })
                .filter((departure) => {
                    const departureDateTime = new Date(
                        `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()} ${departure.time}`
                    );
                    return departureDateTime.getTime() > now.getTime();
                })
                .sort((a, b) => a.diff - b.diff)
                .slice(0, 5);
                this.nextList++;
        },
        updateStop(stopName) {
            this.stopName = stopName;
            this.getDepartures();
        },
        // checkLists(){
        //     if (totalLists === 1){
        //         this.departures2 === this.departures
        //     }
        //     else if (totalLists === 2){
        //         this.departures3 === this.departures2
        //     }
        // }
    }
}).mount('#app');