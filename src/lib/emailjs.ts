import emailjs from '@emailjs/browser';
// nodemailer只能在服务器端使用，不能在客户端导入
// import nodemailer from 'nodemailer';

// EmailJS配置
const EMAILJS_CONFIG = {
  serviceId: 'service_ccpm360', // EmailJS服务ID
  templateId: 'template_assessment_result', // 评估结果邮件模板
  publicKey: 'YOUR_EMAILJS_PUBLIC_KEY', // EmailJS公钥
};

// 腾讯企业邮箱配置（仅用于服务器端）
// 客户端不能直接使用SMTP，需要通过API路由

// 检查EmailJS配置是否完整
export const isEmailJSConfigured = () => {
  return (
    EMAILJS_CONFIG.serviceId &&
    EMAILJS_CONFIG.serviceId !== 'service_ccpm360' &&
    EMAILJS_CONFIG.templateId &&
    EMAILJS_CONFIG.templateId !== 'template_assessment_result' &&
    EMAILJS_CONFIG.publicKey &&
    EMAILJS_CONFIG.publicKey !== 'YOUR_EMAILJS_PUBLIC_KEY'
  );
};

// 腾讯企业邮箱相关函数已移除，因为客户端不能使用SMTP

// 获取可用的邮件服务（客户端只能使用EmailJS）
export const getAvailableEmailService = () => {
  // 客户端只能使用EmailJS
  if (isEmailJSConfigured()) {
    return 'emailjs';
  }

  return null;
};

// 初始化EmailJS
export const initEmailJS = () => {
  if (!isEmailJSConfigured()) {
    console.warn('EmailJS配置未完成，请按照EmailJS配置说明.md文档进行配置');
    return false;
  }
  emailjs.init(EMAILJS_CONFIG.publicKey);
  return true;
};

// 腾讯企业邮箱发送函数已移除，因为客户端不能使用SMTP
// 如需使用SMTP，请在服务器端API路由中实现

// 发送联系表单邮件
export const sendContactEmail = async (formData: {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  message?: string;
  // 支持密码重置邮件的参数
  to_email?: string;
  from_email?: string;
  subject?: string;
  user_name?: string;
  user_email?: string;
}) => {
  // 获取可用的邮件服务
  const availableService = getAvailableEmailService();

  if (!availableService) {
    const configError = {
      message: '邮件服务未配置',
      details: '请配置EmailJS服务',
      configSteps: [
        '配置EmailJS:',
        '1. 注册EmailJS账户并创建服务',
        '2. 创建邮件模板',
        '3. 获取Public Key',
        '4. 更新src/lib/emailjs.ts中的配置信息',
      ],
    };
    console.error('邮件服务配置错误:', configError);
    return {
      success: false,
      error: configError,
      needsConfiguration: true,
    };
  }

  try {
    const templateParams = {
      to_email: formData.to_email || 'business@ccpm360.com',
      from_name: formData.name || formData.user_name || '',
      from_email: formData.from_email || formData.email || '',
      phone: formData.phone || '',
      company: formData.company || '',
      message: formData.message || '',
      reply_to: formData.from_email || formData.email || '',
      subject: formData.subject || '',
      user_email: formData.user_email || formData.email || '',
      // 添加时间戳
      submit_time: new Date().toLocaleString('zh-CN', {
        timeZone: 'Asia/Shanghai',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
    };

    const response = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.templateId,
      templateParams
    );

    console.log('邮件发送成功:', response);
    return { success: true, response };
  } catch (error: unknown) {
    console.error('邮件发送失败:', error);

    // 提供更详细的错误信息
    let errorMessage = '邮件发送失败';
    const errorText =
      error && typeof error === 'object' && 'text' in error
        ? (error as { text: string }).text
        : '';
    if (errorText.includes('Public Key is invalid')) {
      errorMessage = 'EmailJS Public Key无效，请检查配置';
    } else if (errorText.includes('Service ID')) {
      errorMessage = 'EmailJS Service ID无效，请检查配置';
    } else if (errorText.includes('Template ID')) {
      errorMessage = 'EmailJS Template ID无效，请检查配置';
    }

    return {
      success: false,
      error: {
        message: errorMessage,
        originalError: error,
        suggestion: '请检查EmailJS配置说明.md文档，确保所有配置项正确设置',
      },
    };
  }
};

// 获取EmailJS配置状态
export const getEmailJSConfigStatus = () => {
  return {
    isConfigured: isEmailJSConfigured(),
    serviceId: EMAILJS_CONFIG.serviceId,
    templateId: EMAILJS_CONFIG.templateId,
    hasPublicKey: EMAILJS_CONFIG.publicKey !== 'YOUR_PUBLIC_KEY',
    configFile: 'EmailJS配置说明.md',
  };
};

// 邮件模板内容（用于EmailJS控制台配置参考）
export const EMAIL_TEMPLATE_CONTENT = `
主题: CCPM360官网 - 新的客户咨询

尊敬的CCPM360团队，

您收到了一条来自官网的新客户咨询：

客户信息：
姓名：{{from_name}}
邮箱：{{from_email}}
电话：{{phone}}
公司：{{company}}

咨询内容：
{{message}}

提交时间：{{submit_time}}

请及时回复客户咨询。

      <div style="text-align: center; padding: 30px 20px; border-top: 1px solid #e5e7eb; background: #f8fafc; margin-top: 30px;">
        <div style="margin-bottom: 20px;">
          <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">CCPM360</h3>
          <p style="color: #6b7280; margin: 0; font-size: 14px;">专业的关键链项目管理解决方案提供商</p>
        </div>
        
        <div style="display: flex; justify-content: center; align-items: center; flex-wrap: wrap; gap: 20px; margin-bottom: 20px;">
          <div style="display: flex; align-items: center; color: #374151; font-size: 14px;">
            <span style="margin-right: 8px;">📞</span>
            <span>+86-400-868-2015</span>
          </div>
          <div style="display: flex; align-items: center; color: #374151; font-size: 14px;">
            <span style="margin-right: 8px;">💬</span>
            <span>微信公众号：ccpm360</span>
          </div>
          <div style="display: flex; align-items: center; color: #374151; font-size: 14px;">
            <span style="margin-right: 8px;">✉️</span>
            <span>contact@ccpm360.com</span>
          </div>
        </div>
        
        <div style="border-top: 1px solid #d1d5db; padding-top: 15px;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">本邮件由CCPM360系统自动发送，请勿直接回复</p>
          <p style="color: #9ca3af; font-size: 12px; margin: 5px 0 0 0;">如需帮助，请通过上述联系方式与我们联系</p>
        </div>
      </div>

此邮件由CCPM360官网自动发送。
`;
