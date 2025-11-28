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
      <div
        v-for="day in weekdays"
        :key="day"
        class="text-center text-sm font-medium text-gray-600 py-2"
      >
        {{ day }}
      </div>
    </div>

    <div class="grid grid-cols-7 gap-1">
      <button
        v-for="(day, index) in calendarDays"
        :key="index"
        @click="selectDate(day)"
        :disabled="!day.currentMonth"
        :class="[
          'aspect-square flex items-center justify-center rounded-lg text-sm transition-colors',
          day.currentMonth ? 'hover:bg-blue-50' : 'text-gray-300 cursor-not-allowed',
          day.isSelected
            ? 'bg-blue-600 text-white font-semibold'
            : day.isLate
              ? 'bg-yellow-50 text-yellow-700 font-semibold border-2 border-yellow-400'
              : day.isPresent
                ? 'bg-green-100 text-green-700 font-semibold'
                : day.isAbsent
                  ? 'bg-red-100 text-red-700 font-semibold'
                  : day.isToday
                    ? 'bg-blue-100 text-blue-700 font-semibold'
                    : 'text-gray-700',
          !day.currentMonth && 'opacity-50'
        ]"
      >
        {{ day.date }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  attendanceMap: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(["date-selected", "month-changed"]);

const currentDate = ref(new Date());
const selectedDate = ref(null);

const weekdays = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];
const months = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
];

const toYMD = (d) => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const currentMonthName = computed(
  () => months[currentDate.value.getMonth()]
);
const currentYear = computed(() => currentDate.value.getFullYear());

const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear();
  const month = currentDate.value.getMonth();

  const firstDay = new Date(year, month, 1);
  const startingDayOfWeek = firstDay.getDay(); // 0=อา ... 6=ส

  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();

  const prevMonthLastDay = new Date(year, month, 0);
  const prevMonthDays = prevMonthLastDay.getDate();

  const days = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // วันของเดือนก่อน (fill ช่องด้านหน้า)
  for (let i = 0; i < startingDayOfWeek; i++) {
    const dateNum = prevMonthDays - startingDayOfWeek + 1 + i;
    const fullDate = new Date(year, month - 1, dateNum);
    fullDate.setHours(0, 0, 0, 0);

    const isSelected =
      selectedDate.value &&
      fullDate.toDateString() === selectedDate.value.toDateString();

    days.push({
      date: dateNum,
      currentMonth: false,
      isToday: false,
      isSelected,
      isPresent: false,
      isAbsent: false,
      isLate: false,
      fullDate,
    });
  }

  // วันของเดือนปัจจุบัน
  for (let i = 1; i <= daysInMonth; i++) {
    const fullDate = new Date(year, month, i);
    fullDate.setHours(0, 0, 0, 0);

    const isToday = fullDate.getTime() === today.getTime();
    const isSelected =
      selectedDate.value &&
      fullDate.toDateString() === selectedDate.value.toDateString();

    const key = toYMD(fullDate);
    const status = props.attendanceMap[key];
    const isLate = status === "late";
    const isPresent = status === "present";
    const isAbsent = status === "absent";

    days.push({
      date: i,
      currentMonth: true,
      isToday,
      isSelected,
      isPresent,
      isAbsent,
      isLate,
      fullDate,
    });
  }

  // วันของเดือนถัดไป (fill ช่องด้านหลังให้ครบแถว)
  const remaining = (7 - (days.length % 7)) % 7;
  for (let i = 1; i <= remaining; i++) {
    const fullDate = new Date(year, month + 1, i);
    fullDate.setHours(0, 0, 0, 0);

    const isSelected =
      selectedDate.value &&
      fullDate.toDateString() === selectedDate.value.toDateString();

    days.push({
      date: i,
      currentMonth: false,
      isToday: false,
      isSelected,
      isPresent: false,
      isAbsent: false,
      isLate: false,
      fullDate,
    });
  }

  return days;
});

const selectDate = (day) => {
  if (!day.currentMonth) return;

  if (
    selectedDate.value &&
    selectedDate.value.toDateString() === day.fullDate.toDateString()
  ) {
    selectedDate.value = null;
    emit("date-selected", null); 
    return;
  }

  selectedDate.value = day.fullDate;
  emit("date-selected", day.fullDate);
};

const previousMonth = () => {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() - 1,
    1
  );
  selectedDate.value = null;
  emit("date-selected", null);
  emit("month-changed", new Date(currentDate.value));
};

const nextMonth = () => {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() + 1,
    1
  );
  selectedDate.value = null;
  emit("date-selected", null);
  emit("month-changed", new Date(currentDate.value));
};
</script>

<style scoped>
.calendar-container {
  user-select: none;
}
</style>
