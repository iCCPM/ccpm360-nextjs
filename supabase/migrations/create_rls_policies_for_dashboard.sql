-- 为仪表板数据创建RLS策略

-- 为contact_submissions表创建允许anon角色SELECT的策略
CREATE POLICY "Allow anon to read contact_submissions" ON contact_submissions
  FOR SELECT TO anon
  USING (true);

-- 为assessment_records表创建允许anon角色SELECT的策略
CREATE POLICY "Allow anon to read assessment_records" ON assessment_records
  FOR SELECT TO anon
  USING (true);

-- 检查策略是否创建成功
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename IN ('contact_submissions', 'assessment_records')
ORDER BY tablename, policyname;