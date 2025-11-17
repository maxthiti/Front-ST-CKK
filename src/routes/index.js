import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/auth";

import RegisterMember from "../views/Login.vue";
import ResidentCar from "../views/Resident/ResidentCar.vue";
import Visitor from "../views/Visitor/Visitor.vue";
import History from "../views/Historylog/Historylog.vue";
import HomeLayout from "../views/Home.vue";

const routes = [
  {
    path: "/",
    component: RegisterMember,
  },
  {
    path: "/home",
    component: HomeLayout,
    redirect: "/resident-car",
    meta: { requiresAuth: true },
    children: [
      {
        path: "/resident-car",
        component: ResidentCar,
        meta: { requiresAuth: true },
      },
      { path: "/visitor", component: Visitor, meta: { requiresAuth: true } },
      { path: "/history", component: History, meta: { requiresAuth: true } },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  if (!authStore.isAuthenticated && localStorage.getItem("token")) {
    try {
      const initialized = await authStore.initializeAuth();
      console.log("Auth store initialized:", initialized);
    } catch (e) {
      console.warn("Auth initialization error in router guard:", e);
    }
  }

  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated) {
      console.log("Not authenticated, redirecting to login (root)");
      next("/");
      return;
    }
  }

  next();
});

export default router;
