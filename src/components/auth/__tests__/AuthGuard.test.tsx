import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthGuard } from '../AuthGuard';
import { ErrorProvider } from '@/contexts/ErrorContext';
import { useAuth } from '@/contexts/AuthProvider';

// Mock the auth context
vi.mock('@/contexts/AuthProvider', () => ({
  useAuth: vi.fn(),
  AuthProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/admin/dashboard',
}));

// Mock child component
const MockChild = () => (
  <div data-testid="protected-content">Protected Content</div>
);

// Test wrapper with providers
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ErrorProvider>{children}</ErrorProvider>
);

describe('AuthGuard', () => {
  const mockUseAuth = vi.mocked(useAuth);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state when authentication is loading', () => {
    mockUseAuth.mockReturnValue({
      isLoading: true,
      user: null,
      checkAuth: vi.fn(),
    });

    render(
      <TestWrapper>
        <AuthGuard>
          <MockChild />
        </AuthGuard>
      </TestWrapper>
    );

    expect(screen.getByText('正在验证您的登录状态...')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('should not render children when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({
      isLoading: false,
      user: null,
      checkAuth: vi.fn(),
    });

    render(
      <TestWrapper>
        <AuthGuard>
          <MockChild />
        </AuthGuard>
      </TestWrapper>
    );

    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('should render children when user is authenticated', () => {
    mockUseAuth.mockReturnValue({
      isLoading: false,
      user: {
        id: '1',
        email: 'admin@test.com',
        role: 'admin' as const,
        name: 'Admin User',
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true,
      },
      checkAuth: vi.fn(),
    });

    render(
      <TestWrapper>
        <AuthGuard>
          <MockChild />
        </AuthGuard>
      </TestWrapper>
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    expect(screen.queryByText('管理员登录')).not.toBeInTheDocument();
  });

  it('should show access denied when user lacks required role', () => {
    mockUseAuth.mockReturnValue({
      isLoading: false,
      user: {
        id: '1',
        email: 'user@test.com',
        role: 'user' as const,
        name: 'Regular User',
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_active: true,
      },
      checkAuth: vi.fn(),
    });

    render(
      <TestWrapper>
        <AuthGuard allowedRoles={['admin']}>
          <MockChild />
        </AuthGuard>
      </TestWrapper>
    );

    expect(screen.getByText('访问被拒绝')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('should call checkAuth on mount', async () => {
    const mockCheckAuth = vi.fn();
    mockUseAuth.mockReturnValue({
      isLoading: false,
      user: null,
      checkAuth: mockCheckAuth,
    });

    render(
      <TestWrapper>
        <AuthGuard>
          <MockChild />
        </AuthGuard>
      </TestWrapper>
    );

    await waitFor(() => {
      expect(mockCheckAuth).toHaveBeenCalled();
    });
  });
});
