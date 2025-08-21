const testEmailSending = async () => {
  const testData = {
    recipientEmail: 'itoc.ccpm@gmail.com',
    type: 'assessment_result',
    data: {
      totalScore: 75,
      advice: {
        level: 'intermediate',
        levelDescription: '您在项目管理方面具备良好的基础能力',
        overallAdvice: '建议您继续深化项目管理理论学习',
        nextSteps: [
          '加强风险管理能力',
          '提升团队协作技能',
          '学习敏捷项目管理方法',
        ],
      },
      dimensionScores: [
        { dimension: '时间管理', score: 80 },
        { dimension: '资源配置', score: 70 },
        { dimension: '风险控制', score: 75 },
      ],
    },
  };

  try {
    const response = await fetch('http://localhost:3000/api/assessment/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    const result = await response.text();
    console.log('Response status:', response.status);
    console.log('Response:', result);

    if (response.ok) {
      console.log('✅ 邮件发送成功!');
    } else {
      console.log('❌ 邮件发送失败:', result);
    }
  } catch (error) {
    console.error('❌ 请求错误:', error);
  }
};

testEmailSending();
