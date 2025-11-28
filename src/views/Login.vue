<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">CKK School</h1>
        <p class="text-gray-500">ระบบเช็คการสแกน</p>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-6">

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            ชื่อผู้ใช้ (เลขประจำตัว)
          </label>
          <input
            v-model="form.userid"
            type="text"
            required
            class="w-full px-4 py-3 border rounded-lg"
          />
        </div>

       <div class="relative">
  <input
    v-model="form.password"
    :type="showPassword ? 'text' : 'password'"
    required
    class="w-full px-4 py-3 border rounded-lg pr-12"
    placeholder="กรอกรหัสผ่าน"
    @input="form.password = form.password.replace(/[^A-Za-z0-9]/g, '').slice(0,20)"
  />

  <button
    type="button"
    @click="showPassword = !showPassword"
    class="absolute inset-y-0 right-3 flex items-center text-gray-500"
  >
    <!-- มองเห็นรหัส -->
    <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none"
         viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
    </svg>

    <!-- ซ่อนรหัส -->
    <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none"
         viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.993 9.993 0 012.212-3.592M9.88 9.88A3 3 0 0114.12 14.12M6.1 6.1l11.8 11.8"/>
    </svg>
  </button>
</div>


        <div
          v-if="errorMessage"
          class="bg-red-50 border text-red-600 px-4 py-3 rounded-lg text-sm"
        >
          {{ errorMessage }}
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold"
        >
          <span v-if="loading">กำลังเข้าสู่ระบบ...</span>
          <span v-else>เข้าสู่ระบบ</span>
        </button>

      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { loginUser } from '../api/Login';
import { useAuthStore } from '../stores/auth';

const showPassword = ref(false);

const router = useRouter();
const authStore = useAuthStore();

const loading = ref(false);
const errorMessage = ref('');

const form = ref({
  userid: '',
  password: '',
});

const handleSubmit = async () => {
  loading.value = true;
  errorMessage.value = '';

  try {
    const res = await loginUser({
      username: form.value.userid,
      password: form.value.password,
    });

    const token =
      res?.data?.access_token ||
      res?.access_token ||
      null;

    if (!token) throw new Error('ไม่พบ access_token จากเซิร์ฟเวอร์');

    authStore.setToken(token);

    if (res.user) {
      if (res.user.grade) {
        localStorage.setItem('grade', res.user.grade);
      }
      if (res.user.classroom) {
        localStorage.setItem('classroom', res.user.classroom);
      }
    }

    const role = authStore.user?.role;

    if (role === 'student') {
      router.push('/student/home');
    } else if (role === 'teacher') {
      router.push('/teacher/home');
    } else {
      router.push('/');
    }

  } catch (err) {
    console.error(err);

    const rawError =
      err.response?.data?.error ||
      err.response?.data?.message ||
      '';

    if (rawError) errorMessage.value = rawError;
    else errorMessage.value = err.message || 'เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง';

  } finally {
    loading.value = false;
  }
};
</script>
