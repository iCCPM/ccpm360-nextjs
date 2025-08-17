'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Upload,
  X,
  Plus,
  Save,
  Eye,
  FileText,
  Image,
  Video,
  File,
  AlertCircle,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthProvider';

interface ResourceForm {
  title: string;
  description: string;
  category: string;
  tags: string[];
  is_featured: boolean;
  is_published: boolean;
  file?: File;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  file_type?: string;
}

const AdminResourceEditPage = () => {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const isNew = params.id === 'new';

  const [form, setForm] = useState<ResourceForm>({
    title: '',
    description: '',
    category: 'document',
    tags: [],
    is_featured: false,
    is_published: false,
  });

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newTag, setNewTag] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const categories = [
    { value: 'document', label: '文档资料' },
    { value: 'template', label: '模板工具' },
    { value: 'guide', label: '指导手册' },
    { value: 'case_study', label: '案例研究' },
    { value: 'training', label: '培训材料' },
    { value: 'other', label: '其他' },
  ];

  useEffect(() => {
    if (!isNew) {
      loadResource();
    }
  }, [params.id, isNew]);

  const loadResource = async () => {
    if (!params.id || params.id === 'new') return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('download_resources')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) {
        console.error('Failed to load resource:', error);
        router.push('/admin/resources');
        return;
      }

      if (data) {
        setForm({
          title: data.title,
          description: data.description,
          category: data.category,
          tags: data.tags || [],
          is_featured: data.is_featured,
          is_published: data.is_published,
          file_url: data.file_url,
          file_name: data.file_name,
          file_size: data.file_size,
          file_type: data.file_type,
        });
      }
    } catch (error) {
      console.error('Failed to load resource:', error);
      router.push('/admin/resources');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!form.title.trim()) {
      newErrors.title = '请输入资源标题';
    }

    if (!form.description.trim()) {
      newErrors.description = '请输入资源描述';
    }

    if (!form.category) {
      newErrors.category = '请选择资源分类';
    }

    if (isNew && !form.file) {
      newErrors.file = '请上传资源文件';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileSelect = (file: File) => {
    if (file.size > 50 * 1024 * 1024) {
      // 50MB limit
      setErrors({ ...errors, file: '文件大小不能超过50MB' });
      return;
    }

    setForm({
      ...form,
      file,
      file_name: file.name,
      file_size: file.size,
      file_type: file.type,
    });

    // Clear file error
    const newErrors = { ...errors };
    delete newErrors.file;
    setErrors(newErrors);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const uploadFile = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `resources/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('files')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage.from('files').getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      let fileUrl = form.file_url;
      let fileName = form.file_name;
      let fileSize = form.file_size;
      let fileType = form.file_type;

      // Upload new file if provided
      if (form.file) {
        setUploading(true);
        fileUrl = await uploadFile(form.file);
        fileName = form.file.name;
        fileSize = form.file.size;
        fileType = form.file.type;
        setUploading(false);
      }

      const resourceData = {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        tags: form.tags,
        is_featured: form.is_featured,
        is_published: form.is_published,
        file_url: fileUrl,
        file_name: fileName,
        file_size: fileSize,
        file_type: fileType,
        updated_at: new Date().toISOString(),
      };

      if (isNew) {
        const { error } = await supabase.from('download_resources').insert({
          ...resourceData,
          created_by: user?.id,
          download_count: 0,
          created_at: new Date().toISOString(),
        });

        if (error) {
          throw error;
        }
      } else {
        const { error } = await supabase
          .from('download_resources')
          .update(resourceData)
          .eq('id', params.id);

        if (error) {
          throw error;
        }
      }

      router.push('/admin/resources');
    } catch (error: any) {
      console.error('Failed to save resource:', error);
      setErrors({ submit: error.message || '保存失败，请重试' });
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !form.tags.includes(newTag.trim())) {
      setForm({
        ...form,
        tags: [...form.tags, newTag.trim()],
      });
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setForm({
      ...form,
      tags: form.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const getFileIcon = (fileType?: string) => {
    if (!fileType) return <File className="w-8 h-8" />;
    if (fileType.startsWith('image/')) return <Image className="w-8 h-8" />;
    if (fileType.startsWith('video/')) return <Video className="w-8 h-8" />;
    if (fileType.includes('pdf') || fileType.includes('document'))
      return <FileText className="w-8 h-8" />;
    return <File className="w-8 h-8" />;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading && !isNew) {
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/admin/resources"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              返回资源列表
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isNew ? '新建资源' : '编辑资源'}
          </h1>
          <p className="mt-2 text-gray-600">
            {isNew ? '上传新的资源文件并设置相关信息' : '修改资源信息和文件'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 基本信息 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              基本信息
            </h2>

            <div className="grid grid-cols-1 gap-6">
              {/* 标题 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  资源标题 *
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.title ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="请输入资源标题"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.title}
                  </p>
                )}
              </div>

              {/* 描述 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  资源描述 *
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.description ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="请输入资源描述"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.description}
                  </p>
                )}
              </div>

              {/* 分类 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  资源分类 *
                </label>
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.category ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.category}
                  </p>
                )}
              </div>

              {/* 标签 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  标签
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {form.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === 'Enter' && (e.preventDefault(), addTag())
                    }
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="输入标签名称"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 文件上传 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              文件上传
            </h2>

            {/* 当前文件信息 */}
            {(form.file_url || form.file) && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  当前文件
                </h3>
                <div className="flex items-center gap-3">
                  <div className="text-gray-400">
                    {getFileIcon(form.file_type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {form.file?.name || form.file_name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(form.file?.size || form.file_size)}
                    </p>
                  </div>
                  {form.file_url && (
                    <a
                      href={form.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
                    >
                      <Eye className="w-4 h-4" />
                      预览
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* 文件上传区域 */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? 'border-blue-400 bg-blue-50'
                  : errors.file
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload
                className={`w-12 h-12 mx-auto mb-4 ${
                  dragActive ? 'text-blue-500' : 'text-gray-400'
                }`}
              />
              <p className="text-lg font-medium text-gray-900 mb-2">
                {isNew ? '上传资源文件' : '更换文件（可选）'}
              </p>
              <p className="text-sm text-gray-600 mb-4">
                拖拽文件到此处，或点击选择文件
              </p>
              <input
                type="file"
                onChange={(e) =>
                  e.target.files?.[0] && handleFileSelect(e.target.files[0])
                }
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
              >
                <Upload className="w-4 h-4" />
                选择文件
              </label>
              <p className="text-xs text-gray-500 mt-2">
                支持所有文件类型，最大50MB
              </p>
            </div>

            {errors.file && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.file}
              </p>
            )}
          </div>

          {/* 发布设置 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              发布设置
            </h2>

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_published"
                  checked={form.is_published}
                  onChange={(e) =>
                    setForm({ ...form, is_published: e.target.checked })
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor="is_published"
                  className="ml-2 text-sm text-gray-700"
                >
                  立即发布（用户可见）
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_featured"
                  checked={form.is_featured}
                  onChange={(e) =>
                    setForm({ ...form, is_featured: e.target.checked })
                  }
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor="is_featured"
                  className="ml-2 text-sm text-gray-700"
                >
                  设为推荐资源
                </label>
              </div>
            </div>
          </div>

          {/* 错误信息 */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <p className="text-sm text-red-700">{errors.submit}</p>
              </div>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex justify-end gap-4">
            <Link
              href="/admin/resources"
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              取消
            </Link>
            <button
              type="submit"
              disabled={loading || uploading}
              className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading || uploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {uploading ? '上传中...' : '保存中...'}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {isNew ? '创建资源' : '保存修改'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminResourceEditPage;
