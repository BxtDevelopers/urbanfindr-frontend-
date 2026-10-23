'use client';
import { createContext, useContext, useEffect, useState } from 'react';
export async function api(url,options={}){
 let response;
 try{response=await fetch(`/api/${url}`,{...options,credentials:'include',headers:{...(options.body instanceof FormData?{}:{'Content-Type':'application/json'}),...options.headers},body:options.body&&!(options.body instanceof FormData)&&typeof options.body!=='string'?JSON.stringify(options.body):options.body});}
 catch{throw new Error('The server could not be reached. Check that npm run dev is running and try again.');}
 let data;try{data=await response.json();}catch{throw new Error(`The server returned an unexpected response (${response.status}). Please retry.`);}
 if(!response.ok)throw new Error([data.error||'The request could not be completed.',...(data.details||[])].join('\n'));return data;
}
const Context=createContext(null);
export function Providers({children}){const [user,setUser]=useState(null),[ready,setReady]=useState(false),[toast,setToast]=useState(null),[compare,setCompare]=useState([]);
 async function refresh(){try{setUser((await api('auth/me')).user);}catch{}finally{setReady(true);}}
 useEffect(()=>{refresh();try{const saved=JSON.parse(localStorage.getItem('urban_compare')||'[]');if(Array.isArray(saved))setCompare(saved.filter(x=>typeof x==='string'&&/^[a-f0-9]{24}$/.test(x)).slice(0,4));}catch{}},[]);
 useEffect(()=>{if(!toast)return;const timer=setTimeout(()=>setToast(null),6000);return()=>clearTimeout(timer);},[toast]);
 function toggleCompare(id){setCompare(prev=>{const next=prev.includes(id)?prev.filter(x=>x!==id):prev.length<4?[...prev,id]:prev;if(next===prev)setToast('Compare up to four homes at a time.');try{localStorage.setItem('urban_compare',JSON.stringify(next));}catch{}return next;});}
 return <Context.Provider value={{user,ready,refresh,setUser,toast:setToast,compare,toggleCompare}}>{children}{toast&&<div role="status" className="toast"><span className="whitespace-pre-line">{toast}</span><button aria-label="Dismiss message" onClick={()=>setToast(null)}>×</button></div>}</Context.Provider>;
}
export const useApp=()=>useContext(Context);
export function useData(url){const [data,setData]=useState(null),[error,setError]=useState(''),[loading,setLoading]=useState(true),[version,setVersion]=useState(0);useEffect(()=>{let active=true;setLoading(true);setError('');if(!url){setData(null);setLoading(false);return;}api(url).then(v=>{if(active)setData(v);}).catch(e=>{if(active){setData(null);setError(e.message);}}).finally(()=>{if(active)setLoading(false);});return()=>{active=false;};},[url,version]);return {data,error,loading,reload:()=>setVersion(v=>v+1)};}
