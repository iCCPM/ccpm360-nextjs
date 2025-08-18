import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthService, AdminUser, LoginResult } from '@/services/authService';

interface AuthState {
  user: AdminUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });

        try {
          const result = await AuthService.login(email, password);

          if (result.success && result.user) {
            set({ user: result.user, isLoading: false });
          } else {
            set({ isLoading: false });
          }

          return result;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        await AuthService.logout();
        set({ user: null });
      },

      checkAuth: async () => {
        set({ isLoading: true });

        const user = await AuthService.getCurrentUser();

        set({ user, isLoading: false });
      },
    }),
    {
      name: 'admin-auth-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
);

// 监听认证状态变化
AuthService.onAuthStateChange((user) => {
  if (!user) {
    useAuthStore.getState().logout();
  } else {
    useAuthStore.setState({ user, isLoading: false });
  }
});
