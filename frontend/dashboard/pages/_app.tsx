import '../styles/globals.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isAuth = localStorage.getItem('phasor_auth') === 'true';
      if (!isAuth && router.pathname !== '/login') {
        router.replace('/login');
      } else {
        setAuthChecked(true);
      }
    }
  }, [router.pathname]);

  return (
    <>
      <Head>
        <title>Phasor — Space Weather Grid Defense System</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      {/* If checking auth on a protected route, render a clean dark backdrop while redirecting */}
      {router.pathname === '/login' || authChecked ? (
        <Component {...pageProps} />
      ) : (
        <div style={{ width: '100vw', height: '100vh', backgroundColor: '#060102' }} />
      )}
    </>
  );
}
