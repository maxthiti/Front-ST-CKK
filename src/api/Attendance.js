// src/api/Attendance.js
import axios from "axios";

const BASE_URL = import.meta.env.VITE_APP_BASE_URL; 

export async function getAttendance({
  start,
  end,
  page = 1,
  limit = 20,
  role = "student",
  grade,
  classroom,
}) {
  const token = localStorage.getItem("access_token"); 

  const res = await axios.get(`${BASE_URL}/report/attendance`, {
    params: {
      start,
      end,
      page,
      limit,
      role,
      grade,
      classroom,
    },
    headers: {
      Authorization: `Bearer ${token}`, 
    },
    maxBodyLength: Infinity,
  });

  return res.data;
}
