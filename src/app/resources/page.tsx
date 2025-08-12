'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Download, FileText, Video, BookOpen, ExternalLink, Search, Filter } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'document' | 'video' | 'template' | 'guide';
  category: string;
  file_url?: string;
  external_url?: string;
  download_count: number;
  created_at: string;
}

const mockResources: Resource[] = [
  {
    id: '1',
    title: 'CCPM关键链项目管理入门指南',
    description: '详细介绍关键链项目管理的基本概念、原理和实施方法，适合初学者阅读。',
    type: 'document',
    category: '入门指南',
    file_url: '/resources/ccpm-guide.pdf',
    download_count: 1250,
    created_at: '2024-01-15'
  },
  {
    id: '2',
    title: '项目缓冲区设置模板',
    description: '标准化的项目缓冲区设置Excel模板，帮助项目经理快速配置项目缓冲。',
    type: 'template',
    category: '工具模板',
    file_url: '/resources/buffer-template.xlsx',
    download_count: 890,
    created_at: '2024-01-10'
  },
  {
    id: '3',
    title: 'CCPM实施案例分析视频',
    description: '通过真实案例分析，深入讲解CCPM在不同行业中的实施经验和注意事项。',
    type: 'video',
    category: '案例分析',
    external_url: 'https://example.com/ccpm-case-study',
    download_count: 567,
    created_at: '2024-01-05'
  },
  {
    id: '4',
    title: '多项目管理最佳实践',
    description: '企业级多项目管理的最佳实践指南，包含资源分配和优先级管理策略。',
    type: 'guide',
    category: '最佳实践',
    file_url: '/resources/multi-project-guide.pdf',
    download_count: 723,
    created_at: '2023-12-28'
  }
];

const resourceTypes = [
  { value: 'all', label: '全部类型', icon: FileText },
  { value: 'document', label: '文档资料', icon: FileText },
  { value: 'video', label: '视频教程', icon: Video },
  { value: 'template', label: '工具模板', icon: Download },
  { value: 'guide', label: '实践指南', icon: BookOpen }
];

const categories = ['全部分类', '入门指南', '工具模板', '案例分析', '最佳实践', '行业应用'];

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>(mockResources);
  const [filteredResources, setFilteredResources] = useState<Resource[]>(mockResources);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('全部分类');

  useEffect(() => {
    loadResources();
  }, []);

  useEffect(() => {
    filterResources();
  }, [searchTerm, selectedType, selectedCategory, resources]);

  const loadResources = async () => {
    setLoading(true);
    try {
      // 尝试从Supabase加载资源，如果失败则使用模拟数据
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.log('Using mock data for resources');
        setResources(mockResources);
      } else if (data) {
        setResources(data);
      }
    } catch (error) {
      console.error('Failed to load resources:', error);
      setResources(mockResources);
    } finally {
      setLoading(false);
    }
  };

  const filterResources = () => {
    let filtered = resources;

    // 按搜索词过滤
    if (searchTerm) {
      filtered = filtered.filter(resource =>
        resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 按类型过滤
    if (selectedType !== 'all') {
      filtered = filtered.filter(resource => resource.type === selectedType);
    }

    // 按分类过滤
    if (selectedCategory !== '全部分类') {
      filtered = filtered.filter(resource => resource.category === selectedCategory);
    }

    setFilteredResources(filtered);
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'document':
        return FileText;
      case 'video':
        return Video;
      case 'template':
        return Download;
      case 'guide':
        return BookOpen;
      default:
        return FileText;
    }
  };

  const handleDownload = async (resource: Resource) => {
    if (resource.external_url) {
      window.open(resource.external_url, '_blank');
    } else if (resource.file_url) {
      // 这里可以添加下载逻辑
      console.log('Downloading:', resource.file_url);
    }

    // 更新下载计数
    try {
      await supabase
        .from('resources')
        .update({ download_count: resource.download_count + 1 })
        .eq('id', resource.id);
    } catch (error) {
      console.error('Failed to update download count:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            资源中心
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            提供丰富的CCPM学习资源，包括入门指南、工具模板、案例分析和最佳实践，
            帮助您深入了解和掌握关键链项目管理方法。
          </p>
        </div>

        {/* 搜索和筛选 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 搜索框 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="搜索资源..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* 类型筛选 */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                {resourceTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 分类筛选 */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 资源列表 */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
                <div className="h-6 bg-gray-300 rounded mb-4"></div>
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded mb-4 w-3/4"></div>
                <div className="h-10 bg-gray-300 rounded"></div>
              </div>
            ))}
          </div>
        ) : filteredResources.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((resource) => {
              const IconComponent = getResourceIcon(resource.type);
              return (
                <div key={resource.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg mr-3">
                        <IconComponent className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <span className="inline-block px-2 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-full">
                          {resource.category}
                        </span>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {resource.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {resource.description}
                  </p>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>下载次数: {resource.download_count}</span>
                    <span>{resource.created_at}</span>
                  </div>

                  <button
                    onClick={() => handleDownload(resource)}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 py-2 rounded-md hover:from-blue-700 hover:to-blue-600 transition-all duration-200"
                  >
                    {resource.external_url ? (
                      <>
                        <ExternalLink className="h-4 w-4" />
                        查看资源
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4" />
                        下载资源
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无匹配的资源</h3>
            <p className="text-gray-600">请尝试调整搜索条件或筛选选项</p>
          </div>
        )}

        {/* 联系我们部分 */}
        <div className="mt-16 bg-gradient-to-r from-blue-800 to-blue-600 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            需要更多资源或定制化支持？
          </h2>
          <p className="text-blue-100 mb-6">
            我们提供个性化的培训材料和咨询服务，满足您的特定需求
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-md font-semibold hover:bg-gray-100 transition-colors"
          >
            联系我们
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}