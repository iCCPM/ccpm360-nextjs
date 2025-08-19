-- 为 case_studies 表添加 gallery 字段来存储图片库
ALTER TABLE case_studies 
ADD COLUMN gallery TEXT[] DEFAULT '{}' -- 使用文本数组存储多个图片URL
;

-- 添加注释
COMMENT ON COLUMN case_studies.gallery IS '案例图片库，存储多个图片URL';

-- 为 gallery 字段创建索引（可选，用于搜索优化）
CREATE INDEX IF NOT EXISTS idx_case_studies_gallery ON case_studies USING GIN (gallery);