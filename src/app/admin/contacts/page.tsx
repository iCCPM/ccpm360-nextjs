'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  Mail,
  Phone,
  Calendar,
  Eye,
  Trash2,
  MessageSquare,
  User,
  Building,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  subject: string;
  message: string;
  status: 'new' | 'replied' | 'closed';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  repliedAt?: string | undefined;
}

const mockContacts: Contact[] = [
  {
    id: '1',
    name: '张三',
    email: 'zhangsan@example.com',
    phone: '13800138000',
    company: '科技有限公司',
    subject: '咨询项目管理服务',
    message: '我们公司正在寻找专业的项目管理服务，希望能够了解更多详情。',
    status: 'new',
    priority: 'high',
    createdAt: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    name: '李四',
    email: 'lisi@example.com',
    phone: '13900139000',
    company: '创新科技',
    subject: '合作咨询',
    message: '希望与贵公司建立长期合作关系，探讨技术合作的可能性。',
    status: 'replied',
    priority: 'medium',
    createdAt: '2024-01-14T14:20:00Z',
    repliedAt: '2024-01-14T16:45:00Z',
  },
];

const statusOptions = [
  { value: 'all', label: '全部状态' },
  { value: 'new', label: '新消息' },
  { value: 'replied', label: '已回复' },
  { value: 'closed', label: '已关闭' },
];

