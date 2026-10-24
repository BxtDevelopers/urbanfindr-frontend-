'use client';
import Link from 'next/link';
import { useState } from 'react';
import { ArrowUpRight, Heart, MapPin, BedDouble, Maximize, GitCompareArrows, Check, Home, ArrowRight } from 'lucide-react';
import { api,useApp } from './providers';
import { money } from '@/lib/format';
import { isMonthly } from '@/lib/catalog';
import { resolveImage,photos,propertyImages,projectImages } from '@/lib/media';
export function Image({src,alt,className=''}){return <img className={className} src={resolveImage(src)} alt={alt} loading="lazy" onError={e=>{e.currentTarget.onerror=null;e.currentTarget.src=photos.hero;}}/>;}
export function State({loading,error,empty=false}){return loading?<div className="panel py-14 text-center animate-pulse">Finding your next chapter…</div>:error?<div role="alert" className="error whitespace-pre-line">{error}</div>:empty?<div className="panel py-14 text-center"><Home className="mx-auto mb-4 text-stone-400"/><h3>Nothing here yet</h3><p className="muted mt-2">Try another search or add your first item.</p></div>:null;}
export function Field({label,children,hint}){return <label className="field"><span>{label}</span>{children}{hint&&<small className="muted font-normal">{hint}</small>}</label>;}
export function Pagination({data,onChange}){if(!data||data.pages<2)return null;return <div className="flex justify-center items-center gap-5 mt-8"><button className="btn-outline" disabled={data.page<=1} onClick={()=>onChange(data.page-1)}>Previous</button><span>{data.page} / {data.pages}</span><button className="btn-outline" disabled={data.page>=data.pages} onClick={()=>onChange(data.page+1)}>Next</button></div>;}
export function Submit({busy,children='Save changes'}){return <button className="btn" disabled={busy}>{busy?'Please wait…':children}<ArrowRight size={16}/></button>;}
export function PropertyCard({item,onFavorite}){
  const {user,refresh,toast,compare,toggleCompare}=useApp();
  const [busy,setBusy]=useState(false);
  const saved=user?.favorites?.includes(item._id);

  async function favorite(){
    if(!user){toast('Log in to save a home.');return;}
    setBusy(true);
    try{
      const result=await api(`favorites/${item._id}`,{method:'POST'});
      toast(result.saved?'Added to your saved homes.':'Removed from saved homes.');
      await refresh();
      onFavorite?.();
    }catch(e){toast(e.message);}finally{setBusy(false);}
  }

  const isRent = item.purpose === 'rent';
  const isBuy = item.purpose === 'buy';
  const isPg = item.purpose === 'pg';

  return (
    <article className="property-card">
      <div className="card-image relative">
        <Link href={`/properties/${item._id}`}>
          <Image src={propertyImages(item)[0]} alt={item.title}/>
        </Link>
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5 items-center z-10">
          <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider shadow-sm ${
            isRent
              ? 'bg-amber-600 text-white'
              : isBuy
              ? 'bg-forest text-white'
              : isPg
              ? 'bg-purple-700 text-white'
              : 'bg-stone-800 text-white'
          }`}>
            {isRent ? 'Rent' : isBuy ? 'Buy' : isPg ? 'PG / Rent' : item.transaction === 'sale' ? 'Commercial Sale' : 'Commercial Lease'}
          </span>
          {item.verified && (
            <span className="badge bg-white/95 text-stone-900 border border-stone-200/60 shadow-sm flex items-center gap-1">
              <Check size={12} className="text-forest" /> Verified
            </span>
          )}
          {item.featured && (
            <span className="badge bg-lime text-stone-900 font-semibold shadow-sm">
              Featured
            </span>
          )}
        </div>
        <button
          className={`icon-btn absolute right-4 top-4 z-10 ${saved?'text-red-600':''}`}
          disabled={busy}
          aria-label={saved?'Remove favorite':'Save property'}
          onClick={favorite}
        >
          <Heart size={18} fill={saved?'currentColor':'none'}/>
        </button>
      </div>

      <div className="p-5">
        <div className="flex items-baseline gap-1.5 mb-2">
          <strong className="text-xl">{money(item.price)}</strong>
          {isMonthly(item) ? (
            <span className="muted text-sm">/ month</span>
          ) : null}
        </div>
        <Link className="card-title" href={`/properties/${item._id}`}>{item.title}</Link>
        <p className="muted flex gap-1 items-center text-sm mt-2"><MapPin size={13}/>{item.locality}, {item.city}</p>
        <div className="card-specs">
          <span><BedDouble size={15}/>{item.bedrooms ? `${item.bedrooms} BHK` : item.type}</span>
          <span><Maximize size={14}/>{item.area.toLocaleString()} sq ft</span>
          <span>{item.furnishing.replace('furnished','furn.')}</span>
        </div>
        <div className="flex justify-between items-center border-t border-stone-100 pt-4">
          <span className="text-xs font-semibold text-forest">
            {isRent
              ? 'FOR RENT'
              : isBuy
              ? 'FOR BUY'
              : isPg
              ? `${item.sharing || 'Private room'} · ${item.availableBeds ?? 1} beds`
              : item.transaction === 'sale'
              ? 'FOR SALE'
              : 'FOR LEASE / RENT'}
          </span>
          <button
            className={`text-xs flex gap-1 items-center ${compare.includes(item._id)?'font-bold text-forest':'muted'}`}
            onClick={()=>toggleCompare(item._id)}
          >
            <GitCompareArrows size={14}/>{compare.includes(item._id)?'Added':'Compare'}
          </button>
        </div>
      </div>
    </article>
  );
}
export function ProjectCard({item}){return <article className="property-card"><Link href={`/projects/${item._id}`} className="card-image block"><Image src={projectImages(item)[0]} alt={item.title}/><span className="badge absolute left-4 top-4">{item.stage}</span></Link><div className="p-5"><p className="eyebrow mb-2">{item.builder}</p><Link className="card-title" href={`/projects/${item._id}`}>{item.title}</Link><p className="muted text-sm mt-2">{item.locality}, {item.city}</p><p className="font-semibold text-lg my-4">{money(item.price)} – {money(item.maxPrice)}</p><div className="flex justify-between text-xs border-t pt-4"><span>{item.configurations?.map(x=>x.name).join(' · ')}</span><ArrowUpRight size={16}/></div></div></article>;}
export function SectionTitle({eyebrow,title,description,href,link='View all'}){return <div className="section-title"><div>{eyebrow&&<p className="eyebrow">{eyebrow}</p>}<h2>{title}</h2>{description&&<p className="muted mt-3">{description}</p>}</div>{href&&<Link className="text-link" href={href}>{link}<ArrowUpRight size={17}/></Link>}</div>;}
