'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Target,
  TrendingUp,
  BookOpen,
  Award,
  Clock,
  CheckCircle,
  ArrowRight,
  Star,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

// 图标映射
const iconMap: { [key: string]: any } = {
  Target,
  TrendingUp,
  Users,
  BookOpen,
  Award,
  Clock,
  CheckCircle,
  Star,
};

interface TrainingCourse {
  id: string;
  title: string;
  level: string;
  duration: string;
  price: string;
  participants: string;
  description: string;
  features: string[];
  image_url?: string;
  is_active: boolean;
  sort_order: number;
}

interface ConsultingService {
  id: string;
  title: string;
  description: string;
  icon: string;
  process: string[];
  deliverables: string[];
  timeline: string;
  is_active: boolean;
  sort_order: number;
}

interface IndustrySolution {
  id: string;
  title: string;
  industry: string;
  challenges: string[];
  benefits: string[];
  features: string[];
  image_url?: string;
  is_active: boolean;
  sort_order: number;
}

export default function ServicesPage() {
  const [trainingCourses, setTrainingCourses] = useState<TrainingCourse[]>([]);
  const [consultingServices, setConsultingServices] = useState<
    ConsultingService[]
  >([]);
  const [solutions, setSolutions] = useState<IndustrySolution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadServicesData();
  }, []);

  const loadServicesData = async () => {
    try {
      setLoading(true);

      // 加载培训课程
      const { data: courses, error: coursesError } = await supabase
        .from('training_courses')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (coursesError) throw coursesError;
      setTrainingCourses(courses || []);

      // 加载咨询服务
      const { data: consulting, error: consultingError } = await supabase
        .from('consulting_services')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (consultingError) throw consultingError;
      setConsultingServices(consulting || []);

      // 加载行业解决方案
      const { data: industrySolutions, error: solutionsError } = await supabase
        .from('industry_solutions')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (solutionsError) throw solutionsError;
      setSolutions(industrySolutions || []);
    } catch (error) {
      console.error('加载服务数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* 页面标题 */}
      <section className="relative bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 text-white py-24 overflow-hidden">
        {/* 背景图案 */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.05%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center px-4 py-2 bg-blue-500/20 backdrop-blur-sm text-blue-200 rounded-full text-sm font-medium mb-6 border border-blue-400/30">
              <Award className="w-4 h-4 mr-2" />
              专业服务
            </div>
            <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl mb-6">
              <span className="bg-gradient-to-r from-blue-200 via-white to-purple-200 bg-clip-text text-transparent">
                全方位项目管理
              </span>
              <br />
              <span className="text-white">解决方案</span>
            </h1>
            <p className="mt-6 text-xl leading-8 text-blue-100 max-w-3xl mx-auto">
              从专业培训到定制咨询，提供完整的关键链项目管理服务体系，助力企业实现项目成功
            </p>

            {/* 服务特点 */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="flex items-center justify-center space-x-3 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <BookOpen className="h-6 w-6 text-blue-300" />
                <span className="text-white font-medium">系统化培训</span>
              </div>
              <div className="flex items-center justify-center space-x-3 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <Target className="h-6 w-6 text-purple-300" />
                <span className="text-white font-medium">定制化咨询</span>
              </div>
              <div className="flex items-center justify-center space-x-3 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <TrendingUp className="h-6 w-6 text-green-300" />
                <span className="text-white font-medium">行业解决方案</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 培训课程 */}
      <section className="py-24 sm:py-32 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-6">
              <BookOpen className="w-4 h-4 mr-2" />
              专业培训
            </div>
            <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl mb-4">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                系统化培训课程
              </span>
            </h2>
            <p className="mt-4 text-xl leading-8 text-gray-600 max-w-3xl mx-auto">
              从基础理论到高级实践，构建完整的CCPM知识体系，满足不同层次的学习需求
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              {trainingCourses.map((course) => (
                <div
                  key={course.id}
                  className="card-modern group overflow-hidden"
                >
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={course.image_url || '/placeholder-training.jpg'}
                      alt={course.title}
                      className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                    <div className="absolute top-4 left-4">
                      <span className="inline-flex items-center rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-4 py-2 text-sm font-bold text-white shadow-lg">
                        {course.level}
                      </span>
                    </div>
                    <div className="absolute top-4 right-4">
                      <span className="inline-flex items-center rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-lg">
                        <Clock className="w-4 h-4 mr-1" />
                        {course.duration}
                      </span>
                    </div>
                  </div>

                  <div className="p-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      {course.description}
                    </p>

                    <div className="mb-6">
                      <div className="flex items-center text-sm text-gray-600 mb-4 bg-gray-50 rounded-xl p-3">
                        <Users className="h-5 w-5 mr-3 text-blue-500" />
                        <span className="font-medium">适合对象：</span>
                        <span className="ml-1">{course.participants}</span>
                      </div>
                      <div className="flex items-center justify-between bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4">
                        <span className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                          {course.price}
                        </span>
                        <span className="text-sm text-gray-500 font-medium">
                          /人
                        </span>
                      </div>
                    </div>

                    <div className="mb-8">
                      <h4 className="font-bold text-gray-900 mb-4 text-lg">
                        课程内容：
                      </h4>
                      <ul className="space-y-3">
                        {course.features.map((feature, index) => (
                          <li
                            key={index}
                            className="flex items-start text-sm text-gray-600"
                          >
                            <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                            <span className="leading-relaxed">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Link
                      href="/contact"
                      className="btn-gradient-primary w-full flex items-center justify-center gap-3 group"
                    >
                      <span>立即报名</span>
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 咨询服务 */}
      <section className="bg-gray-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              咨询服务
            </h2>
            <p className="mt-4 text-lg leading-8 text-gray-600">
              专业的项目管理咨询服务，为企业提供定制化的CCPM实施方案
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              {consultingServices.map((service, index) => {
                const Icon = iconMap[service.icon] || Target;
                return (
                  <div key={index} className="card-modern">
                    <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg mb-6">
                      <Icon className="h-6 w-6 text-white" />
                    </div>

                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      {service.title}
                    </h3>
                    <p className="text-gray-600 mb-6">{service.description}</p>

                    <div className="mb-6">
                      <h4 className="font-medium text-gray-900 mb-3">
                        服务流程：
                      </h4>
                      <div className="space-y-2">
                        {service.process.map((step, stepIndex) => (
                          <div
                            key={stepIndex}
                            className="flex items-center text-sm text-gray-600"
                          >
                            <div className="w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-xs font-medium mr-3">
                              {stepIndex + 1}
                            </div>
                            {step}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mb-6">
                      <h4 className="font-medium text-gray-900 mb-2">
                        交付成果：
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {service.deliverables.map((deliverable, delIndex) => (
                          <span
                            key={delIndex}
                            className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800"
                          >
                            {deliverable}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-2 text-green-500" />
                        周期：{service.timeline}
                      </div>
                    </div>

                    <Link
                      href="/contact"
                      className="btn-gradient-secondary w-full flex items-center justify-center gap-2"
                    >
                      咨询详情
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 行业解决方案 */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              行业解决方案
            </h2>
            <p className="mt-4 text-lg leading-8 text-gray-600">
              针对不同行业特点，提供定制化的关键链项目管理解决方案
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-16">
              {solutions.map((solution, index) => (
                <div
                  key={index}
                  className={`grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-16 items-center ${
                    index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                  }`}
                >
                  <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                    <div className="relative overflow-hidden rounded-2xl shadow-2xl">
                      <img
                        src={solution.image_url || '/placeholder-office.jpg'}
                        alt={solution.title}
                        className="h-64 w-full object-cover lg:h-80"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 to-transparent" />
                      <div className="absolute bottom-4 left-4">
                        <span className="inline-flex items-center rounded-full bg-orange-500 px-3 py-1 text-sm font-medium text-white">
                          {solution.industry}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className={index % 2 === 1 ? 'lg:order-1' : ''}>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      {solution.title}
                    </h3>

                    <div className="mb-6">
                      <h4 className="font-medium text-gray-900 mb-3">
                        面临挑战：
                      </h4>
                      <ul className="space-y-2">
                        {solution.challenges.map(
                          (challenge, challengeIndex) => (
                            <li
                              key={challengeIndex}
                              className="flex items-center text-gray-600"
                            >
                              <div className="w-2 h-2 bg-red-400 rounded-full mr-3" />
                              {challenge}
                            </li>
                          )
                        )}
                      </ul>
                    </div>

                    <div className="mb-6">
                      <h4 className="font-medium text-gray-900 mb-3">
                        预期收益：
                      </h4>
                      <ul className="space-y-2">
                        {solution.benefits.map((benefit, benefitIndex) => (
                          <li
                            key={benefitIndex}
                            className="flex items-center text-gray-600"
                          >
                            <Star className="h-4 w-4 text-yellow-400 mr-3" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mb-8">
                      <h4 className="font-medium text-gray-900 mb-3">
                        核心功能：
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {solution.features.map((feature, featureIndex) => (
                          <div
                            key={featureIndex}
                            className="flex items-center text-sm text-gray-600"
                          >
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>

                    <Link
                      href="/contact"
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3 px-6 rounded-lg hover:from-orange-500 hover:to-orange-400 transition-all duration-200"
                    >
                      了解方案详情
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA区域 */}
      <section className="bg-gradient-to-r from-blue-800 to-blue-600">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              选择适合您的服务方案
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-blue-100">
              无论是培训、咨询还是定制化解决方案，我们都能为您提供专业的服务
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/contact"
                className="rounded-md bg-gradient-to-r from-orange-500 to-orange-400 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:from-orange-400 hover:to-orange-300 transition-all duration-200"
              >
                免费咨询
              </Link>
              <Link
                href="/cases"
                className="text-sm font-semibold leading-6 text-white hover:text-orange-300 transition-colors"
              >
                查看案例 <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
