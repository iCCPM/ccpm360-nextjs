'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Clock,
  Users,
  Shield,
  Target,
  Download,
  Phone,
  ArrowRight,
  Star,
  CheckCircle,
  AlertCircle,
  Info,
} from 'lucide-react';

interface AssessmentData {
  id: string;
  totalScore: number;
  dimensionScores: Record<string, number>;
  advice: {
    level: string;
    levelDescription: string;
    overallAdvice: string;
    dimensionAdvice: Record<string, string>;
    nextSteps: string[];
  };
  completedAt: string;
}

interface AssessmentResultProps {
  data: AssessmentData;
  onRetake?: () => void;
}

const dimensionConfig = {
  time_management: {
    name: '时间管理',
    icon: Clock,
    color: 'blue',
    description: '项目时间规划与控制能力',
  },
  resource_coordination: {
    name: '资源协调',
    icon: Users,
    color: 'green',
    description: '资源分配与协调能力',
  },
  risk_control: {
    name: '风险控制',
    icon: Shield,
    color: 'orange',
    description: '项目风险识别与控制能力',
  },
  team_collaboration: {
    name: '团队协作',
    icon: Target,
    color: 'purple',
    description: '团队沟通与协作能力',
  },
};

const levelConfig = {
  beginner: {
    name: '初学者',
    color: 'red',
    icon: AlertCircle,
    description: '建议系统学习项目管理基础知识',
  },
  intermediate: {
    name: '进阶者',
    color: 'yellow',
    icon: Info,
    description: '具备一定基础，可进一步提升',
  },
  advanced: {
    name: '专家级',
    color: 'green',
    icon: CheckCircle,
    description: '项目管理能力优秀',
  },
};

export default function AssessmentResult({
  data,
  onRetake,
}: AssessmentResultProps) {
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactInfo, setContactInfo] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBarColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // 这里可以集成邮件发送或CRM系统
    console.log('Contact form submitted:', contactInfo);
    alert('感谢您的咨询，我们会尽快与您联系！');
    setShowContactForm(false);
  };

  const currentLevel =
    levelConfig[data.advice.level as keyof typeof levelConfig] ||
    levelConfig.beginner;
  const LevelIcon = currentLevel.icon;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* 总体结果卡片 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100"
      >
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <LevelIcon
              className={`w-12 h-12 text-${currentLevel.color}-500 mr-3`}
            />
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                您的项目管理水平：{currentLevel.name}
              </h2>
              <p className="text-gray-600 mt-1">{currentLevel.description}</p>
            </div>
          </div>

          <div className="flex items-center justify-center space-x-8 mt-6">
            <div className="text-center">
              <div
                className={`text-4xl font-bold ${getScoreColor(data.totalScore)}`}
              >
                {data.totalScore}分
              </div>
              <div className="text-sm text-gray-500">总体得分</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-700">
                {new Date(data.completedAt).toLocaleDateString()}
              </div>
              <div className="text-sm text-gray-500">测试日期</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">整体评价</h3>
          <p className="text-gray-700 leading-relaxed">
            {data.advice.overallAdvice}
          </p>
        </div>
      </motion.div>

      {/* 维度分析 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl shadow-xl p-8"
      >
        <h3 className="text-2xl font-bold text-gray-900 mb-6">能力维度分析</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(data.dimensionScores).map(([dimension, score]) => {
            const config =
              dimensionConfig[dimension as keyof typeof dimensionConfig];
            if (!config) return null;

            const Icon = config.icon;

            return (
              <motion.div
                key={dimension}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-gray-50 rounded-xl p-6"
              >
                <div className="flex items-center mb-4">
                  <Icon className={`w-8 h-8 text-${config.color}-500 mr-3`} />
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">
                      {config.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {config.description}
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      得分
                    </span>
                    <span
                      className={`text-lg font-bold ${getScoreColor(score)}`}
                    >
                      {score}分
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <motion.div
                      className={`h-3 rounded-full ${getScoreBarColor(score)}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${score}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </div>
                </div>

                <div className="text-sm text-gray-700">
                  {data.advice.dimensionAdvice[dimension]}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* 改进建议 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl shadow-xl p-8"
      >
        <h3 className="text-2xl font-bold text-gray-900 mb-6">提升建议</h3>

        <div className="space-y-4">
          {data.advice.nextSteps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              className="flex items-start space-x-4 p-4 bg-blue-50 rounded-lg"
            >
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                {index + 1}
              </div>
              <p className="text-gray-700 leading-relaxed">{step}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* CCPM介绍和转化 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-8 text-white"
      >
        <div className="text-center mb-8">
          <h3 className="text-3xl font-bold mb-4">关键链项目管理（CCPM）</h3>
          <p className="text-xl text-indigo-100">
            突破传统项目管理瓶颈，实现项目成功率提升30%+
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="text-center">
            <TrendingUp className="w-12 h-12 mx-auto mb-4 text-yellow-300" />
            <h4 className="text-lg font-semibold mb-2">效率提升</h4>
            <p className="text-indigo-100">平均项目周期缩短25%</p>
          </div>
          <div className="text-center">
            <Star className="w-12 h-12 mx-auto mb-4 text-yellow-300" />
            <h4 className="text-lg font-semibold mb-2">成功率提升</h4>
            <p className="text-indigo-100">项目按时完成率达90%+</p>
          </div>
          <div className="text-center">
            <Target className="w-12 h-12 mx-auto mb-4 text-yellow-300" />
            <h4 className="text-lg font-semibold mb-2">资源优化</h4>
            <p className="text-indigo-100">资源利用率提升40%</p>
          </div>
        </div>

        <div className="text-center">
          <p className="text-lg text-indigo-100 mb-6">
            想了解CCPM如何帮助您的项目管理更上一层楼？
          </p>
          <button
            onClick={() => setShowContactForm(true)}
            className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center"
          >
            免费咨询CCPM解决方案
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        </div>
      </motion.div>

      {/* 操作按钮 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="flex flex-col sm:flex-row gap-4 justify-center"
      >
        <button
          onClick={() => window.print()}
          className="flex items-center justify-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          <Download className="w-5 h-5 mr-2" />
          下载PDF报告
        </button>

        <button
          onClick={onRetake}
          className="flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          重新测试
        </button>

        <button
          onClick={() => setShowContactForm(true)}
          className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Phone className="w-5 h-5 mr-2" />
          联系专家
        </button>
      </motion.div>

      {/* 联系表单模态框 */}
      {showContactForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowContactForm(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-8 max-w-md w-full"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-6">联系我们</h3>

            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  姓名 *
                </label>
                <input
                  type="text"
                  required
                  value={contactInfo.name}
                  onChange={(e) =>
                    setContactInfo((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="请输入您的姓名"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  邮箱 *
                </label>
                <input
                  type="email"
                  required
                  value={contactInfo.email}
                  onChange={(e) =>
                    setContactInfo((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="请输入您的邮箱"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  电话
                </label>
                <input
                  type="tel"
                  value={contactInfo.phone}
                  onChange={(e) =>
                    setContactInfo((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="请输入您的联系电话"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  咨询内容
                </label>
                <textarea
                  value={contactInfo.message}
                  onChange={(e) =>
                    setContactInfo((prev) => ({
                      ...prev,
                      message: e.target.value,
                    }))
                  }
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="请描述您的项目管理需求或问题"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowContactForm(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  提交咨询
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
