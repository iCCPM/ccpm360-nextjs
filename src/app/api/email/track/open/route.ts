import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

// 1x1 透明像素的 base64 编码
const TRACKING_PIXEL = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64'
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const trackingId = searchParams.get('trackingId');

    if (!trackingId) {
      console.log('Missing tracking ID');
      return new NextResponse(TRACKING_PIXEL, {
        status: 200,
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      });
    }

    // 更新邮件历史记录的 opened_at 字段
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('email_history')
      .update({
        opened_at: new Date().toISOString(),
      })
      .eq('tracking_id', trackingId)
      .is('opened_at', null) // 只更新第一次打开的记录
      .select();

    if (error) {
      console.error('Failed to update email open tracking:', {
        error,
        trackingId,
      });
    } else if (data && data.length > 0) {
      console.log('Email open tracked successfully:', {
        trackingId,
        openedAt: data[0].opened_at,
      });
    } else {
      console.log('No matching email record found or already opened:', {
        trackingId,
      });
    }

    // 返回 1x1 透明像素
    return new NextResponse(TRACKING_PIXEL, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });
  } catch (error) {
    console.error('Email open tracking error:', error);

    // 即使出错，也返回跟踪像素
    return new NextResponse(TRACKING_PIXEL, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });
  }
}
