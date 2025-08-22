-- 测试assessments查询
SELECT 
  id, 
  user_email, 
  user_name, 
  user_company, 
  total_score, 
  assessment_level, 
  completed_at, 
  ip_address, 
  user_agent, 
  computer_name
FROM assessment_records 
ORDER BY completed_at DESC 
LIMIT 5;

-- 检查是否有dimension_scores字段
SELECT scores FROM assessment_records LIMIT 1;