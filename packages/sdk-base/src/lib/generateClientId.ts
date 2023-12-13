import * as crypto from 'node:crypto';

export const generateClientId = (): string => {
  try {
    return crypto.randomUUID();
  } catch {
    return '';
  }
};
