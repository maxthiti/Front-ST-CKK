<template>
    <div class="max-w-7xl mx-auto">
        <h1 class="text-2xl font-bold text-gray-800 mb-6">บันทึกเวลาเข้า-ออก</h1>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="bg-white rounded-lg shadow p-4">
                <h2 class="text-lg font-semibold text-gray-700 mb-4">ปฏิทิน</h2>
                <Calendar 
                    @date-selected="handleDateSelected"
                    @month-changed="handleMonthChanged"
                    :attendanceMap="attendanceMap"
                />
            </div>

            <div class="bg-white rounded-lg shadow p-4">
                <h2 class="text-lg font-semibold text-gray-700 mb-4">
                    รายการเข้า-ออก
                    <span v-if="selectedDate" class="text-sm font-normal text-gray-500">
                        ({{ formatDate(selectedDate) }})
                    </span>
                    <span v-else class="text-sm font-normal text-gray-500">
                        (เดือน {{ currentMonthName }})
                    </span>
                </h2>
                <Table 
                    :selectedDate="selectedDate" 
                    :currentMonth="currentMonth" 
                    :records="records"
                    @show-detail="handleShowDetail" 
                />
            </div>
        </div>

        <Detail v-if="showDetail" :record="selectedRecord" @close="showDetail = false" />
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import Calendar from '../../components/Student/Calendar.vue';
import Table from '../../components/Student/Table.vue';
import Detail from '../../components/Student/Detail.vue';

const selectedDate = ref(null);
const currentMonth = ref(new Date());
const showDetail = ref(false);
const selectedRecord = ref(null);

// Mock attendance records (replace with API call later)
const records = ref([
    {
        id: 1,
        date: new Date(2025, 10, 15),
        originalPhoto: 'https://via.placeholder.com/100',
        entryPhoto: 'https://via.placeholder.com/100',
        checkInTime: '08:15',
        checkOutTime: '16:30',
        status: 'completed'
    },
    {
        id: 2,
        date: new Date(2025, 10, 16),
        originalPhoto: 'https://via.placeholder.com/100',
        entryPhoto: 'https://via.placeholder.com/100',
        checkInTime: '08:20',
        checkOutTime: '16:25',
        status: 'completed'
    },
    {
        id: 3,
        date: new Date(2025, 10, 17),
        originalPhoto: 'https://via.placeholder.com/100',
        entryPhoto: 'https://via.placeholder.com/100',
        checkInTime: '08:10',
        checkOutTime: null,
        status: 'pending'
    }
]);

const currentMonthName = computed(() => {
    const months = [
        'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
        'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];
    return months[currentMonth.value.getMonth()];
});

const handleDateSelected = (date) => {
    selectedDate.value = date;
};

const handleMonthChanged = (date) => {
    currentMonth.value = date;
};

const handleShowDetail = (record) => {
    selectedRecord.value = record;
    showDetail.value = true;
};

const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const day = d.getDate();
    const month = d.getMonth() + 1;
    const year = d.getFullYear() + 543;
    return `${day}/${month}/${year}`;
};

// Build attendance map for the current month
const attendanceMap = computed(() => {
    const map = {};
    const year = currentMonth.value.getFullYear();
    const month = currentMonth.value.getMonth();

    // Records in this month
    const monthRecords = records.value.filter(r => r.date.getFullYear() === year && r.date.getMonth() === month);
    const presentSet = new Set(monthRecords.map(r => r.date.toISOString().slice(0, 10)));

    // Iterate days in current month, mark present/absent only for past or today
    const today = new Date();
    const lastDay = new Date(year, month + 1, 0).getDate();
    for (let d = 1; d <= lastDay; d++) {
        const dateObj = new Date(year, month, d);
        const iso = dateObj.toISOString().slice(0, 10);
        const isFuture = dateObj > new Date(today.getFullYear(), today.getMonth(), today.getDate());
        if (isFuture) continue; // don't mark future days
        map[iso] = presentSet.has(iso) ? 'present' : 'absent';
    }
    return map;
});
</script>
