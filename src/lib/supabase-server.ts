// Supabase服务端客户端工具
// 统一处理环境变量检查和mock客户端创建

// 条件导入Supabase客户端
let createClient: any = null;
if (typeof window === 'undefined') {
  // 只在服务端环境导入
  try {
    const { createClient: supabaseCreateClient } = eval('require')(
      '@supabase/supabase-js'
    );
    createClient = supabaseCreateClient;
  } catch (error) {
    // 如果导入失败，createClient保持为null
    console.warn('Supabase module not available');
  }
}

// 创建mock客户端的通用函数
function createMockClient() {
  return {
    from: () => ({
      select: () => ({
        maybeSingle: () => Promise.resolve({ data: null, error: null }),
        single: () => Promise.resolve({ data: null, error: null }),
        eq: () => ({
          maybeSingle: () => Promise.resolve({ data: null, error: null }),
          single: () => Promise.resolve({ data: null, error: null }),
        }),
      }),
      insert: () => ({
        select: () => ({
          maybeSingle: () => Promise.resolve({ data: null, error: null }),
          single: () => Promise.resolve({ data: null, error: null }),
        }),
      }),
      update: () => ({
        eq: () => ({
          select: () => ({
            maybeSingle: () => Promise.resolve({ data: null, error: null }),
            single: () => Promise.resolve({ data: null, error: null }),
          }),
        }),
      }),
      delete: () => ({
        eq: () => Promise.resolve({ data: null, error: null }),
      }),
      upsert: () => ({
        select: () => ({
          maybeSingle: () => Promise.resolve({ data: null, error: null }),
          single: () => Promise.resolve({ data: null, error: null }),
        }),
      }),
    }),
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      signUp: () => Promise.resolve({ data: { user: null }, error: null }),
      signInWithPassword: () =>
        Promise.resolve({ data: { user: null }, error: null }),
      signOut: () => Promise.resolve({ error: null }),
      resetPasswordForEmail: () => Promise.resolve({ data: null, error: null }),
    },
    storage: {
      from: () => ({
        upload: () => Promise.resolve({ data: null, error: null }),
        remove: () => Promise.resolve({ data: null, error: null }),
        getPublicUrl: () => ({ data: { publicUrl: '' } }),
      }),
    },
  };
}

// 获取Supabase管理员客户端（使用service role key）
export function getSupabaseAdmin() {
  const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL'];
  const supabaseServiceKey = process.env['SUPABASE_SERVICE_ROLE_KEY'];

  if (supabaseUrl && supabaseServiceKey && createClient) {
    return createClient(supabaseUrl, supabaseServiceKey);
  } else {
    console.warn('Supabase environment variables not found, using mock client');
    return createMockClient();
  }
}

// 获取Supabase匿名客户端（使用anon key）
export function getSupabaseClient() {
  const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL'];
  const supabaseAnonKey = process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

  if (supabaseUrl && supabaseAnonKey && createClient) {
    return createClient(supabaseUrl, supabaseAnonKey);
  } else {
    console.warn('Supabase environment variables not found, using mock client');
    return createMockClient();
  }
}
