'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BarChart3,
  Users,
  FileText,
  Download,
  TrendingUp,
  Plus,
  Settings,
  Calendar,
  Eye,
  Activity,
  CheckCircle,
  AlertCircle,
  Loader2,
  Database,
  HardDrive,
  Zap,
  Globe,
  Server,
  Gauge,
  ClipboardList,
  Target,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface DashboardStats {
  totalCases: number;
  totalArticles: number;
  totalDownloads: number;
  totalContacts: number;
  totalVisitors: number;
  dailyVisitors: number;
  monthlyPageViews: number;
  totalAssessments: number;
  averageScore: number;
  recentCases: any[];
  recentArticles: any[];
  recentContacts: any[];
}

interface SystemStatus {
  database: {
    status: 'healthy' | 'unhealthy' | 'unknown';
    message: string;
    responseTime?: number;
  };
  storage: {
    status: 'healthy' | 'unhealthy' | 'unknown';
    message: string;
    responseTime?: number;
  };
  auth: {
    status: 'healthy' | 'unhealthy' | 'unknown';
    message: string;
    responseTime?: number;
  };
  overall: 'healthy' | 'unhealthy' | 'unknown';
}

interface QuotaUsage {
  used: number;
  limit: number;
  percentage: number;
  status: 'normal' | 'warning' | 'critical';
}

interface QuotaData {
  supabase: {
    database: QuotaUsage;
    storage: QuotaUsage;
    apiRequests: QuotaUsage;
    monthlyActiveUsers: QuotaUsage;
  };
  vercel: {
    functions: QuotaUsage;
    bandwidth: QuotaUsage;
    builds: QuotaUsage;
  };
  overall: 'normal' | 'warning' | 'critical';
}

