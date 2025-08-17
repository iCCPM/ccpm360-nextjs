'use client';

import { useState, useEffect } from 'react';
import { Users, Target, Award, TrendingUp } from 'lucide-react';

interface AboutPageConfig {
  hero_title: string;
  hero_subtitle: string;
  mission_title: string;
  mission_description: string;
  values_title: string;
  values_subtitle: string;
  value_1_title: string;
  value_1_description: string;
  value_2_title: string;
  value_2_description: string;
  value_3_title: string;
  value_3_description: string;
  cta_title: string;
  cta_subtitle: string;
  cta_button_text: string;
}

const defaultConfig: AboutPageConfig = {
  hero_title: '关于 CCPM360',
  hero_subtitle:
    '我们是专业的关键链项目管理(CCPM)咨询服务提供商，致力于帮助企业提升项目管理效率，实现项目按时交付和资源优化配置。',
  mission_title: '我们的使命',
  mission_description:
    '通过先进的关键链项目管理理论和实践，帮助企业解决项目延期、资源冲突、成本超支等常见问题，提升项目成功率和企业竞争力。',
  values_title: '核心价值观',
  values_subtitle: '我们坚持以客户为中心，以结果为导向，为企业创造真正的价值',
  value_1_title: '客户至上',
  value_1_description: '始终以客户需求为出发点，提供最适合的解决方案',
  value_2_title: '追求卓越',
  value_2_description: '不断提升服务质量，追求项目管理的卓越表现',
  value_3_title: '持续改进',
  value_3_description: '持续学习和改进，与时俱进的管理理念',
  cta_title: '准备开始您的项目管理转型之旅？',
  cta_subtitle: '联系我们的专家团队，获取专业的CCPM咨询服务',
  cta_button_text: '立即咨询',
};

export default function AboutPage() {
  const [config, setConfig] = useState<AboutPageConfig>(defaultConfig);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPageConfig = async () => {
      try {
        const response = await fetch('/api/admin/website/about');
        if (response.ok) {
          const data = await response.json();
          setConfig(data);
        }
      } catch (error) {
        console.error('加载页面配置失败:', error);
        // 使用默认配置
      } finally {
        setLoading(false);
      }
    };

    loadPageConfig();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              {config.hero_title}
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              {config.hero_subtitle}
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                {config.mission_title}
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                {config.mission_description}
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Target className="h-6 w-6 text-blue-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">专业专注</h3>
                    <p className="text-gray-600">
                      专注于CCPM领域，提供最专业的咨询服务
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Award className="h-6 w-6 text-blue-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">实战经验</h3>
                    <p className="text-gray-600">
                      丰富的项目管理实战经验和成功案例
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-6 w-6 text-blue-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">持续创新</h3>
                    <p className="text-gray-600">
                      不断创新方法论，适应企业发展需求
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl p-8">
                <div className="text-center">
                  <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Users className="h-12 w-12 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    专业团队
                  </h3>
                  <p className="text-gray-600">
                    由资深项目管理专家组成的专业团队， 拥有多年CCPM实施经验
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Company Values */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {config.values_title}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {config.values_subtitle}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {config.value_1_title}
              </h3>
              <p className="text-gray-600">{config.value_1_description}</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {config.value_2_title}
              </h3>
              <p className="text-gray-600">{config.value_2_description}</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {config.value_3_title}
              </h3>
              <p className="text-gray-600">{config.value_3_description}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 bg-blue-600">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            {config.cta_title}
          </h2>
          <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
            {config.cta_subtitle}
          </p>
          <a
            href="/contact"
            className="inline-flex items-center px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
          >
            {config.cta_button_text}
          </a>
        </div>
      </section>
    </div>
  );
}
