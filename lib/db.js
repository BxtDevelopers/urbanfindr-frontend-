import dns from 'dns';
import mongoose from 'mongoose';

// Fix for Node.js c-ares DNS SRV resolution issues on Windows/ISP local DNS resolvers (ECONNREFUSED)
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // ignore if environment restricts overriding dns servers
}

const cache = globalThis.__havenDB || (globalThis.__havenDB = { connection: null, promise: null });
export async function db() {
  if (cache.connection?.connection.readyState === 1) return cache.connection;
  if (!process.env.MONGODB_URI) throw Object.assign(new Error('Set MONGODB_URI in .env.local and start your local MongoDB server.'), { status: 503 });
  if (!cache.promise) cache.promise = mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 }).catch(error => { cache.promise = null; throw error; });
  cache.connection = await cache.promise;
  return cache.connection;
}
