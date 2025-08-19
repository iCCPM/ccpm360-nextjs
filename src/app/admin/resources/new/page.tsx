'use client';

import React, { useState } from 'react';
import {
  Save,
  ArrowLeft,
  Eye,
  Tag,
  Calendar,
  Trash2,
  File,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import FileUpload from '@/components/FileUpload';

interface ResourceForm {
  title: string;
  description: string;
  content: string;
  category: string;
  tags: string[];
  resourceType: 'document' | 'video' | 'image' | 'link' | 'other';
  fileUrl: string;
  downloadUrl: string;
  externalUrl: string;
  publishDate: string;
  status: 'draft' | 'published';
  featured: boolean;
  fileSize: string;
  duration: string;
  author: string;
}

const initialForm: ResourceForm = {
  title: '',
  description: '',
  content: '',
  category: '',
  tags: [],
  resourceType: 'document',
  fileUrl: '',
  downloadUrl: '',
  externalUrl: '',
  publishDate: new Date().toISOString().split('T')[0] || '',
  status: 'draft',
  featured: false,
  fileSize: '',
  duration: '',
  author: '',
};

const resourceTypes = [
  { value: 'document', label: '文档资料' },
  { value: 'video', label: '视频教程' },
  { value: 'image', label: '图片素材' },
  { value: 'link', label: '外部链接' },
  { value: 'other', label: '其他' },
];

const categories = [
  '技术文档',
  '行业报告',
  '白皮书',
  '案例研究',
  '教程指南',
  '工具软件',
  '模板素材',
  '视频教程',
];

export default function NewResource() {
  const [form, setForm] = useState<ResourceForm>(initialForm);
  const [saving, setSaving] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const router = useRouter();

  const handleInputChange = (
    field: keyof ResourceForm,
    value: string | boolean
  ) => {
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

  const publishResource = async () => {
    if (!form.title.trim()) {
      toast.error('请输入资源标题');
      return;
    }
    if (!form.description.trim()) {
      toast.error('请输入资源描述');
      return;
    }
    if (!form.category) {
      toast.error('请选择资源分类');
      return;
    }

    setSaving(true);
    try {
      // TODO: 发布资源到API
      const publishData = { ...form, status: 'published' as const };
      console.log('发布资源:', publishData);
      toast.success('资源发布成功');
      router.push('/admin/resources');
    } catch (error) {
      console.error('发布资源失败:', error);
      toast.error('发布资源失败');
    } finally {
      setSaving(false);
    }
  };

  const previewResource = () => {
    // TODO: 实现预览功能
    toast.info('预览功能开发中');
  };

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // 模拟上传进度
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      const response = await fetch('/api/upload/file', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        throw new Error('上传失败');
      }

      const result = await response.json();

      if (!result.success || !result.url) {
        throw new Error('上传失败，请重试');
      }

      // 自动填充文件信息
      const fileName = file.name.split('.').slice(0, -1).join('.');

      setForm((prev) => ({
        ...prev,
        fileUrl: result.url,
        downloadUrl: result.url,
        fileSize: formatFileSize(file.size),
        // 如果标题为空，使用文件名作为标题
        title: prev.title || fileName,
        // 如果描述为空，添加基本描述
        description:
          prev.description ||
          `${getResourceTypeLabel(form.resourceType)}文件：${file.name}`,
      }));

      toast.success('文件上传成功');
    } catch (error) {
      console.error('文件上传失败:', error);
      toast.error(error instanceof Error ? error.message : '文件上传失败');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const getAcceptedFileTypes = () => {
    switch (form.resourceType) {
      case 'document':
        return '.pdf,.doc,.docx,.txt,.md,.rtf,.odt,.xls,.xlsx,.ppt,.pptx';
      case 'video':
        return '.mp4,.avi,.mov,.wmv,.flv,.webm,.mkv,.m4v';
      case 'image':
        return '.jpg,.jpeg,.png,.gif,.svg,.bmp,.webp,.tiff';
      default:
        return '.pdf,.doc,.docx,.txt,.md,.rtf,.odt,.xls,.xlsx,.ppt,.pptx,.mp4,.avi,.mov,.wmv,.jpg,.jpeg,.png,.gif,.svg';
    }
  };

  const getMaxFileSize = () => {
    switch (form.resourceType) {
      case 'video':
        return 100 * 1024 * 1024; // 100MB for videos
      case 'image':
        return 10 * 1024 * 1024; // 10MB for images
      case 'document':
        return 50 * 1024 * 1024; // 50MB for documents
      default:
        return 50 * 1024 * 1024; // 50MB default
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'document':
        return <File className="w-5 h-5 text-blue-500" />;
      case 'video':
        return <File className="w-5 h-5 text-red-500" />;
      case 'image':
        return <File className="w-5 h-5 text-green-500" />;
      default:
        return <File className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getResourceTypeLabel = (type: string) => {
    switch (type) {
      case 'document':
        return '文档';
      case 'video':
        return '视频';
      case 'image':
        return '图片';
      case 'link':
        return '链接';
      default:
        return '资源';
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/admin/resources"
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">新增资源</h1>
            <p className="text-gray-600 mt-1">创建新的资源内容</p>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={previewResource}
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
            onClick={publishResource}
            disabled={saving}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {saving ? '发布中...' : '发布资源'}
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
              {/* 资源标题 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  资源标题 *
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="请输入资源标题"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* 资源描述 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  资源描述 *
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    handleInputChange('description', e.target.value)
                  }
                  placeholder="请输入资源描述"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* 详细内容 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  详细内容
                </label>
                <textarea
                  value={form.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  placeholder="请输入详细内容（支持 Markdown 格式）"
                  rows={12}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                />
              </div>
            </div>
          </div>

          {/* 资源文件 */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">资源文件</h2>
            </div>

            <div className="p-6 space-y-6">
              {/* 外部链接 */}
              {form.resourceType === 'link' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    外部链接
                  </label>
                  <input
                    type="url"
                    value={form.externalUrl}
                    onChange={(e) =>
                      handleInputChange('externalUrl', e.target.value)
                    }
                    placeholder="请输入外部链接地址"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}

              {/* 文件上传 */}
              {form.resourceType !== 'link' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    上传文件
                  </label>
                  <FileUpload
                    onFileSelect={handleFileUpload}
                    uploading={uploading}
                    uploadProgress={uploadProgress}
                    acceptedTypes={getAcceptedFileTypes()}
                    maxSize={getMaxFileSize()}
                  />
                  {form.fileUrl && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          {getFileIcon(form.resourceType)}
                        </div>
                        <div className="ml-3 flex-1">
                          <p className="text-sm font-medium text-green-800">
                            文件上传成功
                          </p>
                          <p className="text-sm text-green-600">
                            {form.fileUrl.split('/').pop()}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setForm((prev) => ({
                              ...prev,
                              fileUrl: '',
                              fileSize: '',
                            }));
                          }}
                          className="text-green-600 hover:text-green-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 下载链接 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  下载链接
                </label>
                <input
                  type="url"
                  value={form.downloadUrl}
                  onChange={(e) =>
                    handleInputChange('downloadUrl', e.target.value)
                  }
                  placeholder="请输入下载链接（可选）"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
              {/* 资源类型 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  资源类型 *
                </label>
                <select
                  value={form.resourceType}
                  onChange={(e) =>
                    handleInputChange('resourceType', e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {resourceTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 资源分类 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  资源分类 *
                </label>
                <select
                  value={form.category}
                  onChange={(e) =>
                    handleInputChange('category', e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">请选择分类</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

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

              {/* 推荐资源 */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="featured"
                  checked={form.featured}
                  onChange={(e) =>
                    handleInputChange('featured', e.target.checked)
                  }
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="featured"
                  className="ml-2 block text-sm text-gray-900"
                >
                  设为推荐资源
                </label>
              </div>
            </div>
          </div>

          {/* 资源属性 */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">资源属性</h2>
            </div>

            <div className="p-6 space-y-4">
              {/* 作者 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  作者
                </label>
                <input
                  type="text"
                  value={form.author}
                  onChange={(e) => handleInputChange('author', e.target.value)}
                  placeholder="请输入作者名称"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* 文件大小 */}
              {form.resourceType !== 'link' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    文件大小
                  </label>
                  <input
                    type="text"
                    value={form.fileSize}
                    onChange={(e) =>
                      handleInputChange('fileSize', e.target.value)
                    }
                    placeholder="如：2.5MB"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}

              {/* 时长 */}
              {form.resourceType === 'video' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    视频时长
                  </label>
                  <input
                    type="text"
                    value={form.duration}
                    onChange={(e) =>
                      handleInputChange('duration', e.target.value)
                    }
                    placeholder="如：15:30"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}
            </div>
          </div>

          {/* 标签设置 */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900 flex items-center">
                <Tag className="w-4 h-4 mr-2" />
                资源标签
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
        </div>
      </div>
    </div>
  );
}
