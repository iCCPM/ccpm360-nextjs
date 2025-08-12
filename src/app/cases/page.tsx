'use client';

import Link from 'next/link';
import { Building, Users, TrendingUp, Clock, Award, Star, Quote, ArrowRight, CheckCircle, Target, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { caseStudiesAPI, type CaseStudy } from '@/lib/supabase';

const industries = [
  { name: '全部', value: 'all' },
  { name: '制造业', value: '制造业' },
  { name: 'IT软件', value: 'IT软件' },
  { name: '建筑工程', value: '建筑工程' },
  { name: '新能源', value: '新能源' },
  { name: '医药', value: '医药' },
  { name: '航空制造', value: '航空制造' }
];

export default function CasesPage() {
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [selectedCase, setSelectedCase] = useState<CaseStudy | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cases, setCases] = useState<CaseStudy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 加载案例数据
  useEffect(() => {
    const loadCases = async () => {
      try {
        setLoading(true);
        const casesData = await caseStudiesAPI.getPublishedCaseStudies();
        setCases(casesData);
        if (casesData.length > 0) {
          setSelectedCase(casesData[0]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载案例数据失败');
      } finally {
        setLoading(false);
      }
    };

    loadCases();
  }, []);

  // ESC键关闭弹窗
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isModalOpen) {
        setIsModalOpen(false);
      }
    };

    if (isModalOpen) {
      document.addEventListener('keydown', handleEscKey);
      // 防止背景滚动
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  const filteredCases = selectedIndustry === 'all' 
    ? cases 
    : cases.filter(case_ => case_.industry === selectedIndustry);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            重新加载
          </button>
        </div>
      </div>
    );
  }

  const getResultLabel = (key: string) => {
    const labels: Record<string, string> = {
      efficiency: '效率提升',
      utilization: '资源利用率提升',
      delivery: '按时交付率',
      cost: '成本节约',
      timeToMarket: '上市时间缩短',
      quality: '质量提升',
      satisfaction: '客户满意度',
      schedule: '工期控制精度提升',
      safety: '安全记录',
      development: '研发周期缩短',
      market: '提前上市',
      investment: '投资回报提升',
      revenue: '收入增长',
      timeline: '研发周期缩短',
      compliance: '合规达标率',
      success: '项目成功率',
      defect: '缺陷率降低'
    };
    return labels[key] || key;
  };

  return (
    <div>
      {/* 页面标题 */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              成功案例
            </h1>
            <p className="mt-6 text-lg leading-8 text-blue-100">
              真实案例见证CCPM360的专业实力，为各行业客户创造价值
            </p>
          </div>
        </div>
      </section>

      {/* 行业筛选 */}
      <section className="py-8 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-4">
            {industries.map((industry) => (
              <button
                key={industry.value}
                onClick={() => setSelectedIndustry(industry.value)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedIndustry === industry.value
                    ? 'bg-orange-500 text-white shadow-lg'
                    : 'bg-white text-gray-600 hover:bg-gray-100 shadow'
                }`}
              >
                {industry.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 案例列表 */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {filteredCases.map((case_) => (
              <div
                key={case_.id}
                onClick={() => {
                  setSelectedCase(case_);
                  setIsModalOpen(true);
                }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105"
              >
                <div className="relative h-48">
                  <img
                    src={case_.featured_image_url || '/placeholder-project.jpg'}
                    alt={case_.title}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <span className="inline-flex items-center rounded-full bg-orange-500 px-3 py-1 text-sm font-medium text-white">
                      {case_.industry}
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                     {case_.client_name}
                    </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                     {case_.challenge}
                    </p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {case_.project_duration || '未指定'}
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {case_.team_size || 0}人
                      </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 案例详情弹窗 */}
      {isModalOpen && selectedCase && (
        <div 
          className="fixed inset-0 z-50 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsModalOpen(false);
            }
          }}
        >
          {/* 遮罩层 */}
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
          
          {/* 弹窗内容 */}
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              {/* 关闭按钮 */}
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
              
              {/* 滚动内容区域 */}
              <div className="overflow-y-auto max-h-[90vh]">
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  <div className="relative h-64 lg:h-80">
                    <img
                      src={selectedCase.featured_image_url || '/placeholder-project.jpg'}
                      alt={selectedCase.title}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 to-transparent" />
                  </div>
                  
                  <div className="p-6 lg:p-8">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                        {selectedCase.industry}
                      </span>
                      <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
                        {selectedCase.project_duration || '未指定'}
                      </span>
                    </div>
                    
                    <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">
                      {selectedCase.client_name}
                    </h2>
                    <h3 className="text-lg font-semibold text-gray-700 mb-6">
                      {selectedCase.title}
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                          <Target className="h-4 w-4 mr-2 text-red-500" />
                          项目挑战
                        </h4>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {selectedCase.challenge}
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                          <CheckCircle className="h-4 w-4 mr-2 text-blue-500" />
                          解决方案
                        </h4>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {selectedCase.solution}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* 项目成果 */}
                <div className="border-t border-gray-200 p-6 lg:p-8">
                  <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
                    项目成果
                  </h4>
                  <div className="text-gray-600 leading-relaxed">
                    {selectedCase.results}
                  </div>
                </div>
                
                {/* 客户证言 */}
                {selectedCase.testimonial && (
                  <div className="bg-gradient-to-r from-blue-50 to-orange-50 p-6 lg:p-8">
                    <div className="flex items-start space-x-4">
                      <Quote className="h-6 w-6 lg:h-8 lg:w-8 text-orange-500 flex-shrink-0 mt-1" />
                      <div>
                        <p className="text-gray-700 italic leading-relaxed">
                          "{selectedCase.testimonial}"
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 统计数据 */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              服务成果统计
            </h2>
            <p className="mt-4 text-lg leading-8 text-gray-600">
              数据说话，用实际成果证明CCPM360的专业价值
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow duration-300">
              <Building className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              <div className="text-3xl font-bold text-gray-900 mb-2">500+</div>
              <div className="text-gray-600">服务企业</div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow duration-300">
              <Users className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <div className="text-3xl font-bold text-gray-900 mb-2">5000+</div>
              <div className="text-gray-600">培训学员</div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow duration-300">
              <Award className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <div className="text-3xl font-bold text-gray-900 mb-2">95%</div>
              <div className="text-gray-600">客户满意度</div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow duration-300">
              <TrendingUp className="h-12 w-12 text-purple-500 mx-auto mb-4" />
              <div className="text-3xl font-bold text-gray-900 mb-2">30%</div>
              <div className="text-gray-600">平均效率提升</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA区域 */}
      <section className="bg-gradient-to-r from-blue-800 to-blue-600">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              让您的项目也成为成功案例
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-blue-100">
              联系我们，获取专业的关键链项目管理解决方案
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/contact"
                className="rounded-md bg-gradient-to-r from-orange-500 to-orange-400 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:from-orange-400 hover:to-orange-300 transition-all duration-200"
              >
                开始咨询
              </Link>
              <Link
                href="/services"
                className="text-sm font-semibold leading-6 text-white hover:text-orange-300 transition-colors"
              >
                查看服务 <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}