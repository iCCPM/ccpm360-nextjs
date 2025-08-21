'use client';

import { useState, useEffect } from 'react';
import { Save, Eye, Settings, Mail, Phone, MapPin } from 'lucide-react';
import { toast } from 'sonner';

interface ContactInfo {
  phone: string;
  email: string;
  address: string;
  workingHours: string;
  weekendHours: string;
  wechat: string;
  qq: string;
  subwayRoute: string;
  busRoute: string;
  drivingRoute: string;
  trafficTips: string;
}

interface ContactSettings {
  heroTitle: string;
  heroDescription: string;
  contactInfo: ContactInfo;
  mapTitle: string;
  mapDescription: string;
  formTitle: string;
  formDescription: string;
}

const defaultSettings: ContactSettings = {
  heroTitle: '联系我们',
  heroDescription: '我们期待与您的合作，为您提供专业的项目管理解决方案',
  contactInfo: {
    phone: '+86 400-123-4567',
    email: 'contact@ccpm360.com',
    address: '北京市朝阳区建国路88号现代城A座1001室',
    workingHours: '周一至周五 9:00-18:00',
    weekendHours: '周六日及节假日 08:00~22:00',
    wechat: 'CCPM360',
    qq: '123456789',
    subwayRoute: '地铁4号线/10号线海淀黄庄站A2出口，步行约5分钟',
    busRoute:
      '乘坐26路、302路、332路、394路、608路、614路、681路、683路、717路、732路、801路、808路、814路、运通105线、运通106线、运通205线等公交车至中关村站下车',
    drivingRoute: '导航至"中关村大街27号"，周边有多个停车场可供选择',
    trafficTips:
      '建议优先选择地铁出行，避开早晚高峰时段。如需驾车前往，请提前了解停车位情况。',
  },
  mapTitle: '我们的位置',
  mapDescription: '欢迎您到访我们的办公室',
  formTitle: '在线咨询',
  formDescription: '请填写以下信息，我们会尽快与您联系',
};

