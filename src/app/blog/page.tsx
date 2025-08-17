'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, Clock, Tag, User } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  publishDate: string;
  readTime: string;
  tags: string[];
  slug: string;
  featured?: boolean;
}

// 模拟博客文章数据
const mockBlogPosts: BlogPost[] = [
  {
    id: '1',
    title: '关键链项目管理（CCPM）方法论深度解析',
    excerpt:
      '深入探讨关键链项目管理的核心理念、实施方法和实际应用案例，包含动态图表演示。',
    author: 'CCPM专家团队',
    publishDate: '2024-01-15',
    readTime: '12分钟',
    tags: ['CCPM', '项目管理', '约束理论', '缓冲区管理'],
    slug: 'ccpm-methodology-deep-dive',
    featured: true,
  },
  {
    id: '2',
    title: '缓冲区管理：项目风险控制的关键',
    excerpt:
      '详细介绍CCPM中缓冲区的设置原理、计算方法和动态管理策略，包含实时监控图表。',
    author: 'CCPM专家团队',
    publishDate: '2024-01-20',
    readTime: '15分钟',
    tags: ['缓冲区管理', 'CCPM', '风险控制', '项目监控'],
    slug: 'buffer-management-guide',
  },
  {
    id: '3',
    title: '多项目环境下的资源优化策略',
    excerpt:
      '探讨在多项目并行执行的复杂环境中，如何运用关键链方法优化资源配置，提高整体项目组合的执行效率。',
    author: 'CCPM专家团队',
    publishDate: '2024-01-05',
    readTime: '10分钟',
    tags: ['多项目管理', '资源优化', 'CCPM'],
    slug: 'multi-project-resource-optimization',
  },
];

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 模拟数据加载
    setTimeout(() => {
      setPosts(mockBlogPosts);
      setLoading(false);
    }, 500);
  }, []);

  const filteredPosts = selectedTag
    ? posts.filter((post) => post.tags.includes(selectedTag))
    : posts;

  const allTags = Array.from(new Set(posts.flatMap((post) => post.tags)));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow-md p-6">
                  <div className="h-6 bg-gray-300 rounded mb-4"></div>
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded mb-4"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            CCPM360 博客
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            深入探讨关键链项目管理的理论与实践，分享最新的项目管理洞察和经验
          </p>
        </div>

        {/* 标签筛选 */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => setSelectedTag('')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedTag === ''
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              全部
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedTag === tag
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* 文章列表 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post) => (
            <article
              key={post.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
            >
              {post.featured && (
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-semibold px-3 py-1">
                  精选文章
                </div>
              )}

              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="hover:text-blue-600 transition-colors"
                  >
                    {post.title}
                  </Link>
                </h2>

                <p className="text-gray-600 mb-4 line-clamp-3">
                  {post.excerpt}
                </p>

                {/* 标签 */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>

                {/* 元信息 */}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      {post.author}
                    </span>
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {post.publishDate}
                    </span>
                  </div>
                  <span className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {post.readTime}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">暂无符合条件的文章</p>
          </div>
        )}
      </div>
    </div>
  );
}
