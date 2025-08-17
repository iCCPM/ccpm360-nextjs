'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Settings as SettingsIcon,
  Shield,
  Bell,
  Lock,
  Eye,
  EyeOff,
  Key,
  AlertTriangle,
  Save,
  Trash2,
} from 'lucide-react';

interface SecuritySettings {
  two_factor_enabled: boolean;
  login_notifications: boolean;
  security_alerts: boolean;
}

interface NotificationSettings {
  email_notifications: boolean;
  push_notifications: boolean;
  marketing_emails: boolean;
  system_updates: boolean;
}

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showToast, setShowToast] = useState({
    show: false,
    message: '',
    type: 'success' as 'success' | 'error',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    two_factor_enabled: false,
    login_notifications: true,
    security_alerts: true,
  });

  const [notificationSettings, setNotificationSettings] =
    useState<NotificationSettings>({
      email_notifications: true,
      push_notifications: false,
      marketing_emails: false,
      system_updates: true,
    });

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

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setIsLoading(true);

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) throw error;

      if (user) {
        setUser(user);

        // 从用户元数据加载设置（如果存在）
        const metadata = user.user_metadata || {};

        if (metadata.security_settings) {
          setSecuritySettings(metadata.security_settings);
        }

        if (metadata.notification_settings) {
          setNotificationSettings(metadata.notification_settings);
        }
      }
    } catch (error) {
      console.error('加载用户数据失败:', error);
      showToastMessage('加载用户数据失败', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordForm.newPassword || !passwordForm.confirmPassword) {
      showToastMessage('请填写所有密码字段', 'error');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToastMessage('新密码和确认密码不匹配', 'error');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      showToastMessage('新密码长度至少为6位', 'error');
      return;
    }

    try {
      setIsSaving(true);

      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword,
      });

      if (error) throw error;

      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      showToastMessage('密码更新成功');
    } catch (error) {
      console.error('密码更新失败:', error);
      showToastMessage('密码更新失败', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSecuritySettingsChange = async (
    key: keyof SecuritySettings,
    value: boolean
  ) => {
    try {
      const newSettings = { ...securitySettings, [key]: value };
      setSecuritySettings(newSettings);

      const { error } = await supabase.auth.updateUser({
        data: {
          security_settings: newSettings,
        },
      });

      if (error) throw error;

      showToastMessage('安全设置已更新');
    } catch (error) {
      console.error('更新安全设置失败:', error);
      showToastMessage('更新安全设置失败', 'error');
    }
  };

  const handleNotificationSettingsChange = async (
    key: keyof NotificationSettings,
    value: boolean
  ) => {
    try {
      const newSettings = { ...notificationSettings, [key]: value };
      setNotificationSettings(newSettings);

      const { error } = await supabase.auth.updateUser({
        data: {
          notification_settings: newSettings,
        },
      });

      if (error) throw error;

      showToastMessage('通知设置已更新');
    } catch (error) {
      console.error('更新通知设置失败:', error);
      showToastMessage('更新通知设置失败', 'error');
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('确定要删除账户吗？此操作不可撤销！')) {
      return;
    }

    if (!confirm('请再次确认：您真的要永久删除您的账户吗？')) {
      return;
    }

    try {
      // 注意：Supabase Auth 不直接支持删除用户账户
      // 这里只是一个示例，实际实现需要后端API支持
      showToastMessage('账户删除功能需要联系管理员', 'error');
    } catch (error) {
      console.error('删除账户失败:', error);
      showToastMessage('删除账户失败', 'error');
    }
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

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <SettingsIcon className="h-8 w-8" />
          账户设置
        </h1>
        <p className="text-gray-600 mt-2">管理您的账户安全、通知和偏好设置</p>
      </div>

      {/* Toast 通知 */}
      {showToast.show && (
        <div
          className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
            showToast.type === 'success'
              ? 'bg-green-500 text-white'
              : 'bg-red-500 text-white'
          }`}
        >
          {showToast.message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 密码设置 */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Lock className="h-5 w-5" />
              密码设置
            </h3>
            <p className="text-sm text-gray-600 mt-1">更改您的登录密码</p>
          </div>
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="currentPassword"
                className="block text-sm font-medium text-gray-700"
              >
                当前密码
              </label>
              <div className="relative">
                <input
                  id="currentPassword"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      currentPassword: e.target.value,
                    }))
                  }
                  placeholder="请输入当前密码"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="button"
                  className="absolute right-0 top-0 h-full px-3 py-2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-gray-700"
              >
                新密码
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      newPassword: e.target.value,
                    }))
                  }
                  placeholder="请输入新密码（至少6位）"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="button"
                  className="absolute right-0 top-0 h-full px-3 py-2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                确认新密码
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                  placeholder="请再次输入新密码"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="button"
                  className="absolute right-0 top-0 h-full px-3 py-2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              onClick={handlePasswordChange}
              disabled={isSaving}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4" />
              {isSaving ? '更新中...' : '更新密码'}
            </button>
          </div>
        </div>

        {/* 安全设置 */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Shield className="h-5 w-5" />
              安全设置
            </h3>
            <p className="text-sm text-gray-600 mt-1">管理您的账户安全选项</p>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-base font-medium text-gray-700">
                  双因素认证
                </label>
                <p className="text-sm text-gray-600">
                  为您的账户添加额外的安全层
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={securitySettings.two_factor_enabled}
                  onChange={(e) =>
                    handleSecuritySettingsChange(
                      'two_factor_enabled',
                      e.target.checked
                    )
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <hr className="border-gray-200" />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-base font-medium text-gray-700">
                  登录通知
                </label>
                <p className="text-sm text-gray-600">新设备登录时发送通知</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={securitySettings.login_notifications}
                  onChange={(e) =>
                    handleSecuritySettingsChange(
                      'login_notifications',
                      e.target.checked
                    )
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <hr className="border-gray-200" />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-base font-medium text-gray-700">
                  安全警报
                </label>
                <p className="text-sm text-gray-600">
                  检测到可疑活动时发送警报
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={securitySettings.security_alerts}
                  onChange={(e) =>
                    handleSecuritySettingsChange(
                      'security_alerts',
                      e.target.checked
                    )
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {securitySettings.two_factor_enabled && (
              <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <Key className="h-4 w-4 text-blue-600 mt-0.5" />
                <p className="text-sm text-blue-800">
                  双因素认证已启用。您可以在安全密钥管理中查看和管理您的认证设备。
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 通知设置 */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Bell className="h-5 w-5" />
              通知设置
            </h3>
            <p className="text-sm text-gray-600 mt-1">控制您接收的通知类型</p>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-base font-medium text-gray-700">
                  邮件通知
                </label>
                <p className="text-sm text-gray-600">接收重要更新的邮件通知</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationSettings.email_notifications}
                  onChange={(e) =>
                    handleNotificationSettingsChange(
                      'email_notifications',
                      e.target.checked
                    )
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <hr className="border-gray-200" />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-base font-medium text-gray-700">
                  推送通知
                </label>
                <p className="text-sm text-gray-600">接收浏览器推送通知</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationSettings.push_notifications}
                  onChange={(e) =>
                    handleNotificationSettingsChange(
                      'push_notifications',
                      e.target.checked
                    )
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <hr className="border-gray-200" />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-base font-medium text-gray-700">
                  营销邮件
                </label>
                <p className="text-sm text-gray-600">接收产品更新和营销信息</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationSettings.marketing_emails}
                  onChange={(e) =>
                    handleNotificationSettingsChange(
                      'marketing_emails',
                      e.target.checked
                    )
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <hr className="border-gray-200" />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <label className="text-base font-medium text-gray-700">
                  系统更新
                </label>
                <p className="text-sm text-gray-600">接收系统维护和更新通知</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificationSettings.system_updates}
                  onChange={(e) =>
                    handleNotificationSettingsChange(
                      'system_updates',
                      e.target.checked
                    )
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* 账户信息 */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">账户信息</h3>
            <p className="text-sm text-gray-600 mt-1">您的账户基本信息</p>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">
                邮箱地址
              </label>
              <p className="mt-1 text-gray-900">{user?.email}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                账户类型
              </label>
              <div className="mt-1">
                <span className="inline-flex items-center gap-2 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                  <Shield className="h-3 w-3" />
                  管理员
                </span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                注册时间
              </label>
              <p className="mt-1 text-gray-900">
                {user?.created_at
                  ? new Date(user.created_at).toLocaleDateString('zh-CN', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : '未知'}
              </p>
            </div>

            <hr className="border-gray-200" />

            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
              <p className="text-sm text-red-800">
                <strong>危险操作：</strong>
                删除账户将永久删除您的所有数据，此操作不可撤销。
              </p>
            </div>

            <button
              onClick={handleDeleteAccount}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              <Trash2 className="h-4 w-4" />
              删除账户
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
