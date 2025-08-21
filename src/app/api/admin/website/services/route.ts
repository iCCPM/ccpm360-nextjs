import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env['NEXT_PUBLIC_SUPABASE_URL']!,
  process.env['SUPABASE_SERVICE_ROLE_KEY']!
);

// GET - 获取服务列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';

    const offset = (page - 1) * limit;

    let query = supabase
      .from('services')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error, count } = await query.range(
      offset,
      offset + limit - 1
    );

    if (error) {
      console.error('获取服务列表失败:', error);
      return NextResponse.json({ error: '获取服务列表失败' }, { status: 500 });
    }

    return NextResponse.json({
      services: data || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (error) {
    console.error('服务器错误:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}

// POST - 创建新服务
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, category, price, features, is_active } = body;

    // 验证必填字段
    if (!title || !description || !category) {
      return NextResponse.json(
        { error: '标题、描述和分类为必填项' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('services')
      .insert({
        title,
        description,
        category,
        price: price || 0,
        features: features || [],
        is_active: is_active !== undefined ? is_active : true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('创建服务失败:', error);
      return NextResponse.json({ error: '创建服务失败' }, { status: 500 });
    }

    return NextResponse.json(
      {
        message: '服务创建成功',
        service: data,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('服务器错误:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}

// PUT - 更新服务
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, description, category, price, features, is_active } =
      body;

    if (!id) {
      return NextResponse.json({ error: '服务ID为必填项' }, { status: 400 });
    }

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (price !== undefined) updateData.price = price;
    if (features !== undefined) updateData.features = features;
    if (is_active !== undefined) updateData.is_active = is_active;

    const { data, error } = await supabase
      .from('services')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('更新服务失败:', error);
      return NextResponse.json({ error: '更新服务失败' }, { status: 500 });
    }

    return NextResponse.json({
      message: '服务更新成功',
      service: data,
    });
  } catch (error) {
    console.error('服务器错误:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}

// DELETE - 删除服务
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: '服务ID为必填项' }, { status: 400 });
    }

    const { error } = await supabase.from('services').delete().eq('id', id);

    if (error) {
      console.error('删除服务失败:', error);
      return NextResponse.json({ error: '删除服务失败' }, { status: 500 });
    }

    return NextResponse.json({
      message: '服务删除成功',
    });
  } catch (error) {
    console.error('服务器错误:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}
