<template>
  <div class="overflow-x-auto">
    <div v-if="loading" class="text-center py-8">
      <div
        class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"
      ></div>
      <p class="text-gray-500 mt-2">กำลังโหลดข้อมูล...</p>
    </div>

    <div v-else-if="filteredRecords.length === 0" class="text-center py-8">
      <svg
        class="w-16 h-16 mx-auto text-gray-300 mb-3"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      <p class="text-gray-500">ไม่พบข้อมูลการเข้า-ออก</p>
    </div>

    <table v-else class="w-full text-sm">
      <thead class="bg-gray-50 border-b">
        <tr>
          <th class="px-3 py-3 text-left font-semibold text-gray-700">วันที่</th>
          <th class="px-3 py-3 text-center font-semibold text-gray-700">รูปต้นฉบับ</th>
          <th class="px-3 py-3 text-center font-semibold text-gray-700">รูปที่สแกน</th>
          <th class="px-3 py-3 text-center font-semibold text-gray-700">สถานที่</th>
          <th class="px-3 py-3 text-center font-semibold text-gray-700">เวลาสแกน</th>
          <th class="px-3 py-3 text-center font-semibold text-gray-700">สถานะ</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-200">
        <tr
          v-for="record in filteredRecords"
          :key="record.id"
          class="hover:bg-gray-50"
        >
          <td class="px-3 py-3 text-gray-700">
            {{ formatDate(record.date) }}
          </td>

          <td class="px-3 py-3 text-center">
            <img
              v-if="record.originalPhoto"
              :src="record.originalPhoto"
              alt="รูปต้นฉบับ"
              class="w-12 h-12 rounded-full object-cover mx-auto cursor-pointer hover:opacity-80"
              @click="showImageModal(record.originalPhoto)"
            />
            <span v-else class="text-gray-400">-</span>
          </td>

          <td class="px-3 py-3 text-center">
            <img
              v-if="record.entryPhoto"
              :src="record.entryPhoto"
              alt="รูปที่สแกน"
              class="w-12 h-12 rounded-full object-cover mx-auto cursor-pointer hover:opacity-80"
              @click="showImageModal(record.entryPhoto)"
            />
            <span v-else class="text-gray-400">-</span>
          </td>

          <td class="px-3 py-3 text-center text-gray-700">
            {{ record.entryLocation || "-" }}
          </td>

          <!-- เวลา: เขียวถ้าปกติ เหลืองถ้าสาย / ขาด / วันหยุด แสดง "-" -->
          <td class="px-3 py-3 text-center">
            <span
              v-if="record.checkTime"
              class="font-medium"
              :class="record.isLate ? 'text-yellow-500' : 'text-green-600'"
            >
              {{ record.checkTime }}
            </span>
            <span v-else class="text-gray-400">-</span>
          </td>

          <!-- สถานะ: ปกติ / สาย / ขาด / วันหยุดทำการ -->
          <td class="px-3 py-3 text-center">
            <!-- วันหยุด -->
            <span
              v-if="record.dayStatus === 'holiday'"
              class="font-semibold text-blue-500"
            >
              วันหยุดทำการ
            </span>

            <!-- ขาด -->
            <span
              v-else-if="record.dayStatus === 'absent'"
              class="font-semibold text-red-500"
            >
              ขาด
            </span>

            <!-- มีการสแกน -->
            <span
              v-else-if="record.checkTime"
              class="font-semibold"
              :class="record.isLate ? 'text-yellow-500' : 'text-green-600'"
            >
              {{ record.isLate ? 'สาย' : 'ปกติ' }}
            </span>

            <!-- กันพลาด -->
            <span v-else class="text-gray-400">-</span>
          </td>
        </tr>
      </tbody>
    </table>

    <div
      v-if="imageModalUrl"
      @click="imageModalUrl = null"
      class="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
    >
      <img
        :src="imageModalUrl"
        alt="ภาพขยาย"
        class="max-w-full max-h-full rounded-lg"
        @click.stop
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  selectedDate: {
    type: Date,
    default: null,
  },
  currentMonth: {
    type: Date,
    required: true,
  },
  records: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["show-detail"]);

const imageModalUrl = ref(null);

// เช็คว่าสายจากเวลา + กันเคส ipc_2_out ไม่คิดว่าสาย
const isLateByTime = (timeStr, record) => {
  if (!timeStr) return false;

  // ถ้าเป็นเครื่องออก → ไม่ถือว่าสาย
  if (record?.entryLocation === "ipc_2_out") return false;

  const [h, m] = timeStr.split(":").map(Number);
  if (h > 8) return true;
  if (h === 8 && m > 0) return true; // 08:01 ขึ้นไป = สาย
  return false;
};

// ✅ สร้าง list รายวัน + เติม "ขาด" / "วันหยุดทำการ"
// และถ้ายังไม่เลือกวัน → เรียงจากวันล่าสุด → ย้อนลงไป
const filteredRecords = computed(() => {
  const year = props.currentMonth.getFullYear();
  const month = props.currentMonth.getMonth();

  // map วันที่ -> records ของวันนั้น
  const byDay = new Map();
  for (const r of props.records) {
    const d = new Date(r.date);
    if (d.getFullYear() !== year || d.getMonth() !== month) continue;
    const day = d.getDate();
    if (!byDay.has(day)) byDay.set(day, []);
    byDay.get(day).push(r);
  }

  let startDay = 1;
  let endDay = new Date(year, month + 1, 0).getDate();

  if (props.selectedDate) {
    const d = new Date(props.selectedDate);
    if (d.getFullYear() === year && d.getMonth() === month) {
      startDay = endDay = d.getDate();
    }
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const result = [];

  // loop ถอยหลัง → วันล่าสุดอยู่บนสุดเมื่อไม่ได้เลือกวัน
  for (let day = endDay; day >= startDay; day--) {
    const dateObj = new Date(year, month, day);
    dateObj.setHours(0, 0, 0, 0);

    // ตัดวันอนาคตทิ้ง (ทั้งกรณีเลือก/ไม่เลือกวัน)
    if (dateObj > today) continue;

    const dayRecords = byDay.get(day) || [];

    if (dayRecords.length > 0) {
      // มีการสแกน → ใช้ records เดิม เรียงตามเวลาเช้า → เย็น
      const sorted = [...dayRecords].sort((a, b) =>
        (a.checkTime || "").localeCompare(b.checkTime || "")
      );

      sorted.forEach((r) => {
        result.push({
          ...r,
          isLate: r.isLate ?? isLateByTime(r.checkTime, r),
          dayStatus: "present",
        });
      });
    } else {
      // ไม่มีการสแกน → ขาด หรือ วันหยุดทำการ
      const dayOfWeek = dateObj.getDay(); // 0 = อาทิตย์, 6 = เสาร์
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      result.push({
        id: `empty-${year}-${month + 1}-${day}`,
        date: dateObj,
        originalPhoto: null,
        entryPhoto: null,
        entryLocation: null,
        checkTime: null,
        isLate: false,
        dayStatus: isWeekend ? "holiday" : "absent",
      });
    }
  }

  return result;
});

const formatDate = (date) => {
  const d = new Date(date);
  if (isNaN(d.getTime())) return "-";
  const day = d.getDate();
  const month = d.getMonth() + 1;
  const year = d.getFullYear() + 543;
  return `${day}/${month}/${year}`;
};

const showDetail = (record) => {
  emit("show-detail", record);
};

const showImageModal = (url) => {
  imageModalUrl.value = url;
};
</script>
