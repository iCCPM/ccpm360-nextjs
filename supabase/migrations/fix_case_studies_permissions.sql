-- 为 case_studies 表配置权限
-- 授予 anon 角色读取权限
GRANT SELECT ON case_studies TO anon;

-- 授予 authenticated 角色完整权限
GRANT ALL PRIVILEGES ON case_studies TO authenticated;

-- 创建 RLS 策略允许 authenticated 用户插入数据
CREATE POLICY "Allow authenticated users to insert case studies" ON case_studies
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- 创建 RLS 策略允许 authenticated 用户更新自己的数据
CREATE POLICY "Allow authenticated users to update case studies" ON case_studies
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

-- 创建 RLS 策略允许所有人查看已发布的案例
CREATE POLICY "Allow public to view published case studies" ON case_studies
  FOR SELECT TO anon, authenticated
  USING (published = true);

-- 创建 RLS 策略允许 authenticated 用户查看所有案例（包括草稿）
CREATE POLICY "Allow authenticated users to view all case studies" ON case_studies
  FOR SELECT TO authenticated
  USING (true);