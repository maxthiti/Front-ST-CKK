<template>
    <div class="h-full">
        <form @submit.prevent="submit"
            class="space-y-4 p-6 max-w-lg mx-auto bg-white rounded-xl shadow-2xl border border-gray-100 mt-8">

            <div>
                <label class="block mb-1 font-semibold text-gray-700">ทะเบียนรถ</label>
                <input v-model="form.licensePlate" type="text"
                    class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                    required />
            </div>

            <div>
                <label class="block mb-1 font-semibold text-gray-700">จังหวัดป้ายทะเบียน</label>
                <div class="relative">
                    <input v-model="provinceQuery" type="text" placeholder="พิมพ์เพื่อค้นหาจังหวัด..."
                        class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                        @focus="provinceOpen = true" @input="provinceOpen = true" @blur="closeProvinceDropdown"
                        required />
                    <div v-if="provinceOpen"
                        class="absolute z-10 mt-1 w-full max-h-56 overflow-auto bg-white border border-gray-200 rounded-lg shadow-xl"
                        @mousedown.prevent>
                        <div v-for="(p, idx) in filteredProvinces" :key="`prov-${idx}`"
                            class="px-3 py-2 hover:bg-orange-50 cursor-pointer transition" @click="selectProvince(p)">
                            {{ p }}
                        </div>
                        <div v-if="filteredProvinces.length === 0" class="px-3 py-2 text-gray-500">ไม่พบจังหวัด</div>
                    </div>
                </div>
            </div>

            <div>
                <label class="block mb-1 font-semibold text-gray-700">ประเภทรถ</label>
                <select v-model="selectedVehicleType"
                    class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 appearance-none bg-white pr-8"
                    required>
                    <option v-for="(type, index) in vehicleTypes" :key="index" :value="type">
                        {{ type.name }}
                    </option>
                </select>
            </div>

            <div class="flex items-center gap-3 pt-2">
                <input id="permanent" type="checkbox" v-model="isPermanent" class="checkbox" />
                <label for="permanent" class="font-semibold text-gray-700 select-none">ถาวร (บันทึก 5 ปี)</label>
            </div>

            <div v-if="!isPermanent" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label class="block mb-1 font-semibold text-gray-700">วันที่เข้า</label>
                    <DatePicker v-model:value="form.start" lang="en" format="DD/MM/YYYY" value-type="YYYY-MM-DD"
                        :editable="false" disabled
                        class="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-100 cursor-not-allowed date-input-match" />
                </div>
                <div>
                    <label class="block mb-1 font-semibold text-gray-700">วันที่ออก</label>
                    <DatePicker v-model:value="form.expire" lang="en" format="DD/MM/YYYY" value-type="YYYY-MM-DD"
                        :min-date="minExpireDate" :max-date="maxExpireDate" :editable="false" required
                        class="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 date-input-match" />
                </div>
            </div>

            <div class="flex justify-end gap-3 pt-6">
                <button type="button" @click="$emit('cancel')"
                    class="px-5 py-2 rounded-lg bg-gray-200 text-gray-700 font-bold hover:bg-gray-300 transition shadow">ยกเลิก</button>
                <button type="submit"
                    class="px-5 py-2 rounded-lg bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold shadow-lg hover:scale-[1.02] transition transform duration-200">
                    <span v-if="loading" class="animate-pulse">กำลังบันทึก...</span>
                    <span v-else>บันทึกทะเบียนรถ</span>
                </button>
            </div>
        </form>
    </div>
</template>

<script>
import Swal from 'sweetalert2'
import DatePicker from 'vue-datepicker-next';
import { LicensePlateService } from '../../api/License-plate';

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function formatDateForApi(date) {
    return date.toISOString();
}

