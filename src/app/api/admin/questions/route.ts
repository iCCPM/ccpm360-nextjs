import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

// GET - 获取所有题目或按分类筛选
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    let query = supabase
      .from('assessment_questions')
      .select('*', { count: 'exact' })
      .order('id', { ascending: true })
      .range(offset, offset + limit - 1);

    if (category && category !== 'all') {
      query = query.eq('dimension', category);
    }

    const { data: questions, error, count } = await query;

    if (error) {
      console.error('Failed to fetch questions:', error);
      return NextResponse.json(
        { error: 'Failed to fetch questions' },
        { status: 500 }
      );
    }

    // 转换字段名以匹配前端期望的格式
    const formattedQuestions =
      questions?.map((q) => {
        // 从options数组中找到score最高的选项作为正确答案
        let correctAnswer = 'A';
        if (Array.isArray(q.options)) {
          let maxScore = -1;
          let maxIndex = 0;
          q.options.forEach((option: any, index: number) => {
            if (option.score > maxScore) {
              maxScore = option.score;
              maxIndex = index;
            }
          });
          correctAnswer = String.fromCharCode(65 + maxIndex); // 65 is 'A'
        }

        return {
          ...q,
          question: q.question_text,
          category: q.dimension,
          correct_answer: correctAnswer,
        };
      }) || [];

    return NextResponse.json({
      questions: formattedQuestions,
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (error) {
    console.error('Error in GET /api/admin/questions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - 创建新题目
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Received POST request body:', JSON.stringify(body, null, 2));
    const { question, options, correct_answer, category, explanation } = body;

    // 验证必填字段
    if (!question || !options || !correct_answer || !category) {
      console.log('Missing required fields:', {
        question: !!question,
        options: !!options,
        correct_answer: !!correct_answer,
        category: !!category,
      });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 验证选项格式
    if (!Array.isArray(options) || options.length !== 4) {
      console.log('Invalid options format:', {
        isArray: Array.isArray(options),
        length: options?.length,
      });
      return NextResponse.json(
        { error: 'Options must be an array of 4 items' },
        { status: 400 }
      );
    }

    // 验证正确答案
    if (!['A', 'B', 'C', 'D'].includes(correct_answer)) {
      console.log('Invalid correct_answer:', correct_answer);
      return NextResponse.json(
        { error: 'Correct answer must be A, B, C, or D' },
        { status: 400 }
      );
    }

    // 验证分类（支持中英文）
    const validCategories = [
      '时间管理',
      '资源协调',
      '风险控制',
      '团队协作',
      'time_management',
      'resource_coordination',
      'risk_control',
      'team_collaboration',
    ];
    console.log('Category validation:', { category, validCategories });
    if (!validCategories.includes(category)) {
      console.log(
        'Invalid category:',
        category,
        'Valid categories:',
        validCategories
      );
      return NextResponse.json({ error: '无效的分类' }, { status: 400 });
    }

    // 将correct_answer转换为options数组中的score
    // 首先确保options是字符串数组，然后转换为带score的对象数组
    const optionsWithScore = options.map((option: string, index: number) => {
      const optionLetter = String.fromCharCode(65 + index); // A, B, C, D
      return {
        text: option,
        score: optionLetter === correct_answer ? 1 : 0,
      };
    });

    console.log('POST create - Options with score:', optionsWithScore);

    const { data, error } = await supabase
      .from('assessment_questions')
      .insert({
        question_text: question,
        options: optionsWithScore, // 存储带score的对象数组
        dimension: category,
        explanation: explanation || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create question:', error);
      return NextResponse.json(
        { error: 'Failed to create question' },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/admin/questions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - 更新题目
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    console.log(
      'PUT request received - Full body:',
      JSON.stringify(body, null, 2)
    );

    const { id, question, options, correct_answer, category, explanation } =
      body;
    console.log('PUT request - Extracted fields:', {
      id,
      question: question ? `"${question.substring(0, 50)}..."` : question,
      options: options,
      optionsType: typeof options,
      optionsIsArray: Array.isArray(options),
      optionsLength: options?.length,
      correct_answer,
      category,
      explanation: explanation
        ? `"${explanation.substring(0, 30)}..."`
        : explanation,
    });

    if (!id) {
      console.log('PUT validation failed: Missing ID');
      return NextResponse.json(
        { error: 'Question ID is required' },
        { status: 400 }
      );
    }

    // 验证必填字段
    const missingFields = [];
    if (!question) missingFields.push('question');
    if (!options) missingFields.push('options');
    if (!correct_answer) missingFields.push('correct_answer');
    if (!category) missingFields.push('category');

    if (missingFields.length > 0) {
      console.log(
        'PUT validation failed: Missing required fields:',
        missingFields
      );
      console.log('Field values:', {
        question: !!question,
        options: !!options,
        correct_answer: !!correct_answer,
        category: !!category,
      });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 验证选项格式
    console.log('PUT validation - Options check:', {
      options,
      isArray: Array.isArray(options),
      length: options?.length,
      type: typeof options,
    });

    if (!Array.isArray(options) || options.length !== 4) {
      console.log('PUT validation failed: Invalid options format');
      console.log('Options details:', {
        value: options,
        isArray: Array.isArray(options),
        length: options?.length,
        type: typeof options,
      });
      return NextResponse.json(
        { error: 'Options must be an array of 4 items' },
        { status: 400 }
      );
    }

    // 验证正确答案
    console.log('PUT validation - Correct answer check:', {
      correct_answer,
      type: typeof correct_answer,
    });
    if (!['A', 'B', 'C', 'D'].includes(correct_answer)) {
      console.log(
        'PUT validation failed: Invalid correct_answer:',
        correct_answer
      );
      return NextResponse.json(
        { error: 'Correct answer must be A, B, C, or D' },
        { status: 400 }
      );
    }

    // 验证分类（支持中英文）
    const validCategories = [
      '时间管理',
      '资源协调',
      '风险控制',
      '团队协作',
      'time_management',
      'resource_coordination',
      'risk_control',
      'team_collaboration',
    ];
    console.log('PUT validation - Category check:', {
      category,
      validCategories,
      includes: validCategories.includes(category),
    });
    if (!validCategories.includes(category)) {
      console.log(
        'PUT validation failed: Invalid category:',
        category,
        'Valid categories:',
        validCategories
      );
      return NextResponse.json({ error: '无效的分类' }, { status: 400 });
    }

    console.log('PUT validation passed - All checks successful');

    // 将correct_answer转换为options数组中的score
    // 首先确保options是字符串数组，然后转换为带score的对象数组
    const optionsWithScore = options.map((option: string, index: number) => {
      const optionLetter = String.fromCharCode(65 + index); // A, B, C, D
      return {
        text: option,
        score: optionLetter === correct_answer ? 1 : 0,
      };
    });

    console.log('PUT update - Options with score:', optionsWithScore);

    const { data, error } = await supabase
      .from('assessment_questions')
      .update({
        question_text: question,
        options: optionsWithScore, // 存储带score的对象数组
        dimension: category,
        explanation: explanation || null,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Failed to update question:', error);
      return NextResponse.json(
        { error: 'Failed to update question' },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in PUT /api/admin/questions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - 删除题目
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Question ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('assessment_questions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Failed to delete question:', error);
      return NextResponse.json(
        { error: 'Failed to delete question' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/admin/questions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
