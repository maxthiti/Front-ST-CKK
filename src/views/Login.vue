    <template>
        <div class="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-100 to-blue-100 p-4">
            <div class="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
                <div class="flex flex-col items-center mb-6">
                    <h2 class="text-3xl font-bold text-green-700 mb-2">สมาชิกลูกบ้าน</h2>
                    <p class="text-gray-500">กรอกเบอร์เพื่อเข้าใช้งาน</p>
                </div>

                <form @submit.prevent="register" class="space-y-5" v-if="!tokenInfo.hasPhone">
                    <div>
                        <label class="block mb-1 font-semibold text-gray-700">เบอร์โทร</label>
                        <input v-model="phone" type="tel" inputmode="numeric"
                            class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                            placeholder="กรอกเบอร์โทร (10 หลัก)" required maxlength="10" />
                    </div>

                    <div>
                        <label class="block mb-1 font-semibold text-gray-700">ยืนยันเบอร์โทร</label>
                        <input v-model="confirmPhone" type="tel" inputmode="numeric"
                            class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                            placeholder="กรอกเบอร์โทรอีกครั้ง" required maxlength="10" />

                        <p v-if="confirmPhone && !isPhoneMatch" class="mt-2 text-sm text-red-600">เบอร์ที่กรอกไม่ตรงกัน
                        </p>
                    </div>

                    <button type="submit" :disabled="!isFormValid"
                        class="w-full py-2 rounded-lg font-bold shadow hover:scale-105 transition"
                        :class="{ 'bg-gradient-to-r from-green-500 to-blue-500 text-white': isFormValid, 'bg-gray-400 text-gray-700 cursor-not-allowed': !isFormValid }">
                        เข้าสู่ระบบ / บันทึกเบอร์โทร
                    </button>
                </form>

                <div v-else-if="tokenInfo.hasPhone" class="text-center p-6 space-y-4">
                    <svg class="mx-auto h-16 w-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <h3 class="text-2xl font-extrabold text-green-700">เข้าสู่ระบบสำเร็จ!</h3>
                    <p class="text-gray-600">กำลังนำคุณเข้าสู่หน้าหลัก</p>
                </div>

                <div v-if="message" class="mt-4 text-center text-green-600" style="font-size: 13px;">{{ message }}</div>
            </div>
        </div>
    </template>

<script>
import Swal from 'sweetalert2';
import { LoginService } from '../api/User';
import axios from 'axios';
import { useAuthStore } from '../stores/auth';

export default {
    data() {
        return {
            phone: '',
            confirmPhone: '',
            message: '',
            token: null,
            tokenInfo: { hasPhone: false, phone: null },
            loginService: new LoginService()
        }
    },
    computed: {
        isPhoneValid() {
            return /^\d{10}$/.test(this.phone);
        },
        isPhoneMatch() {
            if (!this.confirmPhone) return true;
            return this.phone === this.confirmPhone;
        },
        isFormValid() {
            return this.isPhoneValid && this.isPhoneMatch;
        }
    },
    mounted() {
        this.checkTokenAndRedirect();
    },
    methods: {
        checkTokenAndRedirect() {
            const urlParams = new URLSearchParams(window.location.search);
            let currentToken = urlParams.get('access_token');

            if (!currentToken) {
                currentToken = localStorage.getItem('token');
            }

            this.token = currentToken;
            const LINE_LOGIN_URL = import.meta.env.VITE_LINE_REDIRECT_URL;

            if (!this.token) {
                this.message = 'โปรดเข้าสู่ระบบผ่าน LINE อีกครั้ง';
                this.tokenInfo = { hasPhone: false, phone: null };

                if (LINE_LOGIN_URL) {
                    setTimeout(() => {
                        window.location.href = LINE_LOGIN_URL;
                    }, 1500);
                } else {
                    console.error("VITE_LINE_REDIRECT_URL is not defined.");
                }
                return;
            }

            localStorage.setItem('token', this.token);

            this.tokenInfo = this.loginService.checkToken(this.token);

            if (!this.tokenInfo.hasPhone) {
                this.message = 'โปรดกรอกเบอร์โทรศัพท์เพื่อยืนยันตัวตน';
                this.tokenInfo = { hasPhone: false, phone: null }; 
                return; 
            }

            if (this.tokenInfo.name) {
                localStorage.setItem('residentName', this.tokenInfo.name);
            }
            if (this.tokenInfo.avatar) {
                localStorage.setItem('residentAvatar', this.tokenInfo.avatar);
            }

            if (this.tokenInfo.hasPhone) {
                this.message = 'มีเบอร์โทรศัพท์ในระบบแล้ว กำลังนำเข้าหน้าหลัก...';
                setTimeout(() => {
                    this.$router.push('/home');
                }, 1000);
            } else {
                this.message = 'โปรดกรอกเบอร์โทรศัพท์เพื่อยืนยันตัวตน';
            }
        },

        async register() {
            if (!this.isPhoneValid) {
                Swal.fire('ข้อผิดพลาด', 'รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง (ต้องเป็นตัวเลข 10 หลัก)', 'error');
                return;
            }

            if (!this.isPhoneMatch) {
                Swal.fire('ข้อผิดพลาด', 'เบอร์โทรไม่ตรงกัน กรุณาตรวจสอบอีกครั้ง', 'error');
                return;
            }

            const result = await Swal.fire({
                title: 'ยืนยันเบอร์โทรศัพท์',
                html: `คุณต้องการบันทึกเบอร์โทรศัพท์ "${this.phone}" ใช่หรือไม่? <br>ถ้าเกิดข้อผิดพลาดไม่สามารถแก้ไขได้ <br>ต้องพบนิติหอพักเท่านั้น`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'ยืนยัน',
                cancelButtonText: 'แก้ไข',
            });

            if (result.isConfirmed) {
                try {
                    this.message = 'กำลังบันทึกเบอร์โทรศัพท์...';

                    await this.loginService.savePhoneNumber(this.phone, this.token);

                    Swal.fire('สำเร็จ!', 'บันทึกเบอร์โทรศัพท์เรียบร้อยแล้ว', 'success');

                    try {
                        axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
                    } catch (e) { }

                    try {
                        const auth = useAuthStore();
                        await auth.initializeAuth();
                    } catch (e) {
                        console.warn('Failed to re-initialize auth store after saving phone', e);
                    }

                    this.message = 'บันทึกสำเร็จ กำลังนำเข้าหน้าหลัก...';
                    this.$router.push('/home');

                } catch (error) {
                    const errorMessage = error.response?.data?.message || 'ไม่สามารถบันทึกเบอร์โทรศัพท์ได้ กรุณาลองใหม่';
                    Swal.fire('บันทึกไม่สำเร็จ', errorMessage, 'error');
                    this.message = errorMessage;
                }
            }
        }
    }
}
</script>

<style>
.min-h-screen {
    min-height: 100vh;
}

.shadow-xl {
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}
</style>