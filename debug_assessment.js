// 调试评估结果显示问题
const testData = {
  id: 'test-id',
  totalScore: 85,
  dimensionScores: {
    time_management: 90,
    resource_coordination: 80,
    risk_control: 85,
    team_collaboration: 85,
  },
  advice: {
    level: 'advanced',
    levelDescription: '专家级',
    overallAdvice: '您的项目管理能力很强',
    dimensionAdvice: {},
    nextSteps: ['继续保持'],
  },
  completedAt: new Date().toISOString(),
};

console.log('测试数据:', JSON.stringify(testData, null, 2));
console.log('totalScore值:', testData.totalScore);
console.log('totalScore类型:', typeof testData.totalScore);
