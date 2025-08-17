'use client';

import { useState, useEffect } from 'react';
import { Save, Upload, Eye, Settings } from 'lucide-react';
import { toast } from 'sonner';

// 案例页面设置接口
interface CasesPageSettings {
  // 页面头部
  page_title: string;
  page_subtitle: string;

  // 统计数据部分
  stats_title: string;
  stats_subtitle: string;

  // 统计数据项
  stat1_number: string;
  stat1_label: string;
  stat1_icon: string;

  stat2_number: string;
  stat2_label: string;
  stat2_icon: string;

  stat3_number: string;
  stat3_label: string;
  stat3_icon: string;

  stat4_number: string;
  stat4_label: string;
  stat4_icon: string;

  // CTA部分
  cta_title: string;
  cta_subtitle: string;
  cta_button_text: string;
  cta_button_link: string;
  cta_secondary_text: string;
  cta_secondary_link: string;
}

// 默认设置
const defaultSettings: CasesPageSettings = {
  page_title: '成功案例',
  page_subtitle: '真实案例见证CCPM360的专业实力，为各行业客户创造价值',
  stats_title: '服务成果统计',
  stats_subtitle: '数据说话，用实际成果证明CCPM360的专业价值',
  stat1_number: '500+',
  stat1_label: '服务企业',
  stat1_icon: 'Building',
  stat2_number: '5000+',
  stat2_label: '培训学员',
  stat2_icon: 'Users',
  stat3_number: '95%',
  stat3_label: '客户满意度',
  stat3_icon: 'Award',
  stat4_number: '30%',
  stat4_label: '平均效率提升',
  stat4_icon: 'TrendingUp',
  cta_title: '让您的项目也成为成功案例',
  cta_subtitle: '联系我们，获取专业的关键链项目管理解决方案',
  cta_button_text: '开始咨询',
  cta_button_link: '/contact',
  cta_secondary_text: '查看服务',
  cta_secondary_link: '/services',
};

