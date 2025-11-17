<template>
    <button class="bg-red-100 text-red-600 rounded-full px-3 py-1 font-bold shadow hover:bg-red-200 transition"
        @click="openDialog()">
        -
    </button>

    <div v-if="dialog" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50 p-3">
        <div class="bg-white p-4 sm:p-8 rounded-2xl shadow-xl w-full max-w-sm animate-fadein">
            <h3 class="text-xl font-bold mb-4 text-red-600 text-center">ยืนยันการลบทะเบียนรถ</h3>
            <div class="text-center">
                <p class="text-gray-700 mb-2">
                    คุณแน่ใจที่จะลบทะเบียนรถ:
                </p>
                <p class="font-bold text-xl text-red-500 mb-6">
                    {{ licensePlate }}
                    <span class="text-sm text-gray-500">({{ licensePlateProvince }})</span>
                </p>
            </div>

            <div class="flex justify-around space-x-4">
                <button @click="dialog = false"
                    class="flex-1 bg-gray-300 text-gray-800 rounded-lg px-4 py-2 font-semibold hover:bg-gray-400 transition">
                    ยกเลิก
                </button>
                <button @click="deleteCar" :disabled="isLoading"
                    :class="{ 'bg-red-600 hover:bg-red-700': !isLoading, 'bg-red-400 cursor-not-allowed': isLoading }"
                    class="flex-1 text-white rounded-lg px-4 py-2 font-semibold shadow transition">
                    {{ isLoading ? 'กำลังลบ...' : 'ยืนยันลบ' }}
                </button>
            </div>
        </div>
    </div>
</template>

<script>
import Swal from 'sweetalert2';
import { LicensePlateService } from '../../api/License-plate';

export default {
    props: {
        vehicleId: {
            type: String,
            required: true
        },
        licensePlate: {
            type: String,
            required: true
        },
        licensePlateProvince: {
            type: String,
            default: ''
        }
    },
    data() {
        return {
            dialog: false,
            isLoading: false,
            licensePlateService: new LicensePlateService(),
        };
    },
    emits: ['success'],
    methods: {
        openDialog() {
            this.dialog = true;
        },
        async deleteCar() {
            this.isLoading = true;
            try {
                await this.licensePlateService.deleteVehicle(this.vehicleId);

                await Swal.fire({ 
                    icon: 'success',
                    title: `ลบทะเบียนรถสำเร็จ`,
                    text: `ทะเบียน ${this.licensePlate} ถูกลบเรียบร้อยแล้ว`,
                    // toast: true,
                    // position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000,
                    // timerProgressBar: true,
                });

                this.dialog = false;
                this.$emit('success', this.vehicleId);

            } catch (error) {
                console.error("Failed to delete vehicle:", error);

                await Swal.fire({
                    icon: 'error',
                    title: 'ลบข้อมูลไม่สำเร็จ!',
                    text: error.message || 'เกิดข้อผิดพลาดในการลบทะเบียนรถ กรุณาลองใหม่อีกครั้ง',
                });

            } finally {
                this.isLoading = false;
            }
        }
    }
};
</script>

<style scoped>
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
</style>