'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  Filter,
  Download,
  Edit,
  Trash2,
  Eye,
  FileText,
  Image,
  Video,
  File,
  Calendar,
  User,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Resource {
  id: string;
  title: string;
  description: string;
  file_url: string;
  file_name: string;
  file_size: number;
  file_type: string;
  category: string;
  tags: string[];
  download_count: number;
  is_featured: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
}

const AdminResourcesPage = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedResources, setSelectedResources] = useState<string[]>([]);

  const categories = [
    { value: 'all', label: '全部分类' },
    { value: 'document', label: '文档资料' },
    { value: 'template', label: '模板工具' },
    { value: 'guide', label: '指导手册' },
    { value: 'case_study', label: '案例研究' },
    { value: 'training', label: '培训材料' },
    { value: 'other', label: '其他' },
  ];

  useEffect(() => {
    loadResources();
  }, []);

  useEffect(() => {
    filterResources();
  }, [resources, searchTerm, selectedCategory]);

  const loadResources = async () => {
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to load resources:', error);
        return;
      }

      setResources(data || []);
    } catch (error) {
      console.error('Failed to load resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterResources = () => {
    let filtered = resources;

    // 搜索过滤
    if (searchTerm) {
      filtered = filtered.filter(
        (resource) =>
          resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          resource.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (resource.tags &&
            resource.tags.some((tag) =>
              tag.toLowerCase().includes(searchTerm.toLowerCase())
            ))
      );
    }

    // 分类过滤
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(
        (resource) => resource.category === selectedCategory
      );
    }

    setFilteredResources(filtered);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个资源吗？此操作不可撤销。')) {
      return;
    }

    try {
      const { error } = await supabase.from('resources').delete().eq('id', id);

      if (error) {
        alert('删除失败：' + error.message);
        return;
      }

      setResources(resources.filter((r) => r.id !== id));
    } catch (error) {
      alert('删除失败');
    }
  };

  const handleBatchDelete = async () => {
    if (selectedResources.length === 0) {
      alert('请选择要删除的资源');
      return;
    }

    if (
      !confirm(
        `确定要删除选中的 ${selectedResources.length} 个资源吗？此操作不可撤销。`
      )
    ) {
      return;
    }

    try {
      const { error } = await supabase
        .from('resources')
        .delete()
        .in('id', selectedResources);

      if (error) {
        alert('批量删除失败：' + error.message);
        return;
      }

      setResources(resources.filter((r) => !selectedResources.includes(r.id)));
      setSelectedResources([]);
    } catch (error) {
      alert('批量删除失败');
    }
  };

  const togglePublishStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('resources')
        .update({ is_published: !currentStatus })
        .eq('id', id);

      if (error) {
        alert('更新状态失败：' + error.message);
        return;
      }

      setResources(
        resources.map((r) =>
          r.id === id ? { ...r, is_published: !currentStatus } : r
        )
      );
    } catch (error) {
      alert('更新状态失败');
    }
  };

  const getFileIcon = (fileType: string | null) => {
    if (!fileType) {
      return <File className="w-4 h-4" />;
    }

    if (fileType.startsWith('image/')) return <Image className="w-4 h-4" />;
    if (fileType.startsWith('video/')) return <Video className="w-4 h-4" />;
    if (fileType.includes('pdf') || fileType.includes('document'))
      return <FileText className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSelectAll = () => {
    if (selectedResources.length === filteredResources.length) {
      setSelectedResources([]);
    } else {
      setSelectedResources(filteredResources.map((r) => r.id));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">资源管理</h1>
          <p className="mt-2 text-gray-600">
            管理网站的下载资源，包括文档、模板、指南等
          </p>
        </div>

        {/* 操作栏 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* 搜索和筛选 */}
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="搜索资源..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
                />
              </div>

              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                >
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-3">
              {selectedResources.length > 0 && (
                <button
                  onClick={handleBatchDelete}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  删除选中 ({selectedResources.length})
                </button>
              )}

              <Link
                href="/admin/resources/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                新建资源
              </Link>
            </div>
          </div>
        </div>

        {/* 资源列表 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {filteredResources.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                暂无资源
              </h3>
              <p className="text-gray-600 mb-4">还没有上传任何资源</p>
              <Link
                href="/admin/resources/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                创建第一个资源
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={
                          selectedResources.length === filteredResources.length
                        }
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      资源信息
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      分类
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      文件信息
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      下载量
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      状态
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      创建时间
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredResources.map((resource) => (
                    <tr key={resource.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedResources.includes(resource.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedResources([
                                ...selectedResources,
                                resource.id,
                              ]);
                            } else {
                              setSelectedResources(
                                selectedResources.filter(
                                  (id) => id !== resource.id
                                )
                              );
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            {getFileIcon(resource.file_type)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {resource.title}
                            </p>
                            <p className="text-sm text-gray-500 line-clamp-2">
                              {resource.description}
                            </p>
                            {resource.tags && resource.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {resource.tags.slice(0, 3).map((tag, index) => (
                                  <span
                                    key={index}
                                    className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                                  >
                                    {tag}
                                  </span>
                                ))}
                                {resource.tags.length > 3 && (
                                  <span className="text-xs text-gray-500">
                                    +{resource.tags.length - 3}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {categories.find((c) => c.value === resource.category)
                            ?.label || resource.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <p className="font-medium">{resource.file_name}</p>
                          <p className="text-gray-500">
                            {formatFileSize(resource.file_size)}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex items-center">
                          <Download className="w-4 h-4 text-gray-400 mr-1" />
                          {resource.download_count}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() =>
                              togglePublishStatus(
                                resource.id,
                                resource.is_published
                              )
                            }
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              resource.is_published
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {resource.is_published ? '已发布' : '未发布'}
                          </button>
                          {resource.is_featured && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              推荐
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(resource.created_at).toLocaleDateString()}
                        </div>
                        {resource.created_by && (
                          <div className="flex items-center mt-1">
                            <User className="w-4 h-4 mr-1" />
                            创建者: {resource.created_by}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <a
                            href={resource.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-900"
                            title="预览"
                          >
                            <Eye className="w-4 h-4" />
                          </a>
                          <Link
                            href={`/admin/resources/${resource.id}`}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="编辑"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(resource.id)}
                            className="text-red-600 hover:text-red-900"
                            title="删除"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 统计信息 */}
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {resources.length}
              </div>
              <div className="text-sm text-gray-600">总资源数</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {resources.filter((r) => r.is_published).length}
              </div>
              <div className="text-sm text-gray-600">已发布</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {resources.filter((r) => r.is_featured).length}
              </div>
              <div className="text-sm text-gray-600">推荐资源</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {resources.reduce((sum, r) => sum + r.download_count, 0)}
              </div>
              <div className="text-sm text-gray-600">总下载量</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminResourcesPage;
