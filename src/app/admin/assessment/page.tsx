'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer,
} from 'recharts';
import {
  Users,
  TrendingUp,
  Mail,
  Calendar,
  Download,
  Search,
  Eye,
  BarChart3,
  BookOpen,
} from 'lucide-react';

interface AssessmentRecord {
  id: string;
  user_email: string;
  user_name: string;
  user_company: string;
  total_score: number;
  dimension_scores: Record<string, number>;
  assessment_level: string;
  completed_at: string;
  created_at: string;
}

interface EmailRecord {
  id: string;
  recipient_email: string;
  email_type: string;
  subject: string;
  sent_at: string;
  status: string;
  opened_at: string;
  clicked_at: string;
}

interface DashboardStats {
  totalAssessments: number;
  averageScore: number;
  emailsSent: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const dimensionNames = {
  time_management: '时间管理',
  resource_coordination: '资源协调',
  risk_control: '风险控制',
  team_collaboration: '团队协作',
};

const levelNames = {
  beginner: '初学者',
  intermediate: '进阶者',
  advanced: '专家级',
};

export default function AssessmentAdminPage() {
  const [assessments, setAssessments] = useState<AssessmentRecord[]>([]);
  const [emails, setEmails] = useState<EmailRecord[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalAssessments: 0,
    averageScore: 0,
    emailsSent: 0,
    openRate: 0,
    clickRate: 0,
    conversionRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange] = useState('7d');
  const [searchTerm, setSearchTerm] = useState('');

  const navigateToQuestions = () => {
    window.location.href = '/admin/questions';
  };

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 获取测试记录
      const assessmentResponse = await fetch('/api/assessment/analytics');
      if (assessmentResponse.ok) {
        const assessmentData = await assessmentResponse.json();
        setAssessments(assessmentData.assessments || []);
      }

      // 获取邮件记录
      const emailResponse = await fetch('/api/assessment/email');
      if (emailResponse.ok) {
        const emailData = await emailResponse.json();
        setEmails(emailData.emails || []);
      }

      // 计算统计数据
      calculateStats();
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const totalAssessments = assessments.length;
    const averageScore =
      assessments.length > 0
        ? assessments.reduce((sum, a) => sum + a.total_score, 0) /
          assessments.length
        : 0;

    const emailsSent = emails.length;
    const openedEmails = emails.filter((e) => e.opened_at).length;
    const clickedEmails = emails.filter((e) => e.clicked_at).length;

    const openRate = emailsSent > 0 ? (openedEmails / emailsSent) * 100 : 0;
    const clickRate = emailsSent > 0 ? (clickedEmails / emailsSent) * 100 : 0;

    // 简化的转化率计算（实际项目中需要更复杂的逻辑）
    const conversionRate =
      totalAssessments > 0
        ? (assessments.filter((a) => a.user_email).length / totalAssessments) *
          100
        : 0;

    setStats({
      totalAssessments,
      averageScore: Math.round(averageScore),
      emailsSent,
      openRate: Math.round(openRate),
      clickRate: Math.round(clickRate),
      conversionRate: Math.round(conversionRate),
    });
  };

  const getScoreDistribution = () => {
    const distribution = { '0-40': 0, '41-60': 0, '61-80': 0, '81-100': 0 };
    assessments.forEach((assessment) => {
      const score = assessment.total_score;
      if (score <= 40) distribution['0-40']++;
      else if (score <= 60) distribution['41-60']++;
      else if (score <= 80) distribution['61-80']++;
      else distribution['81-100']++;
    });

    return Object.entries(distribution).map(([range, count]) => ({
      range,
      count,
      percentage:
        assessments.length > 0
          ? Math.round((count / assessments.length) * 100)
          : 0,
    }));
  };

  const getLevelDistribution = () => {
    const distribution: Record<string, number> = {};
    assessments.forEach((assessment) => {
      const level = assessment.assessment_level;
      distribution[level] = (distribution[level] || 0) + 1;
    });

    return Object.entries(distribution).map(([level, count]) => ({
      level: levelNames[level as keyof typeof levelNames] || level,
      count,
      percentage:
        assessments.length > 0
          ? Math.round((count / assessments.length) * 100)
          : 0,
    }));
  };

