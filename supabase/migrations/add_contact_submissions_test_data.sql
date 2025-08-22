-- 为contact_submissions表添加测试数据
INSERT INTO contact_submissions (
  name,
  email,
  phone,
  company,
  position,
  service_type,
  message,
  status,
  created_at
) VALUES 
(
  '张三',
  'zhangsan@example.com',
  '13800138001',
  '北京科技有限公司',
  '项目经理',
  '咨询服务',
  '我们公司正在寻找项目管理解决方案，希望了解更多关于CCPM360的信息。',
  'pending',
  NOW() - INTERVAL '2 days'
),
(
  '李四',
  'lisi@company.com',
  '13900139002',
  '上海创新企业',
  'CTO',
  '产品演示',
  '想要预约产品演示，了解CCPM360如何帮助我们提升项目效率。',
  'contacted',
  NOW() - INTERVAL '1 day'
),
(
  '王五',
  'wangwu@tech.com',
  '13700137003',
  '深圳技术公司',
  '技术总监',
  '技术支持',
  '我们团队对关键链项目管理很感兴趣，希望能够获得更详细的资料。',
  'resolved',
  NOW() - INTERVAL '3 hours'
),
(
  '赵六',
  'zhaoliu@business.com',
  '13600136004',
  '广州商务咨询',
  '业务经理',
  '咨询服务',
  '希望了解CCPM360的定价方案和实施周期。',
  'pending',
  NOW() - INTERVAL '5 hours'
),
(
  '钱七',
  'qianqi@startup.com',
  '13500135005',
  '杭州创业公司',
  'CEO',
  '试用申请',
  '作为初创公司，我们需要高效的项目管理工具，请提供试用版本。',
  'contacted',
  NOW() - INTERVAL '1 hour'
);