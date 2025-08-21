'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Clock, CheckCircle } from 'lucide-react';

interface Question {
  id: number;
  question_text: string;
  dimension: string;
  options: {
    index: number;
    text: string;
  }[];
}

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

interface AssessmentQuizProps {
  questions: Question[];
  onComplete: (data: AssessmentData) => void;
}

interface UserInfo {
  name?: string;
  email?: string;
  company?: string;
}

export default function AssessmentQuiz({
  questions,
  onComplete,
}: AssessmentQuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showUserForm, setShowUserForm] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo>({});
  const [submitting, setSubmitting] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);

  // 计时器
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const currentQuestion = questions[currentQuestionIndex];

  if (!currentQuestion) {
    return <div className="text-center py-8">加载中...</div>;
  }

  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const hasAnsweredCurrent =
    answers[currentQuestion?.id?.toString()] !== undefined;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (optionIndex: number) => {
    if (!currentQuestion) return;

    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id.toString()]: optionIndex,
    }));
  };

  const handleNext = () => {
    if (isLastQuestion) {
      setShowUserForm(true);
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  // 收集客户端信息的函数
  const getClientInfo = () => {
    let computerName = null;

    try {
      // 尝试从不同来源获取计算机名
      if (typeof window !== 'undefined') {
        // 从浏览器环境变量或其他可用信息推断
        computerName =
          // @ts-expect-error - userAgentData is experimental API
          window.navigator?.userAgentData?.platform ||
          window.navigator?.platform ||
          'Unknown';

        // 如果可能，尝试从其他来源获取更具体的计算机名
        // 注意：出于安全考虑，现代浏览器限制了对计算机名的直接访问
        if (computerName === 'Unknown' || computerName === 'Win32') {
          // 可以尝试从User-Agent中提取一些信息
          const userAgent = navigator.userAgent;
          if (userAgent.includes('Windows NT')) {
            computerName = 'Windows PC';
          } else if (userAgent.includes('Mac OS')) {
            computerName = 'Mac';
          } else if (userAgent.includes('Linux')) {
            computerName = 'Linux PC';
          }
        }
      }
    } catch (error) {
      console.log('无法获取计算机信息:', error);
      computerName = 'Unknown';
    }

    return {
      computerName,
      timestamp: new Date().toISOString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      screenResolution: `${screen.width}x${screen.height}`,
    };
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const clientInfo = getClientInfo();

      const response = await fetch('/api/assessment/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answers,
          userInfo,
          clientInfo,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        onComplete(data);
      } else {
        console.error('Failed to submit assessment');
      }
    } catch (error) {
      console.error('Error submitting assessment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const getDimensionColor = (dimension: string) => {
    const colors = {
      time_management: 'bg-blue-100 text-blue-800',
      resource_coordination: 'bg-green-100 text-green-800',
      risk_control: 'bg-orange-100 text-orange-800',
      team_collaboration: 'bg-purple-100 text-purple-800',
    };
    return (
      colors[dimension as keyof typeof colors] || 'bg-gray-100 text-gray-800'
    );
  };

  const getDimensionName = (dimension: string) => {
    const names = {
      time_management: '时间管理',
      resource_coordination: '资源协调',
      risk_control: '风险控制',
      team_collaboration: '团队协作',
    };
    return names[dimension as keyof typeof names] || dimension;
  };

  if (showUserForm) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              恭喜！您已完成所有题目
            </h2>
            <div className="bg-blue-50 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-semibold text-blue-900 mb-3">
                📧 获取完整测试报告
              </h3>
              <p className="text-blue-800 text-lg leading-relaxed">
                留下您的联系信息，我们将为您发送：
              </p>
              <ul className="text-blue-700 mt-3 space-y-2 text-left max-w-md mx-auto">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  详细的个人能力分析报告
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  完整的题目答案解析
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  个性化的CCMP学习建议
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  后续的项目管理学习资料
                </li>
              </ul>
            </div>
            <p className="text-gray-600">
              当然，您也可以选择跳过直接查看基础结果
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="flex items-center">
                  👤 姓名
                  <span className="text-green-600 text-xs ml-2 bg-green-100 px-2 py-1 rounded">
                    推荐填写
                  </span>
                </span>
              </label>
              <input
                type="text"
                value={userInfo.name || ''}
                onChange={(e) =>
                  setUserInfo((prev) => ({ ...prev, name: e.target.value }))
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="请输入您的姓名，用于个性化报告"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="flex items-center">
                  📧 邮箱地址
                  <span className="text-green-600 text-xs ml-2 bg-green-100 px-2 py-1 rounded">
                    强烈推荐
                  </span>
                </span>
              </label>
              <input
                type="email"
                value={userInfo.email || ''}
                onChange={(e) =>
                  setUserInfo((prev) => ({ ...prev, email: e.target.value }))
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="请输入您的邮箱地址"
              />
              <div className="mt-2 p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-green-800 font-medium mb-1">
                  ✅ 填写邮箱即可获得：
                </p>
                <p className="text-xs text-green-700">
                  • 完整PDF测试报告 • 详细答案解析 • 个性化学习路径 •
                  定期CCPM学习资料
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                公司/组织（可选）
              </label>
              <input
                type="text"
                value={userInfo.company || ''}
                onChange={(e) =>
                  setUserInfo((prev) => ({ ...prev, company: e.target.value }))
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="请输入您的公司或组织名称"
              />
            </div>

            <div className="flex flex-col gap-3 pt-6">
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2 inline-block"></div>
                    生成个性化报告中...
                  </>
                ) : (
                  <span className="flex items-center justify-center">
                    📊 生成我的测试报告
                    {(userInfo.email || userInfo.name) && (
                      <span className="ml-2 text-sm bg-white bg-opacity-20 px-2 py-1 rounded">
                        含邮件报告
                      </span>
                    )}
                  </span>
                )}
              </button>
              <button
                onClick={() => setShowUserForm(false)}
                className="w-full px-6 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                ← 返回修改答案
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">加载题目中...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* 进度条和状态 */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-600">
              题目 {currentQuestionIndex + 1} / {questions.length}
            </span>
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="w-4 h-4 mr-1" />
              {formatTime(timeElapsed)}
            </div>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${getDimensionColor(
              currentQuestion.dimension
            )}`}
          >
            {getDimensionName(currentQuestion.dimension)}
          </span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* 题目内容 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-2xl shadow-xl p-8 mb-8"
        >
          <h2
            className="text-2xl font-bold text-gray-900 mb-8 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: currentQuestion.question_text }}
          />

          <div className="space-y-4">
            {currentQuestion.options.map((option) => (
              <motion.button
                key={option.index}
                onClick={() => handleAnswerSelect(option.index)}
                className={`w-full p-6 text-left rounded-xl border-2 transition-all duration-200 ${
                  answers[currentQuestion.id.toString()] === option.index
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-start space-x-4">
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mt-1 ${
                      answers[currentQuestion.id.toString()] === option.index
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}
                  >
                    {answers[currentQuestion.id.toString()] ===
                      option.index && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900 leading-relaxed">
                      {option.text}
                    </p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* 导航按钮 */}
      <div className="flex justify-between items-center">
        <button
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          className="flex items-center px-6 py-3 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-5 h-5 mr-2" />
          上一题
        </button>

        <div className="text-center">
          <p className="text-sm text-gray-500">
            已回答 {Object.keys(answers).length} / {questions.length} 题
          </p>
        </div>

        <button
          onClick={handleNext}
          disabled={!hasAnsweredCurrent}
          className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isLastQuestion ? '完成测试' : '下一题'}
          <ChevronRight className="w-5 h-5 ml-2" />
        </button>
      </div>
    </div>
  );
}
