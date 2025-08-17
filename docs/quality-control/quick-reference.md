# 质量控制快速参考指南

## 🚀 常用命令

### 部署前检查

```bash
# 完整质控检查（推荐）
npm run pre-deploy

# 快速检查（跳过测试）
npm run pre-deploy:quick

# 分步执行
npm run lint           # ESLint检查
npm run type-check     # TypeScript类型检查
npm run test:run       # 运行测试
npm run build          # 构建验证
```

### 代码质量

```bash
# 自动修复ESLint问题
npm run lint:fix

# 格式化代码
npm run format

# 检查代码格式
npm run format:check
```

### 安全检查

```bash
# 依赖安全扫描
npm run security:audit

# 自动修复安全问题
npm run security:fix
```

### 测试相关

```bash
# 运行所有测试
npm run test

# 运行测试（一次性）
npm run test:run

# 组件测试
npm run test:components

# 测试覆盖率
npm run test:coverage

# 测试UI界面
npm run test:ui
```

## ⚡ 快速故障排除

### 构建失败

| 错误类型       | 快速解决                               |
| -------------- | -------------------------------------- |
| 模块未找到     | 检查文件路径和导入语句                 |
| TypeScript错误 | 运行 `npm run type-check` 查看详细错误 |
| 依赖问题       | 运行 `npm ci` 重新安装依赖             |

### 测试失败

| 错误类型     | 快速解决                           |
| ------------ | ---------------------------------- |
| 快照不匹配   | 运行 `npm run test -- -u` 更新快照 |
| 异步测试超时 | 增加 `timeout` 或使用 `waitFor`    |
| 模拟失败     | 检查 mock 配置和数据               |

### 安全问题

| 问题类型 | 快速解决                    |
| -------- | --------------------------- |
| 依赖漏洞 | 运行 `npm run security:fix` |
| 敏感信息 | 移除硬编码，使用环境变量    |
| 权限问题 | 检查 Supabase RLS 规则      |

## 📋 提交前检查清单

### 必须项 ✅

- [ ] `npm run lint` 通过
- [ ] `npm run type-check` 通过
- [ ] `npm run test:run` 通过
- [ ] `npm run build` 成功
- [ ] 手动测试关键功能

### 推荐项 📝

- [ ] `npm run format` 代码格式化
- [ ] `npm run security:audit` 安全检查
- [ ] 更新相关文档
- [ ] 编写或更新测试用例

## 🔧 Git钩子说明

### Pre-commit（提交前）

- 自动格式化代码
- 运行ESLint检查
- 执行快速测试

### Pre-push（推送前）

- 执行完整质控检查
- 失败时阻止推送
- 显示详细错误信息

## 🚨 紧急情况处理

### 跳过Git钩子（谨慎使用）

```bash
# 跳过pre-commit钩子
git commit --no-verify -m "紧急修复"

# 跳过pre-push钩子
git push --no-verify
```

### 快速修复常见问题

```bash
# 修复格式问题
npm run format && npm run lint:fix

# 重新安装依赖
rm -rf node_modules package-lock.json
npm install

# 清理构建缓存
rm -rf .next
npm run build
```

## 📞 获取帮助

1. **查看详细文档**: `docs/quality-control/README.md`
2. **项目质控文档**: `QUALITY_CONTROL.md`
3. **开发指南**: `DEVELOPMENT_GUIDE.md`
4. **GitHub Issues**: 提交问题和建议
5. **团队讨论**: 联系技术负责人

## 🎯 最佳实践提醒

- 🔄 **频繁提交**: 小步快跑，避免大批量修改
- 🧪 **测试驱动**: 先写测试，再写实现
- 📝 **文档同步**: 代码变更时同步更新文档
- 🔒 **安全优先**: 定期检查依赖安全性
- 🚀 **性能关注**: 关注构建大小和运行性能

---

**记住**: 质量控制是为了提高开发效率，而不是阻碍开发进度！
