'use client';

// @ts-expect-error: React is required for JSX
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Shield,
  Plus,
  Edit,
  Trash2,
  Users,
  Lock,
  Unlock,
  Settings,
  Eye,
  FileEdit,
  Database,
  UserCheck,
} from 'lucide-react';
import { toast } from 'sonner';

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

const mockPermissions: Permission[] = [
  // 内容管理权限
  {
    id: 'content:read',
    name: '查看内容',
    description: '查看博客、案例、资源等内容',
    category: '内容管理',
  },
  {
    id: 'content:write',
    name: '编辑内容',
    description: '创建和编辑内容',
    category: '内容管理',
  },
  {
    id: 'content:delete',
    name: '删除内容',
    description: '删除内容项目',
    category: '内容管理',
  },
  {
    id: 'content:publish',
    name: '发布内容',
    description: '发布和撤销发布内容',
    category: '内容管理',
  },

  // 用户管理权限
  {
    id: 'users:read',
    name: '查看用户',
    description: '查看用户列表和详情',
    category: '用户管理',
  },
  {
    id: 'users:write',
    name: '管理用户',
    description: '创建、编辑用户信息',
    category: '用户管理',
  },
  {
    id: 'users:delete',
    name: '删除用户',
    description: '删除用户账户',
    category: '用户管理',
  },
  {
    id: 'users:roles',
    name: '角色管理',
    description: '管理用户角色和权限',
    category: '用户管理',
  },

  // 系统管理权限
  {
    id: 'system:settings',
    name: '系统设置',
    description: '修改系统配置',
    category: '系统管理',
  },
  {
    id: 'system:backup',
    name: '数据备份',
    description: '执行数据备份和恢复',
    category: '系统管理',
  },
  {
    id: 'system:logs',
    name: '查看日志',
    description: '查看系统日志',
    category: '系统管理',
  },
  {
    id: 'system:maintenance',
    name: '系统维护',
    description: '执行系统维护操作',
    category: '系统管理',
  },

  // 网站管理权限
  {
    id: 'website:homepage',
    name: '首页管理',
    description: '管理网站首页设置',
    category: '网站管理',
  },
  {
    id: 'website:pages',
    name: '页面管理',
    description: '管理网站页面内容',
    category: '网站管理',
  },
  {
    id: 'website:seo',
    name: 'SEO设置',
    description: '管理SEO相关设置',
    category: '网站管理',
  },

  // 联系管理权限
  {
    id: 'contacts:read',
    name: '查看联系',
    description: '查看客户联系信息',
    category: '联系管理',
  },
  {
    id: 'contacts:write',
    name: '处理联系',
    description: '回复和处理客户联系',
    category: '联系管理',
  },
  {
    id: 'contacts:settings',
    name: '联系设置',
    description: '配置联系表单和通知',
    category: '联系管理',
  },
];

