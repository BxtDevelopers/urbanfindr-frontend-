'use client';
import Link from 'next/link';
import { useState } from 'react';
import { api,useApp,useData } from './providers';
import { Field,Pagination,State,Submit } from './ui';
import { cities,money } from '@/lib/format';
import { cityGuides } from '@/lib/catalog';
import { Leads } from './dashboard';
export default function Admin(){const [tab,setTab]=useState('properties');const stats=useData('admin/stats');return <div className="wrap section"><div className="section-title"><div><p className="eyebrow">URBANFINDR ADMINISTRATION</p><h1 className="!text-4xl">Keep the doors open.</h1><p className="muted mt-4">Review listings, manage people and guide new enquiries.</p></div><Link className="btn-outline" href="/dashboard">My dashboard</Link></div><State loading={stats.loading} error={stats.error}/><div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-8">{Object.entries(stats.data||{}).map(([label,value])=><div className="stat !p-4" key={label}><span className="text-xs capitalize muted">{label}</span><strong className="!text-2xl">{value}</strong></div>)}</div><div className="tab-row mb-7">{['properties','users','projects','designs','enquiries','cities'].map(t=><button key={t} className={`capitalize ${tab===t?'active':''}`} onClick={()=>setTab(t)}>{t}</button>)}</div>{tab==='enquiries'?<Leads/>:tab==='cities'?<AdminCities/>:<AdminRecords key={tab} type={tab} onMutation={stats.reload}/>}</div>;}
function AdminRecords({type,onMutation}){const {user,toast}=useApp();const [page,setPage]=useState(1),[status,setStatus]=useState(''),[editing,setEditing]=useState(null),[creating,setCreating]=useState(false),[busy,setBusy]=useState('');const {data,error,loading,reload}=useData(`admin/${type}?page=${page}&status=${status}`);function updated(){reload();onMutation();}
 async function patch(id,body){setBusy(id);try{await api(`admin/${type}/${id}`,{method:'PATCH',body});updated();toast('Changes saved.');}catch(e){toast(e.message);}finally{setBusy('');}}
 async function remove(id){if(!window.confirm(type==='designs'?'Delete this design? Existing enquiries will keep their history.':'Archive this item and remove it from public listings?'))return;try{await api(`admin/${type}/${id}`,{method:'DELETE'});updated();toast('Item removed from the catalogue.');}catch(e){toast(e.message);}}
 if(creating||editing)return <CatalogEditor type={type} item={editing} onDone={()=>{setEditing(null);setCreating(false);updated();}} onCancel={()=>{setEditing(null);setCreating(false);}}/>;
 return <><div className="flex justify-between gap-4 mb-6">{['properties','projects'].includes(type)?<select className="input !w-auto" aria-label="Filter status" value={status} onChange={e=>{setStatus(e.target.value);setPage(1);}}><option value="">All statuses</option>{['pending','approved','rejected','archived'].map(v=><option key={v}>{v}</option>)}</select>:<span/>}{['projects','designs'].includes(type)&&<button className="btn" onClick={()=>setCreating(true)}>Add {type==='projects'?'builder project':'interior design'}</button>}</div><State loading={loading} error={error} empty={data?.total===0}/><div className="overflow-x-auto panel !p-0"><table className="min-w-[700px]"><thead><tr><th>{type==='users'?'Person':'Listing'}</th><th>{type==='users'?'Role':'Details'}</th><th>Status</th><th>Actions</th></tr></thead><tbody>{data?.items?.map(item=><tr key={item._id}><td><strong>{item.name||item.title}</strong><p className="muted mt-2">{item.email||item.builder||item.locality||item.category}</p></td><td>{type==='users'?<select disabled={busy===item._id||item._id===user._id} value={item.role} aria-label={`Role for ${item.name}`} onChange={e=>patch(item._id,{role:e.target.value})}>{['user','owner','admin'].map(v=><option key={v}>{v}</option>)}</select>:<span>{item.city||item.style}<br/>{money(item.price||item.startingPrice)}</span>}</td><td><span className="pill">{type==='users'?item.active?'Active':'Disabled':item.status||'Published'}</span>{item.featured&&<span className="pill ml-2">Featured</span>}</td><td><div className="flex flex-wrap gap-3 max-w-sm">{type==='users'?<button disabled={item._id===user._id||busy===item._id} className="text-link" onClick={()=>patch(item._id,{active:!item.active})}>{item.active?'Disable':'Enable'}</button>:<>{type!=='designs'&&<>{item.status!=='approved'&&<button disabled={busy===item._id} className="text-link" onClick={()=>patch(item._id,{status:'approved'})}>Approve</button>}{item.status!=='rejected'&&<button disabled={busy===item._id} className="text-xs text-amber-700" onClick={()=>patch(item._id,{status:'rejected'})}>Reject</button>}</>}<Link className="text-link" href={type==='properties'?`/properties/${item._id}`:type==='projects'?`/projects/${item._id}`:`/interiors/${item._id}`}>View</Link>{type==='properties'&&item.status==='approved'&&<button disabled={busy===item._id} className="text-link" onClick={()=>patch(item._id,{featured:!item.featured})}>{item.featured?'Unfeature':'Feature'}</button>}{type==='properties'?<Link href={`/properties/${item._id}/edit`} className="text-link">Edit</Link>:<button className="text-link" onClick={()=>setEditing(item)}>Edit</button>}<button className="text-xs text-red-700" onClick={()=>remove(item._id)}>{type==='designs'?'Delete':'Archive'}</button></>}</div></td></tr>)}</tbody></table></div><Pagination data={data} onChange={setPage}/></>;
}
function CatalogEditor({type,item,onDone,onCancel}){const project=type==='projects';const {toast}=useApp();const [busy,setBusy]=useState(false),[error,setError]=useState(''),[configs,setConfigs]=useState(item?.configurations?.map(v=>({name:v.name,area:v.area,price:v.price,plan:v.plan}))||[{name:'2 BHK',area:1200,price:8500000,plan:'/images/plan-1.svg'}]),[images,setImages]=useState(item?.images||[project?'/photos/builder-1.jpg':'/photos/living-1.jpg']),[uploading,setUploading]=useState(false);
 async function upload(e){setUploading(true);try{const file=e.target.files[0];if(!file)return;const form=new FormData();form.append('file',file);const result=await api('uploads',{method:'POST',body:form});setImages(v=>[...v,result.url].slice(-12));}catch(e){toast(e.message);}finally{setUploading(false);}}
 async function save(e){e.preventDefault();setBusy(true);setError('');const input=Object.fromEntries(new FormData(e.currentTarget));input.inclusions=input.inclusions?.split('\n').map(v=>v.trim()).filter(Boolean);input.amenities=input.amenities?.split(',').map(v=>v.trim()).filter(Boolean);if(project){input.images=images;input.configurations=configs;}else input.image=images[images.length-1];try{await api(`admin/${type}${item?'/'+item._id:''}`,{method:item?'PATCH':'POST',body:input});toast('Catalogue saved.');onDone();}catch(e){setError(e.message);}finally{setBusy(false);}}
 return <form onSubmit={save} className="panel space-y-6"><div className="flex justify-between"><h2>{item?'Edit':'Add'} {project?'builder project':'interior design'}</h2><button type="button" className="text-link" onClick={onCancel}>Cancel</button></div>{error&&<div className="error whitespace-pre-line">{error}</div>}<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"><Field label="Title"><input required minLength={4} name="title" defaultValue={item?.title}/></Field>{project?<><Field label="Builder"><input required name="builder" minLength={2} defaultValue={item?.builder}/></Field><Field label="City"><select name="city" defaultValue={item?.city||'Bengaluru'}>{cities.map(v=><option key={v}>{v}</option>)}</select></Field><Field label="Locality"><input name="locality" required minLength={2} defaultValue={item?.locality}/></Field><Field label="RERA reference"><input name="rera" required minLength={3} defaultValue={item?.rera}/></Field><Field label="Possession"><input name="possession" required minLength={4} placeholder="December 2028" defaultValue={item?.possession}/></Field><Field label="Stage"><select name="stage" defaultValue={item?.stage||'New launch'}>{['New launch','Under construction','Ready to move'].map(v=><option key={v}>{v}</option>)}</select></Field>{[['price','Starting price (₹)',item?.price||8500000],['maxPrice','Maximum price (₹)',item?.maxPrice||15000000],['area','Starting area (sq ft)',item?.area||1200],['acres','Site area (acres)',item?.acres||5],['units','Homes',item?.units||200],['towers','Towers',item?.towers||3]].map(([name,label,value])=><Field key={name} label={label}><input type="number" min="1" step={name==='acres'?'0.1':'1'} required name={name} defaultValue={value}/></Field>)}</>:<><Field label="Category"><select name="category" defaultValue={item?.category}>{['Full home','Kitchen','Bedroom','Living room','Wardrobe'].map(v=><option key={v}>{v}</option>)}</select></Field><Field label="Style"><select name="style" defaultValue={item?.style}>{['Modern','Scandinavian','Contemporary','Minimal'].map(v=><option key={v}>{v}</option>)}</select></Field><Field label="Starting price (₹)"><input name="startingPrice" required min="1" type="number" defaultValue={item?.startingPrice||180000}/></Field></>}</div><Field label="Description"><textarea name="description" required minLength={project?30:20} maxLength={5000} defaultValue={item?.description}/></Field>{project?<><Field label="Amenities (comma separated)"><input name="amenities" defaultValue={item?.amenities?.join(', ')||'Gym, Security, Garden'}/></Field><h3>Configurations</h3>{configs.map((config,i)=><div className="grid sm:grid-cols-4 gap-3" key={i}>{[['name','Configuration'],['area','Area (sq ft)'],['price','Price (₹)']].map(([key,label])=><Field key={key} label={label}><input required type={key==='name'?'text':'number'} min={key==='name'?undefined:1} value={config[key]} onChange={e=>setConfigs(v=>v.map((c,n)=>n===i?{...c,[key]:e.target.value}:c))}/></Field>)}<Field label="Floor plan image"><input required value={config.plan} onChange={e=>setConfigs(v=>v.map((c,n)=>n===i?{...c,plan:e.target.value}:c))}/></Field><button className="text-xs text-red-600" type="button" disabled={configs.length===1} onClick={()=>setConfigs(v=>v.filter((_,n)=>n!==i))}>Remove configuration</button></div>)}<button className="btn-outline" type="button" disabled={configs.length>=15} onClick={()=>setConfigs(v=>[...v,{name:'3 BHK',area:1600,price:12000000,plan:'/images/plan-2.svg'}])}>Add configuration</button></>:<Field label="Inclusions (one per line)"><textarea name="inclusions" required defaultValue={item?.inclusions?.join('\n')||'Design consultation\nMaterial selection\nInstallation planning'}/></Field>}<Field label={project?'Gallery URLs (one per line; HTTPS, /photos or /uploads path)':'Design image URL'}><textarea value={images.join('\n')} onChange={e=>setImages(e.target.value.split('\n').filter(Boolean))}/></Field><label className="btn-outline cursor-pointer">{uploading?'Uploading…':'Upload an image'}<input className="hidden" type="file" accept="image/jpeg,image/png,image/webp" onChange={upload} disabled={uploading}/></label><div className="text-xs muted">Bundled photos: /photos/house-1.jpg, /photos/living-1.jpg, /photos/kitchen-1.jpg, /photos/bedroom-3.jpg, /photos/wardrobe-1.jpg and /photos/builder-1.jpg. Floor plans: /images/plan-1.svg through plan-3.svg.</div><Submit busy={busy||uploading}>Save {project?'project':'design'}</Submit></form>;
}

function AdminCities() {
  const { toast } = useApp();
  const [cityList, setCityList] = useState(cityGuides);
  const [adding, setAdding] = useState(false);

  function addCity(e) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = form.get('name').trim();
    const slug = form.get('slug').trim().toLowerCase();
    const tagline = form.get('tagline').trim();
    const localities = form.get('localities').split(',').map(s => s.trim()).filter(Boolean);
    const image = form.get('image').trim() || 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=1200&q=85';

    if (!name || !slug) return;
    const newCity = { name, slug, tagline, localities, image };
    setCityList(prev => [...prev, newCity]);
    setAdding(false);
    toast(`City "${name}" added successfully.`);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3>Supported cities &amp; operational zones</h3>
          <p className="text-xs muted mt-1">Configure active metropolitan markets and their prime localities.</p>
        </div>
        <button className="btn" onClick={() => setAdding(!adding)}>
          {adding ? 'Cancel' : '+ Add new city'}
        </button>
      </div>

      {adding && (
        <form onSubmit={addCity} className="panel space-y-4">
          <h4>Add a new operational city</h4>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="City name">
              <input name="name" required placeholder="e.g. Ahmedabad, Kolkata, Kochi" />
            </Field>
            <Field label="URL slug">
              <input name="slug" required placeholder="e.g. ahmedabad, kolkata" />
            </Field>
          </div>
          <Field label="Tagline">
            <input name="tagline" placeholder="e.g. Heritage meets emerging innovation." />
          </Field>
          <Field label="Prime localities (comma-separated)">
            <input name="localities" required placeholder="e.g. Satellite, SG Highway, Bodakdev, Vastrapur" />
          </Field>
          <Field label="Cover image URL">
            <input name="image" placeholder="https://images.unsplash.com/..." />
          </Field>
          <Submit>Save city</Submit>
        </form>
      )}

      <div className="overflow-x-auto panel !p-0">
        <table className="min-w-[700px]">
          <thead>
            <tr>
              <th>City</th>
              <th>Localities</th>
              <th>Tagline</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {cityList.map(c => (
              <tr key={c.slug}>
                <td>
                  <strong>{c.name}</strong>
                  <p className="text-xs muted font-mono">/cities/{c.slug}</p>
                </td>
                <td className="max-w-xs">
                  <div className="flex flex-wrap gap-1">
                    {c.localities.map(loc => (
                      <span key={loc} className="text-xs bg-stone-100 px-2 py-0.5 rounded">
                        {loc}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="text-xs muted max-w-xs">
                  {c.tagline}
                </td>
                <td>
                  <span className="pill !bg-green-100 !text-green-800">Operational</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
