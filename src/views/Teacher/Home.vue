<template>
  <div class="max-w-7xl mx-auto">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white rounded-lg shadow p-4">
        <h2 class="text-lg font-semibold text-gray-700 mb-4">
          บันทึกเวลาเข้า-ออก (ครู)
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
import Calendar from "../../components/Teacher/Calendar.vue";
import Table from "../../components/Teacher/Table.vue";
import Detail from "../../components/Teacher/Detail.vue";
import { getAttendance } from "../../api/Attendance";

// ภายหลังถ้าใช้ authStore / localStorage ก็มาแทนค่าตรงนี้ได้
const teacherName = ref("นาย ธำรงค์ หน่อเรือง");

// ------- helper: Date <-> string -------

const toYMD = (d) => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const createLocalDate = (dateStr) => {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d); // local time, ไม่เหลื่อมวัน
};

// ------- state -------

const selectedDate = ref(null);
const currentMonth = ref(new Date());
const showDetail = ref(false);
const selectedRecord = ref(null);

const records = ref([]); // record แยกเป็นแถว ๆ
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

// ------- fetch attendance -------

const fetchAttendance = async () => {
  const year = currentMonth.value.getFullYear();
  const month = currentMonth.value.getMonth();

  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);

  try {
    loading.value = true;

    const apiRes = await getAttendance({
      start: toYMD(start),
      end: toYMD(end),
      role: "teacher",
      name: teacherName.value,
      page: 1,
      limit: 20,
    });

    const teachers = apiRes.data || [];
    if (!teachers.length) {
      records.value = [];
      return;
    }

    const teacher = teachers[0];
    const attendances = teacher.attendances || [];

    const recs = [];
    let idCounter = 1;

    attendances.forEach((att) => {
      const dateObj = createLocalDate(att.date);
      const timeStamps = att.timeStamps || [];
      if (!timeStamps.length || !dateObj) return;

      // เรียง timestamp ก่อน
      const sorted = [...timeStamps].sort(
        (a, b) =>
          new Date(a.timestamp.replace(" ", "T")) -
          new Date(b.timestamp.replace(" ", "T"))
      );

      const getTime = (ts) =>
        ts && ts.timestamp ? ts.timestamp.slice(11, 16) : null;

      sorted.forEach((ts, index) => {
        const timeStr = getTime(ts); // "HH:MM"
        const location = ts.location || "";

        // ipc_2_out = เครื่องออก → ไม่ใช้ตัดสินสาย
        const isOutDevice = location === "ipc_2_out";

        // สแกนแรกของวัน และไม่ใช่เครื่องออก
        const isFirstScanOfDay = index === 0 && !isOutDevice;

        // คำนวณสาย:
        //  - ต้องเป็นสแกนแรกของวัน
        //  - เวลา > 08:00 หรือ 08:01 ขึ้นไป
        let isLate = false;
        if (isFirstScanOfDay && timeStr) {
          const [h, m] = timeStr.split(":").map(Number);
          if (h > 8) isLate = true;
          else if (h === 8 && m > 0) isLate = true;
        }

        recs.push({
          id: idCounter++,
          date: dateObj,

          originalPhoto: buildUrl(FILE_BASE_URL_FILES, teacher.picture),
          entryPhoto: buildUrl(FILE_BASE_URL, ts.image),
          entryLocation: location,

          checkTime: timeStr,
          isLate, // 👈 ใช้ต่อใน attendanceMap / table

          status: "scan",
          raw: att,
          teacherName: teacher.name,
          teacherId: teacher.userid,
          teacherPicture: buildUrl(FILE_BASE_URL_FILES, teacher.picture),
        });
      });
    });

    records.value = recs;
  } catch (err) {
    console.error("fetchAttendance teacher error:", err);
    records.value = [];
  } finally {
    loading.value = false;
  }
};

onMounted(() => fetchAttendance());
watch(currentMonth, () => {
  fetchAttendance();
});

// ------- computed for list & calendar -------

const currentMonthName = computed(() => {
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
  return months[currentMonth.value.getMonth()];
});

const filteredRecords = computed(() => {
  const year = currentMonth.value.getFullYear();
  const month = currentMonth.value.getMonth();

  // records เฉพาะเดือนนี้
  let list = records.value.filter((r) => {
    const d = r.date;
    return d.getFullYear() === year && d.getMonth() === month;
  });

  // ถ้าเลือกวัน → filter ตามวัน
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

  // เรียง วันที่ → เวลา
  return list.sort((a, b) => {
    const da = a.date;
    const db = b.date;

    if (da.getTime() === db.getTime()) {
      return (a.checkTime || "").localeCompare(b.checkTime || "");
    }
    return da - db;
  });
});

// map สำหรับ Calendar: present / late / absent
const attendanceMap = computed(() => {
  const map = {};

  const year = currentMonth.value.getFullYear();
  const month = currentMonth.value.getMonth();

  // records เฉพาะเดือนนี้
  const monthRecords = records.value.filter((r) => {
    const d = r.date;
    return d.getFullYear() === year && d.getMonth() === month;
  });

  // รวมข้อมูลต่อวัน
  const dayInfo = {}; // { '2025-11-03': { hadScan: true, hadLate: false }, ... }

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

    // ข้ามวันที่ยังไม่ถึง
    if (dateObj > today) continue;

    const info = dayInfo[ymd];

    if (!info) {
      // ไม่มีการสแกนเลย
      map[ymd] = "absent";
    } else if (info.hadLate) {
      // มีสแกน และสแกนแรกของวันสาย
      map[ymd] = "late";
    } else {
      // มีสแกน แต่สแกนแรกไม่สาย
      map[ymd] = "present";
    }
  }

  return map;
});

// ------- handlers -------

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
