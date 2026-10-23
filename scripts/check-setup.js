import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { parse } from 'dotenv';
import { readFile } from 'node:fs/promises';
import mongoose from 'mongoose';
const file=resolve('.env.local');
if(!existsSync(file)){console.error('Missing .env.local. Copy .env.example to .env.local and configure it.');process.exitCode=1;}
else{
 const config={...parse(await readFile(file)),...process.env};
 if(!config.MONGODB_URI||!config.JWT_SECRET||config.JWT_SECRET.length<32){console.error('Check MONGODB_URI and JWT_SECRET in .env.local.');process.exitCode=1;}
 else{
  console.log('Environment file and signing-secret length: OK');
  try{await mongoose.connect(config.MONGODB_URI,{serverSelectionTimeoutMS:5000});await mongoose.connection.db.admin().ping();console.log('MongoDB connection: OK. You can run npm run seed, then npm run dev.');}
  catch{console.error('MongoDB is not running at the configured local address. Start the MongoDB service or run docker compose up -d, then retry npm run check:setup.');process.exitCode=1;}
  finally{await mongoose.disconnect();}
 }
}
