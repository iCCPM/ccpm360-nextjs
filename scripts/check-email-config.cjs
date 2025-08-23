#!/usr/bin/env node
/**
 * 邮件配置检查脚本
 * 检查EmailJS和腾讯企业邮箱SMTP的环境变量配置状态
 */

require('dotenv').config({ path: '.env.local' });

function checkEmailJSConfig() {
  const config = {
    serviceId: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
    templateId: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
    publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY,
    privateKey: process.env.EMAILJS_PRIVATE_KEY
  };

  const isConfigured = Object.values(config).every(value => value && value.trim() !== '');
  
  console.log('\n=== EmailJS 配置检查 ===');
  console.log(`Service ID: ${config.serviceId ? '✅ 已配置' : '❌ 未配置'}`);
  console.log(`Template ID: ${config.templateId ? '✅ 已配置' : '❌ 未配置'}`);
  console.log(`Public Key: ${config.publicKey ? '✅ 已配置' : '❌ 未配置'}`);
  console.log(`Private Key: ${config.privateKey ? '✅ 已配置' : '❌ 未配置'}`);
  console.log(`整体状态: ${isConfigured ? '✅ 完全配置' : '❌ 配置不完整'}`);
  
  return isConfigured;
}

function checkSMTPConfig() {
  const config = {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  };

  const isConfigured = Object.values(config).every(value => value && value.trim() !== '');
  
  console.log('\n=== 腾讯企业邮箱 SMTP 配置检查 ===');
  console.log(`SMTP Host: ${config.host ? '✅ 已配置' : '❌ 未配置'}`);
  console.log(`SMTP Port: ${config.port ? '✅ 已配置' : '❌ 未配置'}`);
  console.log(`SMTP Secure: ${config.secure ? '✅ 已配置' : '❌ 未配置'}`);
  console.log(`SMTP User: ${config.user ? '✅ 已配置' : '❌ 未配置'}`);
  console.log(`SMTP Pass: ${config.pass ? '✅ 已配置' : '❌ 未配置'}`);
  console.log(`整体状态: ${isConfigured ? '✅ 完全配置' : '❌ 配置不完整'}`);
  
  return isConfigured;
}

function main() {
  console.log('🔍 邮件服务配置检查');
  console.log('='.repeat(50));
  
  const emailjsConfigured = checkEmailJSConfig();
  const smtpConfigured = checkSMTPConfig();
  
  console.log('\n=== 总体状态 ===');
  
  if (emailjsConfigured && smtpConfigured) {
    console.log('✅ 邮件服务配置完整 - EmailJS 和 SMTP 都已配置');
    console.log('📧 邮件发送将使用 EmailJS 作为主要服务，SMTP 作为备用');
  } else if (emailjsConfigured) {
    console.log('⚠️  仅 EmailJS 已配置 - 建议同时配置 SMTP 作为备用');
    console.log('📧 邮件发送将仅使用 EmailJS 服务');
  } else if (smtpConfigured) {
    console.log('⚠️  仅 SMTP 已配置 - 建议同时配置 EmailJS 作为主要服务');
    console.log('📧 邮件发送将仅使用 SMTP 服务');
  } else {
    console.log('❌ 邮件服务未配置 - 邮件发送功能将无法正常工作');
    console.log('\n📋 配置步骤:');
    console.log('1. 参考 EmailJS配置说明.md 配置 EmailJS 服务');
    console.log('2. 参考 邮件配置备份.md 配置腾讯企业邮箱 SMTP');
    console.log('3. 重启开发服务器使配置生效');
    process.exit(1);
  }
  
  console.log('\n💡 提示: 如需修改配置，请编辑 .env.local 文件并重启服务器');
}

if (require.main === module) {
  main();
}

module.exports = { checkEmailJSConfig, checkSMTPConfig };