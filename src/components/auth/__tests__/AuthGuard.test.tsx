import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthGuard } from '../AuthGuard';
import { useAuthStore } from '@/stores/authStore';

// Mock the auth store
vi.mock('@/stores/authStore');

// Mock child component
const MockChild = () => (
  <div data-testid="protected-content">Protected Content</div>
);

describe('AuthGuard', () => {
  const mockUseAuthStore = vi.mocked(useAuthStore);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state when authentication is loading', () => {
    mockUseAuthStore.mockReturnValue({
      isLoading: true,
      user: null,
      isAuthenticated: false,
      login: vi.fn(),
      logout: vi.fn(),
      checkAuth: vi.fn(),
    });

    render(
      <AuthGuard>
        <MockChild />
      </AuthGuard>
    );

    expect(screen.getByText('正在验证登录状态...')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('should not render children when user is not authenticated', () => {
    mockUseAuthStore.mockReturnValue({
      isLoading: false,
      user: null,
      isAuthenticated: false,
      login: vi.fn(),
      logout: vi.fn(),
      checkAuth: vi.fn(),
    });

    render(
      <AuthGuard>
        <MockChild />
      </AuthGuard>
    );

    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('should render children when user is authenticated', () => {
    mockUseAuthStore.mockReturnValue({
      isLoading: false,
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
      login: vi.fn(),
      logout: vi.fn(),
      checkAuth: vi.fn(),
    });

    render(
      <AuthGuard>
        <MockChild />
      </AuthGuard>
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    expect(screen.queryByText('管理员登录')).not.toBeInTheDocument();
  });

  it('should render access denied for insufficient role', () => {
    mockUseAuthStore.mockReturnValue({
      isLoading: false,
      user: {
        id: '1',
        email: 'user@test.com',
        role: 'user',
        name: 'Regular User',
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true,
      },
      isAuthenticated: true,
      login: vi.fn(),
      logout: vi.fn(),
      checkAuth: vi.fn(),
    });

    render(
      <AuthGuard allowedRoles={['super_admin']}>
        <MockChild />
      </AuthGuard>
    );

    expect(screen.getByText('访问被拒绝')).toBeInTheDocument();
    expect(screen.getByText('您没有权限访问此页面')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('should call checkAuth on mount', () => {
    const mockCheckAuth = vi.fn();
    mockUseAuthStore.mockReturnValue({
      isLoading: false,
      user: null,
      isAuthenticated: false,
      login: vi.fn(),
      logout: vi.fn(),
      checkAuth: mockCheckAuth,
    });

    render(
      <AuthGuard>
        <MockChild />
      </AuthGuard>
    );

    expect(mockCheckAuth).toHaveBeenCalledOnce();
  });
});