export default function CasesSettingsPage() {
  const [settings, setSettings] = useState<CasesPageSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 加载设置
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/website/cases');
        if (!response.ok) {
          throw new Error('Failed to fetch settings');
        }
        const data = await response.json();
        setSettings(data);
      } catch (error) {
        console.error('Failed to load settings:', error);
        // 如果API调用失败，使用默认设置
        setSettings(defaultSettings);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // 处理保存
  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await fetch('/api/admin/website/cases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      toast.success('设置保存成功！');
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  // 处理输入变化
  const handleInputChange = (field: keyof CasesPageSettings, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 页面头部 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <Settings className="h-8 w-8 text-orange-500" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  案例页面设置
                </h1>
                <p className="text-sm text-gray-500">
                  管理案例页面的内容和布局
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => window.open('/cases', '_blank')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                <Eye className="h-4 w-4 mr-2" />
                预览页面
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {saving ? '保存中...' : '保存设置'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 主要内容 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* 页面头部设置 */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              页面头部设置
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  页面标题
                </label>
                <input
                  type="text"
                  value={settings.page_title}
                  onChange={(e) =>
                    handleInputChange('page_title', e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  placeholder="请输入页面标题"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  页面副标题
                </label>
                <textarea
                  value={settings.page_subtitle}
                  onChange={(e) =>
                    handleInputChange('page_subtitle', e.target.value)
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  placeholder="请输入页面副标题"
                />
              </div>
            </div>
          </div>

          {/* 统计数据设置 */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              统计数据设置
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  统计标题
                </label>
                <input
                  type="text"
                  value={settings.stats_title}
                  onChange={(e) =>
                    handleInputChange('stats_title', e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  placeholder="请输入统计标题"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  统计副标题
                </label>
                <textarea
                  value={settings.stats_subtitle}
                  onChange={(e) =>
                    handleInputChange('stats_subtitle', e.target.value)
                  }
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  placeholder="请输入统计副标题"
                />
              </div>
            </div>

            {/* 统计项设置 */}
            <div className="mt-6">
              <h3 className="text-md font-medium text-gray-900 mb-4">
                统计项设置
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 统计项1 */}
                <div className="border rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    统计项1
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        数字
                      </label>
                      <input
                        type="text"
                        value={settings.stat1_number}
                        onChange={(e) =>
                          handleInputChange('stat1_number', e.target.value)
                        }
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        标签
                      </label>
                      <input
                        type="text"
                        value={settings.stat1_label}
                        onChange={(e) =>
                          handleInputChange('stat1_label', e.target.value)
                        }
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        图标
                      </label>
                      <input
                        type="text"
                        value={settings.stat1_icon}
                        onChange={(e) =>
                          handleInputChange('stat1_icon', e.target.value)
                        }
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                        placeholder="Lucide图标名称"
                      />
                    </div>
                  </div>
                </div>

                {/* 统计项2 */}
                <div className="border rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    统计项2
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        数字
                      </label>
                      <input
                        type="text"
                        value={settings.stat2_number}
                        onChange={(e) =>
                          handleInputChange('stat2_number', e.target.value)
                        }
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        标签
                      </label>
                      <input
                        type="text"
                        value={settings.stat2_label}
                        onChange={(e) =>
                          handleInputChange('stat2_label', e.target.value)
                        }
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        图标
                      </label>
                      <input
                        type="text"
                        value={settings.stat2_icon}
                        onChange={(e) =>
                          handleInputChange('stat2_icon', e.target.value)
                        }
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                        placeholder="Lucide图标名称"
                      />
                    </div>
                  </div>
                </div>

                {/* 统计项3 */}
                <div className="border rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    统计项3
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        数字
                      </label>
                      <input
                        type="text"
                        value={settings.stat3_number}
                        onChange={(e) =>
                          handleInputChange('stat3_number', e.target.value)
                        }
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        标签
                      </label>
                      <input
                        type="text"
                        value={settings.stat3_label}
                        onChange={(e) =>
                          handleInputChange('stat3_label', e.target.value)
                        }
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        图标
                      </label>
                      <input
                        type="text"
                        value={settings.stat3_icon}
                        onChange={(e) =>
                          handleInputChange('stat3_icon', e.target.value)
                        }
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                        placeholder="Lucide图标名称"
                      />
                    </div>
                  </div>
                </div>

                {/* 统计项4 */}
                <div className="border rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    统计项4
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        数字
                      </label>
                      <input
                        type="text"
                        value={settings.stat4_number}
                        onChange={(e) =>
                          handleInputChange('stat4_number', e.target.value)
                        }
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        标签
                      </label>
                      <input
                        type="text"
                        value={settings.stat4_label}
                        onChange={(e) =>
                          handleInputChange('stat4_label', e.target.value)
                        }
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        图标
                      </label>
                      <input
                        type="text"
                        value={settings.stat4_icon}
                        onChange={(e) =>
                          handleInputChange('stat4_icon', e.target.value)
                        }
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                        placeholder="Lucide图标名称"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA设置 */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              行动号召设置
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CTA标题
                </label>
                <input
                  type="text"
                  value={settings.cta_title}
                  onChange={(e) =>
                    handleInputChange('cta_title', e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  placeholder="请输入CTA标题"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CTA描述
                </label>
                <textarea
                  value={settings.cta_subtitle}
                  onChange={(e) =>
                    handleInputChange('cta_subtitle', e.target.value)
                  }
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  placeholder="请输入CTA描述"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    主按钮文本
                  </label>
                  <input
                    type="text"
                    value={settings.cta_button_text}
                    onChange={(e) =>
                      handleInputChange('cta_button_text', e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    placeholder="请输入主按钮文本"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    主按钮链接
                  </label>
                  <input
                    type="text"
                    value={settings.cta_button_link}
                    onChange={(e) =>
                      handleInputChange('cta_button_link', e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    placeholder="请输入主按钮链接"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    次要按钮文本
                  </label>
                  <input
                    type="text"
                    value={settings.cta_secondary_text}
                    onChange={(e) =>
                      handleInputChange('cta_secondary_text', e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    placeholder="请输入次要按钮文本"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    次要按钮链接
                  </label>
                  <input
                    type="text"
                    value={settings.cta_secondary_link}
                    onChange={(e) =>
                      handleInputChange('cta_secondary_link', e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    placeholder="请输入次要按钮链接"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
