'use client';

import { useState, useEffect } from 'react';
import { Save, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface ServicesSettings {
  hero_title: string;
  hero_subtitle: string;
  hero_badge_text: string;
  feature_1_title: string;
  feature_2_title: string;
  feature_3_title: string;
  training_section_title: string;
  training_section_subtitle: string;
  training_badge_text: string;
  consulting_section_title: string;
  consulting_section_subtitle: string;
  solutions_section_title: string;
  solutions_section_subtitle: string;
  cta_title: string;
  cta_subtitle: string;
  cta_button_text: string;
}

const defaultSettings: ServicesSettings = {
  hero_title: '专业的项目管理服务',
  hero_subtitle: '基于关键链项目管理理论，为企业提供全方位的项目管理解决方案',
  hero_badge_text: '专业服务',
  feature_1_title: '系统化培训',
  feature_2_title: '定制化咨询',
  feature_3_title: '行业解决方案',
  training_section_title: '系统化培训课程',
  training_section_subtitle:
    '从基础理论到高级实践，构建完整的CCPM知识体系，满足不同层次的学习需求',
  training_badge_text: '专业培训',
  consulting_section_title: '咨询服务',
  consulting_section_subtitle:
    '专业的项目管理咨询服务，为企业提供定制化的CCPM实施方案',
  solutions_section_title: '行业解决方案',
  solutions_section_subtitle: '针对不同行业特点，提供专业的CCPM解决方案',
  cta_title: '准备提升您的项目管理水平？',
  cta_subtitle: '联系我们的专家团队，获取专业的项目管理解决方案',
  cta_button_text: '立即咨询',
};

export default function ServicesManagement() {
  const [settings, setSettings] = useState<ServicesSettings>(defaultSettings);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/website/services');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      } else {
        setSettings(defaultSettings);
      }
    } catch (error) {
      console.error('加载服务页面设置失败:', error);
      toast.error('加载服务页面设置失败');
      setSettings(defaultSettings);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/website/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        toast.success('服务页面设置保存成功');
      } else {
        throw new Error('保存失败');
      }
    } catch (error) {
      console.error('保存服务页面设置失败:', error);
      toast.error('保存服务页面设置失败');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof ServicesSettings, value: string) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">服务页面管理</h1>
          <p className="text-gray-600 mt-1">管理服务页面的内容和设置</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => window.open('/services', '_blank')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Eye className="w-4 h-4 mr-2" />
            预览页面
          </button>
          <button
            onClick={saveSettings}
            disabled={saving}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? '保存中...' : '保存设置'}
          </button>
        </div>
      </div>

      {/* 设置表单 */}
      <div className="space-y-6">
        {/* 页面头部设置 */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">页面头部设置</h2>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                页面标题
              </label>
              <input
                type="text"
                value={settings.hero_title}
                onChange={(e) =>
                  handleInputChange('hero_title', e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                页面副标题
              </label>
              <textarea
                value={settings.hero_subtitle}
                onChange={(e) =>
                  handleInputChange('hero_subtitle', e.target.value)
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* 服务特色设置 */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">服务特色设置</h2>
          </div>

          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hero徽章文本
                </label>
                <input
                  type="text"
                  value={settings.hero_badge_text}
                  onChange={(e) =>
                    handleInputChange('hero_badge_text', e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  特色1标题
                </label>
                <input
                  type="text"
                  value={settings.feature_1_title}
                  onChange={(e) =>
                    handleInputChange('feature_1_title', e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  特色2标题
                </label>
                <input
                  type="text"
                  value={settings.feature_2_title}
                  onChange={(e) =>
                    handleInputChange('feature_2_title', e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  特色3标题
                </label>
                <input
                  type="text"
                  value={settings.feature_3_title}
                  onChange={(e) =>
                    handleInputChange('feature_3_title', e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 培训课程设置 */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">培训课程设置</h2>
          </div>

          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  培训区域标题
                </label>
                <input
                  type="text"
                  value={settings.training_section_title}
                  onChange={(e) =>
                    handleInputChange('training_section_title', e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  培训区域副标题
                </label>
                <input
                  type="text"
                  value={settings.training_section_subtitle}
                  onChange={(e) =>
                    handleInputChange(
                      'training_section_subtitle',
                      e.target.value
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  培训徽章文本
                </label>
                <input
                  type="text"
                  value={settings.training_badge_text}
                  onChange={(e) =>
                    handleInputChange('training_badge_text', e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 咨询服务设置 */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">咨询服务设置</h2>
          </div>

          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  咨询区域标题
                </label>
                <input
                  type="text"
                  value={settings.consulting_section_title}
                  onChange={(e) =>
                    handleInputChange(
                      'consulting_section_title',
                      e.target.value
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  咨询区域副标题
                </label>
                <input
                  type="text"
                  value={settings.consulting_section_subtitle}
                  onChange={(e) =>
                    handleInputChange(
                      'consulting_section_subtitle',
                      e.target.value
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 行业解决方案设置 */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              行业解决方案设置
            </h2>
          </div>

          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  解决方案区域标题
                </label>
                <input
                  type="text"
                  value={settings.solutions_section_title}
                  onChange={(e) =>
                    handleInputChange('solutions_section_title', e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  解决方案区域副标题
                </label>
                <input
                  type="text"
                  value={settings.solutions_section_subtitle}
                  onChange={(e) =>
                    handleInputChange(
                      'solutions_section_subtitle',
                      e.target.value
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* CTA设置 */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                行动号召设置
              </h2>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CTA描述
                  </label>
                  <input
                    type="text"
                    value={settings.cta_subtitle}
                    onChange={(e) =>
                      handleInputChange('cta_subtitle', e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CTA按钮文本
                </label>
                <input
                  type="text"
                  value={settings.cta_button_text}
                  onChange={(e) =>
                    handleInputChange('cta_button_text', e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
