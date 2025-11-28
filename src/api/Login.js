import axios from 'axios';

const BASE_URL = import.meta.env.VITE_APP_BASE_URL;

export async function loginUser(payload) {
  const formData = new URLSearchParams();
  formData.append('username', payload.username);
  formData.append('password', payload.password);

  try {
    const teacherRes = await axios.post(`${BASE_URL}/users/login`, formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    localStorage.setItem('access_token', teacherRes.data.data.access_token);

    return {
      ...teacherRes.data,
      role: 'teacher'
    };

  } catch (errorTeacher) {
    console.warn("ครู login ไม่ผ่าน → ลองเป็นนักเรียน", errorTeacher);
  }

  try {
    const studentData = new URLSearchParams();
    studentData.append('username', payload.username);
    studentData.append('password', payload.password);
    studentData.append('role', 'student');

    const studentRes = await axios.post(
      `${BASE_URL}/users/personlogin`,
      studentData,
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    if (studentRes.data?.access_token) {
      localStorage.setItem('access_token', studentRes.data.access_token);
    }

    return {
      ...studentRes.data,
      role: 'student'
    };

  } catch (errorStudent) {
    console.warn("นักเรียน login ไม่ผ่านเช่นกัน", errorStudent);
    throw new Error("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
  }
}
