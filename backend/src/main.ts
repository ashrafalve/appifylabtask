import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

/**
 * Application bootstrap.
 *
 * Security & quality middleware wired here (global, applies to every route):
 *  - helmet          : secure HTTP headers
 *  - cors            : configurable cross-origin policy (CORS_ORIGIN)
 *  - compression     : gzip response bodies
 *  - ValidationPipe  : DTO validation + stripping of unknown props (whitelist)
 *  - TransformInterceptor : wraps every response in the standard envelope
 *  - GlobalExceptionFilter : normalizes every error into the same envelope
 *
 * Uploads are served as static assets under /<UPLOAD_DEST>.
 */
async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const config = app.get(ConfigService);
  const apiPrefix = config.get<string>('API_PREFIX') ?? 'api';
  const port = config.get<number>('PORT') ?? 3000;
  const corsOrigin = config
    .get<string>('CORS_ORIGIN')
    ?.split(',')
    .map((o) => o.trim());

  app.setGlobalPrefix(apiPrefix);
  app.use(helmet());
  app.enableCors({
    origin: corsOrigin?.includes('*') ? true : corsOrigin,
    credentials: true,
  });
  app.use(compression());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new GlobalExceptionFilter());

  const uploadDest = config.get<string>('UPLOAD_DEST') ?? 'uploads';
  const uploadPath = join(process.cwd(), uploadDest);
  logger.log(`Uploads directory: ${uploadPath}`);
  logger.log(`Serving static uploads at: /${uploadDest}`);
  app.useStaticAssets(uploadPath, {
    prefix: `/${uploadDest}`,
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('AppifyLab Social API')
    .setDescription('Backend API for the AppifyLab social platform')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(`${apiPrefix}/docs`, app, document);

  await app.listen(port);
  logger.log(`🚀 API listening on http://localhost:${port}/${apiPrefix}`);
}

bootstrap();
