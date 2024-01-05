import { getGuardConfig } from '../../global/guardConfig';
import { context } from '@opentelemetry/api';
import { stanzaTokenContextKey } from '../../context/stanzaTokenContextKey';
import { TimeoutError, withTimeout } from '@getstanza/sdk-utils';
import { hubService } from '../../global/hubService';
import { logger } from '../../global/logger';
import { STANZA_REQUEST_TIMEOUT } from '../../global/requestTimeout';
import { type ReasonData, type TokenReason } from '../../global/eventBus';
import { type CheckerResponse } from './types';

export interface IngressTokenValidatorOptions {
  guard: string;
}

type TokenValidateResponse = CheckerResponse<
  'TOKEN_VALIDATE',
  unknown,
  { message: string }
> & {
  reason: Pick<ReasonData, 'tokenReason'>;
};
export const initIngressTokenValidator = (
  options: IngressTokenValidatorOptions
) => {
  return { shouldValidateIngressToken, validateIngressToken };

  function shouldValidateIngressToken(): boolean {
    const guardConfig = getGuardConfig(options.guard);
    return guardConfig?.config?.validateIngressTokens === true;
  }

  async function validateIngressToken(): Promise<TokenValidateResponse> {
    const token = context.active().getValue(stanzaTokenContextKey);

    if (typeof token !== 'string' || token === '') {
      return validateFailure(
        'TOKEN_NOT_VALID',
        'Valid Stanza token was not provided in the incoming header'
      );
    }

    try {
      const validatedToken = await withTimeout(
        STANZA_REQUEST_TIMEOUT,
        'Validate token timed out',
        hubService.validateToken({
          guard: options.guard,
          token,
        })
      );
      if (validatedToken === null) {
        return validateFailOpen('TOKEN_VALIDATION_ERROR');
      }

      if (!validatedToken.valid || validatedToken.token !== token) {
        return validateFailure('TOKEN_NOT_VALID', 'Provided token was invalid');
      }

      return validateSuccess('TOKEN_VALID');
    } catch (e) {
      logger.warn(
        'Failed to validate the token: %o',
        e instanceof Error ? e.message : e
      );
      if (e instanceof TimeoutError) {
        return validateFailOpen('TOKEN_VALIDATION_TIMEOUT');
      }
      throw e;
    }
  }
};

function validateFailure(
  tokenReason: TokenReason,
  message: string
): TokenValidateResponse {
  return {
    type: 'TOKEN_VALIDATE',
    status: 'failure',
    reason: {
      tokenReason,
    },
    message,
  };
}

function validateSuccess(tokenReason: TokenReason): TokenValidateResponse {
  return {
    type: 'TOKEN_VALIDATE',
    status: 'success',
    reason: {
      tokenReason,
    },
  };
}

function validateFailOpen(tokenReason: TokenReason): TokenValidateResponse {
  return {
    type: 'TOKEN_VALIDATE',
    status: 'failOpen',
    reason: {
      tokenReason,
    },
  };
}
