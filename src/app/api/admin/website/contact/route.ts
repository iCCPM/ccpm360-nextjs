import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 创建管理员客户端（使用service role key绕过RLS）
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 联系页面设置的数据类型
interface ContactPageSettings {
  id?: string;
  hero_title: string;
  hero_description: string;
  phone: string;
  email: string;
  address: string;
  working_hours: string;
  weekend_hours: string;
  wechat: string;
  qq: string;
  subway_route: string;
  bus_route: string;
  driving_route: string;
  traffic_tips: string;
  map_title: string;
  map_description: string;
  form_title: string;
  form_description: string;
  created_at?: string;
  updated_at?: string;
}

// GET - 获取联系页面设置
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('contact_page_settings')
      .select('*')
      .maybeSingle();

    if (error) {
      console.error('获取联系页面设置失败:', error);
      return NextResponse.json(
        { error: '获取联系页面设置失败' },
        { status: 500 }
      );
    }

    // 如果没有找到记录，返回默认设置
    if (!data) {
      const defaultSettings = {
        hero_title: '联系我们',
        hero_description: '我们期待与您的合作，为您提供专业的项目管理解决方案',
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
        map_title: '我们的位置',
        map_description: '欢迎您到访我们的办公室',
        form_title: '在线咨询',
        form_description: '请填写以下信息，我们会尽快与您联系',
      };
      return NextResponse.json(defaultSettings);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('获取联系页面设置时发生错误:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}

// POST - 保存联系页面设置
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 验证必填字段
    const requiredFields = [
      'hero_title',
      'hero_description',
      'phone',
      'email',
      'address',
    ];
    for (const field of requiredFields) {
      if (!body[field] || body[field].trim() === '') {
        return NextResponse.json(
          { error: `${field} 是必填字段` },
          { status: 400 }
        );
      }
    }

    // 准备要保存的数据
    const settingsData: Omit<
      ContactPageSettings,
      'id' | 'created_at' | 'updated_at'
    > = {
      hero_title: body.hero_title.trim(),
      hero_description: body.hero_description.trim(),
      phone: body.phone.trim(),
      email: body.email.trim(),
      address: body.address.trim(),
      working_hours: body.working_hours?.trim() || '',
      weekend_hours: body.weekend_hours?.trim() || '周六日及节假日 08:00~22:00',
      wechat: body.wechat?.trim() || '',
      qq: body.qq?.trim() || '',
      subway_route:
        body.subway_route?.trim() ||
        '地铁4号线/10号线海淀黄庄站A2出口，步行约5分钟',
      bus_route:
        body.bus_route?.trim() ||
        '乘坐26路、302路、332路、394路、608路、614路、681路、683路、717路、732路、801路、808路、814路、运通105线、运通106线、运通205线等公交车至中关村站下车',
      driving_route:
        body.driving_route?.trim() ||
        '导航至"中关村大街27号"，周边有多个停车场可供选择',
      traffic_tips:
        body.traffic_tips?.trim() ||
        '建议优先选择地铁出行，避开早晚高峰时段。如需驾车前往，请提前了解停车位情况。',
      map_title: body.map_title?.trim() || '我们的位置',
      map_description: body.map_description?.trim() || '欢迎您到访我们的办公室',
      form_title: body.form_title?.trim() || '在线咨询',
      form_description:
        body.form_description?.trim() || '请填写以下信息，我们会尽快与您联系',
    };

    // 检查是否已存在记录
    const { data: existingData, error: _checkError } = await supabaseAdmin
      .from('contact_page_settings')
      .select('id')
      .maybeSingle();

    let result;
    if (existingData) {
      // 更新现有记录
      result = await supabaseAdmin
        .from('contact_page_settings')
        .update({
          ...settingsData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingData.id)
        .select()
        .maybeSingle();
    } else {
      // 创建新记录
      result = await supabaseAdmin
        .from('contact_page_settings')
        .insert({
          ...settingsData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .maybeSingle();
    }

    if (result.error) {
      console.error('保存联系页面设置失败:', result.error);
      return NextResponse.json(
        { error: '保存联系页面设置失败' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: '联系页面设置保存成功',
      data: result.data,
    });
  } catch (error) {
    console.error('保存联系页面设置时发生错误:', error);
    return NextResponse.json({ error: '服务器内部错误' }, { status: 500 });
  }
}

// PUT - 更新联系页面设置（与POST相同的逻辑）
export async function PUT(request: NextRequest) {
  return POST(request);
}
