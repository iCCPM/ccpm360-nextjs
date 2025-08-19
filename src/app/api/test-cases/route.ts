import { NextResponse } from 'next/server';
import { caseStudiesAPI } from '@/lib/supabase';

export async function GET() {
  try {
    console.log('测试API: 开始获取案例数据...');

    const cases = await caseStudiesAPI.getPublishedCaseStudies();

    console.log('测试API: 获取到的案例数据:', cases);
    console.log('测试API: 案例数量:', cases.length);

    return NextResponse.json({
      success: true,
      count: cases.length,
      data: cases,
    });
  } catch (error) {
    console.error('测试API: 获取案例数据失败:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}
