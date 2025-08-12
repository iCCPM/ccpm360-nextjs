import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// 检查环境变量是否存在
if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.warn('Supabase admin environment variables not found');
}

// 使用service role key创建管理员客户端，绕过RLS策略
export const supabaseAdmin = supabaseUrl && supabaseServiceRoleKey 
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null

// 文件上传函数，使用service role权限
export const uploadFileWithAdminRights = async (file: File, filePath: string) => {
  try {
    if (!supabaseAdmin) {
      throw new Error('Supabase admin client not available - missing environment variables')
    }

    const { data, error } = await supabaseAdmin.storage
      .from('resources')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      throw error
    }

    // 获取公共URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('resources')
      .getPublicUrl(filePath)

    return {
      data,
      publicUrl
    }
  } catch (error) {
    console.error('Admin file upload error:', error)
    throw error
  }
}