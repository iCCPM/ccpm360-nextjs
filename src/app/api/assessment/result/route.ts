import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

// 重新生成个性化建议（与submit接口保持一致）
function regenerateAdvice(scores: Record<string, number>, totalScore: number) {
  let level: string;
  let levelDescription: string;
  let overallAdvice: string;

  if (totalScore >= 85) {
    level = 'advanced';
    levelDescription = 'CCPM专家级';
    overallAdvice =
      '您对关键链项目管理有深入的理解！您已经掌握了CCPM的核心理念，建议您在实际项目中应用这些方法，并考虑成为团队的CCPM推广者。';
  } else if (totalScore >= 65) {
    level = 'intermediate';
    levelDescription = 'CCPM进阶级';
    overallAdvice =
      '您对项目管理有良好的基础理解，但在CCPM的某些核心概念上还有提升空间。建议深入学习关键链理论，特别关注缓冲管理和资源约束。';
  } else {
    level = 'beginner';
    levelDescription = 'CCPM入门级';
    overallAdvice =
      '您目前主要采用传统项目管理思维。CCPM能够显著提升项目成功率和效率，建议您系统学习关键链项目管理方法。';
  }

  const dimensionAdvice: Record<string, string> = {};

  const timeScore = scores?.['time_management'] || 0;
  if (timeScore < 70) {
    dimensionAdvice['time_management'] =
      '建议学习三点估算法和缓冲管理，避免在每个任务上都加安全时间，而是集中管理项目缓冲。';
  } else if (timeScore < 85) {
    dimensionAdvice['time_management'] =
      '您对时间管理有一定理解，可以进一步学习如何识别关键链和设置项目缓冲。';
  } else {
    dimensionAdvice['time_management'] =
      '您在时间管理方面表现优秀！继续保持对关键链识别和缓冲管理的重视。';
  }

  const resourceScore = scores?.['resource_coordination'] || 0;
  if (resourceScore < 70) {
    dimensionAdvice['resource_coordination'] =
      '建议重点学习瓶颈资源管理和多项目资源协调，避免资源在多任务间的低效切换。';
  } else if (resourceScore < 85) {
    dimensionAdvice['resource_coordination'] =
      '您对资源管理有基本认识，可以深入学习如何识别和管理瓶颈资源。';
  } else {
    dimensionAdvice['resource_coordination'] =
      '您在资源协调方面很有见解！继续关注瓶颈资源的识别和保护。';
  }

  const riskScore = scores?.['risk_control'] || 0;
  if (riskScore < 70) {
    dimensionAdvice['risk_control'] =
      '建议学习CCPM的缓冲监控方法，通过缓冲消耗率来科学监控项目风险。';
  } else if (riskScore < 85) {
    dimensionAdvice['risk_control'] =
      '您对风险控制有一定理解，可以进一步学习缓冲管理和项目监控方法。';
  } else {
    dimensionAdvice['risk_control'] =
      '您在风险控制方面表现出色！继续运用科学的缓冲监控方法。';
  }

  const teamScore = scores?.['team_collaboration'] || 0;
  if (teamScore < 70) {
    dimensionAdvice['team_collaboration'] =
      '建议学习如何消除学生综合症和帕金森定律，通过关键链管理提升团队协作效率。';
  } else if (teamScore < 85) {
    dimensionAdvice['team_collaboration'] =
      '您对团队协作有良好认识，可以进一步学习关键链在跨部门协作中的应用。';
  } else {
    dimensionAdvice['team_collaboration'] =
      '您在团队协作方面很有经验！继续推广关键链理念，提升团队整体效率。';
  }

  const steps = [];
  if (level === 'beginner') {
    steps.push('📚 阅读《关键链》一书，了解CCPM基础理论');
    steps.push('🎯 参加CCPM基础培训课程');
    steps.push('💼 联系我们获取免费的项目诊断服务');
  } else if (level === 'intermediate') {
    steps.push('🔧 在实际项目中尝试应用CCPM方法');
    steps.push('📊 学习使用CCPM项目管理工具');
    steps.push('👥 考虑参加CCPM认证培训');
  } else {
    steps.push('🏆 成为团队的CCPM推广者和教练');
    steps.push('🚀 在组织中推广CCPM最佳实践');
    steps.push('🤝 与我们合作，帮助更多企业实施CCPM');
  }

  const weakestDimension = Object.entries(scores).reduce((a, b) =>
    (scores[a[0]] || 0) < (scores[b[0]] || 0) ? a : b
  );

  if (weakestDimension[1] < 70) {
    const dimensionNames = {
      time_management: '时间管理',
      resource_coordination: '资源协调',
      risk_control: '风险控制',
      team_collaboration: '团队协作',
    };
    steps.push(
      `🎯 重点提升${dimensionNames[weakestDimension[0] as keyof typeof dimensionNames]}能力`
    );
  }

  return {
    level,
    levelDescription,
    overallAdvice,
    dimensionAdvice,
    nextSteps: steps,
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const email = searchParams.get('email');

    if (!id && !email) {
      return NextResponse.json(
        { error: 'Either id or email parameter is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    let query = supabase.from('assessment_records').select('*');

    if (id) {
      // 根据ID查询特定记录
      query = query.eq('id', id);
    } else if (email) {
      // 根据邮箱查询用户的所有记录
      query = query
        .eq('user_email', email)
        .order('completed_at', { ascending: false });
    }

    const { data: records, error } = await query;

    if (error) {
      console.error('Error fetching assessment records:', error);
      return NextResponse.json(
        { error: 'Failed to fetch assessment records' },
        { status: 500 }
      );
    }

    if (!records || records.length === 0) {
      return NextResponse.json(
        { error: 'No assessment records found' },
        { status: 404 }
      );
    }

    // 如果查询单个记录，返回详细信息
    if (id) {
      const record = records[0];
      const advice = regenerateAdvice(record.scores, record.total_score);

      const response = {
        id: record.id,
        totalScore: record.total_score,
        dimensionScores: record.scores,
        advice,
        completedAt: record.completed_at,
        userInfo: {
          name: record.user_name,
          email: record.user_email,
          company: record.user_company,
        },
      };

      return NextResponse.json(response);
    }

    // 如果查询用户的所有记录，返回列表
    const recordsList = records.map((record: any) => ({
      id: record.id,
      totalScore: record.total_score,
      assessmentLevel: record.assessment_level,
      completedAt: record.completed_at,
      dimensionScores: record.scores,
    }));

    return NextResponse.json({
      records: recordsList,
      total: recordsList.length,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
