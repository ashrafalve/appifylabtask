import { Global, Module } from '@nestjs/common';
import { UploadsService } from './uploads.service';
import { ImageUploadInterceptor } from './image-upload.interceptor';
import { SupabaseService } from './supabase.service';

/**
 * UploadsModule exposes UploadsService (URL building) and ImageUploadInterceptor
 * (DI-based Multer handling) app-wide.
 */
@Global()
@Module({
  providers: [UploadsService, ImageUploadInterceptor, SupabaseService],
  exports: [UploadsService, ImageUploadInterceptor, SupabaseService],
})
export class UploadsModule {}
