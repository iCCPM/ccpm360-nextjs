# 质控系统使用指南

## 概述

本项目已建立完整的质量控制系统，确保代码在提交和部署前满足质量标准。

## 质控系统组成

### 1. 核心文档

- `QUALITY_CONTROL.md` - 项目根目录的质控流程文档
- `docs/quality-control/README.md` - 详细的质控流程说明
- `docs/quality-control/quick-reference.md` - 快速参考指南

### 2. 自动化脚本

- `scripts/pre-deploy-check.js` - 部署前自动化检查脚本
- `package.json` 中的 `pre-deploy` 命令

### 3. Git 钩子

- `.husky/pre-commit` - 提交前代码检查
- `.husky/pre-push` - 推送前质控检查

## 使用方法

### 日常开发

1. **提交代码时**

   ```bash
   git add .
   git commit -m "your message"
   ```

   - 自动触发 lint 检查
   - 自动格式化代码

2. **推送代码前**

   ```bash
   git push
   ```

   - 自动执行完整质控检查
   - 确保代码质量符合标准

### 手动质控检查

```bash
# 执行完整的部署前检查
npm run pre-deploy

# 单独执行各项检查
npm run lint          # 代码规范检查
npm run type-check    # TypeScript 类型检查
npm run test          # 单元测试
npm run test:components # 组件测试
npm run build         # 构建验证
```

## 检查项目

### 必需检查项

1. **环境变量检查** - 验证必需的环境变量
2. **依赖安全扫描** - 检查依赖包安全漏洞
3. **缺失组件检查** - 验证组件完整性
4. **package.json一致性** - 确保依赖文件同步

### 可选检查项

1. **ESLint 检查** - 代码规范和质量
2. **TypeScript 类型检查** - 类型安全
3. **代码格式化检查** - 代码格式一致性
4. **单元测试** - 功能正确性
5. **组件测试** - UI 组件测试
6. **构建验证** - 确保代码可以正常构建
7. **构建产物检查** - 验证构建输出

## 配置说明

### 修改检查项

编辑 `scripts/pre-deploy-check.js` 文件：

```javascript
const checks = [
  {
    name: '检查项名称',
    command: 'npm run command',
    required: true, // true=必需项，false=可选项
    description: '检查项描述',
  },
];
```

### 环境变量配置

在项目根目录创建 `.env.local` 文件：

```env
# 必需的环境变量
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 故障排除

### 常见问题

1. **质控检查失败**
   - 查看具体失败的检查项
   - 根据错误信息修复问题
   - 重新运行 `npm run pre-deploy`

2. **Git 钩子不工作**

   ```bash
   # 重新安装 husky
   npm run prepare
   ```

3. **依赖问题**
   ```bash
   # 重新安装依赖
   npm install
   ```

### 跳过检查（紧急情况）

```bash
# 跳过 pre-commit 钩子
git commit --no-verify -m "emergency fix"

# 跳过 pre-push 钩子
git push --no-verify
```

**注意：仅在紧急情况下使用，事后需要补充质控检查。**

## 团队协作

### 新成员入职

1. 克隆项目后运行：

   ```bash
   npm install
   npm run prepare  # 安装 Git 钩子
   ```

2. 配置环境变量（参考 `.env.example`）

3. 运行首次质控检查：
   ```bash
   npm run pre-deploy
   ```

### 持续改进

- 定期审查质控规则的有效性
- 根据项目需求调整检查项
- 收集团队反馈优化流程

## 相关文档

- [质控流程详细说明](./README.md)
- [快速参考指南](./quick-reference.md)
- [项目质控总览](../../QUALITY_CONTROL.md)
