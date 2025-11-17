<template>
    <div class="px-2">
        <div class="w-full max-w-[1800px] mx-auto mt-2 p-6 bg-white rounded-2xl shadow-xl">

            <div class="flex justify-between items-center mb-6">
                <span class="font-bold text-lg">ทะเบียนรถผู้มาเยือน</span>
                <button
                    class="bg-gradient-to-r from-orange-200 to-amber-200 rounded px-4 py-1 font-bold text-orange-700 hover:bg-orange-200 transition"
                    @click="showPopup = true">
                    + เพิ่มผู้มาเยือน
                </button>
            </div>

            <div class="flex flex-row flex-nowrap items-center gap-4 mb-4">
                <input type="text" placeholder="ค้นหาทะเบียน/ชื่อผู้มาเยือน..." v-model="searchQuery"
                    @input="onSearchInput"
                    class="p-2 border border-gray-300 rounded-lg min-w-0 focus:ring-green-500 focus:border-green-500 transition"
                    :class="{ 'border-green-500 ring-1 ring-green-500': searchQuery }">
                <flat-pickr v-model="dateRange" :config="flatpickrConfig" @on-change="onDateChange"
                    placeholder="เลือกช่วงวันที่"
                    class="p-2 border border-gray-300 rounded-lg w-1/2 min-w-0 focus:ring-green-500 focus:border-green-500 transition"
                    :class="{ 'border-green-500 ring-1 ring-green-500': !!dateRange }">
                </flat-pickr>
            </div>
            <table class="w-full text-left text-sm border-collapse shadow-sm rounded-xl overflow-hidden">
                <thead>
                    <tr class="bg-gradient-to-r from-green-200 to-blue-200 text-green-900">
                        <th class="py-3 px-2">ทะเบียน / จังหวัด</th>
                        <th class="py-3 px-2 max-[500px]:hidden">ชื่อผู้มาเยือน</th>
                        <th class="py-3 px-2">วันที่เข้า</th>
                        <th class="py-3 px-2">ออก</th>
                        <th class="py-3 px-2">สถานะ</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="loading">
                        <td colspan="5" class="py-4 text-center text-gray-500 animate-pulse">
                            กำลังโหลดข้อมูล...
                        </td>
                    </tr>
                    <tr v-else v-for="(visitor, idx) in paginatedVisitors" :key="visitor.id || idx"
                        class="border-b hover:bg-green-50 transition duration-100">
                        <td class="py-2 px-2 break-all max-w-plate">
                            <div class="font-semibold text-gray-800">{{ visitor.plate }}</div>
                            <div class="text-xs text-gray-500">{{ visitor.province }}</div>
                        </td>
                        <td class="py-2 px-2 max-[500px]:hidden">{{ visitor.guestName }}</td>
                        <td class="py-2 px-2 ">{{ visitor.in }}</td>
                        <td class="py-2 px-2 ">{{ visitor.out }}</td>
                        <td class="py-2 px-2">
                            <div class="flex items-center gap-2">
                                <button v-if="visitor.status" @click="handleDisableVisitor(visitor.id, visitor.plate)"
                                    class="inline-flex items-center justify-center w-8 h-8 rounded border border-green-200 bg-green-50 text-green-600 text-sm hover:bg-green-100 transition"
                                    title="ปิดการใช้งาน (ถาวร)">
                                    ✔
                                </button>

                                <span v-else
                                    class="inline-flex items-center justify-center w-8 h-8 rounded bg-gray-100 text-red-500 text-sm"
                                    title="ปิดการใช้งานแล้ว">❌</span>
                            </div>
                        </td>
                    </tr>
                    <tr v-if="!loading && filteredVisitors.length === 0">
                        <td colspan="5" class="py-4 text-center text-gray-500">
                            {{ hasActiveFilters ? 'ไม่พบข้อมูลที่ตรงกับตัวกรอง' : 'ไม่พบข้อมูลผู้มาเยือนในเดือนนี้' }}
                        </td>
                    </tr>
                </tbody>
            </table>

            <div v-if="shouldShowPagination && !loading" class="flex justify-center items-center space-x-2 mt-4 pb-2">

                <button :disabled="pagination.page === 1" @click="changePage(pagination.page - 1)"
                    :class="{ 'opacity-50 cursor-not-allowed': pagination.page === 1, 'hover:bg-green-100': pagination.page > 1 }"
                    class="p-2 rounded-full bg-white border border-gray-300 text-sm font-semibold text-gray-700 transition">
                    &lt; ก่อนหน้า
                </button>

                <button v-for="(page, idx) in paginationLinks" :key="idx"
                    @click="typeof page === 'number' && changePage(page)" :disabled="typeof page !== 'number'" :class="{
                        'bg-green-600 text-white shadow-md': page === pagination.page,
                        'bg-white text-gray-700 hover:bg-green-100': typeof page === 'number' && page !== pagination.page,
                        'cursor-default text-gray-400 bg-white': typeof page !== 'number'
                    }" class="px-3 py-1 rounded-full text-sm font-semibold transition">
                    {{ page }}
                </button>

                <button :disabled="pagination.page === totalPages" @click="changePage(pagination.page + 1)"
                    :class="{ 'opacity-50 cursor-not-allowed': pagination.page === totalPages, 'hover:bg-green-100': pagination.page < totalPages }"
                    class="p-2 rounded-full bg-white border border-gray-300 text-sm font-semibold text-gray-700 transition">
                    ถัดไป &gt;
                </button>
            </div>
        </div>

        <div v-if="showPopup" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50 p-3">

            <div
                class="bg-white p-4 sm:p-8 rounded-2xl shadow-xl w-full max-w-md animate-fadein max-h-full overflow-y-auto">
                <h3 class="text-xl font-bold mb-6 text-green-700 text-center">เพิ่มทะเบียนรถผู้มาเยือน</h3>
                <CreateVisitor @success="onVisitorCreated" @cancel="showPopup = false" />
            </div>

        </div>
    </div>
