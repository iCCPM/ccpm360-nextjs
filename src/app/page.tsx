'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Users, Target, TrendingUp, CheckCircle, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const services = [
  {
    icon: Users,
    title: '关键链项目管理培训',
    description: '专业的CCPM培训课程，帮助团队掌握关键链项目管理方法，提升项目执行效率。',
    features: ['理论基础', '实战案例', '工具应用', '认证考试']
  },
  {
    icon: Target,
    title: '项目管理咨询服务',
    description: '为企业提供定制化的项目管理咨询，优化项目流程，提升项目成功率。',
    features: ['流程诊断', '方案设计', '实施指导', '效果评估']
  },
  {
    icon: TrendingUp,
    title: '定制化解决方案',
    description: '根据企业特点和需求，提供个性化的关键链项目管理解决方案。',
    features: ['需求分析', '方案定制', '系统集成', '持续优化']
  }
];

const caseStudies = [
  {
    id: 1,
    client: '某大型制造企业',
    project: '生产线改造项目关键链管理实施',
    industry: '制造业',
    results: {
      efficiency: '30%',
      utilization: '25%',
      delivery: '95%'
    },
    description: '通过关键链项目管理方法，成功管理多条生产线同时改造的复杂项目。',
    image: 'https://trae-api-us.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20manufacturing%20facility%20with%20automated%20production%20lines%20and%20industrial%20equipment&image_size=landscape_4_3'
  },
  {
    id: 2,
    client: '某软件公司',
    project: '产品研发项目群管理优化',
    industry: 'IT软件',
    results: {
      efficiency: '40%',
      timeToMarket: '20%',
      collaboration: '显著改善'
    },
    description: '优化多个产品线的研发项目管理流程，提升团队协作效率。',
    image: '/placeholder-software.jpg'
  },
  {
    id: 3,
    client: '某建筑工程公司',
    project: '大型基础设施建设项目管理',
    industry: '建筑工程',
    results: {
      schedule: '35%',
      cost: '15%',
      quality: '有效提升'
    },
    description: '在复杂的基础设施建设项目中应用关键链项目管理理念。',
    image: '/placeholder-construction.jpg'
  }
];

interface HomepageConfig {
  hero_title: string;
  hero_subtitle: string;
  statistics: {
    projects: number;
    clients: number;
    success_rate: number;
    experience: number;
  };
}

