import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../server/db/supabaseAdmin';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];
    const singleFile = formData.get('file') as File | null;

    const fileList: File[] = [];
    if (singleFile) fileList.push(singleFile);
    if (files && files.length > 0) {
      for (const f of files) {
        if (f && !fileList.some((existing) => existing.name === f.name && existing.size === f.size)) {
          fileList.push(f);
        }
      }
    }

    if (fileList.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    const uploadedUrls: string[] = [];

    // Ensure local uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'products');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    for (const file of fileList) {
      if (!file.type.startsWith('image/')) {
        continue;
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const ext = path.extname(file.name) || '.jpg';
      const cleanBase = path
        .basename(file.name, ext)
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .slice(0, 30);
      const uniqueFilename = `${Date.now()}_${cleanBase}${ext}`;

      let fileUrl = '';

      // 1. Attempt Supabase Storage upload if available
      if (supabaseAdmin) {
        try {
          const { data: uploadData, error: storageError } = await supabaseAdmin.storage
            .from('product-images')
            .upload(uniqueFilename, buffer, {
              contentType: file.type,
              upsert: true,
            });

          if (!storageError && uploadData) {
            const { data: publicUrlData } = supabaseAdmin.storage
              .from('product-images')
              .getPublicUrl(uploadData.path);
            if (publicUrlData?.publicUrl) {
              fileUrl = publicUrlData.publicUrl;
            }
          }
        } catch (storageErr) {
          // Fallback to local storage if bucket doesn't exist yet
        }
      }

      // 2. Reliable local fallback: save to public/uploads/products/
      if (!fileUrl) {
        const filePath = path.join(uploadsDir, uniqueFilename);
        fs.writeFileSync(filePath, buffer);
        fileUrl = `/uploads/products/${uniqueFilename}`;
      }

      uploadedUrls.push(fileUrl);
    }

    if (uploadedUrls.length === 0) {
      return NextResponse.json({ error: 'Failed to upload image(s)' }, { status: 500 });
    }

    return NextResponse.json({
      url: uploadedUrls[0],
      urls: uploadedUrls,
      count: uploadedUrls.length,
    });
  } catch (error: any) {
    console.error('API /api/upload error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to upload file' }, { status: 500 });
  }
}
