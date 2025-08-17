import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useAuthStore } from '../authStore';
import { supabase } from '@/lib/supabase';

// Mock Supabase
vi.mock('@/lib/supabase');

// Mock error handler
vi.mock('@/utils/errorHandler', () => ({
  handleSupabaseError: vi.fn((error) => ({
    message: error.message || 'Unknown error',
  })),
}));

describe('authStore', () => {
  const mockSupabase = vi.mocked(supabase);

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset store state
    useAuthStore.setState({
      user: null,
      isLoading: false,
      isAuthenticated: false,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      const mockUser = {
        id: '1',
        email: 'admin@test.com',
        role: 'admin',
        name: 'Admin User',
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true,
      };

      // Mock successful auth
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: {
          user: { id: '1', email: 'admin@test.com' },
          session: { access_token: 'token' },
        },
        error: null,
      });

      // Mock successful admin user fetch
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockUser,
          error: null,
        }),
      } as any);

      const { login } = useAuthStore.getState();
      const result = await login('admin@test.com', 'password');

      expect(result.success).toBe(true);
      expect(useAuthStore.getState().user).toEqual(mockUser);
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
      expect(useAuthStore.getState().isLoading).toBe(false);
    });

    it('should handle authentication error', async () => {
      // Mock auth error
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid credentials' },
      });

      const { login } = useAuthStore.getState();
      const result = await login('admin@test.com', 'wrongpassword');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid credentials');
      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(useAuthStore.getState().isLoading).toBe(false);
    });

    it('should handle non-admin user', async () => {
      // Mock successful auth but no admin user
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: {
          user: { id: '1', email: 'user@test.com' },
          session: { access_token: 'token' },
        },
        error: null,
      });

      // Mock no admin user found
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      } as any);

      // Mock signOut
      mockSupabase.auth.signOut.mockResolvedValue({ error: null });

      const { login } = useAuthStore.getState();
      const result = await login('user@test.com', 'password');

      expect(result.success).toBe(false);
      expect(result.error).toBe('无效的管理员账户');
      expect(mockSupabase.auth.signOut).toHaveBeenCalled();
    });

    it('should handle network error', async () => {
      // Mock network error
      mockSupabase.auth.signInWithPassword.mockRejectedValue(
        new Error('Network error')
      );

      const { login } = useAuthStore.getState();
      const result = await login('admin@test.com', 'password');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
      expect(useAuthStore.getState().isLoading).toBe(false);
    });
  });

  describe('logout', () => {
    it('should successfully logout', async () => {
      // Set initial authenticated state
      useAuthStore.setState({
        user: {
          id: '1',
          email: 'admin@test.com',
          role: 'admin',
          name: 'Admin User',
          avatar_url: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_active: true,
        },
        isAuthenticated: true,
      });

      // Mock successful signOut
      mockSupabase.auth.signOut.mockResolvedValue({ error: null });

      const { logout } = useAuthStore.getState();
      await logout();

      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(mockSupabase.auth.signOut).toHaveBeenCalled();
    });
  });

  describe('checkAuth', () => {
    it('should set authenticated state when user exists', async () => {
      const mockUser = {
        id: '1',
        email: 'admin@test.com',
        role: 'admin',
        name: 'Admin User',
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true,
      };

      // Mock getUser
      mockSupabase.auth.getUser.mockResolvedValue({
        data: {
          user: { id: '1', email: 'admin@test.com' },
        },
        error: null,
      });

      // Mock admin user fetch
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockUser,
          error: null,
        }),
      } as any);

      const { checkAuth } = useAuthStore.getState();
      await checkAuth();

      expect(useAuthStore.getState().user).toEqual(mockUser);
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
      expect(useAuthStore.getState().isLoading).toBe(false);
    });

    it('should clear state when no user', async () => {
      // Mock no user
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const { checkAuth } = useAuthStore.getState();
      await checkAuth();

      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(useAuthStore.getState().isLoading).toBe(false);
    });
  });
});
