'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

interface UmamiTrackerProps {
  websiteId: string;
  src?: string;
}

// 生成唯一访客ID
const generateVisitorId = (): string => {
  const stored = localStorage.getItem('visitor_id');
  if (stored) return stored;

  const newId =
    'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  localStorage.setItem('visitor_id', newId);
  return newId;
};

// 生成会话ID
const generateSessionId = (): string => {
  const stored = sessionStorage.getItem('session_id');
  if (stored) return stored;

  const newId =
    'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  sessionStorage.setItem('session_id', newId);
  return newId;
};

// 获取设备信息
const getDeviceInfo = () => {
  const userAgent = navigator.userAgent;
  let deviceType = 'desktop';
  let browser = 'unknown';
  let os = 'unknown';

  // 检测设备类型
  if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
    deviceType = /iPad/.test(userAgent) ? 'tablet' : 'mobile';
  }

  // 检测浏览器
  if (userAgent.includes('Chrome')) browser = 'Chrome';
  else if (userAgent.includes('Firefox')) browser = 'Firefox';
  else if (userAgent.includes('Safari')) browser = 'Safari';
  else if (userAgent.includes('Edge')) browser = 'Edge';

  // 检测操作系统
  if (userAgent.includes('Windows')) os = 'Windows';
  else if (userAgent.includes('Mac')) os = 'macOS';
  else if (userAgent.includes('Linux')) os = 'Linux';
  else if (userAgent.includes('Android')) os = 'Android';
  else if (userAgent.includes('iOS')) os = 'iOS';

  return { deviceType, browser, os };
};

// 发送数据到API
const sendAnalyticsData = async (
  type: string,
  data: any,
  useBeacon = false
) => {
  try {
    // 在页面卸载时使用sendBeacon，避免ERR_ABORTED错误
    if (useBeacon && navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify({ type, data })], {
        type: 'application/json',
      });
      navigator.sendBeacon('/api/analytics', blob);
      return;
    }

    // 创建AbortController来处理请求中断
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5秒超时

    await fetch('/api/analytics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type, data }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
  } catch (error) {
    // 忽略AbortError，这是正常的页面卸载行为
    if (error instanceof Error && error.name !== 'AbortError') {
      console.error('Failed to send analytics data:', error);
    }
  }
};

export default function UmamiTracker({
  websiteId,
  src = '/umami.js',
}: UmamiTrackerProps) {
  const pathname = usePathname();
  const sessionStartTime = useRef<number>(Date.now());
  const pageCount = useRef<number>(0);
  const visitorId = useRef<string>('');
  const sessionId = useRef<string>('');

  useEffect(() => {
    // 初始化访客和会话ID
    visitorId.current = generateVisitorId();
    sessionId.current = generateSessionId();

    // 存储到localStorage和sessionStorage供其他函数使用
    localStorage.setItem('visitor_id', visitorId.current);
    sessionStorage.setItem('session_id', sessionId.current);

    // 动态加载 Umami 脚本
    const script = document.createElement('script');
    script.async = true;
    script.defer = true;
    script.src = src;
    script.setAttribute('data-website-id', websiteId);
    script.setAttribute('data-domains', window.location.hostname);

    // 添加到 head
    document.head.appendChild(script);

    // 记录会话开始 (仅在生产环境)
    const deviceInfo = getDeviceInfo();
    if (process.env.NODE_ENV !== 'development') {
      sendAnalyticsData('session', {
        sessionId: sessionId.current,
        visitorId: visitorId.current,
        duration: 0,
        pageCount: 0,
        deviceType: deviceInfo.deviceType,
        browser: deviceInfo.browser,
        os: deviceInfo.os,
        country: null,
        city: null,
      });
    }

    // 页面卸载时更新会话信息
    const handleBeforeUnload = () => {
      // 在开发环境中，避免在热重载时发送analytics请求
      if (process.env.NODE_ENV === 'development') {
        return;
      }

      const duration = Math.floor(
        (Date.now() - sessionStartTime.current) / 1000
      );
      // 使用sendBeacon避免ERR_ABORTED错误
      sendAnalyticsData(
        'session',
        {
          sessionId: sessionId.current,
          visitorId: visitorId.current,
          duration,
          pageCount: pageCount.current,
          deviceType: deviceInfo.deviceType,
          browser: deviceInfo.browser,
          os: deviceInfo.os,
          country: null,
          city: null,
        },
        true
      ); // 使用beacon
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // 清理函数
    return () => {
      const existingScript = document.querySelector(`script[src="${src}"]`);
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // 页面变化时追踪页面访问
  useEffect(() => {
    if (typeof window !== 'undefined') {
      pageCount.current += 1;

      // 确保ID已经初始化
      const currentVisitorId =
        visitorId.current ||
        localStorage.getItem('visitor_id') ||
        generateVisitorId();
      const currentSessionId =
        sessionId.current ||
        sessionStorage.getItem('session_id') ||
        generateSessionId();

      // 如果ref中的值为空，更新它们
      if (!visitorId.current) {
        visitorId.current = currentVisitorId;
        localStorage.setItem('visitor_id', currentVisitorId);
      }
      if (!sessionId.current) {
        sessionId.current = currentSessionId;
        sessionStorage.setItem('session_id', currentSessionId);
      }

      // 发送页面访问数据到Supabase (仅在生产环境)
      if (process.env.NODE_ENV !== 'development') {
        sendAnalyticsData('page_view', {
          visitorId: currentVisitorId,
          sessionId: currentSessionId,
          pageUrl: window.location.href,
          pageTitle: document.title,
          referrer: document.referrer,
        });
      }

      // Umami 追踪
      if ((window as any).umami) {
        (window as any).umami.track();
      }
    }
  }, [pathname]);

  return null;
}

// 手动追踪事件的工具函数
export const trackEvent = (
  eventName: string,
  eventData?: Record<string, any>
) => {
  if (typeof window !== 'undefined') {
    const visitorId = localStorage.getItem('visitor_id');
    const sessionId = sessionStorage.getItem('session_id');

    // 确保有有效的ID
    if (!visitorId || !sessionId) {
      console.warn(
        'Visitor ID or Session ID not found, skipping analytics event'
      );
      return;
    }

    // 发送到Supabase
    sendAnalyticsData('event', {
      visitorId,
      sessionId,
      eventType: 'custom',
      eventName: eventName,
      eventData,
    });

    // Umami 追踪
    if ((window as any).umami) {
      (window as any).umami.track(eventName, eventData);
    }
  }
};

// 追踪页面访问的工具函数
export const trackPageView = (url?: string, referrer?: string) => {
  if (typeof window !== 'undefined' && (window as any).umami) {
    (window as any).umami.track(url, { referrer });
  }
};

// 获取访客信息的工具函数
export const getVisitorInfo = () => {
  if (typeof window === 'undefined') return null;

  return {
    visitorId: localStorage.getItem('visitor_id'),
    sessionId: sessionStorage.getItem('session_id'),
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    cookieEnabled: navigator.cookieEnabled,
    onLine: navigator.onLine,
    screen: {
      width: screen.width,
      height: screen.height,
      colorDepth: screen.colorDepth,
    },
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
    },
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timestamp: new Date().toISOString(),
  };
};

// 扩展 Window 接口
declare global {
  interface Window {
    umami?: {
      track: (eventName?: string, eventData?: Record<string, any>) => void;
      visitor?: { id: string };
      session?: { id: string };
    };
  }
}
