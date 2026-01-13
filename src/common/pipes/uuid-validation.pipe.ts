import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { isUUID } from 'class-validator';

@Injectable()
export class UUIDValidationPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    if (!isUUID(value)) {
      throw new BadRequestException(
        `Invalid UUID format: ${value}. Expected a valid UUID v4.`,
      );
    }
    return value;
  }
}
