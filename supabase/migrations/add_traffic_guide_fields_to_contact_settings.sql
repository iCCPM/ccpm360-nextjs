-- 添加交通指南字段到contact_page_settings表
ALTER TABLE contact_page_settings 
ADD COLUMN IF NOT EXISTS subway_route TEXT DEFAULT '地铁4号线/10号线海淀黄庄站A2出口，步行约5分钟',
ADD COLUMN IF NOT EXISTS bus_route TEXT DEFAULT '乘坐26路、302路、332路、394路、608路、614路、681路、683路、717路、732路、801路、808路、814路、运通105线、运通106线、运通205线等公交车至中关村站下车',
ADD COLUMN IF NOT EXISTS driving_route TEXT DEFAULT '导航至"中关村大街27号"，周边有多个停车场可供选择',
ADD COLUMN IF NOT EXISTS traffic_tips TEXT DEFAULT '建议优先选择地铁出行，避开早晚高峰时段。如需驾车前往，请提前了解停车位情况。';

-- 为新字段设置权限
GRANT SELECT ON contact_page_settings TO anon;
GRANT ALL PRIVILEGES ON contact_page_settings TO authenticated;

-- 更新现有记录的默认值（如果存在记录的话）
UPDATE contact_page_settings 
SET 
  subway_route = COALESCE(subway_route, '地铁4号线/10号线海淀黄庄站A2出口，步行约5分钟'),
  bus_route = COALESCE(bus_route, '乘坐26路、302路、332路、394路、608路、614路、681路、683路、717路、732路、801路、808路、814路、运通105线、运通106线、运通205线等公交车至中关村站下车'),
  driving_route = COALESCE(driving_route, '导航至"中关村大街27号"，周边有多个停车场可供选择'),
  traffic_tips = COALESCE(traffic_tips, '建议优先选择地铁出行，避开早晚高峰时段。如需驾车前往，请提前了解停车位情况。')
WHERE subway_route IS NULL OR bus_route IS NULL OR driving_route IS NULL OR traffic_tips IS NULL;