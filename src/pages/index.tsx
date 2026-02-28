import Head from 'next/head';
import AppShell from '@/components/layout/AppShell';

export default function Home() {
  return (
    <>
      <Head>
        <title>Porsche Configurator</title>
        <meta name="description" content="Porsche multi-model digital configurator" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <AppShell />
    </>
  );
}
