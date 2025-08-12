import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';

interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: 'super_admin' | 'admin' | 'editor' | 'reviewer';
  is_active: boolean;
}

interface AuthState {
  user: AdminUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(persist(
  (set) => ({
      user: null,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        
        try {
          // 使用Supabase Auth登录
          const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (authError) {
            set({ isLoading: false });
            // 检查是否是邮箱未验证的错误
            if (authError.message.includes('Email not confirmed') || authError.message.includes('email_not_confirmed')) {
              return { success: false, error: '邮箱尚未验证，请检查您的邮箱并点击验证链接后再登录' };
            }
            return { success: false, error: authError.message };
          }

          // 检查用户邮箱是否已验证
          if (!authData.user?.email_confirmed_at) {
            await supabase.auth.signOut();
            set({ isLoading: false });
            return { success: false, error: '邮箱尚未验证，请检查您的邮箱并点击验证链接后再登录' };
          }

          // 获取管理员用户信息
          const { data: adminUser, error: userError } = await supabase
            .from('admin_users')
            .select('*')
            .eq('email', email)
            .single();

          if (userError || !adminUser) {
            // 如果不是管理员用户，退出登录
            await supabase.auth.signOut();
            set({ isLoading: false });
            return { success: false, error: '无效的管理员账户' };
          }

          // 检查管理员账户是否激活
          if (!adminUser.is_active) {
            await supabase.auth.signOut();
            set({ isLoading: false });
            return { success: false, error: '管理员账户未激活，请联系超级管理员' };
          }

          // 如果邮箱已验证但admin_users表中is_active为false，则激活账户
          if (authData.user?.email_confirmed_at && !adminUser.is_active) {
            const { error: updateError } = await supabase
              .from('admin_users')
              .update({ is_active: true })
              .eq('id', adminUser.id);
            
            if (!updateError) {
              adminUser.is_active = true;
            }
          }

          set({ 
            user: adminUser,
            isLoading: false 
          });

          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          return { 
            success: false, 
            error: error instanceof Error ? error.message : '登录失败' 
          };
        }
      },

      logout: async () => {
        await supabase.auth.signOut();
        set({ user: null });
      },

      checkAuth: async () => {
        set({ isLoading: true });
        
        try {
          const { data: { session } } = await supabase.auth.getSession();
          
          if (!session) {
            set({ user: null, isLoading: false });
            return;
          }

          // 验证是否为管理员用户
          const { data: adminUser, error } = await supabase
            .from('admin_users')
            .select('*')
            .eq('email', session.user.email)
            .eq('is_active', true)
            .single();

          if (error || !adminUser) {
            await supabase.auth.signOut();
            set({ user: null, isLoading: false });
            return;
          }

          set({ user: adminUser, isLoading: false });
        } catch (error) {
          console.error('Auth check failed:', error);
          set({ user: null, isLoading: false });
        }
      },
    }),
    {
      name: 'admin-auth-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
);

// 监听认证状态变化
supabase.auth.onAuthStateChange((event) => {
  if (event === 'SIGNED_OUT') {
    useAuthStore.getState().logout();
  }
});