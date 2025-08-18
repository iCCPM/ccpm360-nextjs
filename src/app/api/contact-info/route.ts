import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 使用服务角色密钥创建Supabase客户端
const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL']!;
const supabaseServiceKey = process.env['SUPABASE_SERVICE_ROLE_KEY']!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET() {
  try {
    // 从contact_page_settings表获取联系信息
    const { data, error } = await supabase
      .from('contact_page_settings')
      .select('*')
      .maybeSingle();

    if (error) {
      console.error('获取联系信息失败:', error);
      return NextResponse.json({ error: '获取联系信息失败' }, { status: 500 });
    }

    // 如果没有数据，返回默认值
    if (!data) {
      const defaultContactInfo = {
        phone: '+86 400-123-4567',
        email: 'info@ccpm360.com',
        address: '北京市朝阳区建国路88号现代城A座1001室',
        working_hours: '周一至周五 9:00-18:00',
        weekend_hours: '周六日及节假日 08:00~22:00',
        wechat: 'CCPM360',
        qq: '123456789',
        subway_route: '地铁4号线/10号线海淀黄庄站A2出口，步行约5分钟',
        bus_route:
          '乘坐26路、302路、332路、394路、608路、614路、681路、683路、717路、732路、801路、808路、814路、运通105线、运通106线、运通205线等公交车至中关村站下车',
        driving_route: '导航至"中关村大街27号"，周边有多个停车场可供选择',
        traffic_tips:
          '建议优先选择地铁出行，避开早晚高峰时段。如需驾车前往，请提前了解停车位情况。',
      };

      return NextResponse.json(defaultContactInfo);
    }

    // 返回联系信息
    const contactInfo = {
      phone: data.phone,
      email: data.email,
      address: data.address,
      working_hours: data.working_hours,
      weekend_hours: data.weekend_hours || '周六日及节假日 08:00~22:00',
      wechat: data.wechat,
      qq: data.qq,
      subway_route:
        data.subway_route || '地铁4号线/10号线海淀黄庄站A2出口，步行约5分钟',
      bus_route:
        data.bus_route ||
        '乘坐26路、302路、332路、394路、608路、614路、681路、683路、717路、732路、801路、808路、814路、运通105线、运通106线、运通205线等公交车至中关村站下车',
      driving_route:
        data.driving_route ||
        '导航至"中关村大街27号"，周边有多个停车场可供选择',
      traffic_tips:
        data.traffic_tips ||
        '建议优先选择地铁出行，避开早晚高峰时段。如需驾车前往，请提前了解停车位情况。',
      hero_title: data.hero_title,
      hero_description: data.hero_description,
      map_title: data.map_title || 'CCPM360办公室',
      map_description: data.map_description || '欢迎您到访我们的办公室',
    };

    return NextResponse.json(contactInfo);
  } catch (error) {
    console.error('API错误:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}
