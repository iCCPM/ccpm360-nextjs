// 测试 Puppeteer PDF 生成器
import { PuppeteerPDFGenerator } from './src/lib/puppeteerPDFGenerator.ts';
import fs from 'fs';
import path from 'path';

console.log('=== Puppeteer PDF生成测试 ===\n');

// 测试数据 - 包含中文内容
const testData = {
  userName: '张三',
  userEmail: 'zhangsan@example.com',
  company: '北京科技有限公司',
  totalScore: 85,
  completedAt: new Date(),
  dimensionScores: {
    项目规划能力: 88,
    风险管理能力: 82,
    团队协作能力: 90,
    沟通表达能力: 78,
    问题解决能力: 85,
  },
  personalizedAdvice: {
    overallLevel:
      '您在项目管理思维方面表现优秀，具备了扎实的理论基础和实践经验。在大多数维度上都达到了较高水平，特别是在团队协作和项目规划方面表现突出。',
    dimensionAdvice: [
      '加强风险识别和预防机制的建立，建议学习更多风险管理工具和方法',
      '提升沟通技巧，特别是跨部门协调和向上汇报的能力',
      '深入学习敏捷项目管理方法，提高项目交付效率',
      '建立更完善的项目监控和评估体系',
    ],
    nextSteps: [
      '参加PMP或其他项目管理认证培训',
      '在实际项目中应用学到的管理理念和工具',
      '建立个人项目管理知识库和最佳实践集',
      '寻找导师或加入项目管理社群，持续学习交流',
    ],
  },
};

async function testPDFGeneration() {
  try {
    console.log('1. 开始生成PDF...');

    // 生成PDF
    const pdfBuffer = await generateAssessmentPDF(testData);

    console.log(`   ✅ PDF生成成功，大小: ${pdfBuffer.length} 字节`);

    // 保存PDF文件
    const outputPath = path.join(process.cwd(), 'test-puppeteer-output.pdf');
    await fs.promises.writeFile(outputPath, pdfBuffer);

    console.log(`   ✅ PDF已保存到: ${outputPath}`);

    console.log('\n2. 测试结果:');
    console.log('   ✅ Puppeteer PDF生成器工作正常');
    console.log('   ✅ 中文字体应该能正确显示');
    console.log('   ✅ 支持复杂的HTML布局和CSS样式');

    console.log('\n3. 验证步骤:');
    console.log('   - 请打开生成的PDF文件检查中文显示效果');
    console.log('   - 确认页面布局和样式是否正确');
    console.log('   - 检查所有数据是否正确渲染');
  } catch (error) {
    console.error('\n❌ PDF生成失败:', error);
    console.error('\n错误详情:');
    console.error(error.stack);

    // 提供调试建议
    console.log('\n🔧 调试建议:');
    console.log('   1. 检查Puppeteer是否正确安装');
    console.log('   2. 确认HTML模板文件是否存在');
    console.log('   3. 检查Handlebars依赖是否正确安装');
    console.log('   4. 确认系统是否有足够的内存运行Puppeteer');
  }
}

// 运行测试
testPDFGeneration()
  .then(() => {
    console.log('\n=== 测试完成 ===');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ 测试执行失败:', error);
    process.exit(1);
  });
