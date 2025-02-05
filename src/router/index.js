import { createRouter, createWebHashHistory } from "vue-router";
import HomeViewVue from "../views/HomeView.vue";
import AuthenticationView from "../views/AuthenticationView.vue";
import RecordView from "../views/RecordView.vue";

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: "/", component: HomeViewVue },
    { path: "/auth", component: AuthenticationView },
    { path: "/record", component: RecordView },
    {
      path: "/forgot-pasword",
      component: () => import("../views/ForgotPassword.vue"),
    },
  ],
});

export default router;
