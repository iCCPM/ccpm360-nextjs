'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Save, ArrowLeft, Trash2, X, Plus, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthProvider';

interface CaseStudy {
  id?: string;
  title: string;
  client_name: string;
  industry: string;
  project_duration: string;
  team_size: number;
  featured_image_url: string;
  tags: string[];
  published: boolean;
  results: string;
  challenge: string;
  solution: string;
  testimonial?: string;
}

const AdminCaseEdit = () => {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const isNew = id === 'new';
  const { user } = useAuth();

  const [formData, setFormData] = useState<CaseStudy>({
    title: '',
    client_name: '',
    industry: '',
    project_duration: '',
    team_size: 1,
    featured_image_url: '',
    tags: [],
    published: false,
    results: '',
    challenge: '',
    solution: '',
    testimonial: '',
  });

  const [originalData, setOriginalData] = useState<CaseStudy | null>(null);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    // 检查用户是否已登录
    if (!user) {
      router.push('/admin/login');
      return;
    }

    if (!isNew && id) {
      loadCase();
    }
  }, [id, isNew, user, router]);

  const loadCase = async () => {
    try {
      const { data, error } = await supabase
        .from('case_studies')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        const loadedData = {
          ...data,
          tags: data.tags || [],
          results: data.results || '',
          challenge: data.challenge || '',
          solution: data.solution || '',
          testimonial: data.testimonial || '',
        };
        setFormData(loadedData);
        setOriginalData(loadedData); // 保存原始数据用于对比
      }
    } catch (error) {
      console.error('Failed to load case:', error);
      setMessage('加载案例失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.client_name.trim()) {
      setMessage('请填写必填字段');
      return;
    }

    setSaving(true);
    setMessage('');

    try {
      // 检查用户权限
      if (!user) {
        setMessage('用户未登录，请重新登录');
        setSaving(false);
        return;
      }

      console.log('Current user:', user);
      console.log('User role:', user.role);

      // 准备数据，确保字段类型正确
      const caseData = {
        title: formData.title.trim(),
        client_name: formData.client_name.trim(),
        industry: formData.industry || '',
        project_duration: formData.project_duration || null,
        team_size: formData.team_size || null,
        featured_image_url: formData.featured_image_url || null,
        tags: formData.tags || [], // 确保tags是数组
        published: formData.published || false,
        results: formData.results || '',
        challenge: formData.challenge || '',
        solution: formData.solution || '',
        testimonial: formData.testimonial || null,
        updated_at: new Date().toISOString(),
      };

      console.log('Saving case data:', caseData);
      console.log('Case ID:', id);
      console.log('Case ID type:', typeof id);
      console.log('Is new:', isNew);

      let result;
      if (isNew) {
        result = await supabase
          .from('case_studies')
          .insert([{ ...caseData, created_at: new Date().toISOString() }])
          .select();

        console.log('Insert result:', result);
        if (result.error) throw result.error;
        setMessage('案例创建成功！');
      } else {
        // 先检查记录是否存在
        console.log('Checking if record exists with ID:', id);
        const { data: existingRecord, error: checkError } = await supabase
          .from('case_studies')
          .select('id, title')
          .eq('id', id)
          .single();

        console.log('Existing record check:', {
          data: existingRecord,
          error: checkError,
        });

        if (checkError) {
          if (checkError.code === 'PGRST116') {
            throw new Error(`记录不存在，ID: ${id}`);
          } else {
            throw checkError;
          }
        }

        if (!existingRecord) {
          throw new Error(`没有找到ID为 ${id} 的记录`);
        }

        console.log('Record exists, proceeding with update...');

        // 对比原始数据和新数据
        if (originalData) {
          console.log('Original data:', originalData);
          console.log('New data:', caseData);

          // 检查是否有实际变化
          const hasChanges = Object.keys(caseData).some((key) => {
            if (key === 'updated_at') return false; // 忽略时间戳
            if (key === 'tags') {
              // 特殊处理数组比较
              const originalTags = originalData.tags || [];
              const newTags = caseData.tags || [];
              return (
                JSON.stringify(originalTags.sort()) !==
                JSON.stringify(newTags.sort())
              );
            }
            const originalKey = key as keyof typeof originalData;
            const caseKey = key as keyof typeof caseData;
            return originalData[originalKey] !== caseData[caseKey];
          });

          console.log('Has changes:', hasChanges);
          if (!hasChanges) {
            console.log('No changes detected, skipping update');
            setMessage('没有检测到数据变化');
            setSaving(false);
            return;
          }
        }

        // 尝试逐个字段更新以定位问题
        console.log(
          'Attempting update with data:',
          JSON.stringify(caseData, null, 2)
        );

        result = await supabase
          .from('case_studies')
          .update(caseData)
          .eq('id', id)
          .select();

        console.log('Update result:', result);
        if (result.error) {
          console.error('Update error:', result.error);
          throw result.error;
        }

        if (result.data && result.data.length === 0) {
          // 尝试简化的更新来测试
          console.log('Trying simplified update...');
          const simplifiedData = {
            title: caseData.title,
            updated_at: new Date().toISOString(),
          };

          const simpleResult = await supabase
            .from('case_studies')
            .update(simplifiedData)
            .eq('id', id)
            .select();

          console.log('Simplified update result:', simpleResult);

          if (simpleResult.data && simpleResult.data.length > 0) {
            throw new Error('复杂数据更新失败，可能存在字段类型问题');
          } else {
            throw new Error('更新操作未影响任何记录，可能是权限或约束问题');
          }
        }

        console.log('Update successful, affected rows:', result.data.length);
        setMessage('案例更新成功！');
      }

      setTimeout(() => {
        router.push('/admin/cases');
      }, 1500);
    } catch (error: any) {
      console.error('Failed to save case:', error);
      console.error('Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      setMessage(`保存失败：${error.message || '请重试'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('确定要删除这个案例吗？此操作不可撤销。')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('case_studies')
        .delete()
        .eq('id', id);

      if (error) throw error;
      router.push('/admin/cases');
    } catch (error) {
      console.error('Failed to delete case:', error);
      setMessage('删除失败，请重试');
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag('');
    }
  };

  const removeTag = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index),
    }));
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
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/admin/cases"
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>返回案例列表</span>
          </Link>
        </div>
        <div className="flex items-center space-x-3">
          {!isNew && (
            <button
              onClick={handleDelete}
              className="flex items-center space-x-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors duration-200"
            >
              <Trash2 className="w-4 h-4" />
              <span>删除</span>
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors duration-200"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? '保存中...' : '保存'}</span>
          </button>
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {isNew ? '创建新案例' : '编辑案例'}
        </h1>
        <p className="text-gray-600 mt-1">
          {isNew ? '添加新的成功案例' : '修改案例信息和内容'}
        </p>
      </div>

      {/* 消息提示 */}
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.includes('成功')
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 主要信息 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 基本信息 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              基本信息
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  案例标题 *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="输入案例标题"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    客户名称 *
                  </label>
                  <input
                    type="text"
                    value={formData.client_name}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        client_name: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="客户公司名称"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    所属行业
                  </label>
                  <input
                    type="text"
                    value={formData.industry}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        industry: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="如：制造业、IT软件、建筑工程"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    项目周期
                  </label>
                  <input
                    type="text"
                    value={formData.project_duration}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        project_duration: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="如：6个月、1年"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    团队规模
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.team_size}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        team_size: parseInt(e.target.value) || 1,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="团队人数"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  案例图片URL
                </label>
                <input
                  type="url"
                  value={formData.featured_image_url}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      featured_image_url: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>
          </div>

          {/* 项目成果 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              项目成果
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                项目成果描述
              </label>
              <textarea
                value={formData.results}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, results: e.target.value }))
                }
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="详细描述项目取得的成果和效益"
              />
            </div>
          </div>

          {/* 挑战与解决方案 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              挑战与解决方案
            </h2>

            <div className="space-y-6">
              {/* 项目挑战 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  项目挑战
                </label>
                <textarea
                  value={formData.challenge}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      challenge: e.target.value,
                    }))
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="描述项目面临的主要挑战和难点"
                />
              </div>

              {/* 解决方案 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  解决方案
                </label>
                <textarea
                  value={formData.solution}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      solution: e.target.value,
                    }))
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="描述采用的解决方案和实施方法"
                />
              </div>
            </div>
          </div>

          {/* 客户评价 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              客户评价
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                客户反馈
              </label>
              <textarea
                value={formData.testimonial}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    testimonial: e.target.value,
                  }))
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="客户对项目的评价和反馈（可选）"
              />
            </div>
          </div>
        </div>

        {/* 侧边栏 */}
        <div className="space-y-6">
          {/* 发布状态 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              发布状态
            </h2>
            <div className="flex items-center space-x-3">
              <button
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    published: !prev.published,
                  }))
                }
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  formData.published
                    ? 'bg-green-100 text-green-700 border border-green-200'
                    : 'bg-gray-100 text-gray-700 border border-gray-200'
                }`}
              >
                {formData.published ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeOff className="w-4 h-4" />
                )}
                <span>{formData.published ? '已发布' : '草稿'}</span>
              </button>
            </div>
          </div>

          {/* 标签 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">标签</h2>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                  >
                    <span>{tag}</span>
                    <button
                      onClick={() => removeTag(index)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="添加标签"
                />
                <button
                  onClick={addTag}
                  className="p-2 text-blue-600 hover:text-blue-700"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCaseEdit;
