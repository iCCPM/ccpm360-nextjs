'use client';

import { useState, useEffect } from 'react';
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
  BookOpen,
  ChevronDown,
  ChevronUp,
  Loader,
} from 'lucide-react';
// EmailJS导入已移除，现在只使用SMTP邮件发送

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
  name?: string; // 用户姓名，用于个性化称呼
  userAnswers?: Record<string, number>;
  questions?: {
    id: number;
    question_text: string;
    dimension: string;
    explanation?: string;
    options: any[];
    correct_answer?: number;
  }[];
}

interface Question {
  id: number;
  question_text: string;
  dimension: string;
  explanation?: string;
  options: {
    index: number;
    text: string;
  }[];
}

interface AssessmentResultProps {
  data: AssessmentData;
  onRetake?: () => void;
}

// 生成个性化问候语的辅助函数
const generatePersonalizedGreeting = (userName?: string) => {
  if (userName && userName.trim()) {
    return `${userName.trim()}，您的测评结果如下`;
  }
  return '您的测评结果如下';
};

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
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showExplanations, setShowExplanations] = useState(false);
  const [expandedDimensions, setExpandedDimensions] = useState<
    Record<string, boolean>
  >({});
  const [contactInfo, setContactInfo] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    message: '',
  });
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);

  // 获取题目数据
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch('/api/assessment/questions');
        if (response.ok) {
          const data = await response.json();
          setQuestions(data.questions);
        }
      } catch (error) {
        console.error('Error fetching questions:', error);
      }
    };
    fetchQuestions();
  }, []);

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

  // 按维度分组题目
  const groupQuestionsByDimension = () => {
    const grouped: Record<string, Question[]> = {};
    questions.forEach((question) => {
      if (!grouped[question.dimension]) {
        grouped[question.dimension] = [];
      }
      grouped[question.dimension]?.push(question);
    });
    return grouped;
  };

  // 切换维度展开状态
  const toggleDimension = (dimension: string) => {
    setExpandedDimensions((prev) => ({
      ...prev,
      [dimension]: !prev[dimension],
    }));
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingContact(true);

    try {
      // 调用服务器端SMTP邮件发送API
      const response = await fetch('/api/assessment/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientEmail: contactInfo.email,
          type: 'contact_inquiry',
          data: {
            userName: contactInfo.name,
            userEmail: contactInfo.email,
            userPhone: contactInfo.phone,
            userCompany: contactInfo.company,
            userPosition: contactInfo.position,
            userMessage: contactInfo.message,
            // 移除嵌套的assessmentData，直接添加必要的评估信息
            id: data.id,
            totalScore: data.totalScore,
            level: data.advice?.level || '',
          },
        }),
      });

      const result = await response.json();

      if (response.ok) {
        // SMTP邮件发送成功
        alert('感谢您的咨询！邮件发送成功，我们会尽快与您联系！');
        setShowContactForm(false);
        setContactInfo({
          name: '',
          email: '',
          phone: '',
          company: '',
          position: '',
          message: '',
        });
      } else {
        throw new Error(result.error || '邮件发送失败');
      }
    } catch (error) {
      console.error('邮件发送失败:', error);
      alert(
        '抱歉，邮件发送失败，请稍后重试或直接联系我们。可能的原因：网络连接问题或邮件服务暂时不可用。'
      );
    } finally {
      setIsSubmittingContact(false);
    }
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
          {/* 个性化问候语 */}
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-800 mb-2">
              {generatePersonalizedGreeting(data.name)}
            </h1>
          </div>

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
                {data.totalScore || 0}分
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

      {/* 题目解析 */}
      {questions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <BookOpen className="w-8 h-8 text-indigo-600 mr-3" />
              <h3 className="text-2xl font-bold text-gray-900">题目解析</h3>
            </div>
            <button
              onClick={() => setShowExplanations(!showExplanations)}
              className="flex items-center px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors"
            >
              {showExplanations ? (
                <>
                  <ChevronUp className="w-5 h-5 mr-2" />
                  收起解析
                </>
              ) : (
                <>
                  <ChevronDown className="w-5 h-5 mr-2" />
                  查看解析
                </>
              )}
            </button>
          </div>

          {showExplanations && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-6"
            >
              {Object.entries(groupQuestionsByDimension()).map(
                ([dimension, dimensionQuestions]) => {
                  const config =
                    dimensionConfig[dimension as keyof typeof dimensionConfig];
                  if (!config) return null;

                  const Icon = config.icon;
                  const isExpanded = expandedDimensions[dimension];

                  return (
                    <div
                      key={dimension}
                      className="border border-gray-200 rounded-xl overflow-hidden"
                    >
                      <button
                        onClick={() => toggleDimension(dimension)}
                        className="w-full flex items-center justify-between p-6 bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center">
                          <Icon
                            className={`w-6 h-6 text-${config.color}-500 mr-3`}
                          />
                          <div className="text-left">
                            <h4 className="text-lg font-semibold text-gray-900">
                              {config.name}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {dimensionQuestions.length} 道题目
                            </p>
                          </div>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-gray-500" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-500" />
                        )}
                      </button>

                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="p-6 space-y-6 bg-white"
                        >
                          {dimensionQuestions.map((question, index) => {
                            // 使用data.questions中的题目信息，如果没有则使用原有的questions
                            const questionData =
                              data.questions?.find(
                                (q) => q.id === question.id
                              ) || question;

                            return (
                              <div
                                key={question.id}
                                className="border-l-4 border-indigo-200 pl-6"
                              >
                                <div className="mb-3">
                                  <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 text-sm font-medium rounded-full mb-2">
                                    题目 {index + 1}
                                  </span>
                                  <h5 className="text-lg font-medium text-gray-900 mb-2">
                                    {questionData.question_text}
                                  </h5>
                                </div>

                                {/* 显示选项和用户答案 */}
                                {questionData.options && data.userAnswers && (
                                  <div className="mb-4">
                                    <div className="space-y-2">
                                      {questionData.options.map(
                                        (option: any, optionIndex: number) => {
                                          const userAnswer =
                                            data.userAnswers?.[
                                              questionData.id.toString()
                                            ];
                                          const isUserChoice =
                                            userAnswer === optionIndex;
                                          const isCorrect =
                                            (questionData as any)
                                              .correct_answer === optionIndex;

                                          let optionClass =
                                            'p-3 rounded-lg border ';
                                          if (isUserChoice && isCorrect) {
                                            optionClass +=
                                              'bg-green-100 border-green-300 text-green-800';
                                          } else if (
                                            isUserChoice &&
                                            !isCorrect
                                          ) {
                                            optionClass +=
                                              'bg-red-100 border-red-300 text-red-800';
                                          } else if (isCorrect) {
                                            optionClass +=
                                              'bg-green-50 border-green-200 text-green-700';
                                          } else {
                                            optionClass +=
                                              'bg-gray-50 border-gray-200 text-gray-700';
                                          }

                                          return (
                                            <div
                                              key={optionIndex}
                                              className={optionClass}
                                            >
                                              <div className="flex items-center justify-between">
                                                <span className="text-sm">
                                                  {String.fromCharCode(
                                                    65 + optionIndex
                                                  )}
                                                  . {option.text || option}
                                                </span>
                                                <div className="flex items-center space-x-2">
                                                  {isUserChoice && (
                                                    <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                                                      您的选择
                                                    </span>
                                                  )}
                                                  {isCorrect && (
                                                    <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                                                      正确答案
                                                    </span>
                                                  )}
                                                </div>
                                              </div>
                                            </div>
                                          );
                                        }
                                      )}
                                    </div>
                                  </div>
                                )}

                                {questionData.explanation && (
                                  <div className="bg-blue-50 rounded-lg p-4">
                                    <h6 className="text-sm font-semibold text-blue-900 mb-2">
                                      解析说明：
                                    </h6>
                                    <div
                                      className="text-sm text-blue-800 leading-relaxed"
                                      dangerouslySetInnerHTML={{
                                        __html: questionData.explanation,
                                      }}
                                    />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </motion.div>
                      )}
                    </div>
                  );
                }
              )}
            </motion.div>
          )}
        </motion.div>
      )}

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
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto"
          onClick={() => setShowContactForm(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-md sm:max-w-lg mx-auto my-8 max-h-[90vh] overflow-y-auto"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
              联系我们
            </h3>

            <form
              onSubmit={handleContactSubmit}
              className="space-y-3 sm:space-y-4"
            >
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
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
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
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
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
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="请输入您的联系电话"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  公司
                </label>
                <input
                  type="text"
                  value={contactInfo.company}
                  onChange={(e) =>
                    setContactInfo((prev) => ({
                      ...prev,
                      company: e.target.value,
                    }))
                  }
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="请输入您的公司名称"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  职位
                </label>
                <input
                  type="text"
                  value={contactInfo.position}
                  onChange={(e) =>
                    setContactInfo((prev) => ({
                      ...prev,
                      position: e.target.value,
                    }))
                  }
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="请输入您的职位"
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
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base resize-none"
                  placeholder="请描述您的项目管理需求或问题"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6">
                <button
                  type="button"
                  onClick={() => setShowContactForm(false)}
                  disabled={isSubmittingContact}
                  className="flex-1 px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingContact}
                  className="flex-1 px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center text-sm sm:text-base"
                >
                  {isSubmittingContact ? (
                    <>
                      <Loader className="w-5 h-5 mr-2 animate-spin" />
                      发送中...
                    </>
                  ) : (
                    '提交咨询'
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
