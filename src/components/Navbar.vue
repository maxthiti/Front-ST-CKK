<template>
    <nav class="bg-white shadow-sm border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <button @click="toggleMobileSidebar" class="md:hidden p-2 rounded-lg hover:bg-gray-100">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
        </button>

        <div class="flex-1"></div>

        <div class="flex items-center gap-3">
            <div class="flex items-center gap-2">
                <div
                    class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                    {{ userInitial }}
                </div>
                <div class="text-right">
                    <p class="text-sm font-medium text-gray-700">{{ userName }}</p>
                    <p class="text-xs text-gray-500">{{ userRole }}</p>
                </div>
            </div>
            <button @click="logout" class="p-2 rounded-lg hover:bg-gray-100 text-gray-600" title="ออกจากระบบ">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
            </button>
        </div>
    </nav>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const userName = computed(() => authStore.user?.name || 'ผู้ใช้งาน');
const userRole = computed(() => authStore.user?.role === 'student' ? 'นักเรียน' : 'ครู');
const userInitial = computed(() => {
    const name = authStore.user?.name || 'U';
    return name.charAt(0).toUpperCase();
});

const toggleMobileSidebar = () => {
    window.dispatchEvent(new CustomEvent('toggle-sidebar'));
};

const logout = () => {
    authStore.logout();
    router.push('/login');
};
</script>
