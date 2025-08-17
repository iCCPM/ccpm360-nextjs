'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Settings,
  Globe,
  Mail,
  Shield,
  Clock,
  Image,
  Save,
  RotateCcw,
} from 'lucide-react';
import { toast } from 'sonner';

interface SystemSettings {
  // 基本信息
  siteName: string;
  siteDescription: string;
  siteKeywords: string;
  adminEmail: string;
  supportEmail: string;

  // 系统配置
  timezone: string;
  language: string;
  dateFormat: string;

  // 安全设置
  enableRegistration: boolean;
  requireEmailVerification: boolean;
  enableTwoFactor: boolean;
  sessionTimeout: number;
  maxLoginAttempts: number;

  // 文件上传
  maxFileSize: number;
  allowedFileTypes: string;

  // 邮件设置
  smtpHost: string;
  smtpPort: number;
  smtpUsername: string;
  smtpPassword: string;
  smtpEncryption: string;

  // 缓存设置
  enableCache: boolean;
  cacheTimeout: number;

  // 维护模式
  maintenanceMode: boolean;
  maintenanceMessage: string;
}

const defaultSettings: SystemSettings = {
  siteName: 'CCPM360',
  siteDescription: '专业的项目管理和咨询服务平台',
  siteKeywords: '项目管理,咨询服务,CCPM360',
  adminEmail: 'admin@ccpm360.com',
  supportEmail: 'support@ccpm360.com',

  timezone: 'Asia/Shanghai',
  language: 'zh-CN',
  dateFormat: 'YYYY-MM-DD',

  enableRegistration: true,
  requireEmailVerification: true,
  enableTwoFactor: false,
  sessionTimeout: 30,
  maxLoginAttempts: 5,

  maxFileSize: 10,
  allowedFileTypes: 'jpg,jpeg,png,gif,pdf,doc,docx,xls,xlsx',

  smtpHost: 'smtp.example.com',
  smtpPort: 587,
  smtpUsername: '',
  smtpPassword: '',
  smtpEncryption: 'tls',

  enableCache: true,
  cacheTimeout: 3600,

  maintenanceMode: false,
  maintenanceMessage: '系统正在维护中，请稍后访问。',
};

const timezones = [
  { value: 'Asia/Shanghai', label: '中国标准时间 (UTC+8)' },
  { value: 'America/New_York', label: '美国东部时间 (UTC-5)' },
  { value: 'Europe/London', label: '英国时间 (UTC+0)' },
  { value: 'Asia/Tokyo', label: '日本时间 (UTC+9)' },
];

const languages = [
  { value: 'zh-CN', label: '简体中文' },
  { value: 'en-US', label: 'English' },
  { value: 'ja-JP', label: '日本語' },
];

const dateFormats = [
  { value: 'YYYY-MM-DD', label: '2024-01-15' },
  { value: 'MM/DD/YYYY', label: '01/15/2024' },
  { value: 'DD/MM/YYYY', label: '15/01/2024' },
];

const encryptionTypes = [
  { value: 'none', label: '无加密' },
  { value: 'tls', label: 'TLS' },
  { value: 'ssl', label: 'SSL' },
];

