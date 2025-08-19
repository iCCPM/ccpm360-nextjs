import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL']!;
const supabaseServiceKey = process.env['SUPABASE_SERVICE_ROLE_KEY']!;

// 支持的文件类型
const ALLOWED_FILE_TYPES = [
  // PDF文档
  'application/pdf',
  // Word文档
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  // Excel文档
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  // PowerPoint文档
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  // 文本文件
  'text/plain',
  'text/csv',
  // 图片文件
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  // 压缩文件
  'application/zip',
  'application/x-rar-compressed',
  'application/x-7z-compressed',
  // 其他常用格式
  'application/json',
  'application/xml',
  'text/xml',
];

// 最大文件大小 50MB
const MAX_FILE_SIZE = 50 * 1024 * 1024;

// 重试上传函数
async function uploadWithRetry(
  supabase: any,
  bucketName: string,
  fileName: string,
  file: File,
  maxRetries = 3
) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`文件上传尝试 ${attempt}/${maxRetries}: ${fileName}`);

      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        console.error(`上传尝试 ${attempt} 失败:`, error);
        if (attempt === maxRetries) {
          throw error;
        }
        // 等待后重试
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
        continue;
      }

      console.log(`文件上传成功 (尝试 ${attempt}):`, data);
      return data;
    } catch (error) {
      console.error(`上传尝试 ${attempt} 异常:`, error);
      if (attempt === maxRetries) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('开始处理文件上传请求');

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      console.error('未找到文件');
      return NextResponse.json({ error: '未找到文件' }, { status: 400 });
    }

    console.log('文件信息:', {
      name: file.name,
      type: file.type,
      size: file.size,
    });

    // 验证文件类型
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      console.error('不支持的文件类型:', file.type);
      return NextResponse.json(
        {
          error: `不支持的文件类型: ${file.type}`,
          supportedTypes: ALLOWED_FILE_TYPES,
        },
        { status: 400 }
      );
    }

    // 验证文件大小
    if (file.size > MAX_FILE_SIZE) {
      console.error('文件过大:', file.size);
      return NextResponse.json(
        {
          error: `文件大小超过限制，最大允许 ${MAX_FILE_SIZE / 1024 / 1024}MB`,
          maxSize: MAX_FILE_SIZE,
        },
        { status: 400 }
      );
    }

    // 创建 Supabase 客户端
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log('Supabase 客户端创建成功');

    // 验证用户（可选，根据需要启用）
    // const { data: { user }, error: userError } = await supabase.auth.getUser()
    // if (userError || !user) {
    //   console.error('用户验证失败:', userError)
    //   return NextResponse.json(
    //     { error: '用户未认证' },
    //     { status: 401 }
    //   )
    // }

    const bucketName = 'files-v2'; // 使用新的bucket名称避免旧配置限制

    // 检查 bucket 是否存在，不存在则创建
    console.log('开始检查存储bucket配置...');
    const { data: buckets, error: listError } =
      await supabase.storage.listBuckets();
    if (listError) {
      console.error('获取 bucket 列表失败:', listError);
      return NextResponse.json({ error: '存储服务配置错误' }, { status: 500 });
    }

    console.log(
      '当前存在的buckets:',
      buckets?.map((b) => ({ name: b.name, public: b.public }))
    );

    const bucketExists = buckets?.some((bucket) => bucket.name === bucketName);
    if (!bucketExists) {
      console.log(
        `创建新的 bucket: ${bucketName}，配置: { public: true, 无MIME类型限制 }`
      );
      const { error: createError } = await supabase.storage.createBucket(
        bucketName,
        {
          public: true,
          fileSizeLimit: MAX_FILE_SIZE,
          // 完全移除 allowedMimeTypes 限制，让 Supabase 接受所有文件类型
          // 我们在应用层进行文件类型验证
        }
      );

      if (createError) {
        console.error('创建 bucket 失败:', createError);
        return NextResponse.json(
          { error: '存储服务初始化失败' },
          { status: 500 }
        );
      }
      console.log(`✅ Bucket ${bucketName} 创建成功，支持所有文件类型`);
    } else {
      console.log(`Bucket ${bucketName} 已存在，跳过创建`);
    }

    // 生成唯一文件名
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop();
    const fileName = `${timestamp}-${randomString}.${fileExtension}`;

    console.log('生成的文件名:', fileName);

    // 上传文件
    await uploadWithRetry(supabase, bucketName, fileName, file);

    // 获取公共 URL
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    if (!urlData?.publicUrl) {
      console.error('获取公共 URL 失败');
      return NextResponse.json(
        { error: '文件上传成功但获取访问链接失败' },
        { status: 500 }
      );
    }

    console.log('文件上传完成，公共 URL:', urlData.publicUrl);

    return NextResponse.json({
      success: true,
      message: '文件上传成功',
      url: urlData.publicUrl,
      fileName: fileName,
      originalName: file.name,
      fileSize: file.size,
      fileType: file.type,
    });
  } catch (error) {
    console.error('文件上传过程中发生错误:', error);
    return NextResponse.json(
      {
        error: '文件上传失败，请重试',
        details: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}
