'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import RichTextEditor from '@/components/ui/rich-text-editor';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Search, Filter } from 'lucide-react';

interface Question {
  id: number;
  question: string;
  options: (string | { text: string; score?: number })[];
  correct_answer: string;
  category: string;
  explanation?: string;
}

interface QuestionsResponse {
  questions: Question[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const categories = [
  { value: 'all', label: '全部分类' },
  { value: '时间管理', label: '时间管理' },
  { value: '资源协调', label: '资源协调' },
  { value: '风险控制', label: '风险控制' },
  { value: '团队协作', label: '团队协作' },
];

const answerOptions = [
  { value: 'A', label: 'A' },
  { value: 'B', label: 'B' },
  { value: 'C', label: 'C' },
  { value: 'D', label: 'D' },
];

export default function QuestionsManagement() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  // 表单状态
  const [formData, setFormData] = useState<{
    question: string;
    options: (string | { text: string; score?: number })[];
    correct_answer: string;
    category: string;
    explanation: string;
  }>({
    question: '',
    options: ['', '', '', ''],
    correct_answer: '',
    category: '',
    explanation: '',
  });

  // 认证检查
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/admin/login');
    }
  }, [user, authLoading, router]);

  // 获取题目列表
  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
      });

      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }

      const response = await fetch(`/api/admin/questions?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch questions');
      }

      const data: QuestionsResponse = await response.json();
      setQuestions(data.questions);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast.error('获取题目列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && !authLoading) {
      fetchQuestions();
    }
  }, [currentPage, selectedCategory, user, authLoading]);

  // 如果正在加载认证状态或用户未登录，显示加载状态
  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">正在验证登录状态...</p>
        </div>
      </div>
    );
  }

  // 重置表单
  const resetForm = () => {
    setFormData({
      question: '',
      options: ['', '', '', ''], // 确保始终有4个空选项
      correct_answer: '',
      category: '',
      explanation: '',
    });
  };

  // 创建题目
  const handleCreate = async () => {
    try {
      const response = await fetch('/api/admin/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create question');
      }

      toast.success('题目创建成功');
      setIsCreateDialogOpen(false);
      resetForm();
      fetchQuestions();
    } catch (error) {
      console.error('Error creating question:', error);
      toast.error(error instanceof Error ? error.message : '创建题目失败');
    }
  };

  // 编辑题目
  const handleEdit = (question: Question) => {
    setEditingQuestion(question);
    // 确保options转换为字符串数组
    const optionsAsStrings = question.options.map((option) =>
      typeof option === 'string' ? option : option.text || ''
    );
    // 确保options数组始终有4个元素，不足则用空字符串补齐
    const normalizedOptions = [...optionsAsStrings];
    while (normalizedOptions.length < 4) {
      normalizedOptions.push('');
    }
    // 如果超过4个元素，只取前4个
    const finalOptions = normalizedOptions.slice(0, 4);

    setFormData({
      question: question.question,
      options: finalOptions,
      correct_answer: question.correct_answer,
      category: question.category,
      explanation: question.explanation || '',
    });
    setIsEditDialogOpen(true);
  };

  // 更新题目
  const handleUpdate = async () => {
    if (!editingQuestion) return;

    try {
      const response = await fetch('/api/admin/questions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingQuestion.id,
          ...formData,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update question');
      }

      toast.success('题目更新成功');
      setIsEditDialogOpen(false);
      setEditingQuestion(null);
      resetForm();
      fetchQuestions();
    } catch (error) {
      console.error('Error updating question:', error);
      toast.error(error instanceof Error ? error.message : '更新题目失败');
    }
  };

  // 删除题目
  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/admin/questions?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete question');
      }

      toast.success('题目删除成功');
      fetchQuestions();
    } catch (error) {
      console.error('Error deleting question:', error);
      toast.error('删除题目失败');
    }
  };

  // 过滤题目
  const filteredQuestions = questions.filter((question) =>
    question.question.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">题库管理</h1>
          <p className="text-gray-600 mt-2">管理项目管理理念测试的题目</p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              添加题目
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>添加新题目</DialogTitle>
              <DialogDescription>
                创建一个新的项目管理理念测试题目
              </DialogDescription>
            </DialogHeader>

            <QuestionForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleCreate}
              onCancel={() => setIsCreateDialogOpen(false)}
              submitLabel="创建题目"
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* 筛选和搜索 */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="搜索题目内容..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 题目列表 */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">加载中...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredQuestions.map((question) => (
            <Card key={question.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">
                      <div
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: question.question }}
                      />
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary">{question.category}</Badge>
                      <Badge variant="outline">
                        正确答案: {question.correct_answer}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(question)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>确认删除</AlertDialogTitle>
                          <AlertDialogDescription>
                            确定要删除这个题目吗？此操作无法撤销。
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>取消</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(question.id)}
                          >
                            删除
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {question.options
                    .filter((option) => {
                      // 过滤掉空选项、null、undefined和无效对象
                      if (!option) return false;
                      if (typeof option === 'string') {
                        return option.trim() !== '';
                      }
                      if (typeof option === 'object' && option !== null) {
                        return (
                          option.text &&
                          typeof option.text === 'string' &&
                          option.text.trim() !== ''
                        );
                      }
                      return false;
                    })
                    .map((option, filteredIndex) => {
                      // 找到原始索引以确定正确答案
                      const originalIndex = question.options.findIndex(
                        (opt) => {
                          if (
                            typeof opt === 'string' &&
                            typeof option === 'string'
                          ) {
                            return opt === option;
                          }
                          if (
                            typeof opt === 'object' &&
                            opt !== null &&
                            typeof option === 'object' &&
                            option !== null
                          ) {
                            return opt.text === option.text;
                          }
                          return false;
                        }
                      );

                      // 安全获取选项文本
                      const optionText =
                        typeof option === 'string'
                          ? option
                          : option?.text || '';

                      return (
                        <div
                          key={filteredIndex}
                          className={`p-2 rounded border ${
                            String.fromCharCode(65 + originalIndex) ===
                            question.correct_answer
                              ? 'bg-green-50 border-green-200'
                              : 'bg-gray-50'
                          }`}
                        >
                          <span className="font-medium">
                            {String.fromCharCode(65 + filteredIndex)}.{' '}
                          </span>
                          {optionText}
                        </div>
                      );
                    })}
                </div>

                {question.explanation && (
                  <div className="mt-4 p-3 bg-blue-50 rounded">
                    <div className="text-sm text-blue-800">
                      <strong>解释：</strong>
                      <div
                        className="prose prose-sm max-w-none mt-1 text-blue-800"
                        dangerouslySetInnerHTML={{
                          __html: question.explanation,
                        }}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {filteredQuestions.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-600">没有找到匹配的题目</p>
            </div>
          )}
        </div>
      )}

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            上一页
          </Button>

          <span className="flex items-center px-4">
            第 {currentPage} 页，共 {totalPages} 页
          </span>

          <Button
            variant="outline"
            onClick={() =>
              setCurrentPage((prev) => Math.min(totalPages, prev + 1))
            }
            disabled={currentPage === totalPages}
          >
            下一页
          </Button>
        </div>
      )}

      {/* 编辑对话框 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>编辑题目</DialogTitle>
            <DialogDescription>修改题目内容和选项</DialogDescription>
          </DialogHeader>

          <QuestionForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleUpdate}
            onCancel={() => {
              setIsEditDialogOpen(false);
              setEditingQuestion(null);
            }}
            submitLabel="更新题目"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// 题目表单组件
interface QuestionFormProps {
  formData: {
    question: string;
    options: (string | { text: string; score?: number })[];
    correct_answer: string;
    category: string;
    explanation: string;
  };
  setFormData: (data: any) => void;
  onSubmit: () => void;
  onCancel: () => void;
  submitLabel: string;
}

function QuestionForm({
  formData,
  setFormData,
  onSubmit,
  onCancel,
  submitLabel,
}: QuestionFormProps) {
  const updateOption = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  // 修改验证逻辑：只验证非空选项，确保至少有2个选项有内容
  const nonEmptyOptions = formData.options.filter((opt) => {
    if (!opt) return false;
    if (typeof opt === 'string') {
      return opt.trim().length > 0;
    }
    if (typeof opt === 'object' && opt !== null) {
      return (
        opt.text && typeof opt.text === 'string' && opt.text.trim().length > 0
      );
    }
    return false;
  });

  const isValid =
    formData.question &&
    nonEmptyOptions.length >= 2 &&
    formData.correct_answer &&
    formData.category;

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="question">题目内容 *</Label>
        <div className="mt-1">
          <RichTextEditor
            value={formData.question}
            onChange={(value) => setFormData({ ...formData, question: value })}
            placeholder="请输入题目内容..."
          />
        </div>
      </div>

      <div>
        <Label>选项 *</Label>
        <div className="space-y-2 mt-1">
          {formData.options.map((option, index) => (
            <div key={index}>
              <Label htmlFor={`option-${index}`} className="text-sm">
                选项 {String.fromCharCode(65 + index)}
              </Label>
              <Input
                id={`option-${index}`}
                placeholder={`请输入选项${String.fromCharCode(65 + index)}...`}
                value={typeof option === 'string' ? option : option?.text || ''}
                onChange={(e) => updateOption(index, e.target.value)}
                className="mt-1"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="correct_answer">正确答案 *</Label>
          <Select
            value={formData.correct_answer}
            onValueChange={(value) =>
              setFormData({ ...formData, correct_answer: value })
            }
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="选择正确答案" />
            </SelectTrigger>
            <SelectContent>
              {answerOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="category">分类 *</Label>
          <Select
            value={formData.category}
            onValueChange={(value) =>
              setFormData({ ...formData, category: value })
            }
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="选择分类" />
            </SelectTrigger>
            <SelectContent>
              {categories.slice(1).map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="explanation">解释说明</Label>
        <div className="mt-1">
          <RichTextEditor
            value={formData.explanation}
            onChange={(value) =>
              setFormData({ ...formData, explanation: value })
            }
            placeholder="可选：为什么这个答案是正确的..."
          />
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          取消
        </Button>
        <Button onClick={onSubmit} disabled={!isValid}>
          {submitLabel}
        </Button>
      </DialogFooter>
    </div>
  );
}
