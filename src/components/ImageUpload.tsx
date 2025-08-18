'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, Eye, AlertCircle, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onError?: (error: string) => void;
  folder?: string;
  className?: string;
  placeholder?: string;
  showPreview?: boolean;
  allowRemove?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  onError,
  folder = 'images',
  className = '',
  placeholder = '点击或拖拽上传图片',
  showPreview = true,
  allowRemove = true,
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    onError?.(errorMessage);
  };

  const clearError = () => {
    setError('');
  };

  const validateFile = (file: File): boolean => {
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif',
    ];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      handleError('不支持的文件格式，请上传 JPG、PNG、WebP 或 GIF 格式的图片');
      return false;
    }

    if (file.size > maxSize) {
      handleError('文件大小不能超过 10MB');
      return false;
    }

    return true;
  };

  const uploadFile = async (file: File) => {
    if (!validateFile(file)) {
      return;
    }

    clearError();
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '上传失败');
      }

      if (result.success && result.url) {
        onChange(result.url);
      } else {
        throw new Error('上传失败，请重试');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      handleError(error.message || '上传失败，请重试');
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadFile(file);
    }
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

    const file = e.dataTransfer.files?.[0];
    if (file) {
      uploadFile(file);
    }
  };

  const handleRemove = () => {
    onChange('');
    clearError();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 当前图片预览 */}
      {value && showPreview && (
        <div className="relative inline-block">
          <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-200">
            <Image
              src={value}
              alt="预览图片"
              fill
              className="object-cover"
              sizes="128px"
            />
          </div>
          <div className="absolute -top-2 -right-2 flex gap-1">
            <button
              type="button"
              onClick={() => window.open(value, '_blank')}
              className="p-1 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
              title="预览图片"
            >
              <Eye className="w-3 h-3" />
            </button>
            {allowRemove && (
              <button
                type="button"
                onClick={handleRemove}
                className="p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                title="删除图片"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* 上传区域 */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
          dragActive
            ? 'border-blue-400 bg-blue-50'
            : error
              ? 'border-red-300 bg-red-50'
              : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />

        {uploading ? (
          <div className="flex flex-col items-center">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
            <p className="text-sm text-gray-600">上传中...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Upload
              className={`w-8 h-8 mb-2 ${
                dragActive ? 'text-blue-500' : 'text-gray-400'
              }`}
            />
            <p className="text-sm font-medium text-gray-900 mb-1">
              {value ? '更换图片' : placeholder}
            </p>
            <p className="text-xs text-gray-500">
              支持 JPG、PNG、WebP、GIF 格式，最大 10MB
            </p>
          </div>
        )}
      </div>

      {/* 错误信息 */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
