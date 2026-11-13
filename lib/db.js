import dns from 'dns';
import mongoose from 'mongoose';

function configureDns() {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  } catch {
    // ignore
  }
}

const cache = globalThis.__havenDB || (globalThis.__havenDB = { connection: null, promise: null });

// Optional direct replica-set URI from environment if Node c-ares DNS SRV lookup is blocked locally
export async function db() {
  if (mongoose.connection.readyState === 1 && cache.connection) {
    return cache.connection;
  }
  if (!process.env.MONGODB_URI) {
    throw Object.assign(new Error('Set MONGODB_URI in .env.local and start your local MongoDB server.'), { status: 503 });
  }

  // Reset stale cached connection/promise if socket dropped or disconnected
  if (mongoose.connection.readyState !== 1 && mongoose.connection.readyState !== 2) {
    cache.connection = null;
    cache.promise = null;
  }

  if (!cache.promise) {
    const primaryUri = process.env.MONGODB_URI;
    const opts = { serverSelectionTimeoutMS: 15000, connectTimeoutMS: 15000 };
    cache.promise = mongoose.connect(primaryUri, opts)
      .catch(async (error) => {
        const directUri = process.env.MONGODB_DIRECT_URI;
        const msg = String(error?.message || '');
        const isDnsOrSrv = msg.includes('querySrv') || error?.code === 'ECONNREFUSED' || error?.code === 'ENOTFOUND' || error?.syscall === 'querySrv';
        if (directUri && isDnsOrSrv) {
          console.warn('[DB] Primary lookup failed; falling back to configured MONGODB_DIRECT_URI...');
          return mongoose.connect(directUri, opts);
        }
        if (isDnsOrSrv) {
          configureDns();
          return mongoose.connect(primaryUri, opts);
        }
        throw error;
      })
      .catch((error) => {
        cache.promise = null;
        cache.connection = null;
        throw error;
      });
  }

  cache.connection = await cache.promise;
  return cache.connection;
}
