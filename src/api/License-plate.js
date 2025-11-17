import axios from 'axios'
import qs from 'qs'

export class LicensePlateService {
    constructor() {
        this.baseUrl = import.meta.env.VITE_APP_BASE_URL;
        this.token = localStorage.getItem("token"); 
    }

    async createVehicle(payload) {
        const url = `${this.baseUrl}api/v1/vehicle`;

        try {
            const response = await axios.post(
                url, 
                qs.stringify(payload), 
                {
                    headers: {
                        'Authorization': `Bearer ${this.token}`, 
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error adding vehicle:', error.response?.data || error.message);
            throw error.response?.data || error;
        }
    }

    async getVehicles() {
        const url = `${this.baseUrl}api/v1/vehicle`;

        try {
            const response = await axios.get(url, {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                },
            });
            return response.data; 
        } catch (error) {
            console.error("Error fetching vehicle data:", error);
            throw error; 
        }
    }

    async deleteVehicle(vehicleId) {
        const url = `${this.baseUrl}api/v1/vehicle/${vehicleId}`;
        try {
            const response = await axios.delete(url, {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error("Error deleting vehicle:", error);
            throw error;
        }
    }

    async getVehicleHistory(startDate, endDate, limit, page, licensePlate) {
        const params = {
            start: startDate,
            end: endDate,
            limit: limit,
            page: page,
            license: licensePlate
        };
        
        const queryString = qs.stringify(params);
        
        const url = `${this.baseUrl}api/v1/vehiclehistory?${queryString}`;

        try {
            const response = await axios.get(url, {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                },
            });
            return response.data; 
        } catch (error) {
            console.error("Error fetching vehicle history:", error);
            throw error; 
        }
    }
}