export default function GeneralSettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // TODO: 实现保存设置API调用
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('设置保存成功');
    } catch (error) {
      toast.error('保存失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSettings(defaultSettings);
    toast.success('设置已重置为默认值');
  };

  const updateSetting = (key: keyof SystemSettings, value: any) => {
    console.log('updateSetting called:', key, value);
    setSettings((prev) => {
      const newSettings = { ...prev, [key]: value };
      console.log('Settings updated:', newSettings);
      return newSettings;
    });
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">基本设置</h1>
          <p className="text-muted-foreground">系统基础配置和参数设置</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="mr-2 h-4 w-4" />
            重置
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            <Save className="mr-2 h-4 w-4" />
            {isLoading ? '保存中...' : '保存设置'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {/* 基本信息 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="mr-2 h-5 w-5" />
              网站基本信息
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="siteName">网站名称</Label>
                <Input
                  id="siteName"
                  value={settings.siteName}
                  onChange={(e) => updateSetting('siteName', e.target.value)}
                  placeholder="请输入网站名称"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminEmail">管理员邮箱</Label>
                <Input
                  id="adminEmail"
                  type="email"
                  value={settings.adminEmail}
                  onChange={(e) => updateSetting('adminEmail', e.target.value)}
                  placeholder="请输入管理员邮箱"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="siteDescription">网站描述</Label>
              <Textarea
                id="siteDescription"
                value={settings.siteDescription}
                onChange={(e) =>
                  updateSetting('siteDescription', e.target.value)
                }
                placeholder="请输入网站描述"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="siteKeywords">网站关键词</Label>
              <Input
                id="siteKeywords"
                value={settings.siteKeywords}
                onChange={(e) => updateSetting('siteKeywords', e.target.value)}
                placeholder="请输入网站关键词，用逗号分隔"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supportEmail">客服邮箱</Label>
              <Input
                id="supportEmail"
                type="email"
                value={settings.supportEmail}
                onChange={(e) => updateSetting('supportEmail', e.target.value)}
                placeholder="请输入客服邮箱"
              />
            </div>
          </CardContent>
        </Card>

        {/* 系统配置 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="mr-2 h-5 w-5" />
              系统配置
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="timezone">时区设置</Label>
                <Select
                  value={settings.timezone}
                  onValueChange={(value) => updateSetting('timezone', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择时区" />
                  </SelectTrigger>
                  <SelectContent>
                    {timezones.map((tz) => (
                      <SelectItem key={tz.value} value={tz.value}>
                        {tz.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="language">系统语言</Label>
                <Select
                  value={settings.language}
                  onValueChange={(value) => updateSetting('language', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择语言" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateFormat">日期格式</Label>
                <Select
                  value={settings.dateFormat}
                  onValueChange={(value) => updateSetting('dateFormat', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择日期格式" />
                  </SelectTrigger>
                  <SelectContent>
                    {dateFormats.map((format) => (
                      <SelectItem key={format.value} value={format.value}>
                        {format.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 安全设置 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="mr-2 h-5 w-5" />
              安全设置
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>允许用户注册</Label>
                <p className="text-sm text-muted-foreground">
                  是否允许新用户自主注册账户
                </p>
              </div>
              <Switch
                checked={settings.enableRegistration}
                onCheckedChange={(checked) => {
                  updateSetting('enableRegistration', checked);
                }}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>邮箱验证</Label>
                <p className="text-sm text-muted-foreground">
                  新用户注册时是否需要邮箱验证
                </p>
              </div>
              <Switch
                checked={settings.requireEmailVerification}
                onCheckedChange={(checked) => {
                  updateSetting('requireEmailVerification', checked);
                }}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>双因素认证</Label>
                <p className="text-sm text-muted-foreground">
                  是否启用双因素认证功能
                </p>
              </div>
              <Switch
                checked={settings.enableTwoFactor}
                onCheckedChange={(checked) => {
                  updateSetting('enableTwoFactor', checked);
                }}
              />
            </div>
            <Separator />
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="sessionTimeout">会话超时时间（分钟）</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) =>
                    updateSetting('sessionTimeout', parseInt(e.target.value))
                  }
                  placeholder="30"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxLoginAttempts">最大登录尝试次数</Label>
                <Input
                  id="maxLoginAttempts"
                  type="number"
                  value={settings.maxLoginAttempts}
                  onChange={(e) =>
                    updateSetting('maxLoginAttempts', parseInt(e.target.value))
                  }
                  placeholder="5"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 文件上传设置 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Image className="mr-2 h-5 w-5" />
              文件上传设置
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="maxFileSize">最大文件大小（MB）</Label>
                <Input
                  id="maxFileSize"
                  type="number"
                  value={settings.maxFileSize}
                  onChange={(e) =>
                    updateSetting('maxFileSize', parseInt(e.target.value))
                  }
                  placeholder="10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="allowedFileTypes">允许的文件类型</Label>
                <Input
                  id="allowedFileTypes"
                  value={settings.allowedFileTypes}
                  onChange={(e) =>
                    updateSetting('allowedFileTypes', e.target.value)
                  }
                  placeholder="jpg,jpeg,png,gif,pdf"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 邮件设置 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="mr-2 h-5 w-5" />
              邮件设置
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="smtpHost">SMTP服务器</Label>
                <Input
                  id="smtpHost"
                  value={settings.smtpHost}
                  onChange={(e) => updateSetting('smtpHost', e.target.value)}
                  placeholder="smtp.example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtpPort">SMTP端口</Label>
                <Input
                  id="smtpPort"
                  type="number"
                  value={settings.smtpPort}
                  onChange={(e) =>
                    updateSetting('smtpPort', parseInt(e.target.value))
                  }
                  placeholder="587"
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="smtpUsername">SMTP用户名</Label>
                <Input
                  id="smtpUsername"
                  value={settings.smtpUsername}
                  onChange={(e) =>
                    updateSetting('smtpUsername', e.target.value)
                  }
                  placeholder="请输入SMTP用户名"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtpPassword">SMTP密码</Label>
                <Input
                  id="smtpPassword"
                  type="password"
                  value={settings.smtpPassword}
                  onChange={(e) =>
                    updateSetting('smtpPassword', e.target.value)
                  }
                  placeholder="请输入SMTP密码"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtpEncryption">加密方式</Label>
              <Select
                value={settings.smtpEncryption}
                onValueChange={(value) =>
                  updateSetting('smtpEncryption', value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择加密方式" />
                </SelectTrigger>
                <SelectContent>
                  {encryptionTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* 缓存和维护 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="mr-2 h-5 w-5" />
              缓存和维护
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>启用缓存</Label>
                <p className="text-sm text-muted-foreground">
                  启用系统缓存以提高性能
                </p>
              </div>
              <Switch
                checked={settings.enableCache}
                onCheckedChange={(checked) =>
                  updateSetting('enableCache', checked)
                }
              />
            </div>
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="cacheTimeout">缓存超时时间（秒）</Label>
              <Input
                id="cacheTimeout"
                type="number"
                value={settings.cacheTimeout}
                onChange={(e) =>
                  updateSetting('cacheTimeout', parseInt(e.target.value))
                }
                placeholder="3600"
                disabled={!settings.enableCache}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>维护模式</Label>
                <p className="text-sm text-muted-foreground">
                  启用后网站将显示维护页面
                </p>
              </div>
              <Switch
                checked={settings.maintenanceMode}
                onCheckedChange={(checked) =>
                  updateSetting('maintenanceMode', checked)
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maintenanceMessage">维护提示信息</Label>
              <Textarea
                id="maintenanceMessage"
                value={settings.maintenanceMessage}
                onChange={(e) =>
                  updateSetting('maintenanceMessage', e.target.value)
                }
                placeholder="请输入维护提示信息"
                rows={3}
                disabled={!settings.maintenanceMode}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
