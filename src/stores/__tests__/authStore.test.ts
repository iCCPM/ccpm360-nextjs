import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useAuthStore } from '../authStore';
import { AuthService } from '@/services/authService';

// Mock AuthService
vi.mock('@/services/authService', () => ({
  AuthService: {
    login: vi.fn(),
    logout: vi.fn(),
    getCurrentUser: vi.fn(),
    onAuthStateChange: vi.fn(() => ({ data: {} })),
  },
}));

describe('authStore', () => {
  const mockAuthService = vi.mocked(AuthService);

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset store state
    useAuthStore.setState({
      user: null,
      isLoading: false,
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
        role: 'admin' as const,
        name: 'Admin User',
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true,
      };

      // Mock successful login
      mockAuthService.login.mockResolvedValue({
        success: true,
        user: mockUser,
      });

      const { login } = useAuthStore.getState();
      const result = await login('admin@test.com', 'password');

      expect(result.success).toBe(true);
      expect(useAuthStore.getState().user).toEqual(mockUser);
      expect(useAuthStore.getState().isLoading).toBe(false);
      expect(mockAuthService.login).toHaveBeenCalledWith(
        'admin@test.com',
        'password'
      );
    });

    it('should handle authentication error', async () => {
      // Mock login error
      mockAuthService.login.mockResolvedValue({
        success: false,
        error: 'Invalid credentials',
      });

      const { login } = useAuthStore.getState();
      const result = await login('admin@test.com', 'wrongpassword');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid credentials');
      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().isLoading).toBe(false);
      expect(mockAuthService.login).toHaveBeenCalledWith(
        'admin@test.com',
        'wrongpassword'
      );
    });

    it('should handle non-admin user', async () => {
      // Mock login failure for non-admin user
      mockAuthService.login.mockResolvedValue({
        success: false,
        error: '您没有管理员权限',
      });

      const { login } = useAuthStore.getState();
      const result = await login('user@test.com', 'password');

      expect(result.success).toBe(false);
      expect(result.error).toBe('您没有管理员权限');
      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().isLoading).toBe(false);
      expect(mockAuthService.login).toHaveBeenCalledWith(
        'user@test.com',
        'password'
      );
    });

    it('should handle network error', async () => {
      // Mock network error
      mockAuthService.login.mockRejectedValue(new Error('Network error'));

      const { login } = useAuthStore.getState();

      // Expect the login method to throw the error
      await expect(login('admin@test.com', 'password')).rejects.toThrow(
        'Network error'
      );

      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().isLoading).toBe(false);
      expect(mockAuthService.login).toHaveBeenCalledWith(
        'admin@test.com',
        'password'
      );
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

      // Mock successful logout
      mockAuthService.logout.mockResolvedValue();

      const { logout } = useAuthStore.getState();
      await logout();

      expect(useAuthStore.getState().user).toBeNull();
      expect(mockAuthService.logout).toHaveBeenCalled();
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

      // Mock getCurrentUser
      mockAuthService.getCurrentUser.mockResolvedValue(mockUser);

      const { checkAuth } = useAuthStore.getState();
      await checkAuth();

      expect(useAuthStore.getState().user).toEqual(mockUser);
      expect(useAuthStore.getState().isLoading).toBe(false);
    });

    it('should clear state when no user', async () => {
      // Mock no user
      mockAuthService.getCurrentUser.mockResolvedValue(null);

      const { checkAuth } = useAuthStore.getState();
      await checkAuth();

      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().isLoading).toBe(false);
    });
  });
});
