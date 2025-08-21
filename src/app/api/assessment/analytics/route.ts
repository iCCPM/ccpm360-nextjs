import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env['NEXT_PUBLIC_SUPABASE_URL']!,
  process.env['SUPABASE_SERVICE_ROLE_KEY']!
);

// GET - 获取评测分析数据
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    // const dimension = searchParams.get('dimension') || 'all'

    // 获取总评测数
    let totalQuery = supabase
      .from('assessment_records')
      .select('*', { count: 'exact', head: true });

    if (startDate && endDate) {
      totalQuery = totalQuery
        .gte('created_at', startDate)
        .lte('created_at', endDate);
    }

    const { count: totalAssessments } = await totalQuery;

    // 获取平均分数
    let scoreQuery = supabase.from('assessment_records').select('total_score');

    if (startDate && endDate) {
      scoreQuery = scoreQuery
        .gte('created_at', startDate)
        .lte('created_at', endDate);
    }

    const { data: scoreData } = await scoreQuery;

    const averageScore =
      scoreData && scoreData.length > 0
        ? scoreData.reduce(
            (sum, record) => sum + (record.total_score || 0),
            0
          ) / scoreData.length
        : 0;

    // 获取分数分布
    const scoreDistribution = {
      '0-20': 0,
      '21-40': 0,
      '41-60': 0,
      '61-80': 0,
      '81-100': 0,
    };

    if (scoreData) {
      scoreData.forEach((record) => {
        const score = record.total_score || 0;
        if (score <= 20) scoreDistribution['0-20']++;
        else if (score <= 40) scoreDistribution['21-40']++;
        else if (score <= 60) scoreDistribution['41-60']++;
        else if (score <= 80) scoreDistribution['61-80']++;
        else scoreDistribution['81-100']++;
      });
    }

    // 获取维度平均分
    const dimensionScores = {
      leadership: 0,
      communication: 0,
      problem_solving: 0,
      teamwork: 0,
      innovation: 0,
    };

    if (scoreData && scoreData.length > 0) {
      // 这里应该根据实际的维度分数字段来计算
      // 暂时使用模拟数据
      dimensionScores.leadership = Math.round(averageScore * 0.9);
      dimensionScores.communication = Math.round(averageScore * 1.1);
      dimensionScores.problem_solving = Math.round(averageScore * 0.95);
      dimensionScores.teamwork = Math.round(averageScore * 1.05);
      dimensionScores.innovation = Math.round(averageScore * 0.85);
    }

    // 获取时间序列数据（按天统计）
    const timeSeriesQuery = supabase
      .from('assessment_records')
      .select('created_at, total_score')
      .order('created_at', { ascending: true });

    if (startDate && endDate) {
      timeSeriesQuery.gte('created_at', startDate).lte('created_at', endDate);
    }

    const { data: timeSeriesData } = await timeSeriesQuery;

    // 按日期分组统计
    const dailyStats: Record<string, { count: number; totalScore: number }> =
      {};

    if (timeSeriesData) {
      timeSeriesData.forEach((record: any) => {
        const date = record.created_at?.split('T')[0];
        if (date && !dailyStats[date]) {
          dailyStats[date] = { count: 0, totalScore: 0 };
        }
        if (date) {
          dailyStats[date]!.count++;
          dailyStats[date]!.totalScore += record.total_score || 0;
        }
      });
    }

    const timeSeries = Object.entries(dailyStats).map(([date, stats]) => ({
      date,
      count: stats.count,
      averageScore:
        stats.count > 0 ? Math.round(stats.totalScore / stats.count) : 0,
    }));

    // 获取邮件统计数据
    const { count: emailsSent } = await supabase
      .from('assessment_emails')
      .select('*', { count: 'exact', head: true });

    const { count: emailsOpened } = await supabase
      .from('assessment_emails')
      .select('*', { count: 'exact', head: true })
      .eq('opened', true);

    const { count: emailsClicked } = await supabase
      .from('assessment_emails')
      .select('*', { count: 'exact', head: true })
      .eq('clicked', true);

    const openRate =
      emailsSent && emailsSent > 0
        ? Math.round(((emailsOpened || 0) / emailsSent) * 100)
        : 0;
    const clickRate =
      emailsSent && emailsSent > 0
        ? Math.round(((emailsClicked || 0) / emailsSent) * 100)
        : 0;
    const conversionRate =
      totalAssessments && emailsSent && emailsSent > 0
        ? Math.round((totalAssessments / emailsSent) * 100)
        : 0;

    return NextResponse.json({
      summary: {
        totalAssessments: totalAssessments || 0,
        averageScore: Math.round(averageScore),
        emailsSent: emailsSent || 0,
        openRate,
        clickRate,
        conversionRate,
      },
      scoreDistribution,
      dimensionScores,
      timeSeries,
      emailStats: {
        sent: emailsSent || 0,
        opened: emailsOpened || 0,
        clicked: emailsClicked || 0,
        openRate,
        clickRate,
      },
    });
  } catch (error) {
    console.error('获取评测分析数据失败:', error);
    return NextResponse.json(
      { error: '获取评测分析数据失败' },
      { status: 500 }
    );
  }
}

// POST - 创建评测记录（用于测试）
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, answers, scores } = body;

    if (!email || !answers) {
      return NextResponse.json(
        { error: '邮箱和答案为必填项' },
        { status: 400 }
      );
    }

    const totalScore = scores
      ? Object.values(scores).reduce(
          (sum: number, score: any) => sum + score,
          0
        )
      : 0;

    const { data, error } = await supabase
      .from('assessment_records')
      .insert({
        email,
        answers,
        scores,
        total_score: totalScore,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('创建评测记录失败:', error);
      return NextResponse.json({ error: '创建评测记录失败' }, { status: 500 });
    }

    return NextResponse.json(
      {
        message: '评测记录创建成功',
        record: data,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('服务器错误:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}
