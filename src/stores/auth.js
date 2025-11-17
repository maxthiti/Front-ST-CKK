import { defineStore } from 'pinia';
import axios from 'axios';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        token: localStorage.getItem('token') || null,
        user: null,
        isAuthenticated: !!localStorage.getItem('token'),
    }),
    actions: {
        logout() {
            this.token = null;
            this.user = null;
            this.isAuthenticated = false;
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['Authorization'];
        },

        async initializeAuth() {
            const token = localStorage.getItem('token');
            if (!token) {
                this.logout();
                return false;
            }

            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            this.token = token;
            this.isAuthenticated = true;

            try {
                const name = localStorage.getItem('residentName');
                const avatar = localStorage.getItem('residentAvatar');
                if (name || avatar) {
                    this.user = { name, avatar };
                }
            } catch (_) { }

            return true;
        },
    }
});