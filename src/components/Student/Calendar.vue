<template>
    <div class="calendar-container">
        <div class="flex items-center justify-between mb-4">
            <button @click="previousMonth" class="p-2 hover:bg-gray-100 rounded-lg">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
            </button>

            <h3 class="text-lg font-semibold text-gray-800">
                {{ currentMonthName }} {{ currentYear + 543 }}
            </h3>

            <button @click="nextMonth" class="p-2 hover:bg-gray-100 rounded-lg">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
            </button>
        </div>

        <div class="grid grid-cols-7 gap-1 mb-2">
            <div v-for="day in weekdays" :key="day" class="text-center text-sm font-medium text-gray-600 py-2">
                {{ day }}
            </div>
        </div>

        <div class="grid grid-cols-7 gap-1">
            <button v-for="(day, index) in calendarDays" :key="index" @click="selectDate(day)"
                :disabled="!day.currentMonth" :class="[
                    'aspect-square flex items-center justify-center rounded-lg text-sm transition-colors',
                    day.currentMonth ? 'hover:bg-blue-50' : 'text-gray-300 cursor-not-allowed',
                    day.isSelected
                        ? 'bg-blue-600 text-white font-semibold'
                        : day.isPresent
                            ? 'bg-green-100 text-green-700 font-semibold'
                            : day.isAbsent
                                ? 'bg-red-100 text-red-700 font-semibold'
                                : day.isToday
                                    ? 'bg-blue-100 text-blue-700 font-semibold'
                                    : 'text-gray-700',
                    !day.currentMonth && 'opacity-50'
                ]">
                {{ day.date }}
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
    attendanceMap: {
        type: Object,
        default: () => ({})
    }
});

const emit = defineEmits(['date-selected', 'month-changed']);

const currentDate = ref(new Date());
const selectedDate = ref(null);

const weekdays = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];
const months = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

const currentMonthName = computed(() => months[currentDate.value.getMonth()]);
const currentYear = computed(() => currentDate.value.getFullYear());

const calendarDays = computed(() => {
    const year = currentDate.value.getFullYear();
    const month = currentDate.value.getMonth();

    const firstDay = new Date(year, month, 1);
    const startingDayOfWeek = firstDay.getDay();

    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    const prevMonthLastDay = new Date(year, month, 0);
    const prevMonthDays = prevMonthLastDay.getDate();

    const days = [];

    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
        days.push({
            date: prevMonthDays - i,
            currentMonth: false,
            isToday: false,
            isSelected: false,
            fullDate: new Date(year, month - 1, prevMonthDays - i)
        });
    }

    const today = new Date();
    for (let i = 1; i <= daysInMonth; i++) {
        const fullDate = new Date(year, month, i);
        const isToday = fullDate.toDateString() === today.toDateString();
        const isSelected = selectedDate.value && fullDate.toDateString() === selectedDate.value.toDateString();

        const iso = fullDate.toISOString().slice(0, 10);
        const status = props.attendanceMap[iso];
        const isPresent = status === 'present';
        const isAbsent = status === 'absent';

        days.push({
            date: i,
            currentMonth: true,
            isToday,
            isSelected,
            isPresent,
            isAbsent,
            fullDate
        });
    }

    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
        days.push({
            date: i,
            currentMonth: false,
            isToday: false,
            isSelected: false,
            fullDate: new Date(year, month + 1, i)
        });
    }

    return days;
});

const selectDate = (day) => {
    if (!day.currentMonth) return;

    selectedDate.value = day.fullDate;
    emit('date-selected', day.fullDate);
};

const previousMonth = () => {
    currentDate.value = new Date(
        currentDate.value.getFullYear(),
        currentDate.value.getMonth() - 1,
        1
    );
    selectedDate.value = null;
    emit('date-selected', null);
    emit('month-changed', new Date(currentDate.value));
};

const nextMonth = () => {
    currentDate.value = new Date(
        currentDate.value.getFullYear(),
        currentDate.value.getMonth() + 1,
        1
    );
    selectedDate.value = null;
    emit('date-selected', null);
    emit('month-changed', new Date(currentDate.value));
};

watch(currentDate, () => {
    // keep in sync if needed
});
</script>

<style scoped>
.calendar-container {
    user-select: none;
}
</style>
