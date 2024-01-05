import {
  type StanzaDatadogKey,
  type StanzaJaegerKey,
  type StanzaKey,
} from './model';

export const getStanzaBaggageKeys = (key: StanzaKey) => {
  const jaggerKey: StanzaJaegerKey = `uberctx-${key}`;
  const datadogKey: StanzaDatadogKey = `ot-baggage-${key}`;

  return [key, jaggerKey, datadogKey];
};
