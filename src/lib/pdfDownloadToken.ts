import { supabase } from '@/lib/supabase';
import crypto from 'crypto';

// PDF下载令牌的有效期（7天）
const TOKEN_EXPIRY_DAYS = 7;

/**
 * 生成安全的下载令牌
 */
function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * 创建PDF下载令牌
 * @param assessmentId 评估记录ID
 * @param participantEmail 参与者邮箱
 * @returns 下载令牌和过期时间
 */
export async function createPDFDownloadToken(
  assessmentId: string,
  participantEmail: string
): Promise<{ token: string; expiresAt: Date; downloadUrl: string } | null> {
  try {
    // 生成安全令牌
    const token = generateSecureToken();

    // 计算过期时间（7天后）
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + TOKEN_EXPIRY_DAYS);

    // 插入令牌记录
    const { error } = await supabase
      .from('pdf_download_tokens')
      .insert({
        token,
        assessment_id: assessmentId,
        participant_email: participantEmail,
        expires_at: expiresAt.toISOString(),
        is_active: true,
        download_count: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('创建PDF下载令牌失败:', error);
      return null;
    }

    // 构建下载URL
    const baseUrl =
      process.env['NEXT_PUBLIC_APP_URL'] || 'http://localhost:3000';
    const downloadUrl = `${baseUrl}/api/download/pdf/${token}`;

    return {
      token,
      expiresAt,
      downloadUrl,
    };
  } catch (error) {
    console.error('创建PDF下载令牌时发生错误:', error);
    return null;
  }
}

/**
 * 验证PDF下载令牌是否有效
 * @param token 下载令牌
 * @returns 令牌数据或null
 */
export async function validatePDFDownloadToken(token: string) {
  try {
    const { data, error } = await supabase
      .from('pdf_download_tokens')
      .select('*')
      .eq('token', token)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      return null;
    }

    // 检查令牌是否过期
    const expiryDate = new Date(data.expires_at);
    const now = new Date();

    if (now > expiryDate) {
      // 令牌已过期，标记为无效
      await supabase
        .from('pdf_download_tokens')
        .update({ is_active: false })
        .eq('token', token);
      return null;
    }

    return data;
  } catch (error) {
    console.error('验证PDF下载令牌时发生错误:', error);
    return null;
  }
}

/**
 * 清理过期的PDF下载令牌
 */
export async function cleanupExpiredTokens(): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('pdf_download_tokens')
      .update({ is_active: false })
      .lt('expires_at', new Date().toISOString())
      .eq('is_active', true)
      .select('id');

    if (error) {
      console.error('清理过期令牌失败:', error);
      return 0;
    }

    return data?.length || 0;
  } catch (error) {
    console.error('清理过期令牌时发生错误:', error);
    return 0;
  }
}

/**
 * 获取令牌统计信息
 * @param assessmentId 评估记录ID
 */
export async function getTokenStats(assessmentId: string) {
  try {
    const { data, error } = await supabase
      .from('pdf_download_tokens')
      .select('download_count, last_downloaded_at, created_at')
      .eq('assessment_id', assessmentId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return null;
    }

    return data;
  } catch (error) {
    console.error('获取令牌统计信息时发生错误:', error);
    return null;
  }
}
