import * as React from 'react';

import { StanzaProvider } from '@getstanza/react-native';
import { config } from './stanzaConfig';
import Main from './screens/Main';

export default function App() {
  return (
    <StanzaProvider config={config}>
      <Main />
    </StanzaProvider>
  );
}
