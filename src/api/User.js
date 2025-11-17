import axios from "axios";

function decodeJwt(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("JWT decoding failed:", e);
    return null;
  }
}

export class LoginService {
  constructor() {
    this.baseUrl = import.meta.env.VITE_APP_BASE_URL;
  }

  checkToken(token) {
    const payload = decodeJwt(token);

    const FORCE_EXPIRATION_TEST = false;

    const defaultResp = { hasPhone: false, phone: null, expired: false };

    if (!payload) {
      return { ...defaultResp, expired: true };
    }

    const currentTime = Date.now() / 1000;
    if (FORCE_EXPIRATION_TEST || (payload.exp && payload.exp < currentTime)) {
      console.error("Token has expired (Forced)");
      return { ...defaultResp, expired: true };
    }

    const name = payload?.displayName;
    const avatar = payload?.avatar;

    if (payload && payload.phoneNumber) {
      return {
        hasPhone: true,
        phone: payload.phoneNumber,
        name: name,
        avatar: avatar,
        expired: false,
      };
    }

    return { ...defaultResp, expired: false };
  }

  async savePhoneNumber(phoneNumber, token) {
    const url = `${this.baseUrl}api/v1/phonenumber`;
    const dataToSend = { phoneNumber: phoneNumber };

    try {
      const response = await axios.post(url, dataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error saving phone number:", error);
      throw error;
    }
  }
}
