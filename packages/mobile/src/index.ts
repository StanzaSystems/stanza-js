import {
  Stanza,
  StanzaChangeTarget,
  type StanzaCoreConfig,
  utils,
} from '@getstanza/core';
import { createContext, type StanzaContext } from './context';
import { createAsyncLocalStorageStateProvider } from './providers/asyncStorage/asyncStorageProvider';
export * from './feature';

export type { StanzaContext };

const { getConfig, getEnablementNumber, getEnablementNumberStale } =
  utils.globals;

const contextChanges = new StanzaChangeTarget<StanzaContext>();

export const init = async (initialConfig: StanzaCoreConfig): Promise<void> => {
  await Stanza.initMobile(
    initialConfig,
    createAsyncLocalStorageStateProvider()
  );

  const featureToContextMap = initialConfig.contextConfigs.reduce<
    Record<string, string[]>
  >((result, contextConfig) => {
    contextConfig.features.forEach((feature) => {
      result[feature] = result[feature] ?? [];
      result[feature].push(contextConfig.name);
    });
    return result;
  }, {});

  Stanza.featureChanges.addChangeListener((featureState) => {
    featureToContextMap[featureState.featureName].map(async (contextName) => {
      contextChanges.dispatchChange(await getContextStale(contextName));
    });
  });

  Stanza.enablementNumberChanges.addChangeListener(async () => {
    const contextNames = new Set(Object.values(featureToContextMap).flat());
    for (const contextName of contextNames) {
      contextChanges.dispatchChange(await getContextStale(contextName));
    }
  });
};

export async function getContextHot(name: string): Promise<StanzaContext> {
  const features = getContextFeatures(name);
  const newFeatures = await Stanza.getFeatureStatesHotAsync(features);
  const enablementNumber = await getEnablementNumber();
  return createContext(name, newFeatures, enablementNumber, true);
}

export async function getContextStale(name: string): Promise<StanzaContext> {
  const features = getContextFeatures(name);
  const featureStates = await Stanza.getFeatureStatesStaleAsync(features);
  const enablementNumber = getEnablementNumberStale();
  return createContext(name, featureStates, enablementNumber, true);
}

export async function getContext(name: string): Promise<StanzaContext> {
  const features = getContextFeatures(name);
  const featureStates = await Stanza.getFeatureStates(features);
  const enablementNumber = await getEnablementNumber();
  return createContext(name, featureStates, enablementNumber, true);
}

function getContextFeatures(name: string): string[] {
  const contextConfig = getConfig().contextConfigs[name];
  if (contextConfig === undefined) {
    throw new Error(`Configuration for context ${name} is not found.`);
  }
  return contextConfig.features;
}

export const StanzaMobile = {
  init,
  getContextHot,
  getContextStale,
  getContext,
  featureChanges: Stanza.featureChanges,
  contextChanges,
};
export default StanzaMobile;
export type { StanzaCoreConfig };
