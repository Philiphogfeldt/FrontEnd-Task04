Vue.createApp({
    data() {
        return {
            key: 'xOJnjrt9fhMMyvSANCOq9Cmrgiwa',
            secret: 'KruYoiK1rDkPfJ_P44Qy_zdfxL4a',
            accessToken: '67effa0e-f71e-393b-9012-e5117f0de90b',
            // stopId: ['', '', ''],
            departures: [[], [], []],
            stopData: [
                {
                    stopId: '',
                    depatureName: '',
                    departures: []
                },
                {
                    stopId: '',
                    depatureName: '',
                    departures: []
                },
                {
                    stopId: '',
                    depatureName: '',
                    departures: []
                }
            ],

            nextList: 0,
            userInput: '',
            serverDateTime: null,
            currentTime: '00:00:00',
            buttonList: [],
            newButton: '',
        };
    },
    created() {
        setInterval(this.updateTime, 1000);

        const savedDepartures = localStorage.getItem('departures');
        if (savedDepartures) {
            this.stopData = JSON.parse(savedDepartures);
        }
        const buttons = localStorage.getItem('buttons');
        if (buttons) {
            this.buttonList = JSON.parse(buttons);
        }
    },
    methods: {
        updateTime() {
            let timNow = new Date();
            this.currentTime = `${this.dubbledigits(timNow.getHours())}:${this.dubbledigits(
                timNow.getMinutes()
            )}:${this.dubbledigits(timNow.getSeconds())}`;
        },
        dubbledigits(number) {
            return number < 10 ? '0' + number : number;
        },
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
        const url = 'https://api.vasttrafik.se/bin/rest.exe/v2/departureBoard?id=${this.stopId}&format=json';
        const callInfo = {
        Authorization: `Bearer ${this.accessToken}`,
        };
        const response = await fetch(url, {
            headers: callInfo,
        });

        const data = await response.json();
        this.departures[this.nextList] = data.DepartureBoard.Departure;

        // Update stopData
        this.stopData[this.nextList].stopId = this.stopId;
        this.stopData[this.nextList].departureName = data.DepartureBoard.stop;
        this.stopData[this.nextList].departures = this.departures[this.nextList];

        // Save departures to local storage
        localStorage.setItem('departures', JSON.stringify(this.stopData));

        // Increment nextList to cycle through the stopData array
        this.nextList = (this.nextList + 1) % 3;
    },
    addNewButton() {
        if (this.newButton) {
            this.buttonList.push(this.newButton);
            localStorage.setItem('buttons', JSON.stringify(this.buttonList));
            this.newButton = '';
        }
    },
    removeButton(index) {
        this.buttonList.splice(index, 1);
        localStorage.setItem('buttons', JSON.stringify(this.buttonList));
    },
},
computed: {
    sortedButtons() {
        return this.buttonList.sort();
    },
},
}).mount('#app');