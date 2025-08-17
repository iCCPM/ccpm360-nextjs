'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  FileText,
  BookOpen,
  MessageSquare,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Home,
  LogOut,
  User,
  Bell,
  Search,
  ChevronDown,
  Briefcase,
  Download,
  Mail,
  Globe,
  Shield,
  Database,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthProvider';
import { AuthGuard } from '@/components/auth/AuthGuard';

interface MenuItem {
  id: string;
  label: string;
  icon: any;
  href: string;
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: '仪表板',
    icon: LayoutDashboard,
    href: '/admin/dashboard',
  },
  {
    id: 'cases',
    label: '案例管理',
    icon: Briefcase,
    href: '/admin/cases',
    children: [
      {
        id: 'cases-list',
        label: '案例列表',
        icon: FileText,
        href: '/admin/cases',
      },
      {
        id: 'cases-new',
        label: '新增案例',
        icon: FileText,
        href: '/admin/cases/new',
      },
    ],
  },
  {
    id: 'resources',
    label: '资源管理',
    icon: Download,
    href: '/admin/resources',
    children: [
      {
        id: 'resources-list',
        label: '资源列表',
        icon: BookOpen,
        href: '/admin/resources',
      },
      {
        id: 'resources-new',
        label: '新增资源',
        icon: BookOpen,
        href: '/admin/resources/new',
      },
    ],
  },
  {
    id: 'blog',
    label: '博客管理',
    icon: BookOpen,
    href: '/admin/blog',
    children: [
      {
        id: 'blog-list',
        label: '文章列表',
        icon: FileText,
        href: '/admin/blog',
      },
      {
        id: 'blog-new',
        label: '新增文章',
        icon: FileText,
        href: '/admin/blog/new',
      },
    ],
  },
  {
    id: 'contacts',
    label: '联系管理',
    icon: Mail,
    href: '/admin/contacts',
    children: [
      {
        id: 'contacts-list',
        label: '联系列表',
        icon: MessageSquare,
        href: '/admin/contacts',
      },
      {
        id: 'contacts-page',
        label: '联系页面',
        icon: Mail,
        href: '/admin/website/contact',
      },
    ],
  },
  {
    id: 'users',
    label: '用户管理',
    icon: Users,
    href: '/admin/users',
    children: [
      {
        id: 'users-list',
        label: '用户列表',
        icon: Users,
        href: '/admin/users',
      },
      {
        id: 'users-roles',
        label: '角色权限',
        icon: Shield,
        href: '/admin/users/roles',
      },
    ],
  },
  {
    id: 'services',
    label: '服务管理',
    icon: Briefcase,
    href: '/admin/services',
    children: [
      {
        id: 'services-settings',
        label: '服务设置',
        icon: Settings,
        href: '/admin/website/services',
      },
      {
        id: 'services-courses',
        label: '课程管理',
        icon: BookOpen,
        href: '/admin/services/courses',
      },
    ],
  },
  {
    id: 'website',
    label: '网站管理',
    icon: Globe,
    href: '/admin/website',
    children: [
      {
        id: 'website-homepage',
        label: '首页设置',
        icon: Home,
        href: '/admin/website/homepage',
      },
      {
        id: 'website-about',
        label: '关于我们',
        icon: FileText,
        href: '/admin/website/about',
      },
    ],
  },
  {
    id: 'system',
    label: '系统设置',
    icon: Settings,
    href: '/admin/system',
    children: [
      {
        id: 'system-general',
        label: '基本设置',
        icon: Settings,
        href: '/admin/system/general',
      },
      {
        id: 'system-database',
        label: '数据管理',
        icon: Database,
        href: '/admin/system/database',
      },
      {
        id: 'system-backup',
        label: '备份恢复',
        icon: Download,
        href: '/admin/system/backup',
      },
    ],
  },
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['dashboard']);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // 根据当前路径自动展开相应的菜单
  useEffect(() => {
    const currentPath = pathname;
    const matchedMenu = menuItems.find(
      (item) =>
        currentPath.startsWith(item.href) ||
        item.children?.some((child) => currentPath.startsWith(child.href))
    );
    if (matchedMenu && !expandedMenus.includes(matchedMenu.id)) {
      setExpandedMenus((prev) => [...prev, matchedMenu.id]);
    }
  }, [pathname]);

  const toggleMenu = (menuId: string) => {
    setExpandedMenus((prev) =>
      prev.includes(menuId)
        ? prev.filter((id) => id !== menuId)
        : [...prev, menuId]
    );
  };

  const handleLogout = async () => {
    await logout();
    router.push('/admin/login');
  };

  const generateBreadcrumbs = () => {
    const breadcrumbs = [];

    // 添加首页
    breadcrumbs.push({ label: '管理后台', href: '/admin/dashboard' });

    // 查找当前页面对应的菜单项
    for (const item of menuItems) {
      if (pathname.startsWith(item.href) && item.href !== '/admin/dashboard') {
        breadcrumbs.push({ label: item.label, href: item.href });

        // 检查子菜单
        if (item.children) {
          const childItem = item.children.find((child) =>
            pathname.startsWith(child.href)
          );
          if (childItem && childItem.href !== item.href) {
            breadcrumbs.push({ label: childItem.label, href: childItem.href });
          }
        }
        break;
      }
    }

    return breadcrumbs;
  };

  const isActiveLink = (href: string) => {
    return (
      pathname === href ||
      (href !== '/admin/dashboard' && pathname.startsWith(href))
    );
  };

  // 如果是登录页面，直接渲染子组件，不需要认证保护
  if (pathname === '/admin/login') {
    return children;
  }

  // 非登录页面使用AuthGuard保护
  return (
    <AuthGuard allowedRoles={['super_admin', 'admin', 'editor', 'reviewer']}>
      <AdminLayoutContent
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        expandedMenus={expandedMenus}
        userMenuOpen={userMenuOpen}
        setUserMenuOpen={setUserMenuOpen}
        user={user}
        toggleMenu={toggleMenu}
        handleLogout={handleLogout}
        generateBreadcrumbs={generateBreadcrumbs}
        isActiveLink={isActiveLink}
      >
        {children}
      </AdminLayoutContent>
    </AuthGuard>
  );
}

