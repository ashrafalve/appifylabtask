import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private readonly client: SupabaseClient;
  private readonly bucket: string;
  private readonly logger = new Logger(SupabaseService.name);

  constructor(config: ConfigService) {
    const url = config.get<string>('SUPABASE_URL');
    const anonKey = config.get<string>('SUPABASE_ANON_KEY');
    const serviceRoleKey = config.get<string>('SUPABASE_SERVICE_ROLE_KEY');
    this.bucket = config.get<string>('SUPABASE_BUCKET') ?? 'images';

    if (!url) {
      throw new Error('Missing SUPABASE_URL environment variable');
    }

    const key = serviceRoleKey || anonKey;
    if (!key) {
      throw new Error(
        'Missing SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY environment variables',
      );
    }

    this.client = createClient(url, key);
  }

  async upload(file: Express.Multer.File): Promise<string> {
    const ext = file.originalname.split('.').pop() ?? 'bin';
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}-${crypto.randomUUID()}.${ext}`;
    const path = `${fileName}`;

    this.logger.log(
      `Uploading to Supabase bucket=${this.bucket} path=${path} size=${file.size}`,
    );

    const { error } = await this.client.storage
      .from(this.bucket)
      .upload(path, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      this.logger.error(`Supabase upload failed: ${error.message}`);
      throw new Error(`Failed to upload image: ${error.message}`);
    }

    const { data } = this.client.storage.from(this.bucket).getPublicUrl(path);
    const publicUrl = data.publicUrl;

    this.logger.log(`Supabase upload complete: ${publicUrl}`);
    return publicUrl;
  }

  async remove(pathOrUrl: string): Promise<void> {
    try {
      const url = new URL(pathOrUrl);
      const parts = url.pathname.split('/');
      const path = parts.slice(-2).join('/');

      const { error } = await this.client.storage.from(this.bucket).remove([path]);
      if (error) {
        this.logger.warn(`Supabase remove failed: ${error.message}`);
      }
    } catch {
      this.logger.warn(`Could not parse Supabase path for removal: ${pathOrUrl}`);
    }
  }
}
