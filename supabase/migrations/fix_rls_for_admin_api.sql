-- 修复RLS策略以支持管理员API操作
-- 删除现有策略
DROP POLICY IF EXISTS "Enable read access for all users" ON assessment_questions;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON assessment_questions;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON assessment_questions;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON assessment_questions;

-- 创建新的RLS策略
-- 允许所有用户读取题目（用于测评和管理）
CREATE POLICY "Enable read access for all users" ON assessment_questions
    FOR SELECT USING (true);

-- 允许anon角色插入题目（管理员API使用anon key）
CREATE POLICY "Enable insert for admin" ON assessment_questions
    FOR INSERT WITH CHECK (true);

-- 允许anon角色更新题目（管理员API使用anon key）
CREATE POLICY "Enable update for admin" ON assessment_questions
    FOR UPDATE USING (true);

-- 允许anon角色删除题目（管理员API使用anon key）
CREATE POLICY "Enable delete for admin" ON assessment_questions
    FOR DELETE USING (true);

-- 确保anon和authenticated角色有完整的表权限
GRANT ALL PRIVILEGES ON assessment_questions TO anon;
GRANT ALL PRIVILEGES ON assessment_questions TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE assessment_questions_id_seq TO anon;
GRANT USAGE, SELECT ON SEQUENCE assessment_questions_id_seq TO authenticated;

-- 验证策略创建结果
SELECT 
    policyname,
    cmd,
    roles
FROM pg_policies 
WHERE tablename = 'assessment_questions';