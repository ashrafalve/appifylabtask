import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);

  constructor(private readonly config: ConfigService) {}

  buildImageUrl(relativePath: string | null | undefined): string | null {
    if (!relativePath) {
      return null;
    }
    return relativePath;
  }

  buildUrlFromPath(absolutePath: string | undefined | null): string | null {
    if (!absolutePath) {
      return null;
    }
    return absolutePath;
  }
}
