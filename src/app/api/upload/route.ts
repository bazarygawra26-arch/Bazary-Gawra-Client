import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../server/db/supabaseAdmin';
import { authorizeSellerRequest } from '../../../server/auth/authorization';

export const runtime = 'nodejs';

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const MAX_FILE_COUNT = 5;

function detectImageType(bytes: Buffer): { mimeType: string; extension: string } | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { mimeType: 'image/jpeg', extension: 'jpg' };
  }

  if (
    bytes.length >= 8 &&
    bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  ) {
    return { mimeType: 'image/png', extension: 'png' };
  }

  if (
    bytes.length >= 12 &&
    bytes.toString('ascii', 0, 4) === 'RIFF' &&
    bytes.toString('ascii', 8, 12) === 'WEBP'
  ) {
    return { mimeType: 'image/webp', extension: 'webp' };
  }

  return null;
}

export async function POST(req: NextRequest) {
  const authorization = await authorizeSellerRequest(req, undefined, { requireActive: true });
  if (!authorization.ok) {
    return NextResponse.json({ error: authorization.message }, { status: authorization.status });
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'Image storage is not configured.' }, { status: 503 });
  }

  try {
    const formData = await req.formData();
    const submittedFiles = [...formData.getAll('files'), formData.get('file')];
    const files = submittedFiles.filter((entry): entry is File => entry instanceof File);

    if (files.length === 0) {
      return NextResponse.json({ error: 'No image files were provided.' }, { status: 400 });
    }

    if (files.length > MAX_FILE_COUNT) {
      return NextResponse.json(
        { error: `A maximum of ${MAX_FILE_COUNT} images can be uploaded at once.` },
        { status: 400 }
      );
    }

    const validatedFiles: Array<{
      buffer: Buffer;
      mimeType: string;
      extension: string;
    }> = [];
    for (const file of files) {
      if (file.size === 0 || file.size > MAX_FILE_BYTES) {
        return NextResponse.json(
          { error: 'Each image must be between 1 byte and 5 MB.' },
          { status: 413 }
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const imageType = detectImageType(buffer);
      if (!imageType) {
        return NextResponse.json(
          { error: 'Only valid JPEG, PNG, and WebP images are supported.' },
          { status: 415 }
        );
      }

      validatedFiles.push({ buffer, ...imageType });
    }

    const uploadedPaths: string[] = [];
    const urls: string[] = [];

    for (const file of validatedFiles) {
      const storagePath = `${authorization.sellerId}/${crypto.randomUUID()}.${file.extension}`;
      const { data, error } = await supabaseAdmin.storage
        .from('product-images')
        .upload(storagePath, file.buffer, {
          contentType: file.mimeType,
          upsert: false,
        });

      if (error || !data) {
        console.error('Supabase product image upload failed:', error);
        if (uploadedPaths.length > 0) {
          const { error: cleanupError } = await supabaseAdmin.storage
            .from('product-images')
            .remove(uploadedPaths);
          if (cleanupError) {
            console.error('Failed to clean up partial image upload:', cleanupError);
          }
        }
        return NextResponse.json({ error: 'Image upload failed.' }, { status: 502 });
      }

      uploadedPaths.push(data.path);
      const { data: publicUrl } = supabaseAdmin.storage
        .from('product-images')
        .getPublicUrl(data.path);
      urls.push(publicUrl.publicUrl);
    }

    return NextResponse.json({ url: urls[0], urls, count: urls.length });
  } catch (error) {
    console.error('API /api/upload error:', error);
    return NextResponse.json({ error: 'Unable to process the image upload.' }, { status: 500 });
  }
}
