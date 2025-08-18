import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary, withErrorBoundary } from '../ErrorBoundary';

// Mock console to avoid noise in tests
const originalConsoleError = console.error;
beforeEach(() => {
  console.error = vi.fn();
});

afterEach(() => {
  console.error = originalConsoleError;
});

// Component that throws an error
const ThrowError = ({ shouldThrow = false }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div data-testid="no-error">No Error</div>;
};

// Component that works normally
const WorkingComponent = () => (
  <div data-testid="working">Working Component</div>
);

describe('ErrorBoundary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render children when there is no error', () => {
    render(
      <ErrorBoundary>
        <WorkingComponent />
      </ErrorBoundary>
    );

    expect(screen.getByTestId('working')).toBeInTheDocument();
  });

  it('should render error UI when child component throws', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('出现了一些问题')).toBeInTheDocument();
    expect(
      screen.getByText(
        '应用程序遇到了意外错误。我们已经记录了这个问题，请稍后重试。'
      )
    ).toBeInTheDocument();
    expect(screen.getByText('重试')).toBeInTheDocument();
    expect(screen.getByText('返回首页')).toBeInTheDocument();
  });

  it('should render custom fallback when provided', () => {
    const customFallback = (
      <div data-testid="custom-fallback">Custom Error UI</div>
    );

    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
    expect(screen.getByText('Custom Error UI')).toBeInTheDocument();
  });

  it('should call onError callback when error occurs', () => {
    const onError = vi.fn();

    render(
      <ErrorBoundary onError={onError}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String),
      })
    );
  });

  it('should have retry button that can be clicked', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    // Error UI should be visible
    expect(screen.getByText('出现了一些问题')).toBeInTheDocument();

    // Retry button should be present and clickable
    const retryButton = screen.getByText('重试');
    expect(retryButton).toBeInTheDocument();

    // Should not throw when clicked
    expect(() => fireEvent.click(retryButton)).not.toThrow();
  });

  it('should navigate to home when home button is clicked', () => {
    // Mock window.location
    const mockLocation = {
      href: '',
      assign: vi.fn(),
      replace: vi.fn(),
      reload: vi.fn(),
    };
    Object.defineProperty(window, 'location', {
      value: mockLocation,
      writable: true,
    });

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    fireEvent.click(screen.getByText('返回首页'));

    expect(mockLocation.href).toBe('/');
  });

  it('should show error details in development mode', () => {
    const originalEnv = process.env['NODE_ENV'];
    process.env['NODE_ENV'] = 'development';

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('错误详情：')).toBeInTheDocument();
    expect(screen.getByText('Test error')).toBeInTheDocument();
    expect(screen.getByText('查看堆栈跟踪')).toBeInTheDocument();

    process.env['NODE_ENV'] = originalEnv;
  });

  it('should not show error details in production mode', () => {
    const originalEnv = process.env['NODE_ENV'];
    process.env['NODE_ENV'] = 'production';

    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.queryByText('错误详情：')).not.toBeInTheDocument();
    expect(screen.queryByText('Test error')).not.toBeInTheDocument();

    process.env['NODE_ENV'] = originalEnv;
  });
});

describe('withErrorBoundary', () => {
  it('should wrap component with ErrorBoundary', () => {
    const WrappedComponent = withErrorBoundary(WorkingComponent);

    render(<WrappedComponent />);

    expect(screen.getByTestId('working')).toBeInTheDocument();
  });

  it('should handle errors in wrapped component', () => {
    const WrappedComponent = withErrorBoundary(ThrowError);

    render(<WrappedComponent shouldThrow={true} />);

    expect(screen.getByText('出现了一些问题')).toBeInTheDocument();
  });

  it('should use custom fallback and onError', () => {
    const customFallback = <div data-testid="hoc-fallback">HOC Error UI</div>;
    const onError = vi.fn();
    const WrappedComponent = withErrorBoundary(
      ThrowError,
      customFallback,
      onError
    );

    render(<WrappedComponent shouldThrow={true} />);

    expect(screen.getByTestId('hoc-fallback')).toBeInTheDocument();
    expect(onError).toHaveBeenCalled();
  });
});
