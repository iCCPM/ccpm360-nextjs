import puppeteer, { Browser } from 'puppeteer';
import * as fs from 'fs/promises';
import * as path from 'path';
import Handlebars from 'handlebars';

// 动态导入chromium函数
async function loadChromium() {
  if (process.env.NODE_ENV === 'production' || process.env['VERCEL']) {
    try {
      const chromiumModule = await import('@sparticuz/chromium');
      return chromiumModule.default || chromiumModule;
    } catch (error) {
      console.warn('Failed to load @sparticuz/chromium:', error);
      return null;
    }
  }
  return null;
}

// 定义接口类型
interface UserInfo {
  name: string;
  email: string;
  company?: string;
}

interface DimensionScore {
  dimension: string;
  score: number;
  maxScore: number;
}

interface PersonalizedAdvice {
  overallLevel?: string;
  dimensionAdvice?: string[];
  nextSteps?: string[];
}

interface AssessmentData {
  userInfo: UserInfo;
  totalScore: number;
  maxTotalScore: number;
  dimensionScores: DimensionScore[];
  personalizedAdvice?: PersonalizedAdvice;
  completedAt: Date;
}

// Handlebars 辅助函数
Handlebars.registerHelper('@index_plus_one', function () {
  // @ts-expect-error - this参数类型问题
  return (this as any)['@index'] + 1;
});

// 注册inc助手函数用于索引递增
Handlebars.registerHelper('inc', function (value: number) {
  return parseInt(value.toString()) + 1;
});

export class PuppeteerPDFGenerator {
  private templatePath: string;
  private browser: Browser | null = null;

  constructor() {
    this.templatePath = path.join(
      process.cwd(),
      'src',
      'templates',
      'pdf-report.html'
    );
  }

