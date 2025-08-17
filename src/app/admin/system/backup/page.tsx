'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  HardDrive,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar,
  Database,
  Settings,
  Play,
  Pause,
} from 'lucide-react';
import { toast } from 'sonner';

interface BackupRecord {
  id: string;
  name: string;
  type: 'full' | 'incremental' | 'differential';
  size: string;
  status: 'completed' | 'failed' | 'in_progress';
  createdAt: string;
  duration: string;
  description?: string;
}

interface BackupSettings {
  autoBackup: boolean;
  backupFrequency: string;
  backupTime: string;
  retentionDays: number;
  compressionEnabled: boolean;
  encryptionEnabled: boolean;
  backupLocation: string;
}

const mockBackups: BackupRecord[] = [
  {
    id: '1',
    name: 'backup_2024_01_15_full',
    type: 'full',
    size: '245.6 MB',
    status: 'completed',
    createdAt: '2024-01-15T02:00:00Z',
    duration: '5分32秒',
    description: '完整数据库备份',
  },
  {
    id: '2',
    name: 'backup_2024_01_14_incremental',
    type: 'incremental',
    size: '12.3 MB',
    status: 'completed',
    createdAt: '2024-01-14T02:00:00Z',
    duration: '1分15秒',
    description: '增量备份',
  },
  {
    id: '3',
    name: 'backup_2024_01_13_incremental',
    type: 'incremental',
    size: '8.7 MB',
    status: 'completed',
    createdAt: '2024-01-13T02:00:00Z',
    duration: '58秒',
    description: '增量备份',
  },
  {
    id: '4',
    name: 'backup_2024_01_12_failed',
    type: 'full',
    size: '0 MB',
    status: 'failed',
    createdAt: '2024-01-12T02:00:00Z',
    duration: '0秒',
    description: '备份失败 - 磁盘空间不足',
  },
  {
    id: '5',
    name: 'backup_2024_01_11_full',
    type: 'full',
    size: '238.9 MB',
    status: 'completed',
    createdAt: '2024-01-11T02:00:00Z',
    duration: '5分18秒',
    description: '完整数据库备份',
  },
];

const defaultSettings: BackupSettings = {
  autoBackup: true,
  backupFrequency: 'daily',
  backupTime: '02:00',
  retentionDays: 30,
  compressionEnabled: true,
  encryptionEnabled: false,
  backupLocation: '/var/backups/ccpm360',
};

const backupFrequencies = [
  { value: 'hourly', label: '每小时' },
  { value: 'daily', label: '每天' },
  { value: 'weekly', label: '每周' },
  { value: 'monthly', label: '每月' },
];

const backupTypes = [
  { value: 'full', label: '完整备份' },
  { value: 'incremental', label: '增量备份' },
  { value: 'differential', label: '差异备份' },
];

