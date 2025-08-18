'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
  User as UserIcon,
  Mail,
  Calendar,
  Shield,
  Edit2,
  Save,
  X,
} from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  phone?: string;
  created_at: string;
  updated_at?: string | undefined;
}

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: '',
    bio: '',
    phone: '',
  });
  const [showToast, setShowToast] = useState({
    show: false,
    message: '',
    type: 'success' as 'success' | 'error',
  });

  useEffect(() => {
    loadUserProfile();
  }, []);

  const showToastMessage = (
    message: string,
    type: 'success' | 'error' = 'success'
  ) => {
    setShowToast({ show: true, message, type });
    setTimeout(
      () => setShowToast({ show: false, message: '', type: 'success' }),
      3000
    );
  };

  const loadUserProfile = async () => {
    try {
      setIsLoading(true);

      // 获取当前用户
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;

      if (user) {
        setUser(user);

        // 构建用户资料对象
        const userProfile: UserProfile = {
          id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.['full_name'] || '',
          avatar_url: user.user_metadata?.['avatar_url'] || '',
          bio: user.user_metadata?.['bio'] || '',
          phone: user.user_metadata?.['phone'] || '',
          created_at: user.created_at,
          updated_at: user.updated_at || undefined,
        };

        setProfile(userProfile);
        setEditForm({
          full_name: userProfile.full_name || '',
          bio: userProfile.bio || '',
          phone: userProfile.phone || '',
        });
      }
    } catch (error) {
      console.error('加载用户资料失败:', error);
      showToastMessage('加载用户资料失败', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      setIsSaving(true);

      // 更新用户元数据
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: editForm.full_name,
          bio: editForm.bio,
          phone: editForm.phone,
        },
      });

      if (error) throw error;

      // 重新加载用户资料
      await loadUserProfile();
      setIsEditing(false);
      showToastMessage('个人资料更新成功');
    } catch (error) {
      console.error('更新个人资料失败:', error);
      showToastMessage('更新个人资料失败', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (profile) {
      setEditForm({
        full_name: profile.full_name || '',
        bio: profile.bio || '',
        phone: profile.phone || '',
      });
    }
    setIsEditing(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">加载中...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <p className="text-gray-600">未找到用户资料</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Toast 通知 */}
      {showToast.show && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-md text-white ${
            showToast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          }`}
        >
          {showToast.message}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">个人资料</h1>
          <p className="text-gray-600 mt-2">管理您的个人信息和偏好设置</p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Edit2 className="h-4 w-4" />
            编辑资料
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 用户头像和基本信息 */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow-md border">
          <div className="p-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.full_name || profile.email}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="text-lg font-semibold text-gray-600">
                    {profile.full_name ? (
                      getInitials(profile.full_name)
                    ) : (
                      <UserIcon className="h-8 w-8" />
                    )}
                  </div>
                )}
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900">
              {profile.full_name || '未设置姓名'}
            </h3>
            <p className="flex items-center justify-center gap-2 text-gray-600 mt-2">
              <Mail className="h-4 w-4" />
              {profile.email}
            </p>
          </div>
          <div className="px-6 pb-6 space-y-4">
            <div className="flex items-center justify-center">
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                <Shield className="h-3 w-3" />
                管理员
              </span>
            </div>
            <hr className="border-gray-200" />
            <div className="text-center text-sm text-gray-600">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Calendar className="h-4 w-4" />
                注册时间
              </div>
              <p>{formatDate(profile.created_at)}</p>
            </div>
          </div>
        </div>

        {/* 详细信息 */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md border">
          <div className="p-6">
            <h3 className="text-xl font-semibold text-gray-900">详细信息</h3>
            <p className="text-gray-600 mt-1">您的个人详细信息</p>
          </div>
          <div className="px-6 pb-6 space-y-6">
            {isEditing ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label
                    htmlFor="full_name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    姓名
                  </label>
                  <input
                    id="full_name"
                    type="text"
                    value={editForm.full_name}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        full_name: e.target.value,
                      }))
                    }
                    placeholder="请输入您的姓名"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700"
                  >
                    电话号码
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    placeholder="请输入您的电话号码"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="bio"
                    className="block text-sm font-medium text-gray-700"
                  >
                    个人简介
                  </label>
                  <textarea
                    id="bio"
                    value={editForm.bio}
                    onChange={(e) =>
                      setEditForm((prev) => ({ ...prev, bio: e.target.value }))
                    }
                    placeholder="请输入您的个人简介"
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Save className="h-4 w-4" />
                    {isSaving ? '保存中...' : '保存'}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <X className="h-4 w-4" />
                    取消
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    姓名
                  </label>
                  <p className="mt-1 text-gray-900">
                    {profile.full_name || '未设置'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    邮箱地址
                  </label>
                  <p className="mt-1 text-gray-900">{profile.email}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    电话号码
                  </label>
                  <p className="mt-1 text-gray-900">
                    {profile.phone || '未设置'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    个人简介
                  </label>
                  <p className="mt-1 text-gray-900 whitespace-pre-wrap">
                    {profile.bio || '未设置'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    用户ID
                  </label>
                  <p className="mt-1 text-gray-600 font-mono text-sm">
                    {profile.id}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
