<template>
    <div class="flex items-center px-6 py-4 bg-white shadow-md justify-between w-full">
        <button class="mr-6 focus:outline-none" @click="$emit('toggleSidebar')">
            <svg width="28" height="28" fill="none" stroke="currentColor" class="text-green-600">
                <line x1="6" y1="8" x2="22" y2="8" stroke-width="2" />
                <line x1="6" y1="14" x2="22" y2="14" stroke-width="2" />
                <line x1="6" y1="20" x2="22" y2="20" stroke-width="2" />
            </svg>
        </button>
        
        <div class="flex items-center">
            <div
                class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-3 overflow-hidden border border-gray-200">
                <img v-if="avatarUrl" :src="avatarUrl" alt="Avatar" class="w-full h-full object-cover">
                <svg v-else class="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
            </div>
            <span class="font-bold text-xl text-green-700">
                {{ userName }}
            </span>
        </div>
    </div>
</template>

<script>
export default {
    name: 'Navbar',
    emits: ['toggleSidebar'],
    data() {
        return {
            userName: localStorage.getItem('residentName') || 'ลูกบ้าน',
            avatarUrl: localStorage.getItem('residentAvatar') || null
        }
    },
}
</script>
