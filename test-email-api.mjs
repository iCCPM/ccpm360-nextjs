#!/usr/bin/env node

// 测试邮件API的脚本
console.log('🔍 检查邮件配置状态...');

// 检查EmailJS配置
const emailjsConfig = {
  serviceId: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
  templateId: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
  publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY,
};

const isEmailjsConfigured = Object.values(emailjsConfig).every(value => value && value.trim() !== '');
console.log('📧 EmailJS配置状态:', isEmailjsConfigured ? '✅ 已配置' : '❌ 未配置');

// 检查SMTP配置
const smtpConfig = {
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  user: process.env.SMTP_USER,
  pass: process.env.SMTP_PASS,
};

const isSmtpConfigured = Object.values(smtpConfig).every(value => value && value.trim() !== '');
console.log('📮 SMTP配置状态:', isSmtpConfigured ? '✅ 已配置' : '❌ 未配置');

if (!isEmailjsConfigured && !isSmtpConfigured) {
  console.log('⚠️  警告：EmailJS和SMTP都未配置，邮件发送功能将无法正常工作');
  console.log('请参考.env.local文件中的配置模板进行配置');
} else {
  console.log('✅ 邮件服务配置就绪');
  
  try {
    // 测试邮件发送API
    console.log('\n🧪 测试邮件发送API...');
    const testData = {
      type: 'assessment_result',
      recipientEmail: 'test@example.com',
      data: {
        name: '测试用户',
        email: 'test@example.com',
        totalScore: 85,
        dimensionScores: {
          time_management: 20,
          resource_coordination: 22,
          risk_control: 21,
          team_collaboration: 22
        },
        advice: {
          level: 'intermediate',
          levelDescription: '您在项目管理方面表现良好',
          overallAdvice: '您在项目管理方面表现良好，建议继续深入学习CCPM方法。',
          dimensionAdvice: [
            '时间管理：建议学习关键链缓冲管理',
            '资源协调：可以进一步优化资源分配策略'
          ],
          nextSteps: [
            '📚 阅读《关键链》一书，了解CCPM基础理论',
            '🎯 参加CCPM基础培训课程',
            '💼 联系我们获取免费的项目诊断服务'
          ]
        },
        completedAt: new Date().toISOString()
      },
      scheduleFollowUp: false
    };

    const response = await fetch('http://localhost:3000/api/assessment/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ 邮件发送API测试成功!');
      console.log('📧 响应:', result);
    } else {
      console.log('❌ 邮件发送API测试失败!');
      console.log('📧 状态码:', response.status);
      console.log('📧 错误信息:', result);
    }
  } catch (error) {
    console.error('❌ API测试过程中发生错误:', error.message);
  }
}

console.log('\n📋 配置总结:');
console.log('- EmailJS:', isEmailjsConfigured ? '可用' : '需要配置');
console.log('- SMTP:', isSmtpConfigured ? '可用' : '需要配置');
console.log('\n💡 如需配置邮件服务，请查看.env.local文件中的配置模板');