'use client';
import { useEffect } from 'react';

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error('App Error caught by boundary:', error);
  }, [error]);

  return (
    <main className="wrap py-24">
      <h1 className="text-3xl font-bold text-stone-900 mb-2">Something went wrong</h1>
      <p className="my-4 text-stone-600">Please try again. Your saved information remains in the database.</p>
      {error && (
        <details className="my-6 p-4 bg-stone-100 rounded text-xs text-red-600 font-mono overflow-auto max-h-64 whitespace-pre-wrap border border-stone-200">
          <summary className="cursor-pointer font-sans font-semibold mb-2 text-stone-700">Diagnostic details</summary>
          {error.message || String(error)}
          {error.digest ? `\nDigest: ${error.digest}` : ''}
          {error.stack ? `\n\n${error.stack}` : ''}
        </details>
      )}
      <button className="btn" onClick={reset}>Try again</button>
    </main>
  );
}