</template>

<script>
import CreateVisitor from '../../components/visitor/Create.vue';
import { VisitorService } from '../../api/Visitor';
import Swal from 'sweetalert2';
import flatPickr from 'vue-flatpickr-component';
import 'flatpickr/dist/flatpickr.css';

export default {
    components: {
        CreateVisitor,
        flatPickr,
    },
    data() {
        return {
            visitorService: new VisitorService(),
            loading: false,
            searchQuery: '',
            dateRange: '',
            pagination: {
                limit: 8,
                page: 1,
                total: 0,
            },
            screenHeight: window.innerHeight,
            visitors: [],
            showPopup: false,
            flatpickrConfig: {
                mode: 'range',
                dateFormat: 'Y-m-d',
                altFormat: 'd/m/Y',
                altInput: true,
                locale: {
                    rangeSeparator: ' ถึง ',
                },
            },
        }
    },
    computed: {
        isShortScreen() {
            return this.screenHeight <= 740;
        },
        hasActiveFilters() {
            return !!this.searchQuery.trim() || !!this.dateRange;
        },
        filteredVisitors() {
            const q = this.searchQuery.trim().toLowerCase();

            const [startDate, endDate] = this.parseDateRange();

            const isInDateRange = (visitorStartRaw, visitorExpireRaw, startFilter, endFilter) => {
                if (!startFilter || !endFilter) return false;

                const vStart = new Date(visitorStartRaw);
                const vExpire = new Date(visitorExpireRaw);

                const filterStart = new Date(startFilter);
                filterStart.setHours(0, 0, 0, 0);
                const filterEnd = new Date(endFilter);
                filterEnd.setHours(23, 59, 59, 999);

                const isVisitorValid =
                    vStart.getTime() <= filterEnd.getTime() &&
                    vExpire.getTime() >= filterStart.getTime();

                return isVisitorValid;
            };

            let list = this.visitors.slice();

            if (q) {
                list = list.filter(v => {
                    return (v.plate && v.plate.toLowerCase().includes(q)) ||
                        (v.guestName && v.guestName.toLowerCase().includes(q));
                });
            }

            if (this.hasActiveFilters && startDate && endDate) {
                list = list.filter(v => {
                    return isInDateRange(v.startRaw, v.expireRaw, startDate, endDate);
                });
            }

            else if (!this.hasActiveFilters) {
                const today = new Date();
                const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
                const currentMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

                list = list.filter(v => {
                    return isInDateRange(v.startRaw, v.expireRaw, currentMonthStart, currentMonthEnd);
                });
            }

            list.sort((a, b) => {
                const da = new Date(a.startRaw || a.inRaw || 0).getTime();
                const db = new Date(b.startRaw || b.inRaw || 0).getTime();

                return db - da;
            });

            this.pagination.total = list.length;

            const limit = this.isShortScreen ? 4 : 8;
            const totalPages = Math.max(1, Math.ceil(list.length / limit));
            if (this.pagination.page > totalPages) {
                this.pagination.page = 1;
            }

            return list;
        },
        paginatedVisitors() {
            const limit = this.isShortScreen ? 4 : 8;
            this.pagination.limit = limit;

            const start = (this.pagination.page - 1) * limit;
            return this.filteredVisitors.slice(start, start + limit);
        },
        totalPages() {
            const limit = this.isShortScreen ? 4 : 8;
            if (limit <= 0) return 1;

            return Math.max(1, Math.ceil(this.filteredVisitors.length / limit));
        },
        shouldShowPagination() {
            const limit = this.isShortScreen ? 4 : 8;
            return this.filteredVisitors.length > limit;
        },
        paginationLinks() {
            const total = this.totalPages;
            const current = this.pagination.page;
            const maxCore = 3;
            if (total <= maxCore) {
                return Array.from({ length: total }, (_, i) => i + 1);
            }

            const pages = new Set([1, total]);

            if (current <= 2) {
                pages.add(2);
                pages.add(3);
            }
            else if (current >= total - 1) {
                pages.add(total - 2);
                pages.add(total - 1);
            }
            else {
                pages.add(current - 1);
                pages.add(current);
                pages.add(current + 1);
            }

            const sortedPages = Array.from(pages).sort((a, b) => a - b);
            const result = [];
            let prev = null;

            sortedPages.forEach(page => {
                if (prev !== null && page - prev > 1) {
                    result.push('...');
                }
                result.push(page);
                prev = page;
            });

            return result;
        }
    },
    watch: {
        screenHeight(newHeight) {
            this.updatePaginationLimit(newHeight);
        }
    },
    mounted() {
        this.updatePaginationLimit(this.screenHeight);

        window.addEventListener('resize', this.updateScreenHeight);

        this.fetchVisitors();
    },
    beforeUnmount() {
        window.removeEventListener('resize', this.updateScreenHeight);
    },
    methods: {
        async fetchVisitors() {
            this.loading = true;

            try {
                const ALL_LIMIT = 10000;
                const response = await this.visitorService.getVisitorList(ALL_LIMIT, 1, null);
                const visitorData = (response && response.data) || [];

                if (visitorData && visitorData.length) {
                    this.visitors = visitorData.map(v => ({
                        id: v._id,
                        plate: v.licensePlate,
                        province: v.licensePlateProvince,
                        guestName: v.guestName,
                        in: this.formatDate(v.start),
                        out: this.formatDate(v.expire),
                        startRaw: v.start,
                        expireRaw: v.expire,
                        status: v.status !== false
                    }));

                    this.pagination.total = this.visitors.length;
                } else {
                    this.visitors = [];
                    this.pagination.total = 0;
                }
            } catch (error) {
                console.error("Failed to fetch visitors:", error);
                Swal.fire({
                    icon: 'error',
                    title: 'ดึงข้อมูลไม่สำเร็จ',
                    text: 'ไม่สามารถโหลดรายการผู้มาเยือนได้ กรุณาลองใหม่อีกครั้ง'
                });
            } finally {
                this.loading = false;
            }
        },

        parseDateRange() {
            if (!this.dateRange) {
                return [null, null];
            }

            const separator = this.dateRange.includes(' ถึง ') ? ' ถึง ' : ' to ';
            const parts = this.dateRange.split(separator);

            if (parts.length !== 2) {
                return [null, null];
            }

            const [startStr, endStr] = parts;

            const startDate = startStr ? new Date(startStr) : null;
            const endDate = endStr ? new Date(endStr) : null;

            if (startDate && !isNaN(startDate.getTime()) && endDate && !isNaN(endDate.getTime())) {
                return [startDate, endDate];
            }

            return [null, null];
        },

        onSearchInput() {
            this.pagination.page = 1;
        },

        onDateChange(selectedDates, dateStr) {
            if (dateStr !== undefined) {
                this.dateRange = dateStr;
            }
            this.pagination.page = 1;
        },

        resetFilters() {
            this.searchQuery = '';
            this.dateRange = '';
            this.pagination.page = 1;
        },

        async handleDisableVisitor(visitorId, licensePlate) {
            Swal.fire({
                title: 'ยืนยันการปิดใช้งาน?',
                text: `คุณต้องการปิดใช้งานทะเบียนรถ ${licensePlate} ใช่หรือไม่?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#EA580C',
                cancelButtonColor: '#6B7280',
                confirmButtonText: 'ใช่, ปิดใช้งาน',
                cancelButtonText: 'ยกเลิก'
            }).then(async (result) => {
                if (result.isConfirmed) {
                    this.loading = true;
                    try {
                        await this.visitorService.disableVisitor(visitorId);

                        await Swal.fire({
                            icon: 'success',
                            title: 'ปิดใช้งานสำเร็จ',
                            text: `ทะเบียน ${licensePlate} ถูกปิดใช้งานแล้ว`,
                            showConfirmButton: false,
                            timer: 1500
                        });

                        this.fetchVisitors();

                    } catch (error) {
                        console.error("Failed to disable visitor:", error);
                        Swal.fire({
                            icon: 'error',
                            title: 'ปิดใช้งานไม่สำเร็จ',
                            text: error.response?.data?.message || 'เกิดข้อผิดพลาดในการปิดใช้งาน กรุณาตรวจสอบการเชื่อมต่อ'
                        });
                    } finally {
                        this.loading = false;
                    }
                }
            });
        },

        onVisitorCreated(newVisitorData) {
            this.showPopup = false;
            this.pagination.page = 1;
            this.fetchVisitors();
        },

        formatDate(dt) {
            if (!dt) return '-';
            const d = new Date(dt);
            if (isNaN(d.getTime())) return dt;
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const year = d.getFullYear();
            return `${day}/${month}/${year}`;
        },

        changePage(newPage) {
            if (newPage >= 1 && newPage <= this.totalPages) {
                this.pagination.page = newPage;
            }
        },

        updateScreenHeight() {
            this.screenHeight = window.innerHeight;
        },

        updatePaginationLimit(height) {
            const newLimit = height <= 740 ? 5 : 8;
            if (newLimit !== this.pagination.limit) {
                this.pagination.limit = newLimit;
                this.pagination.page = 1;
            }
        },
    }
}
</script>

<style scoped>
.max-w-xl {
    max-width: 520px;
}

.shadow-xl {
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}

.rounded-2xl {
    border-radius: 1rem;
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
    max-width: 150px;
    white-space: pre-line;
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

.animate-fadein {
    animation: fadein 0.3s ease-out;
}
</style>