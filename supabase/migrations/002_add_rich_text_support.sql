-- 修改assessment_questions表以支持富文本内容
-- 将question_text和explanation字段改为支持HTML内容

-- 由于PostgreSQL的TEXT类型已经可以存储HTML内容，
-- 我们主要需要添加注释说明这些字段现在支持HTML格式

COMMENT ON COLUMN assessment_questions.question_text IS '题目内容，支持HTML格式，可包含图片等富文本内容';
COMMENT ON COLUMN assessment_questions.explanation IS '题目解释，支持HTML格式，可包含图片等富文本内容';

-- 可选：如果需要添加字段长度限制或其他约束
-- ALTER TABLE assessment_questions ALTER COLUMN question_text TYPE TEXT;
-- ALTER TABLE assessment_questions ALTER COLUMN explanation TYPE TEXT;