export default {
    components: { DatePicker },
    props: {
        parkId: { type: String, default: '' },
        // residentId: { type: String, required: true },
        // ownerName: { type: String, default: '' },
    },
    data() {
        const now = new Date();
        const vehicleTypes = [
            { name: 'รถยนต์ (Car)', value: 'CAR' },
            { name: 'รถจักรยานยนต์ (Motorcycle)', value: 'MOTORCYCLE' },
            { name: 'รถบรรทุก (Truck)', value: 'TRUCK' },
        ];

        return {
            loading: false,
            isPermanent: true,
            provinceOpen: false,
            provinceQuery: '',
            vehicleTypes: vehicleTypes,
            selectedVehicleType: vehicleTypes[0],
            provinces: [
                'กรุงเทพมหานคร', 'กระบี่', 'กาญจนบุรี', 'กาฬสินธุ์', 'กำแพงเพชร', 'ขอนแก่น', 'จันทบุรี', 'ฉะเชิงเทรา', 'ชลบุรี', 'ชัยนาท', 'ชัยภูมิ', 'ชุมพร', 'เชียงราย', 'เชียงใหม่', 'ตรัง', 'ตราด', 'ตาก', 'นครนายก', 'นครปฐม', 'นครพนม', 'นครราชสีมา', 'นครศรีธรรมราช', 'นครสวรรค์', 'นนทบุรี', 'นราธิวาส', 'น่าน', 'บึงกาฬ', 'บุรีรัมย์', 'ปทุมธานี', 'ประจวบคีรีขันธ์', 'ปราจีนบุรี', 'ปัตตานี', 'พระนครศรีอยุยา', 'พะเยา', 'พังงา', 'พัทลุง', 'พิจิตร', 'พิษณุโลก', 'เพชรบุรี', 'เพชรบูรณ์', 'แพร่', 'ภูเก็ต', 'มหาสารคาม', 'มุกดาหาร', 'แม่ฮ่องสอน', 'ยโสธร', 'ยะลา', 'ร้อยเอ็ด', 'ระนอง', 'ระยอง', 'ราชบุรี', 'ลพบุรี', 'ลำปาง', 'ลำพูน', 'เลย', 'ศรีสะเกษ', 'สกลนคร', 'สงขลา', 'สตูล', 'สมุทรปราการ', 'สมุทรสงคราม', 'สมุทรสาคร', 'สระแก้ว', 'สระบุรี', 'สิงห์บุรี', 'สุโขทัย', 'สุพรรณบุรี', 'สุราษฎร์ธานี', 'สุรินทร์', 'หนองคาย', 'หนองบัวลำภู', 'อ่างทอง', 'อุดรธานี', 'อุตรดิตถ์', 'อุทัยธานี', 'อุบลราชธานี'
            ],
            form: {
                licensePlate: '',
                licensePlateProvince: '',
                start: formatDate(now),
                expire: '',
            }
        }
    },
    computed: {
        filteredProvinces() {
            if (!this.provinceQuery) return this.provinces
            const query = this.provinceQuery.toLowerCase()
            return this.provinces.filter(p => p.toLowerCase().includes(query))
        },
        minExpireDate() {
            return formatDate(new Date());
        },
        maxExpireDate() {
            const maxDate = new Date();
            maxDate.setFullYear(maxDate.getFullYear() + 5);
            maxDate.setDate(maxDate.getDate() - 1);
            return formatDate(maxDate);
        }
    },
    watch: {
        provinceQuery(val) {
            if (this.form.licensePlateProvince && !this.provinceOpen && val !== this.form.licensePlateProvince) {
                this.provinceQuery = this.form.licensePlateProvince;
            }
            if (!val) {
                this.form.licensePlateProvince = '';
            }
        },
        'form.licensePlateProvince'(val) {
            this.provinceQuery = val;
        }
    },
    methods: {
        selectProvince(name) {
            this.form.licensePlateProvince = name
            this.provinceQuery = name
            this.provinceOpen = false
        },
        closeProvinceDropdown() {
            setTimeout(() => {
                this.provinceOpen = false;
                if (this.provinceQuery !== this.form.licensePlateProvince) {
                    this.provinceQuery = this.form.licensePlateProvince;
                }
            }, 100);
        },

        async submit() {
            this.loading = true;

            if (!this.form.licensePlateProvince) {
                this.loading = false;
                await Swal.fire({
                    icon: 'error',
                    title: 'ข้อผิดพลาด',
                    text: 'กรุณาเลือกหรือระบุจังหวัดป้ายทะเบียน'
                });
                return;
            }

            try {
                const payload = {
                    licensePlate: this.form.licensePlate,
                    licensePlateProvince: this.form.licensePlateProvince,
                    vehicleType: this.selectedVehicleType.value,
                };

                const startDate = new Date();

                if (this.isPermanent) {
                    const expireDate = new Date(startDate);
                    expireDate.setFullYear(startDate.getFullYear() + 5);
                    expireDate.setDate(expireDate.getDate() - 1);

                    payload.start = formatDateForApi(startDate);
                    payload.expire = formatDateForApi(expireDate);

                } else {
                    if (!this.form.expire) {
                        throw new Error('กรุณาระบุวันสิ้นสุด')
                    }

                    payload.start = formatDateForApi(startDate);
                    const expireDayEnd = new Date(this.form.expire);
                    expireDayEnd.setHours(23, 59, 59, 999);

                    payload.expire = formatDateForApi(expireDayEnd);
                }

                const svc = new LicensePlateService()
                const res = await svc.createVehicle(payload)
                console.log('test', res )

                if (res && res.data && res.data._id) {
                    
                    await Swal.fire({
                        icon: 'success',
                        title: 'บันทึกสำเร็จ',
                        text: 'ทะเบียนรถถูกบันทึกเรียบร้อยแล้ว',
                        timer: 2500,
                        showConfirmButton: false
                    })
                    this.$emit('success', res)
                } else {
                    throw new Error('บันทึกทะเบียนรถไม่สำเร็จ หรือไม่ได้รับ ID จาก API')
                }
            } catch (err) {
                let errorMessage;
                if (err.res?.data?.error === "this license is the member") {
                    errorMessage = 'ป้ายทะเบียนนี้เป็นป้ายทะเบียนของลูกบ้านแล้ว';
                } else {
                    errorMessage = err.message || err.res?.data?.message || 'บันทึกไม่สำเร็จ เนื่องจากเกิดข้อผิดพลาดในการเชื่อมต่อหรือข้อมูล';
                }

                await Swal.fire({
                    icon: 'error',
                    title: 'เกิดข้อผิดพลาด!',
                    text: errorMessage,
                });
            } finally {
                this.loading = false;
            }
        }
    }
}
</script>

<style scoped>
.checkbox {
    appearance: none;
    width: 1.25rem;
    height: 1.25rem;
    border: 2px solid green;
    border-radius: 0.375rem;
    cursor: pointer;
    transition: all 0.2s;
    position: relative;
}

.checkbox:checked {
    background-color: green;
    border-color: green;
}

select {
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='none' stroke='%234b5563'%3e%3cpath d='M7 7l3-3 3 3m0 6l-3 3-3-3' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right 0.75rem center;
    background-size: 1.5em 1.5em;
    padding-right: 2.5rem;
}

.mx-datepicker {
    width: 100% !important;
    display: block;
}
</style>
