# 测试策略和覆盖范围文档

## 概述

本文档详细描述了CCPM360项目的测试策略，包括单元测试、集成测试、端到端测试的实施方案，以及测试覆盖范围和质量保证流程。

## 测试架构

### 测试金字塔

```
        E2E Tests (10%)
      ┌─────────────────┐
     │  端到端测试      │
    └─────────────────┘
   ┌─────────────────────┐
  │   Integration Tests  │ (20%)
 │     集成测试         │
└─────────────────────┘
┌─────────────────────────┐
│     Unit Tests          │ (70%)
│      单元测试           │
└─────────────────────────┘
```

### 测试工具栈

- **测试框架**: Vitest
- **React测试**: React Testing Library
- **端到端测试**: Playwright
- **覆盖率工具**: c8 (内置于Vitest)
- **Mock工具**: Vitest Mock Functions
- **测试数据**: MSW (Mock Service Worker)

## 单元测试策略

### 1. 组件测试

**目标**: 验证组件的渲染、交互和状态管理

```typescript
// src/components/__tests__/LoginForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { LoginForm } from '../LoginForm';
import { AuthProvider } from '@/contexts/AuthProvider';

// Mock认证服务
const mockLogin = vi.fn();
vi.mock('@/services/authService', () => ({
  authService: {
    login: mockLogin
  }
}));

describe('LoginForm', () => {
  const renderWithAuth = (component: React.ReactElement) => {
    return render(
      <AuthProvider>
        {component}
      </AuthProvider>
    );
  };

  beforeEach(() => {
    mockLogin.mockClear();
  });

  it('should render login form correctly', () => {
    renderWithAuth(<LoginForm />);

    expect(screen.getByLabelText(/邮箱/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/密码/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /登录/i })).toBeInTheDocument();
  });

  it('should show validation errors for empty fields', async () => {
    renderWithAuth(<LoginForm />);

    const submitButton = screen.getByRole('button', { name: /登录/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/邮箱地址不能为空/i)).toBeInTheDocument();
      expect(screen.getByText(/密码不能为空/i)).toBeInTheDocument();
    });
  });

  it('should call login service with correct credentials', async () => {
    mockLogin.mockResolvedValue({ user: { id: '1', email: 'test@example.com' } });

    renderWithAuth(<LoginForm />);

    const emailInput = screen.getByLabelText(/邮箱/i);
    const passwordInput = screen.getByLabelText(/密码/i);
    const submitButton = screen.getByRole('button', { name: /登录/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('should display error message on login failure', async () => {
    mockLogin.mockRejectedValue(new Error('Invalid credentials'));

    renderWithAuth(<LoginForm />);

    const emailInput = screen.getByLabelText(/邮箱/i);
    const passwordInput = screen.getByLabelText(/密码/i);
    const submitButton = screen.getByRole('button', { name: /登录/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/用户名或密码错误/i)).toBeInTheDocument();
    });
  });
});
```

### 2. Hook测试

**目标**: 验证自定义Hook的逻辑和状态管理

```typescript
// src/hooks/__tests__/useAsyncData.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { useAsyncData } from '../useAsyncData';
import { ErrorProvider } from '@/contexts/ErrorContext';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ErrorProvider>{children}</ErrorProvider>
);

describe('useAsyncData', () => {
  it('should handle successful data fetching', async () => {
    const mockData = { id: 1, name: 'Test' };
    const mockFetch = vi.fn().mockResolvedValue(mockData);

    const { result } = renderHook(
      () => useAsyncData(mockFetch),
      { wrapper }
    );

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe(null);

    // 执行异步操作
    await result.current.execute();

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.data).toEqual(mockData);
      expect(result.current.error).toBe(null);
    });
  });

  it('should handle error during data fetching', async () => {
    const mockError = new Error('Fetch failed');
    const mockFetch = vi.fn().mockRejectedValue(mockError);

    const { result } = renderHook(
      () => useAsyncData(mockFetch),
      { wrapper }
    );

    try {
      await result.current.execute();
    } catch (error) {
      // 预期会抛出错误
    }

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.data).toBe(null);
      expect(result.current.error).toBeTruthy();
    });
  });

  it('should show loading state during execution', async () => {
    const mockFetch = vi.fn().mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({}), 100))
    );

    const { result } = renderHook(
      () => useAsyncData(mockFetch),
      { wrapper }
    );

    const executePromise = result.current.execute();

    expect(result.current.loading).toBe(true);

    await executePromise;

    expect(result.current.loading).toBe(false);
  });
});
```

### 3. 工具函数测试

**目标**: 验证纯函数的输入输出正确性

