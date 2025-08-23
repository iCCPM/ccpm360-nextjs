import { sendContactEmail, getAvailableEmailService } from '@/lib/emailjs';
import { sendServerEmail, isServerEmailConfigured } from '@/lib/server-email';
import { supabase } from '@/lib/supabase';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { generateAssessmentPDF } from '@/lib/puppeteerPDFGenerator';

// 获取API基础URL的辅助函数
function getApiUrl(): string {
  // 在Vercel部署环境中，使用VERCEL_URL
  if (process.env['VERCEL_URL']) {
    return `https://${process.env['VERCEL_URL']}`;
  }

  // 使用NEXT_PUBLIC_SITE_URL（如果设置）
  if (process.env['NEXT_PUBLIC_SITE_URL']) {
    return process.env['NEXT_PUBLIC_SITE_URL'];
  }

  // 开发环境回退到localhost
  return 'http://localhost:3000';
}

// 生成跟踪URL的辅助函数
function generateTrackingUrls(trackingId: string) {
  const baseUrl = getApiUrl();

  return {
    openTrackingUrl: `${baseUrl}/api/email/track/open?trackingId=${encodeURIComponent(trackingId)}`,
    clickTrackingUrl: (targetUrl: string) =>
      `${baseUrl}/api/email/track/click?trackingId=${encodeURIComponent(trackingId)}&url=${encodeURIComponent(targetUrl)}`,
  };
}

