import { stanzaInitOptions, type StanzaInitOptions } from './stanzaInitOptions';
import { z } from 'zod';
import type pino from 'pino';

export type CoerceFn<K extends keyof StanzaInitOptions> = (
  strValue: string | undefined,
) => StanzaInitOptions[K] | undefined;

export const coerceStringToInteger = (
  v: string | undefined,
): number | undefined => {
  const zNonEmptyString = z.string().nonempty();
  const zCoercedInteger = z.coerce.number().int();
  const parsedIntegerResult = zNonEmptyString
    .pipe(zCoercedInteger)
    .safeParse(v);
  return parsedIntegerResult.success ? parsedIntegerResult.data : undefined;
};

export const coerceStringToBoolean = (
  v: string | undefined,
): boolean | undefined => {
  const zBooleanString = z.union([z.literal('true'), z.literal('false')]);
  const zCoercedBoolean = zBooleanString.transform((value) => value === 'true');
  const parsedResult = zCoercedBoolean.safeParse(v);
  return parsedResult.success ? parsedResult.data : undefined;
};

export const coerceStringToLogLevel = (
  v: string | undefined,
): pino.Level | undefined => {
  const zLogLevel = stanzaInitOptions.shape.logLevel;
  const parsedResult = zLogLevel.safeParse(v);
  return parsedResult.success ? parsedResult.data : undefined;
};
