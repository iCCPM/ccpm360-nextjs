import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL']!;
const supabaseServiceKey = process.env['SUPABASE_SERVICE_ROLE_KEY']!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// 评分算法和个性化建议系统
function calculateScores(answers: Record<string, number>, questions: any[]) {
  const dimensionScores: Record<string, { total: number; count: number }> = {
    time_management: { total: 0, count: 0 },
    resource_coordination: { total: 0, count: 0 },
    risk_control: { total: 0, count: 0 },
    team_collaboration: { total: 0, count: 0 },
  };

  let totalScore = 0;
  let totalQuestions = 0;

  // 计算各维度得分
  questions.forEach((question, index) => {
    // 支持两种格式：对象格式 {"1": 0, "2": 1} 或数组格式 [0, 1, 2]
    let answerIndex;
    if (Array.isArray(answers)) {
      answerIndex = answers[index];
    } else {
      answerIndex = answers[question.id.toString()];
    }

    if (answerIndex !== undefined && question.options[answerIndex]) {
      const score = question.options[answerIndex].score;

      // 确保score是有效数字
      if (typeof score === 'number' && !isNaN(score)) {
        const dimensionData = dimensionScores[question.dimension];
        if (dimensionData) {
          dimensionData.total += score;
          dimensionData.count += 1;
        }
        totalScore += score;
        totalQuestions += 1;
      }
    }
  });

  // 计算平均分
  const finalScores: Record<string, number> = {};
  Object.keys(dimensionScores).forEach((dimension) => {
    const dimensionData = dimensionScores[dimension];
    if (dimensionData) {
      const { total, count } = dimensionData;
      finalScores[dimension] = count > 0 ? Math.round(total / count) : 0;
    } else {
      finalScores[dimension] = 0;
    }
  });

  const averageScore = totalQuestions > 0 ? totalScore / totalQuestions : 0;

  return { dimensionScores: finalScores, totalScore: averageScore };
}

// 生成个性化建议
function generatePersonalizedAdvice(
  scores: Record<string, number>,
  totalScore: number
) {
  let level: string;
  let levelDescription: string;
  let overallAdvice: string;

  // 确定整体水平
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

  // 各维度具体建议
  const dimensionAdvice: Record<string, string> = {};

  // 时间管理建议
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

  // 资源协调建议
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

  // 风险控制建议
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

  // 团队协作建议
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

  return {
    level,
    levelDescription,
    overallAdvice,
    dimensionAdvice,
    nextSteps: generateNextSteps(level, scores),
  };
}

// 生成下一步行动建议
function generateNextSteps(level: string, scores: Record<string, number>) {
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

  // 根据薄弱维度添加针对性建议
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

  return steps;
}

