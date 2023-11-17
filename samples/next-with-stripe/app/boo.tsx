'use client';

import { WithStanzaFeature } from '@getstanza/react';

export const Boo = () => {
  return (
    <WithStanzaFeature name='search'>
      {({ disabled }) => <div>Disabled: {JSON.stringify(disabled)}</div>}
    </WithStanzaFeature>
  );
};
