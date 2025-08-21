'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Brain, X } from 'lucide-react';

const FloatingAssessmentButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // 检查localStorage中的关闭状态
    const isHidden =
      localStorage.getItem('assessment-button-hidden') === 'true';
    setIsVisible(!isHidden);
    setIsLoaded(true);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('assessment-button-hidden', 'true');
  };

  // 如果还没有加载完成或者不可见，则不渲染
  if (!isLoaded || !isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="relative group">
        {/* 主容器 - 包含图标和文字标签（垂直布局） */}
        <Link href="/assessment">
          <div className="flex flex-col items-center cursor-pointer">
            {/* 主按钮 */}
            <div className="relative w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 flex items-center justify-center animate-pulse">
              <Brain className="w-8 h-8 text-white" />
            </div>

            {/* 文字标签 */}
            <div className="mt-2 px-2 py-1 bg-black bg-opacity-70 text-white text-xs font-medium rounded-md shadow-lg transition-all duration-300 whitespace-nowrap">
              <span className="hidden sm:inline">项目管理思维诊断</span>
              <span className="sm:hidden">思维诊断</span>
            </div>
          </div>
        </Link>

        {/* 关闭按钮 */}
        <button
          onClick={handleClose}
          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs hover:bg-red-600 transition-colors z-10"
        >
          <X className="w-3 h-3" />
        </button>

        {/* 悬停提示 */}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
          点击进入诊断
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
        </div>
      </div>
    </div>
  );
};

export default FloatingAssessmentButton;
