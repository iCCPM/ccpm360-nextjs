'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight,
  Clock,
  Users,
  Target,
  Shield,
  CheckCircle,
} from 'lucide-react';
import AssessmentQuiz from '@/components/assessment/AssessmentQuiz';
import AssessmentResult from '@/components/assessment/AssessmentResult';

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
  name?: string; // 用户姓名，用于个性化称呼
}

type AssessmentStep = 'intro' | 'quiz' | 'result';

export default function AssessmentPage() {
  const [currentStep, setCurrentStep] = useState<AssessmentStep>('intro');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [assessmentData, setAssessmentData] = useState<AssessmentData | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  const handleStartAssessment = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/assessment/questions');
      if (response.ok) {
        const data = await response.json();
        setQuestions(data.questions);
        setCurrentStep('quiz');
      } else {
        console.error('Failed to fetch questions');
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuizComplete = (data: AssessmentData) => {
    setAssessmentData(data);
    setCurrentStep('result');
  };

  const handleRetakeAssessment = () => {
    setCurrentStep('intro');
    setAssessmentData(null);
    setQuestions([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {currentStep === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="max-w-4xl mx-auto"
            >
              {/* 头部标题 */}
              <div className="text-center mb-12">
                <motion.h1
                  className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  项目管理思维诊断器
                </motion.h1>
                <motion.p
                  className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  通过10道精心设计的情景题，发现您的项目管理思维模式，
                  <br className="hidden md:block" />
                  了解关键链项目管理（CCPM）如何提升您的项目成功率
                </motion.p>
              </div>

              {/* 特色介绍 */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {[
                  {
                    icon: Clock,
                    title: '时间管理',
                    description: '评估您对项目时间规划和缓冲管理的理解',
                    color: 'text-blue-600',
                  },
                  {
                    icon: Users,
                    title: '资源协调',
                    description: '测试您在多项目环境下的资源分配能力',
                    color: 'text-green-600',
                  },
                  {
                    icon: Shield,
                    title: '风险控制',
                    description: '检验您对项目风险识别和应对的方法',
                    color: 'text-orange-600',
                  },
                  {
                    icon: Target,
                    title: '团队协作',
                    description: '分析您在跨部门协作中的管理思维',
                    color: 'text-purple-600',
                  },
                ].map((item, index) => (
                  <motion.div
                    key={item.title}
                    className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                  >
                    <item.icon className={`w-12 h-12 ${item.color} mb-4`} />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {item.description}
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* 测试说明 */}
              <motion.div
                className="bg-white rounded-2xl p-8 shadow-lg mb-8"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                  测试说明
                </h2>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-bold text-blue-600">
                        10
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      精选题目
                    </h3>
                    <p className="text-gray-600 text-sm">
                      10道基于真实项目场景的选择题
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Clock className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      5分钟完成
                    </h3>
                    <p className="text-gray-600 text-sm">
                      平均每题30秒，轻松完成测试
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      专业报告
                    </h3>
                    <p className="text-gray-600 text-sm">
                      获得个性化的能力分析和改进建议
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* 开始按钮 */}
              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
              >
                <button
                  onClick={handleStartAssessment}
                  disabled={loading}
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      加载中...
                    </>
                  ) : (
                    <>
                      开始测试
                      <ChevronRight className="ml-2 w-5 h-5" />
                    </>
                  )}
                </button>
                <p className="text-gray-500 text-sm mt-4">
                  完全免费 • 无需注册 • 即时获得结果
                </p>
              </motion.div>
            </motion.div>
          )}

          {currentStep === 'quiz' && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
            >
              <AssessmentQuiz
                questions={questions}
                onComplete={handleQuizComplete}
              />
            </motion.div>
          )}

          {currentStep === 'result' && assessmentData && (
            <motion.div
              key="result"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
            >
              <AssessmentResult
                data={assessmentData}
                onRetake={handleRetakeAssessment}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
