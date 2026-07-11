import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Global exception filter. Catches every error thrown in the request pipeline
 * and normalizes it into the same envelope used by successful responses so the
 * client never has to special-case the body shape.
 *
 *  - HttpException  -> use its status + message(s)
 *  - Anything else  -> 500 with a safe generic message (details logged server-side)
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = this.resolveMessage(exception);

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `${request.method} ${request.url} -> ${status}: ${message}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      message,
      data: null,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  private resolveMessage(exception: unknown): string | string[] {
    if (exception instanceof HttpException) {
      const res = exception.getResponse();
      if (typeof res === 'string') {
        return res;
      }
      if (typeof res === 'object' && res !== null) {
        const msg = (res as Record<string, unknown>).message;
        if (Array.isArray(msg)) {
          return msg as string[];
        }
        if (typeof msg === 'string') {
          return msg;
        }
      }
      return exception.message;
    }
    return 'Internal server error';
  }
}
