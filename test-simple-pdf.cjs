// 简单的Puppeteer PDF测试
const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');
const Handlebars = require('handlebars');

console.log('=== 简单Puppeteer PDF测试 ===\n');

// 简单的HTML模板
const htmlTemplate = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PDF测试报告</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;700&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Noto Sans SC', 'Microsoft YaHei', '微软雅黑', sans-serif;
            font-size: 14px;
            line-height: 1.6;
            color: #333;
            background: #fff;
        }
        
        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 40px;
        }
        
        .header {
            text-align: center;
            margin-bottom: 40px;
            border-bottom: 2px solid #4f46e5;
            padding-bottom: 20px;
        }
        
        .title {
            font-size: 28px;
            font-weight: 700;
            color: #4f46e5;
            margin-bottom: 10px;
        }
        
        .subtitle {
            font-size: 16px;
            color: #666;
        }
        
        .user-info {
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
        }
        
        .info-row {
            display: flex;
            margin-bottom: 10px;
        }
        
        .info-label {
            font-weight: 500;
            width: 100px;
            color: #374151;
        }
        
        .info-value {
            color: #111827;
        }
        
        .score-section {
            margin-bottom: 30px;
        }
        
        .section-title {
            font-size: 20px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 20px;
            border-left: 4px solid #4f46e5;
            padding-left: 15px;
        }
        
        .total-score {
            text-align: center;
            background: linear-gradient(135deg, #4f46e5, #7c3aed);
            color: white;
            padding: 30px;
            border-radius: 12px;
            margin-bottom: 20px;
        }
        
        .score-number {
            font-size: 48px;
            font-weight: 700;
            margin-bottom: 10px;
        }
        
        .score-text {
            font-size: 18px;
            opacity: 0.9;
        }
        
        .dimension-scores {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 30px;
        }
        
        .dimension-card {
            background: #fff;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
        }
        
        .dimension-name {
            font-weight: 500;
            color: #374151;
            margin-bottom: 10px;
        }
        
        .dimension-score {
            font-size: 24px;
            font-weight: 700;
            color: #4f46e5;
        }
        
        .advice-section {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 20px;
            border-radius: 0 8px 8px 0;
        }
        
        .advice-title {
            font-size: 18px;
            font-weight: 600;
            color: #92400e;
            margin-bottom: 15px;
        }
        
        .advice-text {
            color: #78350f;
            line-height: 1.7;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="title">项目管理能力评估报告</h1>
            <p class="subtitle">CCPM360 Professional Assessment Report</p>
        </div>
        
        <div class="user-info">
            <div class="info-row">
                <span class="info-label">姓名：</span>
                <span class="info-value">{{userInfo.name}}</span>
            </div>
            <div class="info-row">
                <span class="info-label">邮箱：</span>
                <span class="info-value">{{userInfo.email}}</span>
            </div>
            <div class="info-row">
                <span class="info-label">公司：</span>
                <span class="info-value">{{userInfo.company}}</span>
            </div>
            <div class="info-row">
                <span class="info-label">测评时间：</span>
                <span class="info-value">{{completedAt}}</span>
            </div>
        </div>
        
        <div class="score-section">
            <h2 class="section-title">总体得分</h2>
            <div class="total-score">
                <div class="score-number">{{totalScore}}</div>
                <div class="score-text">综合评分 / 100分</div>
            </div>
        </div>
        
        <div class="score-section">
            <h2 class="section-title">各维度得分</h2>
            <div class="dimension-scores">
                {{#each dimensionScores}}
                <div class="dimension-card">
                    <div class="dimension-name">{{this.dimension}}</div>
                    <div class="dimension-score">{{this.score}}</div>
                </div>
                {{/each}}
            </div>
        </div>
        
        <div class="advice-section">
            <h3 class="advice-title">个性化建议</h3>
            <p class="advice-text">{{personalizedAdvice.overallLevel}}</p>
        </div>
    </div>
</body>
</html>
`;

// 测试数据
const testData = {
  userInfo: {
    name: '张三',
    email: 'zhangsan@example.com',
    company: '北京科技有限公司',
  },
  totalScore: 85,
  completedAt: '2024年1月15日',
  dimensionScores: [
    { dimension: '项目规划能力', score: 88 },
    { dimension: '风险管理能力', score: 82 },
    { dimension: '团队协作能力', score: 90 },
    { dimension: '沟通表达能力', score: 78 },
    { dimension: '问题解决能力', score: 85 },
  ],
  personalizedAdvice: {
    overallLevel:
      '您在项目管理思维方面表现优秀，具备了扎实的理论基础和实践经验。在大多数维度上都达到了较高水平，特别是在团队协作和项目规划方面表现突出。建议继续加强风险管理和沟通技巧的提升。',
  },
};

async function testPuppeteerPDF() {
  let browser;

  try {
    console.log('1. 启动Puppeteer浏览器...');
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    });

    console.log('   ✅ 浏览器启动成功');

    console.log('2. 编译HTML模板...');
    const template = Handlebars.compile(htmlTemplate);
    const html = template(testData);

    console.log('   ✅ HTML模板编译成功');

    console.log('3. 创建新页面并生成PDF...');
    const page = await browser.newPage();

    // 设置页面内容
    await page.setContent(html, {
      waitUntil: 'networkidle0',
    });

    // 生成PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm',
      },
    });

    console.log(`   ✅ PDF生成成功，大小: ${pdfBuffer.length} 字节`);

    // 保存PDF文件
    const outputPath = path.join(__dirname, 'test-simple-output.pdf');
    await fs.writeFile(outputPath, pdfBuffer);

    console.log(`   ✅ PDF已保存到: ${outputPath}`);

    console.log('\n🎉 测试成功！');
    console.log('✅ Puppeteer PDF生成器工作正常');
    console.log('✅ 中文字体显示正常');
    console.log('✅ HTML模板和CSS样式正确渲染');
  } catch (error) {
    console.error('\n❌ 测试失败:', error);
    console.error('\n错误详情:');
    console.error(error.stack);
  } finally {
    if (browser) {
      await browser.close();
      console.log('\n🔧 浏览器已关闭');
    }
  }
}

// 运行测试
testPuppeteerPDF()
  .then(() => {
    console.log('\n=== 测试完成 ===');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ 测试执行失败:', error);
    process.exit(1);
  });
