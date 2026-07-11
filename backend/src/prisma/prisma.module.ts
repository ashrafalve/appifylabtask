import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

/**
 * PrismaModule
 * Global module exposing PrismaService so it can be injected anywhere without
 * re-importing. Marked @Global to avoid repetitive imports across feature modules.
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