  /**
   * 关闭浏览器实例
   */
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  /**
   * 获取得分对应的颜色类名
   */
  private getScoreClass(score: number, maxScore: number = 100): string {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 85) return 'score-excellent';
    if (percentage >= 70) return 'score-good';
    if (percentage >= 50) return 'score-average';
    return 'score-poor';
  }

  /**
   * 获取评估等级
   */
  private getAssessmentLevel(score: number, maxScore: number = 100): string {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 85) return '优秀';
    if (percentage >= 70) return '良好';
    if (percentage >= 50) return '一般';
    return '待提升';
  }

  /**
   * 获取评估等级对应的徽章类名
   */
  private getBadgeClass(score: number, maxScore: number = 100): string {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 85) return 'score-excellent';
    if (percentage >= 70) return 'score-good';
    if (percentage >= 50) return 'score-average';
    return 'score-poor';
  }

  /**
   * 格式化日期
   */
  private formatDate(date: Date): string {
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /**
   * 获取用户姓名首字母
   */
  private getUserInitial(name: string): string {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  }

  /**
   * 准备模板数据
   */
  private prepareTemplateData(data: AssessmentData): any {
    const totalScorePercent = (data.totalScore / data.maxTotalScore) * 100;

    return {
      // 用户信息
      userName: data.userInfo.name,
      userEmail: data.userInfo.email,
      company: data.userInfo.company || '未填写',
      userInitial: this.getUserInitial(data.userInfo.name),
      completedAt: this.formatDate(data.completedAt),

      // 总体得分
      totalScore: data.totalScore,
      totalScorePercent: totalScorePercent.toFixed(1),
      totalScoreClass: this.getScoreClass(data.totalScore, data.maxTotalScore),
      assessmentLevel: this.getAssessmentLevel(
        data.totalScore,
        data.maxTotalScore
      ),
      badgeClass: this.getBadgeClass(data.totalScore, data.maxTotalScore),

      // 维度得分
      dimensionScores: data.dimensionScores.map((dim) => ({
        dimension: dim.dimension,
        score: dim.score,
        scorePercent: ((dim.score / dim.maxScore) * 100).toFixed(1),
        scoreClass: this.getScoreClass(dim.score, dim.maxScore),
      })),

      // 个性化建议
      personalizedAdvice: data.personalizedAdvice,

      // 报告生成时间
      reportGeneratedAt: this.formatDate(new Date()),
    };
  }

  /**
   * 生成PDF报告
   */
  async generateReport(data: AssessmentData): Promise<Buffer> {
    let browser = null;
    let page = null;

    try {
      // 读取HTML模板
      const templateContent = await fs.readFile(this.templatePath, 'utf-8');

      // 编译模板
      const template = Handlebars.compile(templateContent);

      // 准备数据
      const templateData = this.prepareTemplateData(data);

      // 渲染HTML
      const html = template(templateData);

      // 为每次生成创建新的浏览器实例
      const isProduction =
        process.env.NODE_ENV === 'production' || process.env['VERCEL'];
      const chromium = await loadChromium();

      if (isProduction && chromium) {
        // Vercel环境使用chromium
        browser = await puppeteer.launch({
          args: chromium.args,
          defaultViewport: null,
          executablePath: await chromium.executablePath(),
          headless: true,
          // @ts-expect-error - ignoreHTTPSErrors属性在@sparticuz/chromium中使用但不在puppeteer类型定义中
          ignoreHTTPSErrors: true,
          timeout: 30000,
        });
      } else {
        // 本地开发环境使用标准puppeteer
        browser = await puppeteer.launch({
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--disable-gpu',
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor',
          ],
          timeout: 30000,
        });
      }

      page = await browser.newPage();

      // 设置页面视口
      await page.setViewport({ width: 1200, height: 800 });

      // 设置页面内容
      await page.setContent(html, {
        waitUntil: 'networkidle0',
        timeout: 30000,
      });

      // 等待页面完全渲染
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // 生成PDF
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '0mm',
          right: '0mm',
          bottom: '0mm',
          left: '0mm',
        },
        preferCSSPageSize: true,
        timeout: 30000,
      });

      return Buffer.from(pdfBuffer);
    } catch (error) {
      // 增强错误日志，包含环境信息
      const isProduction =
        process.env.NODE_ENV === 'production' || process.env['VERCEL'];
      const chromium = await loadChromium();
      const envInfo = isProduction ? '生产环境' : '开发环境';
      const chromiumInfo = chromium
        ? '使用@sparticuz/chromium'
        : '使用标准puppeteer';

      console.error(`PDF生成失败 [${envInfo}, ${chromiumInfo}]:`, error);

      // 如果是Vercel环境，记录更多调试信息
      if (isProduction) {
        console.error('Vercel环境PDF生成详细信息:', {
          nodeEnv: process.env.NODE_ENV,
          isVercel: !!process.env['VERCEL'],
          hasChromium: !!chromium,
          templatePath: this.templatePath,
          error: error instanceof Error ? error.stack : String(error),
        });
      }

      throw new Error(
        `PDF生成失败 [${envInfo}]: ${error instanceof Error ? error.message : '未知错误'}`
      );
    } finally {
      // 确保资源被正确清理
      if (page) {
        try {
          await page.close();
        } catch (e) {
          console.warn('关闭页面时出错:', e);
        }
      }
      if (browser) {
        try {
          await browser.close();
        } catch (e) {
          console.warn('关闭浏览器时出错:', e);
        }
      }
    }
  }

  /**
   * 生成并保存PDF文件
   */
  async generateAndSave(
    data: AssessmentData,
    outputPath: string
  ): Promise<void> {
    const pdfBuffer = await this.generateReport(data);
    await fs.writeFile(outputPath, pdfBuffer);
  }
}

// 导出兼容的生成函数，保持与原有API的兼容性
export async function generateAssessmentPDF(
  data: AssessmentData
): Promise<Buffer> {
  const generator = new PuppeteerPDFGenerator();
  return await generator.generateReport(data);
}

// 导出类型定义
export type { UserInfo, DimensionScore, PersonalizedAdvice, AssessmentData };