// 邮件模板配置
const emailTemplates = {
  assessment_result: {
    subject: '您的项目管理思维诊断报告 - CCPM360',
    template: (data: any, trackingId?: string) => {
      const tracking = trackingId ? generateTrackingUrls(trackingId) : null;

      // 生成个性化称呼
      const generateGreeting = (name?: string) => {
        if (name && name.trim()) {
          // 如果有姓名，使用个性化称呼
          return `<p style="color: #374151; font-size: 16px; margin-bottom: 20px;">尊敬的${name.trim()}：</p>
          <p style="color: #6b7280; font-size: 16px;">感谢您完成我们的项目管理思维诊断测试</p>`;
        } else {
          // 没有姓名时使用通用称呼
          return `<p style="color: #6b7280; font-size: 16px;">感谢您完成我们的项目管理思维诊断测试</p>`;
        }
      };

      return `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin-bottom: 10px;">CCPM360 项目管理思维诊断报告</h1>
          ${generateGreeting(data.name)}
        </div>
        
        <div style="background: linear-gradient(135deg, #3b82f6, #6366f1); color: white; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
          <h2 style="margin: 0 0 10px 0; font-size: 24px;">您的项目管理水平：${data.advice?.level === 'beginner' ? '初学者' : data.advice?.level === 'intermediate' ? '进阶者' : '专家级'}</h2>
          <div style="font-size: 36px; font-weight: bold; margin: 15px 0;">${data.totalScore || 0}分</div>
          <p style="margin: 0; opacity: 0.9;">${data.advice?.levelDescription || '基于您的测试结果，我们为您提供了个性化的项目管理建议。'}</p>
        </div>
        
        <div style="background: #f8fafc; padding: 25px; border-radius: 12px; margin-bottom: 25px;">
          <h3 style="color: #1f2937; margin-bottom: 15px;">整体评价</h3>
          <p style="color: #4b5563; line-height: 1.6; margin: 0;">${data.advice?.overallAdvice || '您在项目管理方面展现出了良好的基础能力，通过持续学习和实践，您将能够进一步提升项目管理水平。'}</p>
        </div>
        
        <div style="margin-bottom: 25px;">
          <h3 style="color: #1f2937; margin-bottom: 15px;">各维度得分</h3>
          ${(() => {
            // 处理dimensionScores数据格式转换
            let dimensionData = [];
            if (Array.isArray(data.dimensionScores)) {
              dimensionData = data.dimensionScores;
            } else if (
              data.dimensionScores &&
              typeof data.dimensionScores === 'object'
            ) {
              // 将Record<string, number>格式转换为数组格式
              const dimensionNames = {
                time_management: '时间管理',
                resource_coordination: '资源协调',
                risk_control: '风险控制',
                team_collaboration: '团队协作',
              };
              dimensionData = Object.entries(data.dimensionScores).map(
                ([key, score]) => ({
                  dimension:
                    dimensionNames[key as keyof typeof dimensionNames] || key,
                  score: score,
                })
              );
            }

            if (dimensionData.length === 0) {
              return '<p style="color: #6b7280; text-align: center;">暂无维度得分数据</p>';
            }

            return dimensionData
              .map((item: any) => {
                const dimension = item?.dimension || '未知维度';
                const score = item?.score || 0;
                const safeScore = Number(score) || 0;
                const barColor =
                  safeScore >= 80
                    ? '#10b981'
                    : safeScore >= 60
                      ? '#f59e0b'
                      : '#ef4444';
                return `
              <div style="margin-bottom: 15px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                  <span style="color: #374151; font-weight: 500;">${dimension}</span>
                  <span style="color: ${barColor}; font-weight: bold;">${safeScore}分</span>
                </div>
                <div style="background: #e5e7eb; height: 8px; border-radius: 4px; overflow: hidden;">
                  <div style="background: ${barColor}; height: 100%; width: ${safeScore}%; transition: width 0.3s ease;"></div>
                </div>
              </div>
            `;
              })
              .join('');
          })()}
        </div>
        
        <div style="background: #fef3c7; border: 1px solid #fbbf24; padding: 20px; border-radius: 12px; margin-bottom: 25px;">
          <h3 style="color: #92400e; margin-bottom: 15px;">提升建议</h3>
          <ul style="color: #92400e; margin: 0; padding-left: 20px;">
            ${(data.advice?.nextSteps || ['建议您关注项目管理的基础理论学习', '实践中积累项目管理经验', '考虑参加专业的项目管理培训']).map((step: string) => `<li style="margin-bottom: 8px;">${step || '持续提升项目管理技能'}</li>`).join('')}
          </ul>
        </div>
        
        <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 25px; border-radius: 12px; text-align: center; margin-bottom: 25px;">
          <h3 style="margin: 0 0 15px 0;">关键链项目管理（CCPM）</h3>
          <p style="margin: 0 0 20px 0; opacity: 0.9;">突破传统项目管理瓶颈，实现项目成功率提升30%+</p>
          <a href="${tracking ? tracking.clickTrackingUrl('https://ccpm360.com/contact') : 'https://ccpm360.com/contact'}" style="display: inline-block; background: white; color: #6366f1; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">免费咨询CCPM解决方案</a>
        </div>
        
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
        ${tracking ? `<img src="${tracking.openTrackingUrl}" width="1" height="1" style="display: none;" alt="" />` : ''}
      </div>`;
    },
  },

  follow_up_1: {
    subject: '深入了解CCPM：传统项目管理的突破之道',
    template: (trackingId?: string) => {
      const tracking = trackingId ? generateTrackingUrls(trackingId) : null;
      return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #2563eb;">您好，朋友！</h1>
        
        <p>感谢您参与我们的项目管理思维诊断测试。基于您的测试结果，我们为您准备了一些有价值的CCPM学习资料。</p>
        
        <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #0369a1;">为什么选择CCPM？</h3>
          <ul style="color: #374151;">
            <li>平均项目周期缩短25%</li>
            <li>项目按时完成率达90%+</li>
            <li>资源利用率提升40%</li>
            <li>团队协作效率显著改善</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${tracking ? tracking.clickTrackingUrl('https://ccpm360.com/resources') : 'https://ccpm360.com/resources'}" style="display: inline-block; background: #2563eb; color: white; padding: 15px 30px; border-radius: 8px; text-decoration: none; font-weight: 600;">获取免费CCPM学习资料</a>
        </div>
        
        <p>最佳祝愿，<br>CCPM360团队</p>
        
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
        ${tracking ? `<img src="${tracking.openTrackingUrl}" width="1" height="1" style="display: none;" alt="" />` : ''}
      </div>`;
    },
  },

  follow_up_2: {
    subject: 'CCPM实战案例：看看其他企业如何成功转型',
    template: (trackingId?: string) => {
      const tracking = trackingId ? generateTrackingUrls(trackingId) : null;

      return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #2563eb;">实战案例分享</h1>
        
        <p>您好！我们想与您分享一些CCPM在实际项目中的成功案例。</p>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1f2937;">案例：某制造企业的CCPM转型</h3>
          <p><strong>挑战：</strong>项目延期率高达60%，资源冲突频繁</p>
          <p><strong>解决方案：</strong>实施CCPM方法论，重新设计项目流程</p>
          <p><strong>结果：</strong>项目按时完成率提升至95%，资源利用率提升35%</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${tracking ? tracking.clickTrackingUrl('https://ccpm360.com/case-studies') : 'https://ccpm360.com/case-studies'}" style="display: inline-block; background: #2563eb; color: white; padding: 15px 30px; border-radius: 8px; text-decoration: none; font-weight: 600;">查看更多成功案例</a>
        </div>
        
        <p>想了解CCPM如何帮助您的企业？我们提供免费的项目诊断服务。</p>
        
        <p>最佳祝愿，<br>CCPM360团队</p>
        
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
        ${tracking ? `<img src="${tracking.openTrackingUrl}" width="1" height="1" style="display: none;" alt="" />` : ''}
      </div>`;
    },
  },
};