const AdminDashboardPage = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalCases: 0,
    totalArticles: 0,
    totalDownloads: 0,
    totalContacts: 0,
    totalVisitors: 0,
    dailyVisitors: 0,
    monthlyPageViews: 0,
    totalAssessments: 0,
    averageScore: 0,
    recentCases: [],
    recentArticles: [],
    recentContacts: [],
  });
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    database: { status: 'unknown', message: '检查中...' },
    storage: { status: 'unknown', message: '检查中...' },
    auth: { status: 'unknown', message: '检查中...' },
    overall: 'unknown',
  });
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(true);
  const [quotaData, setQuotaData] = useState<QuotaData>({
    supabase: {
      database: { used: 0, limit: 0, percentage: 0, status: 'normal' },
      storage: { used: 0, limit: 0, percentage: 0, status: 'normal' },
      apiRequests: { used: 0, limit: 0, percentage: 0, status: 'normal' },
      monthlyActiveUsers: {
        used: 0,
        limit: 0,
        percentage: 0,
        status: 'normal',
      },
    },
    vercel: {
      functions: { used: 0, limit: 0, percentage: 0, status: 'normal' },
      bandwidth: { used: 0, limit: 0, percentage: 0, status: 'normal' },
      builds: { used: 0, limit: 0, percentage: 0, status: 'normal' },
    },
    overall: 'normal',
  });
  const [quotaLoading, setQuotaLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    fetchSystemStatus();
    fetchQuotaData();

    // 每30秒刷新一次系统状态和额度数据
    const statusInterval = setInterval(fetchSystemStatus, 30000);
    const quotaInterval = setInterval(fetchQuotaData, 60000); // 每分钟刷新额度数据

    return () => {
      clearInterval(statusInterval);
      clearInterval(quotaInterval);
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // 获取统计数据
      const [
        casesResult,
        articlesResult,
        downloadsResult,
        contactsResult,
        assessmentsResult,
        assessmentScoresResult,
      ] = await Promise.all([
        supabase.from('case_studies').select('id', { count: 'exact' }),
        supabase.from('articles').select('id', { count: 'exact' }),
        supabase.from('resources').select('download_count'),
        supabase.from('contact_submissions').select('id', { count: 'exact' }),
        supabase.from('assessment_records').select('id', { count: 'exact' }),
        supabase.from('assessment_records').select('total_score'),
      ]);

      // 检查数据库查询是否有错误
      const errors = [
        casesResult.error,
        articlesResult.error,
        downloadsResult.error,
        contactsResult.error,
        assessmentsResult.error,
        assessmentScoresResult.error,
      ].filter(Boolean);
      if (errors.length > 0) {
        console.error('数据库查询错误:', errors);
        throw new Error(
          `数据库查询失败: ${errors.map((e) => e?.message).join(', ')}`
        );
      }

      // 获取访客统计数据
      const today = new Date().toISOString().split('T')[0];
      const thisMonthStart = new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1
      ).toISOString();

      const [visitorsResult, dailyVisitorsResult, monthlyPageViewsResult] =
        await Promise.all([
          supabase.from('visitor_sessions').select('visitor_id'),
          supabase
            .from('visitor_sessions')
            .select('visitor_id')
            .gte('created_at', today),
          supabase
            .from('page_views')
            .select('id', { count: 'exact' })
            .gte('created_at', thisMonthStart),
        ]);

      // 添加调试日志
      console.log('Assessment查询结果:', {
        assessmentsCount: assessmentsResult.count,
        assessmentsError: assessmentsResult.error,
        scoresData: assessmentScoresResult.data,
        scoresError: assessmentScoresResult.error,
        scoresLength: assessmentScoresResult.data?.length,
      });

      // 获取最近的数据
      const [recentCasesResult, recentArticlesResult, recentContactsResult] =
        await Promise.all([
          supabase
            .from('case_studies')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(5),
          supabase
            .from('articles')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(5),
          supabase
            .from('contact_submissions')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(5),
        ]);

      // 计算总下载量
      const totalDownloads =
        downloadsResult.data?.reduce(
          (sum, item) => sum + (item.download_count || 0),
          0
        ) || 0;

      // 计算测评统计
      const totalAssessments = assessmentsResult.count || 0;
      const averageScore =
        assessmentScoresResult.data && assessmentScoresResult.data.length > 0
          ? assessmentScoresResult.data.reduce(
              (sum, item) => sum + (item.total_score || 0),
              0
            ) / assessmentScoresResult.data.length
          : 0;

      // 添加调试日志
      console.log('计算结果:', {
        totalAssessments,
        averageScore,
        rawAverageScore: averageScore,
        roundedAverageScore: Math.round(averageScore * 10) / 10,
      });

      // 计算访客统计
      const totalVisitors = new Set(
        visitorsResult.data?.map((v) => v.visitor_id) || []
      ).size;
      const dailyVisitors = new Set(
        dailyVisitorsResult.data?.map((v) => v.visitor_id) || []
      ).size;
      const monthlyPageViews = monthlyPageViewsResult.count || 0;

      setStats({
        totalCases: casesResult.count || 0,
        totalArticles: articlesResult.count || 0,
        totalDownloads,
        totalContacts: contactsResult.count || 0,
        totalVisitors,
        dailyVisitors,
        monthlyPageViews,
        totalAssessments,
        averageScore: Math.round(averageScore * 10) / 10, // 保留一位小数
        recentCases: recentCasesResult.data || [],
        recentArticles: recentArticlesResult.data || [],
        recentContacts: recentContactsResult.data || [],
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSystemStatus = async () => {
    try {
      setStatusLoading(true);
      const response = await fetch('/api/system/health', {
        signal: AbortSignal.timeout(12000), // 12秒超时（给后端API留出缓冲时间）
      });
      if (response.ok) {
        const data = await response.json();

        // 验证数据结构
        if (!data || typeof data !== 'object') {
          throw new Error('Invalid system status data format');
        }

        setSystemStatus(data);
      } else {
        // 如果API调用失败，设置为不健康状态
        setSystemStatus({
          database: {
            status: 'unhealthy',
            message: `API调用失败 (${response.status})`,
          },
          storage: {
            status: 'unhealthy',
            message: `API调用失败 (${response.status})`,
          },
          auth: {
            status: 'unhealthy',
            message: `API调用失败 (${response.status})`,
          },
          overall: 'unhealthy',
        });
      }
    } catch (error) {
      console.error('Failed to fetch system status:', error);
      setSystemStatus({
        database: { status: 'unhealthy', message: '网络错误' },
        storage: { status: 'unhealthy', message: '网络错误' },
        auth: { status: 'unhealthy', message: '网络错误' },
        overall: 'unhealthy',
      });
    } finally {
      setStatusLoading(false);
    }
  };

  const fetchQuotaData = async () => {
    try {
      setQuotaLoading(true);
      const response = await fetch('/api/quota/check', {
        signal: AbortSignal.timeout(12000), // 12秒超时（给后端API留出缓冲时间）
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      // 验证数据结构
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid data format received');
      }

      console.log('✅ 额度数据获取成功:', data);

      // 辅助函数：确保status字段类型正确
      const normalizeQuotaItem = (item: any): QuotaUsage => {
        if (!item) {
          return {
            used: 0,
            limit: 0,
            percentage: 0,
            status: 'normal' as const,
          };
        }

        // 确保status字段是正确的联合类型
        let status: 'normal' | 'warning' | 'critical' = 'normal';
        if (item.status === 'warning' || item.status === 'critical') {
          status = item.status;
        }

        return {
          used: item.used || 0,
          limit: item.limit || 0,
          percentage: item.percentage || 0,
          status,
        };
      };

      // 转换数据格式以匹配组件期望的结构
      const transformedData: QuotaData = {
        supabase: {
          storage: normalizeQuotaItem(
            data.supabase?.find((item: any) => item.metric === '文件存储')
          ),
          apiRequests: normalizeQuotaItem(
            data.supabase?.find((item: any) => item.metric === 'API请求数')
          ),
          monthlyActiveUsers: normalizeQuotaItem(
            data.supabase?.find((item: any) => item.metric === '月活跃用户')
          ),
          database: normalizeQuotaItem(
            data.supabase?.find((item: any) => item.metric === '数据库存储')
          ),
        },
        vercel: {
          functions: normalizeQuotaItem(
            data.vercel?.find((item: any) => item.metric === '函数调用次数')
          ),
          bandwidth: normalizeQuotaItem(
            data.vercel?.find((item: any) => item.metric === '带宽使用量')
          ),
          builds: {
            used: 0,
            limit: 100,
            percentage: 0,
            status: 'normal' as const,
          }, // 默认值，因为API中没有builds数据
        },
        overall: 'normal' as const,
      };

      setQuotaData(transformedData);

      // 发送警告检查请求
      try {
        const alertResponse = await fetch('/api/quota/alert', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ quotaData: data }),
        });

        if (alertResponse.ok) {
          console.log('✅ 警告检查完成');
        } else {
          console.warn('⚠️ 警告检查失败:', alertResponse.status);
        }
      } catch (alertError) {
        console.error('❌ 警告检查错误:', alertError);
      }
    } catch (error) {
      console.error('❌ 获取额度数据失败:', error);
    } finally {
      setQuotaLoading(false);
    }
  };

  const statCards = [
    {
      title: '成功案例',
      value: stats.totalCases,
      icon: FileText,
      color: 'bg-blue-500',
      link: '/admin/cases',
    },
    {
      title: '文章资源',
      value: stats.totalArticles,
      icon: Download,
      color: 'bg-green-500',
      link: '/admin/resources',
    },
    {
      title: '总测试人数',
      value: stats.totalAssessments,
      icon: ClipboardList,
      color: 'bg-emerald-500',
      link: '/admin/assessment',
    },
    {
      title: '平均分',
      value: stats.averageScore,
      icon: Target,
      color: 'bg-rose-500',
      link: '/admin/assessment',
      suffix: '分',
    },
    {
      title: '总访客数',
      value: stats.totalVisitors,
      icon: Users,
      color: 'bg-purple-500',
      link: '/admin/analytics',
    },
    {
      title: '今日访客',
      value: stats.dailyVisitors,
      icon: Eye,
      color: 'bg-orange-500',
      link: '/admin/analytics',
    },
    {
      title: '总下载量',
      value: stats.totalDownloads,
      icon: TrendingUp,
      color: 'bg-indigo-500',
      link: '/admin/resources',
    },
    {
      title: '联系咨询',
      value: stats.totalContacts,
      icon: Users,
      color: 'bg-cyan-500',
      link: '/admin/contacts',
    },
  ];

  const quickActions = [
    {
      title: '添加成功案例',
      description: '发布新的客户成功案例',
      icon: Plus,
      link: '/admin/cases/new',
      color: 'bg-blue-500',
    },
    {
      title: '发布文章',
      description: '创建新的资源文章',
      icon: FileText,
      link: '/admin/resources/new',
      color: 'bg-green-500',
    },
    {
      title: '管理首页',
      description: '编辑首页内容和配置',
      icon: Settings,
      link: '/admin/homepage',
      color: 'bg-purple-500',
    },
    {
      title: '查看统计',
      description: '查看详细数据分析',
      icon: BarChart3,
      link: '/admin/analytics',
      color: 'bg-orange-500',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold">管理仪表板</h1>
            </div>
            <p className="text-blue-100 text-base">
              欢迎回到CCPM360管理后台，掌控您的项目管理平台
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20">
              <div className="flex items-center space-x-2 text-sm">
                <Calendar className="w-4 h-4" />
                <span>
                  {new Date().toLocaleDateString('zh-CN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    weekday: 'long',
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {statCards.map((card, index) => {
          const gradientColors = {
            'bg-blue-500': 'from-blue-500 to-blue-600',
            'bg-green-500': 'from-green-500 to-emerald-600',
            'bg-emerald-500': 'from-emerald-500 to-emerald-600',
            'bg-rose-500': 'from-rose-500 to-rose-600',
            'bg-purple-500': 'from-purple-500 to-violet-600',
            'bg-orange-500': 'from-orange-500 to-red-500',
            'bg-indigo-500': 'from-indigo-500 to-indigo-600',
            'bg-cyan-500': 'from-cyan-500 to-cyan-600',
          };
          return (
            <Link
              key={index}
              href={card.link}
              className="group bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:border-gray-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-600 mb-1">
                    {card.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 group-hover:text-gray-800 transition-colors">
                    {card.title === '平均分'
                      ? card.value.toFixed(1)
                      : card.value.toLocaleString()}
                    {card.suffix || ''}
                  </p>
                  <div className="mt-2 flex items-center text-xs text-green-600">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    <span>较上月增长</span>
                  </div>
                </div>
                <div
                  className={`w-14 h-14 bg-gradient-to-br ${gradientColors[card.color as keyof typeof gradientColors]} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                >
                  <card.icon className="w-7 h-7 text-white" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* 快捷操作 */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Settings className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">快捷操作</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => {
            const gradientColors = {
              'bg-blue-500': 'from-blue-500 to-blue-600',
              'bg-green-500': 'from-green-500 to-emerald-600',
              'bg-purple-500': 'from-purple-500 to-violet-600',
              'bg-orange-500': 'from-orange-500 to-red-500',
              'bg-indigo-500': 'from-indigo-500 to-indigo-600',
              'bg-cyan-500': 'from-cyan-500 to-cyan-600',
            };
            return (
              <Link
                key={index}
                href={action.link}
                className="group p-6 bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl hover:border-gray-300 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              >
                <div
                  className={`w-12 h-12 bg-gradient-to-br ${gradientColors[action.color as keyof typeof gradientColors]} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                >
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2 group-hover:text-gray-800 transition-colors">
                  {action.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {action.description}
                </p>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 最近活动 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 最近案例 */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">最近案例</h2>
            </div>
            <Link
              href="/admin/cases"
              className="text-sm font-semibold text-blue-600 hover:text-blue-500 transition-colors"
            >
              查看全部 →
            </Link>
          </div>
          <div className="space-y-4">
            {stats.recentCases.length > 0 ? (
              stats.recentCases.map((case_study) => (
                <div
                  key={case_study.id}
                  className="group flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 border border-blue-100"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate group-hover:text-blue-700 transition-colors">
                      {case_study.title}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {new Date(case_study.created_at).toLocaleDateString(
                        'zh-CN',
                        {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        }
                      )}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">暂无案例</p>
              </div>
            )}
          </div>
        </div>

        {/* 最近文章 */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <Download className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">最近文章</h2>
            </div>
            <Link
              href="/admin/resources"
              className="text-sm font-semibold text-green-600 hover:text-green-500 transition-colors"
            >
              查看全部 →
            </Link>
          </div>
          <div className="space-y-4">
            {stats.recentArticles.length > 0 ? (
              stats.recentArticles.map((article) => (
                <div
                  key={article.id}
                  className="group flex items-center space-x-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl hover:from-green-100 hover:to-emerald-100 transition-all duration-200 border border-green-100"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <Download className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate group-hover:text-green-700 transition-colors">
                      {article.title}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {new Date(article.created_at).toLocaleDateString(
                        'zh-CN',
                        {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        }
                      )}
                    </p>
                  </div>
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <Eye className="w-3 h-3" />
                    <span>{article.view_count || 0}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Download className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">暂无文章</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 系统状态 */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              systemStatus.overall === 'healthy'
                ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                : systemStatus.overall === 'unhealthy'
                  ? 'bg-gradient-to-r from-red-500 to-red-600'
                  : 'bg-gradient-to-r from-yellow-500 to-orange-600'
            }`}
          >
            <Activity className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">系统状态</h2>
          {statusLoading ? (
            <div className="ml-auto flex items-center space-x-2">
              <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
              <span className="text-xs text-gray-500">检查中...</span>
            </div>
          ) : (
            <div
              className={`ml-auto px-3 py-1 text-xs font-semibold rounded-full ${
                systemStatus.overall === 'healthy'
                  ? 'bg-green-100 text-green-700'
                  : systemStatus.overall === 'unhealthy'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-yellow-100 text-yellow-700'
              }`}
            >
              {systemStatus.overall === 'healthy'
                ? '全部正常'
                : systemStatus.overall === 'unhealthy'
                  ? '存在问题'
                  : '检查中'}
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 数据库连接状态 */}
          <div
            className={`flex items-center space-x-4 p-4 rounded-xl border ${
              systemStatus.database.status === 'healthy'
                ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-100'
                : systemStatus.database.status === 'unhealthy'
                  ? 'bg-gradient-to-r from-red-50 to-red-50 border-red-100'
                  : 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-100'
            }`}
          >
            {statusLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
            ) : systemStatus.database.status === 'healthy' ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : systemStatus.database.status === 'unhealthy' ? (
              <AlertCircle className="w-4 h-4 text-red-500" />
            ) : (
              <div className="w-4 h-4 bg-yellow-500 rounded-full animate-pulse" />
            )}
            <div className="flex-1">
              <span className="text-sm font-semibold text-gray-900">
                数据库连接
              </span>
              <p
                className={`text-xs mt-1 ${
                  systemStatus.database.status === 'healthy'
                    ? 'text-green-600'
                    : systemStatus.database.status === 'unhealthy'
                      ? 'text-red-600'
                      : 'text-yellow-600'
                }`}
              >
                {systemStatus.database.message}
                {systemStatus.database.responseTime && (
                  <span className="ml-1">
                    ({systemStatus.database.responseTime}ms)
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* 文件存储状态 */}
          <div
            className={`flex items-center space-x-4 p-4 rounded-xl border ${
              systemStatus.storage.status === 'healthy'
                ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100'
                : systemStatus.storage.status === 'unhealthy'
                  ? 'bg-gradient-to-r from-red-50 to-red-50 border-red-100'
                  : 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-100'
            }`}
          >
            {statusLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
            ) : systemStatus.storage.status === 'healthy' ? (
              <CheckCircle className="w-4 h-4 text-blue-500" />
            ) : systemStatus.storage.status === 'unhealthy' ? (
              <AlertCircle className="w-4 h-4 text-red-500" />
            ) : (
              <div className="w-4 h-4 bg-yellow-500 rounded-full animate-pulse" />
            )}
            <div className="flex-1">
              <span className="text-sm font-semibold text-gray-900">
                文件存储
              </span>
              <p
                className={`text-xs mt-1 ${
                  systemStatus.storage.status === 'healthy'
                    ? 'text-blue-600'
                    : systemStatus.storage.status === 'unhealthy'
                      ? 'text-red-600'
                      : 'text-yellow-600'
                }`}
              >
                {systemStatus.storage.message}
                {systemStatus.storage.responseTime && (
                  <span className="ml-1">
                    ({systemStatus.storage.responseTime}ms)
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* 认证服务状态 */}
          <div
            className={`flex items-center space-x-4 p-4 rounded-xl border ${
              systemStatus.auth.status === 'healthy'
                ? 'bg-gradient-to-r from-purple-50 to-violet-50 border-purple-100'
                : systemStatus.auth.status === 'unhealthy'
                  ? 'bg-gradient-to-r from-red-50 to-red-50 border-red-100'
                  : 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-100'
            }`}
          >
            {statusLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
            ) : systemStatus.auth.status === 'healthy' ? (
              <CheckCircle className="w-4 h-4 text-purple-500" />
            ) : systemStatus.auth.status === 'unhealthy' ? (
              <AlertCircle className="w-4 h-4 text-red-500" />
            ) : (
              <div className="w-4 h-4 bg-yellow-500 rounded-full animate-pulse" />
            )}
            <div className="flex-1">
              <span className="text-sm font-semibold text-gray-900">
                认证服务
              </span>
              <p
                className={`text-xs mt-1 ${
                  systemStatus.auth.status === 'healthy'
                    ? 'text-purple-600'
                    : systemStatus.auth.status === 'unhealthy'
                      ? 'text-red-600'
                      : 'text-yellow-600'
                }`}
              >
                {systemStatus.auth.message}
                {systemStatus.auth.responseTime && (
                  <span className="ml-1">
                    ({systemStatus.auth.responseTime}ms)
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 额度监控 */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              quotaData.overall === 'normal'
                ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                : quotaData.overall === 'warning'
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-600'
                  : 'bg-gradient-to-r from-red-500 to-red-600'
            }`}
          >
            <Gauge className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">服务额度监控</h2>
          {quotaLoading ? (
            <div className="ml-auto flex items-center space-x-2">
              <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
              <span className="text-xs text-gray-500">检查中...</span>
            </div>
          ) : (
            <div
              className={`ml-auto px-3 py-1 text-xs font-semibold rounded-full ${
                quotaData.overall === 'normal'
                  ? 'bg-green-100 text-green-700'
                  : quotaData.overall === 'warning'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-red-100 text-red-700'
              }`}
            >
              {quotaData.overall === 'normal'
                ? '使用正常'
                : quotaData.overall === 'warning'
                  ? '接近限制'
                  : '超出限制'}
            </div>
          )}
        </div>

        {/* Supabase 额度 */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Database className="w-5 h-5 text-green-600" />
            <h3 className="text-md font-semibold text-gray-900">
              Supabase 免费版额度
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 数据库大小 */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  数据库大小
                </span>
                <Database className="w-4 h-4 text-blue-600" />
              </div>
              <div className="mb-2">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>
                    {(
                      (quotaData.supabase.database?.used || 0) /
                      1024 /
                      1024
                    ).toFixed(1)}{' '}
                    MB
                  </span>
                  <span>
                    {(
                      (quotaData.supabase.database?.limit || 0) /
                      1024 /
                      1024
                    ).toFixed(0)}{' '}
                    MB
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      quotaData.supabase.database.status === 'normal'
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                        : quotaData.supabase.database.status === 'warning'
                          ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                          : 'bg-gradient-to-r from-red-500 to-red-600'
                    }`}
                    style={{
                      width: `${Math.min(quotaData.supabase.database?.percentage || 0, 100)}%`,
                    }}
                  />
                </div>
              </div>
              <div
                className={`text-xs font-semibold ${
                  quotaData.supabase.database?.status === 'normal'
                    ? 'text-blue-600'
                    : quotaData.supabase.database?.status === 'warning'
                      ? 'text-yellow-600'
                      : 'text-red-600'
                }`}
              >
                {(quotaData.supabase.database?.percentage || 0).toFixed(1)}%
                已使用
              </div>
            </div>

            {/* 存储空间 */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  存储空间
                </span>
                <HardDrive className="w-4 h-4 text-green-600" />
              </div>
              <div className="mb-2">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>
                    {(
                      (quotaData.supabase.storage?.used || 0) /
                      1024 /
                      1024
                    ).toFixed(1)}{' '}
                    MB
                  </span>
                  <span>
                    {(
                      (quotaData.supabase.storage?.limit || 0) /
                      1024 /
                      1024 /
                      1024
                    ).toFixed(0)}{' '}
                    GB
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      quotaData.supabase.storage.status === 'normal'
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                        : quotaData.supabase.storage.status === 'warning'
                          ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                          : 'bg-gradient-to-r from-red-500 to-red-600'
                    }`}
                    style={{
                      width: `${Math.min(quotaData.supabase.storage?.percentage || 0, 100)}%`,
                    }}
                  />
                </div>
              </div>
              <div
                className={`text-xs font-semibold ${
                  quotaData.supabase.storage?.status === 'normal'
                    ? 'text-green-600'
                    : quotaData.supabase.storage?.status === 'warning'
                      ? 'text-yellow-600'
                      : 'text-red-600'
                }`}
              >
                {(quotaData.supabase.storage?.percentage || 0).toFixed(1)}%
                已使用
              </div>
            </div>

            {/* API 请求 */}
            <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-4 border border-purple-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  API 请求
                </span>
                <Zap className="w-4 h-4 text-purple-600" />
              </div>
              <div className="mb-2">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>
                    {(
                      quotaData.supabase.apiRequests?.used || 0
                    ).toLocaleString()}
                  </span>
                  <span>
                    {(
                      quotaData.supabase.apiRequests?.limit || 0
                    ).toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      quotaData.supabase.apiRequests?.status === 'normal'
                        ? 'bg-gradient-to-r from-purple-500 to-violet-600'
                        : quotaData.supabase.apiRequests?.status === 'warning'
                          ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                          : 'bg-gradient-to-r from-red-500 to-red-600'
                    }`}
                    style={{
                      width: `${Math.min(quotaData.supabase.apiRequests?.percentage || 0, 100)}%`,
                    }}
                  />
                </div>
              </div>
              <div
                className={`text-xs font-semibold ${
                  quotaData.supabase.apiRequests?.status === 'normal'
                    ? 'text-purple-600'
                    : quotaData.supabase.apiRequests?.status === 'warning'
                      ? 'text-yellow-600'
                      : 'text-red-600'
                }`}
              >
                {(quotaData.supabase.apiRequests?.percentage || 0).toFixed(1)}%
                已使用
              </div>
            </div>

            {/* 月活跃用户 */}
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 border border-orange-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  月活跃用户
                </span>
                <Users className="w-4 h-4 text-orange-600" />
              </div>
              <div className="mb-2">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>
                    {(
                      quotaData.supabase.monthlyActiveUsers?.used || 0
                    ).toLocaleString()}
                  </span>
                  <span>
                    {(
                      quotaData.supabase.monthlyActiveUsers?.limit || 0
                    ).toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      quotaData.supabase.monthlyActiveUsers?.status === 'normal'
                        ? 'bg-gradient-to-r from-orange-500 to-red-500'
                        : quotaData.supabase.monthlyActiveUsers?.status ===
                            'warning'
                          ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                          : 'bg-gradient-to-r from-red-500 to-red-600'
                    }`}
                    style={{
                      width: `${Math.min(quotaData.supabase.monthlyActiveUsers?.percentage || 0, 100)}%`,
                    }}
                  />
                </div>
              </div>
              <div
                className={`text-xs font-semibold ${
                  quotaData.supabase.monthlyActiveUsers?.status === 'normal'
                    ? 'text-orange-600'
                    : quotaData.supabase.monthlyActiveUsers?.status ===
                        'warning'
                      ? 'text-yellow-600'
                      : 'text-red-600'
                }`}
              >
                {(
                  quotaData.supabase.monthlyActiveUsers?.percentage || 0
                ).toFixed(1)}
                % 已使用
              </div>
            </div>
          </div>
        </div>

        {/* Vercel 额度 */}
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <Globe className="w-5 h-5 text-black" />
            <h3 className="text-md font-semibold text-gray-900">
              Vercel 免费版额度
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 函数调用 */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  函数调用
                </span>
                <Server className="w-4 h-4 text-gray-600" />
              </div>
              <div className="mb-2">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>
                    {(quotaData.vercel.functions?.used || 0).toLocaleString()}
                  </span>
                  <span>
                    {(quotaData.vercel.functions?.limit || 0).toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      quotaData.vercel.functions?.status === 'normal'
                        ? 'bg-gradient-to-r from-gray-600 to-gray-700'
                        : quotaData.vercel.functions?.status === 'warning'
                          ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                          : 'bg-gradient-to-r from-red-500 to-red-600'
                    }`}
                    style={{
                      width: `${Math.min(quotaData.vercel.functions?.percentage || 0, 100)}%`,
                    }}
                  />
                </div>
              </div>
              <div
                className={`text-xs font-semibold ${
                  quotaData.vercel.functions?.status === 'normal'
                    ? 'text-gray-600'
                    : quotaData.vercel.functions?.status === 'warning'
                      ? 'text-yellow-600'
                      : 'text-red-600'
                }`}
              >
                {(quotaData.vercel.functions?.percentage || 0).toFixed(1)}%
                已使用
              </div>
            </div>

            {/* 带宽使用 */}
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-4 border border-indigo-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  带宽使用
                </span>
                <Globe className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="mb-2">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>
                    {(
                      (quotaData.vercel.bandwidth?.used || 0) /
                      1024 /
                      1024 /
                      1024
                    ).toFixed(2)}{' '}
                    GB
                  </span>
                  <span>
                    {(
                      (quotaData.vercel.bandwidth?.limit || 0) /
                      1024 /
                      1024 /
                      1024
                    ).toFixed(0)}{' '}
                    GB
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      quotaData.vercel.bandwidth?.status === 'normal'
                        ? 'bg-gradient-to-r from-indigo-500 to-blue-600'
                        : quotaData.vercel.bandwidth?.status === 'warning'
                          ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                          : 'bg-gradient-to-r from-red-500 to-red-600'
                    }`}
                    style={{
                      width: `${Math.min(quotaData.vercel.bandwidth?.percentage || 0, 100)}%`,
                    }}
                  />
                </div>
              </div>
              <div
                className={`text-xs font-semibold ${
                  quotaData.vercel.bandwidth?.status === 'normal'
                    ? 'text-indigo-600'
                    : quotaData.vercel.bandwidth?.status === 'warning'
                      ? 'text-yellow-600'
                      : 'text-red-600'
                }`}
              >
                {(quotaData.vercel.bandwidth?.percentage || 0).toFixed(1)}%
                已使用
              </div>
            </div>

            {/* 构建次数 */}
            <div className="bg-gradient-to-br from-cyan-50 to-teal-50 rounded-xl p-4 border border-cyan-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  构建次数
                </span>
                <Settings className="w-4 h-4 text-cyan-600" />
              </div>
              <div className="mb-2">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>
                    {(quotaData.vercel.builds?.used || 0).toLocaleString()}
                  </span>
                  <span>
                    {(quotaData.vercel.builds?.limit || 0).toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      quotaData.vercel.builds?.status === 'normal'
                        ? 'bg-gradient-to-r from-cyan-500 to-teal-600'
                        : quotaData.vercel.builds?.status === 'warning'
                          ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
                          : 'bg-gradient-to-r from-red-500 to-red-600'
                    }`}
                    style={{
                      width: `${Math.min(quotaData.vercel.builds?.percentage || 0, 100)}%`,
                    }}
                  />
                </div>
              </div>
              <div
                className={`text-xs font-semibold ${
                  quotaData.vercel.builds?.status === 'normal'
                    ? 'text-cyan-600'
                    : quotaData.vercel.builds?.status === 'warning'
                      ? 'text-yellow-600'
                      : 'text-red-600'
                }`}
              >
                {(quotaData.vercel.builds?.percentage || 0).toFixed(1)}% 已使用
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
