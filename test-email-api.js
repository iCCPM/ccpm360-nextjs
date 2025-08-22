// 测试邮件API功能
import fetch from 'node-fetch';

console.log('=== CCPM360 邮件API测试 ===\n');

// 测试数据
const testAssessmentData = {
  userName: '张三',
  userEmail: 'test@example.com', // 请替换为您的测试邮箱
  company: '北京科技有限公司',
  assessmentType: 'CCPM成熟度评估',
  totalScore: 85,
  maxScore: 100,
  assessmentLevel: '良好',
  dimensionScores: {
    项目管理基础: 80,
    关键链应用: 90,
    团队协作: 85,
    风险管理: 82,
  },
  personalizedAdvice: {
    overallLevel:
      '您的CCPM成熟度处于良好水平，在关键链应用方面表现突出，建议继续深化实践应用。',
    dimensionAdvice: [
      '建议加强项目管理基础知识的学习，特别是在项目计划和执行方面',
      '继续深化关键链项目管理的实践应用，可以尝试在更复杂的项目中应用',
      '提升团队沟通协作效率，建立更好的团队协作机制',
      '加强风险识别和管理能力，建立完善的风险管控体系',
    ],
    nextSteps: [
      '参加CCPM高级培训课程，提升理论水平',
      '在实际项目中应用关键链方法，积累实践经验',
      '建立项目管理知识库，持续学习和改进',
      '与其他项目经理交流经验，分享最佳实践',
    ],
  },
  completedAt: new Date().toISOString(),
};

// 测试邮件发送API
async function testEmailAPI() {
  const baseURL = 'http://localhost:3000'; // 确保开发服务器正在运行

  console.log('1. 测试基本邮件发送API...');

  try {
    const basicEmailResponse = await fetch(`${baseURL}/api/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: testAssessmentData.userEmail,
        subject: 'CCPM360 邮件发送测试',
        html: `
          <h2>CCPM360 邮件发送测试</h2>
          <p>这是一封测试邮件，用于验证邮件发送功能是否正常。</p>
          <p>发送时间: ${new Date().toLocaleString('zh-CN')}</p>
          <p>如果您收到这封邮件，说明邮件发送功能正常工作。</p>
        `,
      }),
    });

    if (basicEmailResponse.ok) {
      const result = await basicEmailResponse.json();
      console.log('   ✅ 基本邮件发送成功:', result.message);
    } else {
      const error = await basicEmailResponse.text();
      console.log('   ❌ 基本邮件发送失败:', error);
    }
  } catch (error) {
    console.log('   ❌ 基本邮件发送失败:', error.message);
  }

  console.log('\n2. 测试评估报告邮件发送API...');

  try {
    const assessmentEmailResponse = await fetch(
      `${baseURL}/api/send-assessment-email`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testAssessmentData),
      }
    );

    if (assessmentEmailResponse.ok) {
      const result = await assessmentEmailResponse.json();
      console.log('   ✅ 评估报告邮件发送成功:', result.message);
    } else {
      const error = await assessmentEmailResponse.text();
      console.log('   ❌ 评估报告邮件发送失败:', error);
    }
  } catch (error) {
    console.log('   ❌ 评估报告邮件发送失败:', error.message);
  }
}

// 检查开发服务器状态
async function checkServerStatus() {
  console.log('检查开发服务器状态...');

  try {
    // 直接测试一个简单的API调用
    const response = await fetch('http://localhost:3000/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: 'test@example.com',
        subject: '服务器状态检查',
        html: '测试',
      }),
    });

    // 不管成功失败，只要能连接就说明服务器在运行
    console.log('✅ 开发服务器正在运行\n');
    return true;
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ 无法连接到开发服务器');
      console.log('请确保运行了 npm run dev 启动开发服务器\n');
      return false;
    }
    // 其他错误可能是API错误，但服务器在运行
    console.log('✅ 开发服务器正在运行\n');
    return true;
  }
}

// 运行测试
async function runTests() {
  const serverRunning = await checkServerStatus();

  if (!serverRunning) {
    console.log('请先启动开发服务器：npm run dev');
    process.exit(1);
  }

  await testEmailAPI();

  console.log('\n=== 测试完成 ===');
  console.log('\n注意事项:');
  console.log('1. 请将测试邮箱地址替换为您的真实邮箱');
  console.log('2. 检查垃圾邮件文件夹');
  console.log('3. 确保.env文件中的邮件配置正确');
  console.log('4. 如果发送失败，请检查网络连接和邮箱配置');
}

runTests().catch((error) => {
  console.error('测试过程中发生错误:', error);
  process.exit(1);
});
