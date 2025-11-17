<template>
    <div class="px-2">
        <div class="w-full max-w-[1800px] mx-auto mt-2 px-3 py-2 bg-white rounded-lg shadow-xl">
            <p v-if="houseNumber" class="text-sm font-semibold text-gray-700">
                บ้านเลขที่: <span class="text-xl text-green-600 font-bold">{{ houseNumber }}</span>
            </p>
            <p v-else class="text-sm text-gray-500">
                กำลังโหลดบ้านเลขที่...
            </p>
            <div class="mb-6 flex items-center justify-between">
                <span class="font-bold text-lg">ทะเบียนรถลูกบ้าน</span>
                <button v-if="cars.length < maxVehicles"
                    class="ml-2 bg-gradient-to-r from-green-400 to-blue-400 rounded-full px-4 py-1 text-lg font-bold text-white shadow hover:scale-105 transition"
                    @click="showPopup = true">
                    + เพิ่มทะเบียนรถ
                </button>
                <p v-else class="text-sm font-bold text-red-600">
                    (เต็มโควต้า: {{ maxVehicles }} คัน)
                </p>
            </div>
            <div v-if="showPopup"
                class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50 p-3">

                <div
                    class="bg-white p-4 sm:p-8 rounded-2xl shadow-xl w-full max-w-md animate-fadein max-h-full overflow-y-auto">
                    <h3 class="text-xl font-bold mb-6 text-green-700 text-center">เพิ่มทะเบียนรถ</h3>
                    <CreateLicense @cancel="showPopup = false" @success="onCreated" />
                </div>

            </div>
            <div class="mt-6 overflow-x-auto bg-white rounded-xl shadow-sm">
                <table class="min-w-full text-left text-sm border-collapse shadow-sm rounded-xl overflow-hidden">
                    <thead>
                        <tr class="bg-gradient-to-r from-green-200 to-blue-200 text-green-900 border-b">
                            <th class="py-2 px-2 font-bold text-gray-700">ทะเบียนรถ / จังหวัด</th>
                            <th class="py-2 px-2 font-bold text-gray-700">วันเริ่มต้น</th>
                            <th class="py-2 px-2 font-bold text-gray-700">วันสิ้นสุด</th>
                            <th class="py-2 px-2 font-bold text-gray-700">จัดการ</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="cars.length === 0">
                            <td colspan="4" class="py-4 text-center text-gray-500">
                                ยังไม่มีทะเบียนรถในระบบ
                            </td>
                        </tr>
                        <tr v-for="(car, idx) in displayedCars" :key="idx" class="border-b hover:bg-blue-50">
                            <td class="py-2 px-2 break-all max-w-plate">
                                <div class="font-semibold text-gray-800">{{ car.licensePlate }}</div>
                                <div class="text-xs text-gray-500">{{ car.licensePlateProvince }}</div>
                            </td>
                            <td class="py-2 px-2">{{ formatDateDisplay(car.start) }}</td>
                            <td class="py-2 px-2">{{ formatDateDisplay(car.expire) }}</td>
                            <td class="py-2 px-2">
                                <DeleteLicense :vehicle-id="car._id" :license-plate="car.licensePlate"
                                    :license-plate-province="car.licensePlateProvince" @success="onDeleted" />
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div v-if="totalPages > 1" class="flex justify-center items-center space-x-2 mt-4 pb-2">

                <button :disabled="currentPage === 1" @click="goToPage(currentPage - 1)"
                    :class="{ 'opacity-50 cursor-not-allowed': currentPage === 1, 'hover:bg-gray-200': currentPage > 1 }"
                    class="p-2 rounded-full bg-white border border-gray-300 text-sm font-semibold text-gray-700 transition">
                    &lt; ก่อนหน้า
                </button>

                <button v-for="page in totalPages" :key="page" @click="goToPage(page)"
                    :class="{ 'bg-green-600 text-white shadow-md': page === currentPage, 'bg-white text-gray-700 hover:bg-gray-100': page !== currentPage }"
                    class="px-3 py-1 rounded-full text-sm font-semibold transition">
                    {{ page }}
                </button>

                <button :disabled="currentPage === totalPages" @click="goToPage(currentPage + 1)"
                    :class="{ 'opacity-50 cursor-not-allowed': currentPage === totalPages, 'hover:bg-gray-200': currentPage < totalPages }"
                    class="p-2 rounded-full bg-white border border-gray-300 text-sm font-semibold text-gray-700 transition">
                    ถัดไป &gt;
                </button>
            </div>
        </div>
    </div>
</template>

<script>
import CreateLicense from '../../components/resident/Create-license.vue'
import { ResidentService } from '../../api/Resident';
import { LicensePlateService } from '../../api/License-plate';
import DeleteLicense from '../../components/resident/Delete-license.vue';

