import { createApp } from "vue";
import { createPinia } from "pinia";
import router from "./routes";
import App from "./App.vue";
import "./style.css";
import './registerSW'

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

app.mount("#app");
