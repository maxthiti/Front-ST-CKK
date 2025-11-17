import axios from "axios";

export class ResidentService {
    constructor() {
        this.baseUrl = import.meta.env.VITE_APP_BASE_URL; 
        this.token = localStorage.getItem("token");
    }

    async getResidentInfo() {
        const url = `${this.baseUrl}api/v1/resident`;
        
        const token = localStorage.getItem("token"); 
        
        if (!token) {
            throw new Error("Access Token not found in Local Storage.");
        }

        try {
            const response = await axios.get(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            return response.data; 
        } catch (error) {
            console.error("Error fetching resident info:", error.response?.data || error.message || error);
            throw (error.response?.data || error); 
        }
    }
}