// 邮件发送函数 - 实现一用一备策略
async function sendEmail(
  to: string,
  subject: string,
  html: string,
  attachments?: Array<{
    filename: string;
    content: Uint8Array;
    contentType?: string;
  }>
) {
  try {
    console.log('Sending email to:', to);
    console.log('Subject:', subject);
    console.log('HTML content length:', html.length);

    // 检查可用的邮件服务
    const emailjsAvailable = getAvailableEmailService();
    const serverEmailAvailable = isServerEmailConfigured();

    console.log('EmailJS available:', !!emailjsAvailable);
    console.log('Server email available:', serverEmailAvailable);
    console.log('Has attachments:', !!(attachments && attachments.length > 0));

    // 策略调整：如果有附件，优先使用服务器邮件（因为EmailJS不支持附件）
    if (attachments && attachments.length > 0 && serverEmailAvailable) {
      console.log(
        'Has attachments - using Server Email (primary for attachments)'
      );
      try {
        const mailOptions: any = {
          to: to,
          subject: subject,
          html: html,
          attachments: attachments,
        };
        const serverResult = await sendServerEmail(mailOptions);

        if (serverResult) {
          console.log(
            'Email with attachments sent successfully via Server Email'
          );
          return {
            success: true,
            messageId: `server_${Date.now()}`,
            message:
              'Email with attachments sent successfully via Server Email',
            service: 'server',
          };
        } else {
          console.error(
            'Server email sending failed, trying EmailJS without attachments'
          );
        }
      } catch (serverError) {
        console.error(
          'Server email sending exception, trying EmailJS without attachments:',
          serverError
        );
      }
    }

    // 策略1：使用EmailJS（无附件或服务器邮件失败时）
    if (emailjsAvailable) {
      console.log(
        'Attempting to send email via EmailJS (no attachments supported)'
      );
      if (attachments && attachments.length > 0) {
        console.warn(
          'EmailJS does not support attachments - attachments will be lost'
        );
      }
      try {
        const result = await sendContactEmail({
          to_email: to,
          subject: subject,
          message: html,
          from_email: 'noreply@ccpm360.com',
          name: 'CCPM360系统',
        });

        if (result.success) {
          console.log('Email sent successfully via EmailJS');
          return {
            success: true,
            messageId: `emailjs_${Date.now()}`,
            message: 'Email sent successfully via EmailJS',
            service: 'emailjs',
          };
        } else {
          console.warn(
            'EmailJS sending failed, trying backup service:',
            result.error
          );
        }
      } catch (emailjsError) {
        console.warn(
          'EmailJS sending exception, trying backup service:',
          emailjsError
        );
      }
    }

    // 策略2：备用方案 - 使用腾讯企业邮箱（如果之前没有尝试过）
    if (serverEmailAvailable && !(attachments && attachments.length > 0)) {
      console.log('Attempting to send email via Server Email (backup)');
      try {
        const mailOptions: any = {
          to: to,
          subject: subject,
          html: html,
        };
        if (attachments) {
          mailOptions.attachments = attachments;
        }
        const serverResult = await sendServerEmail(mailOptions);

        if (serverResult) {
          console.log('Email sent successfully via Server Email (backup)');
          return {
            success: true,
            messageId: `server_${Date.now()}`,
            message: 'Email sent successfully via Server Email (backup)',
            service: 'server',
          };
        } else {
          console.error('Server email sending failed');
        }
      } catch (serverError) {
        console.error('Server email sending exception:', serverError);
      }
    }

    // 所有邮件服务都失败
    const error = {
      message: '所有邮件服务都不可用',
      details: `EmailJS可用: ${!!emailjsAvailable}, 服务器邮件可用: ${serverEmailAvailable}`,
    };
    console.error('邮件发送完全失败:', error);
    return {
      success: false,
      error: error,
      message: 'All email services failed',
    };
  } catch (error) {
    console.error('邮件发送异常:', error);
    return {
      success: false,
      error: error,
      message: 'Email sending exception',
    };
  }
}

