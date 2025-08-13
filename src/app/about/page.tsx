'use client';

import { Users, Target, Award, TrendingUp } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              关于 <span className="text-blue-600">CCPM360</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              我们是专业的关键链项目管理(CCPM)咨询服务提供商，致力于帮助企业提升项目管理效率，
              实现项目按时交付和资源优化配置。
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
                我们的使命
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                通过先进的关键链项目管理理论和实践，帮助企业解决项目延期、资源冲突、
                成本超支等常见问题，提升项目成功率和企业竞争力。
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
              核心价值观
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              我们坚持以客户为中心，以结果为导向，为企业创造真正的价值
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                客户至上
              </h3>
              <p className="text-gray-600">
                始终以客户需求为出发点， 提供最适合的解决方案
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                追求卓越
              </h3>
              <p className="text-gray-600">
                不断提升服务质量， 追求项目管理的卓越表现
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                持续改进
              </h3>
              <p className="text-gray-600">
                持续学习和改进， 与时俱进的管理理念
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 bg-blue-600">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            准备开始您的项目管理转型之旅？
          </h2>
          <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
            联系我们的专家团队，获取专业的CCPM咨询服务
          </p>
          <a
            href="/contact"
            className="inline-flex items-center px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
          >
            立即咨询
          </a>
        </div>
      </section>
    </div>
  );
}
