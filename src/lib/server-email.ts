import nodemailer from 'nodemailer';

// 服务器端邮件配置
const EMAIL_CONFIG = {
  host: process.env['EMAIL_HOST'] || 'smtp.exmail.qq.com',
  port: parseInt(process.env['EMAIL_PORT'] || '465'),
  secure: process.env['EMAIL_SECURE'] === 'true' || true,
  auth: {
    user: process.env['EMAIL_USER'],
    pass: process.env['EMAIL_PASS'],
  },
};

// 检查服务器端邮件配置是否完整
export function isServerEmailConfigured(): boolean {
  return !!(EMAIL_CONFIG.auth.user && EMAIL_CONFIG.auth.pass);
}

// 创建邮件传输器
export function createTransporter() {
  if (!isServerEmailConfigured()) {
    throw new Error('服务器邮件配置不完整');
  }

  return nodemailer.createTransport(EMAIL_CONFIG);
}

// 服务器端邮件发送接口
export interface ServerEmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

// 发送邮件函数
export async function sendServerEmail(
  options: ServerEmailOptions
): Promise<boolean> {
  try {
    if (!isServerEmailConfigured()) {
      console.error('Server email configuration is incomplete');
      return false;
    }

    const transporter = createTransporter();

    const mailOptions = {
      from: options.from || process.env['EMAIL_FROM'] || EMAIL_CONFIG.auth.user,
      to: options.to,
      subject: options.subject,
      html: options.html,
    };

    console.log('Sending email via server (Tencent Enterprise Email):', {
      to: options.to,
      subject: options.subject,
      from: mailOptions.from,
    });

    const result = await transporter.sendMail(mailOptions);
    console.log('Server email sent successfully:', result.messageId);
    return true;
  } catch (error) {
    console.error('Server email sending failed:', error);
    return false;
  }
}

// 生成评估结果邮件HTML内容
export function generateAssessmentEmailHTML(data: {
  userName: string;
  assessmentType: string;
  score: number;
  recommendations: string[];
  trackingUrl?: string;
}): string {
  const { userName, assessmentType, score, recommendations, trackingUrl } =
    data;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>CCPM360评估结果</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f4f4f4; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .score { font-size: 24px; font-weight: bold; color: #007bff; }
        .recommendations { background: #f9f9f9; padding: 15px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>CCPM360评估结果</h1>
        </div>
        <div class="content">
          <p>尊敬的 ${userName}，</p>
          <p>您的${assessmentType}评估已完成，以下是您的评估结果：</p>
          
          <div class="score">
            综合得分：${score}分
          </div>
          
          <div class="recommendations">
            <h3>改进建议：</h3>
            <ul>
              ${recommendations.map((rec) => `<li>${rec}</li>`).join('')}
            </ul>
          </div>
          
          <p>感谢您使用CCPM360评估系统！</p>
          ${trackingUrl ? `<p><small>邮件跟踪：<a href="${trackingUrl}">查看详情</a></small></p>` : ''}
        </div>
        <div class="footer">
          <p>此邮件由CCPM360系统自动发送，请勿回复。</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
