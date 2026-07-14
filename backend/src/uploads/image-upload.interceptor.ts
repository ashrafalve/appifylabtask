import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import multer, { Options } from 'multer';
import { buildMulterOptions } from './multer.config';

@Injectable()
export class ImageUploadInterceptor implements NestInterceptor {
  private readonly options: Options;

  constructor(config: ConfigService) {
    this.options = buildMulterOptions(config, 'memory');
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const single = multer(this.options).single('image');
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();

    return new Observable<void>((subscriber) => {
      single(req, res, (err: unknown) => {
        if (err) {
          subscriber.error(err);
        } else {
          subscriber.next();
          subscriber.complete();
        }
      });
    }).pipe(mergeMap(() => next.handle()));
  }
}
