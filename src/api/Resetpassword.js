// src/api/ResetPassword.js
import axios from "axios";
import qs from "qs";
import { useAuthStore } from "../stores/auth";

const API_BASE_URL = import.meta.env.VITE_APP_BASE_URL ;

export const resetPassword = async ({ old_password, new_password }) => {
  const authStore = useAuthStore();
  const token = authStore.token;

  if (!token) {
    throw new Error("ไม่พบโทเคน กรุณาเข้าสู่ระบบใหม่");
  }

  const data = qs.stringify({
    old_password,
    new_password,
  });

  return axios.patch(`${API_BASE_URL}/users/password`, data, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Bearer ${token}`,
    },
  });
};
