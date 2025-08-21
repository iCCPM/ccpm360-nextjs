import nodemailer from 'nodemailer';

// 邮件配置接口
interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

// 邮件内容接口
interface EmailContent {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

// 创建邮件传输器
function createTransporter(): nodemailer.Transporter {
  const config: EmailConfig = {
    host: process.env['EMAIL_HOST'] || 'smtp.gmail.com',
    port: parseInt(process.env['EMAIL_PORT'] || '587'),
    secure: process.env['EMAIL_SECURE'] === 'true',
    auth: {
      user: process.env['EMAIL_USER'] || '',
      pass: process.env['EMAIL_PASS'] || '',
    },
  };

  return nodemailer.createTransport(config);
}

// 发送邮件函数
export async function sendEmail(emailContent: EmailContent): Promise<boolean> {
  try {
    const transporter = createTransporter();

    // 验证邮件配置
    await transporter.verify();

    const mailOptions = {
      from:
        emailContent.from ||
        `${process.env['EMAIL_FROM_NAME']} <${process.env['EMAIL_FROM']}>`,
      to: emailContent.to,
      subject: emailContent.subject,
      html: emailContent.html,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('邮件发送成功:', result.messageId);
    return true;
  } catch (error) {
    console.error('邮件发送失败:', error);
    return false;
  }
}

// 生成评估结果邮件HTML内容
export function generateAssessmentEmailHTML(data: {
  userName: string;
  totalScore: number;
  level: string;
  dimensionScores: Record<string, number>;
  advice: string;
  questionsWithAnswers: any[];
}): string {
  const {
    userName,
    totalScore,
    level,
    dimensionScores,
    advice,
    questionsWithAnswers,
  } = data;

  // 维度得分HTML
  const dimensionScoresHTML = Object.entries(dimensionScores)
    .map(
      ([dimension, score]) => `
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;">${dimension}</td>
        <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${score.toFixed(1)}</td>
      </tr>
    `
    )
    .join('');

  // 题目解析HTML
  const questionsHTML = questionsWithAnswers
    .map((_, index) => {
      return `
        <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #eee; border-radius: 5px;">
          <h4 style="color: #333; margin-bottom: 10px;">题目 ${index + 1}</h4>
        </div>
      `;
    })
    .join('');

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>评估结果</h2>
      <p>用户: ${userName}</p>
      <p>总分: ${totalScore}</p>
      <p>等级: ${level}</p>
      <p>建议: ${advice}</p>
      ${dimensionScoresHTML}
      ${questionsHTML}
    </div>
  `;
}
