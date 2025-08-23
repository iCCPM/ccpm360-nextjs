-- 创建upsert_session_page_view函数
CREATE OR REPLACE FUNCTION public.upsert_session_page_view(
  p_session_id TEXT,
  p_visitor_id TEXT,
  p_device TEXT,
  p_browser TEXT,
  p_os TEXT
) RETURNS void AS $$
BEGIN
  -- 尝试更新现有会话
  UPDATE public.visitor_sessions
  SET 
    page_views = page_views + 1,
    updated_at = NOW()
  WHERE session_id = p_session_id;
  
  -- 如果没有更新任何行，则插入新会话
  IF NOT FOUND THEN
    INSERT INTO public.visitor_sessions (
      session_id,
      visitor_id,
      device_type,
      browser,
      os,
      page_views,
      duration_seconds,
      created_at,
      updated_at
    ) VALUES (
      p_session_id,
      p_visitor_id,
      p_device,
      p_browser,
      p_os,
      1, -- 初始页面浏览量为1
      0, -- 初始会话时长为0
      NOW(),
      NOW()
    );
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 授予anon和authenticated角色执行权限
GRANT EXECUTE ON FUNCTION public.upsert_session_page_view(TEXT, TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;