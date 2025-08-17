'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { Progress } from '@/components/ui/progress';
import {
  Database,
  RefreshCw,
  Trash2,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle,
  XCircle,
  HardDrive,
  Activity,
  Clock,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';

interface DatabaseTable {
  name: string;
  rows: number;
  size: string;
  lastUpdated: string;
  status: 'healthy' | 'warning' | 'error';
}

interface DatabaseStats {
  totalSize: string;
  totalTables: number;
  totalRows: number;
  connections: number;
  uptime: string;
  version: string;
}

const mockTables: DatabaseTable[] = [
  {
    name: 'users',
    rows: 1234,
    size: '2.5 MB',
    lastUpdated: '2024-01-15 14:30:00',
    status: 'healthy',
  },
  {
    name: 'posts',
    rows: 5678,
    size: '15.2 MB',
    lastUpdated: '2024-01-15 13:45:00',
    status: 'healthy',
  },
  {
    name: 'cases',
    rows: 234,
    size: '8.7 MB',
    lastUpdated: '2024-01-15 12:20:00',
    status: 'healthy',
  },
  {
    name: 'resources',
    rows: 456,
    size: '12.3 MB',
    lastUpdated: '2024-01-15 11:15:00',
    status: 'warning',
  },
  {
    name: 'contacts',
    rows: 789,
    size: '1.8 MB',
    lastUpdated: '2024-01-15 10:30:00',
    status: 'healthy',
  },
  {
    name: 'sessions',
    rows: 123,
    size: '0.5 MB',
    lastUpdated: '2024-01-15 14:35:00',
    status: 'healthy',
  },
];

const mockStats: DatabaseStats = {
  totalSize: '45.2 MB',
  totalTables: 12,
  totalRows: 8514,
  connections: 5,
  uptime: '15天 8小时 32分钟',
  version: 'PostgreSQL 14.5',
};

const maintenanceTasks = [
  {
    id: '1',
    name: '清理过期会话',
    description: '删除超过30天的过期用户会话记录',
    lastRun: '2024-01-15 02:00:00',
    nextRun: '2024-01-16 02:00:00',
    status: 'scheduled',
  },
  {
    id: '2',
    name: '优化数据库索引',
    description: '重建和优化数据库索引以提高查询性能',
    lastRun: '2024-01-14 03:00:00',
    nextRun: '2024-01-21 03:00:00',
    status: 'scheduled',
  },
  {
    id: '3',
    name: '清理临时文件',
    description: '删除系统生成的临时文件和缓存',
    lastRun: '2024-01-15 01:00:00',
    nextRun: '2024-01-16 01:00:00',
    status: 'completed',
  },
];

export default function DatabasePage() {
  const [tables, setTables] = useState<DatabaseTable[]>(mockTables);
  const [stats] = useState<DatabaseStats>(mockStats);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);

  const getStatusIcon = (status: DatabaseTable['status']) => {
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

  const getStatusBadge = (status: DatabaseTable['status']) => {
    const variants = {
      healthy: 'default',
      warning: 'secondary',
      error: 'destructive',
    } as const;

    const labels = {
      healthy: '正常',
      warning: '警告',
      error: '错误',
    };

    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
  };

  const handleOptimizeDatabase = async () => {
    setIsOptimizing(true);
    try {
      // TODO: 实现数据库优化API调用
      await new Promise((resolve) => setTimeout(resolve, 3000));
      toast.success('数据库优化完成');
    } catch (error) {
      toast.error('数据库优化失败');
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleClearCache = async () => {
    setIsClearing(true);
    try {
      // TODO: 实现清理缓存API调用
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success('缓存清理完成');
    } catch (error) {
      toast.error('缓存清理失败');
    } finally {
      setIsClearing(false);
    }
  };

  const handleExportData = (tableName: string) => {
    // TODO: 实现数据导出功能
    toast.success(`正在导出 ${tableName} 表数据...`);
  };

  const handleTruncateTable = (tableName: string) => {
    // TODO: 实现清空表数据功能
    toast.success(`${tableName} 表数据已清空`);
    setSelectedTable(null);
  };

  const handleRunMaintenance = (taskId: string) => {
    // TODO: 实现维护任务执行
    toast.success('维护任务已启动');
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">数据管理</h1>
          <p className="text-muted-foreground">数据库管理和数据维护工具</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={handleClearCache}
            disabled={isClearing}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {isClearing ? '清理中...' : '清理缓存'}
          </Button>
          <Button onClick={handleOptimizeDatabase} disabled={isOptimizing}>
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isOptimizing ? 'animate-spin' : ''}`}
            />
            {isOptimizing ? '优化中...' : '优化数据库'}
          </Button>
        </div>
      </div>

      {/* 数据库统计 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">数据库大小</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSize}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalTables} 个表
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总记录数</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalRows.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">所有表记录总数</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">活跃连接</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.connections}</div>
            <p className="text-xs text-muted-foreground">当前数据库连接数</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">运行时间</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15天</div>
            <p className="text-xs text-muted-foreground">{stats.version}</p>
          </CardContent>
        </Card>
      </div>

      {/* 数据库表列表 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="mr-2 h-5 w-5" />
            数据库表
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>表名</TableHead>
                <TableHead>记录数</TableHead>
                <TableHead>大小</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>最后更新</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tables.map((table) => (
                <TableRow key={table.name}>
                  <TableCell>
                    <div className="flex items-center">
                      <Database className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{table.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{table.rows.toLocaleString()}</TableCell>
                  <TableCell>{table.size}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(table.status)}
                      {getStatusBadge(table.status)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {new Date(table.lastUpdated).toLocaleString()}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleExportData(table.name)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setSelectedTable(table.name)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>确认清空表数据</DialogTitle>
                            <DialogDescription>
                              您确定要清空表 "{table.name}"
                              的所有数据吗？此操作不可恢复。
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => setSelectedTable(null)}
                            >
                              取消
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => handleTruncateTable(table.name)}
                            >
                              确认清空
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* 维护任务 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <RefreshCw className="mr-2 h-5 w-5" />
              维护任务
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {maintenanceTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="space-y-1">
                    <h4 className="font-medium">{task.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {task.description}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <span>
                        上次运行: {new Date(task.lastRun).toLocaleString()}
                      </span>
                      <span>
                        下次运行: {new Date(task.nextRun).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant={
                        task.status === 'completed' ? 'default' : 'secondary'
                      }
                    >
                      {task.status === 'completed' ? '已完成' : '已计划'}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRunMaintenance(task.id)}
                    >
                      立即运行
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 数据库性能 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="mr-2 h-5 w-5" />
              性能监控
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>CPU使用率</span>
                  <span>23%</span>
                </div>
                <Progress value={23} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>内存使用率</span>
                  <span>67%</span>
                </div>
                <Progress value={67} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>磁盘I/O</span>
                  <span>45%</span>
                </div>
                <Progress value={45} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>网络I/O</span>
                  <span>12%</span>
                </div>
                <Progress value={12} className="h-2" />
              </div>
              <div className="pt-4 border-t">
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">查询/秒</span>
                    <span className="font-medium">1,234</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">慢查询</span>
                    <span className="font-medium">2</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">缓存命中率</span>
                    <span className="font-medium">98.5%</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 数据导入导出 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Upload className="mr-2 h-5 w-5" />
            数据导入导出
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <h4 className="font-medium">数据导出</h4>
              <p className="text-sm text-muted-foreground">
                导出数据库数据为SQL文件或CSV格式
              </p>
              <div className="flex space-x-2">
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  导出SQL
                </Button>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  导出CSV
                </Button>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-medium">数据导入</h4>
              <p className="text-sm text-muted-foreground">
                从SQL文件或CSV文件导入数据到数据库
              </p>
              <div className="flex space-x-2">
                <Button variant="outline">
                  <Upload className="mr-2 h-4 w-4" />
                  导入SQL
                </Button>
                <Button variant="outline">
                  <Upload className="mr-2 h-4 w-4" />
                  导入CSV
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
