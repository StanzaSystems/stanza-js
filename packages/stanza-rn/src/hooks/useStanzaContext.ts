import { getContextStale, type StanzaContext } from '@getstanza/mobile';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { StanzaReactContext } from '../context/StanzaContext';
import { StanzaContextName } from '../context/StanzaContextName';
import throttling from 'lodash/throttle';

export const useStanzaContext = (
  contextName?: string
): StanzaContext | undefined => {
  const providedContextName = useContext(StanzaContextName);
  const [state, setState] = useState<StanzaContext | undefined>();
  const stanzaInstance = useContext(StanzaReactContext);

  if (stanzaInstance === undefined) {
    throw Error('Component needs to be wrapped with StanzaProvider');
  }

  const contextChanges = stanzaInstance.contextChanges;

  const resultContextName = contextName ?? providedContextName;

  if (resultContextName === undefined) {
    throw Error(
      'Component needs to be wrapped with WithStanzaContextName to use useStanzaContext without a contextName parameter'
    );
  }

  const updateContext = useCallback(async () => {
    setState(await getContextStale(resultContextName));
  }, [resultContextName]);

  useEffect(() => {
    void (state?.name !== resultContextName && updateContext());
  }, [state, resultContextName, updateContext]);

  const processChanges = useMemo(
    () =>
      throttling((context: StanzaContext) => {
        if (context.name === resultContextName) {
          setState(context);
        }
      }, 3000),
    [resultContextName]
  );

  useEffect(() => {
    contextChanges.addChangeListener(processChanges);

    return () => {
      contextChanges.removeChangeListener(processChanges);
    };
  }, [contextChanges, resultContextName, processChanges]);

  return state;
};
