import axios from 'axios';

const BASE_URL = import.meta.env.VITE_APP_BASE_URL; 

export async function loginUser(payload) {
  const formData = new URLSearchParams();
  formData.append('username', payload.username);
  formData.append('password', payload.password);

  const res = await axios.post(`${BASE_URL}/users/login`, formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    }
  });

localStorage.setItem('access_token', res.data.data.access_token);


  return res.data;
}