export default function ContactManagement() {
  const [settings, setSettings] = useState<ContactSettings>(defaultSettings);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/website/contact');
      if (!response.ok) {
        throw new Error('加载联系页面设置失败');
      }
      const data = await response.json();

      // 转换API数据格式为前端格式
      const formattedSettings: ContactSettings = {
        heroTitle: data.hero_title || defaultSettings.heroTitle,
        heroDescription:
          data.hero_description || defaultSettings.heroDescription,
        contactInfo: {
          phone: data.phone || defaultSettings.contactInfo.phone,
          email: data.email || defaultSettings.contactInfo.email,
          address: data.address || defaultSettings.contactInfo.address,
          workingHours:
            data.working_hours || defaultSettings.contactInfo.workingHours,
          weekendHours:
            data.weekend_hours || defaultSettings.contactInfo.weekendHours,
          wechat: data.wechat || defaultSettings.contactInfo.wechat,
          qq: data.qq || defaultSettings.contactInfo.qq,
          subwayRoute:
            data.subway_route || defaultSettings.contactInfo.subwayRoute,
          busRoute: data.bus_route || defaultSettings.contactInfo.busRoute,
          drivingRoute:
            data.driving_route || defaultSettings.contactInfo.drivingRoute,
          trafficTips:
            data.traffic_tips || defaultSettings.contactInfo.trafficTips,
        },
        mapTitle: data.map_title || defaultSettings.mapTitle,
        mapDescription: data.map_description || defaultSettings.mapDescription,
        formTitle: data.form_title || defaultSettings.formTitle,
        formDescription:
          data.form_description || defaultSettings.formDescription,
      };

      setSettings(formattedSettings);
    } catch (error) {
      console.error('加载联系页面设置失败:', error);
      toast.error('加载联系页面设置失败');
      // 如果加载失败，使用默认设置
      setSettings(defaultSettings);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      // 转换前端数据格式为API格式
      const apiData = {
        hero_title: settings.heroTitle,
        hero_description: settings.heroDescription,
        phone: settings.contactInfo.phone,
        email: settings.contactInfo.email,
        address: settings.contactInfo.address,
        working_hours: settings.contactInfo.workingHours,
        weekend_hours: settings.contactInfo.weekendHours,
        wechat: settings.contactInfo.wechat,
        qq: settings.contactInfo.qq,
        subway_route: settings.contactInfo.subwayRoute,
        bus_route: settings.contactInfo.busRoute,
        driving_route: settings.contactInfo.drivingRoute,
        traffic_tips: settings.contactInfo.trafficTips,
        map_title: settings.mapTitle,
        map_description: settings.mapDescription,
        form_title: settings.formTitle,
        form_description: settings.formDescription,
      };

      const response = await fetch('/api/admin/website/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '保存联系页面设置失败');
      }

      await response.json();
      toast.success('联系页面设置保存成功');
    } catch (error) {
      console.error('保存联系页面设置失败:', error);
      toast.error(
        error instanceof Error ? error.message : '保存联系页面设置失败'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof ContactSettings, value: string) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleContactInfoChange = (field: keyof ContactInfo, value: string) => {
    setSettings((prev) => ({
      ...prev,
      contactInfo: { ...prev.contactInfo, [field]: value },
    }));
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
          <h1 className="text-2xl font-bold text-gray-900">联系页面管理</h1>
          <p className="text-gray-600 mt-1">管理联系页面的内容和设置</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => window.open('/contact', '_blank')}
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
                value={settings.heroTitle}
                onChange={(e) => handleInputChange('heroTitle', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                页面描述
              </label>
              <textarea
                value={settings.heroDescription}
                onChange={(e) =>
                  handleInputChange('heroDescription', e.target.value)
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* 联系信息设置 */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">联系信息设置</h2>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 基本联系信息 */}
              <div className="space-y-4">
                <h3 className="text-md font-medium text-gray-900 flex items-center">
                  <Phone className="w-4 h-4 mr-2" />
                  基本信息
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    联系电话
                  </label>
                  <input
                    type="text"
                    value={settings.contactInfo.phone}
                    onChange={(e) =>
                      handleContactInfoChange('phone', e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    邮箱地址
                  </label>
                  <input
                    type="email"
                    value={settings.contactInfo.email}
                    onChange={(e) =>
                      handleContactInfoChange('email', e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    办公地址
                  </label>
                  <textarea
                    value={settings.contactInfo.address}
                    onChange={(e) =>
                      handleContactInfoChange('address', e.target.value)
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* 其他联系方式 */}
              <div className="space-y-4">
                <h3 className="text-md font-medium text-gray-900 flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  其他联系方式
                </h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    工作时间
                  </label>
                  <input
                    type="text"
                    value={settings.contactInfo.workingHours}
                    onChange={(e) =>
                      handleContactInfoChange('workingHours', e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    周末工作时间
                  </label>
                  <input
                    type="text"
                    value={settings.contactInfo.weekendHours}
                    onChange={(e) =>
                      handleContactInfoChange('weekendHours', e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    微信号
                  </label>
                  <input
                    type="text"
                    value={settings.contactInfo.wechat}
                    onChange={(e) =>
                      handleContactInfoChange('wechat', e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    QQ号码
                  </label>
                  <input
                    type="text"
                    value={settings.contactInfo.qq}
                    onChange={(e) =>
                      handleContactInfoChange('qq', e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 交通指南设置 */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 flex items-center">
              <MapPin className="w-4 h-4 mr-2" />
              交通指南设置
            </h2>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                地铁路线
              </label>
              <textarea
                value={settings.contactInfo.subwayRoute}
                onChange={(e) =>
                  handleContactInfoChange('subwayRoute', e.target.value)
                }
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="请输入地铁路线信息"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                公交路线
              </label>
              <textarea
                value={settings.contactInfo.busRoute}
                onChange={(e) =>
                  handleContactInfoChange('busRoute', e.target.value)
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="请输入公交路线信息"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                自驾路线
              </label>
              <textarea
                value={settings.contactInfo.drivingRoute}
                onChange={(e) =>
                  handleContactInfoChange('drivingRoute', e.target.value)
                }
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="请输入自驾路线信息"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                交通提示
              </label>
              <textarea
                value={settings.contactInfo.trafficTips}
                onChange={(e) =>
                  handleContactInfoChange('trafficTips', e.target.value)
                }
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="请输入交通提示信息"
              />
            </div>
          </div>
        </div>

        {/* 地图区域设置 */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 flex items-center">
              <MapPin className="w-4 h-4 mr-2" />
              地图区域设置
            </h2>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                地图区域标题
              </label>
              <input
                type="text"
                value={settings.mapTitle}
                onChange={(e) => handleInputChange('mapTitle', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                地图区域描述
              </label>
              <input
                type="text"
                value={settings.mapDescription}
                onChange={(e) =>
                  handleInputChange('mapDescription', e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* 表单区域设置 */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900 flex items-center">
              <Settings className="w-4 h-4 mr-2" />
              表单区域设置
            </h2>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                表单标题
              </label>
              <input
                type="text"
                value={settings.formTitle}
                onChange={(e) => handleInputChange('formTitle', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                表单描述
              </label>
              <textarea
                value={settings.formDescription}
                onChange={(e) =>
                  handleInputChange('formDescription', e.target.value)
                }
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
