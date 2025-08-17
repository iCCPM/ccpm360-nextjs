-- 添加周末工作时间字段到contact_page_settings表
ALTER TABLE contact_page_settings 
ADD COLUMN IF NOT EXISTS weekend_hours TEXT DEFAULT '周六日及节假日 08:00~22:00';

-- 更新现有记录的weekend_hours字段（如果为空）
UPDATE contact_page_settings 
SET weekend_hours = '周六日及节假日 08:00~22:00' 
WHERE weekend_hours IS NULL;

-- 验证字段添加成功
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'contact_page_settings' 
AND column_name = 'weekend_hours';