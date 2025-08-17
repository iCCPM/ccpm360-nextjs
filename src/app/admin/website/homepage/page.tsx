'use client';

import { useState, useEffect } from 'react';
import { Save, Upload, Eye, Settings } from 'lucide-react';
import { toast } from 'sonner';

interface HomepageConfig {
  id?: string;
  hero_title: string;
  hero_subtitle: string;
  statistics: {
    projects: number;
    clients: number;
    success_rate: number;
    experience: number;
  };
  created_at?: string;
  updated_at?: string;
}

const defaultSettings: HomepageConfig = {
  hero_title: 'CCPM360 - 更专业的项目管理解决方案',
  hero_subtitle:
    '专业的关键链项目管理培训与咨询服务，帮助企业提升项目管理效率，实现项目成功交付。基于约束理论的科学方法，让项目管理更简单、更高效。',
  statistics: {
    projects: 500,
    clients: 200,
    success_rate: 95,
    experience: 10,
  },
};

export default function HomepageManagement() {
  const [settings, setSettings] = useState<HomepageConfig>(defaultSettings);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/website/homepage');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      } else {
        // 如果API调用失败，使用默认设置
        setSettings(defaultSettings);
      }
    } catch (error) {
      console.error('加载首页设置失败:', error);
      toast.error('加载首页设置失败');
      // 出错时使用默认设置
      setSettings(defaultSettings);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/website/homepage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        toast.success('首页设置保存成功');
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || '保存失败');
      }
    } catch (error) {
      console.error('保存首页设置失败:', error);
      toast.error('保存首页设置失败');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (
    field: keyof HomepageConfig,
    value: string | number
  ) => {
    if (field.startsWith('statistics.')) {
      const statField = field.split(
        '.'
      )[1] as keyof HomepageConfig['statistics'];
      setSettings((prev) => ({
        ...prev,
        statistics: {
          ...prev.statistics,
          [statField]: typeof value === 'string' ? Number(value) : value,
        },
      }));
    } else {
      setSettings((prev) => ({ ...prev, [field]: value }));
    }
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
          <h1 className="text-2xl font-bold text-gray-900">首页管理</h1>
          <p className="text-gray-600 mt-1">管理网站首页的内容和设置</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => window.open('/', '_blank')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Eye className="w-4 h-4 mr-2" />
            预览首页
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
          <h2 className="text-lg font-medium text-gray-900">首页内容设置</h2>
        </div>

        <div className="p-6 space-y-6">
          {/* Hero 区域设置 */}
          <div className="space-y-4">
            <h3 className="text-md font-medium text-gray-900 flex items-center">
              <Settings className="w-4 h-4 mr-2" />
              Hero 区域
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  首页标题
                </label>
                <input
                  type="text"
                  value={settings.hero_title}
                  onChange={(e) =>
                    handleInputChange('hero_title', e.target.value)
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="输入首页标题"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  首页副标题
                </label>
                <textarea
                  value={settings.hero_subtitle}
                  onChange={(e) =>
                    handleInputChange('hero_subtitle', e.target.value)
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="输入首页副标题"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  统计数据
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      服务项目数
                    </label>
                    <input
                      type="number"
                      value={settings.statistics.projects}
                      onChange={(e) =>
                        handleInputChange('statistics.projects', e.target.value)
                      }
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="项目数量"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      合作客户数
                    </label>
                    <input
                      type="number"
                      value={settings.statistics.clients}
                      onChange={(e) =>
                        handleInputChange('statistics.clients', e.target.value)
                      }
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="客户数量"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      成功率 (%)
                    </label>
                    <input
                      type="number"
                      value={settings.statistics.success_rate}
                      onChange={(e) =>
                        handleInputChange(
                          'statistics.success_rate',
                          e.target.value
                        )
                      }
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="成功率"
                      min="0"
                      max="100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      年经验
                    </label>
                    <input
                      type="number"
                      value={settings.statistics.experience}
                      onChange={(e) =>
                        handleInputChange(
                          'statistics.experience',
                          e.target.value
                        )
                      }
                      className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="经验年数"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
