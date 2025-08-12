'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye,
  Calendar,
  Tag,
  Building,
  MoreVertical
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface CaseStudy {
  id: string;
  title: string;
  description: string;
  client_name: string;
  industry: string;
  project_duration: string;
  team_size: number;
  image_url: string;
  tags: string[];
  published: boolean;
  created_at: string;
  updated_at: string;
}

const AdminCases = () => {
  const [cases, setCases] = useState<CaseStudy[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');
  const [selectedCases, setSelectedCases] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [caseToDelete, setCaseToDelete] = useState<string | null>(null);

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    try {
      const { data, error } = await supabase
        .from('case_studies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCases(data || []);
    } catch (error) {
      console.error('Failed to load cases:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('case_studies')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setCases(prev => prev.filter(c => c.id !== id));
      setShowDeleteModal(false);
      setCaseToDelete(null);
    } catch (error) {
      console.error('Failed to delete case:', error);
    }
  };

  const handleBatchDelete = async () => {
    try {
      const { error } = await supabase
        .from('case_studies')
        .delete()
        .in('id', selectedCases);

      if (error) throw error;
      
      setCases(prev => prev.filter(c => !selectedCases.includes(c.id)));
      setSelectedCases([]);
    } catch (error) {
      console.error('Failed to delete cases:', error);
    }
  };

  const togglePublished = async (id: string, published: boolean) => {
    try {
      const { error } = await supabase
        .from('case_studies')
        .update({ published: !published })
        .eq('id', id);

      if (error) throw error;
      
      setCases(prev => prev.map(c => 
        c.id === id ? { ...c, published: !published } : c
      ));
    } catch (error) {
      console.error('Failed to update case status:', error);
    }
  };

  const filteredCases = cases.filter(case_study => {
    const matchesSearch = case_study.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         case_study.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         case_study.industry.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'published' && case_study.published) ||
                         (filterStatus === 'draft' && !case_study.published);
    
    return matchesSearch && matchesFilter;
  });

  const handleSelectAll = () => {
    if (selectedCases.length === filteredCases.length) {
      setSelectedCases([]);
    } else {
      setSelectedCases(filteredCases.map(c => c.id));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题和操作 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">成功案例管理</h1>
          <p className="text-gray-600 mt-1">管理客户成功案例和项目展示</p>
        </div>
        <Link
          href="/admin/cases/new"
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          <Plus className="w-4 h-4" />
          <span>添加案例</span>
        </Link>
      </div>

      {/* 搜索和筛选 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* 搜索框 */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="搜索案例标题、客户名称或行业..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* 状态筛选 */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">全部状态</option>
              <option value="published">已发布</option>
              <option value="draft">草稿</option>
            </select>
          </div>
        </div>

        {/* 批量操作 */}
        {selectedCases.length > 0 && (
          <div className="mt-4 flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <span className="text-sm text-blue-700">
              已选择 {selectedCases.length} 个案例
            </span>
            <button
              onClick={handleBatchDelete}
              className="flex items-center space-x-1 px-3 py-1 text-sm text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
              <span>批量删除</span>
            </button>
          </div>
        )}
      </div>

      {/* 案例列表 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {filteredCases.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Eye className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无案例</h3>
            <p className="text-gray-600 mb-4">开始创建您的第一个成功案例</p>
            <Link
              href="/admin/cases/new"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              <span>添加案例</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden">
            {/* 表格头部 */}
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedCases.length === filteredCases.length}
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-3 text-sm font-medium text-gray-700">全选</span>
              </div>
            </div>

            {/* 案例列表 */}
            <div className="divide-y divide-gray-200">
              {filteredCases.map((case_study) => (
                <div key={case_study.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-start space-x-4">
                    {/* 选择框 */}
                    <input
                      type="checkbox"
                      checked={selectedCases.includes(case_study.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCases(prev => [...prev, case_study.id]);
                        } else {
                          setSelectedCases(prev => prev.filter(id => id !== case_study.id));
                        }
                      }}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
                    />

                    {/* 案例图片 */}
                    <div className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      {case_study.image_url ? (
                        <img 
                          src={case_study.image_url} 
                          alt={case_study.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Building className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* 案例信息 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900 mb-1">
                            {case_study.title}
                          </h3>
                          <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                            {case_study.description}
                          </p>
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Building className="w-4 h-4" />
                              <span>{case_study.client_name}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Tag className="w-4 h-4" />
                              <span>{case_study.industry}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(case_study.created_at).toLocaleDateString('zh-CN')}</span>
                            </div>
                          </div>

                          {/* 标签 */}
                          {case_study.tags && case_study.tags.length > 0 && (
                            <div className="flex items-center space-x-2 mt-2">
                              {case_study.tags.slice(0, 3).map((tag, index) => (
                                <span 
                                  key={index}
                                  className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                                >
                                  {tag}
                                </span>
                              ))}
                              {case_study.tags.length > 3 && (
                                <span className="text-xs text-gray-500">
                                  +{case_study.tags.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* 状态和操作 */}
                        <div className="flex items-center space-x-3 ml-4">
                          {/* 发布状态 */}
                          <button
                            onClick={() => togglePublished(case_study.id, case_study.published)}
                            className={`px-3 py-1 text-xs font-medium rounded-full ${
                              case_study.published 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-yellow-100 text-yellow-700'
                            }`}
                          >
                            {case_study.published ? '已发布' : '草稿'}
                          </button>

                          {/* 操作按钮 */}
                          <div className="flex items-center space-x-1">
                            <Link
                              href={`/cases/${case_study.id}`}
                              target="_blank"
                              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                              title="预览"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            <Link
                              href={`/admin/cases/${case_study.id}`}
                              className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-gray-100"
                              title="编辑"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => {
                                setCaseToDelete(case_study.id);
                                setShowDeleteModal(true);
                              }}
                              className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100"
                              title="删除"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 删除确认模态框 */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">确认删除</h3>
            <p className="text-gray-600 mb-6">
              确定要删除这个案例吗？此操作无法撤销。
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setCaseToDelete(null);
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={() => caseToDelete && handleDelete(caseToDelete)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCases;