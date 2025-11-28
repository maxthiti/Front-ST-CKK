<template>
  <div class="max-w-7xl mx-auto">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white rounded-lg shadow p-4">
        <h2 class="text-lg font-semibold text-gray-700 mb-4">
          บันทึกเวลาเข้า-ออก (นักเรียน)
        </h2>
        <Calendar
          @date-selected="handleDateSelected"
          @month-changed="handleMonthChanged"
          :attendanceMap="attendanceMap"
        />
      </div>

      <div class="bg-white rounded-lg shadow p-4">
        <h2 class="text-lg font-semibold text-gray-700 mb-4">
          รายการเข้า-ออก
          <span
            v-if="selectedDate"
            class="text-sm font-normal text-gray-500"
          >
            ({{ formatDate(selectedDate) }})
          </span>
          <span
            v-else
            class="text-sm font-normal text-gray-500"
          >
            (เดือน {{ currentMonthName }})
          </span>
        </h2>

        <div class="overflow-auto max-h-[70vh]">
          <Table
            :selectedDate="selectedDate"
            :currentMonth="currentMonth"
            :records="filteredRecords"
            :loading="loading"
            @show-detail="handleShowDetail"
          />
        </div>
      </div>
    </div>

    <Detail
      v-if="showDetail"
      :record="selectedRecord"
      @close="showDetail = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import Calendar from "../../components/Student/Calendar.vue";
import Table from "../../components/Student/Table.vue";
import Detail from "../../components/Student/Detail.vue";
import { getAttendance } from "../../api/Attendance";

// --- helper: Date <-> string ---
const toYMD = (d) => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

// กำจัดปัญหา timezone: ใช้ local date 00:00
const createLocalDate = (dateStr) => {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
};

// --- state ---
const selectedDate = ref(null);
const currentMonth = ref(new Date());
const showDetail = ref(false);
const selectedRecord = ref(null);

const records = ref([]);
const loading = ref(false);

const FILE_BASE_URL = import.meta.env.VITE_APP_FILE_BASE_URL;
const FILE_BASE_URL_FILES = import.meta.env.VITE_APP_FILE_BASE_URL_FILES;

const buildUrl = (base, path) => {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;

  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  const root = base.endsWith("/") ? base : base + "/";
  return root + cleanPath;
};

// --- fetch attendance ---
const fetchAttendance = async () => {
  const year = currentMonth.value.getFullYear();
  const month = currentMonth.value.getMonth();

  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);

  try {
    loading.value = true;

    const grade = localStorage.getItem("grade");
    const classroom = localStorage.getItem("classroom");

    const apiRes = await getAttendance({
      start: toYMD(start),
      end: toYMD(end),
      role: "student",
      grade: grade,
      classroom: classroom,
      page: 1,
      limit: 20,
    });

    const students = apiRes.data || [];
    if (!students.length) {
      records.value = [];
      return;
    }

    const student = students[0];
    const attendances = student.attendances || [];

    const recs = [];
    let idCounter = 1;

    attendances.forEach((att) => {
      const dateObj = createLocalDate(att.date); // ✅ ใช้ local date
      const timeStamps = att.timeStamps || [];
      if (!timeStamps.length || !dateObj) return;

      // เรียงตามเวลา
      const sorted = [...timeStamps].sort(
        (a, b) =>
          new Date(a.timestamp.replace(" ", "T")) -
          new Date(b.timestamp.replace(" ", "T"))
      );

      const getTime = (ts) =>
        ts && ts.timestamp ? ts.timestamp.slice(11, 16) : null; // "HH:MM"

      sorted.forEach((ts, index) => {
        const timeStr = getTime(ts);
        const location = ts.location || "";

        // 👇 เครื่องออกไม่ใช้ตัดสินสาย
        const isOutDevice = location === "ipc_2_out";

        // แสกนแรกของวัน (ของเครื่องเข้า) เท่านั้นที่เอามาตัดสินว่าสายไหม
        const isFirstScanOfDay = index === 0 && !isOutDevice;

        let isLate = false;
        if (isFirstScanOfDay && timeStr) {
          const [h, m] = timeStr.split(":").map(Number);
          if (h > 8) isLate = true;
          else if (h === 8 && m > 0) isLate = true; // 08:01 ขึ้นไป = สาย
        }

        recs.push({
          id: idCounter++,
          date: dateObj, // ✅ เก็บเป็น Date จริง

          originalPhoto: buildUrl(FILE_BASE_URL_FILES, student.picture),
          entryPhoto: buildUrl(FILE_BASE_URL, ts.image),
          entryLocation: location,

          checkTime: timeStr,
          isLate,

          status: "scan",
          raw: att,
          studentName: student.name,
          studentId: student.userid,
          studentPicture: buildUrl(FILE_BASE_URL_FILES, student.picture),
        });
      });
    });

    records.value = recs;
  } catch (err) {
    console.error("fetchAttendance error:", err);
    records.value = [];
  } finally {
    loading.value = false;
  }
};

