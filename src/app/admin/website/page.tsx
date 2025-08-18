'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Home,
  Users,
  Phone,
  Briefcase,
  FolderOpen,
  Settings,
} from 'lucide-react';
import Link from 'next/link';

const modules = [
  {
    title: '首页设置',
    description: '管理网站首页的内容、轮播图和布局设置',
    href: '/admin/website/homepage',
    icon: Home,
    color: 'text-blue-600',
  },
  {
    title: '关于我们',
    description: '编辑公司介绍、团队信息和企业文化',
    href: '/admin/website/about',
    icon: Users,
    color: 'text-green-600',
  },
  {
    title: '联系页面',
    description: '配置联系方式、地址信息和地图设置',
    href: '/admin/website/contact',
    icon: Phone,
    color: 'text-orange-600',
  },
  {
    title: '服务页面',
    description: '管理服务项目、价格和详细说明',
    href: '/admin/website/services',
    icon: Briefcase,
    color: 'text-purple-600',
  },
  {
    title: '案例页面',
    description: '展示项目案例、客户评价和成功故事',
    href: '/admin/website/cases',
    icon: FolderOpen,
    color: 'text-red-600',
  },
];

export default function WebsiteManagePage() {
  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-900">网站管理</h1>
        <p className="text-gray-600 mt-2">
          管理网站的各个页面内容，包括首页、关于我们、联系方式、服务介绍和案例展示
        </p>
      </div>

      {/* 统计概览 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总页面数</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{modules.length}</div>
            <p className="text-xs text-muted-foreground">可管理的网站页面</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">最近更新</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">联系页面</div>
            <p className="text-xs text-muted-foreground">地图设置已更新</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">状态</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">正常</div>
            <p className="text-xs text-muted-foreground">所有页面运行正常</p>
          </CardContent>
        </Card>
      </div>

      {/* 模块卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => {
          const IconComponent = module.icon;
          return (
            <Card
              key={module.href}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <IconComponent className={`h-8 w-8 ${module.color}`} />
                  <div>
                    <CardTitle className="text-lg">{module.title}</CardTitle>
                  </div>
                </div>
                <CardDescription className="text-sm text-gray-600">
                  {module.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-2">
                  <Button asChild className="flex-1">
                    <Link href={module.href}>管理设置</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href={module.href.replace('/admin', '')}>
                      预览页面
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 快捷操作 */}
      <Card>
        <CardHeader>
          <CardTitle>快捷操作</CardTitle>
          <CardDescription>常用的网站管理操作</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" asChild>
              <Link href="/admin/website/homepage">编辑首页轮播图</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/website/contact">更新联系信息</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/website/services">添加新服务</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/website/cases">发布新案例</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
