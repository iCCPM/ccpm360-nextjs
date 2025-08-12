import { createClient, SupabaseClient } from '@supabase/supabase-js'

// 延迟初始化Supabase客户端
let supabaseInstance: SupabaseClient | null = null;

function createSupabaseClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    // 返回一个模拟客户端，无论是在服务端还是客户端
    console.warn('Supabase environment variables not found, using mock client');
    return {
      auth: {
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        signInWithPassword: () => Promise.resolve({ data: { user: null, session: null }, error: null }),
        signOut: () => Promise.resolve({ error: null })
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({ data: null, error: null }),
            order: () => Promise.resolve({ data: [], error: null })
          }),
          order: () => Promise.resolve({ data: [], error: null }),
          in: () => Promise.resolve({ data: [], error: null })
        }),
        insert: () => Promise.resolve({ data: null, error: null }),
        update: () => Promise.resolve({ data: null, error: null }),
        delete: () => Promise.resolve({ data: null, error: null })
      }),
      storage: {
        from: () => ({
          upload: () => Promise.resolve({ data: null, error: null }),
          remove: () => Promise.resolve({ data: null, error: null })
        })
      }
    } as any;
  }
  
  return createClient(supabaseUrl, supabaseAnonKey);
}

function getSupabase(): SupabaseClient {
  if (!supabaseInstance) {
    supabaseInstance = createSupabaseClient();
  }
  return supabaseInstance;
}

export const supabase = getSupabase();

// 数据库表类型定义
export interface ContactSubmission {
  id?: string
  name: string
  company?: string
  position?: string
  phone: string
  email: string
  service_type: string
  message: string
  status?: string
  created_at?: string
  updated_at?: string
}

export interface Article {
  id?: string
  title: string
  content: string
  excerpt?: string
  category: string
  author: string
  featured_image_url?: string
  tags?: string[]
  published?: boolean
  view_count?: number
  created_at?: string
  updated_at?: string
}

export interface CaseStudy {
  id?: string
  title: string
  client_name: string
  industry: string
  challenge: string
  solution: string
  results: string
  testimonial?: string
  project_duration?: string
  team_size?: number
  featured_image_url?: string
  tags?: string[]
  published?: boolean
  created_at?: string
  updated_at?: string
}

export interface DownloadResource {
  id?: string
  title: string
  description?: string
  file_url: string
  file_type: string
  file_size?: string
  category: string
  download_count?: number
  featured?: boolean
  created_at?: string
  updated_at?: string
}

// API 函数
export const contactAPI = {
  // 提交联系表单
  async submitForm(data: ContactSubmission) {
    const { error } = await supabase
      .from('contact_submissions')
      .insert([data])
    
    if (error) {
      throw new Error(error.message)
    }
    
    return { success: true }
  }
}

export const articlesAPI = {
  // 获取所有已发布的文章
  async getPublishedArticles(category?: string) {
    let query = supabase
      .from('articles')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false })
    
    if (category) {
      query = query.eq('category', category)
    }
    
    const { data, error } = await query
    
    if (error) {
      throw new Error(error.message)
    }
    
    return data as Article[]
  },
  
  // 获取文章详情
  async getArticleById(id: string) {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('id', id)
      .eq('published', true)
      .single()
    
    if (error) {
      throw new Error(error.message)
    }
    
    return data as Article
  },
  
  // 增加文章浏览次数
  async incrementViewCount(id: string) {
    const { error } = await supabase.rpc('increment_view_count', {
      article_id: id
    })
    
    if (error) {
      console.error('Failed to increment view count:', error)
    }
  }
}

export const caseStudiesAPI = {
  // 获取所有已发布的案例
  async getPublishedCaseStudies(industry?: string) {
    let query = supabase
      .from('case_studies')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false })
    
    if (industry) {
      query = query.eq('industry', industry)
    }
    
    const { data, error } = await query
    
    if (error) {
      throw new Error(error.message)
    }
    
    return data as CaseStudy[]
  },
  
  // 获取案例详情
  async getCaseStudyById(id: string) {
    const { data, error } = await supabase
      .from('case_studies')
      .select('*')
      .eq('id', id)
      .eq('published', true)
      .single()
    
    if (error) {
      throw new Error(error.message)
    }
    
    return data as CaseStudy
  }
}

export const downloadResourcesAPI = {
  // 获取所有下载资源
  async getDownloadResources(category?: string, featured?: boolean) {
    let query = supabase
      .from('download_resources')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (category) {
      query = query.eq('category', category)
    }
    
    if (featured !== undefined) {
      query = query.eq('featured', featured)
    }
    
    const { data, error } = await query
    
    if (error) {
      throw new Error(error.message)
    }
    
    return data as DownloadResource[]
  },
  
  // 增加下载次数
  async incrementDownloadCount(id: string) {
    const { error } = await supabase.rpc('increment_download_count', {
      resource_id: id
    })
    
    if (error) {
      console.error('Failed to increment download count:', error)
    }
  }
}