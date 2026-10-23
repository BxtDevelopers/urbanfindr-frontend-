'use client';
export default function Error({reset}){return <main className="wrap py-24"><h1>Something went wrong</h1><p className="my-6">Please try again. Your saved information remains in the database.</p><button className="btn" onClick={reset}>Try again</button></main>;}
