import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/auth";
import Login from "../views/Login.vue";
import StudentLayout from "../layouts/StudentLayout.vue";
import TeacherLayout from "../layouts/TeacherLayout.vue";
import StudentHome from "../views/Student/Home.vue";

const routes = [
  {
    path: "/",
    redirect: "/login",
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
  },
  {
    path: "/student",
    name: "StudentLayout",
    component: StudentLayout,
    redirect: "/student/home",
    children: [
      {
        path: "home",
        name: "StudentHome",
        component: StudentHome,
      },
    ],
  },
  {
    path: "/teacher",
    name: "TeacherLayout",
    component: TeacherLayout,
    redirect: "/teacher/home",
    children: [
      {
        path: "home",
        name: "TeacherHome",
        component: () => import("../views/Teacher/Home.vue"),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
