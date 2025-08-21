# EmailJS 配置说明

## 概述

EmailJS 是一个客户端邮件发送服务，允许直接从前端发送邮件，无需后端服务器。

## 配置步骤

### 1. 注册 EmailJS 账户

1. 访问 [EmailJS官网](https://www.emailjs.com/)
2. 点击 "Sign Up" 注册账户
3. 验证邮箱并登录

### 2. 创建邮件服务

1. 在 EmailJS 控制台中，点击 "Add New Service"
2. 选择邮件服务提供商（推荐 Gmail 或 Outlook）
3. 配置邮件服务：
   - **Service ID**: 自定义服务ID（如：service_ccpm360）
   - **邮箱账户**: 输入发件邮箱
   - **授权**: 完成OAuth授权

### 3. 创建邮件模板

1. 在控制台中点击 "Email Templates"
2. 点击 "Create New Template"
3. 配置模板：
   - **Template ID**: template_assessment_result
   - **Template Name**: CCPM360 评估结果
   - **Subject**: {{subject}}
   - **Content**: {{message}}

### 4. 获取 Public Key

1. 在控制台中点击 "Account"
2. 在 "API Keys" 部分找到 "Public Key"
3. 复制 Public Key

### 5. 更新项目配置

在 `src/lib/emailjs.ts` 文件中更新以下配置：

```typescript
const EMAILJS_CONFIG = {
  serviceId: 'your_service_id', // 步骤2中创建的Service ID
  templateId: 'template_assessment_result', // 步骤3中创建的Template ID
  publicKey: 'your_public_key', // 步骤4中获取的Public Key
};
```

## 腾讯企业邮箱配置（备选方案）

如果选择使用腾讯企业邮箱SMTP，需要在 `.env` 文件中配置：

```env
# 腾讯企业邮箱 SMTP 配置
EMAIL_HOST=smtp.exmail.qq.com
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USER=your_email@company.com
EMAIL_PASS=your_email_password
EMAIL_FROM=your_email@company.com
EMAIL_FROM_NAME=CCPM360 项目管理思维诊断
```

## 测试配置

配置完成后，可以通过以下方式测试：

1. 在浏览器控制台运行：

```javascript
// 测试EmailJS配置
fetch('/api/assessment/email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'assessment_result',
    recipientEmail: 'test@example.com',
    data: {
      /* 测试数据 */
    },
  }),
});
```

2. 检查邮件发送状态和错误日志

## 故障排除

### 常见错误

1. **Public Key is invalid**: 检查Public Key是否正确复制
2. **Service ID not found**: 确认Service ID与EmailJS控制台中的一致
3. **Template ID not found**: 确认Template ID与EmailJS控制台中的一致
4. **Unauthorized**: 检查邮件服务的OAuth授权是否有效

### 调试技巧

1. 在浏览器开发者工具中查看网络请求
2. 检查EmailJS控制台中的发送历史
3. 查看应用日志中的错误信息

## 注意事项

1. **安全性**: EmailJS的Public Key可以在前端使用，但要注意防止滥用
2. **限制**: 免费版EmailJS有发送数量限制
3. **备份方案**: 建议同时配置SMTP作为备用邮件发送方式
4. **监控**: 定期检查邮件发送状态和成功率

## 联系支持

如果遇到配置问题，可以：

1. 查看 [EmailJS官方文档](https://www.emailjs.com/docs/)
2. 联系技术支持团队
3. 查看项目的GitHub Issues
