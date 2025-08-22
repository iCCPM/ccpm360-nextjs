// 测试邮件发送功能
import fetch from 'node-fetch';

async function testEmailSending() {
  console.log('开始测试邮件发送功能...');

  const testData = {
    type: 'assessment_result',
    recipientEmail: 'test@example.com', // 可以改为你的测试邮箱
    data: {
      id: 'test-id-123',
      name: '测试用户',
      company: '测试公司',
      totalScore: 85,
      dimensionScores: {
        time_management: 80,
        resource_coordination: 85,
        risk_control: 90,
        team_collaboration: 85,
      },
      advice: {
        level: 'intermediate',
        levelDescription: '您对CCPM有一定了解',
        overallAdvice: '继续深入学习CCPM理论',
        dimensionAdvice: {
          time_management: '时间管理能力良好',
          resource_coordination: '资源协调能力优秀',
          risk_control: '风险控制意识很强',
          team_collaboration: '团队协作能力出色',
        },
        nextSteps: [
          '📚 阅读《关键链》一书',
          '🔧 在实际项目中应用CCPM',
          '📊 学习CCPM工具使用',
        ],
      },
    },
    scheduleFollowUp: true,
  };

  try {
    const response = await fetch('http://localhost:3000/api/assessment/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    const result = await response.json();

    console.log('响应状态:', response.status);
    console.log('响应结果:', JSON.stringify(result, null, 2));

    if (response.ok && result.success) {
      console.log('✅ 邮件发送测试成功！');
    } else {
      console.log('❌ 邮件发送测试失败！');
      console.log('错误信息:', result.error || result.message);
    }
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message);
  }
}

// 运行测试
testEmailSending();
