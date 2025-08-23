import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

// 检查并创建 Storage bucket（带重试机制）
async function ensureBucketExists(
  supabase: any,
  bucketName: string,
  maxRetries = 3
) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(
        `Bucket check attempt ${attempt}/${maxRetries} for bucket: ${bucketName}`
      );

      // 检查 bucket 是否存在
      const { data: buckets, error: listError } =
        await supabase.storage.listBuckets();

      if (listError) {
        console.error(`Attempt ${attempt} - Error listing buckets:`, listError);

        // 如果是网络错误或临时错误，尝试重试
        if (
          attempt < maxRetries &&
          (listError.message.includes('fetch failed') ||
            listError.message.includes('network'))
        ) {
          console.log(`Retrying bucket check in ${attempt * 1000}ms...`);
          await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
          continue;
        }

        // 如果是权限错误，尝试直接创建bucket
        if (
          listError.message.includes('permission') ||
          listError.message.includes('unauthorized')
        ) {
          console.log(
            'Permission error detected, attempting direct bucket creation...'
          );
          return await createBucketDirectly(supabase, bucketName);
        }

        throw new Error(
          `Failed to list buckets after ${attempt} attempts: ${listError.message}`
        );
      }

      const bucketExists = buckets?.some(
        (bucket: any) => bucket.name === bucketName
      );

      if (!bucketExists) {
        console.log(`Bucket '${bucketName}' does not exist, creating...`);
        return await createBucketDirectly(supabase, bucketName);
      } else {
        console.log(`Bucket '${bucketName}' already exists`);
        return true;
      }
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error);
      if (attempt === maxRetries) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
    }
  }

  throw new Error(
    `Failed to ensure bucket exists after ${maxRetries} attempts`
  );
}

// 直接创建bucket的辅助函数
async function createBucketDirectly(supabase: any, bucketName: string) {
  try {
    const { data: createData, error: createError } =
      await supabase.storage.createBucket(bucketName, {
        public: true,
        allowedMimeTypes: [
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/webp',
          'image/gif',
        ],
        fileSizeLimit: 10485760, // 10MB
      });

    if (createError) {
      // 如果bucket已存在，这不是错误
      if (
        createError.message.includes('already exists') ||
        createError.message.includes('Duplicate')
      ) {
        console.log(
          `Bucket '${bucketName}' already exists (detected during creation)`
        );
        return true;
      }

      console.error('Error creating bucket:', createError);
      throw new Error(`Failed to create bucket: ${createError.message}`);
    }

    console.log(`Bucket '${bucketName}' created successfully:`, createData);
    return true;
  } catch (error) {
    console.error('Error in createBucketDirectly:', error);
    throw error;
  }
}