export default function Home() {
  const [currentCase, setCurrentCase] = useState(0);
  const [homepageConfig, setHomepageConfig] = useState<HomepageConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHomepageConfig();
  }, []);

  const loadHomepageConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('homepage_config')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Failed to load homepage config:', error);
      }

      if (data) {
        setHomepageConfig({
          hero_title: data.hero_title || 'CCPM360 - 更专业的项目管理解决方案',
          hero_subtitle: data.hero_subtitle || '专业的关键链项目管理培训与咨询服务，帮助企业提升项目管理效率，实现项目成功交付。基于约束理论的科学方法，让项目管理更简单、更高效。',
          statistics: data.statistics || { projects: 500, clients: 200, success_rate: 95, experience: 10 }
        });
      }
    } catch (error) {
      console.error('Failed to load homepage config:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextCase = () => {
    setCurrentCase((prev) => (prev + 1) % caseStudies.length);
  };

  const prevCase = () => {
    setCurrentCase((prev) => (prev - 1 + caseStudies.length) % caseStudies.length);
  };

  return (
    <div>
      {/* 品牌横幅 */}
      <section className="relative bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.05%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/60 to-transparent"></div>
        <div className="relative mx-auto max-w-7xl px-6 py-32 sm:py-40 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <div className="flex justify-center mb-12">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
                <Image 
                  src="/ccpm360-logo.png" 
                  alt="CCMP360" 
                  width={160}
                  height={160}
                  priority={true}
                  className="relative h-32 w-auto sm:h-40 drop-shadow-2xl"
                  style={{ width: 'auto', height: 'auto' }}
                />
              </div>
            </div>
            <h1 className="text-5xl font-bold tracking-tight sm:text-7xl leading-tight">
              {loading ? (
                <div className="animate-pulse">
                  <div className="h-16 bg-gray-300 rounded mb-6"></div>
                  <div className="h-12 bg-gray-300 rounded"></div>
                </div>
              ) : (
                <>
                  <span className="bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                    CCPM360
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                    {homepageConfig?.hero_title || '关键链项目管理'}
                  </span>
                </>
              )}
            </h1>
            {loading ? (
              <div className="mt-8 animate-pulse">
                <div className="h-6 bg-gray-300 rounded mb-3"></div>
                <div className="h-6 bg-gray-300 rounded mb-3"></div>
                <div className="h-6 bg-gray-300 rounded w-4/5 mx-auto"></div>
              </div>
            ) : (
              <p className="mt-8 text-xl leading-9 text-blue-100 max-w-3xl mx-auto">
                {homepageConfig?.hero_subtitle || '专业的关键链项目管理培训与咨询服务，帮助企业提升项目管理效率，实现项目成功交付。基于约束理论的科学方法，让项目管理更简单、更高效。'}
              </p>
            )}
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link
                href="/contact"
                className="btn-gradient-primary group flex items-center gap-3"
              >
                立即咨询
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/services"
                className="group border-2 border-white/30 backdrop-blur-sm text-white px-10 py-4 rounded-xl text-lg font-semibold hover:bg-white/10 hover:border-white/50 transition-all duration-300 transform hover:scale-105"
              >
                了解服务 <span aria-hidden="true" className="group-hover:translate-x-1 inline-block transition-transform">→</span>
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white via-white/50 to-transparent"></div>
      </section>

      {/* 服务概览 */}
      <section className="py-24 sm:py-32 bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-6">
              <Target className="w-4 h-4 mr-2" />
              核心服务
            </div>
            <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                我们的核心服务
              </span>
            </h2>
            <p className="text-xl leading-8 text-gray-600">
              基于关键链项目管理理论，为企业提供全方位的项目管理解决方案
            </p>
          </div>
          <div className="mx-auto mt-20 grid max-w-2xl grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-10">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <div
                  key={index}
                  className="card-modern group"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative z-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="h-8 w-8" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      {service.description}
                    </p>
                    <ul className="space-y-3 mb-8">
                      {service.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center text-sm text-gray-600">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Link
                      href="/services"
                      className="inline-flex items-center text-blue-600 font-semibold hover:text-purple-600 transition-colors group-hover:gap-3 gap-2"
                    >
                      了解更多
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 成功案例轮播 */}
      <section className="py-24 sm:py-32 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 rounded-full text-sm font-medium mb-6">
              <Star className="w-4 h-4 mr-2" />
              成功案例
            </div>
            <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl mb-6">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                客户成功故事
              </span>
            </h2>
            <p className="text-xl leading-8 text-gray-600">
              真实案例见证CCPM360的专业实力，为各行业客户创造价值
            </p>
          </div>
          
          <div className="relative">
            <div className="overflow-hidden rounded-3xl bg-white shadow-2xl">
              <div className="grid lg:grid-cols-2 gap-0">
                <div className="relative h-80 lg:h-96">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-600/20 z-10"></div>
                  <Image
                    src={caseStudies[currentCase].image}
                    alt={caseStudies[currentCase].project}
                    fill
                    className="object-cover transition-transform duration-700 hover:scale-110"
                  />
                  <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full opacity-20 blur-xl z-20"></div>
                  <div className="absolute -top-4 -left-4 w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full opacity-20 blur-xl z-20"></div>
                </div>
                <div className="p-8 lg:p-12 space-y-6">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center rounded-full bg-gradient-to-r from-blue-100 to-purple-100 px-4 py-2 text-sm font-medium text-blue-800">
                      {caseStudies[currentCase].industry}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-3 leading-tight">
                      {caseStudies[currentCase].client}
                    </h3>
                    <h4 className="text-xl font-semibold text-gray-700 mb-4">
                      {caseStudies[currentCase].project}
                    </h4>
                    <p className="text-lg text-gray-600 leading-relaxed">
                      {caseStudies[currentCase].description}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    {Object.entries(caseStudies[currentCase].results).map(([key, value]) => {
                      const labels: Record<string, string> = {
                        efficiency: '效率提升',
                        utilization: '资源利用率提升',
                        delivery: '按时交付率',
                        timeToMarket: '上市时间缩短',
                        collaboration: '团队协作',
                        schedule: '工期控制精度提升',
                        cost: '成本节约',
                        quality: '质量管控'
                      };
                      return (
                        <div key={key} className="text-center p-4 bg-gradient-to-r from-orange-50 to-pink-50 rounded-xl">
                          <div className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                            {value.includes('%') ? value : value}
                          </div>
                          <div className="text-sm font-medium text-gray-600 mt-1">
                            {labels[key]}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <Link
                      href="/cases"
                      className="btn-gradient-secondary inline-flex items-center gap-3"
                    >
                    查看更多案例
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </div>
              </div>
            </div>
            
            {/* 轮播控制按钮 */}
            <button
              onClick={prevCase}
              className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full p-4 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 group"
            >
              <ChevronLeft className="h-6 w-6 text-gray-600 group-hover:text-blue-600" />
            </button>
            <button
              onClick={nextCase}
              className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm hover:bg-white rounded-full p-4 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 group"
            >
              <ChevronRight className="h-6 w-6 text-gray-600 group-hover:text-blue-600" />
            </button>
            
            {/* 轮播指示器 */}
            <div className="flex justify-center mt-12 space-x-3">
              {caseStudies.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentCase(index)}
                  className={`w-4 h-4 rounded-full transition-all duration-300 ${
                    index === currentCase
                      ? 'bg-gradient-to-r from-orange-500 to-pink-500 scale-125'
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 统计数据区域 */}
      <section className="py-24 bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.1%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%221.5%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50"></div>
        <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
              <span className="bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">
                数据见证实力
              </span>
            </h2>
            <p className="text-xl text-blue-200 max-w-2xl mx-auto">
              多年来我们用专业和实力赢得了客户的信任
            </p>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="text-center animate-pulse">
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
                    <div className="h-16 bg-gray-300 rounded mb-4"></div>
                    <div className="h-6 bg-gray-300 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
              <div className="group text-center">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                  <div className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent group-hover:from-yellow-400 group-hover:to-orange-400 transition-all duration-300">
                    {homepageConfig?.statistics.projects || 500}+
                  </div>
                  <div className="text-blue-200 text-lg font-medium">服务项目</div>
                </div>
              </div>
              <div className="group text-center">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                  <div className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent group-hover:from-emerald-400 group-hover:to-cyan-400 transition-all duration-300">
                    {homepageConfig?.statistics.clients || 200}+
                  </div>
                  <div className="text-blue-200 text-lg font-medium">合作客户</div>
                </div>
              </div>
              <div className="group text-center">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                  <div className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent group-hover:from-violet-400 group-hover:to-fuchsia-400 transition-all duration-300">
                    {homepageConfig?.statistics.success_rate || 95}%
                  </div>
                  <div className="text-blue-200 text-lg font-medium">成功率</div>
                </div>
              </div>
              <div className="group text-center">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                  <div className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent group-hover:from-sky-400 group-hover:to-blue-400 transition-all duration-300">
                    {homepageConfig?.statistics.experience || 10}+
                  </div>
                  <div className="text-blue-200 text-lg font-medium">年经验</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA区域 */}
      <section className="relative bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.05%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-orange-400/20 to-pink-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-500/20 rounded-full blur-3xl"></div>
        <div className="relative mx-auto max-w-7xl px-6 py-24 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-4xl font-bold tracking-tight text-white sm:text-6xl mb-6 leading-tight">
              <span className="bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                准备开始您的
              </span>
              <br />
              <span className="text-white">
                项目管理转型之旅？
              </span>
            </h2>
            <p className="mx-auto mt-8 max-w-2xl text-xl leading-9 text-blue-100">
              联系我们的专家团队，获取专业的关键链项目管理解决方案，让您的项目管理更高效、更成功
            </p>
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link
                href="/contact"
                className="btn-gradient-primary group flex items-center gap-3"
              >
                免费咨询
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/about"
                className="group border-2 border-white/30 backdrop-blur-sm text-white px-10 py-4 rounded-xl text-lg font-semibold hover:bg-white/10 hover:border-white/50 transition-all duration-300 transform hover:scale-105"
              >
                了解我们 <span aria-hidden="true" className="group-hover:translate-x-1 inline-block transition-transform">→</span>
              </Link>
            </div>
            <div className="mt-16 flex items-center justify-center space-x-8 text-blue-200">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span>专业团队</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span>免费咨询</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span>定制方案</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
