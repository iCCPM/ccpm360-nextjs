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
const sendAnalyticsData = async (type: string, data: any) => {
  try {
    await fetch('/api/analytics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type, data }),
    });
  } catch (error) {
    console.error('Failed to send analytics data:', error);
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

    // 动态加载 Umami 脚本
    const script = document.createElement('script');
    script.async = true;
    script.defer = true;
    script.src = src;
    script.setAttribute('data-website-id', websiteId);
    script.setAttribute('data-domains', window.location.hostname);

    // 添加到 head
    document.head.appendChild(script);

    // 记录会话开始
    const deviceInfo = getDeviceInfo();
    sendAnalyticsData('session', {
      sessionId: sessionId.current,
      visitorId: visitorId.current,
      duration: 0,
      pageCount: 0,
      ...deviceInfo,
    });

    // 页面卸载时更新会话信息
    const handleBeforeUnload = () => {
      const duration = Math.floor(
        (Date.now() - sessionStartTime.current) / 1000
      );
      sendAnalyticsData('session', {
        sessionId: sessionId.current,
        visitorId: visitorId.current,
        duration,
        pageCount: pageCount.current,
        ...deviceInfo,
      });
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

      // 发送页面访问数据到Supabase
      sendAnalyticsData('page_view', {
        visitorId: visitorId.current,
        sessionId: sessionId.current,
        pageUrl: pathname,
        pageTitle: document.title,
        referrer: document.referrer,
        userAgent: navigator.userAgent,
        ipAddress: null, // 将在服务端获取
        country: null, // 将在服务端获取
        city: null, // 将在服务端获取
      });

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

    // 发送到Supabase
    sendAnalyticsData('event', {
      visitorId,
      sessionId,
      eventType: eventName,
      eventData,
      pageUrl: window.location.pathname,
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
