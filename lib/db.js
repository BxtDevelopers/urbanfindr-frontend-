import dns from 'dns';
import mongoose from 'mongoose';

function configureDns() {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  } catch {
    // ignore
  }
}

configureDns();

const cache = globalThis.__havenDB || (globalThis.__havenDB = { connection: null, promise: null });

// Direct replica-set fallback for the Atlas cluster in case Node c-ares DNS SRV lookup is blocked locally
const ATLAS_DIRECT_URI = 'mongodb://danishhussain3738_db_user:EfzUYSb6vqyDfRa2@ac-hlv0eik-shard-00-00.99ipz2n.mongodb.net:27017,ac-hlv0eik-shard-00-01.99ipz2n.mongodb.net:27017,ac-hlv0eik-shard-00-02.99ipz2n.mongodb.net:27017/urbanfinder?ssl=true&replicaSet=atlas-cbiiu3-shard-0&authSource=admin&retryWrites=true&w=majority';

export async function db() {
  if (cache.connection?.connection.readyState === 1) return cache.connection;
  if (!process.env.MONGODB_URI) throw Object.assign(new Error('Set MONGODB_URI in .env.local and start your local MongoDB server.'), { status: 503 });

  configureDns();

  if (!cache.promise) {
    const primaryUri = process.env.MONGODB_URI;
    cache.promise = mongoose.connect(primaryUri, { serverSelectionTimeoutMS: 5000 })
      .catch(async (error) => {
        // If DNS SRV fails (common on Windows local DNS/proxies), fall back to direct replica set URI
        if ((error?.message?.includes('querySrv') || error?.code === 'ECONNREFUSED') && primaryUri.includes('cluster0.99ipz2n.mongodb.net')) {
          console.warn('[DB] SRV resolution failed; falling back to direct replica set URI...');
          return mongoose.connect(ATLAS_DIRECT_URI, { serverSelectionTimeoutMS: 5000 });
        }
        cache.promise = null;
        throw error;
      })
      .catch(error => {
        cache.promise = null;
        throw error;
      });
  }

  cache.connection = await cache.promise;
  return cache.connection;
}
