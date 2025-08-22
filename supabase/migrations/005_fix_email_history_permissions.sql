-- 修复email_history表的权限问题
-- 添加匿名用户的SELECT权限，以便API能够查询邮件历史记录

-- 创建策略：允许匿名用户查看邮件记录
CREATE POLICY "Allow anonymous read email history" ON email_history
    FOR SELECT
    TO anon
    USING (true);

-- 授予anon角色对email_history表的SELECT权限
GRANT SELECT ON email_history TO anon;

-- 授予authenticated角色对email_history表的所有权限
GRANT ALL PRIVILEGES ON email_history TO authenticated;