import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseServiceRoleKey = process.env['SUPABASE_SERVICE_ROLE_KEY'];

// 检查环境变量是否存在
if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.warn('Supabase admin environment variables not found');
}

// 使用service role key创建管理员客户端，绕过RLS策略
export const supabaseAdmin =
  supabaseUrl && supabaseServiceRoleKey
    ? createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })
    : null;

// 获取Supabase管理员客户端的函数
export function getSupabaseAdmin() {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.warn('Supabase environment variables not found, using mock client');

    // 创建一个更完整的mock客户端，支持所有常用的Supabase方法
    const createMockQuery = () => ({
      eq: () => createMockQuery(),
      neq: () => createMockQuery(),
      gt: () => createMockQuery(),
      gte: () => createMockQuery(),
      lt: () => createMockQuery(),
      lte: () => createMockQuery(),
      like: () => createMockQuery(),
      ilike: () => createMockQuery(),
      is: () => createMockQuery(),
      in: () => createMockQuery(),
      contains: () => createMockQuery(),
      containedBy: () => createMockQuery(),
      rangeGt: () => createMockQuery(),
      rangeGte: () => createMockQuery(),
      rangeLt: () => createMockQuery(),
      rangeLte: () => createMockQuery(),
      rangeAdjacent: () => createMockQuery(),
      overlaps: () => createMockQuery(),
      textSearch: () => createMockQuery(),
      match: () => createMockQuery(),
      not: () => createMockQuery(),
      or: () => createMockQuery(),
      filter: () => createMockQuery(),
      order: () => createMockQuery(),
      limit: () => createMockQuery(),
      range: () => Promise.resolve({ data: [], error: null, count: 0 }),
      single: () => Promise.resolve({ data: null, error: null }),
      maybeSingle: () => Promise.resolve({ data: null, error: null }),
      csv: () => Promise.resolve({ data: '', error: null }),
      geojson: () => Promise.resolve({ data: null, error: null }),
      explain: () => Promise.resolve({ data: null, error: null }),
      rollback: () => Promise.resolve({ data: null, error: null }),
      returns: () => createMockQuery(),
      then: (resolve: any) => resolve({ data: [], error: null, count: 0 }),
    });

    return {
      from: () => ({
        select: (_columns?: string, options?: any) => {
          const query = createMockQuery();
          // 如果指定了count选项，返回带count的结果
          if (options?.count) {
            return {
              ...query,
              then: (resolve: any) =>
                resolve({ data: [], error: null, count: 0 }),
            };
          }
          return query;
        },
        insert: () => ({
          select: () => createMockQuery(),
          then: (resolve: any) => resolve({ data: null, error: null }),
        }),
        update: () => ({
          eq: () => Promise.resolve({ data: null, error: null }),
          match: () => Promise.resolve({ data: null, error: null }),
          then: (resolve: any) => resolve({ data: null, error: null }),
        }),
        upsert: () => Promise.resolve({ data: null, error: null }),
        delete: () => ({
          eq: () => Promise.resolve({ data: null, error: null }),
          match: () => Promise.resolve({ data: null, error: null }),
        }),
      }),
      storage: {
        from: () => ({
          upload: () => Promise.resolve({ data: null, error: null }),
          getPublicUrl: () => ({ data: { publicUrl: '' } }),
          list: () => Promise.resolve({ data: [], error: null }),
          createBucket: () => Promise.resolve({ data: null, error: null }),
          remove: () => Promise.resolve({ data: null, error: null }),
          move: () => Promise.resolve({ data: null, error: null }),
          copy: () => Promise.resolve({ data: null, error: null }),
          createSignedUrl: () => Promise.resolve({ data: null, error: null }),
          createSignedUrls: () => Promise.resolve({ data: null, error: null }),
        }),
      },
      auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        getSession: () =>
          Promise.resolve({ data: { session: null }, error: null }),
        signOut: () => Promise.resolve({ error: null }),
      },
      rpc: () => Promise.resolve({ data: null, error: null }),
    } as any;
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// 文件上传函数，使用service role权限
export const uploadFileWithAdminRights = async (
  file: File,
  filePath: string
) => {
  try {
    if (!supabaseAdmin) {
      throw new Error(
        'Supabase admin client not available - missing environment variables'
      );
    }

    const { data, error } = await supabaseAdmin.storage
      .from('resources')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      throw error;
    }

    // 获取公共URL
    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from('resources').getPublicUrl(filePath);

    return {
      data,
      publicUrl,
    };
  } catch (error) {
    console.error('Admin file upload error:', error);
    throw error;
  }
};
