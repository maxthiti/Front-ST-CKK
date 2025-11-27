<template>
  <div class="max-w-7xl mx-auto">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white rounded-lg shadow p-4">
        <h2 class="text-lg font-semibold text-gray-700 mb-4">บันทึกเวลาเข้า-ออก (ครู)</h2>
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

const teacherName = ref("นาย ธำรงค์ หน่อเรือง"); 

const toYMD = (d) => {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

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
      const dateObj = new Date(att.date);
      const timeStamps = att.timeStamps || [];
      if (!timeStamps.length) return;

      const sorted = [...timeStamps].sort(
        (a, b) =>
          new Date(a.timestamp.replace(" ", "T")) -
          new Date(b.timestamp.replace(" ", "T"))
      );

      const getTime = (ts) =>
        ts && ts.timestamp ? ts.timestamp.slice(11, 16) : null;

      sorted.forEach((ts) => {
        recs.push({
          id: idCounter++,
          date: dateObj,

          originalPhoto: buildUrl(FILE_BASE_URL_FILES, teacher.picture),
          entryPhoto: buildUrl(FILE_BASE_URL, ts.image),
          entryLocation: ts.location,

          checkTime: getTime(ts),   

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

const currentMonthName = computed(() => {
  const months = [
    "มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน",
    "กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม",
  ];
  return months[currentMonth.value.getMonth()];
});

const filteredRecords = computed(() => {
  const year = currentMonth.value.getFullYear();
  const month = currentMonth.value.getMonth();

  let list = records.value.filter((r) => {
    const d = new Date(r.date);
    return d.getFullYear() === year && d.getMonth() === month;
  });
  if (selectedDate.value) {
    const d = new Date(selectedDate.value);
    const y = d.getFullYear();
    const m = d.getMonth();
    const day = d.getDate();

    list = list.filter((r) => {
      const rd = new Date(r.date);
      return (
        rd.getFullYear() === y &&
        rd.getMonth() === m &&
        rd.getDate() === day
      );
    });
  }

  return list.sort((a, b) => {
    const da = new Date(a.date);
    const db = new Date(b.date);

    if (da.getTime() === db.getTime()) {
      return (a.checkTime || "").localeCompare(b.checkTime || "");
    }
    return da - db;
  });
});

const attendanceMap = computed(() => {
  const map = {};

  const year = currentMonth.value.getFullYear();
  const month = currentMonth.value.getMonth();

  const monthRecords = records.value.filter((r) => {
    const d = new Date(r.date);
    return d.getFullYear() === year && d.getMonth() === month;
  });

  const presentSet = new Set(
    monthRecords.map((r) => toYMD(new Date(r.date)))
  );

  const today = new Date();
  const lastDay = new Date(year, month + 1, 0).getDate();

  for (let d = 1; d <= lastDay; d++) {
    const dateObj = new Date(year, month, d);
    const ymd = toYMD(dateObj);

    if (
      dateObj >
      new Date(today.getFullYear(), today.getMonth(), today.getDate())
    )
      continue;

    map[ymd] = presentSet.has(ymd) ? "present" : "absent";
  }

  return map;
});

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
