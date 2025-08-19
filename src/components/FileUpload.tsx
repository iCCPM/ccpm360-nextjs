'use client';

import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { Upload } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  uploading?: boolean;
  uploadProgress?: number;
  acceptedTypes?: string;
  maxSize?: number;
  className?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  uploading = false,
  uploadProgress = 0,
  acceptedTypes = '*',
  maxSize = 10 * 1024 * 1024, // 10MB default
  className = '',
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0 && files[0]) {
      handleFileSelection(files[0]);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0 && files[0]) {
      handleFileSelection(files[0]);
    }
  };

  const handleFileSelection = (file: File) => {
    // 检查文件大小
    if (file.size > maxSize) {
      alert(`文件大小不能超过 ${formatFileSize(maxSize)}`);
      return;
    }

    // 检查文件类型
    if (acceptedTypes !== '*') {
      const allowedTypes = acceptedTypes.split(',');
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!allowedTypes.some((type) => type.trim() === fileExtension)) {
        alert(`不支持的文件类型。支持的类型：${acceptedTypes}`);
        return;
      }
    }

    onFileSelect(file);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleClick = () => {
    if (!uploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer
          ${isDragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300'}
          ${uploading ? 'pointer-events-none opacity-50' : 'hover:border-gray-400'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={acceptedTypes}
          onChange={handleFileInputChange}
          disabled={uploading}
        />

        {uploading ? (
          <div className="space-y-4">
            <div className="mx-auto h-12 w-12 text-blue-500">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">上传中...</p>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">{uploadProgress}%</p>
            </div>
          </div>
        ) : (
          <div>
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <button
                type="button"
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                点击上传文件
              </button>
              <p className="text-sm text-gray-500 mt-1">或拖拽文件到此处</p>
              <p className="text-xs text-gray-400 mt-2">
                支持格式：{acceptedTypes === '*' ? '所有格式' : acceptedTypes}
              </p>
              <p className="text-xs text-gray-400">
                最大大小：{formatFileSize(maxSize)}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
