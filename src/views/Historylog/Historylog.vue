<template>
    <div class="px-2">
        <div class="w-full max-w-[1800px] mx-auto mt-2 p-6 bg-white rounded-2xl shadow-xl">
            <div class="flex justify-between items-center mb-6">
                <span class="font-bold text-lg">ประวัติการเข้าออก</span>
            </div>

            <div class="flex flex-row flex-nowrap items-center gap-4 mb-4">
                <input type="text" v-model="searchQuery" @input="onSearchInput" placeholder="ค้นหาทะเบียนรถ"
                    class="p-2 border border-gray-300 rounded-lg min-w-0 w-full focus:ring-green-500 focus:border-green-500 transition"
                    :class="{ 'border-green-500 ring-1 ring-green-500': searchQuery }">

                <flat-pickr v-model="dateRange" :config="flatpickrConfig" placeholder="เลือกช่วงวันที่"
                    class="p-2 border border-3 border-gray-300 rounded-lg min-w-0 w-full focus:ring-green-500 focus:border-green-500 transition"
                    :class="{ 'border-green-500 ring-1 ring-green-500': !!dateRange }">
                </flat-pickr>
            </div>

            <table class="w-full text-left text-sm border-collapse shadow-sm rounded-xl overflow-hidden">
                <thead>
                    <tr class="bg-gradient-to-r from-green-200 to-blue-200 text-green-900">
                        <th class="py-3 px-2">ทะเบียน</th>
                        <th class="py-3 px-2">รูป1</th>
                        <th class="py-3 px-2">รูป2</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-if="loading">
                        <td colspan="4" class="py-4 text-center text-gray-500 animate-pulse">
                            กำลังโหลดข้อมูล...
                        </td>
                    </tr>

                    <tr v-else v-for="(record, idx) in paginatedRecords" :key="idx"
                        class="border-b hover:bg-green-50 transition duration-100">
                        <td class="py-2 px-2 break-all max-w-plate">
                            <div class="text-gray-700 font-semibold">{{ record.plate }}</div>
                            <!-- <div class="text-xs text-gray-400 mt-1">{{ record.timeDisplay }}</div> -->
                            <div class="text-xs text-gray-400 mt-1" v-html="record.timeDisplay"></div>
                        </td>

                        <td class="py-2 px-2">
                            <img :src="record.photo1" v-if="record.photo1" @click="showFullScreenImage(record.photo1)"
                                class="cursor-pointer shadow object-cover w-[100px] h-auto border-2 transition duration-150"
                                alt="รูปภาพ 1">
                            <span v-else>-</span>
                        </td>

                        <td class="py-2 px-2">
                            <img :src="record.photo2" v-if="record.photo2" @click="showFullScreenImage(record.photo2)"
                                class="cursor-pointer shadow object-cover w-[100px] h-auto border-2 transition duration-150"
                                alt="รูปภาพ 2">
                            <span v-else>-</span>
                        </td>
                    </tr>
                    <tr v-if="!loading && filteredRecords.length === 0">
                        <td colspan="3" class="py-4 text-center text-gray-500">
                            ไม่พบประวัติการเข้าออก
                        </td>
                    </tr>
                </tbody>
            </table>

            <div v-if="!loading" class="flex justify-center items-center space-x-2 mt-4 pb-2">

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

        <transition name="modal-fade">
            <div v-if="isModalOpen" @click.self="closeFullScreenImage"
                class="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4">
                <div class="relative max-w-full max-h-full">
                    <button @click="closeFullScreenImage"
                        class="absolute top-4 right-4 text-white text-3xl font-bold bg-gray-800 rounded-full w-10 h-10 flex items-center justify-center hover:bg-red-600 transition focus:outline-none">
                        &times;
                    </button>
                    <img :src="modalImageUrl" alt="Fullscreen Image" class="max-w-full max-h-screen object-contain"
                        style="max-height: 95vh; max-width: 95vw;">
                </div>
            </div>
        </transition>
    </div>
</template>
<script>

import { LicensePlateService } from '../../api/License-plate';
import Swal from 'sweetalert2';
import flatPickr from 'vue-flatpickr-component';
import 'flatpickr/dist/flatpickr.css';

