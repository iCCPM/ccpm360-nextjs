// 首先加载环境变量
import dotenv from 'dotenv';
dotenv.config();

import {
  sendServerEmail,
  isServerEmailConfigured,
  generateAssessmentEmailHTML,
} from './src/lib/server-email.ts';
// import { generateAssessmentPDF } from './src/lib/pdfGenerator.ts'; // 暂时注释掉，因为文件不存在
import path from 'path';
import fs from 'fs';

// 测试邮件发送功能
async function testEmailSending() {
  console.log('=== CCPM360 邮件发送测试 ===\n');

  // 调试：打印环境变量
  console.log('调试信息:');
  console.log('EMAIL_USER:', process.env.EMAIL_USER);
  console.log(
    'EMAIL_PASS:',
    process.env.EMAIL_PASS ? '***已设置***' : '未设置'
  );
  console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
  console.log('');

  // 1. 检查服务器邮件配置
  console.log('1. 检查服务器邮件配置...');
  const isConfigured = isServerEmailConfigured();

  if (isConfigured) {
    console.log('   配置状态: ✅ 已配置');
    console.log(
      `   邮件服务器: ${process.env.EMAIL_HOST || 'smtp.exmail.qq.com'}`
    );
    console.log(`   端口: ${process.env.EMAIL_PORT || '465'}`);
    console.log(`   用户: ${process.env.EMAIL_USER}`);
    console.log(
      `   发件人: ${process.env.EMAIL_FROM || process.env.EMAIL_USER}`
    );
  } else {
    console.log('   配置状态: ❌ 未配置');
    console.log('\n❌ 服务器邮件配置不完整，请检查以下环境变量:');
    console.log('   - EMAIL_USER');
    console.log('   - EMAIL_PASS');
    return;
  }

  // 2. 测试基本邮件发送
  console.log('\n2. 测试基本邮件发送...');
  const testEmailData = {
    to: 'test@example.com', // 请替换为您的测试邮箱
    subject: 'CCPM360 邮件发送测试',
    html: `
      <h2>CCPM360 邮件发送测试</h2>
      <p>这是一封测试邮件，用于验证邮件发送功能是否正常。</p>
      <p>发送时间: ${new Date().toLocaleString('zh-CN')}</p>
      <p>如果您收到这封邮件，说明邮件发送功能正常工作。</p>
    `,
  };

  try {
    const result = await sendServerEmail(testEmailData);
    console.log(`   基本邮件发送: ${result ? '✅ 成功' : '❌ 失败'}`);
  } catch (error) {
    console.log(`   基本邮件发送: ❌ 失败 - ${error.message}`);
  }

  // 3. 测试带PDF附件的邮件发送 (暂时跳过，因为PDF生成器不存在)
  console.log('\n3. 测试带PDF附件的邮件发送...');
  console.log('   PDF测试: ⏭️ 跳过 (PDF生成器模块不存在)');

  // 4. 显示配置信息
  console.log('\n4. 当前邮件配置信息:');
  console.log(`   EMAIL_HOST: ${process.env.EMAIL_HOST || '未设置'}`);
  console.log(`   EMAIL_PORT: ${process.env.EMAIL_PORT || '未设置'}`);
  console.log(`   EMAIL_USER: ${process.env.EMAIL_USER || '未设置'}`);
  console.log(`   EMAIL_FROM: ${process.env.EMAIL_FROM || '未设置'}`);
  console.log(`   EMAIL_SECURE: ${process.env.EMAIL_SECURE || '未设置'}`);

  console.log('\n=== 测试完成 ===');
  console.log('\n注意事项:');
  console.log('1. 请将测试邮箱地址替换为您的真实邮箱');
  console.log('2. 检查垃圾邮件文件夹');
  console.log('3. 如果发送失败，请检查网络连接和邮箱配置');
}

// 运行测试
// 在ES模块中直接执行
testEmailSending().catch((error) => {
  console.error('测试过程中发生错误:', error);
  process.exit(1);
});

export { testEmailSending };
