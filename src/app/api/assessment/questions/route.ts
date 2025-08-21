import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL']!;
const supabaseServiceKey = process.env['SUPABASE_SERVICE_ROLE_KEY']!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET() {
  try {
    // 获取所有测试题目，按维度分组
    const { data: questions, error } = await supabase
      .from('assessment_questions')
      .select('*, explanation')
      .order('dimension', { ascending: true })
      .order('id', { ascending: true });

    if (error) {
      console.error('Error fetching questions:', error);
      return NextResponse.json(
        { error: 'Failed to fetch questions' },
        { status: 500 }
      );
    }

    // 按维度分组题目
    const questionsByDimension = questions.reduce((acc: any, question: any) => {
      if (!acc[question.dimension]) {
        acc[question.dimension] = [];
      }

      // 处理options字段 - 可能是数组或对象
      let optionsArray = [];
      if (Array.isArray(question.options)) {
        optionsArray = question.options;
      } else if (question.options && typeof question.options === 'object') {
        // 如果是对象，提取选项数组
        optionsArray = ['A', 'B', 'C', 'D']
          .map((key) => question.options[key])
          .filter(Boolean);
      }

      // 过滤和验证选项，确保每个选项都有有效的text属性
      const validOptions = optionsArray
        .map((option: any, index: number) => {
          let text = '';
          if (typeof option === 'string') {
            text = option.trim();
          } else if (option && typeof option === 'object' && option.text) {
            text = String(option.text).trim();
          }

          // 只返回有效的选项（text不为空）
          if (text && text.length > 0) {
            return {
              index,
              text,
            };
          }
          return null;
        })
        .filter(Boolean); // 过滤掉null值

      // 添加日志记录便于调试
      if (validOptions.length !== optionsArray.length) {
        console.log(
          `Question ${question.id}: Filtered ${optionsArray.length - validOptions.length} invalid options`
        );
      }

      acc[question.dimension].push({
        id: question.id,
        question_text: question.question_text,
        dimension: question.dimension,
        options: validOptions,
      });
      return acc;
    }, {});

    // 返回结构化的题目数据
    const response = {
      questions: questions.map((question: any) => {
        // 处理options字段 - 可能是数组或对象
        let optionsArray = [];
        if (Array.isArray(question.options)) {
          optionsArray = question.options;
        } else if (question.options && typeof question.options === 'object') {
          // 如果是对象，提取选项数组
          optionsArray = ['A', 'B', 'C', 'D']
            .map((key) => question.options[key])
            .filter(Boolean);
        }

        // 过滤和验证选项，确保每个选项都有有效的text属性
        const validOptions = optionsArray
          .map((option: any, index: number) => {
            let text = '';
            if (typeof option === 'string') {
              text = option.trim();
            } else if (option && typeof option === 'object' && option.text) {
              text = String(option.text).trim();
            }

            // 只返回有效的选项（text不为空）
            if (text && text.length > 0) {
              return {
                index,
                text,
              };
            }
            return null;
          })
          .filter(Boolean); // 过滤掉null值

        return {
          id: question.id,
          question_text: question.question_text,
          dimension: question.dimension,
          options: validOptions,
        };
      }),
      dimensions: {
        time_management: '时间管理',
        resource_coordination: '资源协调',
        risk_control: '风险控制',
        team_collaboration: '团队协作',
      },
      questionsByDimension,
      totalQuestions: questions.length,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
