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
      userInput: ''
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
    async getStopId(stopName) {
      const url = `https://api.vasttrafik.se/bin/rest.exe/v2/location.name?input=${this.stopName}&format=json`;
      const headers = {
        Authorization: `Bearer ${this.ACCESS_TOKEN}`,
      };

      const response = await fetch(url, {
        headers,
      });

      const data = await response.json();
      const stopLocation = data.LocationList.StopLocation.find(stop => stop.name.toLowerCase() === this.stopName.toLowerCase());
      this.STOP_ID = stopLocation.id;
    },

    async getDepartures() {
      const url = `https://api.vasttrafik.se/bin/rest.exe/v2/departureBoard?id=${this.STOP_ID}&date=${new Date().toISOString().slice(0, 10)}&time=${new Date().toISOString().slice(11, 16)}&format=json`;
      const headers = {
        Authorization: `Bearer ${this.ACCESS_TOKEN}`,
      };

      const response = await fetch(url, {
        headers,
      });

      const data = await response.json();
      const departures = data.DepartureBoard.Departure;

      departures.forEach(departure => {
        const listIndex = this.currentListIndex % 3;
        this.departures[listIndex].push({
          name: departure.name,
          departureTime: departure.time.slice(0, 5),
          minutes: Math.round((new Date(`${new Date().toISOString().slice(0, 10)}T${departure.time}:00`) - new Date()) / 60000)
        });
        this.currentListIndex++;
      });
    },

    async updateStop() {
      this.stopName = this.userInput.toLowerCase();
      await this.getStopId();
      await this.getDepartures();
    },
  },
}).mount('#app');

