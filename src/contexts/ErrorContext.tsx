'use client';

// @ts-expect-error: React is required for JSX
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { toast } from 'sonner';

export interface AppError {
  id: string;
  message: string;
  type: 'error' | 'warning' | 'info';
  code?: string;
  details?: any;
  timestamp: Date;
  stack?: string;
}

interface ErrorContextType {
  errors: AppError[];
  addError: (error: Omit<AppError, 'id' | 'timestamp'>) => void;
  removeError: (id: string) => void;
  clearErrors: () => void;
  handleError: (error: Error | string, context?: string) => void;
  handleAsyncError: <T>(
    promise: Promise<T>,
    context?: string
  ) => Promise<T | null>;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export function ErrorProvider({ children }: { children: ReactNode }) {
  const [errors, setErrors] = useState<AppError[]>([]);

  const addError = (error: Omit<AppError, 'id' | 'timestamp'>) => {
    const newError: AppError = {
      ...error,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
    };

    setErrors((prev) => [...prev, newError]);

    // 自动显示toast通知
    switch (error.type) {
      case 'error':
        toast.error(error.message);
        break;
      case 'warning':
        toast.warning(error.message);
        break;
      case 'info':
        toast.info(error.message);
        break;
    }

    // 错误日志记录
    console.error('[ErrorContext]', {
      message: error.message,
      type: error.type,
      code: error.code,
      details: error.details,
      stack: error.stack,
      timestamp: newError.timestamp,
    });

    // 自动清除错误（5分钟后）
    setTimeout(
      () => {
        removeError(newError.id);
      },
      5 * 60 * 1000
    );
  };

  const removeError = (id: string) => {
    setErrors((prev) => prev.filter((error) => error.id !== id));
  };

  const clearErrors = () => {
    setErrors([]);
  };

  const handleError = useCallback(
    (error: string | Error, context?: string) => {
      const message = typeof error === 'string' ? error : error.message;
      const stack = typeof error === 'string' ? '' : error.stack || '';

      addError({
        message: context ? `${context}: ${message}` : message,
        type: 'error',
        stack,
        details: { context },
      });
    },
    [addError]
  );

  const handleAsyncError = async <T,>(
    promise: Promise<T>,
    context?: string
  ): Promise<T | null> => {
    try {
      return await promise;
    } catch (error) {
      handleError(error as Error, context);
      return null;
    }
  };

  const value: ErrorContextType = {
    errors,
    addError,
    removeError,
    clearErrors,
    handleError,
    handleAsyncError,
  };

  return (
    <ErrorContext.Provider value={value}>{children}</ErrorContext.Provider>
  );
}

export function useError() {
  const context = useContext(ErrorContext);
  if (context === undefined) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
}

// 便捷的错误处理Hook
export function useErrorHandler() {
  const { handleError, handleAsyncError } = useError();

  return {
    handleError,
    handleAsyncError,
    // 包装异步函数的便捷方法
    withErrorHandling: <T extends any[], R>(
      fn: (...args: T) => Promise<R>,
      context?: string
    ) => {
      return async (...args: T): Promise<R | null> => {
        return handleAsyncError(fn(...args), context);
      };
    },
  };
}
