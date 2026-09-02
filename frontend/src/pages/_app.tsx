import type { AppProps } from 'next/app';
import '@/styles/globals.css';
import AppLayout from '@/components/layout/AppLayout';
import { useEffect } from 'react';

function reportError(payload: Record<string, unknown>) {
  const url = process.env.NEXT_PUBLIC_RUNTIME_ERROR_REPORT_URL;
  if (!url) return;
  const appId = process.env.NEXT_PUBLIC_APP_ID || (() => {
    try {
      const m = window.location.hostname.match(/^preview-([^.]+)/);
      return m ? m[1] : undefined;
    } catch { return undefined; }
  })();
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ app_id: appId, ...payload }),
  }).catch(() => {});
}

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    window.onerror = (message, source, lineno, colno, error) => {
      reportError({ message: String(message), stack: error?.stack, url: source, user_agent: navigator.userAgent });
    };
    window.onunhandledrejection = (event) => {
      reportError({ message: String(event.reason), stack: event.reason?.stack, url: window.location.href, user_agent: navigator.userAgent });
    };
    const orig = console.error;
    console.error = (...args: any[]) => {
      reportError({ message: args.map(String).join(' '), url: window.location.href, user_agent: navigator.userAgent });
      orig.apply(console, args);
    };
    return () => { console.error = orig; };
  }, []);

  return (
    <AppLayout>
      <Component {...pageProps} />
    </AppLayout>
  );
}