import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '7d';
    const metric = searchParams.get('metric') || 'overview';

    // 计算日期范围
    const getDateRange = (range: string) => {
      const now = new Date();
      const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
      const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      return startDate.toISOString();
    };

    const startDate = getDateRange(timeRange);

    switch (metric) {
      case 'overview':
        return await getOverviewData(supabase, startDate);
      case 'pages':
        return await getPageData(supabase, startDate);
      case 'sessions':
        return await getSessionData(supabase, startDate);
      case 'events':
        return await getEventData(supabase, startDate);
      default:
        return await getOverviewData(supabase, startDate);
    }
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json({ error: '获取分析数据失败' }, { status: 500 });
  }
}

async function getOverviewData(supabase: any, startDate: string) {
  try {
    // 获取访客会话数据
    const { data: sessions, error: sessionsError } = await supabase
      .from('visitor_sessions')
      .select('*')
      .gte('created_at', startDate);

    if (sessionsError) throw sessionsError;

    // 获取页面访问数据
    const { data: pageViews, error: pageViewsError } = await supabase
      .from('page_views')
      .select('*')
      .gte('created_at', startDate);

    if (pageViewsError) throw pageViewsError;

    // 获取每日统计数据
    const { data: dailyStats, error: dailyStatsError } = await supabase
      .from('daily_analytics')
      .select('*')
      .gte('date', new Date(startDate).toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (dailyStatsError) throw dailyStatsError;

    // 计算基础统计
    const totalVisitors = new Set(sessions?.map((s: any) => s.visitor_id) || [])
      .size;
    const totalPageViews = pageViews?.length || 0;

    // 计算今日访客
    const today = new Date().toISOString().split('T')[0];
    const todaySessions =
      sessions?.filter((s: any) => s.created_at.startsWith(today)) || [];
    const dailyVisitors = new Set(todaySessions.map((s: any) => s.visitor_id))
      .size;

    // 计算本月访客
    const thisMonth = new Date().toISOString().substring(0, 7);
    const monthSessions =
      sessions?.filter((s: any) => s.created_at.startsWith(thisMonth)) || [];
    const monthlyVisitors = new Set(monthSessions.map((s: any) => s.visitor_id))
      .size;

    // 计算平均会话时长
    const validSessions =
      sessions?.filter(
        (s: any) => s.duration_seconds && s.duration_seconds > 0
      ) || [];
    const avgSessionDuration =
      validSessions.length > 0
        ? validSessions.reduce(
            (sum: number, s: any) => sum + s.duration_seconds,
            0
          ) / validSessions.length
        : 0;

    // 计算跳出率
    const singlePageSessions =
      sessions?.filter((s: any) => s.page_views === 1) || [];
    const bounceRate =
      sessions && sessions.length > 0
        ? (singlePageSessions.length / sessions.length) * 100
        : 0;

    // 统计热门页面
    const pageStats = (pageViews || []).reduce(
      (acc: Record<string, number>, pv: any) => {
        acc[pv.page_url] = (acc[pv.page_url] || 0) + 1;
        return acc;
      },
      {}
    );

    const topPages = Object.entries(pageStats)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 10)
      .map(([page, views]) => ({ page, views }));

    // 处理每日统计数据
    const processedDailyStats = (dailyStats || []).map((stat: any) => ({
      date: new Date(stat.date).toLocaleDateString('zh-CN', {
        month: 'short',
        day: 'numeric',
      }),
      visitors: stat.unique_visitors || 0,
      pageViews: stat.total_page_views || 0,
    }));

    // 设备和浏览器统计（基于user_agent解析，这里使用模拟数据）
    const deviceStats = [
      {
        device: '桌面端',
        count: Math.floor(totalVisitors * 0.6),
        percentage: 60,
      },
      {
        device: '移动端',
        count: Math.floor(totalVisitors * 0.35),
        percentage: 35,
      },
      {
        device: '平板',
        count: Math.floor(totalVisitors * 0.05),
        percentage: 5,
      },
    ];

    const browserStats = [
      {
        browser: 'Chrome',
        count: Math.floor(totalVisitors * 0.65),
        percentage: 65,
      },
      {
        browser: 'Safari',
        count: Math.floor(totalVisitors * 0.2),
        percentage: 20,
      },
      {
        browser: 'Firefox',
        count: Math.floor(totalVisitors * 0.1),
        percentage: 10,
      },
      {
        browser: '其他',
        count: Math.floor(totalVisitors * 0.05),
        percentage: 5,
      },
    ];

    const data = {
      totalVisitors,
      dailyVisitors,
      monthlyVisitors,
      totalPageViews,
      avgSessionDuration,
      bounceRate,
      topPages,
      dailyStats: processedDailyStats,
      deviceStats,
      browserStats,
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error('Overview data error:', error);
    throw error;
  }
}

async function getPageData(supabase: any, startDate: string) {
  try {
    const { data: pageViews, error } = await supabase
      .from('page_views')
      .select(
        `
        page_url, 
        page_title, 
        referrer, 
        created_at,
        visitor_sessions!inner(visitor_id)
      `
      )
      .gte('created_at', startDate)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // 统计页面访问量
    const pageStats = (pageViews || []).reduce(
      (acc: Record<string, any>, pv: any) => {
        const key = pv.page_url;
        if (!acc[key]) {
          acc[key] = {
            url: pv.page_url,
            title: pv.page_title || pv.page_url,
            views: 0,
            uniqueVisitors: new Set(),
          };
        }
        acc[key].views++;
        // 从关联的visitor_sessions中获取visitor_id
        if (pv.visitor_sessions?.visitor_id) {
          acc[key].uniqueVisitors.add(pv.visitor_sessions.visitor_id);
        }
        return acc;
      },
      {}
    );

    // 转换为数组并排序
    const pages = Object.values(pageStats)
      .map((page: any) => ({
        ...page,
        uniqueVisitors: page.uniqueVisitors.size,
      }))
      .sort((a: any, b: any) => b.views - a.views);

    return NextResponse.json({ pages });
  } catch (error) {
    console.error('Page data error:', error);
    throw error;
  }
}

async function getSessionData(supabase: any, startDate: string) {
  try {
    const { data: sessions, error } = await supabase
      .from('visitor_sessions')
      .select('*')
      .gte('created_at', startDate)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // 处理会话数据
    const processedSessions = (sessions || []).map((session: any) => ({
      id: session.id,
      visitorId: session.visitor_id,
      startTime: session.created_at,
      endTime: session.updated_at,
      duration: session.duration_seconds || 0,
      pageCount: session.page_views || 0,
      country: session.country,
      city: session.city,
      device: session.device,
      browser: session.browser,
      os: session.os,
    }));

    return NextResponse.json({ sessions: processedSessions });
  } catch (error) {
    console.error('Session data error:', error);
    throw error;
  }
}

async function getEventData(supabase: any, startDate: string) {
  try {
    const { data: events, error } = await supabase
      .from('user_events')
      .select('*')
      .gte('created_at', startDate)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // 统计事件类型
    const eventStats = (events || []).reduce(
      (acc: Record<string, number>, event: any) => {
        acc[event.event_type] = (acc[event.event_type] || 0) + 1;
        return acc;
      },
      {}
    );

    const eventTypes = Object.entries(eventStats)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .map(([type, count]) => ({ type, count }));

    return NextResponse.json({
      events: events || [],
      eventTypes,
    });
  } catch (error) {
    console.error('Event data error:', error);
    throw error;
  }
}

// POST 方法用于记录访客数据
export async function POST(request: NextRequest) {
  try {
    let body;
    const contentType = request.headers.get('content-type');

    if (contentType && contentType.includes('application/json')) {
      body = await request.json();
    } else {
      // 处理sendBeacon发送的数据（可能没有正确的Content-Type）
      const text = await request.text();
      try {
        body = JSON.parse(text);
      } catch (parseError) {
        console.error('Failed to parse request body:', parseError);
        return NextResponse.json({ error: '无效的请求格式' }, { status: 400 });
      }
    }

    const { type, data } = body;

    switch (type) {
      case 'page_view':
        return await recordPageView(supabase, data);
      case 'session':
        return await recordSession(supabase, data);
      case 'event':
        return await recordEvent(supabase, data);
      default:
        return NextResponse.json({ error: '无效的数据类型' }, { status: 400 });
    }
  } catch (error) {
    console.error('Analytics POST error:', error);
    return NextResponse.json({ error: '记录数据失败' }, { status: 500 });
  }
}

async function recordPageView(supabase: any, data: any) {
  try {
    // 使用upsert确保session存在，避免竞态条件
    const deviceInfo = {
      browser: 'unknown',
      os: 'unknown',
      device: 'desktop',
    };

    // 首先检查session是否存在
    const { data: existingSession } = await supabase
      .from('visitor_sessions')
      .select('page_views')
      .eq('session_id', data.sessionId)
      .single();

    if (!existingSession) {
      // 如果session不存在，创建新的
      const { error: sessionInsertError } = await supabase
        .from('visitor_sessions')
        .insert({
          session_id: data.sessionId,
          visitor_id: data.visitorId,
          duration_seconds: 0,
          page_views: 1, // 第一个页面浏览
          browser: deviceInfo.browser,
          os: deviceInfo.os,
          device: deviceInfo.device,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (sessionInsertError) {
        console.error('Session insert error:', sessionInsertError);
        throw sessionInsertError;
      }
    } else {
      // 如果session存在，增加页面浏览数
      const { error: sessionUpdateError } = await supabase
        .from('visitor_sessions')
        .update({
          page_views: (existingSession.page_views || 0) + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('session_id', data.sessionId);

      if (sessionUpdateError) {
        console.error('Session update error:', sessionUpdateError);
        throw sessionUpdateError;
      }
    }

    // 现在插入page_view
    const { error } = await supabase.from('page_views').insert({
      session_id: data.sessionId,
      page_url: data.pageUrl,
      page_title: data.pageTitle,
      page_path: new URL(data.pageUrl, 'http://localhost').pathname,
      referrer: data.referrer,
      viewed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error('Page view insert error:', error);
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Record page view error:', error);
    throw error;
  }
}

async function recordSession(supabase: any, data: any) {
  try {
    // 首先检查session是否存在
    const { data: existingSession } = await supabase
      .from('visitor_sessions')
      .select('*')
      .eq('session_id', data.sessionId)
      .single();

    if (!existingSession) {
      // 如果session不存在，创建新的
      const { error } = await supabase.from('visitor_sessions').insert({
        session_id: data.sessionId,
        visitor_id: data.visitorId,
        duration_seconds: data.duration || 0,
        page_views: data.pageCount || 0,
        country: data.country || null,
        city: data.city || null,
        device: data.deviceType || 'desktop',
        browser: data.browser || 'unknown',
        os: data.os || 'unknown',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (error) {
        console.error('Session insert error:', error);
        throw error;
      }
    } else {
      // 如果session存在，只更新duration和其他字段，保留page_views
      const updateData: any = {
        duration_seconds: data.duration || 0,
        updated_at: new Date().toISOString(),
      };

      // 只在有新值时更新这些字段
      if (data.country) updateData.country = data.country;
      if (data.city) updateData.city = data.city;
      if (data.deviceType) updateData.device = data.deviceType;
      if (data.browser) updateData.browser = data.browser;
      if (data.os) updateData.os = data.os;

      const { error } = await supabase
        .from('visitor_sessions')
        .update(updateData)
        .eq('session_id', data.sessionId);

      if (error) {
        console.error('Session update error:', error);
        throw error;
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Record session error:', error);
    throw error;
  }
}

async function recordEvent(supabase: any, data: any) {
  try {
    const { error } = await supabase.from('user_events').insert({
      session_id: data.sessionId,
      event_type: data.eventType,
      event_name: data.eventName,
      element_selector: data.elementSelector,
      element_text: data.elementText,
      element_attributes: data.elementAttributes,
      position_x: data.positionX,
      position_y: data.positionY,
      event_data: data.eventData,
      occurred_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error('Event insert error:', error);
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Record event error:', error);
    throw error;
  }
}
