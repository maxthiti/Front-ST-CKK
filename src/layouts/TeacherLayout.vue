<template>
    <div class="flex h-screen bg-gray-50">
\        <Sidebar />

\        <div class="flex-1 flex flex-col overflow-hidden">
\            <Navbar />

\            <main class="flex-1 overflow-y-auto p-4 md:p-6">
                <router-view />
            </main>
        </div>
    </div>
</template>

<script setup>
import Navbar from '../components/Navbar.vue';
import Sidebar from '../components/Sidebar.vue';
</script>
