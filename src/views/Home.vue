<template>
    <div class="min-h-screen bg-white flex flex-col"> 
        <Navbar @toggleSidebar="toggleSidebar" />

        <Sidebar 
            :is-open="sidebarOpen" 
            @close="sidebarOpen = false" 
            @logout="logout" 
        />

        <main>
            <router-view /> 
        </main>
    </div>
</template>

<script>
import Navbar from '../components/Bar.vue'; 
import Sidebar from '../components/SideBar.vue';
import { useRouter } from 'vue-router';

export default {
    name: 'HomeLayout',
    components: {
        Navbar, 
        Sidebar
    },
    data() {
        return {
            sidebarOpen: false,
        }
    },
    methods: {
        toggleSidebar() {
            this.sidebarOpen = !this.sidebarOpen;
        },
        logout() {
            localStorage.removeItem('token');
            localStorage.removeItem('residentName');
            localStorage.removeItem('residentAvatar');
            
            this.$router.push({ path: '/' }); 
            
            this.sidebarOpen = false;
        }
    }
}
</script>

<style scoped>
.min-h-screen {
    min-height: 100vh;
}
</style>