import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { createHash, randomUUID } from 'node:crypto';
import { db } from './db.js';
import { User, Session, RateLimit } from './models.js';
export const fail = (message, status = 400) => { throw Object.assign(new Error(message), { status }); };
function secret() { const s=process.env.JWT_SECRET; if(!s || s.length<32 || s.startsWith('replace-')) fail('Configure a random JWT_SECRET of at least 32 characters.',503); return new TextEncoder().encode(s); }
const digest = value => createHash('sha256').update(value).digest('hex');
export async function signIn(user) {
 const token = await new SignJWT({}).setProtectedHeader({alg:'HS256'}).setSubject(String(user._id)).setJti(randomUUID()).setIssuedAt().setExpirationTime('7d').sign(secret());
 await Session.create({user:user._id,tokenHash:digest(token),expiresAt:new Date(Date.now()+7*864e5)});
 (await cookies()).set('urban_session',token,{httpOnly:true,sameSite:'lax',secure:process.env.COOKIE_SECURE==='true',path:'/',maxAge:604800});
}
export async function signOut() { const jar=await cookies();const token=jar.get('urban_session')?.value;if(token){await db();await Session.deleteOne({tokenHash:digest(token)});}jar.delete('urban_session'); }
export async function currentUser() {
 const token=(await cookies()).get('urban_session')?.value;if(!token)return null;
 let payload;try{payload=(await jwtVerify(token,secret(),{algorithms:['HS256']})).payload;}catch{return null;}
 await db();const session=await Session.exists({tokenHash:digest(token),expiresAt:{$gt:new Date()}});if(!session)return null;
 const user=await User.findById(payload.sub);return user?.active?user:null;
}
export async function requireUser(roles) {const user=await currentUser();if(!user)fail('Please log in to continue.',401);if(roles&&!roles.includes(user.role))fail('You do not have permission for this action.',403);return user;}
export function publicUser(user) {return { _id:String(user._id),name:user.name,email:user.email,phone:user.phone,role:user.role,company:user.company||'',bio:user.bio||'',reraId:user.reraId||'',experience:user.experience||'',favorites:user.favorites,active:user.active };}
export async function throttle(key, limit=10, windowMs=15*60*1000) {
 await db(); const now=Date.now(),bucket=Math.floor(now/windowMs);const item=await RateLimit.findOneAndUpdate({key:`${key}:${bucket}`},{$inc:{count:1},$setOnInsert:{expiresAt:new Date((bucket+2)*windowMs)}},{upsert:true,new:true});if(item.count>limit)fail('Too many requests. Please try again later.',429);
}
export function sameOrigin(request) {const origin=request.headers.get('origin');if(!origin)fail('Origin header is required for changes.',403);const expected=new URL(process.env.APP_URL||request.url).origin;if(origin!==expected)fail('Cross-origin request blocked.',403);}
