import { ROOT_CONTEXT } from '@opentelemetry/api';
import { describe, expect, it } from 'vitest';
import { addPriorityBoostToContext } from './addPriorityBoostToContext';
import { stanzaPriorityBoostContextKey } from './stanzaPriorityBoostContextKey';

describe('addPriorityBoostToContext', function () {
  it("should set priority boost if it didn't exist already", function () {
    expect(
      addPriorityBoostToContext(1)(ROOT_CONTEXT).getValue(
        stanzaPriorityBoostContextKey,
      ),
    ).toEqual(1);
  });

  it("should set negative priority boost if it didn't exist already", function () {
    expect(
      addPriorityBoostToContext(-1)(ROOT_CONTEXT).getValue(
        stanzaPriorityBoostContextKey,
      ),
    ).toEqual(-1);
  });

  it('should not set a boost value of 0', function () {
    expect(
      addPriorityBoostToContext(0)(ROOT_CONTEXT).getValue(
        stanzaPriorityBoostContextKey,
      ),
    ).toBeUndefined();
  });

  it('should add priority boost if it exists already', function () {
    const existingContext = ROOT_CONTEXT.setValue(
      stanzaPriorityBoostContextKey,
      2,
    );
    expect(
      addPriorityBoostToContext(1)(existingContext).getValue(
        stanzaPriorityBoostContextKey,
      ),
    ).toEqual(3);
  });

  it('should add negative priority boost if it exists already', function () {
    const existingContext = ROOT_CONTEXT.setValue(
      stanzaPriorityBoostContextKey,
      2,
    );
    expect(
      addPriorityBoostToContext(1)(existingContext).getValue(
        stanzaPriorityBoostContextKey,
      ),
    ).toEqual(3);
  });

  it('should remove priority boost if it cancels out the existing boost value', function () {
    const existingContext = ROOT_CONTEXT.setValue(
      stanzaPriorityBoostContextKey,
      2,
    );
    expect(
      addPriorityBoostToContext(-2)(existingContext).getValue(
        stanzaPriorityBoostContextKey,
      ),
    ).toBeUndefined();
  });
});
