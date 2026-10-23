import { createInterface } from 'node:readline/promises';
import { stdin,stdout } from 'node:process';
import { Writable } from 'node:stream';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { db } from '../lib/db.js';
import { User } from '../lib/models.js';
import { registerSchema } from '../lib/validation.js';
let muted=false;const output=new Writable({write(chunk,encoding,callback){if(!muted)stdout.write(chunk,encoding);callback();}});const rl=createInterface({input:stdin,output,terminal:true});
try{const name=await rl.question('Admin name: ');const email=await rl.question('Admin email: ');const phone=await rl.question('Phone: ');stdout.write('Admin password (at least 10 characters, hidden): ');muted=true;const password=await rl.question('');muted=false;stdout.write('\n');const input=registerSchema.parse({name,email,phone,password});await db();if(await User.exists({email:input.email}))throw new Error('Account already exists. Use the admin dashboard to manage roles.');await User.create({...input,role:'admin',password:await bcrypt.hash(password,12)});console.log('Administrator created. You can now log in.');}catch(e){console.error(e.message);process.exitCode=1;}finally{rl.close();await mongoose.disconnect();}