export default {
    components: {
        flatPickr
    },
    data() {
        return {
            licensePlateService: new LicensePlateService(),
            loading: false,
            pagination: {
                limit: 8,
                page: 1,
                total: 0,
            },
            allRecords: [],
            searchQuery: '',
            screenHeight: window.innerHeight,
            dateRange: '',
            flatpickrConfig: {
                mode: "range",
                dateFormat: "Y-m-d",
                altFormat: "d/m/Y",
                altInput: true,
                locale: {
                    rangeSeparator: ' ถึง '
                },
            },
            isModalOpen: false,
            modalImageUrl: '',
        }
    },
    watch: {
        screenHeight(newHeight) {
            this.updatePaginationLimit(newHeight);
        },
        searchQuery: {
            handler() {
                this.pagination.page = 1;
            },
            deep: false
        },
        dateRange: {
            handler() {
                this.pagination.page = 1;
                this.fetchHistory();
            },
            deep: false
        }
    },
    computed: {
        paginatedRecords() {
            const start = (this.pagination.page - 1) * this.pagination.limit;
            return this.filteredRecords.slice(start, start + this.pagination.limit);
        },
        totalPages() {
            if (this.pagination.limit <= 0) return 1;
            return Math.max(1, Math.ceil(this.filteredRecords.length / this.pagination.limit));
        },
        filteredRecords() {
            let records = this.allRecords.slice();

            const query = this.searchQuery.trim().toLowerCase();
            if (query) {
                records = records.filter(r => r.plate && r.plate.toLowerCase().includes(query));
            }

            records.sort((a, b) => {
                const aTime = a.timeRaw ? new Date(a.timeRaw).getTime() : 0;
                const bTime = b.timeRaw ? new Date(b.timeRaw).getTime() : 0;
                return bTime - aTime;
            });

            this.pagination.total = records.length;

            const currentTotalPages = this.pagination.limit > 0
                ? Math.max(1, Math.ceil(records.length / this.pagination.limit))
                : 1;

            if (this.pagination.page > currentTotalPages) {
                this.pagination.page = currentTotalPages;
            }

            return records;
        },
        paginationLinks() {
            const total = this.totalPages;
            const current = this.pagination.page;
            const maxVisiblePages = 3;

            if (total <= maxVisiblePages) {
                return Array.from({ length: total }, (_, i) => i + 1);
            }

            const pages = new Set();
            pages.add(1);
            pages.add(total);

            for (let i = current - 1; i <= current + 1; i++) {
                if (i > 1 && i < total) {
                    pages.add(i);
                }
            }

            if (current <= 3) {
                pages.add(2);
                pages.add(3);
                pages.add(4);
            }

            if (current >= total - 2) {
                pages.add(total - 3);
                pages.add(total - 2);
                pages.add(total - 1);
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
    mounted() {
        this.updatePaginationLimit(this.screenHeight);

        if (!this.dateRange) {
            const today = new Date().toISOString().split('T')[0];
            this.dateRange = `${today} to ${today}`;
        }
        this.fetchHistory();

        window.addEventListener('resize', this.updateScreenHeight);
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.updateScreenHeight);
    },

    methods: {
        getTodayStart() {
            const today = new Date();
            const date = today.toISOString().split('T')[0];
            return `${date} 00:00:00`;
        },
        getTodayEnd() {
            const today = new Date();
            const date = today.toISOString().split('T')[0];
            return `${date} 23:59:59`;
        },

        showFullScreenImage(imageUrl) {
            if (imageUrl) {
                this.modalImageUrl = imageUrl;
                this.isModalOpen = true;
            }
        },
        closeFullScreenImage() {
            this.isModalOpen = false;
            this.modalImageUrl = '';
        },

        async fetchHistory() {
            this.loading = true;

            try {
                const [startDate, endDate] = this.parseDateRange();

                if (!startDate || !endDate) {
                    this.allRecords = [];
                    this.loading = false;
                    return;
                }

                const startRange = this.formatDateForApi(startDate, true);
                const endRange = this.formatDateForApi(endDate, false);

                const LARGE_LIMIT = 10000;

                const response = await this.licensePlateService.getVehicleHistory(
                    startRange,
                    endRange,
                    LARGE_LIMIT,
                    1,
                    null
                );
                console.log("response", response);

                const historyData = response.data || [];

                const mappedRecords = historyData.map(r => ({
                    plate: r.plates && r.plates.length > 0 ? r.plates[0].License : 'ไม่พบทะเบียน',
                    photo1: r.platesPhoto,
                    photo2: r.platesPhoto2,
                    timeDisplay: this.formatDate(r.time),
                    timeRaw: r.time || r.detectDate,
                }));

                this.allRecords = mappedRecords;
            } catch (error) {
                console.error("Failed to fetch history:", error);
                Swal.fire({
                    icon: 'error',
                    title: 'ดึงข้อมูลไม่สำเร็จ',
                    text: 'ไม่สามารถโหลดประวัติการเข้าออกได้ กรุณาลองใหม่อีกครั้ง'
                });
                this.allRecords = [];
            } finally {
                this.loading = false;
            }
        },

        changePage(newPage) {
            if (newPage >= 1 && newPage <= this.totalPages) {
                this.pagination.page = newPage;
            }
        },

        formatDate(dt) {
            if (!dt) return '-';
            const d = new Date(dt);
            if (isNaN(d.getTime())) return dt;
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const year = d.getFullYear();
            const hour = String(d.getHours()).padStart(2, '0');
            const minute = String(d.getMinutes()).padStart(2, '0');
            const second = String(d.getSeconds()).padStart(2, '0');
            return `${day}/${month}/${year}<br>${hour}:${minute}:${second}`;
        },

        formatDateForApi(dateObj, isStart) {
            const date = dateObj.toISOString().split('T')[0];
            const time = isStart ? '00:00:00' : '23:59:59';
            return `${date} ${time}`;
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

        onSearchInput() {
            this.pagination.page = 1;
        },

        parseDateRange() {
            if (!this.dateRange) {
                return [null, null];
            }

            const separator = this.dateRange.includes(' ถึง ') ? ' ถึง ' : ' to ';
            const parts = this.dateRange.split(separator);

            if (parts.length !== 2) {
                if (parts.length === 1 && parts[0]) {
                    const singleDate = new Date(parts[0]);
                    if (!isNaN(singleDate.getTime())) {
                        const startDate = new Date(singleDate);
                        startDate.setHours(0, 0, 0, 0);
                        const endDate = new Date(singleDate);
                        endDate.setHours(23, 59, 59, 999);
                        return [startDate, endDate];
                    }
                }
                return [null, null];
            }

            const [startStr, endStr] = parts;

            const startDate = startStr ? new Date(startStr) : null;
            const endDate = endStr ? new Date(endStr) : null;

            if (startDate && !isNaN(startDate.getTime()) && endDate && !isNaN(endDate.getTime())) {
                startDate.setHours(0, 0, 0, 0);
                endDate.setHours(23, 59, 59, 999);
                return [startDate, endDate];
            }

            return [null, null];
        },
    },
}
</script>
<style>
.modal-fade-enter,
.modal-fade-leave-to {
    opacity: 0;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
    transition: opacity .3s ease;
}
</style>