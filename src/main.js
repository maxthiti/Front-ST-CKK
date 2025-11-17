import { createApp } from "vue";
import "./assets/tailwind.css";
import DatePicker from "vue-datepicker-next";
import "vue-datepicker-next/index.css";
import App from "./App.vue";
import router from "./routes";
import { createPinia } from "pinia";
import { useAuthStore } from "./stores/auth";
import axios from "axios";

const app = createApp(App);

app.use(createPinia());
app.use(router);

const authStore = useAuthStore();
const initialized = authStore.initializeAuth();
console.log("Main.js - Auth store initialized:", initialized);

const token = localStorage.getItem("token");
if (token) {
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      console.warn(
        "Global interceptor: 401 received, clearing token and redirecting to login"
      );
      try {
        localStorage.removeItem("token");
      } catch (e) {}
      const loginPath = "/";
      if (window.location.pathname !== loginPath) {
        window.location.href = loginPath;
      }
    }
    return Promise.reject(error);
  }
);

app.mount("#app");
