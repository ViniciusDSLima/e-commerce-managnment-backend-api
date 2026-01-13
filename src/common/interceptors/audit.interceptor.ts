import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { AUDIT_METADATA_KEY } from '../decorators/audit.decorator';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user?.username || 'system';
    const action = this.reflector.get<string>(
      AUDIT_METADATA_KEY,
      context.getHandler(),
    );

    request.audit = {
      user,
      action,
      timestamp: new Date(),
    };

    return next.handle();
  }
}
