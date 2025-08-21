-- 创建项目管理理念测试相关表

-- 创建测试题目表
CREATE TABLE assessment_questions (
    id SERIAL PRIMARY KEY,
    question_text TEXT NOT NULL,
    dimension VARCHAR(50) NOT NULL, -- 维度：time_management, resource_coordination, risk_control, team_collaboration
    options JSONB NOT NULL, -- 选项数组，包含选项文本和分数
    explanation TEXT, -- 题目解释
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建测试记录表
CREATE TABLE assessment_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email VARCHAR(255),
    user_name VARCHAR(100),
    user_company VARCHAR(200),
    answers JSONB NOT NULL, -- 用户答案，格式：{"question_id": "option_index"}
    scores JSONB NOT NULL, -- 各维度得分，格式：{"time_management": 85, "resource_coordination": 70, ...}
    total_score INTEGER NOT NULL,
    assessment_level VARCHAR(50) NOT NULL, -- 评估等级：beginner, intermediate, advanced
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

-- 创建索引
CREATE INDEX idx_assessment_questions_dimension ON assessment_questions(dimension);
CREATE INDEX idx_assessment_records_email ON assessment_records(user_email);
CREATE INDEX idx_assessment_records_completed_at ON assessment_records(completed_at);
CREATE INDEX idx_assessment_records_total_score ON assessment_records(total_score);

-- 启用行级安全策略
ALTER TABLE assessment_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_records ENABLE ROW LEVEL SECURITY;

-- 为题目表创建策略（所有人可读）
CREATE POLICY "Allow public read access to assessment questions" ON assessment_questions
    FOR SELECT USING (true);

-- 为记录表创建策略（允许插入和读取自己的记录）
CREATE POLICY "Allow public insert to assessment records" ON assessment_records
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow users to read their own records" ON assessment_records
    FOR SELECT USING (user_email = current_setting('request.jwt.claims', true)::json->>'email');

-- 授权给anon和authenticated角色
GRANT SELECT ON assessment_questions TO anon, authenticated;
GRANT INSERT, SELECT ON assessment_records TO anon, authenticated;
GRANT USAGE, SELECT ON SEQUENCE assessment_questions_id_seq TO anon, authenticated;