-- 添加计算机名字段到评估记录表
ALTER TABLE assessment_records 
ADD COLUMN computer_name VARCHAR(255);

-- 添加注释
COMMENT ON COLUMN assessment_records.computer_name IS '用户计算机名称';