export default function BackupPage() {
  const [backups, setBackups] = useState<BackupRecord[]>(mockBackups);
  const [settings, setSettings] = useState<BackupSettings>(defaultSettings);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);
  const [selectedBackupType, setSelectedBackupType] = useState('full');
  const [selectedBackupForRestore, setSelectedBackupForRestore] = useState<
    string | null
  >(null);

  const getStatusIcon = (status: BackupRecord['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'in_progress':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: BackupRecord['status']) => {
    const variants = {
      completed: 'default',
      failed: 'destructive',
      in_progress: 'secondary',
    } as const;

    const labels = {
      completed: '已完成',
      failed: '失败',
      in_progress: '进行中',
    };

    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
  };

  const getTypeBadge = (type: BackupRecord['type']) => {
    const variants = {
      full: 'default',
      incremental: 'secondary',
      differential: 'outline',
    } as const;

    const labels = {
      full: '完整',
      incremental: '增量',
      differential: '差异',
    };

    return <Badge variant={variants[type]}>{labels[type]}</Badge>;
  };

  const handleCreateBackup = async () => {
    setIsCreatingBackup(true);
    setBackupProgress(0);

    try {
      // 模拟备份进度
      const interval = setInterval(() => {
        setBackupProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 500);

      // TODO: 实现创建备份API调用
      await new Promise((resolve) => setTimeout(resolve, 5000));

      const newBackup: BackupRecord = {
        id: Date.now().toString(),
        name: `backup_${new Date().toISOString().split('T')[0]}_${selectedBackupType}`,
        type: selectedBackupType as BackupRecord['type'],
        size: '156.7 MB',
        status: 'completed',
        createdAt: new Date().toISOString(),
        duration: '3分45秒',
        description: `${selectedBackupType === 'full' ? '完整' : selectedBackupType === 'incremental' ? '增量' : '差异'}备份`,
      };

      setBackups([newBackup, ...backups]);
      toast.success('备份创建成功');
    } catch (error) {
      toast.error('备份创建失败');
    } finally {
      setIsCreatingBackup(false);
      setBackupProgress(0);
    }
  };

  const handleRestoreBackup = async (backupId: string) => {
    setIsRestoring(true);
    try {
      // TODO: 实现恢复备份API调用
      await new Promise((resolve) => setTimeout(resolve, 3000));
      toast.success('数据恢复成功');
    } catch (error) {
      toast.error('数据恢复失败');
    } finally {
      setIsRestoring(false);
      setSelectedBackupForRestore(null);
    }
  };

  const handleDeleteBackup = (backupId: string) => {
    setBackups(backups.filter((backup) => backup.id !== backupId));
    toast.success('备份文件已删除');
  };

  const handleDownloadBackup = (backup: BackupRecord) => {
    // TODO: 实现下载备份文件功能
    toast.success(`正在下载 ${backup.name}...`);
  };

  const handleSaveSettings = async () => {
    try {
      // TODO: 实现保存备份设置API调用
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('备份设置已保存');
    } catch (error) {
      toast.error('保存设置失败');
    }
  };

  const updateSetting = (key: keyof BackupSettings, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">备份恢复</h1>
          <p className="text-muted-foreground">数据备份和系统恢复管理</p>
        </div>
        <div className="flex space-x-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="mr-2 h-4 w-4" />
                备份设置
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>备份设置</DialogTitle>
                <DialogDescription>配置自动备份和相关参数</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>自动备份</Label>
                    <p className="text-sm text-muted-foreground">
                      启用定时自动备份
                    </p>
                  </div>
                  <Switch
                    checked={settings.autoBackup}
                    onCheckedChange={(checked) =>
                      updateSetting('autoBackup', checked)
                    }
                  />
                </div>
                <Separator />
                <div className="grid gap-2">
                  <Label htmlFor="frequency">备份频率</Label>
                  <Select
                    value={settings.backupFrequency}
                    onValueChange={(value) =>
                      updateSetting('backupFrequency', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择备份频率" />
                    </SelectTrigger>
                    <SelectContent>
                      {backupFrequencies.map((freq) => (
                        <SelectItem key={freq.value} value={freq.value}>
                          {freq.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="backupTime">备份时间</Label>
                  <Input
                    id="backupTime"
                    type="time"
                    value={settings.backupTime}
                    onChange={(e) =>
                      updateSetting('backupTime', e.target.value)
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="retention">保留天数</Label>
                  <Input
                    id="retention"
                    type="number"
                    value={settings.retentionDays}
                    onChange={(e) =>
                      updateSetting('retentionDays', parseInt(e.target.value))
                    }
                    placeholder="30"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>启用压缩</Label>
                    <p className="text-sm text-muted-foreground">
                      压缩备份文件以节省空间
                    </p>
                  </div>
                  <Switch
                    checked={settings.compressionEnabled}
                    onCheckedChange={(checked) =>
                      updateSetting('compressionEnabled', checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>启用加密</Label>
                    <p className="text-sm text-muted-foreground">
                      加密备份文件以提高安全性
                    </p>
                  </div>
                  <Switch
                    checked={settings.encryptionEnabled}
                    onCheckedChange={(checked) =>
                      updateSetting('encryptionEnabled', checked)
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleSaveSettings}>保存设置</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <HardDrive className="mr-2 h-4 w-4" />
                创建备份
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>创建新备份</DialogTitle>
                <DialogDescription>
                  选择备份类型并创建数据备份
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="backupType">备份类型</Label>
                  <Select
                    value={selectedBackupType}
                    onValueChange={setSelectedBackupType}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择备份类型" />
                    </SelectTrigger>
                    <SelectContent>
                      {backupTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {isCreatingBackup && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>备份进度</span>
                      <span>{backupProgress}%</span>
                    </div>
                    <Progress value={backupProgress} className="h-2" />
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button
                  onClick={handleCreateBackup}
                  disabled={isCreatingBackup}
                >
                  {isCreatingBackup ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      创建中...
                    </>
                  ) : (
                    <>
                      <HardDrive className="mr-2 h-4 w-4" />
                      创建备份
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* 备份统计 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总备份数</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{backups.length}</div>
            <p className="text-xs text-muted-foreground">包含所有类型备份</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">成功备份</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {backups.filter((b) => b.status === 'completed').length}
            </div>
            <p className="text-xs text-muted-foreground">
              备份成功率{' '}
              {Math.round(
                (backups.filter((b) => b.status === 'completed').length /
                  backups.length) *
                  100
              )}
              %
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总大小</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">512.5 MB</div>
            <p className="text-xs text-muted-foreground">所有备份文件总大小</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">最新备份</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1天前</div>
            <p className="text-xs text-muted-foreground">
              {settings.autoBackup ? '自动备份已启用' : '自动备份已禁用'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 备份列表 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <HardDrive className="mr-2 h-5 w-5" />
            备份记录
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>备份名称</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>大小</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead>耗时</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {backups.map((backup) => (
                <TableRow key={backup.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{backup.name}</div>
                      {backup.description && (
                        <div className="text-sm text-muted-foreground">
                          {backup.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getTypeBadge(backup.type)}</TableCell>
                  <TableCell>{backup.size}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(backup.status)}
                      {getStatusBadge(backup.status)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {new Date(backup.createdAt).toLocaleString()}
                    </div>
                  </TableCell>
                  <TableCell>{backup.duration}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownloadBackup(backup)}
                        disabled={backup.status !== 'completed'}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={backup.status !== 'completed'}
                            onClick={() =>
                              setSelectedBackupForRestore(backup.id)
                            }
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>确认恢复数据</DialogTitle>
                            <DialogDescription>
                              您确定要从备份 "{backup.name}"
                              恢复数据吗？此操作将覆盖当前数据。
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => setSelectedBackupForRestore(null)}
                            >
                              取消
                            </Button>
                            <Button
                              onClick={() => handleRestoreBackup(backup.id)}
                              disabled={isRestoring}
                            >
                              {isRestoring ? (
                                <>
                                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                  恢复中...
                                </>
                              ) : (
                                '确认恢复'
                              )}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteBackup(backup.id)}
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

      {/* 备份计划 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            备份计划
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <h4 className="font-medium">每日自动备份</h4>
                <p className="text-sm text-muted-foreground">
                  每天 {settings.backupTime} 执行完整数据库备份
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant={settings.autoBackup ? 'default' : 'secondary'}>
                  {settings.autoBackup ? '已启用' : '已禁用'}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    updateSetting('autoBackup', !settings.autoBackup)
                  }
                >
                  {settings.autoBackup ? (
                    <>
                      <Pause className="mr-2 h-4 w-4" />
                      暂停
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      启用
                    </>
                  )}
                </Button>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3 text-sm">
              <div className="space-y-1">
                <span className="text-muted-foreground">下次备份时间</span>
                <div className="font-medium">
                  {settings.autoBackup
                    ? `明天 ${settings.backupTime}`
                    : '未计划'}
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground">备份保留期</span>
                <div className="font-medium">{settings.retentionDays} 天</div>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground">存储位置</span>
                <div className="font-medium">{settings.backupLocation}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
