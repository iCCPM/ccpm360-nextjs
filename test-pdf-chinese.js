// 测试PDF中文显示
import fetch from 'node-fetch';

// 测试数据 - 包含中文内容
const testData = {
  to: 'test@example.com',
  subject: '测试PDF中文显示',
  type: 'assessment',
  data: {
    userName: '张三',
    userEmail: 'zhangsan@example.com',
    assessmentTitle: '领导力评估报告',
    completedAt: '2025-01-22 18:53:38',
    overallScore: 85,
    dimensions: [
      {
        name: '战略思维',
        score: 88,
        level: '优秀',
        description: '具备出色的战略规划和前瞻性思维能力',
      },
      {
        name: '团队协作',
        score: 82,
        level: '良好',
        description: '能够有效地与团队成员协作，促进团队和谐',
      },
      {
        name: '沟通表达',
        score: 90,
        level: '优秀',
        description: '沟通清晰，表达能力强，能够有效传达想法',
      },
    ],
    recommendations: [
      '继续保持优秀的沟通表达能力，可以考虑担任更多的演讲和培训角色',
      '在战略思维方面已经表现出色，建议参与更多的战略规划项目',
      '团队协作能力良好，可以通过参加团队建设活动进一步提升',
    ],
  },
};

async function testPDFChinese() {
  console.log('=== 测试PDF中文显示 ===\n');

  try {
    console.log('发送评估报告邮件（包含PDF附件）...');

    const response = await fetch('http://localhost:3000/api/assessment/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'assessment_result',
        recipientEmail: testData.to,
        data: testData.data,
      }),
    });

    const result = await response.text();

    if (response.ok) {
      console.log('✅ 邮件发送成功！');
      console.log('响应:', result);
      console.log('\n请检查邮箱中的PDF附件，确认中文内容是否正确显示。');
      console.log('\n预期内容:');
      console.log('- 用户名: 张三');
      console.log('- 评估标题: 领导力评估报告');
      console.log('- 维度名称: 战略思维、团队协作、沟通表达');
      console.log('- 等级: 优秀、良好');
      console.log('- 建议内容: 包含完整的中文建议文本');
    } else {
      console.log('❌ 邮件发送失败');
      console.log('状态码:', response.status);
      console.log('错误信息:', result);
    }
  } catch (error) {
    console.log('❌ 测试过程中发生错误:');
    console.log(error.message);
  }
}

// 运行测试
testPDFChinese();
