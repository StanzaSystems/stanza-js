import { WithStanzaContextName } from '@getstanza/react';
import WithStanza from '../components/WithStanza';

import '../styles.css';
import { getContextHot, StanzaBrowser } from '@getstanza/browser';
import { browserConfig } from '../stanzaConfig';
import { Boo } from './boo';

StanzaBrowser.init(browserConfig);

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const stanzaMainContext = await getContextHot('main');

  // await 0;
  //
  console.log(stanzaMainContext.features);
  // const initVal = Math.random();

  return (
    <html lang='en'>
      <body>
        <WithStanza
          initialFeatureStates={Object.values(stanzaMainContext.features).map(
            (f) => ({
              ...f,
              featureName: f.name,
              enabledPercent: f.disabled ? 0 : 100,
              messageDisabled: f.disabled ? f.message : undefined,
              messageEnabled: f.disabled ? undefined : f.message,
            })
          )}
        >
          <WithStanzaContextName name='main'>
            <Boo />
          </WithStanzaContextName>
          {/* <Suspense */}
          {/*  fallback={ */}
          {/*    <div> */}
          {/*      hello */}
          {/*      <OtherOnClient initialVal={initVal} /> */}
          {/*    </div> */}
          {/*  } */}
          {/* > */}
          {/*  /!* <WithStanza *!/ */}
          {/*  /!*  initialFeatureStates={Object.values(stanzaMainContext.features).map( *!/ */}
          {/*  /!*    (f) => ({ *!/ */}
          {/*  /!*      ...f, *!/ */}
          {/*  /!*      featureName: f.name, *!/ */}
          {/*  /!*      enabledPercent: f.disabled ? 0 : 100, *!/ */}
          {/*  /!*      messageDisabled: f.disabled ? f.message : undefined, *!/ */}
          {/*  /!*      messageEnabled: f.disabled ? undefined : f.message, *!/ */}
          {/*  /!*    }) *!/ */}
          {/*  /!*  )} *!/ */}
          {/*  /!* > *!/ */}
          {/*  /!*  <WithStanzaContextName name='main'> *!/ */}
          {/*  /!*    <StripeCartProvider> *!/ */}
          {/*  /!*      <Layout title='Stanza Toy Store'> *!/ */}
          {/*  /!*        <div className='page-container'>{children}</div> *!/ */}
          {/*  /!*      </Layout> *!/ */}
          {/*  /!*    </StripeCartProvider> *!/ */}
          {/*  /!*  </WithStanzaContextName> *!/ */}
          {/*  /!* </WithStanza> *!/ */}
          {/*  <Other initVal={initVal} /> */}
          {/* </Suspense> */}
        </WithStanza>
      </body>
    </html>
  );
}
