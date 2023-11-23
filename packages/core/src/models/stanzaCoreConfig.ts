export interface StanzaCoreConfig {
  environment: string;
  stanzaApiKey: string;
  url: string;
  isReactNative?: boolean;
  refreshSeconds?: number;
  enablementNumberGenerator?: () => Promise<number>;
  pollDelay?: Promise<void>;
  contextConfigs: ContextConfig[];
}

interface ContextConfig {
  name: string;
  features: string[];
}
