import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateAssessmentPDF } from '@/lib/puppeteerPDFGenerator';

// 验证下载令牌
async function validateDownloadToken(token: string) {
  const { data, error } = await supabase
    .from('pdf_download_tokens')
    .select('*')
    .eq('token', token)
    .eq('is_active', true)
    .single();

  if (error || !data) {
    return null;
  }

  // 检查令牌是否过期
  const expiryDate = new Date(data.expires_at);
  const now = new Date();

  if (now > expiryDate) {
    // 令牌已过期，标记为无效
    await supabase
      .from('pdf_download_tokens')
      .update({ is_active: false })
      .eq('token', token);
    return null;
  }

  return data;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;

    if (!token) {
      return NextResponse.json({ error: '缺少下载令牌' }, { status: 400 });
    }

    // 验证令牌
    const tokenData = await validateDownloadToken(token);
    if (!tokenData) {
      return NextResponse.json(
        { error: '下载链接已失效或不存在' },
        { status: 404 }
      );
    }

    // 获取评估数据
    const { data: assessmentData, error: assessmentError } = await supabase
      .from('assessment_records')
      .select('*')
      .eq('id', tokenData.assessment_id)
      .single();

    if (assessmentError || !assessmentData) {
      return NextResponse.json({ error: '评估数据不存在' }, { status: 404 });
    }

    // 转换数据格式以匹配PuppeteerPDFGenerator的AssessmentData接口
    const pdfData = {
      userInfo: {
        name: assessmentData.participant_name,
        email: assessmentData.participant_email,
        company: assessmentData.participant_company || '',
      },
      totalScore: assessmentData.overall_score,
      maxTotalScore: 100, // 假设最大分数为100
      dimensionScores: Array.isArray(assessmentData.dimension_scores)
        ? assessmentData.dimension_scores.map((dim: any) => ({
            dimension: dim.dimension || dim.name || '未知维度',
            score: dim.score || 0,
            maxScore: dim.maxScore || 20,
          }))
        : Object.entries(assessmentData.dimension_scores || {}).map(
            ([dimension, score]) => ({
              dimension,
              score: typeof score === 'number' ? score : 0,
              maxScore: 20,
            })
          ),
      personalizedAdvice: {
        overallLevel: assessmentData.personalized_advice || '',
        dimensionAdvice: Array.isArray(assessmentData.dimension_advice)
          ? assessmentData.dimension_advice
          : typeof assessmentData.dimension_advice === 'object'
            ? Object.values(assessmentData.dimension_advice || {})
            : [assessmentData.dimension_advice || ''].filter(Boolean),
        nextSteps: Array.isArray(assessmentData.next_steps)
          ? assessmentData.next_steps
          : typeof assessmentData.next_steps === 'string'
            ? [assessmentData.next_steps]
            : [],
      },
      completedAt: new Date(assessmentData.completed_at),
    };

    // 生成PDF
    const pdfBuffer = await generateAssessmentPDF(pdfData);

    // 更新下载次数
    await supabase
      .from('pdf_download_tokens')
      .update({
        download_count: tokenData.download_count + 1,
        last_downloaded_at: new Date().toISOString(),
      })
      .eq('token', token);

    // 返回PDF文件
    return new NextResponse(pdfBuffer as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="CCPM360-诊断报告-${assessmentData.participant_name}.pdf"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });
  } catch (error) {
    console.error('PDF下载错误:', error);
    return NextResponse.json(
      { error: '下载失败，请稍后重试' },
      { status: 500 }
    );
  }
}
