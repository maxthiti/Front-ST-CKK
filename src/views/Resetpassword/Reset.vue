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
          <input
            v-model="form.old_password"
            type="password"
            required
            class="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="กรอกรหัสผ่านเดิม"
             @input="form.old_password = form.old_password.replace(/[^A-Za-z0-9]/g, '')"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            รหัสผ่านใหม่
          </label>
          <input
            v-model="form.new_password"
            type="password"
            required
            class="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="กรอกรหัสผ่านใหม่"
             @input="form.new_password = form.new_password.replace(/[^A-Za-z0-9]/g, '')"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            ยืนยันรหัสผ่านใหม่
          </label>
          <input
            v-model="form.confirm_password"
            type="password"
            required
            class="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
              @input="form.confirm_password = form.confirm_password.replace(/[^A-Za-z0-9]/g, '')"

          />
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

  if (form.value.new_password !== form.value.confirm_password) {
    errorMessage.value = "รหัสผ่านใหม่ไม่ตรงกัน";
    return;
  }

  const passwordRegex = /^[A-Za-z0-9]+$/;

if (!passwordRegex.test(form.value.new_password)) {
  errorMessage.value = "รหัสผ่านต้องเป็นตัวเลขหรือภาษาอังกฤษเท่านั้น";
  return;
}

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

  // 👇 แมปข้อความจาก backend เป็นภาษาไทย
  if (typeof rawError === "string" && rawError.toLowerCase().includes("wrong old password")) {
    errorMessage.value = "รหัสผ่านเดิมไม่ถูกต้อง";
  } else if (err.response?.data?.error) {
    errorMessage.value = err.response.data.error;
  } else if (err.message) {
    errorMessage.value = err.message;
  } else {
    errorMessage.value = "เปลี่ยนรหัสผ่านไม่สำเร็จ กรุณาลองใหม่อีกครั้ง";
  }
}
  finally {
    loading.value = false;
  }
};

</script>
