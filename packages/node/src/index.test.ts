import { init, initOrThrow } from './index';
import {
  init as initBase,
  initOrThrow as initOrThrowBase,
} from '@getstanza/sdk-base';

describe('index', () => {
  it('should export separate init function than @getstanza/sdk-base', () => {
    expect(init).not.toBe(initBase);
  });

  it('should export separate initOrThrow function than @getstanza/sdk-base', () => {
    expect(initOrThrow).not.toBe(initOrThrowBase);
  });
});