  const getDimensionAverages = () => {
    if (assessments.length === 0) return [];

    const dimensionSums: Record<string, number> = {};
    const dimensionCounts: Record<string, number> = {};

    assessments.forEach((assessment) => {
      Object.entries(assessment.dimension_scores).forEach(
        ([dimension, score]) => {
          dimensionSums[dimension] = (dimensionSums[dimension] || 0) + score;
          dimensionCounts[dimension] = (dimensionCounts[dimension] || 0) + 1;
        }
      );
    });

    return Object.entries(dimensionSums).map(([dimension, sum]) => ({
      dimension:
        dimensionNames[dimension as keyof typeof dimensionNames] || dimension,
      average: dimensionCounts[dimension]
        ? Math.round(sum / dimensionCounts[dimension])
        : 0,
    }));
  };

  const getTimeSeriesData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map((date) => {
      const dayAssessments = assessments.filter(
        (a) => a.completed_at && a.completed_at.split('T')[0] === date
      ).length;

      return {
        date: date
          ? new Date(date).toLocaleDateString('zh-CN', {
              month: 'short',
              day: 'numeric',
            })
          : 'N/A',
        assessments: dayAssessments,
      };
    });
  };

  const filteredAssessments = assessments.filter(
    (assessment) =>
      assessment.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assessment.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assessment.user_company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 页面标题 */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                项目管理测试数据分析
              </h1>
              <p className="text-gray-600">
                查看测试数据、用户行为和邮件营销效果
              </p>
            </div>

            <button
              onClick={navigateToQuestions}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <BookOpen className="w-5 h-5 mr-2" />
              题库管理
            </button>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">总测试数</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalAssessments}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">平均得分</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.averageScore}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center">
              <Mail className="w-8 h-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">邮件发送</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.emailsSent}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center">
              <Eye className="w-8 h-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">邮件打开率</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.openRate}%
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-red-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">点击率</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.clickRate}%
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-indigo-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">转化率</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.conversionRate}%
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* 标签导航 */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', name: '概览', icon: BarChart3 },
                { id: 'assessments', name: '测试记录', icon: Users },
                { id: 'emails', name: '邮件营销', icon: Mail },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-2" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* 图表区域 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* 得分分布 */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      得分分布
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={getScoreDistribution()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="range" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* 水平分布 */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      水平分布
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={getLevelDistribution()}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ level, percentage }) =>
                            `${level} ${percentage}%`
                          }
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                        >
                          {getLevelDistribution().map((_, index) => (
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

                  {/* 维度平均分 */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      各维度平均分
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={getDimensionAverages()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="dimension" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Bar dataKey="average" fill="#10b981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* 时间趋势 */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      测试趋势（近7天）
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={getTimeSeriesData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="assessments"
                          stroke="#8b5cf6"
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'assessments' && (
              <div>
                {/* 搜索和过滤 */}
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="搜索用户邮箱、姓名或公司..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-80"
                      />
                    </div>
                  </div>
                  <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    <Download className="w-4 h-4 mr-2" />
                    导出数据
                  </button>
                </div>

                {/* 测试记录表格 */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          用户信息
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          总分
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          水平
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          完成时间
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          操作
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredAssessments.map((assessment) => (
                        <tr key={assessment.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {assessment.user_name || '匿名用户'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {assessment.user_email}
                              </div>
                              {assessment.user_company && (
                                <div className="text-sm text-gray-500">
                                  {assessment.user_company}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`text-sm font-medium ${
                                assessment.total_score >= 80
                                  ? 'text-green-600'
                                  : assessment.total_score >= 60
                                    ? 'text-yellow-600'
                                    : 'text-red-600'
                              }`}
                            >
                              {assessment.total_score}分
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                assessment.assessment_level === 'advanced'
                                  ? 'bg-green-100 text-green-800'
                                  : assessment.assessment_level ===
                                      'intermediate'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {
                                levelNames[
                                  assessment.assessment_level as keyof typeof levelNames
                                ]
                              }
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {assessment.completed_at
                              ? new Date(
                                  assessment.completed_at
                                ).toLocaleString('zh-CN')
                              : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button className="text-blue-600 hover:text-blue-900">
                              查看详情
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'emails' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  邮件发送记录
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          收件人
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          邮件类型
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          主题
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          发送时间
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          状态
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {emails.map((email) => (
                        <tr key={email.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {email.recipient_email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {email.email_type}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {email.subject}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(email.sent_at).toLocaleString('zh-CN')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                email.status === 'sent'
                                  ? 'bg-green-100 text-green-800'
                                  : email.status === 'failed'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {email.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
