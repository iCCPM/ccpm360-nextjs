-- 创建PDF下载令牌表
CREATE TABLE IF NOT EXISTS pdf_download_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  token VARCHAR(255) UNIQUE NOT NULL,
  assessment_id UUID NOT NULL,
  participant_email VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_downloaded_at TIMESTAMP WITH TIME ZONE,
  FOREIGN KEY (assessment_id) REFERENCES assessment_records(id) ON DELETE CASCADE
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_pdf_download_tokens_token ON pdf_download_tokens(token);
CREATE INDEX IF NOT EXISTS idx_pdf_download_tokens_assessment_id ON pdf_download_tokens(assessment_id);
CREATE INDEX IF NOT EXISTS idx_pdf_download_tokens_expires_at ON pdf_download_tokens(expires_at);

-- 启用行级安全策略
ALTER TABLE pdf_download_tokens ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略：只允许通过API访问
CREATE POLICY "Allow API access to pdf_download_tokens" ON pdf_download_tokens
  FOR ALL USING (true);

-- 授权给anon和authenticated角色
GRANT ALL PRIVILEGES ON pdf_download_tokens TO anon;
GRANT ALL PRIVILEGES ON pdf_download_tokens TO authenticated;

-- 创建清理过期令牌的函数
CREATE OR REPLACE FUNCTION cleanup_expired_pdf_tokens()
RETURNS void AS $$
BEGIN
  UPDATE pdf_download_tokens 
  SET is_active = false 
  WHERE expires_at < NOW() AND is_active = true;
END;
$$ LANGUAGE plpgsql;

-- 创建定时清理任务（可选，需要pg_cron扩展）
-- SELECT cron.schedule('cleanup-expired-pdf-tokens', '0 2 * * *', 'SELECT cleanup_expired_pdf_tokens();');