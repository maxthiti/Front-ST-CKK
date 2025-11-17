import axios from "axios";
import qs from "qs";

export class VisitorService {
  constructor() {
    this.baseUrl = import.meta.env.VITE_APP_BASE_URL;
    this.token = localStorage.getItem("token");
  }

  async createVisitor(payload) {
    const url = `${this.baseUrl}api/v1/visitor`;
    try {
      const response = await axios.post(url, qs.stringify(payload), {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${this.token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error creating visitor:", error);
      throw error;
    }
  }

  async getVisitorList(limit = 5, page = 1, license = null) {
    const url = `${this.baseUrl}api/v1/visitor`;

    const params = new URLSearchParams();
    params.append("limit", limit);
    params.append("page", page);

    if (license) {
      params.append("license", license);
    }

    const fullUrl = `${url}?${params.toString()}`;

    try {
      const response = await axios.get(fullUrl, {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching visitor list:", error);
      throw error;
    }
  }

  async disableVisitor(visitorId) {
    const url = `${this.baseUrl}api/v1/disablevisitor`;

    const data = {
        visitorId: visitorId
    };

    try {
      const response = await axios.post(url, qs.stringify(data), {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${this.token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error creating visitor:", error);
      throw error;
    }
  }
}
