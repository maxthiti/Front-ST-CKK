<template>
    <div class="overflow-x-auto">
        <div v-if="loading" class="text-center py-8">
            <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent">
            </div>
            <p class="text-gray-500 mt-2">กำลังโหลดข้อมูล...</p>
        </div>

        <div v-else-if="filteredRecords.length === 0" class="text-center py-8">
            <svg class="w-16 h-16 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p class="text-gray-500">ไม่พบข้อมูลการเข้า-ออก</p>
        </div>

        <table v-else class="w-full text-sm">
            <thead class="bg-gray-50 border-b">
                <tr>
                    <th class="px-3 py-3 text-left font-semibold text-gray-700">วันที่</th>
                    <th class="px-3 py-3 text-center font-semibold text-gray-700">รูปต้นฉบับ</th>
                    <th class="px-3 py-3 text-center font-semibold text-gray-700">รูปขาเข้า</th>
                    <th class="px-3 py-3 text-center font-semibold text-gray-700">เวลาเข้า</th>
                    <th class="px-3 py-3 text-center font-semibold text-gray-700">เวลาออก</th>
                    <th class="px-3 py-3 text-center font-semibold text-gray-700">จัดการ</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
                <tr v-for="record in filteredRecords" :key="record.id" class="hover:bg-gray-50">
                    <td class="px-3 py-3 text-gray-700">
                        {{ formatDate(record.date) }}
                    </td>

                    <td class="px-3 py-3 text-center">
                        <img v-if="record.originalPhoto" :src="record.originalPhoto" alt="รูปต้นฉบับ"
                            class="w-12 h-12 rounded-full object-cover mx-auto cursor-pointer hover:opacity-80"
                            @click="showImageModal(record.originalPhoto)" />
                        <span v-else class="text-gray-400">-</span>
                    </td>

                    <td class="px-3 py-3 text-center">
                        <img v-if="record.entryPhoto" :src="record.entryPhoto" alt="รูปขาเข้า"
                            class="w-12 h-12 rounded-full object-cover mx-auto cursor-pointer hover:opacity-80"
                            @click="showImageModal(record.entryPhoto)" />
                        <span v-else class="text-gray-400">-</span>
                    </td>

                    <td class="px-3 py-3 text-center">
                        <span v-if="record.checkInTime" class="text-green-600 font-medium">
                            {{ record.checkInTime }}
                        </span>
                        <span v-else class="text-gray-400">-</span>
                    </td>

                    <td class="px-3 py-3 text-center">
                        <span v-if="record.checkOutTime" class="text-orange-600 font-medium">
                            {{ record.checkOutTime }}
                        </span>
                        <span v-else class="text-gray-400">-</span>
                    </td>

                    <td class="px-3 py-3 text-center">
                        <button @click="showDetail(record)"
                            class="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600 transition-colors">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            ดูรายละเอียด
                        </button>
                    </td>
                </tr>
            </tbody>
        </table>

        <div v-if="imageModalUrl" @click="imageModalUrl = null"
            class="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
            <img :src="imageModalUrl" alt="ภาพขยาย" class="max-w-full max-h-full rounded-lg" @click.stop />
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
    selectedDate: {
        type: Date,
        default: null
    },
    currentMonth: {
        type: Date,
        required: true
    },
    records: {
        type: Array,
        default: () => []
    }
});

const emit = defineEmits(['show-detail']);

const loading = ref(false);
const imageModalUrl = ref(null);

const filteredRecords = computed(() => {
    if (props.selectedDate) {
        return props.records.filter(record => {
            return record.date.toDateString() === props.selectedDate.toDateString();
        });
    } else {
        const month = props.currentMonth.getMonth();
        const year = props.currentMonth.getFullYear();
        return props.records.filter(record => {
            return record.date.getMonth() === month && record.date.getFullYear() === year;
        });
    }
});

const formatDate = (date) => {
    const d = new Date(date);
    const day = d.getDate();
    const month = d.getMonth() + 1;
    const year = d.getFullYear() + 543;
    return `${day}/${month}/${year}`;
};

const showDetail = (record) => {
    emit('show-detail', record);
};

const showImageModal = (url) => {
    imageModalUrl.value = url;
};
</script>
