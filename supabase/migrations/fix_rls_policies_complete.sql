-- 删除可能存在的冲突策略
DROP POLICY IF EXISTS "Allow public read access to assessment questions" ON assessment_questions;
DROP POLICY IF EXISTS "Allow authenticated users to insert assessment questions" ON assessment_questions;
DROP POLICY IF EXISTS "Allow authenticated users to update assessment questions" ON assessment_questions;
DROP POLICY IF EXISTS "Allow authenticated users to delete assessment questions" ON assessment_questions;

-- 确保RLS已启用
ALTER TABLE assessment_questions ENABLE ROW LEVEL SECURITY;

-- 创建新的RLS策略
-- 允许所有用户读取题目（用于测评）
CREATE POLICY "Enable read access for all users" ON assessment_questions
    FOR SELECT USING (true);

-- 允许认证用户插入题目
CREATE POLICY "Enable insert for authenticated users" ON assessment_questions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 允许认证用户更新题目
CREATE POLICY "Enable update for authenticated users" ON assessment_questions
    FOR UPDATE USING (auth.role() = 'authenticated');

-- 允许认证用户删除题目
CREATE POLICY "Enable delete for authenticated users" ON assessment_questions
    FOR DELETE USING (auth.role() = 'authenticated');

-- 确保authenticated角色有完整的表权限
GRANT ALL PRIVILEGES ON assessment_questions TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE assessment_questions_id_seq TO authenticated;

-- 验证策略创建结果
SELECT 
    policyname,
    cmd,
    roles
FROM pg_policies 
WHERE tablename = 'assessment_questions';