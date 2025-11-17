import axios from "axios";

export class vehicleService {
    constructor(context) {
        this.context = context;
        this.baseUrl = import.meta.env.VITE_APP_BASE_URL;
        this.token = localStorage.getItem("token");
    }

    async AddDevice(sendData) {
        let data = null;

        let config = {
            method: "post",
            maxBodyLength: Infinity,
            url: `${this.baseUrl}lpr/api/v1/addvehicle`,
            headers: {
                Authorization: `Bearer ${this.token}`,
            },
            data: sendData,
        };

        await axios
            .request(config)
            .then((response) => {
                data = response.data;
            })
            .catch((error) => {
                data = { error: error.message, data: error.response.data };
            });

        return data;
    }

    async getDevice(parkId) {
        let data = null;

        let config = {
            method: "get",
            maxBodyLength: Infinity,
            url: `${this.baseUrl}lpr/api/v1/device/park/${parkId}`,
            headers: {
                Authorization: `Bearer ${this.token}`,
            },
        };

        await axios
            .request(config)
            .then((response) => {
                data = response.data;
            })
            .catch((error) => {
                data = { error: error.message, data: error.response.data };
            });

        return data;
    }
}