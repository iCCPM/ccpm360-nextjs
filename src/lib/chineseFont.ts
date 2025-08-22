// Chinese font support file
// Using lightweight Chinese font solution

// Chinese character to English mapping table (fallback solution when font loading fails)
export const chineseFontMapping: { [key: string]: string } = {
  // Complete vocabulary mapping - core terms
  项目管理: 'Project Management',
  思维诊断: 'Thinking Diagnosis',
  评估报告: 'Assessment Report',
  综合得分: 'Overall Score',
  维度得分: 'Dimension Score',
  个性化建议: 'Personalized Advice',
  测评者信息: 'Assessor Information',
  总体评估结果: 'Overall Assessment Results',
  各维度得分详情: 'Dimension Score Details',
  个性化分析与建议: 'Personalized Analysis and Recommendations',
  维度改进建议: 'Dimension Improvement Suggestions',
  下一步行动建议: 'Next Action Recommendations',
  报告生成时间: 'Report Generation Time',
  测试用户: 'Test User',

  // Extended vocabulary mapping - project management related
  项目计划: 'Project Planning',
  风险管理: 'Risk Management',
  质量控制: 'Quality Control',
  团队协作: 'Team Collaboration',
  沟通管理: 'Communication Management',
  时间管理: 'Time Management',
  成本控制: 'Cost Control',
  资源配置: 'Resource Allocation',
  进度跟踪: 'Progress Tracking',
  问题解决: 'Problem Solving',
  决策制定: 'Decision Making',
  领导能力: 'Leadership Skills',
  执行力: 'Execution Capability',
  创新思维: 'Innovative Thinking',
  战略规划: 'Strategic Planning',

  // Assessment related terms
  能力评估: 'Capability Assessment',
  绩效评价: 'Performance Evaluation',
  技能水平: 'Skill Level',
  专业能力: 'Professional Competency',
  学习能力: 'Learning Ability',
  适应能力: 'Adaptability',
  协调能力: 'Coordination Skills',
  分析能力: 'Analytical Skills',
  组织能力: 'Organizational Skills',
  管理经验: 'Management Experience',

  // Status and levels
  优秀: 'Excellent',
  良好: 'Good',
  一般: 'Average',
  待改进: 'Needs Improvement',
  需要关注: 'Requires Attention',
  已完成: 'Completed',
  进行中: 'In Progress',
  未开始: 'Not Started',
  已延期: 'Delayed',
  已取消: 'Cancelled',

  // Time related
  今天: 'Today',
  昨天: 'Yesterday',
  明天: 'Tomorrow',
  本周: 'This Week',
  上周: 'Last Week',
  下周: 'Next Week',
  本月: 'This Month',
  上月: 'Last Month',
  下月: 'Next Month',
  本年: 'This Year',
  去年: 'Last Year',
  明年: 'Next Year',

  // Single character mapping
  用: 'Yong',
  户: 'Hu',
  邮: 'You',
  箱: 'Xiang',
  公: 'Gong',
  司: 'Si',
  完: 'Wan',
  成: 'Cheng',
  时: 'Shi',
  间: 'Jian',
  生: 'Sheng',
  未: 'Wei',
  填: 'Tian',
  写: 'Xie',
  知: 'Zhi',
  年: 'Nian',
  月: 'Yue',
  日: 'Ri',
};

// Lightweight Chinese font base64 data (removed, no longer used)
// Now directly use Chinese to English mapping conversion
export const lightChineseFontBase64 = '';

// Helper function to check if font supports Chinese characters
export function supportsChinese(): boolean {
  // Simple detection of whether browser supports Chinese font rendering
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return false;

    ctx.font = '12px sans-serif';
    const width1 = ctx.measureText('test').width;
    ctx.font = '12px monospace';
    const width2 = ctx.measureText('test').width;

    return width1 !== width2;
  } catch {
    return false;
  }
}
