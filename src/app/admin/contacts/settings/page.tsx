'use client';

import { useState } from 'react';
import {
  Save,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Clock,
  MessageSquare,
  Bell,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface ContactSettings {
  // 联系信息
  companyName: string;
  email: string;
  phone: string;
  address: string;
  workingHours: string;
  wechat: string;
  qq: string;

  // 邮件设置
  emailNotifications: boolean;
  autoReply: boolean;
  autoReplyMessage: string;

  // 表单设置
  requirePhone: boolean;
  requireCompany: boolean;
  enableCaptcha: boolean;

  // 通知设置
  notifyNewContact: boolean;
  notifyEmail: string;

  // 其他设置
  contactFormTitle: string;
  contactFormDescription: string;
  successMessage: string;
}

const initialSettings: ContactSettings = {
  companyName: 'CCPM360项目管理咨询',
  email: 'contact@ccpm360.com',
  phone: '+86 400-123-4567',
  address: '北京市朝阳区xxx大厦xxx室',
  workingHours: '周一至周五 9:00-18:00',
  wechat: 'ccpm360',
  qq: '123456789',

  emailNotifications: true,
  autoReply: true,
  autoReplyMessage: '感谢您的咨询，我们会在24小时内回复您。',

  requirePhone: false,
  requireCompany: false,
  enableCaptcha: true,

  notifyNewContact: true,
  notifyEmail: 'admin@ccpm360.com',

  contactFormTitle: '联系我们',
  contactFormDescription: '有任何问题或需求，请随时与我们联系。',
  successMessage: '感谢您的留言，我们会尽快与您联系！',
};

export default function ContactSettings() {
  const [settings, setSettings] = useState<ContactSettings>(initialSettings);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('contact');

  const handleInputChange = (
    field: keyof ContactSettings,
    value: string | boolean
  ) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      // TODO: 保存设置到API
      console.log('保存联系设置:', settings);
      toast.success('设置保存成功');
    } catch (error) {
      console.error('保存设置失败:', error);
      toast.error('保存设置失败');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'contact', label: '联系信息', icon: Phone },
    { id: 'email', label: '邮件设置', icon: Mail },
    { id: 'form', label: '表单设置', icon: MessageSquare },
    { id: 'notifications', label: '通知设置', icon: Bell },
  ];

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/admin/contacts"
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">联系设置</h1>
            <p className="text-gray-600 mt-1">配置联系信息和表单设置</p>
          </div>
        </div>

        <button
          onClick={saveSettings}
          disabled={saving}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? '保存中...' : '保存设置'}
        </button>
      </div>

      <div className="bg-white shadow rounded-lg">
        {/* 标签页导航 */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* 联系信息 */}
          {activeTab === 'contact' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  基本联系信息
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      公司名称
                    </label>
                    <input
                      type="text"
                      value={settings.companyName}
                      onChange={(e) =>
                        handleInputChange('companyName', e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Mail className="w-4 h-4 mr-2" />
                      邮箱地址
                    </label>
                    <input
                      type="email"
                      value={settings.email}
                      onChange={(e) =>
                        handleInputChange('email', e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Phone className="w-4 h-4 mr-2" />
                      联系电话
                    </label>
                    <input
                      type="tel"
                      value={settings.phone}
                      onChange={(e) =>
                        handleInputChange('phone', e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      工作时间
                    </label>
                    <input
                      type="text"
                      value={settings.workingHours}
                      onChange={(e) =>
                        handleInputChange('workingHours', e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      公司地址
                    </label>
                    <textarea
                      value={settings.address}
                      onChange={(e) =>
                        handleInputChange('address', e.target.value)
                      }
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  社交媒体
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      微信号
                    </label>
                    <input
                      type="text"
                      value={settings.wechat}
                      onChange={(e) =>
                        handleInputChange('wechat', e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      QQ号
                    </label>
                    <input
                      type="text"
                      value={settings.qq}
                      onChange={(e) => handleInputChange('qq', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 邮件设置 */}
          {activeTab === 'email' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  邮件通知设置
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="emailNotifications"
                      checked={settings.emailNotifications}
                      onChange={(e) =>
                        handleInputChange(
                          'emailNotifications',
                          e.target.checked
                        )
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="emailNotifications"
                      className="ml-2 block text-sm text-gray-900"
                    >
                      启用邮件通知
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="autoReply"
                      checked={settings.autoReply}
                      onChange={(e) =>
                        handleInputChange('autoReply', e.target.checked)
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="autoReply"
                      className="ml-2 block text-sm text-gray-900"
                    >
                      启用自动回复
                    </label>
                  </div>
                </div>
              </div>

              {settings.autoReply && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    自动回复内容
                  </label>
                  <textarea
                    value={settings.autoReplyMessage}
                    onChange={(e) =>
                      handleInputChange('autoReplyMessage', e.target.value)
                    }
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="输入自动回复的邮件内容"
                  />
                </div>
              )}
            </div>
          )}

          {/* 表单设置 */}
          {activeTab === 'form' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  表单字段设置
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="requirePhone"
                      checked={settings.requirePhone}
                      onChange={(e) =>
                        handleInputChange('requirePhone', e.target.checked)
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="requirePhone"
                      className="ml-2 block text-sm text-gray-900"
                    >
                      电话号码为必填项
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="requireCompany"
                      checked={settings.requireCompany}
                      onChange={(e) =>
                        handleInputChange('requireCompany', e.target.checked)
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="requireCompany"
                      className="ml-2 block text-sm text-gray-900"
                    >
                      公司名称为必填项
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="enableCaptcha"
                      checked={settings.enableCaptcha}
                      onChange={(e) =>
                        handleInputChange('enableCaptcha', e.target.checked)
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="enableCaptcha"
                      className="ml-2 block text-sm text-gray-900"
                    >
                      启用验证码
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  表单文案设置
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      表单标题
                    </label>
                    <input
                      type="text"
                      value={settings.contactFormTitle}
                      onChange={(e) =>
                        handleInputChange('contactFormTitle', e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      表单描述
                    </label>
                    <textarea
                      value={settings.contactFormDescription}
                      onChange={(e) =>
                        handleInputChange(
                          'contactFormDescription',
                          e.target.value
                        )
                      }
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      提交成功提示
                    </label>
                    <input
                      type="text"
                      value={settings.successMessage}
                      onChange={(e) =>
                        handleInputChange('successMessage', e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 通知设置 */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  新联系通知
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="notifyNewContact"
                      checked={settings.notifyNewContact}
                      onChange={(e) =>
                        handleInputChange('notifyNewContact', e.target.checked)
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="notifyNewContact"
                      className="ml-2 block text-sm text-gray-900"
                    >
                      有新联系时发送邮件通知
                    </label>
                  </div>

                  {settings.notifyNewContact && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        通知邮箱
                      </label>
                      <input
                        type="email"
                        value={settings.notifyEmail}
                        onChange={(e) =>
                          handleInputChange('notifyEmail', e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="输入接收通知的邮箱地址"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  通知规则
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <ul className="text-sm text-gray-600 space-y-2">
                    <li>• 新联系提交后立即发送通知邮件</li>
                    <li>• 高优先级联系会发送紧急通知</li>
                    <li>• 可以设置工作时间内的通知频率</li>
                    <li>• 支持多个邮箱地址接收通知（用逗号分隔）</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
