'use client';

import { useState } from 'react';
import { Save, ArrowLeft, Eye, Upload, Tag, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface BlogPostForm {
  title: string;
  excerpt: string;
  content: string;
  tags: string[];
  status: 'draft' | 'published';
  publishDate: string;
  featuredImage: string;
}

const initialForm: BlogPostForm = {
  title: '',
  excerpt: '',
  content: '',
  tags: [],
  status: 'draft',
  publishDate: new Date().toISOString().split('T')[0] || '',
  featuredImage: '',
};

export default function NewBlogPost() {
  const [form, setForm] = useState<BlogPostForm>(initialForm);
  const [saving, setSaving] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const router = useRouter();

  const handleInputChange = (field: keyof BlogPostForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const addTag = () => {
    if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
      setForm((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const saveDraft = async () => {
    setSaving(true);
    try {
      // TODO: 保存草稿到API
      const draftData = { ...form, status: 'draft' as const };
      console.log('保存草稿:', draftData);
      toast.success('草稿保存成功');
    } catch (error) {
      console.error('保存草稿失败:', error);
      toast.error('保存草稿失败');
    } finally {
      setSaving(false);
    }
  };

  const publishPost = async () => {
    if (!form.title.trim()) {
      toast.error('请输入文章标题');
      return;
    }
    if (!form.content.trim()) {
      toast.error('请输入文章内容');
      return;
    }

    setSaving(true);
    try {
      // TODO: 发布文章到API
      const publishData = { ...form, status: 'published' as const };
      console.log('发布文章:', publishData);
      toast.success('文章发布成功');
      router.push('/admin/blog');
    } catch (error) {
      console.error('发布文章失败:', error);
      toast.error('发布文章失败');
    } finally {
      setSaving(false);
    }
  };

  const previewPost = () => {
    // TODO: 实现预览功能
    toast.info('预览功能开发中');
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/admin/blog"
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">新增博客文章</h1>
            <p className="text-gray-600 mt-1">创建新的博客文章</p>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={previewPost}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Eye className="w-4 h-4 mr-2" />
            预览
          </button>

          <button
            onClick={saveDraft}
            disabled={saving}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <Save className="w-4 h-4 mr-2" />
            保存草稿
          </button>

          <button
            onClick={publishPost}
            disabled={saving}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {saving ? '发布中...' : '发布文章'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 主要内容区域 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 基本信息 */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">文章内容</h2>
            </div>

            <div className="p-6 space-y-6">
              {/* 标题 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  文章标题 *
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="请输入文章标题"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* 摘要 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  文章摘要
                </label>
                <textarea
                  value={form.excerpt}
                  onChange={(e) => handleInputChange('excerpt', e.target.value)}
                  placeholder="请输入文章摘要（可选）"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* 内容 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  文章内容 *
                </label>
                <textarea
                  value={form.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  placeholder="请输入文章内容（支持 Markdown 格式）"
                  rows={20}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 侧边栏 */}
        <div className="space-y-6">
          {/* 发布设置 */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">发布设置</h2>
            </div>

            <div className="p-6 space-y-4">
              {/* 发布日期 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  发布日期
                </label>
                <input
                  type="date"
                  value={form.publishDate}
                  onChange={(e) =>
                    handleInputChange('publishDate', e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* 状态 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  文章状态
                </label>
                <select
                  value={form.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="draft">草稿</option>
                  <option value="published">发布</option>
                </select>
              </div>
            </div>
          </div>

          {/* 标签设置 */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900 flex items-center">
                <Tag className="w-4 h-4 mr-2" />
                文章标签
              </h2>
            </div>

            <div className="p-6 space-y-4">
              {/* 添加标签 */}
              <div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="输入标签名称"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    onClick={addTag}
                    className="px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    添加
                  </button>
                </div>
              </div>

              {/* 标签列表 */}
              {form.tags.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    已添加的标签
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {form.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                      >
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 特色图片 */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900 flex items-center">
                <Upload className="w-4 h-4 mr-2" />
                特色图片
              </h2>
            </div>

            <div className="p-6">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <button className="text-blue-600 hover:text-blue-500">
                    点击上传图片
                  </button>
                  <p className="text-sm text-gray-500 mt-1">或拖拽图片到此处</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
