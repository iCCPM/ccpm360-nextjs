-- 检查assessment_records表中的数据
SELECT 
  id,
  user_email,
  user_name,
  total_score,
  assessment_level,
  completed_at
FROM assessment_records 
ORDER BY completed_at DESC 
LIMIT 10;

-- 检查字段名是否正确
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'assessment_records' 
AND table_schema = 'public'
ORDER BY ordinal_position;