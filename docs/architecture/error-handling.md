# 错误处理机制文档

## 概述

本文档详细描述了CCPM360项目中实现的统一错误处理机制，包括全局错误边界、Toast通知系统、错误监控和日志记录等组件。

## 错误处理架构

### 1. 全局错误边界 (Error Boundary)

**文件位置**: `src/components/error/ErrorBoundary.tsx`

```typescript
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<PropsWithChildren, ErrorBoundaryState> {
  constructor(props: PropsWithChildren) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 记录错误到监控系统
    this.logErrorToService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

**核心功能**：

- 捕获React组件树中的JavaScript错误
- 显示友好的错误回退UI
- 记录错误信息到监控系统
- 防止整个应用崩溃

### 2. 错误上下文 (Error Context)

**文件位置**: `src/contexts/ErrorContext.tsx`

```typescript
interface ErrorContextType {
  showError: (message: string, details?: string) => void;
  showSuccess: (message: string) => void;
  showWarning: (message: string) => void;
  clearErrors: () => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export function ErrorProvider({ children }: { children: ReactNode }) {
  const showError = useCallback((message: string, details?: string) => {
    toast.error(message, {
      description: details,
      duration: 5000,
    });

    // 记录错误到日志系统
    logger.error(message, { details });
  }, []);

  const showSuccess = useCallback((message: string) => {
    toast.success(message);
  }, []);

  const showWarning = useCallback((message: string) => {
    toast.warning(message);
  }, []);

  const clearErrors = useCallback(() => {
    toast.dismiss();
  }, []);

  return (
    <ErrorContext.Provider value={{ showError, showSuccess, showWarning, clearErrors }}>
      {children}
    </ErrorContext.Provider>
  );
}
```

**核心功能**：

- 提供统一的错误通知接口
- 支持不同类型的消息（错误、成功、警告）
- 集成Toast通知系统
- 自动记录错误日志

### 3. 错误处理工具 (Error Handler)

**文件位置**: `src/utils/errorHandler.ts`

```typescript
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = {
  // API错误处理
  handleApiError: (error: unknown): AppError => {
    if (error instanceof AppError) {
      return error;
    }

    if (error instanceof Error) {
      return new AppError(error.message, 500);
    }

    return new AppError('未知错误', 500);
  },

  // 认证错误处理
  handleAuthError: (error: unknown): AppError => {
    if (error instanceof Error) {
      if (error.message.includes('Invalid login credentials')) {
        return new AppError('用户名或密码错误', 401);
      }
      if (error.message.includes('Email not confirmed')) {
        return new AppError('请先验证您的邮箱', 401);
      }
    }

    return new AppError('认证失败', 401);
  },

  // 网络错误处理
  handleNetworkError: (error: unknown): AppError => {
    return new AppError('网络连接失败，请检查您的网络设置', 0);
  },

  // 表单验证错误处理
  handleValidationError: (errors: Record<string, string[]>): AppError => {
    const firstError = Object.values(errors)[0]?.[0];
    return new AppError(firstError || '表单验证失败', 400);
  },
};
```

**核心功能**：

- 定义统一的错误类型
- 提供特定场景的错误处理方法
- 标准化错误信息格式
- 支持错误分类和状态码

### 4. 异步数据处理钩子

**文件位置**: `src/hooks/useAsyncData.ts`

```typescript
interface UseAsyncDataOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: AppError) => void;
  showErrorToast?: boolean;
  showSuccessToast?: boolean;
  successMessage?: string;
}

