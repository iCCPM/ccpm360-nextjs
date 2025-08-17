// 测试Supabase连接的脚本
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function testSupabaseConnection() {
  console.log('开始测试Supabase连接...');

  // 检查环境变量
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log('Supabase URL:', supabaseUrl ? '已设置' : '未设置');
  console.log('Service Role Key:', supabaseServiceKey ? '已设置' : '未设置');

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ 环境变量缺失');
    return;
  }

  try {
    // 创建Supabase客户端
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log('✅ Supabase客户端创建成功');

    // 测试连接 - 获取数据库版本
    const { data: versionData, error: versionError } =
      await supabase.rpc('version');

    if (versionError) {
      console.log('版本查询错误:', versionError.message);
    } else {
      console.log('✅ 数据库连接成功');
    }

    // 测试admin_users表是否存在
    console.log('\n检查admin_users表...');
    const { data: tableData, error: tableError } = await supabase
      .from('admin_users')
      .select('id')
      .limit(1);

    if (tableError) {
      console.error('❌ admin_users表查询失败:', tableError.message);
      console.error('错误详情:', tableError);
    } else {
      console.log('✅ admin_users表访问成功');
      console.log('查询结果:', tableData);
    }
  } catch (error) {
    console.error('❌ 连接测试失败:', error.message);
    console.error('错误详情:', error);
  }
}

testSupabaseConnection();
