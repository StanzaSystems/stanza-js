// Create a test for the Main screen
// Path: samples/react-native-simple/src/app/screens/Main.test.ts

import React from 'react';
import { render } from '@testing-library/react-native';
import Main from './screens/Main';

describe('Main', () => {
  // should get an error if we try to render Main without a StanzaProvider
  it('should throw an error if rendered without a StanzaProvider', () => {
    expect(() => render(<Main />)).toThrow();
  });
});