export function useAsyncData<T>(
  asyncFunction: () => Promise<T>,
  options: UseAsyncDataOptions<T> = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AppError | null>(null);
  const { showError, showSuccess } = useError();

  const execute = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await asyncFunction();
      setData(result);

      if (options.showSuccessToast && options.successMessage) {
        showSuccess(options.successMessage);
      }

      options.onSuccess?.(result);
      return result;
    } catch (err) {
      const appError = errorHandler.handleApiError(err);
      setError(appError);

      if (options.showErrorToast !== false) {
        showError(appError.message);
      }

      options.onError?.(appError);
      throw appError;
    } finally {
      setLoading(false);
    }
  }, [asyncFunction, options, showError, showSuccess]);

  return { data, loading, error, execute };
}
```

**核心功能**：

- 统一处理异步操作的加载状态
- 自动错误捕获和处理
- 可配置的成功/错误通知
- 提供重试机制

## 错误分类和处理策略

### 1. 用户输入错误

**特征**：表单验证失败、输入格式错误
**处理策略**：

- 实时表单验证
- 友好的错误提示
- 高亮错误字段
- 不记录到错误监控

```typescript
// 表单验证示例
const validateForm = (data: FormData) => {
  const errors: Record<string, string> = {};

  if (!data.email) {
    errors.email = '邮箱地址不能为空';
  } else if (!isValidEmail(data.email)) {
    errors.email = '请输入有效的邮箱地址';
  }

  if (Object.keys(errors).length > 0) {
    throw errorHandler.handleValidationError(errors);
  }
};
```

### 2. 网络和API错误

**特征**：网络连接失败、服务器错误、API响应错误
**处理策略**：

- 自动重试机制
- 降级处理
- 缓存回退
- 记录到监控系统

```typescript
// API错误处理示例
const apiCall = async (url: string, options: RequestInit) => {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      throw new AppError(
        `API请求失败: ${response.statusText}`,
        response.status
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof TypeError) {
      throw errorHandler.handleNetworkError(error);
    }
    throw errorHandler.handleApiError(error);
  }
};
```

### 3. 认证和授权错误

**特征**：登录失败、权限不足、会话过期
**处理策略**：

- 自动重定向到登录页
- 清除本地认证状态
- 友好的权限提示
- 记录安全事件

```typescript
// 认证错误处理示例
const handleAuthError = (error: AppError) => {
  if (error.statusCode === 401) {
    // 清除认证状态
    authService.logout();
    // 重定向到登录页
    router.push('/admin/login');
    // 显示提示
    showError('登录已过期，请重新登录');
  } else if (error.statusCode === 403) {
    showError('您没有权限执行此操作');
  }
};
```

### 4. 系统错误

**特征**：代码错误、未处理的异常、第三方服务故障
**处理策略**：

- 错误边界捕获
- 回退UI显示
- 详细错误记录
- 自动错误报告

```typescript
// 系统错误处理示例
const logSystemError = (error: Error, errorInfo: ErrorInfo) => {
  // 记录到监控系统
  logger.error('System Error', {
    message: error.message,
    stack: error.stack,
    componentStack: errorInfo.componentStack,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
  });

  // 发送到错误监控服务
  if (process.env.NODE_ENV === 'production') {
    errorMonitoring.captureException(error, {
      extra: errorInfo,
    });
  }
};
```

## 错误监控和日志

### 1. 日志系统

```typescript
// src/utils/logger.ts
class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  error(message: string, meta?: Record<string, any>) {
    const logEntry = {
      level: 'error',
      message,
      meta,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    if (this.isDevelopment) {
      console.error(message, meta);
    }

    // 发送到日志服务
    this.sendToLogService(logEntry);
  }

  warn(message: string, meta?: Record<string, any>) {
    // 类似实现
  }

  info(message: string, meta?: Record<string, any>) {
    // 类似实现
  }
}

export const logger = new Logger();
```

### 2. 性能监控

```typescript
// 性能错误监控
const monitorPerformance = () => {
  // 监控长任务
  if ('PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.duration > 50) {
          logger.warn('Long Task Detected', {
            duration: entry.duration,
            startTime: entry.startTime,
          });
        }
      });
    });

    observer.observe({ entryTypes: ['longtask'] });
  }
};
```

## 用户体验优化

### 1. 错误回退UI

```typescript
// src/components/error/ErrorFallback.tsx
interface ErrorFallbackProps {
  error?: Error;
  resetError?: () => void;
}

