import { useStanzaContext } from '@getstanza/react';
import type { NextPage } from 'next';
import Head from 'next/head';
import { Fragment } from 'react';

const Home: NextPage = () => {
  const stanzaContext = useStanzaContext('main');
  return (
    <Fragment>
      <Head>
        <title>Next Sample App</title>
        <meta
          name='description'
          content='Generated using starter.dev'
        />
        <link
          rel='icon'
          href='/favicon.ico'
        />
      </Head>
      <header className='w-3/5 my-5 mx-auto text-center'>
        <h1 className='bg-blue-600 text-white text-2xl font-semibold p-4 rounded'>
          Next Sample App
        </h1>
        <pre
          style={{
            textAlign: 'left',
          }}
        >
          {JSON.stringify(stanzaContext, undefined, 2)}
        </pre>
      </header>
    </Fragment>
  );
};

export default Home;
