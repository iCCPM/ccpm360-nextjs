import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: '案例ID不能为空' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // 检查是否为mock客户端
    if (
      !process.env['NEXT_PUBLIC_SUPABASE_URL'] ||
      !process.env['SUPABASE_SERVICE_ROLE_KEY']
    ) {
      console.log(
        'Supabase environment variables not found, returning mock case study'
      );
      // 返回模拟案例数据
      const mockCaseStudy = {
        id,
        title: '示例案例研究',
        description: '这是一个示例案例研究描述',
        content: '这是案例研究的详细内容...',
        published: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      return NextResponse.json(mockCaseStudy);
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
