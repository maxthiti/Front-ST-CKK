<template>
    <div class="h-full">
        <form @submit.prevent="createVisitor"
            class="space-y-4 p-6 max-w-lg mx-auto bg-white rounded-xl shadow-2xl border border-gray-100 mt-8">

            <div>
                <label class="block mb-1 font-semibold text-gray-700">ป้ายทะเบียน</label>
                <input v-model="form.plate" type="text" placeholder="กก1234"
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
                    class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 appearance-none bg-white pr-8 custom-select"
                    required>
                    <option v-for="(type, index) in vehicleTypes" :key="index" :value="type.value">
                        {{ type.name }}
                    </option>
                </select>
            </div>

            <div>
                <label class="block mb-1 font-semibold text-gray-700">ชื่อผู้มาเยือน</label>
                <input v-model="form.guestName" type="text" placeholder="ผู้มาเยือน"
                    class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                    required />
            </div>

            <div>
                <label class="block mb-1 font-semibold text-gray-700">วัตถุประสงค์</label>
                <input v-model="form.object" type="text" placeholder="ส่งสินค้า"
                    class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                    required />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label class="block mb-1 font-semibold text-gray-700">วันที่เข้า</label>
                    <DatePicker v-model:value="form.in" lang="en" format="DD/MM/YYYY" value-type="YYYY-MM-DD"
                        class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                        @input="calculateExpireDate" required :disabled-date="disablePastDates" />
                </div>
                <div>
                    <label class="block mb-1 font-semibold text-gray-700">ถึงวันที่ (วันออก)</label>
                    <DatePicker v-model:value="form.out" lang="en" format="DD/MM/YYYY" value-type="YYYY-MM-DD"
                        class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-100 cursor-not-allowed"
                        :editable="false" :disabled="true" required />
                </div>
            </div>

            <div class="flex justify-end gap-3 pt-6">
                <button type="button" @click="cancel"
                    class="px-5 py-2 rounded-lg bg-gray-200 text-gray-700 font-bold hover:bg-gray-300 transition shadow">ยกเลิก</button>
                <button type="submit"
                    class="px-5 py-2 rounded-lg bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold shadow-lg hover:scale-[1.02] transition transform duration-200">
                    <span v-if="loading" class="animate-pulse">กำลังบันทึก...</span>
                    <span v-else>บันทึกผู้มาเยือน</span>
                </button>
            </div>
        </form>
    </div>
</template>

<script>
import { VisitorService } from '../../api/Visitor';
import Swal from 'sweetalert2';
import DatePicker from 'vue-datepicker-next';


function formatDateTimeForApi(dateString, isEndDay = false) {
    if (!dateString) return null;

    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
        console.error("Invalid date time format:", dateString);
        return null;
    }

    date.setHours(0, 0, 0, 0);

    return date.toISOString();
}

