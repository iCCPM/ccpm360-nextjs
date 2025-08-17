'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, User, Tag } from 'lucide-react';
import { MDXRenderer } from '../../../components/MDXRenderer';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  publishDate: string;
  readTime: string;
  tags: string[];
  slug: string;
  content: string;
}

// 模拟博客文章数据
const mockBlogPosts: Record<string, BlogPost> = {
  'ccpm-methodology-deep-dive': {
    id: '1',
    title: '关键链项目管理（CCPM）方法论深度解析',
    excerpt:
      '深入探讨关键链项目管理的核心理念、实施方法和实际应用案例，包含动态图表演示。',
    author: 'CCPM专家团队',
    publishDate: '2024-01-15',
    readTime: '12分钟',
    tags: ['CCPM', '项目管理', '约束理论', '缓冲区管理'],
    slug: 'ccpm-methodology-deep-dive',
    content: `
# 关键链项目管理方法论深度解析

关键链项目管理（Critical Chain Project Management，简称CCPM）是由以色列物理学家艾利·高德拉特（Eliyahu M. Goldratt）在1997年提出的一种革命性项目管理方法论。本文将深入探讨CCPM的核心理念、实施步骤和实际应用案例。

## 什么是关键链项目管理？

CCPM是基于约束理论（Theory of Constraints, TOC）的项目管理方法，它不仅关注时间约束，更重要的是同时考虑资源约束。与传统的关键路径法（CPM）相比，CCPM提供了更加现实和有效的项目管理解决方案。

### 核心理念

1. **约束理论应用**：将约束理论应用到项目管理中，识别并管理项目中的关键约束
2. **缓冲区管理**：通过设置缓冲区来管理不确定性和风险
3. **资源优化**：避免资源冲突，提高资源利用率
4. **全局优化**：关注整个项目的成功，而非单个任务的完成

## 缓冲区管理策略

缓冲区是CCPM的核心概念之一。合理的缓冲区设置和管理是项目成功的关键因素。

### 缓冲区类型

- **项目缓冲区（Project Buffer）**：保护项目完成日期
- **汇入缓冲区（Feeding Buffer）**：保护关键链免受非关键链延误影响
- **资源缓冲区（Resource Buffer）**：确保关键资源在需要时可用

通过持续监控缓冲区消耗情况，项目经理可以及时采取纠正措施，确保项目按时交付。

## 资源优化与管理

在多项目环境中，资源冲突是导致项目延期的主要原因之一。CCPM通过资源平衡和优化，显著提高了项目执行效率。

### 实施建议与注意事项

#### 成功要素

1. **高层管理支持**：确保组织层面的支持和承诺
2. **团队培训**：对项目团队进行CCPM理论和实践培训
3. **工具支持**：选择合适的项目管理工具支持CCPM实施
4. **持续改进**：建立反馈机制，持续优化项目管理流程

#### 常见挑战

- **文化转变**：从传统项目管理思维向CCPM思维的转变
- **工具适配**：现有项目管理工具可能需要调整或更换
- **度量体系**：建立适合CCPM的项目绩效度量体系

## 实际应用案例

某制造企业在新产品开发中应用CCPM：

- **项目特点**：多部门协作，资源约束明显
- **关键改进**：
  - 建立跨部门资源共享机制
  - 实施严格的缓冲区管理
  - 优化关键资源配置

**结果**：项目交付时间缩短30%，资源利用率提升25%，项目成功率显著提高。

## 总结

CCPM作为一种先进的项目管理方法论，在处理复杂项目和多项目环境中展现出显著优势。通过合理应用约束理论、缓冲区管理和资源优化策略，企业可以显著提升项目管理效率和成功率。

成功实施CCPM需要组织的全面支持、团队的深入理解以及持续的实践改进。随着项目管理实践的不断发展，CCPM将继续为企业创造更大的价值。
    `,
  },
  'buffer-management-guide': {
    id: '2',
    title: '缓冲区管理：项目风险控制的关键',
    excerpt:
      '详细介绍CCPM中缓冲区的设置原理、计算方法和动态管理策略，包含实时监控图表。',
    author: 'CCPM专家团队',
    publishDate: '2024-01-20',
    readTime: '15分钟',
    tags: ['缓冲区管理', 'CCPM', '风险控制', '项目监控'],
    slug: 'buffer-management-guide',
    content: `
# 缓冲区管理：项目风险控制的关键

在关键链项目管理（CCPM）中，缓冲区管理是确保项目成功交付的核心机制。本文将深入探讨缓冲区的设置原理、计算方法和动态管理策略。

## 缓冲区的基本概念

缓冲区是CCPM中用于保护项目免受不确定性影响的时间储备。与传统项目管理中在每个任务上添加安全时间不同，CCPM将这些安全时间集中管理，形成缓冲区。

### 缓冲区的作用

1. **风险缓解**：吸收项目执行过程中的不确定性
2. **进度保护**：保护项目关键路径不受干扰
3. **资源协调**：为资源调配提供灵活性
4. **决策支持**：为项目管理决策提供数据支持

## 缓冲区类型详解

### 1. 项目缓冲区（Project Buffer）

项目缓冲区位于关键链的末端，保护项目的最终交付日期。

**计算方法**：
- 平方根法：√(∑(任务持续时间的平方))
- 切割粘贴法：将每个任务时间估算的50%作为缓冲区
- 经验法：基于历史数据和专家经验

### 2. 汇入缓冲区（Feeding Buffer）

汇入缓冲区保护关键链免受非关键链任务延误的影响。

**设置原则**：
- 在非关键链与关键链的汇合点设置
- 大小通常为非关键链总时间的25-50%
- 根据非关键链的复杂度和风险程度调整

### 3. 资源缓冲区（Resource Buffer）

资源缓冲区确保关键资源在需要时可用。

**管理要点**：
- 提前通知资源准备时间
- 建立资源替代方案
- 监控资源可用性状态

## 缓冲区计算实例

假设一个项目的关键链包含以下任务：

| 任务 | 持续时间（天） | 风险系数 |
|------|----------------|----------|
| A    | 10             | 0.3      |
| B    | 15             | 0.4      |
| C    | 8              | 0.2      |
| D    | 12             | 0.3      |

**平方根法计算**：
项目缓冲区 = √(10² + 15² + 8² + 12²) = √(100 + 225 + 64 + 144) = √533 ≈ 23天

## 缓冲区监控与管理

### 缓冲区状态分类

1. **绿色区域（0-33%消耗）**：正常状态，无需特别关注
2. **黄色区域（33-66%消耗）**：需要关注，准备应对措施
3. **红色区域（66-100%消耗）**：紧急状态，立即采取行动

### 管理策略

#### 绿色区域策略
- 继续按计划执行
- 定期监控进展
- 收集经验数据

#### 黄色区域策略
- 分析延误原因
- 评估后续风险
- 准备应急方案
- 增加监控频率

#### 红色区域策略
- 立即启动应急方案
- 调配额外资源
- 重新评估项目计划
- 向利益相关者报告

## 缓冲区管理最佳实践

### 1. 建立监控机制

- **实时监控**：建立缓冲区消耗的实时监控系统
- **定期报告**：制定缓冲区状态的定期报告机制
- **预警系统**：设置自动预警阈值

### 2. 团队协作

- **透明沟通**：确保团队了解缓冲区状态
- **责任分工**：明确缓冲区管理的责任人
- **培训教育**：提高团队对缓冲区管理的认识

### 3. 持续改进

- **数据分析**：分析历史缓冲区使用数据
- **流程优化**：基于经验优化缓冲区设置
- **工具升级**：使用先进的项目管理工具

## 常见问题与解决方案

### 问题1：缓冲区设置过大

**症状**：项目总是提前完成，缓冲区利用率低

**解决方案**：
- 重新评估风险评估方法
- 调整缓冲区计算参数
- 收集更准确的历史数据

### 问题2：缓冲区消耗过快

**症状**：项目早期就进入红色区域

**解决方案**：
- 分析根本原因
- 重新评估任务估算
- 增加资源投入
- 调整项目范围

### 问题3：缓冲区管理不当

**症状**：团队不重视缓冲区状态

**解决方案**：
- 加强培训教育
- 建立激励机制
- 改进沟通方式
- 提供管理工具

## 技术工具支持

### 推荐工具

1. **Microsoft Project**：支持CCPM插件
2. **Primavera P6**：内置缓冲区管理功能
3. **ProChain**：专业的CCPM管理软件
4. **自定义仪表板**：基于Excel或BI工具的定制方案

### 工具选择标准

- 缓冲区计算功能
- 实时监控能力
- 报告生成功能
- 团队协作支持
- 集成能力

## 总结

缓冲区管理是CCPM成功实施的关键要素。通过科学的缓冲区设置、有效的监控机制和及时的管理响应，项目团队可以显著提高项目成功率，降低项目风险。

成功的缓冲区管理需要：
- 准确的风险评估
- 科学的计算方法
- 有效的监控机制
- 及时的管理响应
- 持续的改进优化

随着项目管理实践的不断发展，缓冲区管理技术也在不断完善，为企业项目成功提供更强有力的保障。
    `,
  },
  'multi-project-resource-optimization': {
    id: '3',
    title: '多项目环境下的资源优化策略',
    excerpt:
      '探讨在多项目并行执行的复杂环境中，如何运用关键链方法优化资源配置，提高整体项目组合的执行效率。',
    author: 'CCPM专家团队',
    publishDate: '2024-01-05',
    readTime: '10分钟',
    tags: ['多项目管理', '资源优化', 'CCPM'],
    slug: 'multi-project-resource-optimization',
    content: `
# 多项目环境下的资源优化策略

在现代企业中，多项目并行执行已成为常态。如何在有限的资源约束下，最大化项目组合的整体价值，是项目管理面临的重大挑战。本文将探讨运用关键链项目管理（CCPM）方法进行多项目资源优化的策略和实践。

## 多项目环境的挑战

### 主要问题

1. **资源冲突**：多个项目争夺相同的关键资源
2. **优先级混乱**：缺乏清晰的项目优先级排序
3. **资源浪费**：资源在项目间频繁切换导致效率损失
4. **进度延误**：资源瓶颈导致整体项目组合延期
5. **管理复杂性**：多项目协调管理难度大

### 传统方法的局限性

- **局部优化**：各项目独立优化，忽视全局效果
- **资源超载**：资源分配超出实际能力
- **缺乏协调**：项目间缺乏有效协调机制
- **反应滞后**：问题发现和解决不及时

## CCPM在多项目管理中的应用

### 核心原则

1. **识别约束资源**：找出制约整个项目组合的关键资源
2. **全局优化**：从项目组合整体角度进行资源配置
3. **消除多任务**：减少资源在多个任务间的切换
4. **缓冲区保护**：设置适当的缓冲区保护关键路径

### 实施步骤

#### 第一步：资源能力分析

**目标**：明确各类资源的实际可用能力

**方法**：
- 统计各类资源的数量和技能水平
- 考虑资源的可用时间（扣除休假、培训等）
- 评估资源的工作效率和质量
- 建立资源能力矩阵

#### 第二步：项目优先级排序

**目标**：建立清晰的项目优先级体系

**评估维度**：
- 战略重要性
- 财务回报
- 风险程度
- 资源需求
- 时间紧迫性

**排序方法**：
- 层次分析法（AHP）
- 评分矩阵法
- 专家评议法

#### 第三步：关键资源识别

**目标**：找出制约项目组合的瓶颈资源

**分析方法**：
- 资源需求汇总分析
- 资源利用率计算
- 关键路径分析
- 瓶颈识别算法

#### 第四步：项目排程优化

**目标**：基于资源约束优化项目启动时间

**优化策略**：
- 错峰启动：避免资源需求高峰重叠
- 资源平衡：均衡资源在时间轴上的分布
- 关键链保护：确保关键资源的连续可用性

## 资源优化策略

### 1. 资源池化管理

**概念**：将分散的资源整合为统一的资源池

**优势**：
- 提高资源利用率
- 增强资源配置灵活性
- 降低资源闲置风险
- 便于统一管理和调度

**实施要点**：
- 建立资源共享机制
- 制定资源调配规则
- 建立资源技能数据库
- 实施资源绩效考核

### 2. 关键资源保护

**策略**：优先保障关键资源的有效利用

**措施**：
- 减少关键资源的非核心工作
- 为关键资源配备支持团队
- 建立关键资源的替代方案
- 实施关键资源的专项管理

### 3. 资源能力提升

**目标**：通过能力建设缓解资源约束

**方法**：
- 技能培训：提升现有资源的技能水平
- 交叉培训：培养多技能复合型人才
- 知识管理：建立知识共享平台
- 外部合作：引入外部专业资源

### 4. 工作流程优化

**重点**：消除资源浪费和效率损失

**措施**：
- 标准化作业流程
- 自动化重复性工作
- 优化工作交接流程
- 减少不必要的会议和报告

## 实施案例分析

### 案例背景

某软件公司同时进行5个产品开发项目，面临严重的资源冲突问题：
- 高级开发工程师严重不足
- 项目进度普遍延期
- 资源利用率低下
- 团队士气下降

### 解决方案

#### 1. 资源现状分析

- 高级开发工程师：8人，实际可用时间80%
- 中级开发工程师：15人，实际可用时间85%
- 测试工程师：6人，实际可用时间90%
- UI设计师：3人，实际可用时间75%

#### 2. 项目优先级重排

基于战略重要性和市场紧迫性，重新排列项目优先级：
1. 核心产品升级项目
2. 新市场拓展项目
3. 客户定制项目A
4. 内部工具优化项目
5. 客户定制项目B

#### 3. 资源配置优化

- **错峰启动**：按优先级顺序错峰启动项目
- **资源专注**：高级工程师专注于关键任务
- **技能提升**：中级工程师承担更多责任
- **外部支持**：部分测试工作外包

### 实施效果

- **项目按时交付率**：从40%提升到85%
- **资源利用率**：从65%提升到82%
- **项目周期**：平均缩短25%
- **团队满意度**：显著提升

## 管理工具与技术

### 1. 项目组合管理软件

**推荐工具**：
- Microsoft Project Server
- Primavera EPPM
- Clarity PPM
- Smartsheet

**核心功能**：
- 资源容量规划
- 项目组合优化
- 实时资源监控
- 场景分析模拟

### 2. 资源管理仪表板

**关键指标**：
- 资源利用率
- 资源冲突预警
- 项目进度状态
- 缓冲区消耗情况

### 3. 协作平台

**功能需求**：
- 资源申请和审批
- 工作任务分配
- 进度报告和沟通
- 知识共享和协作

## 成功要素与注意事项

### 成功要素

1. **高层支持**：获得管理层的强力支持
2. **文化转变**：建立资源共享的企业文化
3. **流程规范**：建立标准化的管理流程
4. **工具支持**：选择合适的管理工具
5. **持续改进**：建立持续优化机制

### 注意事项

1. **避免过度优化**：保持适度的灵活性
2. **关注人员感受**：考虑资源调配对员工的影响
3. **渐进式实施**：分阶段推进，避免激进变革
4. **数据质量**：确保基础数据的准确性
5. **沟通协调**：加强各项目间的沟通协调

## 未来发展趋势

### 1. 人工智能应用

- 智能资源匹配
- 预测性资源规划
- 自动化调度优化
- 风险预警系统

### 2. 敏捷项目管理融合

- 敏捷资源配置
- 迭代式优化
- 快速响应变化
- 持续价值交付

### 3. 云端协作平台

- 实时资源共享
- 全球化资源配置
- 弹性资源扩展
- 数据驱动决策

## 总结

多项目环境下的资源优化是一个复杂的系统工程，需要综合运用CCPM理论、管理工具和组织变革等多种手段。成功的资源优化不仅能提高项目执行效率，还能增强企业的竞争优势。

关键成功因素包括：
- 准确的资源能力评估
- 科学的项目优先级排序
- 有效的资源配置策略
- 强有力的执行保障
- 持续的监控和改进

随着技术的不断发展，多项目资源优化将变得更加智能化和自动化，为企业创造更大的价值。
    `,
  },
};

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    // 模拟数据加载
    setTimeout(() => {
      const foundPost = mockBlogPosts[slug];
      if (foundPost) {
        setPost(foundPost);
      } else {
        setNotFound(true);
      }
      setLoading(false);
    }, 500);
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2 mb-8"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-4 bg-gray-300 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">文章未找到</h1>
          <p className="text-xl text-gray-600 mb-8">
            抱歉，您访问的文章不存在。
          </p>
          <Link
            href="/blog"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回博客列表
          </Link>
        </div>
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 返回按钮 */}
        <div className="mb-8">
          <Link
            href="/blog"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回博客列表
          </Link>
        </div>

        {/* 文章头部 */}
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-6">
            <div className="flex items-center">
              <User className="w-4 h-4 mr-2" />
              <span>{post.author}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              <span>{post.publishDate}</span>
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              <span>{post.readTime}</span>
            </div>
          </div>

          {/* 标签 */}
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
              >
                <Tag className="w-3 h-3 mr-1" />
                {tag}
              </span>
            ))}
          </div>
        </header>

        {/* 文章内容 */}
        <article className="bg-white rounded-lg shadow-sm p-8 lg:p-12">
          <div className="prose prose-lg max-w-none">
            <MDXRenderer content={post.content} />
          </div>
        </article>

        {/* 文章底部 */}
        <footer className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <Link
              href="/blog"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回博客列表
            </Link>

            <div className="text-sm text-gray-500">
              发布于 {post.publishDate}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
