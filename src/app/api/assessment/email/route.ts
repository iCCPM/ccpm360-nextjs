import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL']!;
const supabaseServiceKey = process.env['SUPABASE_SERVICE_ROLE_KEY']!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// 邮件模板配置
const emailTemplates = {
  assessment_result: {
    subject: '您的项目管理思维诊断报告 - CCPM360',
    template: (data: any) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin-bottom: 10px;">CCPM360 项目管理思维诊断报告</h1>
          <p style="color: #6b7280; font-size: 16px;">感谢您完成我们的项目管理思维诊断测试</p>
        </div>
        
        <div style="background: linear-gradient(135deg, #3b82f6, #6366f1); color: white; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
          <h2 style="margin: 0 0 10px 0; font-size: 24px;">您的项目管理水平：${data.advice.level === 'beginner' ? '初学者' : data.advice.level === 'intermediate' ? '进阶者' : '专家级'}</h2>
          <div style="font-size: 36px; font-weight: bold; margin: 15px 0;">${data.totalScore}分</div>
          <p style="margin: 0; opacity: 0.9;">${data.advice.levelDescription}</p>
        </div>
        
        <div style="background: #f8fafc; padding: 25px; border-radius: 12px; margin-bottom: 25px;">
          <h3 style="color: #1f2937; margin-bottom: 15px;">整体评价</h3>
          <p style="color: #4b5563; line-height: 1.6; margin: 0;">${data.advice.overallAdvice}</p>
        </div>
        
        <div style="margin-bottom: 25px;">
          <h3 style="color: #1f2937; margin-bottom: 15px;">各维度得分</h3>
          ${Object.entries(data.dimensionScores)
            .map(([dimension, score]: [string, any]) => {
              const dimensionNames: Record<string, string> = {
                time_management: '时间管理',
                resource_coordination: '资源协调',
                risk_control: '风险控制',
                team_collaboration: '团队协作',
              };
              const barColor =
                score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';
              return `
              <div style="margin-bottom: 15px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                  <span style="color: #374151; font-weight: 500;">${dimensionNames[dimension]}</span>
                  <span style="color: ${barColor}; font-weight: bold;">${score}分</span>
                </div>
                <div style="background: #e5e7eb; height: 8px; border-radius: 4px; overflow: hidden;">
                  <div style="background: ${barColor}; height: 100%; width: ${score}%; transition: width 0.3s ease;"></div>
                </div>
              </div>
            `;
            })
            .join('')}
        </div>
        
        <div style="background: #fef3c7; border: 1px solid #fbbf24; padding: 20px; border-radius: 12px; margin-bottom: 25px;">
          <h3 style="color: #92400e; margin-bottom: 15px;">提升建议</h3>
          <ul style="color: #92400e; margin: 0; padding-left: 20px;">
            ${data.advice.nextSteps.map((step: string) => `<li style="margin-bottom: 8px;">${step}</li>`).join('')}
          </ul>
        </div>
        
        <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 25px; border-radius: 12px; text-align: center; margin-bottom: 25px;">
          <h3 style="margin: 0 0 15px 0;">关键链项目管理（CCPM）</h3>
          <p style="margin: 0 0 20px 0; opacity: 0.9;">突破传统项目管理瓶颈，实现项目成功率提升30%+</p>
          <a href="https://ccpm360.com/contact" style="display: inline-block; background: white; color: #6366f1; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">免费咨询CCPM解决方案</a>
        </div>
        
        <div style="text-align: center; padding: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
          <p>CCPM360 - 专业的关键链项目管理解决方案提供商</p>
          <p>如有疑问，请联系我们：info@ccpm360.com | 400-123-4567</p>
        </div>
      </div>
    `,
  },

  follow_up_1: {
    subject: '深入了解CCPM：传统项目管理的突破之道',
    template: () => `
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
          <a href="https://ccpm360.com/resources" style="display: inline-block; background: #2563eb; color: white; padding: 15px 30px; border-radius: 8px; text-decoration: none; font-weight: 600;">获取免费CCPM学习资料</a>
        </div>
        
        <p>最佳祝愿，<br>CCPM360团队</p>
      </div>
    `,
  },

  follow_up_2: {
    subject: 'CCPM实战案例：看看其他企业如何成功转型',
    template: () => `
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
          <a href="https://ccpm360.com/cases" style="display: inline-block; background: #059669; color: white; padding: 15px 30px; border-radius: 8px; text-decoration: none; font-weight: 600;">查看更多成功案例</a>
        </div>
        
        <p>想了解CCPM如何帮助您的企业？我们提供免费的项目诊断服务。</p>
        
        <p>最佳祝愿，<br>CCPM360团队</p>
      </div>
    `,
  },
};

// 发送邮件函数（这里使用模拟，实际项目中需要集成真实的邮件服务）
async function sendEmail(to: string, subject: string, html: string) {
  // 这里可以集成 SendGrid, AWS SES, 或其他邮件服务
  // 目前返回模拟成功结果
  console.log('Sending email to:', to);
  console.log('Subject:', subject);
  console.log('HTML content length:', html.length);

  // 模拟邮件发送延迟
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return { success: true, messageId: `msg_${Date.now()}` };
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

    // 发送主邮件
    const emailHtml = template.template(data);
    const result = await sendEmail(recipientEmail, template.subject, emailHtml);

    if (!result.success) {
      throw new Error('Failed to send email');
    }

    // 记录邮件发送历史
    const { error: insertError } = await supabase.from('email_history').insert({
      recipient_email: recipientEmail,
      email_type: type,
      subject: template.subject,
      sent_at: new Date().toISOString(),
      assessment_id: data.id,
      status: 'sent',
    });

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
