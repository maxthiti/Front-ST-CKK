import axios from 'axios';

const BASE_URL = import.meta.env.VITE_APP_BASE_URL;

export async function registerUser(payload) {
  const formData = new URLSearchParams();

  formData.append('role', payload.role);
  formData.append('pre_name', payload.pre_name === 'custom' ? payload.custom_pre_name : payload.pre_name);
  formData.append('first_name', payload.first_name);
  formData.append('last_name', payload.last_name);
  formData.append('userid', payload.userid);
  formData.append('password', payload.password);

  if (payload.role === 'student') {
    formData.append('grade', payload.grade);
    formData.append('classroom', payload.classroom);
  }

  const res = await axios.post(`${BASE_URL}/users/register`, formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  return res.data;
}
