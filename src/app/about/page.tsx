import { Users, Award, Target, TrendingUp, Calendar, CheckCircle } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '关于我们 - CCPM360关键链项目管理研究院',
  description: '专业的关键链项目管理研究与实践机构，致力于推广科学的项目管理方法，提升企业项目管理效率。',
  keywords: '关键链项目管理,CCPM,项目管理培训,项目管理咨询,CCPM360',
};

const teamMembers = [
  {
    name: '张教授',
    title: '院长 / 首席专家',
    expertise: '关键链项目管理理论研究',
    experience: '20年项目管理经验',
    description: '国内知名项目管理专家，关键链项目管理理论的早期推广者，曾为多家世界500强企业提供咨询服务。',
    image: '/placeholder-professor.svg'
  },
  {
    name: '李博士',
    title: '副院长 / 高级顾问',
    expertise: '企业项目管理实施',
    experience: '15年咨询经验',
    description: '专注于制造业和IT行业的项目管理优化，具有丰富的企业实施经验和深厚的理论功底。',
    image: '/placeholder-consultant.svg'
  },
  {
    name: '王经理',
    title: '培训总监',
    expertise: '项目管理培训体系设计',
    experience: '12年培训经验',
    description: '负责培训课程设计和实施，擅长将复杂的理论转化为易懂的实践方法，深受学员好评。',
    image: '/placeholder-trainer.svg'
  },
  {
    name: '陈顾问',
    title: '高级咨询师',
    expertise: '项目管理工具应用',
    experience: '10年实施经验',
    description: '专业的项目管理工具专家，熟练掌握各种项目管理软件，为企业提供技术实施支持。',
    image: '/placeholder-advisor.svg'
  }
];

const milestones = [
  {
    year: '2020',
    title: '研究院成立',
    description: '关键链项目管理研究院正式成立，致力于CCPM理论研究与实践推广。'
  },
  {
    year: '2021',
    title: 'CCPM360品牌注册',
    description: '成功注册CCPM360商标和logo著作权，建立专业品牌形象。'
  },
  {
    year: '2022',
    title: '培训体系建立',
    description: '建立完整的关键链项目管理培训体系，推出系列专业课程。'
  },
  {
    year: '2023',
    title: '咨询服务拓展',
    description: '扩展咨询服务范围，为多个行业的企业提供定制化解决方案。'
  },
  {
    year: '2024',
    title: '数字化平台上线',
    description: '推出CCMP360数字化服务平台，提供在线培训和咨询服务。'
  }
];

const achievements = [
  {
    icon: Users,
    number: '500+',
    label: '服务企业',
    description: '累计为500多家企业提供专业服务'
  },
  {
    icon: Award,
    number: '5000+',
    label: '培训学员',
    description: '培训项目管理专业人员超过5000人'
  },
  {
    icon: Target,
    number: '95%',
    label: '客户满意度',
    description: '客户满意度持续保持在95%以上'
  },
  {
    icon: TrendingUp,
    number: '30%',
    label: '平均效率提升',
    description: '帮助企业平均提升项目效率30%'
  }
];

