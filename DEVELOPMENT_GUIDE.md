# 开发指南 - 避免部署失败

本指南旨在帮助开发者建立良好的开发习惯，避免推送后部署失败的情况。

## 🚀 推送前必须执行的检查流程

### 1. 本地代码质量检查

在每次推送代码前，请务必执行以下命令：

```bash
# 完整的代码检查流程
npm run check

# 或者分步执行：
npm run lint          # ESLint 代码规范检查
npm run type-check    # TypeScript 类型检查
npm run build         # 构建验证
```

### 2. 自动化检查（Pre-commit Hooks）

项目已配置 pre-commit hooks，每次提交时会自动执行：

- `lint-staged`: 对暂存文件进行格式化和 lint 检查
- `npm run lint`: ESLint 检查
- `npm run build`: 构建验证

如果任何检查失败，提交将被阻止。

### 3. 手动验证步骤

#### 3.1 TypeScript 类型安全

- 确保所有 TypeScript 错误已修复
- 检查新增的类型定义是否正确
- 验证导入路径和模块引用

#### 3.2 构建验证

- 确保 `npm run build` 成功完成
- 检查构建输出中是否有警告或错误
- 验证生成的 `.next` 目录结构正确

#### 3.3 依赖管理

- 检查 `package.json` 中的依赖版本
- 运行 `npm audit` 检查安全漏洞
- 确保新增依赖已正确安装

## 🛠️ 开发环境配置

### 必需工具

- Node.js 18+ 或 20+
- npm 或 pnpm
- Git

### 推荐的 IDE 配置

- VSCode + TypeScript 扩展
- ESLint 扩展
- Prettier 扩展
- 启用保存时自动格式化

## 📋 常见问题和解决方案

### 1. TypeScript 类型错误

**问题**: 部署时出现类型错误
**解决**:

- 本地运行 `npm run type-check`
- 修复所有类型错误
- 确保 `tsconfig.json` 配置正确

### 2. ESLint 规范错误

**问题**: 代码不符合 ESLint 规范
**解决**:

- 运行 `npm run lint -- --fix` 自动修复
- 手动修复无法自动修复的问题

### 3. 构建失败

**问题**: `npm run build` 失败
**解决**:

- 检查环境变量配置
- 验证所有导入路径
- 确保所有依赖已正确安装

### 4. 依赖冲突

**问题**: 依赖版本冲突或缺失
**解决**:

- 删除 `node_modules` 和 `package-lock.json`
- 重新运行 `npm install`
- 检查 `package.json` 中的依赖版本

## 🔄 CI/CD 流程

### GitHub Actions 自动检查

项目配置了 GitHub Actions，会在以下情况自动运行：

- 推送到 `main` 或 `develop` 分支
- 创建 Pull Request 到 `main` 分支

### 检查内容

- 多版本 Node.js 兼容性测试（18.x, 20.x）
- ESLint 代码规范检查
- TypeScript 类型检查
- 构建验证
- 安全漏洞扫描

## 📝 最佳实践

### 1. 提交规范

- 使用清晰的提交信息
- 每次提交包含单一功能或修复
- 避免提交大量文件的混合更改

### 2. 分支管理

- 从 `develop` 分支创建功能分支
- 完成开发后创建 PR 到 `develop`
- 定期将 `develop` 合并到 `main`

### 3. 代码审查

- 所有 PR 都应经过代码审查
- 确保 CI 检查全部通过
- 测试新功能的完整性

### 4. 环境变量管理

- 本地使用 `.env.local`
- 生产环境在 Vercel 中配置
- 敏感信息使用 GitHub Secrets

## 🚨 紧急修复流程

如果部署后发现问题：

1. **立即回滚**: 在 Vercel 控制台回滚到上一个稳定版本
2. **本地修复**: 在本地环境修复问题
3. **完整测试**: 执行完整的检查流程
4. **重新部署**: 推送修复后的代码

## 📞 支持和帮助

如果遇到问题：

1. 查看本文档的常见问题部分
2. 检查 GitHub Actions 的错误日志
3. 联系项目维护者

---

**记住**: 预防胜于治疗。花费几分钟进行本地检查，可以避免部署失败和生产环境问题。
