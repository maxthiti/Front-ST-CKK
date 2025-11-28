<template>
    <div v-if="isMobileOpen" @click="closeSidebar" class="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"></div>

    <aside :class="[
        'fixed md:static inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out',
        isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
    ]">
        <div class="h-full flex flex-col">

            <div class="p-4 border-b border-gray-200 flex flex-col items-center">
                <img
                    src="/CKK.png"
                    alt="CKK Logo"
                   class="w-28 h-28 object-contain"

                />
                <h2 class="text-xl font-bold text-blue-600">CKK School</h2>
                <p class="text-sm text-gray-500">Student Portal</p>
            </div>

            <nav class="flex-1 p-4 overflow-y-auto">
                <ul class="space-y-2">
                    <li>
                        <router-link
                            to="/student/home"
                            class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition-colors"
                            active-class="bg-blue-50 text-blue-600 font-medium"
                        >
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                                />
                            </svg>
                            <span>หน้าแรก</span>
                            
                        </router-link>
  <router-link
    to="/change-password"
    class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition-colors"
    active-class="bg-blue-50 text-blue-600 font-medium"
  >
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M12 11c1.657 0 3-1.343 3-3S13.657 5 12 5 9 6.343 9 8s1.343 3 3 3zm0 2c-2.67 0-8 1.336-8 4v1h16v-1c0-2.664-5.33-4-8-4z"
      />
    </svg>
    <span>เปลี่ยนรหัสผ่าน</span>
  </router-link>

                        
                    </li>
                </ul>
            </nav>

            <div class="p-4 border-t border-gray-200">
                <p class="text-xs text-gray-500 text-center">© 2025 CKK School</p>
            </div>
        </div>
    </aside>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const isMobileOpen = ref(false);

const toggleSidebar = () => {
    isMobileOpen.value = !isMobileOpen.value;
};

const closeSidebar = () => {
    isMobileOpen.value = false;
};

onMounted(() => {
    window.addEventListener('toggle-sidebar', toggleSidebar);
});

onUnmounted(() => {
    window.removeEventListener('toggle-sidebar', toggleSidebar);
});
</script>