// 带重试机制的上传函数
async function uploadWithRetry(
  supabase: any,
  bucketName: string,
  filePath: string,
  file: File,
  maxRetries = 3
): Promise<string> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(
        `Upload attempt ${attempt}/${maxRetries} for file: ${filePath}`
      );

      // 将文件转换为 ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      console.log(
        `File converted to Uint8Array, size: ${uint8Array.length} bytes`
      );

      // 上传文件
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, uint8Array, {
          contentType: file.type,
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        console.error(`Upload attempt ${attempt} failed:`, error);
        lastError = new Error(`Upload failed: ${error.message}`);

        // 如果文件已存在，尝试使用upsert模式
        if (
          error.message.includes('already exists') ||
          error.message.includes('Duplicate')
        ) {
          console.log('File exists, trying with upsert mode...');
          const { data: upsertData, error: upsertError } =
            await supabase.storage
              .from(bucketName)
              .upload(filePath, uint8Array, {
                contentType: file.type,
                cacheControl: '3600',
                upsert: true,
              });

          if (!upsertError) {
            console.log(
              `Upload successful with upsert on attempt ${attempt}:`,
              upsertData
            );
            const { data: urlData } = supabase.storage
              .from(bucketName)
              .getPublicUrl(filePath);
            return urlData.publicUrl;
          }
        }

        // 如果是网络错误或临时错误，尝试重试
        if (
          attempt < maxRetries &&
          (error.message.includes('fetch failed') ||
            error.message.includes('network') ||
            error.message.includes('timeout') ||
            error.message.includes('connection'))
        ) {
          const delay = Math.min(attempt * 1000, 5000); // 最大延迟5秒
          console.log(
            `Network error detected, retrying upload in ${delay}ms...`
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }

        // 如果不是可重试的错误，直接抛出
        throw lastError;
      }

      console.log(`Upload successful on attempt ${attempt}:`, data);

      // 获取公共 URL
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      console.log(`Public URL generated: ${urlData.publicUrl}`);
      return urlData.publicUrl;
    } catch (error) {
      console.error(`Upload attempt ${attempt} error:`, error);
      lastError =
        error instanceof Error ? error : new Error('Unknown upload error');

      if (attempt === maxRetries) {
        break;
      }

      // 指数退避策略
      const delay = Math.min(Math.pow(2, attempt - 1) * 1000, 10000); // 最大延迟10秒
      console.log(`Waiting ${delay}ms before retry...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError || new Error(`Upload failed after ${maxRetries} attempts`);
}

// 处理 CORS 预检请求
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    console.log('Starting image upload process...');
    const supabase = getSupabaseAdmin();

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      console.error('No file found in request');
      return NextResponse.json({ error: '没有找到文件' }, { status: 400 });
    }

    console.log(
      `Processing file: ${file.name}, size: ${file.size}, type: ${file.type}`
    );

    // 验证文件类型
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif',
    ];
    if (!allowedTypes.includes(file.type)) {
      console.error(`Invalid file type: ${file.type}`);
      return NextResponse.json(
        { error: '不支持的文件类型。请上传 JPEG、PNG、WebP 或 GIF 格式的图片' },
        { status: 400 }
      );
    }

    // 验证文件大小 (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      console.error(`File too large: ${file.size} bytes (max: ${maxSize})`);
      return NextResponse.json(
        { error: '文件大小不能超过 10MB' },
        { status: 400 }
      );
    }

    const bucketName = 'case-studies';

    try {
      // 确保 bucket 存在
      console.log(`Ensuring bucket '${bucketName}' exists...`);
      await ensureBucketExists(supabase, bucketName);
      console.log('Bucket verification completed');
    } catch (bucketError) {
      console.error('Bucket configuration failed:', bucketError);
      return NextResponse.json(
        {
          error: 'Storage bucket 配置失败',
          details:
            bucketError instanceof Error
              ? bucketError.message
              : 'Unknown bucket error',
          suggestion: '请检查 Supabase Storage 服务配置和网络连接',
        },
        { status: 500 }
      );
    }

    // 生成唯一文件名
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `images/${fileName}`;

    console.log(`Generated file path: ${filePath}`);

    try {
      // 上传文件（带重试机制）
      console.log('Starting file upload...');
      const publicUrl = await uploadWithRetry(
        supabase,
        bucketName,
        filePath,
        file
      );
      console.log(`File uploaded successfully: ${publicUrl}`);

      return NextResponse.json({
        success: true,
        url: publicUrl,
        fileName: fileName,
        message: '文件上传成功',
      });
    } catch (uploadError) {
      console.error('File upload failed:', uploadError);
      return NextResponse.json(
        {
          error: '文件上传失败',
          details:
            uploadError instanceof Error
              ? uploadError.message
              : 'Unknown upload error',
          suggestion: '请检查网络连接和文件格式，然后重试',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Unexpected upload error:', error);
    return NextResponse.json(
      {
        error: '上传过程中发生意外错误',
        details: error instanceof Error ? error.message : 'Unknown error',
        suggestion: '请稍后重试，如果问题持续存在请联系技术支持',
      },
      { status: 500 }
    );
  }
}
