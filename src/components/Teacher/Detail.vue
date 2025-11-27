<template>
  <div
    class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
    @click="closeModal"
  >
    <div
      class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      @click.stop
    >
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 class="text-xl font-semibold text-gray-800">รายละเอียดการเข้า-ออก</h2>
        <button
          @click="closeModal"
          class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg
            class="w-5 h-5 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div class="p-6 space-y-6">
        <!-- วันที่อย่างเดียว -->
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-500">วันที่</p>
            <p class="text-lg font-semibold text-gray-800">
              {{ formatDate(record.date) }}
            </p>
          </div>
        </div>

        <!-- รูป -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p class="text-sm font-medium text-gray-700 mb-2">รูปต้นฉบับ</p>
            <div class="border-2 border-gray-200 rounded-lg overflow-hidden">
              <img
                v-if="record.originalPhoto"
                :src="record.originalPhoto"
                alt="รูปต้นฉบับ"
                class="w-full h-48 object-cover cursor-pointer hover:opacity-90"
                @click="showImageModal(record.originalPhoto)"
              />
              <div
                v-else
                class="w-full h-48 bg-gray-100 flex items-center justify-center"
              >
                <span class="text-gray-400">ไม่มีรูปภาพ</span>
              </div>
            </div>
          </div>

          <div>
            <p class="text-sm font-medium text-gray-700 mb-2">รูปขาเข้า</p>
            <div class="border-2 border-gray-200 rounded-lg overflow-hidden">
              <img
                v-if="record.entryPhoto"
                :src="record.entryPhoto"
                alt="รูปขาเข้า"
                class="w-full h-48 object-cover cursor-pointer hover:opacity-90"
                @click="showImageModal(record.entryPhoto)"
              />
              <div
                v-else
                class="w-full h-48 bg-gray-100 flex items-center justify-center"
              >
                <span class="text-gray-400">ไม่มีรูปภาพ</span>
              </div>
            </div>
          </div>
        </div>

        <!-- เวลาสแกน (แทน เวลาเข้า/เวลาออก/รอเช็คเอาท์ ทั้งหมด) -->
        <div class="bg-blue-50 rounded-lg p-4">
          <div class="flex items-center gap-2 mb-2">
            <svg
              class="w-5 h-5 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span class="text-sm font-medium text-gray-700">เวลาสแกน</span>
          </div>
          <p class="text-2xl font-bold text-blue-700">
            {{ record.checkTime || '-' }}
          </p>
        </div>

        <!-- หมายเหตุ (ถ้ามี) -->
        <div v-if="record.note" class="bg-gray-50 rounded-lg p-4">
          <p class="text-sm font-medium text-gray-700 mb-1">หมายเหตุ</p>
          <p class="text-gray-600">{{ record.note }}</p>
        </div>
      </div>

      <div class="flex justify-end gap-3 p-6 border-t border-gray-200">
        <button
          @click="closeModal"
          class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          ปิด
        </button>
      </div>
    </div>

    <div
      v-if="imageModalUrl"
      @click="imageModalUrl = null"
      class="fixed inset-0 bg-black bg-opacity-90 z-[60] flex items-center justify-center p-4"
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
import { ref } from "vue";

const props = defineProps({
  record: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["close"]);

const imageModalUrl = ref(null);

const formatDate = (date) => {
  const d = new Date(date);
  const day = d.getDate();
  const month = d.getMonth() + 1;
  const year = d.getFullYear() + 543;
  const weekdays = [
    "อาทิตย์",
    "จันทร์",
    "อังคาร",
    "พุธ",
    "พฤหัสบดี",
    "ศุกร์",
    "เสาร์",
  ];
  const weekday = weekdays[d.getDay()];
  return `วัน${weekday} ที่ ${day}/${month}/${year}`;
};

const closeModal = () => {
  emit("close");
};

const showImageModal = (url) => {
  imageModalUrl.value = url;
};
</script>
