import { NextRequest, NextResponse } from 'next/server';
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

// 警告级别
type AlertLevel = 'warning' | 'critical';

// 警告数据接口
interface AlertData {
  service: 'supabase' | 'vercel';
  metric: string;
  percentage: number;
  used: number;
  limit: number;
  level: AlertLevel;
}

// 创建邮件传输器
function createTransporter(): nodemailer.Transporter {
  const config: EmailConfig = {
    host: process.env['SMTP_HOST'] || 'smtp.gmail.com',
    port: parseInt(process.env['SMTP_PORT'] || '587'),
    secure: process.env['SMTP_SECURE'] === 'true',
    auth: {
      user: process.env['SMTP_USER'] || '',
      pass: process.env['SMTP_PASS'] || '',
    },
  };

  return nodemailer.createTransport(config);
}

// 生成邮件内容
function generateEmailContent(alerts: AlertData[]): {
  subject: string;
  html: string;
} {
  const criticalAlerts = alerts.filter((alert) => alert.level === 'critical');
  const warningAlerts = alerts.filter((alert) => alert.level === 'warning');

  const subject =
    criticalAlerts.length > 0
      ? '🚨 CCPM360 服务额度严重警告'
      : '⚠️ CCPM360 服务额度警告';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${subject}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
        .alert { margin: 15px 0; padding: 15px; border-radius: 6px; border-left: 4px solid; }
        .critical { background: #fef2f2; border-color: #ef4444; }
        .warning { background: #fffbeb; border-color: #f59e0b; }
        .metric { font-weight: bold; color: #1f2937; }
        .percentage { font-size: 1.2em; font-weight: bold; }
        .footer { margin-top: 20px; padding: 15px; background: #e5e7eb; border-radius: 6px; font-size: 0.9em; color: #6b7280; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏢 CCPM360 服务额度监控</h1>
          <p>检测到服务额度使用异常，请及时处理</p>
        </div>
        <div class="content">
          <p>您好，</p>
          <p>我们检测到以下服务的额度使用量已达到警告阈值：</p>
          
          ${
            criticalAlerts.length > 0
              ? `
            <h3 style="color: #ef4444;">🚨 严重警告 (≥90%)</h3>
            ${criticalAlerts
              .map(
                (alert) => `
              <div class="alert critical">
                <div class="metric">${alert.service.toUpperCase()} - ${alert.metric}</div>
                <div class="percentage" style="color: #ef4444;">${alert.percentage.toFixed(1)}% 已使用</div>
                <div>已使用: ${formatValue(alert.used, alert.metric)} / 限制: ${formatValue(alert.limit, alert.metric)}</div>
              </div>
            `
              )
              .join('')}
          `
              : ''
          }
          
          ${
            warningAlerts.length > 0
              ? `
            <h3 style="color: #f59e0b;">⚠️ 警告 (≥80%)</h3>
            ${warningAlerts
              .map(
                (alert) => `
              <div class="alert warning">
                <div class="metric">${alert.service.toUpperCase()} - ${alert.metric}</div>
                <div class="percentage" style="color: #f59e0b;">${alert.percentage.toFixed(1)}% 已使用</div>
                <div>已使用: ${formatValue(alert.used, alert.metric)} / 限制: ${formatValue(alert.limit, alert.metric)}</div>
              </div>
            `
              )
              .join('')}
          `
              : ''
          }
          
          <h3>建议操作：</h3>
          <ul>
            <li>检查并优化数据库查询和存储使用</li>
            <li>考虑升级到付费计划以获得更多额度</li>
            <li>监控应用使用情况，避免不必要的资源消耗</li>
            <li>设置更频繁的监控以及时发现问题</li>
          </ul>
        </div>
        <div class="footer">
          <p>此邮件由 CCPM360 额度监控系统自动发送</p>
          <p>发送时间: ${new Date().toLocaleString('zh-CN')}</p>
          <p>如需帮助，请联系系统管理员</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return { subject, html };
}

// 格式化数值显示
function formatValue(value: number, metric: string): string {
  if (
    metric.includes('带宽') ||
    metric.includes('存储') ||
    metric.includes('数据库')
  ) {
    if (value >= 1024 * 1024 * 1024) {
      return `${(value / 1024 / 1024 / 1024).toFixed(2)} GB`;
    } else if (value >= 1024 * 1024) {
      return `${(value / 1024 / 1024).toFixed(1)} MB`;
    } else if (value >= 1024) {
      return `${(value / 1024).toFixed(1)} KB`;
    }
    return `${value} B`;
  }
  return value.toLocaleString();
}

// 发送邮件
async function sendAlert(alerts: AlertData[]): Promise<boolean> {
  try {
    const transporter = createTransporter();
    const { subject, html } = generateEmailContent(alerts);

    const mailOptions = {
      from: process.env['SMTP_FROM'] || process.env['SMTP_USER'],
      to: process.env['ALERT_EMAIL'] || 'admin@ccpm360.com',
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('发送邮件失败:', error);
    return false;
  }
}

// 检查是否需要发送警告
function shouldSendAlert(percentage: number, lastAlertTime?: number): boolean {
  // 如果使用率低于80%，不发送警告
  if (percentage < 80) return false;

  // 如果没有上次警告时间记录，发送警告
  if (!lastAlertTime) return true;

  // 如果距离上次警告超过1小时，可以再次发送
  const oneHour = 60 * 60 * 1000;
  return Date.now() - lastAlertTime > oneHour;
}

// 存储上次警告时间（简单内存存储，生产环境建议使用数据库）
const lastAlertTimes = new Map<string, number>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { quotaData } = body;

    if (!quotaData) {
      return NextResponse.json({ error: '缺少额度数据' }, { status: 400 });
    }

    const alerts: AlertData[] = [];
    const currentTime = Date.now();

    // 检查 Supabase 各项指标（处理数组格式）
    if (quotaData.supabase && Array.isArray(quotaData.supabase)) {
      for (const metric of quotaData.supabase) {
        const { percentage, used, limit, metric: metricName } = metric;
        const alertKey = `supabase-${metricName.replace(/\s+/g, '-').toLowerCase()}`;

        if (
          percentage >= 80 &&
          shouldSendAlert(percentage, lastAlertTimes.get(alertKey))
        ) {
          alerts.push({
            service: 'supabase',
            metric: metricName,
            percentage,
            used,
            limit,
            level: percentage >= 90 ? 'critical' : 'warning',
          });
          lastAlertTimes.set(alertKey, currentTime);
        }
      }
    }

    // 检查 Vercel 各项指标（处理数组格式）
    if (quotaData.vercel && Array.isArray(quotaData.vercel)) {
      for (const metric of quotaData.vercel) {
        const { percentage, used, limit, metric: metricName } = metric;
        const alertKey = `vercel-${metricName.replace(/\s+/g, '-').toLowerCase()}`;

        if (
          percentage >= 80 &&
          shouldSendAlert(percentage, lastAlertTimes.get(alertKey))
        ) {
          alerts.push({
            service: 'vercel',
            metric: metricName,
            percentage,
            used,
            limit,
            level: percentage >= 90 ? 'critical' : 'warning',
          });
          lastAlertTimes.set(alertKey, currentTime);
        }
      }
    }

    // 如果有警告，发送邮件
    if (alerts.length > 0) {
      const emailSent = await sendAlert(alerts);

      return NextResponse.json({
        success: true,
        alertsSent: alerts.length,
        emailSent,
        alerts: alerts.map((alert) => ({
          service: alert.service,
          metric: alert.metric,
          percentage: alert.percentage,
          level: alert.level,
        })),
      });
    }

    return NextResponse.json({
      success: true,
      alertsSent: 0,
      message: '所有服务额度正常',
    });
  } catch (error) {
    console.error('处理额度警告失败:', error);
    return NextResponse.json({ error: '处理额度警告失败' }, { status: 500 });
  }
}

// 支持 OPTIONS 请求（CORS）
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