export function ErrorFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <div className="flex items-center mb-4">
          <AlertTriangle className="h-8 w-8 text-red-500 mr-3" />
          <h1 className="text-xl font-semibold text-gray-900">
            出现了一些问题
          </h1>
        </div>

        <p className="text-gray-600 mb-6">
          我们遇到了一个意外错误。请尝试刷新页面，如果问题持续存在，请联系技术支持。
        </p>

        {process.env.NODE_ENV === 'development' && error && (
          <details className="mb-4">
            <summary className="cursor-pointer text-sm text-gray-500">
              错误详情
            </summary>
            <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
              {error.message}\n{error.stack}
            </pre>
          </details>
        )}

        <div className="flex space-x-3">
          <button
            onClick={() => window.location.reload()}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            刷新页面
          </button>

          {resetError && (
            <button
              onClick={resetError}
              className="flex-1 bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700"
            >
              重试
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
```

### 2. 加载状态处理

```typescript
// src/components/ui/LoadingSpinner.tsx
export function LoadingSpinner({ message = '加载中...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
      <p className="text-gray-600">{message}</p>
    </div>
  );
}

// 使用示例
function DataComponent() {
  const { data, loading, error, execute } = useAsyncData(
    () => fetchData(),
    {
      showErrorToast: true,
      showSuccessToast: true,
      successMessage: '数据加载成功'
    }
  );

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorFallback error={error} resetError={execute} />;

  return <div>{/* 渲染数据 */}</div>;
}
```

## 最佳实践

### 1. 错误处理原则

- **用户优先**：始终考虑用户体验，提供清晰的错误信息
- **渐进增强**：从基本功能开始，逐步添加错误处理
- **防御性编程**：假设任何操作都可能失败
- **快速失败**：尽早发现和处理错误

### 2. 错误信息设计

- **清晰明确**：使用用户能理解的语言
- **可操作**：提供解决问题的建议
- **适当详细**：开发环境显示详细信息，生产环境简化
- **一致性**：保持错误信息的格式和风格统一

### 3. 错误记录策略

- **分级记录**：根据错误严重程度选择记录级别
- **上下文信息**：记录足够的上下文帮助调试
- **隐私保护**：避免记录敏感用户信息
- **性能考虑**：避免错误记录影响应用性能

## 测试策略

### 1. 错误边界测试

```typescript
// __tests__/ErrorBoundary.test.tsx
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';

const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

describe('ErrorBoundary', () => {
  it('should catch and display error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText(/出现了一些问题/)).toBeInTheDocument();
  });

  it('should render children when no error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
  });
});
```

### 2. 错误处理函数测试

```typescript
// __tests__/errorHandler.test.ts
import { errorHandler, AppError } from '@/utils/errorHandler';

describe('errorHandler', () => {
  describe('handleApiError', () => {
    it('should handle AppError correctly', () => {
      const originalError = new AppError('Test error', 400);
      const result = errorHandler.handleApiError(originalError);

      expect(result).toBe(originalError);
    });

    it('should convert Error to AppError', () => {
      const originalError = new Error('Test error');
      const result = errorHandler.handleApiError(originalError);

      expect(result).toBeInstanceOf(AppError);
      expect(result.message).toBe('Test error');
      expect(result.statusCode).toBe(500);
    });
  });
});
```

## 故障排除

### 常见问题

1. **错误边界不工作**
   - 检查是否使用类组件
   - 确认错误发生在render阶段
   - 验证错误边界的位置

2. **Toast通知不显示**
   - 检查ErrorProvider是否正确包装应用
   - 验证toast库的配置
   - 确认CSS样式加载

3. **错误日志缺失**
   - 检查网络连接
   - 验证日志服务配置
   - 确认环境变量设置

### 调试技巧

1. **使用浏览器开发工具**
   - Console面板查看错误信息
   - Network面板检查API请求
   - Application面板查看本地存储

2. **添加调试日志**

```typescript
const debugError = (error: Error, context: string) => {
  if (process.env.NODE_ENV === 'development') {
    console.group(`🐛 Error in ${context}`);
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    console.groupEnd();
  }
};
```

## 总结

统一的错误处理机制为CCPM360项目提供了：

- **稳定性**：防止应用崩溃，提供优雅的错误恢复
- **可观测性**：全面的错误监控和日志记录
- **用户体验**：友好的错误提示和回退界面
- **开发效率**：标准化的错误处理流程

通过这套机制，我们能够快速定位和解决问题，同时为用户提供稳定可靠的应用体验。

---

**文档版本**: 1.0  
**创建日期**: 2025-01-13  
**最后更新**: 2025-01-13  
**维护者**: CCPM360 开发团队
