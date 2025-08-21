'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Lock, Mail, AlertCircle, User, Key } from 'lucide-react';
import { useAuth } from '@/contexts/AuthProvider';
import {
  checkAdminExists,
  createAdminUser,
  createFirstAdminUser,
  validateInvitationCode,
} from '@/lib/initAdmin';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [invitationCode, setInvitationCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [validatingInvitation, setValidatingInvitation] = useState(false);
  const [isFirstAdmin, setIsFirstAdmin] = useState(false);
  const hasCheckedAdmin = useRef(false);
  const adminCheckResult = useRef<{ exists: boolean; checked: boolean }>({
    exists: false,
    checked: false,
  });
  const { user, login, isLoading, checkAuth } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // 只在初始加载时检查，避免重复调用
    if (!hasCheckedAdmin.current) {
      hasCheckedAdmin.current = true;
      checkAuth();
      checkForExistingAdmin();
    }
  }, []);

  useEffect(() => {
    // 如果已经登录，重定向到仪表板
    if (user) {
      router.replace('/admin/dashboard');
    }
  }, [user, router]);

  const checkForExistingAdmin = async () => {
    // 如果已经检查过，直接使用缓存结果
    if (adminCheckResult.current.checked) {
      console.log('使用缓存的管理员检查结果:', adminCheckResult.current.exists);
      if (!adminCheckResult.current.exists) {
        setIsFirstAdmin(true);
        setIsRegisterMode(true);
      }
      setCheckingAdmin(false);
      return;
    }

    try {
      console.log('开始检查现有管理员...');
      const result = await checkAdminExists();
      console.log('管理员检查结果:', result);

      // 缓存检查结果
      adminCheckResult.current = {
        exists: result.exists,
        checked: true,
      };

      if (!result.exists) {
        console.log('未发现管理员，切换到首个管理员创建模式');
        setIsFirstAdmin(true);
        setIsRegisterMode(true);
      } else {
        console.log('发现现有管理员，保持登录模式');
      }
    } catch (error) {
      console.error('检查管理员用户失败:', error);
      // 即使出错也标记为已检查，避免重复调用
      adminCheckResult.current.checked = true;
    } finally {
      setCheckingAdmin(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !password) {
      setError('请填写邮箱和密码');
      return;
    }

    if (isRegisterMode && !fullName) {
      setError('请填写姓名');
      return;
    }

    if (isRegisterMode) {
      // 注册模式
      if (isFirstAdmin) {
        // 首个管理员注册，不需要邀请码
        const result = await createFirstAdminUser(email, password, fullName);
        if (result.success) {
          if (result.requiresEmailVerification) {
            setSuccess(
              '首个管理员账户创建成功！请检查您的邮箱并点击验证链接，然后返回登录。'
            );
          } else {
            setSuccess('首个管理员账户创建成功！请使用新账户登录。');
            // 如果不需要邮箱验证，自动尝试登录
            setTimeout(async () => {
              const loginResult = await login(email, password);
              if (loginResult.success) {
                // 登录成功，页面会自动跳转
              } else {
                setError('账户创建成功，但自动登录失败，请手动登录');
              }
            }, 1000);
          }
          setIsRegisterMode(false);
          setIsFirstAdmin(false);
          setFullName('');
        } else {
          setError(result.error || '创建账户失败');
        }
      } else {
        // 普通管理员注册，需要邀请码
        if (!invitationCode.trim()) {
          setError('请输入邀请码');
          return;
        }

        setValidatingInvitation(true);
        try {
          const invitationResult = await validateInvitationCode(
            invitationCode,
            email
          );
          if (!invitationResult.valid) {
            setError(invitationResult.error || '邀请码无效');
            return;
          }

          const result = await createAdminUser(
            email,
            password,
            fullName,
            invitationCode
          );
          if (result.success) {
            if (result.requiresEmailVerification) {
              setSuccess(
                '管理员账户创建成功！请检查您的邮箱并点击验证链接，然后返回登录。'
              );
            } else {
              setSuccess('管理员账户创建成功！请使用新账户登录。');
            }
            setIsRegisterMode(false);
            setFullName('');
            setInvitationCode('');
          } else {
            setError(result.error || '创建账户失败');
          }
        } catch (error) {
          setError('验证邀请码时发生错误');
        } finally {
          setValidatingInvitation(false);
        }
      }
    } else {
      // 登录模式
      const result = await login(email, password);
      if (!result.success) {
        setError(result.error || '登录失败');
      }
    }
  };

  // 显示加载状态
  if (checkingAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">正在检查系统状态...</p>
        </div>
      </div>
    );
  }

  // 如果已经登录，显示加载状态
  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">正在跳转...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo和标题 */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center mb-6">
            <span className="text-white font-bold text-2xl">C</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            CCPM360 管理后台
          </h2>
          <p className="text-gray-600">
            {isRegisterMode
              ? isFirstAdmin
                ? '创建第一个管理员账户'
                : '创建管理员账户'
              : '请使用管理员账户登录'}
          </p>
        </div>

        {/* 登录表单 */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* 错误提示 */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <span className="text-red-700 text-sm">{error}</span>
              </div>
            )}

            {/* 成功提示 */}
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
                <AlertCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-green-700 text-sm">{success}</span>
              </div>
            )}

            {/* 邀请码输入（仅非首个管理员注册模式） */}
            {isRegisterMode && !isFirstAdmin && (
              <div>
                <label
                  htmlFor="invitationCode"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  邀请码
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Key className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="invitationCode"
                    name="invitationCode"
                    type="text"
                    required
                    value={invitationCode}
                    onChange={(e) => setInvitationCode(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                    placeholder="请输入邀请码"
                  />
                </div>
              </div>
            )}

            {/* 姓名输入（仅注册模式） */}
            {isRegisterMode && (
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  姓名
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    autoComplete="name"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                    placeholder="请输入姓名"
                  />
                </div>
              </div>
            )}

            {/* 邮箱输入 */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                邮箱地址
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                  placeholder="请输入邮箱地址"
                />
              </div>
            </div>

            {/* 密码输入 */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                密码
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                  placeholder="请输入密码"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* 提交按钮 */}
            <button
              type="submit"
              disabled={isLoading || validatingInvitation}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isLoading || validatingInvitation ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>
                    {validatingInvitation
                      ? '验证邀请码...'
                      : isRegisterMode
                        ? '创建中...'
                        : '登录中...'}
                  </span>
                </div>
              ) : isRegisterMode ? (
                '创建管理员账户'
              ) : (
                '登录'
              )}
            </button>

            {/* 忘记密码和模式切换按钮 */}
            {!isFirstAdmin && (
              <div className="space-y-3">
                {/* 忘记密码链接（仅登录模式显示） */}
                {!isRegisterMode && (
                  <div className="text-center">
                    <Link
                      href="/admin/forgot-password"
                      className="text-sm text-gray-600 hover:text-blue-600 transition-colors duration-200"
                    >
                      忘记密码？
                    </Link>
                  </div>
                )}

                {/* 模式切换按钮 */}
                <div className="text-center">
                  {!isRegisterMode ? (
                    <button
                      type="button"
                      onClick={() => setIsRegisterMode(true)}
                      className="text-sm text-blue-600 hover:text-blue-500 transition-colors duration-200"
                    >
                      需要创建管理员账户？
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsRegisterMode(false)}
                      className="text-sm text-blue-600 hover:text-blue-500 transition-colors duration-200"
                    >
                      已有账户？立即登录
                    </button>
                  )}
                </div>
              </div>
            )}
          </form>

          {/* 返回首页链接 */}
          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-sm text-blue-600 hover:text-blue-500 transition-colors duration-200"
            >
              ← 返回网站首页
            </Link>
          </div>
        </div>

        {/* 底部信息 */}
        <div className="text-center text-sm text-gray-500">
          <p>© 2024 CCPM360. 保留所有权利。</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
