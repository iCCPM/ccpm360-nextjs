-- 创建访客分析相关表

-- 访客会话表
CREATE TABLE IF NOT EXISTS visitor_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id VARCHAR(255) UNIQUE NOT NULL,
  visitor_id VARCHAR(255),
  ip_address INET,
  user_agent TEXT,
  browser VARCHAR(100),
  os VARCHAR(100),
  device VARCHAR(50),
  country VARCHAR(100),
  city VARCHAR(100),
  referrer TEXT,
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  language VARCHAR(10),
  timezone VARCHAR(50),
  screen_resolution VARCHAR(20),
  viewport_size VARCHAR(20),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  page_views INTEGER DEFAULT 0,
  is_bounce BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 页面访问表
CREATE TABLE IF NOT EXISTS page_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id VARCHAR(255) REFERENCES visitor_sessions(session_id),
  page_url TEXT NOT NULL,
  page_title VARCHAR(255),
  page_path VARCHAR(500),
  referrer TEXT,
  query_params JSONB,
  load_time_ms INTEGER,
  time_on_page_seconds INTEGER,
  scroll_depth_percent INTEGER,
  exit_page BOOLEAN DEFAULT FALSE,
  bounce BOOLEAN DEFAULT FALSE,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 用户事件表
CREATE TABLE IF NOT EXISTS user_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id VARCHAR(255) REFERENCES visitor_sessions(session_id),
  page_view_id UUID REFERENCES page_views(id),
  event_type VARCHAR(50) NOT NULL, -- click, scroll, form_submit, download, etc.
  event_name VARCHAR(100),
  element_selector VARCHAR(500),
  element_text TEXT,
  element_attributes JSONB,
  position_x INTEGER,
  position_y INTEGER,
  event_data JSONB,
  occurred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 每日统计汇总表
CREATE TABLE IF NOT EXISTS daily_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  unique_visitors INTEGER DEFAULT 0,
  total_sessions INTEGER DEFAULT 0,
  total_page_views INTEGER DEFAULT 0,
  avg_session_duration DECIMAL(10,2),
  bounce_rate DECIMAL(5,2),
  top_pages JSONB,
  top_referrers JSONB,
  device_breakdown JSONB,
  browser_breakdown JSONB,
  country_breakdown JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(date)
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_started_at ON visitor_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_ip_address ON visitor_sessions(ip_address);
CREATE INDEX IF NOT EXISTS idx_page_views_session_id ON page_views(session_id);
CREATE INDEX IF NOT EXISTS idx_page_views_viewed_at ON page_views(viewed_at);
CREATE INDEX IF NOT EXISTS idx_page_views_page_path ON page_views(page_path);
CREATE INDEX IF NOT EXISTS idx_user_events_session_id ON user_events(session_id);
CREATE INDEX IF NOT EXISTS idx_user_events_occurred_at ON user_events(occurred_at);
CREATE INDEX IF NOT EXISTS idx_user_events_event_type ON user_events(event_type);
CREATE INDEX IF NOT EXISTS idx_daily_analytics_date ON daily_analytics(date);

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为相关表添加更新时间触发器
CREATE TRIGGER update_visitor_sessions_updated_at BEFORE UPDATE ON visitor_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_daily_analytics_updated_at BEFORE UPDATE ON daily_analytics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 启用行级安全策略
ALTER TABLE visitor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_analytics ENABLE ROW LEVEL SECURITY;

-- 创建策略：允许匿名用户插入数据（用于前端追踪）
CREATE POLICY "Allow anonymous insert on visitor_sessions" ON visitor_sessions FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anonymous insert on page_views" ON page_views FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anonymous insert on user_events" ON user_events FOR INSERT TO anon WITH CHECK (true);

-- 创建策略：只允许认证用户查看数据（管理后台）
CREATE POLICY "Allow authenticated read on visitor_sessions" ON visitor_sessions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read on page_views" ON page_views FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read on user_events" ON user_events FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read on daily_analytics" ON daily_analytics FOR SELECT TO authenticated USING (true);

-- 创建策略：允许认证用户更新和删除数据
CREATE POLICY "Allow authenticated update on visitor_sessions" ON visitor_sessions FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated update on daily_analytics" ON daily_analytics FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert on daily_analytics" ON daily_analytics FOR INSERT TO authenticated WITH CHECK (true);

-- 授予权限
GRANT SELECT, INSERT ON visitor_sessions TO anon;
GRANT SELECT, INSERT ON page_views TO anon;
GRANT SELECT, INSERT ON user_events TO anon;

GRANT ALL PRIVILEGES ON visitor_sessions TO authenticated;
GRANT ALL PRIVILEGES ON page_views TO authenticated;
GRANT ALL PRIVILEGES ON user_events TO authenticated;
GRANT ALL PRIVILEGES ON daily_analytics TO authenticated;