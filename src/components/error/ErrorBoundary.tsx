'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, State> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // 调用外部错误处理函数
    this.props.onError?.(error, errorInfo);

    // 记录错误到控制台
    console.error('[ErrorBoundary] Caught an error:', {
      error,
      errorInfo,
      componentStack: errorInfo.componentStack,
    });

    // 在生产环境中，可以将错误发送到错误监控服务
    if (process.env.NODE_ENV === 'production') {
      // 这里可以集成 Sentry、LogRocket 等错误监控服务
      // reportErrorToService(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // 如果提供了自定义fallback，使用它
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 默认错误UI
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>

            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              出现了一些问题
            </h1>

            <p className="text-gray-600 mb-6">
              应用程序遇到了意外错误。我们已经记录了这个问题，请稍后重试。
            </p>

            {/* 开发环境显示错误详情 */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-6 p-4 bg-gray-100 rounded-lg text-left">
                <h3 className="font-medium text-gray-900 mb-2">错误详情：</h3>
                <p className="text-sm text-red-600 font-mono break-all">
                  {this.state.error.message}
                </p>
                {this.state.error.stack && (
                  <details className="mt-2">
                    <summary className="text-sm text-gray-600 cursor-pointer">
                      查看堆栈跟踪
                    </summary>
                    <pre className="text-xs text-gray-500 mt-2 overflow-auto max-h-32">
                      {this.state.error.stack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={this.handleRetry}
                className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                重试
              </button>

              <button
                onClick={this.handleGoHome}
                className="flex-1 flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                <Home className="w-4 h-4 mr-2" />
                返回首页
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// 函数式组件版本的错误边界（使用react-error-boundary库的模式）
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorFallback?: ReactNode,
  onError?: (error: Error, errorInfo: ErrorInfo) => void
) {
  return function WrappedComponent(props: P) {
    const errorBoundaryProps: ErrorBoundaryProps = {
      children: <Component {...props} />,
      ...(errorFallback !== undefined && { fallback: errorFallback }),
      ...(onError !== undefined && { onError }),
    };

    return <ErrorBoundary {...errorBoundaryProps} />;
  };
}