```typescript
// src/utils/__tests__/errorHandler.test.ts
import { errorHandler, AppError } from '../errorHandler';

describe('errorHandler', () => {
  describe('handleApiError', () => {
    it('should return AppError as is', () => {
      const appError = new AppError('Test error', 400);
      const result = errorHandler.handleApiError(appError);

      expect(result).toBe(appError);
    });

    it('should convert Error to AppError', () => {
      const error = new Error('Test error');
      const result = errorHandler.handleApiError(error);

      expect(result).toBeInstanceOf(AppError);
      expect(result.message).toBe('Test error');
      expect(result.statusCode).toBe(500);
    });

    it('should handle unknown error types', () => {
      const result = errorHandler.handleApiError('string error');

      expect(result).toBeInstanceOf(AppError);
      expect(result.message).toBe('未知错误');
      expect(result.statusCode).toBe(500);
    });
  });

  describe('handleAuthError', () => {
    it('should handle invalid credentials error', () => {
      const error = new Error('Invalid login credentials');
      const result = errorHandler.handleAuthError(error);

      expect(result.message).toBe('用户名或密码错误');
      expect(result.statusCode).toBe(401);
    });

    it('should handle email not confirmed error', () => {
      const error = new Error('Email not confirmed');
      const result = errorHandler.handleAuthError(error);

      expect(result.message).toBe('请先验证您的邮箱');
      expect(result.statusCode).toBe(401);
    });

    it('should handle generic auth errors', () => {
      const error = new Error('Some auth error');
      const result = errorHandler.handleAuthError(error);

      expect(result.message).toBe('认证失败');
      expect(result.statusCode).toBe(401);
    });
  });
});
```

## 集成测试策略

### 1. API集成测试

**目标**: 验证前端与后端API的集成

```typescript
// src/services/__tests__/authService.integration.test.ts
import { authService } from '../authService';
import { setupServer } from 'msw/node';
import { rest } from 'msw';

// 模拟API服务器
const server = setupServer(
  rest.post('/auth/login', (req, res, ctx) => {
    const { email, password } = req.body as any;

    if (email === 'admin@example.com' && password === 'password123') {
      return res(
        ctx.json({
          user: {
            id: '1',
            email: 'admin@example.com',
            name: 'Admin User',
          },
          session: {
            access_token: 'mock-token',
            refresh_token: 'mock-refresh-token',
          },
        })
      );
    }

    return res(
      ctx.status(401),
      ctx.json({ error: 'Invalid login credentials' })
    );
  }),

  rest.post('/auth/logout', (req, res, ctx) => {
    return res(ctx.status(200));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('authService Integration', () => {
  it('should login successfully with valid credentials', async () => {
    const result = await authService.login('admin@example.com', 'password123');

    expect(result.user).toEqual({
      id: '1',
      email: 'admin@example.com',
      name: 'Admin User',
    });
    expect(result.session.access_token).toBe('mock-token');
  });

  it('should throw error with invalid credentials', async () => {
    await expect(
      authService.login('admin@example.com', 'wrongpassword')
    ).rejects.toThrow('Invalid login credentials');
  });

  it('should logout successfully', async () => {
    await expect(authService.logout()).resolves.not.toThrow();
  });
});
```

### 2. 组件集成测试

**目标**: 验证多个组件协同工作

```typescript
// src/pages/__tests__/AdminDashboard.integration.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AdminDashboard } from '../admin/dashboard';
import { AuthProvider } from '@/contexts/AuthProvider';
import { ErrorProvider } from '@/contexts/ErrorContext';

const AllProviders = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <ErrorProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </ErrorProvider>
  </BrowserRouter>
);

describe('AdminDashboard Integration', () => {
  it('should render dashboard with user data', async () => {
    render(
      <AllProviders>
        <AdminDashboard />
      </AllProviders>
    );

    await waitFor(() => {
      expect(screen.getByText(/管理后台/i)).toBeInTheDocument();
      expect(screen.getByText(/欢迎回来/i)).toBeInTheDocument();
    });
  });

  it('should redirect to login when not authenticated', async () => {
    // Mock未认证状态
    const mockPush = vi.fn();
    vi.mock('next/navigation', () => ({
      useRouter: () => ({ push: mockPush })
    }));

    render(
      <AllProviders>
        <AdminDashboard />
      </AllProviders>
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/admin/login');
    });
  });
});
```

## 端到端测试策略

### 1. 用户流程测试

**目标**: 验证完整的用户操作流程

