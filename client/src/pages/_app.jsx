import React, { useEffect } from 'react';
import '../styles/globals.css';
import Head from 'next/head';
import { useAuthStore } from '../store/authStore';

export default function App({ Component, pageProps }) {
  const initAuth = useAuthStore((state) => state.initAuth);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <>
      <Head>
        <title>Agentra // Autonomous Agentic AI Operations Platform</title>
        <meta name="description" content="Agentra: Next-generation autonomous operations platform. Real-time visual DAG execution, cooperating AI swarms, and self-healing workflow infrastructure." />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
