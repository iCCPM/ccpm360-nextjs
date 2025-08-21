-- 修复assessment_questions表的管理员权限问题
-- 添加INSERT、UPDATE、DELETE权限的RLS策略

-- 为authenticated用户（管理员）添加INSERT权限策略
CREATE POLICY "Allow authenticated users to insert assessment questions" ON assessment_questions
    FOR INSERT TO authenticated
    WITH CHECK (true);

-- 为authenticated用户（管理员）添加UPDATE权限策略
CREATE POLICY "Allow authenticated users to update assessment questions" ON assessment_questions
    FOR UPDATE TO authenticated
    USING (true)
    WITH CHECK (true);

-- 为authenticated用户（管理员）添加DELETE权限策略
CREATE POLICY "Allow authenticated users to delete assessment questions" ON assessment_questions
    FOR DELETE TO authenticated
    USING (true);

-- 确保authenticated角色有完整的表权限
GRANT ALL PRIVILEGES ON assessment_questions TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE assessment_questions_id_seq TO authenticated;

-- 验证权限设置
SELECT 
    grantee, 
    table_name, 
    privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
    AND table_name = 'assessment_questions'
    AND grantee IN ('anon', 'authenticated')
ORDER BY table_name, grantee;