import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, Calendar, Building, Tag } from 'lucide-react';

interface CaseStudy {
  id: string;
  title: string;
  description: string;
  client: string;
  industry: string;
  content: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

async function getCaseStudy(id: string): Promise<CaseStudy | null> {
  try {
    const response = await fetch(
      `${process.env['NEXT_PUBLIC_API_URL']}/api/case-studies/${id}`,
      {
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching case study:', error);
    return null;
  }
}

export default async function CaseDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const caseStudy = await getCaseStudy(params.id);

  if (!caseStudy) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 面包屑导航 */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <Link
              href="/cases"
              className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              返回案例列表
            </Link>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-gray-900 font-medium truncate">
              {caseStudy.title}
            </span>
          </div>
        </div>
      </div>

      {/* 主要内容 */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 案例头部 */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
          {caseStudy.image_url && (
            <div className="relative h-64 sm:h-80 lg:h-96">
              <Image
                src={caseStudy.image_url}
                alt={caseStudy.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          <div className="p-6 sm:p-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {caseStudy.title}
            </h1>

            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              {caseStudy.description}
            </p>

            {/* 案例信息 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-gray-200">
              <div className="flex items-center">
                <Building className="h-5 w-5 text-blue-600 mr-2" />
                <div>
                  <div className="text-sm text-gray-500">客户</div>
                  <div className="font-medium text-gray-900">
                    {caseStudy.client}
                  </div>
                </div>
              </div>

              <div className="flex items-center">
                <Tag className="h-5 w-5 text-green-600 mr-2" />
                <div>
                  <div className="text-sm text-gray-500">行业</div>
                  <div className="font-medium text-gray-900">
                    {caseStudy.industry}
                  </div>
                </div>
              </div>

              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-purple-600 mr-2" />
                <div>
                  <div className="text-sm text-gray-500">发布时间</div>
                  <div className="font-medium text-gray-900">
                    {new Date(caseStudy.created_at).toLocaleDateString('zh-CN')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 案例内容 */}
        <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">案例详情</h2>
          <div
            className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: caseStudy.content }}
          />
        </div>

        {/* 返回按钮 */}
        <div className="mt-8 text-center">
          <Link
            href="/cases"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            返回案例列表
          </Link>
        </div>
      </div>
    </div>
  );
}

// 生成静态参数（可选，用于静态生成）
export async function generateStaticParams() {
  try {
    const response = await fetch(
      `${process.env['NEXT_PUBLIC_API_URL']}/api/case-studies`
    );
    if (!response.ok) return [];

    const caseStudies = await response.json();
    return caseStudies.map((caseStudy: CaseStudy) => ({
      id: caseStudy.id,
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

// 页面元数据
export async function generateMetadata({ params }: { params: { id: string } }) {
  const caseStudy = await getCaseStudy(params.id);

  if (!caseStudy) {
    return {
      title: '案例未找到 - CCPM360',
      description: '您访问的案例不存在或已被删除。',
    };
  }

  return {
    title: `${caseStudy.title} - CCPM360案例`,
    description: caseStudy.description,
    openGraph: {
      title: caseStudy.title,
      description: caseStudy.description,
      images: caseStudy.image_url ? [caseStudy.image_url] : [],
    },
  };
}
