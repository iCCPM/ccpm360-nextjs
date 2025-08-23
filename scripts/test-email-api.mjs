// 测试邮件API端点
import fetch from 'node-fetch';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

async function testEmailAPI() {
  console.log('=== CCPM360 邮件API测试 ===\n');
  
  // 检查环境变量配置
  console.log('1. 检查环境变量配置...');
  const emailjsConfigured = !!(process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID && 
                              process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID && 
                              process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY);
  
  const smtpConfigured = !!(process.env.EMAIL_HOST && 
                           process.env.EMAIL_PORT && 
                           process.env.EMAIL_USER && 
                           process.env.EMAIL_PASS);
  
  console.log(`   EmailJS配置: ${emailjsConfigured ? '✅ 已配置' : '❌ 未配置'}`);
  console.log(`   SMTP配置: ${smtpConfigured ? '✅ 已配置' : '❌ 未配置'}`);
  
  if (!emailjsConfigured && !smtpConfigured) {
    console.log('\n❌ 邮件服务未配置，无法进行测试');
    console.log('请先配置EmailJS或SMTP邮件服务');
    return;
  }
  
  // 测试数据
  const testData = {
    userName: '测试用户',
    userEmail: 'test@example.com',
    assessmentType: 'CCPM成熟度评估',
    score: 85,
    maxScore: 100,
    dimensionScores: [
      { name: '项目管理基础', score: 80, maxScore: 100 },
      { name: '关键链应用', score: 90, maxScore: 100 },
      { name: '团队协作', score: 85, maxScore: 100 }
    ],
    recommendations: [
      '建议加强项目管理基础知识的学习',
      '继续深化关键链项目管理的实践应用',
      '提升团队沟通协作效率'
    ],
    completedAt: new Date().toISOString()
  };
  
  console.log('\n2. 测试邮件发送API...');
  console.log('   测试邮箱: test@example.com');
  console.log('   评估类型: CCPM成熟度评估');
  console.log('   综合得分: 85分');
  
  try {
    // 发送POST请求到邮件API
    const response = await fetch('http://localhost:3000/api/assessment/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('\n✅ 邮件发送成功!');
      console.log(`   状态: ${response.status}`);
      console.log(`   消息: ${result.message || '邮件已发送'}`);
      if (result.service) {
        console.log(`   使用服务: ${result.service}`);
      }
    } else {
      console.log('\n❌ 邮件发送失败!');
      console.log(`   状态: ${response.status}`);
      console.log(`   错误: ${result.error || '未知错误'}`);
      if (result.details) {
        console.log(`   详情: ${result.details}`);
      }
    }
  } catch (error) {
    console.log('\n❌ API请求失败!');
    console.log(`   错误: ${error.message}`);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 提示: 请确保开发服务器正在运行');
      console.log('   运行命令: npm run dev');
    }
  }
  
  console.log('\n=== 测试完成 ===');
  console.log('\n注意事项:');
  console.log('1. 请确保开发服务器正在运行 (npm run dev)');
  console.log('2. 请将测试邮箱地址替换为您的真实邮箱');
  console.log('3. 检查垃圾邮件文件夹');
  console.log('4. 如果使用EmailJS，请检查EmailJS控制台的发送记录');
}

// 运行测试
testEmailAPI().catch((error) => {
  console.error('测试过程中发生错误:', error);
  process.exit(1);
});