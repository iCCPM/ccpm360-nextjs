-- 查看assessment_questions表中options字段的实际数据结构
SELECT id, question_text, options, dimension 
FROM assessment_questions 
LIMIT 3;