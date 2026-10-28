import { NextResponse } from 'next/server';
import { handle as originalHandle } from '@/lib/api';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function dispatch(req, context) {
  // Check if Express backend is enabled (defaults to true if configured or env var set)
  const useExpress = process.env.USE_EXPRESS_BACKEND !== 'false';
  const expressUrl = process.env.EXPRESS_BACKEND_URL || 'http://127.0.0.1:5000';

  if (!useExpress) {
    return originalHandle(req, context);
  }

  try {
    const params = await context?.params;
    const pathSegments = params?.path || [];
    const pathname = pathSegments.join('/');
    const search = new URL(req.url).search;

    // Directly handle Channel Partner system, Support Desk, Leads, Contact, and Password updates with native Next.js API
    if (
      pathname.startsWith('channel-partner') ||
      pathname.startsWith('support-tickets') ||
      pathname.startsWith('leads') ||
      pathname.startsWith('contact') ||
      pathname === 'auth/password'
    ) {
      return originalHandle(req, context);
    }

    const targetUrl = `${expressUrl}/api/${pathname}${search}`;

    const headers = new Headers(req.headers);
    headers.delete('host');
    headers.delete('connection');

    let body = undefined;
    if (['POST', 'PATCH', 'PUT', 'DELETE'].includes(req.method)) {
      const contentType = req.headers.get('content-type') || '';
      const contentLength = req.headers.get('content-length');
      if (contentLength && contentLength !== '0') {
        body = await req.arrayBuffer();
      } else if (contentType.includes('application/json') || contentType.includes('multipart/form-data')) {
        body = await req.arrayBuffer();
      }
    }

    const expressResponse = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
      redirect: 'manual'
    });

    const resHeaders = new Headers();
    expressResponse.headers.forEach((val, key) => {
      const lower = key.toLowerCase();
      if (lower !== 'transfer-encoding' && lower !== 'content-encoding') {
        resHeaders.append(key, val);
      }
    });

    // Handle multiple Set-Cookie headers properly if supported
    if (typeof expressResponse.headers.getSetCookie === 'function') {
      const cookies = expressResponse.headers.getSetCookie();
      if (cookies?.length) {
        resHeaders.delete('set-cookie');
        cookies.forEach(c => resHeaders.append('set-cookie', c));
      }
    }

    // If Express backend does not recognize the endpoint (404), fall back to native Next.js API
    if (expressResponse.status === 404) {
      return originalHandle(req, context);
    }

    const data = await expressResponse.arrayBuffer();
    return new NextResponse(data, {
      status: expressResponse.status,
      statusText: expressResponse.statusText,
      headers: resHeaders
    });
  } catch (error) {
    console.warn(`[Proxy Notice] Express backend unreachable (${error.message}). Falling back to Next.js API...`);
    return originalHandle(req, context);
  }
}

export const GET = dispatch;
export const POST = dispatch;
export const PATCH = dispatch;
export const DELETE = dispatch;
