-- 为assessment_records表添加权限
GRANT SELECT ON assessment_records TO authenticated;
GRANT SELECT ON assessment_records TO anon;

-- 创建RLS策略允许所有用户读取assessment_records
CREATE POLICY "Allow read access to assessment_records" ON assessment_records
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- 如果策略已存在，先删除再创建
DROP POLICY IF EXISTS "Allow read access to assessment_records" ON assessment_records;
CREATE POLICY "Allow read access to assessment_records" ON assessment_records
  FOR SELECT
  TO authenticated, anon
  USING (true);