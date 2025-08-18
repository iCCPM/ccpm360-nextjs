import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL']!;
const supabaseAnonKey = process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: '案例ID不能为空' }, { status: 400 });
    }

    // 从数据库获取案例详情（只获取已发布的案例）
    const { data: caseStudy, error } = await supabase
      .from('case_studies')
      .select('*')
      .eq('id', id)
      .eq('published', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // 案例不存在或未发布
        return NextResponse.json(
          { error: '案例不存在或未发布' },
          { status: 404 }
        );
      }

      console.error('获取案例详情失败:', error);
      return NextResponse.json({ error: '获取案例详情失败' }, { status: 500 });
    }

    return NextResponse.json(caseStudy);
  } catch (error) {
    console.error('API错误:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}

// OPTIONS - 处理CORS预检请求
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