// 获取客户端信息的辅助函数
function getClientInfo(request: NextRequest) {
  // 获取真实IP地址
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');

  let ipAddress = null;
  if (cfConnectingIp) {
    ipAddress = cfConnectingIp;
  } else if (realIp) {
    ipAddress = realIp;
  } else if (forwarded) {
    ipAddress = forwarded.split(',')[0]?.trim() || '127.0.0.1';
  } else {
    // NextRequest doesn't have ip property, use fallback
    ipAddress = '127.0.0.1';
  }

  // 获取User-Agent
  const userAgent = request.headers.get('user-agent') || null;

  return {
    ipAddress,
    userAgent,
  };
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Assessment submit API called');
    const body = await request.json();
    console.log('📝 Request body:', JSON.stringify(body, null, 2));
    const { answers, userInfo, clientInfo } = body;

    if (!answers || typeof answers !== 'object') {
      console.error('❌ Invalid answers format:', answers);
      return NextResponse.json(
        { error: 'Invalid answers format' },
        { status: 400 }
      );
    }

    // 获取客户端信息
    const serverClientInfo = getClientInfo(request);

    // 获取所有题目和答案选项
    console.log('📊 Fetching assessment questions...');
    const { data: questions, error: questionsError } = await supabase
      .from('assessment_questions')
      .select('*')
      .order('id');

    if (questionsError) {
      console.error('❌ Error fetching questions:', questionsError);
      return NextResponse.json(
        { error: 'Failed to fetch questions' },
        { status: 500 }
      );
    }

    console.log(
      '✅ Questions fetched successfully:',
      questions?.length || 0,
      'questions'
    );

    // 计算得分
    console.log('🧮 Calculating scores...');
    const { dimensionScores, totalScore } = calculateScores(answers, questions);
    console.log('📈 Scores calculated:', { dimensionScores, totalScore });

    // 生成个性化建议
    console.log('💡 Generating personalized advice...');
    const advice = generatePersonalizedAdvice(dimensionScores, totalScore);
    console.log('✅ Advice generated successfully');

    // 保存测试记录
    const assessmentRecord = {
      user_email: userInfo?.email || null,
      user_name: userInfo?.name || null,
      user_company: userInfo?.company || null,
      answers,
      scores: dimensionScores,
      total_score: Math.round(totalScore), // 确保是整数
      assessment_level: advice.level,
      ip_address: serverClientInfo.ipAddress,
      user_agent: serverClientInfo.userAgent,
      computer_name: clientInfo?.computerName || null,
    };

    console.log('💾 Saving assessment record...');
    const { data: record, error: insertError } = await supabase
      .from('assessment_records')
      .insert(assessmentRecord)
      .select()
      .single();

    if (insertError) {
      console.error('❌ Error saving assessment record:', insertError);
      console.error(
        '📋 Assessment record data:',
        JSON.stringify(assessmentRecord, null, 2)
      );
      // 即使保存失败，也返回评估结果
    } else {
      console.log('✅ Assessment record saved successfully:', record?.id);
    }

    const responseData = {
      id: record?.id || null,
      totalScore,
      dimensionScores,
      advice,
      completedAt: new Date().toISOString(),
      name: userInfo?.name || null, // 添加用户姓名用于个性化称呼
      userAnswers: answers,
      questions: questions.map((q) => ({
        id: q.id,
        question_text: q.question_text,
        dimension: q.dimension,
        explanation: q.explanation,
        options: q.options,
        correct_answer: q.correct_answer,
      })),
    };

    // 如果用户提供了邮箱，发送个性化报告邮件
    if (userInfo?.email) {
      try {
        // 构建正确的API URL，支持Vercel部署环境
        const getApiUrl = (request: NextRequest) => {
          // 记录所有可用的环境变量和请求信息
          console.log('🔍 Environment variables:', {
            VERCEL_URL: process.env['VERCEL_URL'],
            VERCEL_ENV: process.env['VERCEL_ENV'],
            NODE_ENV: process.env['NODE_ENV'],
            NEXT_PUBLIC_SITE_URL: process.env['NEXT_PUBLIC_SITE_URL'],
            NEXT_PUBLIC_VERCEL_URL: process.env['NEXT_PUBLIC_VERCEL_URL'],
          });

          // 记录请求头信息
          const host = request.headers.get('host');
          const origin = request.headers.get('origin');
          const referer = request.headers.get('referer');
          console.log('🌐 Request headers:', { host, origin, referer });

          let apiUrl = '';

          // 方法1: 使用Vercel的VERCEL_URL环境变量
          if (process.env['VERCEL_URL']) {
            apiUrl = `https://${process.env['VERCEL_URL']}`;
            console.log('✅ Using VERCEL_URL:', apiUrl);
            return apiUrl;
          }

          // 方法2: 使用NEXT_PUBLIC_VERCEL_URL
          if (process.env['NEXT_PUBLIC_VERCEL_URL']) {
            apiUrl = process.env['NEXT_PUBLIC_VERCEL_URL'].startsWith('http')
              ? process.env['NEXT_PUBLIC_VERCEL_URL']
              : `https://${process.env['NEXT_PUBLIC_VERCEL_URL']}`;
            console.log('✅ Using NEXT_PUBLIC_VERCEL_URL:', apiUrl);
            return apiUrl;
          }

          // 方法3: 从请求头获取host信息
          if (host && !host.includes('localhost')) {
            // 在生产环境中，通常使用HTTPS
            const protocol =
              process.env['NODE_ENV'] === 'production' ? 'https' : 'http';
            apiUrl = `${protocol}://${host}`;
            console.log('✅ Using request host:', apiUrl);
            return apiUrl;
          }

          // 方法4: 使用NEXT_PUBLIC_SITE_URL（如果不是localhost）
          if (
            process.env['NEXT_PUBLIC_SITE_URL'] &&
            !process.env['NEXT_PUBLIC_SITE_URL'].includes('localhost')
          ) {
            apiUrl = process.env['NEXT_PUBLIC_SITE_URL'];
            console.log('✅ Using NEXT_PUBLIC_SITE_URL:', apiUrl);
            return apiUrl;
          }

          // 方法5: 从origin或referer获取
          if (origin && !origin.includes('localhost')) {
            apiUrl = origin;
            console.log('✅ Using origin:', apiUrl);
            return apiUrl;
          }

          if (referer && !referer.includes('localhost')) {
            try {
              const url = new URL(referer);
              apiUrl = `${url.protocol}//${url.host}`;
              console.log('✅ Using referer:', apiUrl);
              return apiUrl;
            } catch (e) {
              console.warn('⚠️ Failed to parse referer:', referer);
            }
          }

          // 最后回退到localhost（仅用于开发环境）
          apiUrl = 'http://localhost:3000';
          console.log('⚠️ Falling back to localhost:', apiUrl);
          return apiUrl;
        };

        const apiUrl = getApiUrl(request);
        console.log('📧 Final API URL for email sending:', apiUrl);

        // 准备邮件数据
        const emailData = {
          type: 'assessment_result',
          recipientEmail: userInfo.email,
          data: {
            ...responseData,
            name: userInfo.name,
            company: userInfo.company,
          },
          scheduleFollowUp: true,
        };

        // 尝试发送邮件，如果失败则尝试备用URL
        let emailSent = false;
        const urlsToTry = [apiUrl];

        // 如果主URL是localhost，添加备用URL
        if (apiUrl.includes('localhost')) {
          const host = request.headers.get('host');
          if (host && !host.includes('localhost')) {
            urlsToTry.push(`https://${host}`);
            urlsToTry.push(`http://${host}`);
          }
        }

        console.log('🔄 URLs to try for email sending:', urlsToTry);

        for (let i = 0; i < urlsToTry.length && !emailSent; i++) {
          const currentUrl = urlsToTry[i];
          console.log(`📧 Attempt ${i + 1}: Trying URL ${currentUrl}`);

          try {
            const emailResponse = await fetch(
              `${currentUrl}/api/assessment/email`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(emailData),
                // 添加超时设置
                signal: AbortSignal.timeout(30000), // 30秒超时
              }
            );

            if (emailResponse.ok) {
              console.log(
                `✅ Assessment result email sent successfully using ${currentUrl}`
              );
              emailSent = true;
            } else {
              const errorText = await emailResponse.text();
              console.error(`❌ Failed to send email using ${currentUrl}:`, {
                status: emailResponse.status,
                statusText: emailResponse.statusText,
                error: errorText,
              });
            }
          } catch (fetchError) {
            console.error(`❌ Fetch error for ${currentUrl}:`, {
              error:
                fetchError instanceof Error
                  ? fetchError.message
                  : 'Unknown error',
              cause:
                fetchError instanceof Error && 'cause' in fetchError
                  ? fetchError.cause
                  : undefined,
            });
          }
        }

        if (!emailSent) {
          console.error('❌ Failed to send email using all available URLs');
        }
      } catch (emailError) {
        console.error('❌ Error sending assessment result email:', {
          error:
            emailError instanceof Error ? emailError.message : 'Unknown error',
          stack: emailError instanceof Error ? emailError.stack : undefined,
          cause:
            emailError instanceof Error && 'cause' in emailError
              ? emailError.cause
              : undefined,
        });
        // 不影响主流程，继续返回结果
      }
    }

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('❌ Unexpected error in assessment submit:', error);
    console.error(
      '📋 Error stack:',
      error instanceof Error ? error.stack : 'No stack trace'
    );
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
