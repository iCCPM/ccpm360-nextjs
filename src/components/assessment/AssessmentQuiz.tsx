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

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const response = await fetch('/api/assessment/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answers,
          userInfo,
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
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              测试完成！
            </h2>
            <p className="text-gray-600">
              您已完成所有{questions.length}道题目，用时{' '}
              {formatTime(timeElapsed)}
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                姓名（可选）
              </label>
              <input
                type="text"
                value={userInfo.name || ''}
                onChange={(e) =>
                  setUserInfo((prev) => ({ ...prev, name: e.target.value }))
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="请输入您的姓名"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                邮箱（可选）
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
              <p className="text-xs text-gray-500 mt-1">
                填写邮箱可获得详细的PDF报告和后续的CCPM学习资料
              </p>
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

            <div className="flex gap-4 pt-4">
              <button
                onClick={() => setShowUserForm(false)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                返回修改答案
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2 inline-block"></div>
                    生成报告中...
                  </>
                ) : (
                  '查看测试结果'
                )}
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