function formatDate(date) {
    if (!date || isNaN(date.getTime())) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export default {
    components: { DatePicker },
    data() {
        const vehicleTypes = [
            { name: 'รถยนต์ (Car)', value: 'CAR' },
            { name: 'รถจักรยานยนต์ (Motorcycle)', value: 'MOTORCYCLE' },
            { name: 'รถบรรทุก (Truck)', value: 'TRUCK' },
        ];
        return {
            loading: false,
            visitorService: new VisitorService(),

            provinceOpen: false,
            provinceQuery: '',
            provinces: [
                'กรุงเทพมหานคร', 'กระบี่', 'กาญจนบุรี', 'กาฬสินธุ์', 'กำแพงเพชร', 'ขอนแก่น', 'จันทบุรี', 'ฉะเชิงเทรา', 'ชลบุรี', 'ชัยนาท', 'ชัยภูมิ', 'ชุมพร', 'เชียงราย', 'เชียงใหม่', 'ตรัง', 'ตราด', 'ตาก', 'นครนายก', 'นครปฐม', 'นครพนม', 'นครราชสีมา', 'นครศรีธรรมราช', 'นครสวรรค์', 'นนทบุรี', 'นราธิวาส', 'น่าน', 'บึงกาฬ', 'บุรีรัมย์', 'ปทุมธานี', 'ประจวบคีรีขันธ์', 'ปราจีนบุรี', 'ปัตตานี', 'พระนครศรีอยุธยา', 'พะเยา', 'พังงา', 'พัทลุง', 'พิจิตร', 'พิษณุโลก', 'เพชรบุรี', 'เพชรบูรณ์', 'แพร่', 'ภูเก็ต', 'มหาสารคาม', 'มุกดาหาร', 'แม่ฮ่องสอน', 'ยโสธร', 'ยะลา', 'ร้อยเอ็ด', 'ระนอง', 'ระยอง', 'ราชบุรี', 'ลพบุรี', 'ลำปาง', 'ลำพูน', 'เลย', 'ศรีสะเกษ', 'สกลนคร', 'สงขลา', 'สตูล', 'สมุทรปราการ', 'สมุทรสงคราม', 'สมุทรสาคร', 'สระแก้ว', 'สระบุรี', 'สิงห์บุรี', 'สุโขทัย', 'สุพรรณบุรี', 'สุราษฎร์ธานี', 'สุรินทร์', 'หนองคาย', 'หนองบัวลำภู', 'อ่างทอง', 'อุดรธานี', 'อุตรดิตถ์', 'อุทัยธานี', 'อุบลราชธานี'
            ],

            vehicleTypes: vehicleTypes,
            selectedVehicleType: 'CAR',

            form: {
                plate: '',
                province: '',
                guestName: '',
                vehicleType: 'CAR',
                object: '',
                in: '',
                out: ''
            }
        }
    },
    computed: {
        filteredProvinces() {
            if (!this.provinceQuery) return this.provinces
            const query = this.provinceQuery.toLowerCase()
            return this.provinces.filter(p => p.toLowerCase().includes(query))
        },
    },
    watch: {
        provinceQuery(val) {
            if (!this.provinceOpen && val !== this.form.province) {
                this.provinceQuery = this.form.province;
            }
            if (!val) {
                this.form.province = '';
            }
        },
        'form.province'(val) {
            this.provinceQuery = val;
        },
        'form.in'() {
            this.calculateExpireDate();
        }
    },
    created() {
        this.form.province = this.provinceQuery;
        this.selectedVehicleType = this.form.vehicleType;

        this.form.in = formatDate(new Date());
        this.calculateExpireDate();
    },
    methods: {
        selectProvince(name) {
            this.form.province = name;
            this.provinceQuery = name;
            this.provinceOpen = false;
        },
        closeProvinceDropdown() {
            setTimeout(() => {
                this.provinceOpen = false;
                if (this.provinceQuery !== this.form.province) {
                    this.provinceQuery = this.form.province;
                }
            }, 100);
        },

        disablePastDates(date) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            return date.getTime() < today.getTime();
        },

        calculateExpireDate() {
            if (this.form.in) {
                const startDate = new Date(this.form.in);
                startDate.setDate(startDate.getDate() + 1);
                this.form.out = formatDate(startDate);
            } else {
                this.form.out = '';
            }
        },

        async createVisitor() {
            this.loading = true;

            if (!this.form.province) {
                this.loading = false;
                await Swal.fire({
                    icon: 'error',
                    title: 'ข้อผิดพลาด',
                    text: 'กรุณาเลือกหรือระบุจังหวัดป้ายทะเบียน'
                });
                return;
            }

            try {
                this.form.vehicleType = this.selectedVehicleType;

                const payload = {
                    licensePlate: this.form.plate,
                    licensePlateProvince: this.form.province,
                    guestName: this.form.guestName,
                    start: formatDateTimeForApi(this.form.in, false),
                    expire: formatDateTimeForApi(this.form.out, true),
                    vehicleType: this.form.vehicleType,
                    object: this.form.object,
                };

                if (!payload.start || !payload.expire) {
                    throw new Error('กรุณาระบุวันที่เข้าและถึงวันที่ให้ครบถ้วน');
                }

                const response = await this.visitorService.createVisitor(payload);

                await Swal.fire({
                    icon: 'success',
                    title: 'บันทึกสำเร็จ',
                    text: `ทะเบียน ${this.form.plate} ถูกบันทึกเรียบร้อยแล้ว`,
                    timer: 2000,
                    showConfirmButton: false
                });

                this.$emit('success', response);
                this.cancel();

            } catch (error) {
                let errorMessage;
                if (error.response?.data?.error === "this license is the member") {
                    errorMessage = 'ป้ายทะเบียนนี้เป็นป้ายทะเบียนของลูกบ้าน';
                } else {
                    errorMessage = error.message || error.response?.data?.message || 'บันทึกไม่สำเร็จ เนื่องจากเกิดข้อผิดพลาดในการเชื่อมต่อหรือข้อมูล';
                }

                await Swal.fire({
                    icon: 'error',
                    title: 'เกิดข้อผิดพลาด!',
                    text: errorMessage,
                });
            } finally {
                this.loading = false;
            }
        },

        cancel() {
            this.form = {
                plate: '',
                province: '',
                guestName: '',
                vehicleType: 'CAR',
                object: '',
                in: '',
                out: ''
            };
            this.form.in = formatDate(new Date());
            this.calculateExpireDate();

            this.provinceQuery = 'กรุงเทพมหานคร';
            this.selectedVehicleType = 'CAR';

            this.$emit('cancel');
        },
    }
}
</script>
<style scoped>
.mx-datepicker {
    width: 100% !important;
    display: block;
}
</style>