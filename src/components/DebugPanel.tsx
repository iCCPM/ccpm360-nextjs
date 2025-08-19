'use client';

import { useState, useEffect } from 'react';
import { DebugLogger } from '@/utils/debugLogger';
import { Settings, Eye, EyeOff } from 'lucide-react';

/**
 * 调试控制面板组件
 * 仅在开发环境中显示
 */
export default function DebugPanel() {
  const [isVisible, setIsVisible] = useState(false);
  const [debugConfig, setDebugConfig] = useState({
    isDebugMode: false,
    isFastRefreshLogsEnabled: false,
    isProduction: false,
  });

  useEffect(() => {
    // 获取当前调试配置
    const config = DebugLogger.getConfig();
    setDebugConfig(config);
  }, []);

  // 生产环境不显示调试面板
  if (debugConfig.isProduction) {
    return null;
  }

  const toggleDebugMode = () => {
    const newValue = !debugConfig.isDebugMode;
    // 注意：这里只是演示，实际需要重新加载页面才能生效
    // 因为环境变量在构建时就确定了
    alert(
      `调试模式切换到: ${newValue ? '开启' : '关闭'}\n\n` +
        `请在 .env.local 文件中设置:\n` +
        `NEXT_PUBLIC_DEBUG_MODE=${newValue}\n\n` +
        `然后重新启动开发服务器以使更改生效。`
    );
  };

  const toggleFastRefreshLogs = () => {
    const newValue = !debugConfig.isFastRefreshLogsEnabled;
    alert(
      `Fast Refresh日志切换到: ${newValue ? '开启' : '关闭'}\n\n` +
        `请在 .env.local 文件中设置:\n` +
        `NEXT_PUBLIC_FAST_REFRESH_LOGS=${newValue}\n\n` +
        `然后重新启动开发服务器以使更改生效。`
    );
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* 切换按钮 */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-gray-800 text-white p-2 rounded-full shadow-lg hover:bg-gray-700 transition-colors"
        title="调试控制面板"
      >
        <Settings className="w-5 h-5" />
      </button>

      {/* 调试面板 */}
      {isVisible && (
        <div className="absolute bottom-12 right-0 bg-white border border-gray-300 rounded-lg shadow-xl p-4 w-80">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              调试控制面板
            </h3>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>

          <div className="space-y-4">
            {/* 调试模式开关 */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  调试日志
                </label>
                <p className="text-xs text-gray-500">
                  控制authService等组件的调试输出
                </p>
              </div>
              <button
                onClick={toggleDebugMode}
                className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm ${
                  debugConfig.isDebugMode
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {debugConfig.isDebugMode ? (
                  <>
                    <Eye className="w-4 h-4" />
                    <span>开启</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="w-4 h-4" />
                    <span>关闭</span>
                  </>
                )}
              </button>
            </div>

            {/* Fast Refresh日志开关 */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Fast Refresh日志
                </label>
                <p className="text-xs text-gray-500">
                  控制热重载相关的控制台输出
                </p>
              </div>
              <button
                onClick={toggleFastRefreshLogs}
                className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm ${
                  debugConfig.isFastRefreshLogsEnabled
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {debugConfig.isFastRefreshLogsEnabled ? (
                  <>
                    <Eye className="w-4 h-4" />
                    <span>开启</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="w-4 h-4" />
                    <span>关闭</span>
                  </>
                )}
              </button>
            </div>

            {/* 当前状态显示 */}
            <div className="pt-2 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                当前状态
              </h4>
              <div className="text-xs text-gray-600 space-y-1">
                <div>环境: {debugConfig.isProduction ? '生产' : '开发'}</div>
                <div>调试模式: {debugConfig.isDebugMode ? '开启' : '关闭'}</div>
                <div>
                  Fast Refresh日志:{' '}
                  {debugConfig.isFastRefreshLogsEnabled ? '开启' : '关闭'}
                </div>
              </div>
            </div>

            {/* 说明文字 */}
            <div className="pt-2 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                💡 修改设置后需要重新启动开发服务器才能生效
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
