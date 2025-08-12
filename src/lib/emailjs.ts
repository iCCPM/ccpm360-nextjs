import emailjs from '@emailjs/browser';

// EmailJS配置
const EMAILJS_CONFIG = {
  serviceId: 'service_xlf7ocv', // 需要在EmailJS控制台创建
  templateId: 'template_contact', // 需要在EmailJS控制台创建
  publicKey: '8T9H_VHVx5vXUgWAR' // 需要在EmailJS控制台获取
};

// 检查EmailJS配置是否完整
export const isEmailJSConfigured = () => {
  return EMAILJS_CONFIG.serviceId && EMAILJS_CONFIG.serviceId !== 'service_ccpm360' && 
         EMAILJS_CONFIG.templateId && EMAILJS_CONFIG.templateId !== 'template_default' && 
         EMAILJS_CONFIG.publicKey && EMAILJS_CONFIG.publicKey !== 'YOUR_PUBLIC_KEY';
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
  // 检查EmailJS配置
  if (!isEmailJSConfigured()) {
    const configError = {
      message: 'EmailJS配置未完成',
      details: '请按照项目根目录下的"EmailJS配置说明.md"文档完成EmailJS配置后再使用邮件功能。',
      configSteps: [
        '1. 注册EmailJS账户并创建服务',
        '2. 创建邮件模板',
        '3. 获取Public Key',
        '4. 更新src/lib/emailjs.ts中的配置信息'
      ]
    };
    console.error('EmailJS配置错误:', configError);
    return { 
      success: false, 
      error: configError,
      needsConfiguration: true 
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
        second: '2-digit'
      })
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
    const errorText = error && typeof error === 'object' && 'text' in error ? (error as { text: string }).text : '';
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
        suggestion: '请检查EmailJS配置说明.md文档，确保所有配置项正确设置'
      }
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
    configFile: 'EmailJS配置说明.md'
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

此邮件由CCPM360官网自动发送。
`;