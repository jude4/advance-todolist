import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import "./index.css";
import Vuesax from "vuesax3";
import "vuesax3/dist/vuesax.css";
import "material-icons/iconfont/material-icons.css";

const app = createApp(App);

app.use(Vuesax);
app.use(router);

app.mount("#app");
