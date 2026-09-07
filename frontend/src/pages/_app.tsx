import type { AppProps } from 'next/app';
import '@/styles/globals.css';
import AppLayout from '@/components/layout/AppLayout';

// Runtime error reporter
if (typeof window !== 'undefined') {
  const appId = process.env.NEXT_PUBLIC_APP_ID || (() => {
    const m = window.location.hostname.match(/^preview-([^.]+)/);
    return m ? m[1] : 'unknown';
  })();
  const reportUrl = process.env.NEXT_PUBLIC_RUNTIME_ERROR_REPORT_URL;

  const sendError = (message: string, stack?: string) => {
    if (!reportUrl) return;
    fetch(reportUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ app_id: appId, message, stack, url: window.location.href, user_agent: navigator.userAgent }),
    }).catch(() => {});
  };

  window.onerror = (msg, _src, _line, _col, err) => { sendError(String(msg), err?.stack); };
  window.onunhandledrejection = (e) => { sendError(String(e.reason), e.reason?.stack); };
  const origError = console.error;
  console.error = (...args: any[]) => { sendError(args.map(String).join(' ')); origError.apply(console, args); };
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AppLayout>
      <Component {...pageProps} />
    </AppLayout>
  );
}