'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Calendar,
  User,
  Tag,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  publishDate: string;
  status: 'draft' | 'published' | 'archived';
  tags: string[];
  views: number;
}

const mockPosts: BlogPost[] = [
  {
    id: '1',
    title: '关键链项目管理的核心理念',
    excerpt:
      '深入了解关键链项目管理的基本概念和核心理念，以及它如何帮助企业提升项目执行效率。',
    content: '',
    author: 'CCPM360团队',
    publishDate: '2024-01-15',
    status: 'published',
    tags: ['项目管理', '关键链', '理论'],
    views: 1250,
  },
  {
    id: '2',
    title: '项目缓冲管理最佳实践',
    excerpt:
      '探讨项目缓冲管理的最佳实践，包括如何设置合理的缓冲时间和监控缓冲消耗。',
    content: '',
    author: 'CCPM360团队',
    publishDate: '2024-01-10',
    status: 'published',
    tags: ['缓冲管理', '最佳实践'],
    views: 980,
  },
  {
    id: '3',
    title: '多项目环境下的资源管理',
    excerpt:
      '在多项目环境中如何有效管理资源，避免资源冲突，提升整体项目组合的执行效率。',
    content: '',
    author: 'CCPM360团队',
    publishDate: '2024-01-05',
    status: 'draft',
    tags: ['多项目', '资源管理'],
    views: 0,
  },
];

export default function BlogManagement() {
  const [posts, setPosts] = useState<BlogPost[]>(mockPosts);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setLoading(true);
    try {
      // TODO: 从API加载博客文章
      setPosts(mockPosts);
    } catch (error) {
      console.error('加载博客文章失败:', error);
      toast.error('加载博客文章失败');
    } finally {
      setLoading(false);
    }
  };

  const deletePost = async (id: string) => {
    if (!confirm('确定要删除这篇文章吗？')) return;

    try {
      // TODO: 调用删除API
      setPosts((prev) => prev.filter((post) => post.id !== id));
      toast.success('文章删除成功');
    } catch (error) {
      console.error('删除文章失败:', error);
      toast.error('删除文章失败');
    }
  };

  const toggleStatus = async (id: string, newStatus: BlogPost['status']) => {
    try {
      // TODO: 调用更新状态API
      setPosts((prev) =>
        prev.map((post) =>
          post.id === id ? { ...post, status: newStatus } : post
        )
      );
      toast.success('文章状态更新成功');
    } catch (error) {
      console.error('更新文章状态失败:', error);
      toast.error('更新文章状态失败');
    }
  };

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || post.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: BlogPost['status']) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: BlogPost['status']) => {
    switch (status) {
      case 'published':
        return '已发布';
      case 'draft':
        return '草稿';
      case 'archived':
        return '已归档';
      default:
        return '未知';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">博客管理</h1>
          <p className="text-gray-600 mt-1">管理网站博客文章</p>
        </div>
        <Link
          href="/admin/blog/new"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="w-4 h-4 mr-2" />
          新增文章
        </Link>
      </div>

      {/* 搜索和筛选 */}
      <div className="bg-white shadow rounded-lg">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="搜索文章标题或内容..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-3 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">全部状态</option>
                <option value="published">已发布</option>
                <option value="draft">草稿</option>
                <option value="archived">已归档</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 文章列表 */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            文章列表 ({filteredPosts.length})
          </h2>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredPosts.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              {searchTerm || statusFilter !== 'all'
                ? '没有找到匹配的文章'
                : '暂无文章'}
            </div>
          ) : (
            filteredPosts.map((post) => (
              <div key={post.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">
                        {post.title}
                      </h3>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(post.status)}`}
                      >
                        {getStatusText(post.status)}
                      </span>
                    </div>

                    <p className="text-gray-600 mb-3 line-clamp-2">
                      {post.excerpt}
                    </p>

                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        {post.author}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {post.publishDate}
                      </div>
                      <div className="flex items-center">
                        <Eye className="w-4 h-4 mr-1" />
                        {post.views} 次浏览
                      </div>
                    </div>

                    {post.tags.length > 0 && (
                      <div className="flex items-center mt-3">
                        <Tag className="w-4 h-4 mr-2 text-gray-400" />
                        <div className="flex flex-wrap gap-1">
                          {post.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <Link
                      href={`/admin/blog/${post.id}/edit`}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      title="编辑"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>

                    <button
                      onClick={() => window.open(`/blog/${post.id}`, '_blank')}
                      className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                      title="预览"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    <div className="relative group">
                      <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                        •••
                      </button>
                      <div className="absolute right-0 top-8 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                        {post.status === 'draft' && (
                          <button
                            onClick={() => toggleStatus(post.id, 'published')}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            发布文章
                          </button>
                        )}
                        {post.status === 'published' && (
                          <button
                            onClick={() => toggleStatus(post.id, 'archived')}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            归档文章
                          </button>
                        )}
                        <button
                          onClick={() => deletePost(post.id)}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          删除文章
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
