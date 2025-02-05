import { createApp } from "vue";
import { createPinia } from "pinia";
import { useAuthStore } from "./stores/auth";
import App from "./App.vue";
import router from "./router";
import ToastPlugin from "vue-toast-notification";
import "vue-toast-notification/dist/theme-default.css";
import "vue-toast-notification/dist/theme-bootstrap.css";
const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(ToastPlugin);

const authStore = useAuthStore();
authStore.initializeAuth().then(() => {
  app.mount("#app");
});
