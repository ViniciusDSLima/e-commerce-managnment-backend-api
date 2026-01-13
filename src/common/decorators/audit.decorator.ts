import { SetMetadata } from '@nestjs/common';

export const AUDIT_METADATA_KEY = 'audit';

export const Audit = (action: string) =>
  SetMetadata(AUDIT_METADATA_KEY, action);
