import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// GET - 获取所有课程
export async function GET() {
  try {
    const { data: courses, error } = await supabase
      .from('training_courses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching courses:', error);
      return NextResponse.json(
        { error: 'Failed to fetch courses' },
        { status: 500 }
      );
    }

    return NextResponse.json(courses || []);
  } catch (error) {
    console.error('Error in GET /api/admin/services/courses:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - 创建新课程
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      duration,
      price,
      participants,
      level,
      is_active,
    } = body;

    // 验证必填字段
    if (!title || !description || !duration || !level) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data: course, error } = await supabase
      .from('training_courses')
      .insert([
        {
          title,
          description,
          duration,
          price: price || 0,
          participants: participants || 20,
          level,
          is_active: is_active || false,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating course:', error);
      return NextResponse.json(
        { error: 'Failed to create course' },
        { status: 500 }
      );
    }

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/admin/services/courses:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// OPTIONS - 处理CORS预检请求
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
