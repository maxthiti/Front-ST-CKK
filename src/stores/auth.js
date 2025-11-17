import { defineStore } from "pinia";
import { ref } from "vue";

export const useAuthStore = defineStore("auth", () => {
  const user = ref(null);
  const token = ref(null);

  const setUser = (userData) => {
    user.value = userData;
  };

  const setToken = (tokenValue) => {
    token.value = tokenValue;
    if (tokenValue) {
      localStorage.setItem("token", tokenValue);
    } else {
      localStorage.removeItem("token");
    }
  };

  const logout = () => {
    user.value = null;
    token.value = null;
    localStorage.removeItem("token");
  };

  const isAuthenticated = () => {
    return !!token.value;
  };

  return {
    user,
    token,
    setUser,
    setToken,
    logout,
    isAuthenticated,
  };
});
