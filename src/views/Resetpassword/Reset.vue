<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
      <h1 class="text-2xl font-bold text-gray-800 mb-6 text-center">
        เปลี่ยนรหัสผ่าน
      </h1>

      <form @submit.prevent="handleSubmit" class="space-y-5">
      <div>
  <label class="block text-sm font-medium text-gray-700 mb-2">
    รหัสผ่านเดิม
  </label>

  <div class="relative">
    <input
      :type="showOldPassword ? 'text' : 'password'"
      v-model="form.old_password"
      required
      class="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
      placeholder="กรอกรหัสผ่านเดิม"
      @input="form.old_password = form.old_password.replace(/[^A-Za-z0-9]/g, '').slice(0,20)"
    />

    <button
      type="button"
      @click="showOldPassword = !showOldPassword"
      class="absolute inset-y-0 right-3 flex items-center text-gray-500"
    >
      <svg v-if="!showOldPassword" xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none"
        viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
      </svg>

      <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none"
        viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.993 9.993 0 012.212-3.592M9.88 9.88A3 3 0 0114.12 14.12M6.1 6.1l11.8 11.8"/>
      </svg>
    </button>
  </div>
</div>


       <div>
  <label class="block text-sm font-medium text-gray-700 mb-2">
    รหัสผ่านใหม่
  </label>

  <div class="relative">
    <input
      :type="showNewPassword ? 'text' : 'password'"
      v-model="form.new_password"
      required
      class="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
      placeholder="กรอกรหัสผ่านใหม่"
@input="form.new_password = form.new_password.replace(/[^A-Za-z0-9]/g, '').slice(0,20)"

    />

    <button
      type="button"
      @click="showNewPassword = !showNewPassword"
      class="absolute inset-y-0 right-3 flex items-center text-gray-500"
      
    >
      <svg v-if="!showNewPassword" xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none"
        viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
      </svg>

      <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none"
        viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.993 9.993 0 012.212-3.592M9.88 9.88A3 3 0 0114.12 14.12M6.1 6.1l11.8 11.8"/>
      </svg>
    </button>
  </div>
</div>


       <div>
  <label class="block text-sm font-medium text-gray-700 mb-2">
    ยืนยันรหัสผ่านใหม่
  </label>

  <div class="relative">
    <input
      :type="showConfirmPassword ? 'text' : 'password'"
      v-model="form.confirm_password"
      required
      class="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
      placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
    @input="form.confirm_password = form.confirm_password.replace(/[^A-Za-z0-9]/g, '').slice(0,20)"

    />

    <button
      type="button"
      @click="showConfirmPassword = !showConfirmPassword"
      class="absolute inset-y-0 right-3 flex items-center text-gray-500"
    >
      <svg v-if="!showConfirmPassword" xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none"
        viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
      </svg>

      <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none"
        viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.993 9.993 0 012.212-3.592M9.88 9.88A3 3 0 0114.12 14.12M6.1 6.1l11.8 11.8"/>
      </svg>
    </button>
  </div>
</div>


        <div
          v-if="errorMessage"
          class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm"
        >
          {{ errorMessage }}
        </div>

        <div
          v-if="successMessage"
          class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm"
        >
          {{ successMessage }}
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <span v-if="loading">กำลังบันทึก...</span>
          <span v-else>บันทึกการเปลี่ยนรหัสผ่าน</span>
        </button>

        <button
          type="button"
          @click="router.go(-1)"
          class="w-full mt-3 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300"
        >
          กลับไปหน้าก่อนหน้า
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { resetPassword } from "../../api/Resetpassword";
import { useAuthStore } from "../../stores/auth";
import { useRouter } from "vue-router";

const showOldPassword = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);


const form = ref({
  old_password: "",
  new_password: "",
  confirm_password: "",
});

const loading = ref(false);
const errorMessage = ref("");
const successMessage = ref("");

const authStore = useAuthStore();
const router = useRouter();



const handleSubmit = async () => {
  errorMessage.value = "";
  successMessage.value = "";

  const passwordRegex = /^[A-Za-z0-9]+$/;

  // เช็ครหัสผ่านทุกช่องว่ามีแค่ตัวเลข + อังกฤษ
  if (
    !passwordRegex.test(form.value.old_password) ||
    !passwordRegex.test(form.value.new_password) ||
    !passwordRegex.test(form.value.confirm_password)
  ) {
    errorMessage.value = "รหัสผ่านต้องเป็นตัวเลขหรือภาษาอังกฤษเท่านั้น";
    return;
  }

  // เช็คว่ารหัสผ่านใหม่กับยืนยันตรงกันไหม
  if (form.value.new_password !== form.value.confirm_password) {
    errorMessage.value = "รหัสผ่านใหม่ไม่ตรงกัน";
    return;
  }

  // เช็คความยาว
  if (form.value.new_password.length < 4) {
    errorMessage.value = "รหัสผ่านใหม่ควรมีอย่างน้อย 4 ตัว";
    return;
  }

  loading.value = true;

  try {
    await resetPassword({
      old_password: form.value.old_password,
      new_password: form.value.new_password,
    });

    successMessage.value = "เปลี่ยนรหัสผ่านสำเร็จ กรุณาเข้าสู่ระบบใหม่";

    setTimeout(() => {
      authStore.logout?.();
      router.push("/");
    }, 1500);
  } catch (err) {
    console.error(err);

    const rawError =
      err.response?.data?.error ||
      err.response?.data?.message ||
      err.message ||
      "";

    if (
      typeof rawError === "string" &&
      rawError.toLowerCase().includes("wrong old password")
    ) {
      errorMessage.value = "รหัสผ่านเดิมไม่ถูกต้อง";
    } else if (err.response?.data?.error) {
      errorMessage.value = err.response.data.error;
    } else if (err.message) {
      errorMessage.value = err.message;
    } else {
      errorMessage.value = "เปลี่ยนรหัสผ่านไม่สำเร็จ กรุณาลองใหม่อีกครั้ง";
    }
  } finally {
    loading.value = false;
  }
};

 
</script>