// 发送测试结果邮件
export async function POST(request: NextRequest) {
  try {
    const {
      type,
      recipientEmail,
      data,
      scheduleFollowUp = true,
    } = await request.json();

    if (!recipientEmail || !type || !data) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const template = emailTemplates[type as keyof typeof emailTemplates];
    if (!template) {
      return NextResponse.json(
        { error: 'Invalid email template type' },
        { status: 400 }
      );
    }

    // 生成唯一的跟踪ID
    const trackingId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // 生成PDF报告（仅对测评结果邮件）
    let attachments:
      | Array<{ filename: string; content: Uint8Array; contentType?: string }>
      | undefined;
    if (type === 'assessment_result') {
      try {
        console.log('Generating PDF report for assessment result');
        console.log('Original data structure:', JSON.stringify(data, null, 2));
        console.log('Advice field detailed structure:');
        console.log('- advice:', data.advice);
        console.log('- advice type:', typeof data.advice);
        console.log('- dimensionAdvice:', data.advice?.dimensionAdvice);
        console.log(
          '- dimensionAdvice type:',
          typeof data.advice?.dimensionAdvice
        );
        console.log(
          '- dimensionAdvice is Array:',
          Array.isArray(data.advice?.dimensionAdvice)
        );
        console.log('- nextSteps:', data.advice?.nextSteps);
        console.log('- nextSteps type:', typeof data.advice?.nextSteps);
        console.log(
          '- nextSteps is Array:',
          Array.isArray(data.advice?.nextSteps)
        );

        // 转换数据格式以匹配PuppeteerPDFGenerator的AssessmentData接口
        const assessmentData = {
          userInfo: {
            name: data.name || '用户',
            email: data.email || recipientEmail,
            company: data.company || undefined,
          },
          totalScore: Number(data.totalScore) || 0,
          maxTotalScore: 100, // 假设总分为100
          dimensionScores: (() => {
            // 处理dimensionScores数据格式转换
            let dimensionData = [];
            if (Array.isArray(data.dimensionScores)) {
              dimensionData = data.dimensionScores.map((item: any) => ({
                dimension: item?.dimension || '未知维度',
                score: Number(item?.score) || 0,
                maxScore: 25, // 假设每个维度满分25分
              }));
            } else if (
              data.dimensionScores &&
              typeof data.dimensionScores === 'object'
            ) {
              // 将Record<string, number>格式转换为数组格式
              const dimensionNames = {
                time_management: '时间管理',
                resource_coordination: '资源协调',
                risk_control: '风险控制',
                team_collaboration: '团队协作',
              };
              dimensionData = Object.entries(data.dimensionScores).map(
                ([key, score]) => ({
                  dimension:
                    dimensionNames[key as keyof typeof dimensionNames] || key,
                  score: Number(score) || 0,
                  maxScore: 25,
                })
              );
            }

            // 如果没有维度数据，创建默认数据
            if (dimensionData.length === 0) {
              dimensionData = [
                { dimension: '时间管理', score: 0, maxScore: 25 },
                { dimension: '资源协调', score: 0, maxScore: 25 },
                { dimension: '风险控制', score: 0, maxScore: 25 },
                { dimension: '团队协作', score: 0, maxScore: 25 },
              ];
            }

            return dimensionData;
          })(),
          personalizedAdvice: {
            overallLevel:
              data.advice?.levelDescription ||
              data.advice?.overallAdvice ||
              '您目前主要采用传统项目管理思维。CCPM能够显著提升项目成功率和效率，建议您系统学习关键链项目管理方法。',
            dimensionAdvice: (() => {
              // 处理dimensionAdvice数据格式转换
              console.log('Processing dimensionAdvice...');
              const rawAdvice = data.advice?.dimensionAdvice;
              console.log('Raw dimensionAdvice:', rawAdvice);
              console.log('Raw dimensionAdvice type:', typeof rawAdvice);

              if (!rawAdvice) {
                console.log('No dimensionAdvice found, using default');
                return [
                  '建议您关注项目管理的基础理论学习',
                  '实践中积累项目管理经验',
                ];
              }

              // 如果已经是字符串数组，直接返回
              if (Array.isArray(rawAdvice)) {
                console.log('dimensionAdvice is already an array:', rawAdvice);
                return rawAdvice.filter(
                  (item) => typeof item === 'string' && item.trim() !== ''
                );
              }

              // 如果是对象格式，转换为数组
              if (typeof rawAdvice === 'object' && rawAdvice !== null) {
                console.log('Converting dimensionAdvice object to array');
                const dimensionNames = {
                  time_management: '时间管理',
                  resource_coordination: '资源协调',
                  risk_control: '风险控制',
                  team_collaboration: '团队协作',
                };

                const converted = Object.entries(rawAdvice)
                  .filter(
                    ([_key, value]) =>
                      value && typeof value === 'string' && value.trim() !== ''
                  )
                  .map(([key, advice]) => {
                    const dimensionName =
                      dimensionNames[key as keyof typeof dimensionNames] || key;
                    return `${dimensionName}: ${advice}`;
                  });

                console.log('Converted dimensionAdvice:', converted);
                return converted.length > 0
                  ? converted
                  : [
                      '建议您关注项目管理的基础理论学习',
                      '实践中积累项目管理经验',
                    ];
              }

              // 如果是字符串，尝试解析
              if (typeof rawAdvice === 'string') {
                console.log(
                  'dimensionAdvice is string, trying to parse:',
                  rawAdvice
                );
                try {
                  const parsed = JSON.parse(rawAdvice);
                  if (Array.isArray(parsed)) {
                    return parsed.filter(
                      (item) => typeof item === 'string' && item.trim() !== ''
                    );
                  }
                  if (typeof parsed === 'object' && parsed !== null) {
                    return Object.values(parsed).filter(
                      (item) => typeof item === 'string' && item.trim() !== ''
                    );
                  }
                } catch (e) {
                  console.log('Failed to parse dimensionAdvice string:', e);
                  return [rawAdvice]; // 直接作为单个建议返回
                }
              }

              console.log('Using default dimensionAdvice');
              return [
                '建议您关注项目管理的基础理论学习',
                '实践中积累项目管理经验',
              ];
            })(),
            nextSteps: (() => {
              // 处理nextSteps数据格式转换
              console.log('Processing nextSteps...');
              const rawSteps = data.advice?.nextSteps;
              console.log('Raw nextSteps:', rawSteps);
              console.log('Raw nextSteps type:', typeof rawSteps);

              if (!rawSteps) {
                console.log('No nextSteps found, using default');
                return [
                  '📚 阅读《关键链》一书，了解CCPM基础理论',
                  '🎯 参加CCPM基础培训课程',
                  '💼 联系我们获取免费的项目诊断服务',
                ];
              }

              // 如果已经是字符串数组，直接返回
              if (Array.isArray(rawSteps)) {
                console.log('nextSteps is already an array:', rawSteps);
                const filtered = rawSteps.filter(
                  (item) => typeof item === 'string' && item.trim() !== ''
                );
                return filtered.length > 0
                  ? filtered
                  : [
                      '📚 阅读《关键链》一书，了解CCPM基础理论',
                      '🎯 参加CCPM基础培训课程',
                      '💼 联系我们获取免费的项目诊断服务',
                    ];
              }

              // 如果是对象格式，提取值
              if (typeof rawSteps === 'object' && rawSteps !== null) {
                console.log('Converting nextSteps object to array');
                const values = Object.values(rawSteps).filter(
                  (item) => typeof item === 'string' && item.trim() !== ''
                );
                console.log('Converted nextSteps:', values);
                return values.length > 0
                  ? values
                  : [
                      '📚 阅读《关键链》一书，了解CCPM基础理论',
                      '🎯 参加CCPM基础培训课程',
                      '💼 联系我们获取免费的项目诊断服务',
                    ];
              }

              // 如果是字符串，尝试解析
              if (typeof rawSteps === 'string') {
                console.log('nextSteps is string, trying to parse:', rawSteps);
                try {
                  const parsed = JSON.parse(rawSteps);
                  if (Array.isArray(parsed)) {
                    const filtered = parsed.filter(
                      (item) => typeof item === 'string' && item.trim() !== ''
                    );
                    return filtered.length > 0
                      ? filtered
                      : [
                          '📚 阅读《关键链》一书，了解CCPM基础理论',
                          '🎯 参加CCPM基础培训课程',
                          '💼 联系我们获取免费的项目诊断服务',
                        ];
                  }
                  if (typeof parsed === 'object' && parsed !== null) {
                    const values = Object.values(parsed).filter(
                      (item) => typeof item === 'string' && item.trim() !== ''
                    );
                    return values.length > 0
                      ? values
                      : [
                          '📚 阅读《关键链》一书，了解CCPM基础理论',
                          '🎯 参加CCPM基础培训课程',
                          '💼 联系我们获取免费的项目诊断服务',
                        ];
                  }
                } catch (e) {
                  console.log('Failed to parse nextSteps string:', e);
                  return [rawSteps]; // 直接作为单个步骤返回
                }
              }

              console.log('Using default nextSteps');
              return [
                '📚 阅读《关键链》一书，了解CCPM基础理论',
                '🎯 参加CCPM基础培训课程',
                '💼 联系我们获取免费的项目诊断服务',
              ];
            })(),
          },
          completedAt: data.completedAt
            ? new Date(data.completedAt)
            : new Date(),
        };

        console.log(
          'Converted assessment data:',
          JSON.stringify(assessmentData, null, 2)
        );
        console.log('Final personalizedAdvice structure:');
        console.log(
          '- dimensionAdvice:',
          assessmentData.personalizedAdvice.dimensionAdvice
        );
        console.log(
          '- dimensionAdvice type:',
          typeof assessmentData.personalizedAdvice.dimensionAdvice
        );
        console.log(
          '- dimensionAdvice is Array:',
          Array.isArray(assessmentData.personalizedAdvice.dimensionAdvice)
        );
        console.log(
          '- nextSteps:',
          assessmentData.personalizedAdvice.nextSteps
        );
        console.log(
          '- nextSteps type:',
          typeof assessmentData.personalizedAdvice.nextSteps
        );
        console.log(
          '- nextSteps is Array:',
          Array.isArray(assessmentData.personalizedAdvice.nextSteps)
        );

        const pdfBuffer = await generateAssessmentPDF(assessmentData);
        const fileName = `CCPM360-assessment-report-${new Date().toISOString().split('T')[0]}.pdf`;
        attachments = [
          {
            filename: fileName,
            content: pdfBuffer,
            contentType: 'application/pdf',
          },
        ];
        console.log('PDF report generated successfully:', fileName);
      } catch (pdfError) {
        console.error('Failed to generate PDF report:', pdfError);
        console.error('PDF Error details:', {
          message:
            pdfError instanceof Error ? pdfError.message : 'Unknown error',
          stack: pdfError instanceof Error ? pdfError.stack : undefined,
        });
        // 继续发送邮件，即使PDF生成失败
      }
    }

    // 发送主邮件
    const emailHtml = template.template(data, trackingId);
    const result = await sendEmail(
      recipientEmail,
      template.subject,
      emailHtml,
      attachments
    );

    if (!result.success) {
      throw new Error('Failed to send email');
    }

    // 记录邮件发送历史
    const emailHistoryData: any = {
      recipient_email: recipientEmail,
      email_type: type,
      subject: template.subject,
      sent_at: new Date().toISOString(),
      status: 'sent',
      tracking_id: trackingId,
    };

    // 只有当assessment_id是有效的UUID且在数据库中存在时才添加
    if (
      data.id &&
      typeof data.id === 'string' &&
      data.id.match(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      )
    ) {
      // 检查assessment_id是否存在于assessment_records表中
      const { data: assessmentExists } = await supabase
        .from('assessment_records')
        .select('id')
        .eq('id', data.id)
        .single();

      if (assessmentExists) {
        emailHistoryData.assessment_id = data.id;
      }
    }

    const { error: insertError } = await supabase
      .from('email_history')
      .insert(emailHistoryData);

    if (insertError) {
      console.error('Failed to record email history:', insertError);
    }

    // 安排后续邮件（如果启用）
    if (scheduleFollowUp && type === 'assessment_result') {
      // 这里可以集成队列系统来安排后续邮件
      // 例如：3天后发送follow_up_1，7天后发送follow_up_2
      console.log('Scheduling follow-up emails for:', recipientEmail);
    }

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
      message: 'Email sent successfully',
    });
  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}

// 获取邮件发送历史
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const assessmentId = searchParams.get('assessmentId');

    let query = supabase
      .from('email_history')
      .select('*')
      .order('sent_at', { ascending: false });

    if (email) {
      query = query.eq('recipient_email', email);
    }

    if (assessmentId) {
      query = query.eq('assessment_id', assessmentId);
    }

    const { data, error } = await query.limit(50);

    if (error) {
      throw error;
    }

    return NextResponse.json({ emails: data });
  } catch (error) {
    console.error('Error fetching email history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch email history' },
      { status: 500 }
    );
  }
}
