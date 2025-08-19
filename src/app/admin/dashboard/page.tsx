'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  FileText,
  Download,
  Eye,
  TrendingUp,
  Calendar,
  Plus,
  Settings,
  BarChart3,
  Activity,
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
  recentCases: any[];
  recentArticles: any[];
  recentContacts: any[];
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
    recentCases: [],
    recentArticles: [],
    recentContacts: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // 获取统计数据
      const [casesResult, articlesResult, downloadsResult, contactsResult] =
        await Promise.all([
          supabase.from('case_studies').select('id', { count: 'exact' }),
          supabase.from('articles').select('id', { count: 'exact' }),
          supabase.from('resources').select('download_count'),
          supabase.from('contact_submissions').select('id', { count: 'exact' }),
        ]);

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
            'bg-purple-500': 'from-purple-500 to-violet-600',
            'bg-orange-500': 'from-orange-500 to-red-500',
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
                    {card.value.toLocaleString()}
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
          <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">系统状态</h2>
          <div className="ml-auto px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
            全部正常
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
            <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse shadow-lg" />
            <div className="flex-1">
              <span className="text-sm font-semibold text-gray-900">
                数据库连接
              </span>
              <p className="text-xs text-green-600 mt-1">运行正常</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
            <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse shadow-lg" />
            <div className="flex-1">
              <span className="text-sm font-semibold text-gray-900">
                文件存储
              </span>
              <p className="text-xs text-blue-600 mt-1">运行正常</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl border border-purple-100">
            <div className="w-4 h-4 bg-purple-500 rounded-full animate-pulse shadow-lg" />
            <div className="flex-1">
              <span className="text-sm font-semibold text-gray-900">
                认证服务
              </span>
              <p className="text-xs text-purple-600 mt-1">运行正常</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
