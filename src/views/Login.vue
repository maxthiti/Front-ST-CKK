<template>
    <div class="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
            <div class="text-center mb-8">
                <h1 class="text-3xl font-bold text-gray-800 mb-2">CKK School</h1>
                <p class="text-gray-500">ระบบเช็คชื่อนักเรียน</p>
            </div>

            <form @submit.prevent="handleLogin" class="space-y-6">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        ชื่อผู้ใช้
                    </label>
                    <input v-model="form.username" type="text" required
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        placeholder="กรอกชื่อผู้ใช้" />
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        รหัสผ่าน
                    </label>
                    <input v-model="form.password" type="password" required
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        placeholder="กรอกรหัสผ่าน" />
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                        ประเภทผู้ใช้
                    </label>
                    <select v-model="form.role"
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all">
                        <option value="student">นักเรียน</option>
                        <option value="teacher">ครู</option>
                    </select>
                </div>

                <div v-if="errorMessage"
                    class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                    {{ errorMessage }}
                </div>

                <button type="submit" :disabled="loading"
                    class="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
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
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const form = ref({
    username: '',
    password: '',
    role: 'student'
});

const loading = ref(false);
const errorMessage = ref('');

const handleLogin = async () => {
    loading.value = true;
    errorMessage.value = '';

    try {
        await new Promise(resolve => setTimeout(resolve, 1000));

        authStore.setUser({
            name: form.value.username,
            role: form.value.role
        });

        if (form.value.role === 'student') {
            router.push('/student/home');
        } else if (form.value.role === 'teacher') {
            router.push('/teacher/home');
        }
    } catch (error) {
        errorMessage.value = 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง';
        console.error('Login error:', error);
    } finally {
        loading.value = false;
    }
};
</script>
