'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Save, Eye, Target, Settings, Award } from 'lucide-react';

interface AboutSettings {
  hero_title: string;
  hero_subtitle: string;
  mission_title: string;
  mission_description: string;
  values_title: string;
  values_subtitle: string;
  value_1_title: string;
  value_1_description: string;
  value_2_title: string;
  value_2_description: string;
  value_3_title: string;
  value_3_description: string;
  cta_title: string;
  cta_subtitle: string;
  cta_button_text: string;
}

const defaultSettings: AboutSettings = {
  hero_title: '关于 CCPM360',
  hero_subtitle:
    '我们是专业的关键链项目管理(CCPM)咨询服务提供商，致力于帮助企业提升项目管理效率，实现项目按时交付和资源优化配置。',
  mission_title: '我们的使命',
  mission_description:
    '通过先进的关键链项目管理理论和实践，帮助企业解决项目延期、资源冲突、成本超支等常见问题，提升项目成功率和企业竞争力。',
  values_title: '核心价值观',
  values_subtitle: '我们坚持以客户为中心，以结果为导向，为企业创造真正的价值',
  value_1_title: '客户至上',
  value_1_description: '始终以客户需求为出发点，提供最适合的解决方案',
  value_2_title: '追求卓越',
  value_2_description: '不断提升服务质量，追求项目管理的卓越表现',
  value_3_title: '持续改进',
  value_3_description: '持续学习和改进，与时俱进的管理理念',
  cta_title: '准备开始您的项目管理转型之旅？',
  cta_subtitle: '联系我们的专家团队，获取专业的CCPM咨询服务',
  cta_button_text: '立即咨询',
};

export default function AboutManagement() {
  const [settings, setSettings] = useState<AboutSettings>(defaultSettings);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/website/about');
      if (!response.ok) {
        throw new Error('加载失败');
      }
      const data = await response.json();
      setSettings(data);
    } catch (error) {
      console.error('加载关于我们设置失败:', error);
      toast.error('加载关于我们设置失败');
      // 如果加载失败，使用默认设置
      setSettings(defaultSettings);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/website/about', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '保存失败');
      }

      const result = await response.json();
      toast.success(result.message || '关于我们设置保存成功');
    } catch (error) {
      console.error('保存关于我们设置失败:', error);
      toast.error(
        error instanceof Error ? error.message : '保存关于我们设置失败'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof AboutSettings, value: string) => {
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
          <h1 className="text-2xl font-bold text-gray-900">关于我们管理</h1>
          <p className="text-gray-600 mt-1">管理关于我们页面的内容和设置</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => window.open('/about', '_blank')}
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
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            关于我们内容设置
          </h2>
        </div>

        <div className="p-6 space-y-8">
          {/* Hero 区域 */}
          <div className="space-y-4">
            <h3 className="text-md font-medium text-gray-900 flex items-center">
              <Settings className="w-4 h-4 mr-2" />
              页面头部
            </h3>

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

          {/* 使命愿景价值观 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 使命 */}
            <div className="space-y-4">
              <h3 className="text-md font-medium text-gray-900 flex items-center">
                <Target className="w-4 h-4 mr-2" />
                使命
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  标题
                </label>
                <input
                  type="text"
                  value={settings.mission_title}
                  onChange={(e) =>
                    handleInputChange('mission_title', e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  描述
                </label>
                <textarea
                  value={settings.mission_description}
                  onChange={(e) =>
                    handleInputChange('mission_description', e.target.value)
                  }
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* 核心价值观头部 */}
            <div className="space-y-4">
              <h3 className="text-md font-medium text-gray-900 flex items-center">
                <Award className="w-4 h-4 mr-2" />
                价值观头部
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  价值观标题
                </label>
                <input
                  type="text"
                  value={settings.values_title}
                  onChange={(e) =>
                    handleInputChange('values_title', e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  价值观副标题
                </label>
                <input
                  type="text"
                  value={settings.values_subtitle}
                  onChange={(e) =>
                    handleInputChange('values_subtitle', e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* 价值观1 */}
            <div className="space-y-4">
              <h3 className="text-md font-medium text-gray-900 flex items-center">
                <Award className="w-4 h-4 mr-2" />
                价值观1
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  标题
                </label>
                <input
                  type="text"
                  value={settings.value_1_title}
                  onChange={(e) =>
                    handleInputChange('value_1_title', e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  描述
                </label>
                <textarea
                  value={settings.value_1_description}
                  onChange={(e) =>
                    handleInputChange('value_1_description', e.target.value)
                  }
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* 价值观2和价值观3 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 价值观2 */}
            <div className="space-y-4">
              <h3 className="text-md font-medium text-gray-900 flex items-center">
                <Award className="w-4 h-4 mr-2" />
                价值观2
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  标题
                </label>
                <input
                  type="text"
                  value={settings.value_2_title}
                  onChange={(e) =>
                    handleInputChange('value_2_title', e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  描述
                </label>
                <textarea
                  value={settings.value_2_description}
                  onChange={(e) =>
                    handleInputChange('value_2_description', e.target.value)
                  }
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* 价值观3 */}
            <div className="space-y-4">
              <h3 className="text-md font-medium text-gray-900 flex items-center">
                <Award className="w-4 h-4 mr-2" />
                价值观3
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  标题
                </label>
                <input
                  type="text"
                  value={settings.value_3_title}
                  onChange={(e) =>
                    handleInputChange('value_3_title', e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  描述
                </label>
                <textarea
                  value={settings.value_3_description}
                  onChange={(e) =>
                    handleInputChange('value_3_description', e.target.value)
                  }
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* 行动号召 */}
          <div className="space-y-4">
            <h3 className="text-md font-medium text-gray-900 flex items-center">
              <Target className="w-4 h-4 mr-2" />
              行动号召
            </h3>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
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
                  CTA副标题
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  按钮文字
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
