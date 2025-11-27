import { defineStore } from "pinia";
import { ref } from "vue";

function decodeToken(token) {
  try {
    if (!token || typeof token !== "string") return null;

    const parts = token.split(".");
    if (parts.length < 2) return null;

    let base64 = parts[1]
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    while (base64.length % 4 !== 0) {
      base64 += "=";
    }

    const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
    const json = new TextDecoder().decode(bytes);

    return JSON.parse(json);

  } catch (e) {
    console.error("Invalid token", e);
    return null;
  }
}


export const useAuthStore = defineStore("auth", () => {
  const user = ref(null);
  const token = ref(null);

  const setToken = (tokenValue) => {
    token.value = tokenValue;

    if (!tokenValue) {
      user.value = null;
      localStorage.removeItem("access_token");
      return;
    }

    localStorage.setItem("access_token", tokenValue);

    const payload = decodeToken(tokenValue);
    if (payload) {
      user.value = {
        name: payload.name,
        role: payload.role,
        picture: payload.picture,
        userid: payload.userid,
      };
    } else {
      user.value = null;
      localStorage.removeItem("access_token");
    }
  };

  const logout = () => {
    setToken(null);
  };

  const isAuthenticated = () => !!token.value;

  const savedToken = localStorage.getItem("access_token");
  if (savedToken && savedToken !== "undefined" && savedToken !== "null") {
    setToken(savedToken);
  }

  return {
    user,
    token,
    setToken,
    logout,
    isAuthenticated,
  };
});