// 将布局内容提取为单独的组件
function AdminLayoutContent({
  children,
  sidebarCollapsed,
  setSidebarCollapsed,
  mobileMenuOpen,
  setMobileMenuOpen,
  expandedMenus,
  userMenuOpen,
  setUserMenuOpen,
  user,
  toggleMenu,
  handleLogout,
  generateBreadcrumbs,
  isActiveLink,
}: {
  children: React.ReactNode;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  expandedMenus: string[];
  userMenuOpen: boolean;
  setUserMenuOpen: (open: boolean) => void;
  user: any;
  toggleMenu: (menuId: string) => void;
  handleLogout: () => void;
  generateBreadcrumbs: () => { label: string; href: string }[];
  isActiveLink: (href: string) => boolean;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 移动端菜单遮罩 */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* 侧边栏 */}
      <div
        className={`
        fixed top-0 left-0 h-full bg-white shadow-xl z-50 transition-all duration-300 ease-in-out
        ${sidebarCollapsed ? 'w-16' : 'w-64'}
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}
      >
        {/* 侧边栏头部 */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200">
          <div
            className={`flex items-center space-x-3 ${sidebarCollapsed ? 'justify-center' : ''}`}
          >
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            {!sidebarCollapsed && (
              <span className="font-bold text-gray-900 text-base">CCPM360</span>
            )}
          </div>

          {/* 桌面端收缩按钮 */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden lg:flex p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-4 h-4 text-gray-600" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            )}
          </button>

          {/* 移动端关闭按钮 */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* 导航菜单 */}
        <nav className="flex-1 overflow-y-auto py-2">
          <div className="px-2 space-y-0.5">
            {menuItems.map((item) => (
              <div key={item.id}>
                {/* 主菜单项 */}
                <div className="relative">
                  {item.children ? (
                    <button
                      onClick={() => toggleMenu(item.id)}
                      className={`
                        w-full flex items-center px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200
                        ${
                          isActiveLink(item.href)
                            ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                        }
                        ${sidebarCollapsed ? 'justify-center' : 'justify-between'}
                      `}
                    >
                      <div className="flex items-center">
                        <item.icon
                          className={`w-5 h-5 ${sidebarCollapsed ? '' : 'mr-3'}`}
                        />
                        {!sidebarCollapsed && <span>{item.label}</span>}
                      </div>
                      {!sidebarCollapsed && (
                        <ChevronDown
                          className={`w-4 h-4 transition-transform duration-200 ${
                            expandedMenus.includes(item.id) ? 'rotate-180' : ''
                          }`}
                        />
                      )}
                    </button>
                  ) : (
                    <Link
                      href={item.href}
                      className={`
                        flex items-center px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200
                        ${
                          isActiveLink(item.href)
                            ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                        }
                        ${sidebarCollapsed ? 'justify-center' : ''}
                      `}
                    >
                      <item.icon
                        className={`w-5 h-5 ${sidebarCollapsed ? '' : 'mr-3'}`}
                      />
                      {!sidebarCollapsed && <span>{item.label}</span>}
                    </Link>
                  )}
                </div>

                {/* 子菜单 */}
                {item.children &&
                  !sidebarCollapsed &&
                  expandedMenus.includes(item.id) && (
                    <div className="mt-0.5 ml-4 space-y-0.5">
                      {item.children.map((child) => (
                        <Link
                          key={child.id}
                          href={child.href}
                          className={`
                          flex items-center px-3 py-1.5 text-sm rounded-lg transition-all duration-200
                          ${
                            isActiveLink(child.href)
                              ? 'bg-blue-50 text-blue-700 font-medium'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          }
                        `}
                        >
                          <child.icon className="w-4 h-4 mr-3" />
                          <span>{child.label}</span>
                        </Link>
                      ))}
                    </div>
                  )}
              </div>
            ))}
          </div>
        </nav>

        {/* 侧边栏底部用户信息 */}
        {!sidebarCollapsed && (
          <div className="border-t border-gray-200 p-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.full_name || user?.email}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.role}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 主内容区域 */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
        }`}
      >
        {/* 顶部导航栏 */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-2">
            {/* 左侧：移动端菜单按钮 + 面包屑 */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-1.5 rounded-md hover:bg-gray-100 transition-colors"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>

              {/* 面包屑导航 */}
              <nav className="hidden sm:flex" aria-label="Breadcrumb">
                <ol className="flex items-center space-x-2">
                  {generateBreadcrumbs().map(
                    (crumb: { label: string; href: string }, index: number) => (
                      <li key={index} className="flex items-center">
                        {index > 0 && (
                          <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />
                        )}
                        <Link
                          href={crumb.href}
                          className={`text-sm font-medium transition-colors ${
                            index === generateBreadcrumbs().length - 1
                              ? 'text-gray-900'
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          {crumb.label}
                        </Link>
                      </li>
                    )
                  )}
                </ol>
              </nav>
            </div>

            {/* 右侧：搜索 + 通知 + 用户菜单 */}
            <div className="flex items-center space-x-4">
              {/* 搜索框 */}
              <div className="hidden md:block relative">
                <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索..."
                  className="pl-9 pr-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-48"
                />
              </div>

              {/* 通知按钮 */}
              <button className="relative p-1.5 rounded-md hover:bg-gray-100 transition-colors">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* 用户菜单 */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 p-1.5 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-600" />
                </button>

                {/* 用户下拉菜单 */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {user?.full_name || user?.email}
                      </p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <Link
                      href="/admin/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <User className="w-4 h-4 mr-3" />
                      个人资料
                    </Link>
                    <Link
                      href="/admin/settings"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Settings className="w-4 h-4 mr-3" />
                      账户设置
                    </Link>
                    <div className="border-t border-gray-100">
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        退出登录
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* 页面内容 */}
        <main className="p-4">
          <div className="max-w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
