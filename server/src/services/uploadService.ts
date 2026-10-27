import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { v2 as cloudinary } from 'cloudinary';
import type { ListingPhoto } from '@urban-nest/shared';
import { env } from '../config/env.js';
import { AppError } from '../utils/errors.js';

const ALLOWED_MIME_TYPES: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/avif': '.avif',
  'image/gif': '.gif',
};

const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024; // 8 MB per image

export const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');

export interface UploadedFileInput {
  fileName: string;
  mimeType: string;
  dataUrl: string;
  caption?: string;
}

export async function processAndStorePhotos(
  ownerId: string,
  files: UploadedFileInput[]
): Promise<ListingPhoto[]> {
  if (!Array.isArray(files) || files.length === 0) {
    throw new AppError('No image files provided for upload.', 400, 'NO_FILES');
  }

  if (files.length > 10) {
    throw new AppError('You can upload at most 10 photos at a time.', 400, 'TOO_MANY_FILES');
  }

  const useCloudinary = Boolean(
    env.CLOUDINARY_CLOUD_NAME &&
      env.CLOUDINARY_API_KEY &&
      env.CLOUDINARY_API_SECRET
  );

  if (useCloudinary) {
    cloudinary.config({
      cloud_name: env.CLOUDINARY_CLOUD_NAME,
      api_key: env.CLOUDINARY_API_KEY,
      api_secret: env.CLOUDINARY_API_SECRET,
    });
  } else {
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
  }

  const uploadedPhotos: ListingPhoto[] = [];

  for (const file of files) {
    const mime = (file.mimeType || '').toLowerCase();
    const ext = ALLOWED_MIME_TYPES[mime];
    if (!ext) {
      throw new AppError(
        `Unsupported image format "${file.mimeType}". Allowed: JPG, PNG, WEBP, AVIF, GIF.`,
        400,
        'INVALID_FILE_TYPE'
      );
    }

    const base64Match = file.dataUrl.match(/^data:image\/[a-zA-Z0-9.+-]+;base64,(.+)$/);
    const base64Payload = base64Match ? base64Match[1] : file.dataUrl;
    const buffer = Buffer.from(base64Payload, 'base64');

    if (buffer.byteLength === 0) {
      throw new AppError('Uploaded image file is empty.', 400, 'EMPTY_FILE');
    }

    if (buffer.byteLength > MAX_FILE_SIZE_BYTES) {
      throw new AppError(
        `File "${file.fileName}" exceeds the 8 MB maximum size limit.`,
        400,
        'FILE_TOO_LARGE'
      );
    }

    if (useCloudinary) {
      const folder = `${env.CLOUDINARY_FOLDER}/owners/${ownerId}`;
      const uploadResult = await cloudinary.uploader.upload(file.dataUrl, {
        folder,
        resource_type: 'image',
      });
      uploadedPhotos.push({
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        caption: file.caption?.trim() || undefined,
      });
    } else {
      const safeStem = (file.fileName || 'photo')
        .replace(/\.[^/.]+$/, '')
        .toLowerCase()
        .replace(/[^a-z0-9-_]/g, '-')
        .slice(0, 40);
      const uniqueId = crypto.randomBytes(6).toString('hex');
      const storedFileName = `${Date.now()}-${uniqueId}-${safeStem}${ext}`;
      const fullPath = path.join(UPLOADS_DIR, storedFileName);

      await fs.writeFile(fullPath, buffer);

      uploadedPhotos.push({
        url: `/uploads/${storedFileName}`,
        publicId: storedFileName,
        caption: file.caption?.trim() || undefined,
      });
    }
  }

  return uploadedPhotos;
}