const priorityOptions = [
  { value: 'all', label: '全部优先级' },
  { value: 'high', label: '高优先级' },
  { value: 'medium', label: '中优先级' },
  { value: 'low', label: '低优先级' },
];

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>(mockContacts);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);

  // 加载联系人数据
  const loadContacts = async () => {
    setLoading(true);
    try {
      // TODO: 从API加载联系人数据
      console.log('加载联系人数据');
      // setContacts(data);
    } catch (error) {
      console.error('加载联系人失败:', error);
      toast.error('加载联系人失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  // 过滤联系人
  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch =
      contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.subject.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || contact.status === statusFilter;
    const matchesPriority =
      priorityFilter === 'all' || contact.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  // 获取状态标签样式
  const getStatusBadge = (status: Contact['status']) => {
    const styles = {
      new: 'bg-red-100 text-red-800',
      replied: 'bg-blue-100 text-blue-800',
      closed: 'bg-gray-100 text-gray-800',
    };

    const labels = {
      new: '新消息',
      replied: '已回复',
      closed: '已关闭',
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}
      >
        {labels[status]}
      </span>
    );
  };

  // 获取优先级标签样式
  const getPriorityBadge = (priority: Contact['priority']) => {
    const styles = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800',
    };

    const labels = {
      high: '高',
      medium: '中',
      low: '低',
    };

    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${styles[priority]}`}
      >
        {labels[priority]}
      </span>
    );
  };

  // 更新联系人状态
  const updateContactStatus = async (
    contactId: string,
    newStatus: Contact['status']
  ) => {
    try {
      // TODO: 调用API更新状态
      setContacts((prev) =>
        prev.map((contact) =>
          contact.id === contactId
            ? {
                ...contact,
                status: newStatus,
                repliedAt:
                  newStatus === 'replied'
                    ? new Date().toISOString()
                    : undefined,
              }
            : contact
        )
      );
      toast.success('状态更新成功');
    } catch (error) {
      console.error('更新状态失败:', error);
      toast.error('更新状态失败');
    }
  };

  // 删除联系人
  const deleteContact = async (contactId: string) => {
    if (!confirm('确定要删除这个联系人吗？')) return;

    try {
      // TODO: 调用API删除联系人
      setContacts((prev) => prev.filter((contact) => contact.id !== contactId));
      toast.success('联系人删除成功');
    } catch (error) {
      console.error('删除联系人失败:', error);
      toast.error('删除联系人失败');
    }
  };

  // 批量操作
  const handleBatchAction = async (action: string) => {
    if (selectedContacts.length === 0) {
      toast.error('请先选择要操作的联系人');
      return;
    }

    try {
      // TODO: 实现批量操作
      console.log(`批量${action}:`, selectedContacts);
      setSelectedContacts([]);
      toast.success(`批量${action}成功`);
    } catch (error) {
      console.error(`批量${action}失败:`, error);
      toast.error(`批量${action}失败`);
    }
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">联系管理</h1>
          <p className="text-gray-600 mt-1">管理客户联系信息和咨询</p>
        </div>

        <div className="flex space-x-3">
          <Link
            href="/admin/contacts/settings"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            联系设置
          </Link>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <MessageSquare className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    总联系数
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {contacts.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Mail className="h-6 w-6 text-red-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    新消息
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {contacts.filter((c) => c.status === 'new').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <MessageSquare className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    已回复
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {contacts.filter((c) => c.status === 'replied').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <MessageSquare className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    已关闭
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {contacts.filter((c) => c.status === 'closed').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 搜索和过滤 */}
      <div className="bg-white shadow rounded-lg">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* 搜索 */}
            <div className="md:col-span-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="搜索联系人、邮箱、公司或主题..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* 状态过滤 */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 优先级过滤 */}
            <div>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                {priorityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 批量操作 */}
          {selectedContacts.length > 0 && (
            <div className="mt-4 flex items-center space-x-3">
              <span className="text-sm text-gray-500">
                已选择 {selectedContacts.length} 个联系人
              </span>
              <button
                onClick={() => handleBatchAction('标记为已读')}
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                标记为已读
              </button>
              <button
                onClick={() => handleBatchAction('删除')}
                className="text-sm text-red-600 hover:text-red-500"
              >
                批量删除
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 联系人列表 */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {loading ? (
            <li className="px-6 py-4 text-center text-gray-500">加载中...</li>
          ) : filteredContacts.length === 0 ? (
            <li className="px-6 py-4 text-center text-gray-500">
              没有找到匹配的联系人
            </li>
          ) : (
            filteredContacts.map((contact) => (
              <li key={contact.id}>
                <div className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedContacts.includes(contact.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedContacts((prev) => [
                              ...prev,
                              contact.id,
                            ]);
                          } else {
                            setSelectedContacts((prev) =>
                              prev.filter((id) => id !== contact.id)
                            );
                          }
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-4"
                      />

                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              <User className="h-8 w-8 text-gray-400" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {contact.name}
                              </p>
                              <div className="flex items-center space-x-2 text-sm text-gray-500">
                                <Mail className="h-4 w-4" />
                                <span>{contact.email}</span>
                                {contact.phone && (
                                  <>
                                    <span>•</span>
                                    <Phone className="h-4 w-4" />
                                    <span>{contact.phone}</span>
                                  </>
                                )}
                                {contact.company && (
                                  <>
                                    <span>•</span>
                                    <Building className="h-4 w-4" />
                                    <span>{contact.company}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            {getStatusBadge(contact.status)}
                            {getPriorityBadge(contact.priority)}
                          </div>
                        </div>

                        <div className="mt-2">
                          <p className="text-sm font-medium text-gray-900">
                            {contact.subject}
                          </p>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {contact.message}
                          </p>
                        </div>

                        <div className="mt-2 flex items-center justify-between">
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>创建于 {formatDate(contact.createdAt)}</span>
                            {contact.repliedAt && (
                              <span className="ml-4">
                                回复于 {formatDate(contact.repliedAt)}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                /* TODO: 查看详情 */
                              }}
                              className="text-blue-600 hover:text-blue-500"
                            >
                              <Eye className="h-4 w-4" />
                            </button>

                            <select
                              value={contact.status}
                              onChange={(e) =>
                                updateContactStatus(
                                  contact.id,
                                  e.target.value as Contact['status']
                                )
                              }
                              className="text-sm border-gray-300 rounded"
                            >
                              <option value="new">新消息</option>
                              <option value="replied">已回复</option>
                              <option value="closed">已关闭</option>
                            </select>

                            <button
                              onClick={() => deleteContact(contact.id)}
                              className="text-red-600 hover:text-red-500"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
