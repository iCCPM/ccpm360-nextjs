'use client';

import { useState } from 'react';
import {
  Save,
  ArrowLeft,
  Eye,
  Upload,
  Tag,
  Calendar,
  MapPin,
  Users,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ImageUpload from '@/components/ImageUpload';

interface CaseForm {
  title: string;
  client: string;
  industry: string;
  description: string;
  challenge: string;
  solution: string;
  results: string;
  technologies: string[];
  projectDate: string;
  duration: string;
  teamSize: string;
  location: string;
  status: 'draft' | 'published';
  featuredImage: string;
  gallery: string[];
}

const initialForm: CaseForm = {
  title: '',
  client: '',
  industry: '',
  description: '',
  challenge: '',
  solution: '',
  results: '',
  technologies: [],
  projectDate: new Date().toISOString().split('T')[0] || '',
  duration: '',
  teamSize: '',
  location: '',
  status: 'draft',
  featuredImage: '',
  gallery: [],
};

export default function NewCase() {
  const [form, setForm] = useState<CaseForm>(initialForm);
  const [saving, setSaving] = useState(false);
  const [techInput, setTechInput] = useState('');
  const router = useRouter();

  const handleInputChange = (field: keyof CaseForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const addTechnology = () => {
    if (techInput.trim() && !form.technologies.includes(techInput.trim())) {
      setForm((prev) => ({
        ...prev,
        technologies: [...prev.technologies, techInput.trim()],
      }));
      setTechInput('');
    }
  };

  const removeTechnology = (techToRemove: string) => {
    setForm((prev) => ({
      ...prev,
      technologies: prev.technologies.filter((tech) => tech !== techToRemove),
    }));
  };

  const addToGallery = (url: string) => {
    setForm((prev) => ({
      ...prev,
      gallery: [...prev.gallery, url],
    }));
  };

  const removeFromGallery = (index: number) => {
    setForm((prev) => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== index),
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTechnology();
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

  const publishCase = async () => {
    if (!form.title.trim()) {
      toast.error('请输入案例标题');
      return;
    }
    if (!form.client.trim()) {
      toast.error('请输入客户名称');
      return;
    }
    if (!form.description.trim()) {
      toast.error('请输入案例描述');
      return;
    }

    setSaving(true);
    try {
      // TODO: 发布案例到API
      const publishData = { ...form, status: 'published' as const };
      console.log('发布案例:', publishData);
      toast.success('案例发布成功');
      router.push('/admin/cases');
    } catch (error) {
      console.error('发布案例失败:', error);
      toast.error('发布案例失败');
    } finally {
      setSaving(false);
    }
  };

  const previewCase = () => {
    // TODO: 实现预览功能
    toast.info('预览功能开发中');
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/admin/cases"
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">新增成功案例</h1>
            <p className="text-gray-600 mt-1">创建新的成功案例</p>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={previewCase}
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
            onClick={publishCase}
            disabled={saving}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {saving ? '发布中...' : '发布案例'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 主要内容区域 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 基本信息 */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">基本信息</h2>
            </div>

            <div className="p-6 space-y-6">
              {/* 案例标题 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  案例标题 *
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="请输入案例标题"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 客户名称 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    客户名称 *
                  </label>
                  <input
                    type="text"
                    value={form.client}
                    onChange={(e) =>
                      handleInputChange('client', e.target.value)
                    }
                    placeholder="请输入客户名称"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* 所属行业 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    所属行业
                  </label>
                  <input
                    type="text"
                    value={form.industry}
                    onChange={(e) =>
                      handleInputChange('industry', e.target.value)
                    }
                    placeholder="请输入所属行业"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* 案例描述 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  案例描述 *
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    handleInputChange('description', e.target.value)
                  }
                  placeholder="请输入案例描述"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* 项目详情 */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">项目详情</h2>
            </div>

            <div className="p-6 space-y-6">
              {/* 面临挑战 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  面临挑战
                </label>
                <textarea
                  value={form.challenge}
                  onChange={(e) =>
                    handleInputChange('challenge', e.target.value)
                  }
                  placeholder="描述客户面临的挑战和问题"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* 解决方案 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  解决方案
                </label>
                <textarea
                  value={form.solution}
                  onChange={(e) =>
                    handleInputChange('solution', e.target.value)
                  }
                  placeholder="描述提供的解决方案"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* 项目成果 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  项目成果
                </label>
                <textarea
                  value={form.results}
                  onChange={(e) => handleInputChange('results', e.target.value)}
                  placeholder="描述项目取得的成果和效果"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 侧边栏 */}
        <div className="space-y-6">
          {/* 项目信息 */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">项目信息</h2>
            </div>

            <div className="p-6 space-y-4">
              {/* 项目日期 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  项目日期
                </label>
                <input
                  type="date"
                  value={form.projectDate}
                  onChange={(e) =>
                    handleInputChange('projectDate', e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* 项目周期 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  项目周期
                </label>
                <input
                  type="text"
                  value={form.duration}
                  onChange={(e) =>
                    handleInputChange('duration', e.target.value)
                  }
                  placeholder="如：3个月"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* 团队规模 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  团队规模
                </label>
                <input
                  type="text"
                  value={form.teamSize}
                  onChange={(e) =>
                    handleInputChange('teamSize', e.target.value)
                  }
                  placeholder="如：5人"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* 项目地点 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  项目地点
                </label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) =>
                    handleInputChange('location', e.target.value)
                  }
                  placeholder="如：北京"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* 状态 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  发布状态
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

          {/* 技术栈 */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900 flex items-center">
                <Tag className="w-4 h-4 mr-2" />
                技术栈
              </h2>
            </div>

            <div className="p-6 space-y-4">
              {/* 添加技术 */}
              <div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="输入技术名称"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    onClick={addTechnology}
                    className="px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    添加
                  </button>
                </div>
              </div>

              {/* 技术列表 */}
              {form.technologies.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    已添加的技术
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {form.technologies.map((tech, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                      >
                        {tech}
                        <button
                          onClick={() => removeTechnology(tech)}
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

          {/* 项目图片 */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900 flex items-center">
                <Upload className="w-4 h-4 mr-2" />
                项目图片
              </h2>
            </div>

            <div className="p-6 space-y-4">
              {/* 特色图片 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  特色图片
                </label>
                <ImageUpload
                  value={form.featuredImage}
                  onChange={(url) => handleInputChange('featuredImage', url)}
                  folder="cases/featured"
                  placeholder="点击或拖拽上传特色图片"
                  onError={(error) => toast.error(error)}
                />
              </div>

              {/* 项目图库 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  项目图库
                </label>

                {/* 已上传的图片 */}
                {form.gallery.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {form.gallery.map((imageUrl, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={imageUrl}
                          alt={`图库图片 ${index + 1}`}
                          className="w-full h-20 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeFromGallery(index)}
                          className="absolute -top-2 -right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          title="删除图片"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* 上传新图片 */}
                <ImageUpload
                  value=""
                  onChange={addToGallery}
                  folder="cases/gallery"
                  placeholder="点击或拖拽添加图片到图库"
                  showPreview={false}
                  allowRemove={false}
                  onError={(error) => toast.error(error)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
