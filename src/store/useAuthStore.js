import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));

    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      loginSuccess: (user, token) => {
        set({
          user,
          token,
          isAuthenticated: true
        });
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false
        });
      },

      updateUser: (updatedUser) => {
        set({
          user: updatedUser
        });
      },

      checkAuth: async () => {
        const token = get().token;

        if (!token) {
          get().logout();
          return false;
        }

        if (isTokenExpired(token)) {
          get().logout();
          return false;
        }

        try {
          const response = await fetch(`${import.meta.env.VITE_BACKEND}/users/me`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            const result = await response.json();
            set({ user: result.user, isAuthenticated: true });
            return true;
          } else {
            get().logout();
            return false;
          }
        } catch (error) {
          console.error("Gagal sinkronisasi data user:", error);
          return true;
        }
      }
    }),
    {
      name: 'auth-storage',
    }
  )
);