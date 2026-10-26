'use client';
import { designImage } from '@/lib/media';
import { useState } from 'react';
import { useSearchParams,useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowUpRight,Check,Ruler,Palette,Hammer,House } from 'lucide-react';
import { api,useApp,useData } from './providers';
import { Field,Image,SectionTitle,State,Pagination,Submit } from './ui';
import { EnquiryForm } from './engagement';
import InteriorHeroBanner from './InteriorHeroBanner';
import InteriorRatingsStrip from './InteriorRatingsStrip';
import InteriorMakeoverShowcase from './InteriorMakeoverShowcase';
import InteriorStoriesCarousel from './InteriorStoriesCarousel';
import InteriorStepsProcess from './InteriorStepsProcess';
import InteriorBrandCollective from './InteriorBrandCollective';
import InteriorFAQ from './InteriorFAQ';
import { money } from '@/lib/format';
export default function Interiors({id}){const {toast}=useApp();const params=useSearchParams(),router=useRouter();const category=params.get('category')||'',style=params.get('style')||'',page=Math.max(1,Number(params.get('page'))||1);function changeFilter(key,value){const q=new URLSearchParams(params.toString());if(value)q.set(key,value);else q.delete(key);if(key!=='page')q.delete('page');router.push(`/interiors?${q}`);}const setCategory=v=>changeFilter('category',v),setStyle=v=>changeFilter('style',v),setPage=v=>changeFilter('page',v);const [estimate,setEstimate]=useState(null),[busy,setBusy]=useState(false);const {data,error,loading}=useData(id?`designs/${id}`:`designs?${new URLSearchParams({category,style,page})}`);
 async function calculate(e){e.preventDefault();setBusy(true);try{setEstimate(await api('estimate',{method:'POST',body:Object.fromEntries(new FormData(e.currentTarget))}));}catch(e){toast(e.message);}finally{setBusy(false);}}
 if(id)return <div className="wrap section"><State loading={loading} error={error}/>{data&&<><Link href="/interiors" className="text-link mb-6">← All design ideas</Link><p className="eyebrow">{data.category} · {data.style}</p><h1 className="!text-4xl">{data.title}</h1><div className="grid lg:grid-cols-[1fr_380px] gap-8 mt-8 items-start"><div><Image src={designImage(data)} alt={data.title} className="w-full rounded-xl"/><div className="panel mt-6"><h3>Make this look your own</h3><p className="muted leading-7 my-5">{data.description}</p><p className="text-xl font-semibold">Starting from {money(data.startingPrice)}</p><p className="text-xs muted my-3">Indicative demo pricing. Actual quote depends on scope and materials.</p><div className="space-y-3 mt-6">{data.inclusions.map(v=><p key={v} className="flex gap-2"><Check size={16}/>{v}</p>)}</div></div></div><EnquiryForm design={data} estimate={data.startingPrice}/></div></>}</div>;
 return <><InteriorHeroBanner /><InteriorRatingsStrip /><InteriorMakeoverShowcase /><InteriorStoriesCarousel /><InteriorStepsProcess /><InteriorBrandCollective /><InteriorFAQ /></>;
}