onMounted(() => fetchAttendance());
watch(currentMonth, () => {
  fetchAttendance();
});

// --- computed: ชื่อเดือน ---
const currentMonthName = computed(() => {
  const months = [
    "มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน",
    "กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม",
  ];
  return months[currentMonth.value.getMonth()];
});

// --- computed: records สำหรับ Table ---
const filteredRecords = computed(() => {
  const year = currentMonth.value.getFullYear();
  const month = currentMonth.value.getMonth();

  let list = records.value.filter((r) => {
    const d = r.date;
    return d.getFullYear() === year && d.getMonth() === month;
  });

  if (selectedDate.value) {
    const d = new Date(selectedDate.value);
    const y = d.getFullYear();
    const m = d.getMonth();
    const day = d.getDate();

    list = list.filter((r) => {
      const rd = r.date;
      return (
        rd.getFullYear() === y &&
        rd.getMonth() === m &&
        rd.getDate() === day
      );
    });
  }

  return list.sort((a, b) => {
    const da = a.date;
    const db = b.date;

    if (da.getTime() === db.getTime()) {
      return (a.checkTime || "").localeCompare(b.checkTime || "");
    }
    return da - db;
  });
});

// --- attendanceMap สำหรับ Calendar (present / late / absent) ---
const attendanceMap = computed(() => {
  const map = {};

  const year = currentMonth.value.getFullYear();
  const month = currentMonth.value.getMonth();

  const monthRecords = records.value.filter((r) => {
    const d = r.date;
    return d.getFullYear() === year && d.getMonth() === month;
  });

  // สรุปต่อวัน
  const dayInfo = {}; // { '2025-11-03': { hadScan: true, hadLate: true/false } }

  for (const r of monthRecords) {
    const ymd = toYMD(r.date);
    if (!dayInfo[ymd]) {
      dayInfo[ymd] = { hadScan: false, hadLate: false };
    }
    dayInfo[ymd].hadScan = true;
    if (r.isLate) {
      dayInfo[ymd].hadLate = true;
    }
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const lastDay = new Date(year, month + 1, 0).getDate();

  for (let d = 1; d <= lastDay; d++) {
    const dateObj = new Date(year, month, d);
    dateObj.setHours(0, 0, 0, 0);
    const ymd = toYMD(dateObj);

    if (dateObj > today) continue;

    const info = dayInfo[ymd];

    if (!info) {
      // ไม่มีการสแกนเลย
      map[ymd] = "absent";
    } else if (info.hadLate) {
      // มีการสแกน และสแกนแรกของวันสาย
      map[ymd] = "late";
    } else {
      // มีการสแกน และสแกนแรกไม่สาย
      map[ymd] = "present";
    }
  }

  return map;
});

// --- handlers ---
const handleDateSelected = (date) => {
  selectedDate.value = date;
};

const handleMonthChanged = (date) => {
  currentMonth.value = date;
  selectedDate.value = null;
};

const handleShowDetail = (record) => {
  selectedRecord.value = record;
  showDetail.value = true;
};

const formatDate = (date) => {
  const d = new Date(date);
  const day = d.getDate();
  const month = d.getMonth() + 1;
  const year = d.getFullYear() + 543;
  return `${day}/${month}/${year}`;
};
</script>
