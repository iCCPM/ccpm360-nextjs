import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

// 检查并创建 Storage bucket
async function ensureBucketExists(supabase: any, bucketName: string) {
  try {
    console.log(`检查 bucket: ${bucketName}`);

    // 检查 bucket 是否存在
    const { data: buckets, error: listError } =
      await supabase.storage.listBuckets();

    if (listError) {
      console.error('获取 bucket 列表失败:', listError);
      throw listError;
    }

    const bucketExists = buckets?.some(
      (bucket: any) => bucket.name === bucketName
    );

    if (!bucketExists) {
      console.log(`创建新的 bucket: ${bucketName}`);
      const { error: createError } = await supabase.storage.createBucket(
        bucketName,
        {
          public: true,
          allowedMimeTypes: [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/webp',
            'image/gif',
          ],
          fileSizeLimit: 10485760, // 10MB
        }
      );

      if (createError) {
        // 如果bucket已存在，这不是错误
        if (
          createError.message.includes('already exists') ||
          createError.message.includes('Duplicate')
        ) {
          console.log(`Bucket '${bucketName}' 已存在`);
          return true;
        }
        console.error('创建 bucket 失败:', createError);
        throw createError;
      }

      console.log(`✅ Bucket ${bucketName} 创建成功`);
    } else {
      console.log(`Bucket ${bucketName} 已存在`);
    }

    return true;
  } catch (error) {
    console.error('Bucket 操作失败:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('开始处理图片上传请求');
    const supabase = getSupabaseAdmin();

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: '没有找到文件' }, { status: 400 });
    }

    console.log('文件信息:', {
      name: file.name,
      type: file.type,
      size: file.size,
    });

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: '只支持图片文件' }, { status: 400 });
    }

    // 验证文件大小 (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: '文件大小不能超过10MB' },
        { status: 400 }
      );
    }

    // 使用与其他API一致的bucket名称
    const bucketName = 'images';

    // 确保bucket存在
    await ensureBucketExists(supabase, bucketName);

    // 生成唯一文件名
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop();
    const fileName = `rich-text-images/${timestamp}-${randomString}.${fileExtension}`;

    console.log('生成的文件名:', fileName);

    // 将文件转换为ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    // 上传到Supabase Storage
    const { error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error('Supabase upload error:', error);

      // 如果文件已存在，尝试使用upsert模式
      if (
        error.message.includes('already exists') ||
        error.message.includes('Duplicate')
      ) {
        console.log('文件已存在，尝试覆盖上传...');
        const { error: upsertError } = await supabase.storage
          .from(bucketName)
          .upload(fileName, buffer, {
            contentType: file.type,
            upsert: true,
          });

        if (upsertError) {
          console.error('覆盖上传失败:', upsertError);
          return NextResponse.json({ error: '文件上传失败' }, { status: 500 });
        }
      } else {
        return NextResponse.json({ error: '文件上传失败' }, { status: 500 });
      }
    }

    // 获取公共URL
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

    console.log('图片上传完成，公共 URL:', urlData.publicUrl);

    return NextResponse.json({
      url: urlData.publicUrl,
      fileName: fileName,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
