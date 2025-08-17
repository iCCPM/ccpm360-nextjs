import { toast } from 'sonner';

// API错误类型定义
export interface ApiError {
  message: string;
  code?: string | number;
  status?: number;
  details?: any;
}

// 错误类型枚举
export enum ErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

// 自定义错误类
export class AppError extends Error {
  public readonly type: ErrorType;
  public readonly code?: string | number;
  public readonly status?: number;
  public readonly details?: any;

  constructor(
    message: string,
    type: ErrorType = ErrorType.UNKNOWN_ERROR,
    code?: string | number,
    status?: number,
    details?: any
  ) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.code = code || '';
    this.status = status || 0;
    this.details = details;
  }
}

// 错误消息映射
const ERROR_MESSAGES: Record<ErrorType, string> = {
  [ErrorType.NETWORK_ERROR]: '网络连接失败，请检查您的网络连接',
  [ErrorType.AUTHENTICATION_ERROR]: '身份验证失败，请重新登录',
  [ErrorType.AUTHORIZATION_ERROR]: '您没有权限执行此操作',
  [ErrorType.VALIDATION_ERROR]: '输入数据验证失败',
  [ErrorType.SERVER_ERROR]: '服务器内部错误，请稍后重试',
  [ErrorType.NOT_FOUND_ERROR]: '请求的资源不存在',
  [ErrorType.TIMEOUT_ERROR]: '请求超时，请稍后重试',
  [ErrorType.UNKNOWN_ERROR]: '发生未知错误，请稍后重试',
};

// 根据HTTP状态码确定错误类型
export function getErrorTypeFromStatus(status: number): ErrorType {
  switch (status) {
    case 400:
      return ErrorType.VALIDATION_ERROR;
    case 401:
      return ErrorType.AUTHENTICATION_ERROR;
    case 403:
      return ErrorType.AUTHORIZATION_ERROR;
    case 404:
      return ErrorType.NOT_FOUND_ERROR;
    case 408:
      return ErrorType.TIMEOUT_ERROR;
    case 500:
    case 502:
    case 503:
    case 504:
      return ErrorType.SERVER_ERROR;
    default:
      return ErrorType.UNKNOWN_ERROR;
  }
}

// 处理Fetch API错误
export function handleFetchError(error: any): AppError {
  // 网络错误
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return new AppError(
      ERROR_MESSAGES[ErrorType.NETWORK_ERROR],
      ErrorType.NETWORK_ERROR
    );
  }

  // 如果已经是AppError，直接返回
  if (error instanceof AppError) {
    return error;
  }

  // 其他错误
  return new AppError(
    error.message || ERROR_MESSAGES[ErrorType.UNKNOWN_ERROR],
    ErrorType.UNKNOWN_ERROR
  );
}

// 处理API响应错误
export async function handleApiResponse(response: Response): Promise<any> {
  if (!response.ok) {
    const errorType = getErrorTypeFromStatus(response.status);
    let errorMessage = ERROR_MESSAGES[errorType];
    let errorDetails: any = null;

    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
      errorDetails = errorData;
    } catch {
      // 如果无法解析JSON，使用默认错误消息
    }

    throw new AppError(
      errorMessage,
      errorType,
      response.status,
      response.status,
      errorDetails
    );
  }

  try {
    return await response.json();
  } catch {
    // 如果响应不是JSON，返回空对象
    return {};
  }
}

// 包装fetch请求的错误处理
export async function safeFetch(
  url: string,
  options?: RequestInit,
  showToast: boolean = true
): Promise<any> {
  try {
    const response = await fetch(url, options);
    return await handleApiResponse(response);
  } catch (error) {
    const appError = handleFetchError(error);

    if (showToast) {
      toast.error(appError.message);
    }

    throw appError;
  }
}

// Supabase错误处理
export function handleSupabaseError(error: any): AppError {
  if (!error) {
    return new AppError(
      ERROR_MESSAGES[ErrorType.UNKNOWN_ERROR],
      ErrorType.UNKNOWN_ERROR
    );
  }

  // 根据Supabase错误代码确定错误类型
  let errorType = ErrorType.UNKNOWN_ERROR;
  let message = error.message || ERROR_MESSAGES[ErrorType.UNKNOWN_ERROR];

  if (error.code) {
    switch (error.code) {
      case 'PGRST116': // 没有找到记录
        errorType = ErrorType.NOT_FOUND_ERROR;
        message = '未找到相关数据';
        break;
      case 'PGRST301': // 权限不足
        errorType = ErrorType.AUTHORIZATION_ERROR;
        message = '您没有权限访问此数据';
        break;
      case '23505': // 唯一约束违反
        errorType = ErrorType.VALIDATION_ERROR;
        message = '数据已存在，请检查输入';
        break;
      case '23503': // 外键约束违反
        errorType = ErrorType.VALIDATION_ERROR;
        message = '数据关联错误，请检查相关数据';
        break;
      case '42501': // 权限不足
        errorType = ErrorType.AUTHORIZATION_ERROR;
        break;
      default:
        if (error.message.includes('JWT')) {
          errorType = ErrorType.AUTHENTICATION_ERROR;
          message = '登录已过期，请重新登录';
        }
    }
  }

  return new AppError(message, errorType, error.code, undefined, error);
}

// 全局错误处理器
export function setupGlobalErrorHandler() {
  // 处理未捕获的Promise拒绝
  window.addEventListener('unhandledrejection', (event) => {
    console.error(
      '[Global Error Handler] Unhandled promise rejection:',
      event.reason
    );

    const error = handleFetchError(event.reason);
    toast.error(error.message);

    // 阻止默认的控制台错误输出
    event.preventDefault();
  });

  // 处理未捕获的JavaScript错误
  window.addEventListener('error', (event) => {
    console.error('[Global Error Handler] Unhandled error:', event.error);

    const error = new AppError(
      event.error?.message || '发生未知错误',
      ErrorType.UNKNOWN_ERROR
    );

    toast.error(error.message);
  });
}

// 错误重试工具
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxRetries) {
        throw lastError;
      }

      // 指数退避延迟
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}
