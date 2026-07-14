import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Options, diskStorage, memoryStorage } from 'multer';
import { extname } from 'path';
import { mkdirSync } from 'fs';

export type StorageMode = 'disk' | 'memory';

export function buildMulterOptions(
  config: ConfigService,
  mode: StorageMode = 'disk',
): Options {
  const maxSize = config.get<number>('UPLOAD_MAX_FILE_SIZE') ?? 5 * 1024 * 1024;
  const allowed = new Set(
    (config.get<string>('UPLOAD_ALLOWED_MIME_TYPES') ?? '')
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean),
  );

  const storage =
    mode === 'memory'
      ? memoryStorage()
      : diskStorage({
          destination: (req, file, cb) => {
            const dest = config.get<string>('UPLOAD_DEST') ?? 'uploads';
            const now = new Date();
            const folder = `${dest}/${now.getUTCFullYear()}/${String(
              now.getUTCMonth() + 1,
            ).padStart(2, '0')}`;
            mkdirSync(folder, { recursive: true });
            cb(null, folder);
          },
          filename: (req, file, cb) => {
            const unique = `${Date.now()}-${Math.random()
              .toString(36)
              .slice(2, 10)}-${crypto.randomUUID()}`;
            cb(null, `${unique}${extname(file.originalname).toLowerCase()}`);
          },
        });

  return {
    storage,
    limits: {
      fileSize: maxSize,
      files: 1,
    },
    fileFilter: (req, file, cb: (error: Error | null, acceptFile?: boolean) => void) => {
      if (!allowed.has(file.mimetype.toLowerCase())) {
        return cb(
          new BadRequestException(
            `Unsupported file type. Allowed: ${[...allowed].join(', ')}`,
          ),
          false,
        );
      }
      cb(null, true);
    },
  };
}
