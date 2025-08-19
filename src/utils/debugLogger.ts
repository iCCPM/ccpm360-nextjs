/**
 * 调试日志工具
 * 根据环境变量控制日志输出
 */

// 获取调试模式配置
const isDebugMode = process.env['NEXT_PUBLIC_DEBUG_MODE'] === 'true';
const isFastRefreshLogsEnabled =
  process.env['NEXT_PUBLIC_FAST_REFRESH_LOGS'] === 'true';
const isProduction = process.env.NODE_ENV === 'production';

/**
 * 调试日志类
 */
export class DebugLogger {
  /**
   * 普通调试日志
   */
  static log(...args: any[]): void {
    if (!isProduction && isDebugMode) {
      console.log('[DEBUG]', ...args);
    }
  }

  /**
   * 信息日志
   */
  static info(...args: any[]): void {
    if (!isProduction && isDebugMode) {
      console.info('[INFO]', ...args);
    }
  }

  /**
   * 警告日志
   */
  static warn(...args: any[]): void {
    if (!isProduction && isDebugMode) {
      console.warn('[WARN]', ...args);
    }
  }

  /**
   * 错误日志（始终显示，除非在生产环境）
   */
  static error(...args: any[]): void {
    if (!isProduction) {
      console.error('[ERROR]', ...args);
    }
  }

  /**
   * 认证服务专用日志
   */
  static auth(...args: any[]): void {
    if (!isProduction && isDebugMode) {
      console.log('[AUTH]', ...args);
    }
  }

  /**
   * API请求日志
   */
  static api(...args: any[]): void {
    if (!isProduction && isDebugMode) {
      console.log('[API]', ...args);
    }
  }

  /**
   * Fast Refresh相关日志（通常由开发工具产生）
   */
  static fastRefresh(...args: any[]): void {
    if (!isProduction && isFastRefreshLogsEnabled) {
      console.log('[FAST_REFRESH]', ...args);
    }
  }

  /**
   * 检查是否启用调试模式
   */
  static isDebugEnabled(): boolean {
    return !isProduction && isDebugMode;
  }

  /**
   * 检查是否启用Fast Refresh日志
   */
  static isFastRefreshEnabled(): boolean {
    return !isProduction && isFastRefreshLogsEnabled;
  }

  /**
   * 获取当前调试配置
   */
  static getConfig() {
    return {
      isDebugMode,
      isFastRefreshLogsEnabled,
      isProduction,
    };
  }
}

// 导出便捷方法
export const debugLog = DebugLogger.log;
export const debugInfo = DebugLogger.info;
export const debugWarn = DebugLogger.warn;
export const debugError = DebugLogger.error;
export const debugAuth = DebugLogger.auth;
export const debugApi = DebugLogger.api;
