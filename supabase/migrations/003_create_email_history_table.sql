-- 创建邮件发送历史表
CREATE TABLE IF NOT EXISTS email_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    recipient_email VARCHAR(255) NOT NULL,
    email_type VARCHAR(50) NOT NULL, -- assessment_result, follow_up_1, follow_up_2, etc.
    subject VARCHAR(500) NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    assessment_id UUID REFERENCES assessment_records(id),
    status VARCHAR(20) DEFAULT 'sent', -- sent, failed, bounced, opened, clicked
    opened_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_email_history_recipient ON email_history(recipient_email);
CREATE INDEX IF NOT EXISTS idx_email_history_assessment ON email_history(assessment_id);
CREATE INDEX IF NOT EXISTS idx_email_history_type ON email_history(email_type);
CREATE INDEX IF NOT EXISTS idx_email_history_sent_at ON email_history(sent_at);

-- 启用行级安全策略
ALTER TABLE email_history ENABLE ROW LEVEL SECURITY;

-- 创建策略：允许匿名用户插入邮件记录
CREATE POLICY "Allow anonymous insert email history" ON email_history
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- 创建策略：允许认证用户查看和管理邮件记录
CREATE POLICY "Allow authenticated users to manage email history" ON email_history
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_email_history_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器
CREATE TRIGGER trigger_update_email_history_updated_at
    BEFORE UPDATE ON email_history
    FOR EACH ROW
    EXECUTE FUNCTION update_email_history_updated_at();

-- 创建邮件营销序列配置表
CREATE TABLE IF NOT EXISTS email_sequences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    trigger_event VARCHAR(50) NOT NULL, -- assessment_completed, user_registered, etc.
    delay_days INTEGER NOT NULL DEFAULT 0,
    email_type VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 插入默认的邮件序列配置
INSERT INTO email_sequences (name, description, trigger_event, delay_days, email_type) VALUES
('测试结果报告', '用户完成测试后立即发送个性化报告', 'assessment_completed', 0, 'assessment_result'),
('CCPM学习资料', '测试完成3天后发送CCPM学习资料', 'assessment_completed', 3, 'follow_up_1'),
('成功案例分享', '测试完成7天后发送CCPM成功案例', 'assessment_completed', 7, 'follow_up_2');

-- 启用行级安全策略
ALTER TABLE email_sequences ENABLE ROW LEVEL SECURITY;

-- 创建策略：允许认证用户管理邮件序列
CREATE POLICY "Allow authenticated users to manage email sequences" ON email_sequences
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 创建策略：允许匿名用户查看活跃的邮件序列
CREATE POLICY "Allow anonymous read active email sequences" ON email_sequences
    FOR SELECT
    TO anon
    USING (is_active = true);

-- 创建更新时间触发器
CREATE TRIGGER trigger_update_email_sequences_updated_at
    BEFORE UPDATE ON email_sequences
    FOR EACH ROW
    EXECUTE FUNCTION update_email_history_updated_at();