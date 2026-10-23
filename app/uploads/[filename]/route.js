import { readFile } from 'node:fs/promises';
import path from 'node:path';

export const runtime = 'nodejs';

export async function GET(request, context) {
  const { filename } = await context.params;
  if (!/^[a-f0-9-]+\.(jpg|jpeg|png|webp)$/.test(filename)) {
    return new Response('Not found', { status: 404 });
  }

  // 1. Try reading from local storage first
  try {
    const bytes = await readFile(path.join(process.cwd(), 'storage', 'uploads', filename));
    const ext = filename.split('.').pop();
    const contentType = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' }[ext] || 'image/jpeg';
    return new Response(bytes, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Content-Type-Options': 'nosniff'
      }
    });
  } catch {
    // 2. Fall back to Express backend storage if enabled
    const useExpress = process.env.USE_EXPRESS_BACKEND !== 'false';
    const expressUrl = process.env.EXPRESS_BACKEND_URL || 'http://127.0.0.1:5000';
    if (useExpress) {
      try {
        const res = await fetch(`${expressUrl}/uploads/${filename}`);
        if (res.ok) {
          const bytes = await res.arrayBuffer();
          const ext = filename.split('.').pop();
          const contentType = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' }[ext] || 'image/jpeg';
          return new Response(bytes, {
            headers: {
              'Content-Type': contentType,
              'Cache-Control': 'public, max-age=31536000, immutable',
              'X-Content-Type-Options': 'nosniff'
            }
          });
        }
      } catch {}
    }
    return new Response('Not found', { status: 404 });
  }
}
