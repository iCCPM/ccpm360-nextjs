import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const trackingId = searchParams.get('trackingId');
    const targetUrl = searchParams.get('url');

    if (!trackingId || !targetUrl) {
      console.log('Missing tracking parameters');
      return NextResponse.redirect('https://ccpm360.com');
    }

    const supabase = getSupabaseAdmin();

    // 检查是否为mock客户端
    if (
      !process.env['NEXT_PUBLIC_SUPABASE_URL'] ||
      !process.env['SUPABASE_SERVICE_ROLE_KEY']
    ) {
      console.log(
        'Supabase environment variables not found, skipping click tracking'
      );
      return NextResponse.redirect(decodeURIComponent(targetUrl));
    }

    // 更新邮件点击时间（只更新第一次点击）
    const { error } = await supabase
      .from('email_history')
      .update({ clicked_at: new Date().toISOString() })
      .eq('tracking_id', trackingId)
      .is('clicked_at', null)
      .limit(1);

    if (error) {
      console.error('Error updating click tracking:', error);
    } else {
      console.log(
        'Click tracking updated successfully for tracking ID:',
        trackingId
      );
    }

    // 重定向到目标URL
    return NextResponse.redirect(decodeURIComponent(targetUrl));
  } catch (error) {
    console.error('Email click tracking error:', error);

    // 即使出错，也重定向到默认URL
    const fallbackUrl = 'https://ccpm360.com';
    return NextResponse.redirect(fallbackUrl);
  }
}
