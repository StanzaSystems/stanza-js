import { createGlobal } from './createGlobal';

type ChangeListener<T> = (newValue: T) => void;
type AddChangeListener<T> = (listener: ChangeListener<T>) => () => void;
type UpdateGlobal<T> = (newValue: T) => T;

interface GlobalState<T> {
  currentValue: T;
  onChange: AddChangeListener<T>;
  update: UpdateGlobal<T>;
}

const globalStatesRecord = createGlobal(
  Symbol.for('[Stanza SDK Internal] Global states'),
  (): Record<
    string | symbol,
    {
      changeListeners: Array<ChangeListener<any>>;
      state: GlobalState<any>;
    }
  > => ({})
);

export const createGlobalState = <S extends string | symbol, T>(
  s: S,
  createFn: () => T
): GlobalState<T> => {
  // TODO remove duplication
  type WithGlobalT = Record<S, T | undefined>;
  const typedGlobalThis = globalThis as WithGlobalT;

  const currentValue = createGlobal(s, createFn);

  const { changeListeners, state } = (globalStatesRecord[s] =
    globalStatesRecord[s] ?? {
      changeListeners: Array<ChangeListener<T>>(),
      state: {
        currentValue,
        onChange: (listener) => {
          changeListeners.push(listener);

          return () => {
            const listenerIndex = changeListeners.indexOf(listener);
            if (listenerIndex < 0) {
              return;
            }
            changeListeners.splice(listenerIndex, 1);
          };
        },
        update: (newValue) => {
          typedGlobalThis[s] = state.currentValue = newValue;

          changeListeners.forEach((listener) => {
            listener(newValue);
          });

          return newValue;
        },
      } satisfies GlobalState<T>,
    });

  return state;
};
