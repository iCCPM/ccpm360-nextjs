'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { Badge } from '@/components/ui/badge';
import {
  Settings,
  Database,
  HardDrive,
  Activity,
  Server,
  Shield,
  Users,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

interface SystemStatus {
  name: string;
  status: 'healthy' | 'warning' | 'error';
  value: string;
  description: string;
}

interface QuickAction {
  title: string;
  description: string;
  icon: any;
  href: string;
  color: string;
}

const systemStatus: SystemStatus[] = [
  {
    name: 'CPU使用率',
    status: 'healthy',
    value: '23%',
    description: '系统运行正常',
  },
  {
    name: '内存使用',
    status: 'warning',
    value: '78%',
    description: '内存使用较高',
  },
  {
    name: '磁盘空间',
    status: 'healthy',
    value: '45%',
    description: '存储空间充足',
  },
  {
    name: '数据库连接',
    status: 'healthy',
    value: '正常',
    description: '数据库运行稳定',
  },
];

const quickActions: QuickAction[] = [
  {
    title: '基本设置',
    description: '系统基础配置和参数设置',
    icon: Settings,
    href: '/admin/system/general',
    color: 'bg-blue-500',
  },
  {
    title: '数据管理',
    description: '数据库管理和数据维护',
    icon: Database,
    href: '/admin/system/database',
    color: 'bg-green-500',
  },
  {
    title: '备份恢复',
    description: '数据备份和系统恢复',
    icon: HardDrive,
    href: '/admin/system/backup',
    color: 'bg-orange-500',
  },
];

const recentActivities = [
  {
    id: '1',
    action: '系统备份',
    status: 'success',
    time: '2024-01-15 02:00:00',
    description: '自动备份任务执行成功',
  },
  {
    id: '2',
    action: '用户登录',
    status: 'info',
    time: '2024-01-15 14:30:00',
    description: 'admin 用户登录系统',
  },
  {
    id: '3',
    action: '配置更新',
    status: 'warning',
    time: '2024-01-15 10:15:00',
    description: '系统配置已更新，建议重启服务',
  },
  {
    id: '4',
    action: '数据清理',
    status: 'success',
    time: '2024-01-14 23:00:00',
    description: '临时文件清理完成',
  },
];

export default function SystemPage() {
  const getStatusIcon = (status: SystemStatus['status']) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      success: 'default',
      warning: 'secondary',
      error: 'destructive',
      info: 'outline',
    } as const;

    const labels = {
      success: '成功',
      warning: '警告',
      error: '错误',
      info: '信息',
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">系统管理</h1>
        <p className="text-muted-foreground">系统状态监控和管理工具</p>
      </div>

      {/* 系统状态 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {systemStatus.map((item) => (
          <Card key={item.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{item.name}</CardTitle>
              {getStatusIcon(item.status)}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{item.value}</div>
              <p className="text-xs text-muted-foreground">
                {item.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 快速操作 */}
      <Card>
        <CardHeader>
          <CardTitle>快速操作</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.title} href={action.href}>
                  <Card className="cursor-pointer transition-colors hover:bg-muted/50">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <div className={`p-2 rounded-lg ${action.color}`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{action.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {action.description}
                          </p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* 系统信息 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Server className="mr-2 h-5 w-5" />
              系统信息
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">系统版本</span>
                <span className="text-sm font-medium">CCPM360 v1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">运行时间</span>
                <span className="text-sm font-medium">15天 8小时 32分钟</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">最后重启</span>
                <span className="text-sm font-medium">2024-01-01 00:00:00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">在线用户</span>
                <span className="text-sm font-medium">3 人</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">总访问量</span>
                <span className="text-sm font-medium">12,345 次</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 最近活动 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="mr-2 h-5 w-5" />
              最近活动
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {getStatusBadge(activity.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.description}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <p className="text-xs text-muted-foreground">
                      {new Date(activity.time).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 系统统计 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总用户数</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">+12% 较上月</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">内容数量</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">567</div>
            <p className="text-xs text-muted-foreground">+8% 较上月</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">系统负载</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0.45</div>
            <p className="text-xs text-muted-foreground">系统运行正常</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">安全状态</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">安全</div>
            <p className="text-xs text-muted-foreground">无安全威胁</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