export default {
    components: { CreateLicense, DeleteLicense },
    data() {
        return {
            residentName: '',
            cars: [],
            residentAvatar: null,
            houseNumber: null,
            maxVehicles: 0,
            residentService: new ResidentService(),
            licensePlateService: new LicensePlateService(),
            showPopup: false,
            isScreenSmall: window.innerWidth <= 400,
            currentPage: 1,
            perPage: 5,
            newCar: {
                plate: '',
                start: '',
                end: ''
            }
        }
    },

    async created() {
        const storedName = localStorage.getItem('residentName');
        const storedAvatar = localStorage.getItem('residentAvatar');

        if (storedName) {
            this.residentName = storedName;
        } else {
            this.residentName = 'ไม่พบชื่อเจ้าของบ้าน';
        }
        if (storedAvatar) {
            this.residentAvatar = storedAvatar;
        }
        await Promise.all([
            this.fetchResidentInfo(),
            this.fetchVehicles()
        ]);
        window.addEventListener('resize', this.handleResize);
    },

    beforeDestroy() {
        window.removeEventListener('resize', this.handleResize);
    },

    computed: {
        totalPages() {
            return Math.ceil(this.cars.length / this.perPage);
        },
        displayedCars() {
            const start = (this.currentPage - 1) * this.perPage;
            const end = start + this.perPage;
            return this.cars.slice(start, end);
        }
    },

    methods: {
        checkAuthErrorAndRedirect(error) {
            const status = error.status || (error.response && error.response.status);

            if (status === 401 || status === 403) {
                console.error("Authentication failed (401/403). Redirecting to login.");
                localStorage.removeItem('token');
                localStorage.removeItem('residentName');
                localStorage.removeItem('residentAvatar');
                this.$router.push('/');
                return true;
            }
            if (error.message && error.message.includes("Token not found")) {
                console.error("Redirecting to login due to missing token.");
                this.$router.push('/');
                return true;
            }
            return false;
        },
        async fetchResidentInfo() {
            try {
                const data = await this.residentService.getResidentInfo();

                console.log("Fetched resident data:", data);
                this.houseNumber = data.data.houseNumber;
                this.maxVehicles = data.data.maxVehicle || 0;

            } catch (error) {
                if (this.checkAuthErrorAndRedirect(error)) {
                    return;
                }

                console.error("Failed to fetch resident data:", error);
                this.houseNumber = 'โหลดข้อมูลไม่สำเร็จ';
            }
        },
        async fetchVehicles() {
            try {
                const data = await this.licensePlateService.getVehicles();

                this.cars = data.data || [];
                console.log("Fetched vehicle data:", this.cars);

            } catch (error) {
                if (this.checkAuthErrorAndRedirect(error)) {
                    return;
                }
                console.error("Failed to fetch vehicle data:", error);
                this.cars = [];
            }
        },
        onCreated(res) {
            this.showPopup = false;

            if (res && res.data) {

                const newCar = {
                    _id: res.data._id,
                    licensePlate: res.data.licensePlate,
                    licensePlateProvince: res.data.licensePlateProvince,
                    start: res.data.start,
                    expire: res.data.expire,
                };
                this.cars.push(newCar);
            }
        },

        formatDateDisplay(isoDateString) {
            if (!isoDateString) return '-';
            try {
                const date = new Date(isoDateString);
                const day = String(date.getDate()).padStart(2, '0');
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const year = date.getFullYear();
                return `${day}/${month}/${year}`;
            } catch (e) {
                console.error("Error formatting date:", e);
                return isoDateString.substring(0, 10);
            }
        },
        handleResize() {
            this.isScreenSmall = window.innerWidth <= 400;
        },
        goToPage(page) {
            if (page >= 1 && page <= this.totalPages) {
                this.currentPage = page;
            }
        },
        onDeleted(deletedVehicleId) {
            this.cars = this.cars.filter(car => {
                const carId = car.id || car._id;
                return carId !== deletedVehicleId;
            });

            if (this.displayedCars.length === 0 && this.currentPage > 1) {
                this.currentPage--;
            }
        },
    }
}
</script>

<style>
.max-w-xl {
    max-width: 520px;
}

.shadow-xl {
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}

.rounded-2xl {
    border-radius: 1rem;
}

.animate-fadein {
    animation: fadein 0.3s;
}

@keyframes fadein {
    from {
        opacity: 0;
        transform: scale(0.95);
    }

    to {
        opacity: 1;
        transform: scale(1);
    }
}

table th,
table td {
    padding-left: 0.5rem;
    padding-right: 0.5rem;
}

.break-all {
    word-break: break-all;
}

.max-w-plate {
    max-width: 120px;
    white-space: pre-line;
}
</style>