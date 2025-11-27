<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">CKK School</h1>
        <p class="text-gray-500">
          {{ isRegister ? 'สมัครใช้งานระบบ' : 'ระบบเช็คชื่อนักเรียน' }}
        </p>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <template v-if="isRegister">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">ประเภทผู้ใช้</label>
            <select
              v-model="form.role"
              required
              class="w-full px-4 py-3 border rounded-lg"
            >
              <option value="student">นักเรียน</option>
              <option value="teacher">อาจารย์</option>
            </select>
          </div>

        <div>
  <label class="block text-sm font-medium text-gray-700 mb-2">
    {{ form.role === 'teacher' ? 'เลขประจำตัวอาจารย์ ' : 'เลขประจำตัวนักเรียน ' }}
  </label>

  <input
    v-model="form.userid"
    type="text"
    required
    maxlength="20"
    class="w-full px-4 py-3 border rounded-lg"
    placeholder="เช่น 123456"
    @input="form.userid = form.userid.replace(/[^0-9]/g, '').slice(0, 20)"
  />
</div>


          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">คำนำหน้า</label>
            <select v-model="form.pre_name" class="w-full px-4 py-3 border rounded-lg">
              <option value="เด็กชาย">เด็กชาย</option>
              <option value="เด็กหญิง">เด็กหญิง</option>
              <option value="นาย">นาย</option>
              <option value="นางสาว">นางสาว</option>
              <option value="นาง">นาง</option>
              <option value="Miss.">Miss.</option>
              <option value="Mr.">Mr.</option>
              <option value="Mrs.">Mrs.</option>
              <option value="Ms.">Ms.</option>
              <option value="custom">อื่นๆ (พิมพ์เอง)</option>
            </select>
          </div>

          <div v-if="form.pre_name === 'custom'" class="mt-2">
            <input
              v-model="form.custom_pre_name"
              type="text"
              maxlength="20"
              class="w-full px-4 py-3 border rounded-lg"
              placeholder="กรอกคำนำหน้าเอง เช่น Dr., Prof."
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">ชื่อ</label>
            <input
              v-model="form.first_name"
              type="text"
              required
              class="w-full px-4 py-3 border rounded-lg"
              placeholder="กรอกชื่อ"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">นามสกุล</label>
            <input
              v-model="form.last_name"
              type="text"
              required
              class="w-full px-4 py-3 border rounded-lg"
              placeholder="กรอกนามสกุล"
            />
          </div>

          <template v-if="form.role === 'student'">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                ระดับชั้น <span class="text-red-500">*</span>
              </label>
              <select
                v-model="form.grade"
                required
                class="w-full px-4 py-3 border rounded-lg"
              >
                <option value="">-- เลือกระดับชั้น --</option>
                <option value="ม.1">ม.1</option>
                <option value="ม.2">ม.2</option>
                <option value="ม.3">ม.3</option>
                <option value="ม.4">ม.4</option>
                <option value="ม.5">ม.5</option>
                <option value="ม.6">ม.6</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                ห้อง <span class="text-red-500">*</span>
              </label>
              <input
                v-model.number="form.classroom"
                type="number"
                required
                class="w-full px-4 py-3 border rounded-lg"
                placeholder="ห้อง 0"
              />
            </div>
          </template>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">รหัสผ่าน</label>
            <input
              v-model="form.password"
              type="password"
              required
              minlength="4"
              maxlength="20"
              class="w-full px-4 py-3 border rounded-lg"
              placeholder="กรอกรหัสผ่าน"
              @input="form.password = form.password.replace(/[^A-Za-z0-9]/g, '').slice(0, 20)"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">ยืนยันรหัสผ่าน</label>
            <input
              v-model="form.confirmPassword"
              type="password"
              required
              minlength="4"
              maxlength="20"
              class="w-full px-4 py-3 border rounded-lg"
              placeholder="ยืนยันรหัสผ่าน"
              @input="form.confirmPassword = form.confirmPassword.replace(/[^A-Za-z0-9]/g, '').slice(0, 20)"
            />
          </div>
        </template>

        <template v-else>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              ชื่อผู้ใช้ (เลขประจำตัว)
            </label>
            <input
              v-model="form.userid"
              type="text"
              required
              class="w-full px-4 py-3 border rounded-lg"
              placeholder=""
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">รหัสผ่าน</label>
            <input
              v-model="form.password"
              type="password"
              required
              class="w-full px-4 py-3 border rounded-lg"
              placeholder="กรอกรหัสผ่าน"
            />
          </div>
        </template>

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
          <span v-if="loading">
            {{ isRegister ? 'กำลังสมัคร...' : 'กำลังเข้าสู่ระบบ...' }}
          </span>
          <span v-else>{{ isRegister ? 'สมัครใช้งาน' : 'เข้าสู่ระบบ' }}</span>
        </button>

        <button
          type="button"
          @click="toggleMode"
          class="w-full mt-2 border border-blue-600 text-blue-600 py-3 rounded-lg font-semibold"
        >
          {{ isRegister ? 'กลับไปเข้าสู่ระบบ' : 'สมัครใช้งาน' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { registerUser } from '../api/Register';
import { loginUser } from '../api/Login';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const isRegister = ref(false);

const form = ref({
  role: 'student',
  pre_name: 'เด็กชาย',
  custom_pre_name: '',   
  first_name: '',
  last_name: '',
  userid: '',
  password: '',
  confirmPassword: '',
  grade: '',
  classroom: '',
});

const loading = ref(false);
const errorMessage = ref('');

const toggleMode = () => {
  isRegister.value = !isRegister.value;
  errorMessage.value = '';
};

const handleSubmit = async () => {
  loading.value = true;
  errorMessage.value = '';

  try {
    if (isRegister.value) {
      if (form.value.role === 'student') {
        if (!form.value.grade || form.value.classroom === '' || form.value.classroom === null) {
          errorMessage.value = 'กรุณาเลือกระดับชั้นและห้องเรียน';
          loading.value = false;
          return;
        }
      }

      if (form.value.password.length < 4) {
        errorMessage.value = 'รหัสผ่านต้องมีอย่างน้อย 4 ตัว';
        loading.value = false;
        return;
      }

      if (form.value.password.length > 20) {
        errorMessage.value = 'รหัสผ่านต้องไม่เกิน 20 ตัวอักษร';
        loading.value = false;
        return;
      }

      const passRegex = /^[A-Za-z0-9]+$/;
      if (!passRegex.test(form.value.password)) {
        errorMessage.value = 'รหัสผ่านต้องเป็นตัวเลขหรือภาษาอังกฤษเท่านั้น';
        loading.value = false;
        return;
      }

      if (form.value.password !== form.value.confirmPassword) {
        errorMessage.value = 'รหัสผ่านไม่ตรงกัน';
        loading.value = false;
        return;
      }

      let finalPreName = form.value.pre_name;
      if (form.value.pre_name === 'custom') {
        if (!form.value.custom_pre_name || !form.value.custom_pre_name.trim()) {
          errorMessage.value = 'กรุณากรอกคำนำหน้า';
          loading.value = false;
          return;
        }
        finalPreName = form.value.custom_pre_name.trim();
      }

      const { custom_pre_name, ...rest } = form.value;

      const payload = {
        ...rest,
        pre_name: finalPreName,          
        person_role: form.value.role,
      };

      await registerUser(payload);

      alert('สมัครสำเร็จ!');
      isRegister.value = false;
      loading.value = false;
      return;
    }

    const res = await loginUser({
      username: form.value.userid,
      password: form.value.password,
    });

    const token =
      res?.data?.access_token ||
      res?.access_token ||
      null;

    if (!token) {
      console.warn('No access_token in login response', res);
      throw new Error('ไม่พบ access_token จากเซิร์ฟเวอร์');
    }

    authStore.setToken(token);

    if (res.user) {
      if (res.user.grade) {
        localStorage.setItem('grade', res.user.grade);
      }
      if (res.user.classroom) {
        localStorage.setItem('classroom', res.user.classroom);
      }
    }

    const role = authStore.user?.role || form.value.role;

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

    if (
      isRegister.value &&
      typeof rawError === 'string' &&
      (rawError.toLowerCase().includes('user data not found') ||
       rawError.toLowerCase().includes('data not found'))
    ) {
      errorMessage.value = 'กรุณาตรวจสอบข้อมูลให้ถูกต้อง';
    } else if (err.response?.data?.error) {
      errorMessage.value = err.response.data.error;
    } else if (err.message) {
      errorMessage.value = err.message;
    } else {
      errorMessage.value = 'เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง';
    }
  } finally {
    loading.value = false;
  }
};
</script>
