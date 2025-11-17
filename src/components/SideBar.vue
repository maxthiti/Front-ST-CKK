<template>
    <div>
        <transition name="slide">
            <div v-if="isOpen"
                class="fixed top-0 left-0 h-full w-64 bg-white shadow-2xl z-50 flex flex-col pt-16 px-2 rounded-r-xl">
                
                <div class="absolute top-4 left-4 font-extrabold text-green-700 text-2xl">เมนู</div>
                <button class="absolute top-4 right-4 text-gray-500 text-lg hover:text-red-500" @click="$emit('close')">
                    ✕
                </button>
                
                <nav class="flex flex-col gap-6 shadow-sm rounded-xl p-4 bg-gray-50 min-h-full justify-between">
                    <div class="flex flex-col gap-3">
                        <router-link to="/resident-car" :class="menuClass('/resident-car')">ทะเบียนรถลูกบ้าน</router-link>
                        <router-link to="/visitor" :class="menuClass('/visitor')">ทะเบียนรถผู้มาเยือน</router-link>
                        <router-link to="/history" :class="menuClass('/history')">ประวัติการเข้าออก</router-link>
                    </div>
                    <button @click="logout" 
                            class="font-bold text-sm px-3 py-2 rounded transition w-full mt-8 bg-red-100 text-red-600 hover:bg-red-200 hover:shadow-md">
                        ออกจากระบบ
                    </button>
                </nav>
            </div>
        </transition>
        
        <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-30 z-40" @click="$emit('close')"></div>
    </div>
</template>

<script>
export default {
    name: 'Sidebar',
    props: {
        isOpen: {
            type: Boolean,
            default: false
        }
    },
    emits: ['close', 'logout'],
    computed: {
        currentPath() {
            return this.$route.path; 
        }
    },
    methods: {
        menuClass(path) {
            const baseClasses = 'font-bold text-sm px-3 py-2 rounded transition shadow-sm';
            const activeClasses = 'bg-gradient-to-r from-green-400 to-blue-400 to-blue-200 text-white shadow-lg'; 
            const inactiveClasses = 'text-gray-700 hover:bg-blue-100';

            return [
                baseClasses,
                this.currentPath === path ? activeClasses : inactiveClasses
            ];
        },
        logout() {
            this.$emit('logout');
        }
    }
}
</script>

<style scoped>
.slide-enter-active,
.slide-leave-active {
    transition: transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
}

.slide-enter-from,
.slide-leave-to {
    transform: translateX(-100%);
}

.slide-enter-to,
.slide-leave-from {
    transform: translateX(0);
}

.sidebar-gradient {
    background-image: linear-gradient(to bottom right, var(--tw-color-green-200), var(--tw-color-blue-200));
}
</style>