```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should complete login flow successfully', async ({ page }) => {
    // 访问登录页面
    await page.goto('/admin/login');

    // 验证页面元素
    await expect(page.getByRole('heading', { name: /登录/i })).toBeVisible();
    await expect(page.getByLabel(/邮箱/i)).toBeVisible();
    await expect(page.getByLabel(/密码/i)).toBeVisible();

    // 填写登录表单
    await page.getByLabel(/邮箱/i).fill('admin@example.com');
    await page.getByLabel(/密码/i).fill('password123');

    // 提交表单
    await page.getByRole('button', { name: /登录/i }).click();

    // 验证重定向到管理后台
    await expect(page).toHaveURL('/admin/dashboard');
    await expect(page.getByText(/管理后台/i)).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/admin/login');

    await page.getByLabel(/邮箱/i).fill('admin@example.com');
    await page.getByLabel(/密码/i).fill('wrongpassword');
    await page.getByRole('button', { name: /登录/i }).click();

    // 验证错误消息
    await expect(page.getByText(/用户名或密码错误/i)).toBeVisible();

    // 确保仍在登录页面
    await expect(page).toHaveURL('/admin/login');
  });

  test('should logout successfully', async ({ page }) => {
    // 先登录
    await page.goto('/admin/login');
    await page.getByLabel(/邮箱/i).fill('admin@example.com');
    await page.getByLabel(/密码/i).fill('password123');
    await page.getByRole('button', { name: /登录/i }).click();

    await expect(page).toHaveURL('/admin/dashboard');

    // 执行登出
    await page.getByRole('button', { name: /退出/i }).click();

    // 验证重定向到登录页面
    await expect(page).toHaveURL('/admin/login');
  });
});
```

### 2. 响应式设计测试

```typescript
// tests/e2e/responsive.spec.ts
import { test, expect, devices } from '@playwright/test';

const viewports = [
  { name: 'Desktop', ...devices['Desktop Chrome'] },
  { name: 'Tablet', ...devices['iPad'] },
  { name: 'Mobile', ...devices['iPhone 12'] },
];

viewports.forEach(({ name, ...device }) => {
  test.describe(`Responsive Design - ${name}`, () => {
    test.use(device);

    test('should display navigation correctly', async ({ page }) => {
      await page.goto('/');

      if (name === 'Mobile') {
        // 移动端应显示汉堡菜单
        await expect(page.getByRole('button', { name: /菜单/i })).toBeVisible();
      } else {
        // 桌面端应显示完整导航
        await expect(page.getByRole('navigation')).toBeVisible();
        await expect(page.getByText(/首页/i)).toBeVisible();
        await expect(page.getByText(/服务/i)).toBeVisible();
      }
    });

    test('should handle form layout correctly', async ({ page }) => {
      await page.goto('/contact');

      const form = page.getByRole('form');
      await expect(form).toBeVisible();

      // 验证表单在不同设备上的布局
      const formBounds = await form.boundingBox();
      expect(formBounds?.width).toBeGreaterThan(0);
    });
  });
});
```

## 测试覆盖范围

### 覆盖率目标

- **语句覆盖率**: ≥ 80%
- **分支覆盖率**: ≥ 75%
- **函数覆盖率**: ≥ 85%
- **行覆盖率**: ≥ 80%

### 关键测试区域

#### 1. 认证模块 (100%覆盖)

- 登录/登出流程
- 权限验证
- 会话管理
- 错误处理

#### 2. 核心业务逻辑 (≥90%覆盖)

- 数据获取和处理
- 表单验证
- 状态管理
- API交互

#### 3. UI组件 (≥80%覆盖)

- 组件渲染
- 用户交互
- 状态变化
- 错误边界

#### 4. 工具函数 (100%覆盖)

- 数据转换
- 验证函数
- 错误处理
- 格式化函数

## 测试配置

### Vitest配置

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'c8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/coverage/**',
      ],
      thresholds: {
        global: {
          statements: 80,
          branches: 75,
          functions: 85,
          lines: 80,
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### 测试环境设置

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock环境变量
vi.mock('process', () => ({
  env: {
    NODE_ENV: 'test',
    NEXT_PUBLIC_SUPABASE_URL: 'http://localhost:54321',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-key',
  },
}));

// Mock Next.js路由
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/test-path',
}));

// Mock Supabase客户端
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
    })),
  },
}));

// 全局测试工具
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

global.matchMedia = vi.fn().mockImplementation((query) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));
```

### Playwright配置

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

## 持续集成测试

### GitHub Actions配置

```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test:coverage

      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/coverage-final.json

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

## 测试最佳实践

### 1. 测试命名规范

```typescript
// 好的测试命名
describe('LoginForm', () => {
  it('should display validation error when email is empty', () => {});
  it('should call onSubmit with correct data when form is valid', () => {});
  it('should disable submit button while loading', () => {});
});

// 避免的测试命名
describe('LoginForm', () => {
  it('test 1', () => {});
  it('should work', () => {});
  it('email validation', () => {});
});
```

### 2. 测试结构 (AAA模式)

```typescript
it('should update user profile successfully', async () => {
  // Arrange - 准备测试数据和环境
  const mockUser = { id: '1', name: 'John Doe', email: 'john@example.com' };
  const mockUpdateUser = vi.fn().mockResolvedValue(mockUser);

  render(
    <UserProfile user={mockUser} onUpdate={mockUpdateUser} />
  );

  // Act - 执行被测试的操作
  const nameInput = screen.getByLabelText(/姓名/i);
  fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });
  fireEvent.click(screen.getByRole('button', { name: /保存/i }));

  // Assert - 验证结果
  await waitFor(() => {
    expect(mockUpdateUser).toHaveBeenCalledWith({
      ...mockUser,
      name: 'Jane Doe'
    });
  });
});
```

### 3. Mock策略

```typescript
// 模块级别的Mock
vi.mock('@/services/apiService', () => ({
  fetchUserData: vi.fn(),
  updateUserData: vi.fn()
}));

// 测试特定的Mock
it('should handle API error gracefully', async () => {
  const mockFetchUserData = vi.mocked(fetchUserData);
  mockFetchUserData.mockRejectedValue(new Error('API Error'));

  render(<UserProfile userId="1" />);

  await waitFor(() => {
    expect(screen.getByText(/加载失败/i)).toBeInTheDocument();
  });
});
```

### 4. 测试数据管理

```typescript
// src/test/fixtures/user.ts
export const createMockUser = (overrides = {}) => ({
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  role: 'user',
  createdAt: '2023-01-01T00:00:00Z',
  ...overrides
});

export const createMockAdmin = (overrides = {}) => ({
  ...createMockUser(),
  role: 'admin',
  permissions: ['read', 'write', 'delete'],
  ...overrides
});

// 使用示例
it('should display admin controls for admin users', () => {
  const adminUser = createMockAdmin({ name: 'Admin User' });

  render(<UserProfile user={adminUser} />);

  expect(screen.getByText(/管理员控制面板/i)).toBeInTheDocument();
});
```

## 性能测试

### 1. 组件渲染性能

```typescript
// src/components/__tests__/performance/DataTable.perf.test.tsx
import { render } from '@testing-library/react';
import { DataTable } from '../DataTable';
import { createMockData } from '@/test/fixtures/data';

describe('DataTable Performance', () => {
  it('should render large dataset within acceptable time', () => {
    const largeDataset = createMockData(1000);

    const startTime = performance.now();
    render(<DataTable data={largeDataset} />);
    const endTime = performance.now();

    const renderTime = endTime - startTime;
    expect(renderTime).toBeLessThan(100); // 100ms内完成渲染
  });

  it('should not cause memory leaks on unmount', () => {
    const { unmount } = render(<DataTable data={[]} />);

    const initialMemory = performance.memory?.usedJSHeapSize || 0;

    // 多次挂载和卸载
    for (let i = 0; i < 100; i++) {
      const { unmount: unmountInstance } = render(<DataTable data={[]} />);
      unmountInstance();
    }

    // 强制垃圾回收（如果支持）
    if (global.gc) {
      global.gc();
    }

    const finalMemory = performance.memory?.usedJSHeapSize || 0;
    const memoryIncrease = finalMemory - initialMemory;

    // 内存增长应该在合理范围内
    expect(memoryIncrease).toBeLessThan(1024 * 1024); // 1MB
  });
});
```

## 测试报告和监控

### 1. 覆盖率报告

```bash
# 生成详细的覆盖率报告
npm run test:coverage

# 查看HTML报告
open coverage/index.html
```

### 2. 测试结果监控

```typescript
// scripts/test-monitor.js
const fs = require('fs');
const path = require('path');

class TestMonitor {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      coverage: {},
      performance: {},
      failures: []
    };
  }

  parseCoverageReport() {
    const coveragePath = path.join(__dirname, '../coverage/coverage-summary.json');
    if (fs.existsSync(coveragePath)) {
      const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
      this.results.coverage = coverage.total;
    }
  }

  checkCoverageThresholds() {
    const { statements, branches, functions, lines } = this.results.coverage;

    const thresholds = {
      statements: 80,
      branches: 75,
      functions: 85,
      lines: 80
    };

    const failures = [];

    Object.entries(thresholds).forEach(([metric, threshold]) => {
      const actual = this.results.coverage[metric]?.pct || 0;
      if (actual < threshold) {
        failures.push({
          metric,
          expected: threshold,
          actual,
          message: `${metric} coverage ${actual}% is below threshold ${threshold}%`
        });
      }
    });

    this.results.failures = failures;
    return failures.length === 0;
  }

  generateReport() {
    const reportPath = path.join(__dirname, '../test-results.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));

    console.log('\
```