export default function AboutPage() {
  return (
    <div>
      {/* 页面标题 */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              关于我们
            </h1>
            <p className="mt-6 text-lg leading-8 text-blue-100">
              专业的关键链项目管理研究与实践机构，致力于推广科学的项目管理方法
            </p>
          </div>
        </div>
      </section>

      {/* 研究院介绍 */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 lg:mx-0 lg:max-w-none lg:grid-cols-2 lg:items-start">
            <div className="lg:pr-4">
              <div className="relative overflow-hidden rounded-3xl bg-gray-900 px-6 pb-9 pt-64 shadow-2xl sm:px-12 lg:max-w-lg lg:px-8 lg:pb-8 xl:px-10 xl:pb-10">
                <img
                  className="absolute inset-0 h-full w-full object-cover brightness-125 saturate-0"
                  src="/placeholder-institute.svg"
                  alt="关键链项目管理研究院"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40" />
                <div className="relative">
                  <h3 className="text-xl font-semibold leading-6 text-white">
                    关键链项目管理研究院
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-gray-300">
                    CCPM360 - 让项目管理更简单、更高效
                  </p>
                </div>
              </div>
            </div>
            <div>
              <div className="text-base leading-7 text-gray-700 lg:max-w-lg">
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                  我们的使命
                </h2>
                <div className="max-w-xl">
                  <p className="mt-6">
                    关键链项目管理研究院成立于2020年，是国内专业的CCPM（关键链项目管理）研究与实践机构。
                    我们致力于将基于约束理论的关键链项目管理方法引入中国企业，帮助企业提升项目管理效率，
                    实现项目成功交付。
                  </p>
                  <p className="mt-8">
                    作为CCPM360品牌的创立者，我们拥有完整的知识产权保护，包括商标注册和logo著作权。
                    通过多年的理论研究和实践积累，我们建立了完善的培训体系和咨询服务框架，
                    为不同行业的企业提供专业的项目管理解决方案。
                  </p>
                  <p className="mt-8">
                    我们的愿景是成为中国领先的关键链项目管理服务提供商，推动中国企业项目管理水平的整体提升，
                    让更多企业受益于科学的项目管理方法。
                  </p>
                </div>
              </div>
              <dl className="mt-10 grid grid-cols-2 gap-8 border-t border-gray-900/10 pt-10 sm:grid-cols-4">
                {achievements.map((achievement) => {
                  const Icon = achievement.icon;
                  return (
                    <div key={achievement.label}>
                      <dt className="flex items-center gap-x-3 text-sm font-semibold leading-6 text-gray-900">
                        <Icon className="h-5 w-5 flex-none text-orange-500" />
                        {achievement.label}
                      </dt>
                      <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
                        {achievement.number}
                      </dd>
                      <dd className="mt-1 text-sm leading-6 text-gray-600">
                        {achievement.description}
                      </dd>
                    </div>
                  );
                })}
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* 团队展示 */}
      <section className="bg-gray-50 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              专家团队
            </h2>
            <p className="mt-4 text-lg leading-8 text-gray-600">
              汇聚行业顶尖专家，为您提供最专业的项目管理服务
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-2">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex">
                  <div className="flex-shrink-0">
                    <img
                      className="h-48 w-48 object-cover"
                      src={member.image}
                      alt={member.name}
                    />
                  </div>
                  <div className="flex-1 p-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {member.name}
                      </h3>
                    </div>
                    <p className="text-orange-600 font-medium mt-1">
                      {member.title}
                    </p>
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <Target className="h-4 w-4 mr-2 text-blue-500" />
                        {member.expertise}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2 text-green-500" />
                        {member.experience}
                      </div>
                    </div>
                    <p className="mt-4 text-sm text-gray-600 leading-relaxed">
                      {member.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 发展历程 */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              发展历程
            </h2>
            <p className="mt-4 text-lg leading-8 text-gray-600">
              从理论研究到实践应用，见证我们的成长足迹
            </p>
          </div>
          
          <div className="relative">
            {/* 时间线 */}
            <div className="absolute left-1/2 transform -translate-x-px h-full w-0.5 bg-gray-200"></div>
            
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div key={index} className="relative flex items-center">
                  <div className="flex-1 pr-8 text-right">
                    {index % 2 === 0 && (
                      <div className="bg-white p-6 rounded-lg shadow-lg">
                        <div className="text-2xl font-bold text-orange-500 mb-2">
                          {milestone.year}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {milestone.title}
                        </h3>
                        <p className="text-gray-600">
                          {milestone.description}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {/* 时间点 */}
                  <div className="relative flex items-center justify-center w-8 h-8 bg-orange-500 rounded-full border-4 border-white shadow-lg z-10">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                  
                  <div className="flex-1 pl-8">
                    {index % 2 === 1 && (
                      <div className="bg-white p-6 rounded-lg shadow-lg">
                        <div className="text-2xl font-bold text-orange-500 mb-2">
                          {milestone.year}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {milestone.title}
                        </h3>
                        <p className="text-gray-600">
                          {milestone.description}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA区域 */}
      <section className="bg-gradient-to-r from-blue-800 to-blue-600">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              与我们一起开启项目管理新篇章
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-blue-100">
              选择CCPM360，选择专业的关键链项目管理服务
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <a
                href="/contact"
                className="rounded-md bg-gradient-to-r from-orange-500 to-orange-400 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:from-orange-400 hover:to-orange-300 transition-all duration-200"
              >
                联系我们
              </a>
              <a
                href="/services"
                className="text-sm font-semibold leading-6 text-white hover:text-orange-300 transition-colors"
              >
                查看服务 <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}