const mockRoles: Role[] = [
  {
    id: '1',
    name: '超级管理员',
    description: '拥有系统所有权限的最高管理员',
    permissions: mockPermissions.map((p) => p.id),
    userCount: 1,
    isSystem: true,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: '管理员',
    description: '拥有大部分管理权限，不包括系统核心设置',
    permissions: [
      'content:read',
      'content:write',
      'content:delete',
      'content:publish',
      'users:read',
      'users:write',
      'website:homepage',
      'website:pages',
      'contacts:read',
      'contacts:write',
      'contacts:settings',
    ],
    userCount: 2,
    isSystem: false,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
  },
  {
    id: '3',
    name: '编辑',
    description: '负责内容创建和编辑的角色',
    permissions: [
      'content:read',
      'content:write',
      'content:publish',
      'website:pages',
    ],
    userCount: 3,
    isSystem: false,
    createdAt: '2023-06-15T09:00:00Z',
    updatedAt: '2024-01-10T14:20:00Z',
  },
  {
    id: '4',
    name: '查看者',
    description: '只能查看内容，无编辑权限',
    permissions: ['content:read', 'contacts:read'],
    userCount: 5,
    isSystem: false,
    createdAt: '2023-12-01T14:20:00Z',
    updatedAt: '2023-12-01T14:20:00Z',
  },
];

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>(mockRoles);
  const [permissions] = useState<Permission[]>(mockPermissions);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [] as string[],
  });

  const handleCreateRole = () => {
    // TODO: 实现创建角色API调用
    const newRole: Role = {
      id: Date.now().toString(),
      ...formData,
      userCount: 0,
      isSystem: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setRoles([...roles, newRole]);
    setIsCreateDialogOpen(false);
    resetForm();
    toast.success('角色创建成功');
  };

  const handleEditRole = () => {
    if (!selectedRole) return;
    // TODO: 实现编辑角色API调用
    const updatedRoles = roles.map((role) =>
      role.id === selectedRole.id
        ? { ...role, ...formData, updatedAt: new Date().toISOString() }
        : role
    );
    setRoles(updatedRoles);
    setIsEditDialogOpen(false);
    setSelectedRole(null);
    resetForm();
    toast.success('角色更新成功');
  };

  const handleDeleteRole = (roleId: string) => {
    const role = roles.find((r) => r.id === roleId);
    if (role?.isSystem) {
      toast.error('系统角色不能删除');
      return;
    }
    if (role?.userCount && role.userCount > 0) {
      toast.error('该角色下还有用户，无法删除');
      return;
    }
    // TODO: 实现删除角色API调用
    setRoles(roles.filter((role) => role.id !== roleId));
    toast.success('角色删除成功');
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      permissions: [],
    });
  };

  const openEditDialog = (role: Role) => {
    setSelectedRole(role);
    setFormData({
      name: role.name,
      description: role.description,
      permissions: [...role.permissions],
    });
    setIsEditDialogOpen(true);
  };

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        permissions: [...formData.permissions, permissionId],
      });
    } else {
      setFormData({
        ...formData,
        permissions: formData.permissions.filter((id) => id !== permissionId),
      });
    }
  };

  const getPermissionsByCategory = () => {
    const categories: { [key: string]: Permission[] } = {};
    permissions.forEach((permission) => {
      if (!categories[permission.category]) {
        categories[permission.category] = [];
      }
      categories[permission.category]?.push(permission);
    });
    return categories;
  };

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: any } = {
      内容管理: FileEdit,
      用户管理: Users,
      系统管理: Settings,
      网站管理: Eye,
      联系管理: UserCheck,
    };
    const Icon = icons[category] || Shield;
    return <Icon className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">角色权限</h1>
          <p className="text-muted-foreground">管理系统角色和权限分配</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              新增角色
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>新增角色</DialogTitle>
              <DialogDescription>创建新的系统角色并分配权限</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">角色名称</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="请输入角色名称"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">角色描述</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="请输入角色描述"
                  rows={3}
                />
              </div>
              <div className="grid gap-4">
                <Label>权限设置</Label>
                <div className="space-y-4">
                  {Object.entries(getPermissionsByCategory()).map(
                    ([category, perms]) => (
                      <Card key={category}>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center">
                            {getCategoryIcon(category)}
                            <span className="ml-2">{category}</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="grid gap-3">
                            {perms.map((permission) => (
                              <div
                                key={permission.id}
                                className="flex items-start space-x-3"
                              >
                                <Checkbox
                                  id={permission.id}
                                  checked={formData.permissions.includes(
                                    permission.id
                                  )}
                                  onCheckedChange={(checked) =>
                                    handlePermissionChange(
                                      permission.id,
                                      checked as boolean
                                    )
                                  }
                                />
                                <div className="grid gap-1.5 leading-none">
                                  <label
                                    htmlFor={permission.id}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                  >
                                    {permission.name}
                                  </label>
                                  <p className="text-xs text-muted-foreground">
                                    {permission.description}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                取消
              </Button>
              <Button onClick={handleCreateRole}>创建角色</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总角色数</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{roles.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">系统角色</CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {roles.filter((r) => r.isSystem).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">自定义角色</CardTitle>
            <Unlock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {roles.filter((r) => !r.isSystem).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总权限数</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{permissions.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* 角色列表 */}
      <Card>
        <CardHeader>
          <CardTitle>角色列表</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>角色信息</TableHead>
                <TableHead>权限数量</TableHead>
                <TableHead>用户数量</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>更新时间</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium flex items-center">
                        <Shield className="mr-2 h-4 w-4" />
                        {role.name}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {role.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {role.permissions.length} 个权限
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Users className="mr-1 h-4 w-4 text-muted-foreground" />
                      {role.userCount}
                    </div>
                  </TableCell>
                  <TableCell>
                    {role.isSystem ? (
                      <Badge variant="default">
                        <Lock className="mr-1 h-3 w-3" />
                        系统角色
                      </Badge>
                    ) : (
                      <Badge variant="outline">
                        <Unlock className="mr-1 h-3 w-3" />
                        自定义
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {new Date(role.updatedAt).toLocaleString()}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(role)}
                        disabled={role.isSystem}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteRole(role.id)}
                        disabled={role.isSystem || role.userCount > 0}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 编辑角色对话框 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>编辑角色</DialogTitle>
            <DialogDescription>修改角色信息和权限设置</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">角色名称</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="请输入角色名称"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">角色描述</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="请输入角色描述"
                rows={3}
              />
            </div>
            <div className="grid gap-4">
              <Label>权限设置</Label>
              <div className="space-y-4">
                {Object.entries(getPermissionsByCategory()).map(
                  ([category, perms]) => (
                    <Card key={category}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center">
                          {getCategoryIcon(category)}
                          <span className="ml-2">{category}</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="grid gap-3">
                          {perms.map((permission) => (
                            <div
                              key={permission.id}
                              className="flex items-start space-x-3"
                            >
                              <Checkbox
                                id={`edit-${permission.id}`}
                                checked={formData.permissions.includes(
                                  permission.id
                                )}
                                onCheckedChange={(checked) =>
                                  handlePermissionChange(
                                    permission.id,
                                    checked as boolean
                                  )
                                }
                              />
                              <div className="grid gap-1.5 leading-none">
                                <label
                                  htmlFor={`edit-${permission.id}`}
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  {permission.name}
                                </label>
                                <p className="text-xs text-muted-foreground">
                                  {permission.description}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              取消
            </Button>
            <Button onClick={handleEditRole}>保存更改</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
