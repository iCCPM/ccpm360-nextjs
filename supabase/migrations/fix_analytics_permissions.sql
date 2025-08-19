-- 为访客统计表授予权限
-- 允许匿名用户和认证用户访问visitor_sessions表
GRANT ALL PRIVILEGES ON visitor_sessions TO anon;
GRANT ALL PRIVILEGES ON visitor_sessions TO authenticated;

-- 允许匿名用户和认证用户访问page_views表
GRANT ALL PRIVILEGES ON page_views TO anon;
GRANT ALL PRIVILEGES ON page_views TO authenticated;

-- 创建RLS策略允许所有用户插入和查询数据
CREATE POLICY "Allow all operations on visitor_sessions" ON visitor_sessions
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on page_views" ON page_views
  FOR ALL USING (true) WITH CHECK (true);

-- 确保user_events表也有权限（如果存在）
GRANT ALL PRIVILEGES ON user_events TO anon;
GRANT ALL PRIVILEGES ON user_events TO authenticated;

CREATE POLICY "Allow all operations on user_events" ON user_events
  FOR ALL USING (true) WITH CHECK (true);