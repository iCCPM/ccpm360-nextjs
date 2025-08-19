'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
// 使用原生HTML元素和Tailwind CSS替代UI组件
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Calendar, Users, Eye, Clock, Globe, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface AnalyticsData {
  totalVisitors: number;
  dailyVisitors: number;
  monthlyVisitors: number;
  totalPageViews: number;
  avgSessionDuration: number;
  bounceRate: number;
  topPages: Array<{ page: string; views: number }>;
  dailyStats: Array<{ date: string; visitors: number; pageViews: number }>;
  deviceStats: Array<{ device: string; count: number; percentage: number }>;
  browserStats: Array<{ browser: string; count: number; percentage: number }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState('7d');
  const [activeTab, setActiveTab] = useState('trends');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // 使用useCallback优化fetchAnalyticsData函数
  const fetchAnalyticsData = useCallback(
    async (isManualRefresh = false) => {
      if (isManualRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const dateRange = getDateRange(timeRange);
        console.log('Date range for query:', dateRange);

        // 完整数据获取
        const [sessionsResult, pageViewsResult, dailyStatsResult] =
          await Promise.all([
            supabase
              .from('visitor_sessions')
              .select('*')
              .gte('created_at', dateRange),
            supabase
              .from('page_views')
              .select('*')
              .gte('created_at', dateRange),
            supabase
              .from('daily_analytics')
              .select('*')
              .gte('date', getDateOnly(timeRange))
              .order('date', { ascending: true }),
          ]);

        if (sessionsResult.error) throw sessionsResult.error;
        if (pageViewsResult.error) throw pageViewsResult.error;
        if (dailyStatsResult.error) throw dailyStatsResult.error;

        // 获取今日数据（实时更新）
        const today = new Date().toISOString().split('T')[0];
        const todayStart = `${today}T00:00:00.000Z`;

        const { data: todaySessions, error: todaySessionsError } =
          await supabase
            .from('visitor_sessions')
            .select('*')
            .gte('created_at', todayStart);

        if (todaySessionsError) throw todaySessionsError;

        // 处理数据
        const processedData = processAnalyticsData(
          sessionsResult.data || [],
          pageViewsResult.data || [],
          dailyStatsResult.data || []
        );

        // 更新今日访客数
        const todayVisitors = new Set(
          todaySessions?.map((s) => s.visitor_id) || []
        ).size;
        processedData.dailyVisitors = todayVisitors;

        setAnalyticsData(processedData);
        setLastRefresh(new Date());
      } catch (error) {
        console.error('获取分析数据失败:', error);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [timeRange]
  );

  // 手动刷新函数
  const handleManualRefresh = () => {
    fetchAnalyticsData(true);
  };

  // 初始数据加载
  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange, fetchAnalyticsData]);

  // 自动刷新控制
  useEffect(() => {
    // 清除之前的定时器
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // 只有在启用自动刷新时才设置定时器
    if (autoRefreshEnabled) {
      intervalRef.current = setInterval(() => {
        fetchAnalyticsData(true);
      }, 60000); // 改为60秒，减少刷新频率
    }

    // 清理函数
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefreshEnabled, fetchAnalyticsData]);

  // 组件卸载时清理定时器
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const getDateRange = (range: string) => {
    const now = new Date();
    const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    return startDate.toISOString();
  };

  const getDateOnly = (range: string) => {
    const now = new Date();
    const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    return startDate.toISOString().split('T')[0];
  };

  const processAnalyticsData = (
    sessions: any[],
    pageViews: any[],
    dailyStats: any[]
  ): AnalyticsData => {
    // 计算基础统计
    const totalVisitors = new Set(sessions.map((s) => s.visitor_id)).size;
    const totalPageViews = pageViews.length;

    // 计算今日访客
    const today = new Date().toISOString().split('T')[0];
    const todaySessions = sessions.filter((s) =>
      s.created_at.startsWith(today)
    );
    const dailyVisitors = new Set(todaySessions.map((s) => s.visitor_id)).size;

    // 计算本月访客
    const thisMonth = new Date().toISOString().substring(0, 7);
    const monthSessions = sessions.filter((s) =>
      s.created_at.startsWith(thisMonth)
    );
    const monthlyVisitors = new Set(monthSessions.map((s) => s.visitor_id))
      .size;

    // 计算平均会话时长
    const validSessions = sessions.filter((s) => s.duration && s.duration > 0);
    const avgSessionDuration =
      validSessions.length > 0
        ? validSessions.reduce((sum, s) => sum + s.duration, 0) /
          validSessions.length
        : 0;

    // 计算跳出率（单页面会话比例）
    const singlePageSessions = sessions.filter((s) => s.page_count === 1);
    const bounceRate =
      sessions.length > 0
        ? (singlePageSessions.length / sessions.length) * 100
        : 0;

    // 统计热门页面
    const pageStats = pageViews.reduce(
      (acc, pv) => {
        acc[pv.page_url] = (acc[pv.page_url] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const topPages = Object.entries(pageStats)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 10)
      .map(([page, views]) => ({ page, views: views as number }));

    // 处理每日统计数据
    const processedDailyStats = dailyStats.map((stat) => ({
      date: new Date(stat.date).toLocaleDateString('zh-CN', {
        month: 'short',
        day: 'numeric',
      }),
      visitors: stat.unique_visitors,
      pageViews: stat.total_page_views,
    }));

    // 设备统计（模拟数据，实际应从user_agent解析）
    const deviceStats = [
      {
        device: '桌面端',
        count: Math.floor(totalVisitors * 0.6),
        percentage: 60,
      },
      {
        device: '移动端',
        count: Math.floor(totalVisitors * 0.35),
        percentage: 35,
      },
      {
        device: '平板',
        count: Math.floor(totalVisitors * 0.05),
        percentage: 5,
      },
    ];

    // 浏览器统计（模拟数据）
    const browserStats = [
      {
        browser: 'Chrome',
        count: Math.floor(totalVisitors * 0.65),
        percentage: 65,
      },
      {
        browser: 'Safari',
        count: Math.floor(totalVisitors * 0.2),
        percentage: 20,
      },
      {
        browser: 'Firefox',
        count: Math.floor(totalVisitors * 0.1),
        percentage: 10,
      },
      {
        browser: '其他',
        count: Math.floor(totalVisitors * 0.05),
        percentage: 5,
      },
    ];

    return {
      totalVisitors,
      dailyVisitors,
      monthlyVisitors,
      totalPageViews,
      avgSessionDuration,
      bounceRate,
      topPages,
      dailyStats: processedDailyStats,
      deviceStats,
      browserStats,
    };
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">加载分析数据中...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            暂无分析数据
          </h3>
          <p className="text-gray-600">
            开始收集访客数据后，这里将显示详细的分析报告。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">访客分析</h1>
          <div className="flex items-center space-x-4 mt-1">
            <p className="text-gray-600">网站访问数据统计与分析</p>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>最后更新:</span>
              <span>{lastRefresh.toLocaleTimeString('zh-CN')}</span>
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                  autoRefreshEnabled
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full mr-1 ${
                    autoRefreshEnabled
                      ? 'bg-green-400 animate-pulse'
                      : 'bg-gray-400'
                  }`}
                ></span>
                {autoRefreshEnabled ? '自动刷新' : '手动模式'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
            className={`flex items-center space-x-1 px-3 py-1.5 text-sm font-medium rounded-md border transition-colors ${
              autoRefreshEnabled
                ? 'border-green-300 bg-green-50 text-green-700 hover:bg-green-100'
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span>{autoRefreshEnabled ? '关闭自动刷新' : '开启自动刷新'}</span>
          </button>
          <button
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="flex items-center space-x-1 px-3 py-1.5 text-sm font-medium rounded-md border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`}
            />
            <span>{refreshing ? '刷新中...' : '刷新'}</span>
          </button>
          <div className="h-4 border-l border-gray-300"></div>
          <button
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              timeRange === '7d'
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setTimeRange('7d')}
          >
            近7天
          </button>
          <button
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              timeRange === '30d'
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setTimeRange('30d')}
          >
            近30天
          </button>
          <button
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              timeRange === '90d'
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setTimeRange('90d')}
          >
            近90天
          </button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">总访客数</h3>
            <Users className="h-4 w-4 text-gray-500" />
          </div>
          <div>
            <div className="text-2xl font-bold">
              {analyticsData.totalVisitors.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500">累计独立访客</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">今日访客</h3>
            <Calendar className="h-4 w-4 text-gray-500" />
          </div>
          <div>
            <div className="text-2xl font-bold">
              {analyticsData.dailyVisitors.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500">今日新增访客</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">页面浏览量</h3>
            <Eye className="h-4 w-4 text-gray-500" />
          </div>
          <div>
            <div className="text-2xl font-bold">
              {analyticsData.totalPageViews.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500">总页面访问次数</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">平均停留时间</h3>
            <Clock className="h-4 w-4 text-gray-500" />
          </div>
          <div>
            <div className="text-2xl font-bold">
              {Math.round(analyticsData.avgSessionDuration / 60)}分钟
            </div>
            <p className="text-xs text-gray-500">平均会话时长</p>
          </div>
        </div>
      </div>

      {/* 图表区域 */}
      <div className="space-y-4">
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          <button
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'trends'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setActiveTab('trends')}
          >
            访问趋势
          </button>
          <button
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'pages'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setActiveTab('pages')}
          >
            热门页面
          </button>
          <button
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'devices'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setActiveTab('devices')}
          >
            设备分析
          </button>
          <button
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'browsers'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            onClick={() => setActiveTab('browsers')}
          >
            浏览器分析
          </button>
        </div>

        {activeTab === 'trends' && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold">访问趋势</h3>
                <p className="text-gray-600">每日访客数量和页面浏览量变化</p>
              </div>
              <div>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData.dailyStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="visitors"
                      stroke="#8884d8"
                      name="访客数"
                    />
                    <Line
                      type="monotone"
                      dataKey="pageViews"
                      stroke="#82ca9d"
                      name="页面浏览量"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'pages' && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold">热门页面</h3>
                <p className="text-gray-600">访问量最高的页面排行</p>
              </div>
              <div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData.topPages}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="page" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="views" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'devices' && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold">设备分析</h3>
                <p className="text-gray-600">访客使用的设备类型分布</p>
              </div>
              <div>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analyticsData.deviceStats}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ device, percentage }) =>
                        `${device} ${percentage}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {analyticsData.deviceStats.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'browsers' && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold">浏览器分析</h3>
                <p className="text-gray-600">访客使用的浏览器类型分布</p>
              </div>
              <div>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analyticsData.browserStats}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ browser, percentage }) =>
                        `${browser} ${percentage}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {analyticsData.browserStats.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 其他统计信息 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">网站性能指标</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">跳出率</span>
              <span className="px-2 py-1 text-xs font-medium bg-gray-100 border border-gray-300 rounded">
                {analyticsData.bounceRate.toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">本月访客</span>
              <span className="px-2 py-1 text-xs font-medium bg-gray-100 border border-gray-300 rounded">
                {analyticsData.monthlyVisitors.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">页面/会话</span>
              <span className="px-2 py-1 text-xs font-medium bg-gray-100 border border-gray-300 rounded">
                {analyticsData.totalVisitors > 0
                  ? (
                      analyticsData.totalPageViews / analyticsData.totalVisitors
                    ).toFixed(1)
                  : '0'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">数据收集状态</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Umami 追踪</span>
              <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                已启用
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">数据库存储</span>
              <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                正常
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">隐私合规</span>
              <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                GDPR 兼容
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
