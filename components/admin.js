'use client';
import Link from 'next/link';
import { useState } from 'react';
import { api,useApp,useData } from './providers';
import { Field,Pagination,State,Submit } from './ui';
import { cities,money } from '@/lib/format';
import { cityGuides } from '@/lib/catalog';
import { Leads } from './dashboard';
export default function Admin(){const [tab,setTab]=useState('properties');const stats=useData('admin/stats');return <div className="wrap section"><div className="section-title"><div><p className="eyebrow">URBANFINDR ADMINISTRATION</p><h1 className="!text-4xl">Keep the doors open.</h1><p className="muted mt-4">Review listings, manage people and guide new enquiries.</p></div><Link className="btn-outline" href="/dashboard">My dashboard</Link></div><State loading={stats.loading} error={stats.error}/><div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-8">{Object.entries(stats.data||{}).map(([label,value])=><div className="stat !p-4" key={label}><span className="text-xs capitalize muted">{label}</span><strong className="!text-2xl">{value}</strong></div>)}</div><div className="tab-row mb-7">{['properties','users','projects','designs','services','enquiries','cities'].map(t=><button key={t} className={`capitalize ${tab===t?'active':''}`} onClick={()=>setTab(t)}>{t==='services'?'Services Provider':t}</button>)}</div>{tab==='enquiries'?<Leads/>:tab==='cities'?<AdminCities/>:tab==='services'?<AdminServiceProviders onMutation={stats.reload}/>:<AdminRecords key={tab} type={tab} onMutation={stats.reload}/>}</div>;}
function AdminRecords({type,onMutation}){const {user,toast}=useApp();const [page,setPage]=useState(1),[status,setStatus]=useState(''),[editing,setEditing]=useState(null),[creating,setCreating]=useState(false),[busy,setBusy]=useState('');const {data,error,loading,reload}=useData(`admin/${type}?page=${page}&status=${status}`);function updated(){reload();onMutation();}
 async function patch(id,body){setBusy(id);try{await api(`admin/${type}/${id}`,{method:'PATCH',body});updated();toast('Changes saved.');}catch(e){toast(e.message);}finally{setBusy('');}}
 async function remove(id){if(!window.confirm(type==='designs'?'Delete this design? Existing enquiries will keep their history.':'Archive this item and remove it from public listings?'))return;try{await api(`admin/${type}/${id}`,{method:'DELETE'});updated();toast('Item removed from the catalogue.');}catch(e){toast(e.message);}}
 if(creating||editing)return <CatalogEditor type={type} item={editing} onDone={()=>{setEditing(null);setCreating(false);updated();}} onCancel={()=>{setEditing(null);setCreating(false);}}/>;
 return <><div className="flex justify-between gap-4 mb-6">{['properties','projects'].includes(type)?<select className="input !w-auto" aria-label="Filter status" value={status} onChange={e=>{setStatus(e.target.value);setPage(1);}}><option value="">All statuses</option>{['pending','approved','rejected','archived'].map(v=><option key={v}>{v}</option>)}</select>:<span/>}{['projects','designs'].includes(type)&&<button className="btn" onClick={()=>setCreating(true)}>Add {type==='projects'?'builder project':'interior design'}</button>}</div><State loading={loading} error={error} empty={data?.total===0}/><div className="overflow-x-auto panel !p-0"><table className="min-w-[700px]"><thead><tr><th>{type==='users'?'Person':'Listing'}</th><th>{type==='users'?'Role':'Details'}</th><th>Status</th><th>Actions</th></tr></thead><tbody>{data?.items?.map(item=><tr key={item._id}><td><strong>{item.name||item.title}</strong><p className="muted mt-2">{item.email||item.builder||item.locality||item.category}</p></td><td>{type==='users'?<select disabled={busy===item._id||item._id===user._id} value={item.role} aria-label={`Role for ${item.name}`} onChange={e=>patch(item._id,{role:e.target.value})}>{['user','owner','admin'].map(v=><option key={v}>{v}</option>)}</select>:<span>{item.city||item.style}<br/>{money(item.price||item.startingPrice)}</span>}</td><td><span className="pill">{type==='users'?item.active?'Active':'Disabled':item.status||'Published'}</span>{item.featured&&<span className="pill ml-2">Featured</span>}</td><td><div className="flex flex-wrap gap-3 max-w-sm">{type==='users'?<button disabled={item._id===user._id||busy===item._id} className="text-link" onClick={()=>patch(item._id,{active:!item.active})}>{item.active?'Disable':'Enable'}</button>:<>{type!=='designs'&&<>{item.status!=='approved'&&<button disabled={busy===item._id} className="text-link" onClick={()=>patch(item._id,{status:'approved'})}>Approve</button>}{item.status!=='rejected'&&<button disabled={busy===item._id} className="text-xs text-amber-700" onClick={()=>patch(item._id,{status:'rejected'})}>Reject</button>}</>}<Link className="text-link" href={type==='properties'?`/properties/${item._id}`:type==='projects'?`/projects/${item._id}`:`/interiors/${item._id}`}>View</Link>{['properties','projects'].includes(type)&&item.status==='approved'&&<button disabled={busy===item._id} className="text-link" onClick={()=>patch(item._id,{featured:!item.featured})}>{item.featured?'Unfeature':'Feature'}</button>}{type==='properties'?<Link href={`/properties/${item._id}/edit`} className="text-link">Edit</Link>:<button className="text-link" onClick={()=>setEditing(item)}>Edit</button>}<button className="text-xs text-red-700" onClick={()=>remove(item._id)}>{type==='designs'?'Delete':'Archive'}</button></>}</div></td></tr>)}</tbody></table></div><Pagination data={data} onChange={setPage}/></>;
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

function AdminServiceProviders({ onMutation }) {
  const { toast } = useApp();
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState('');

  const { data, loading, error, reload } = useData(`service-providers?q=${encodeURIComponent(q)}`);
  const items = data?.items || [];

  function updated() {
    reload();
    if (onMutation) onMutation();
  }

  async function patch(id, body) {
    setBusy(id);
    try {
      await api(`service-providers/${id}`, { method: 'PATCH', body });
      updated();
      toast('Service provider updated.');
    } catch (e) {
      toast(e.message);
    } finally {
      setBusy('');
    }
  }

  async function remove(id) {
    if (!window.confirm('Delete this service provider from the database?')) return;
    setBusy(id);
    try {
      await api(`service-providers/${id}`, { method: 'DELETE' });
      updated();
      toast('Service provider deleted.');
    } catch (e) {
      toast(e.message);
    } finally {
      setBusy('');
    }
  }

  if (creating || editing) {
    return (
      <ServiceProviderForm
        item={editing}
        onDone={() => {
          setEditing(null);
          setCreating(false);
          updated();
        }}
        onCancel={() => {
          setEditing(null);
          setCreating(false);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center">
        <div>
          <h3>Verified Service Providers &amp; Home Experts</h3>
          <p className="text-xs muted mt-1">Manage verified tradespeople, starting rates, and featured homepage placements.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search provider, category or city..."
            value={q}
            onChange={e => setQ(e.target.value)}
            className="input !text-xs !py-2 !w-full sm:!w-64"
          />
          <button className="btn text-xs whitespace-nowrap" onClick={() => setCreating(true)}>
            + Add Provider
          </button>
        </div>
      </div>

      <State loading={loading} error={error} empty={items.length === 0} />

      <div className="overflow-x-auto panel !p-0">
        <table className="min-w-[750px]">
          <thead>
            <tr>
              <th>Professional</th>
              <th>Category &amp; Specialist</th>
              <th>Location &amp; Rate</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map(p => (
              <tr key={p._id || p.name}>
                <td>
                  <div className="flex items-center gap-3">
                    <img
                      src={p.avatar || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=100&q=80'}
                      alt={p.name}
                      className="w-10 h-10 rounded-full object-cover ring-1 ring-stone-200 shrink-0"
                    />
                    <div>
                      <strong>{p.name}</strong>
                      <p className="text-xs muted font-mono">{p.phone || '+91 98000 00000'}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="font-medium text-sm text-forest">{p.category}</span>
                  <p className="text-xs muted">{p.specialist || p.experience || 'Verified Pro'}</p>
                </td>
                <td>
                  <span className="text-sm font-semibold text-stone-800">{p.startingPrice || '₹299 onwards'}</span>
                  <p className="text-xs muted">{p.locality ? `${p.locality}, ` : ''}{p.city}</p>
                </td>
                <td>
                  <div className="flex flex-wrap gap-1">
                    {p.verified !== false && <span className="pill !bg-emerald-50 !text-emerald-800 text-[10px]">Verified</span>}
                    {p.featured ? (
                      <span className="pill !bg-amber-50 !text-amber-800 text-[10px]">Featured</span>
                    ) : (
                      <span className="pill text-[10px] muted">Standard</span>
                    )}
                  </div>
                </td>
                <td>
                  <div className="flex items-center gap-3 text-xs">
                    <button
                      disabled={busy === p._id}
                      onClick={() => patch(p._id, { featured: !p.featured })}
                      className="text-link"
                    >
                      {p.featured ? 'Unfeature' : 'Feature'}
                    </button>
                    <button
                      onClick={() => setEditing(p)}
                      className="text-link"
                    >
                      Edit
                    </button>
                    <button
                      disabled={busy === p._id}
                      onClick={() => remove(p._id)}
                      className="text-red-700 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ServiceProviderForm({ item, onDone, onCancel }) {
  const { toast } = useApp();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const form = new FormData(e.currentTarget);
    const data = {
      name: form.get('name').trim(),
      category: form.get('category').trim(),
      specialist: form.get('specialist').trim(),
      city: form.get('city').trim(),
      locality: form.get('locality').trim(),
      startingPrice: form.get('startingPrice').trim(),
      experience: form.get('experience').trim(),
      rating: parseFloat(form.get('rating')) || 4.8,
      phone: form.get('phone').trim(),
      email: form.get('email').trim(),
      services: form.get('services').split(',').map(s => s.trim()).filter(Boolean),
      avatar: form.get('avatar').trim() || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=400&q=80',
      featured: form.get('featured') === 'on',
      verified: form.get('verified') === 'on',
      bio: form.get('bio')?.trim() || ''
    };

    try {
      await api(item ? `service-providers/${item._id}` : 'service-providers', {
        method: item ? 'PATCH' : 'POST',
        body: data
      });
      toast(`Service provider "${data.name}" saved to database.`);
      onDone();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const categoryPresets = [
    'Electrician',
    'Plumbing',
    'Painting',
    'AC Service & Repair',
    'Home Cleaning',
    'Pest Control',
    'Packers & Movers',
    'Carpentry',
    'Interior Design',
    'Home Security'
  ];

  return (
    <form onSubmit={handleSubmit} className="panel space-y-6">
      <div className="flex justify-between items-center pb-3 border-b border-stone-100">
        <h2>{item ? 'Edit' : 'Add New'} Service Provider</h2>
        <button type="button" className="text-link" onClick={onCancel}>Cancel</button>
      </div>

      {error && <div className="error whitespace-pre-line">{error}</div>}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <Field label="Full Name *">
          <input required name="name" defaultValue={item?.name} placeholder="e.g. Rajesh Sharma" />
        </Field>

        <Field label="Service Category *">
          <select name="category" defaultValue={item?.category || 'Electrician'}>
            {categoryPresets.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>

        <Field label="Specialist Title">
          <input name="specialist" defaultValue={item?.specialist} placeholder="e.g. Master Electrician & Wiring" />
        </Field>

        <Field label="City *">
          <select name="city" defaultValue={item?.city || 'Bengaluru'}>
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>

        <Field label="Locality">
          <input name="locality" defaultValue={item?.locality} placeholder="e.g. Indiranagar, HSR Layout" />
        </Field>

        <Field label="Starting Price">
          <input name="startingPrice" defaultValue={item?.startingPrice || '₹299 onwards'} placeholder="e.g. ₹299 onwards" />
        </Field>

        <Field label="Experience">
          <input name="experience" defaultValue={item?.experience || '5+ yrs exp'} placeholder="e.g. 8+ yrs exp" />
        </Field>

        <Field label="Rating (1.0 - 5.0)">
          <input type="number" step="0.1" min="1" max="5" name="rating" defaultValue={item?.rating || 4.8} />
        </Field>

        <Field label="Phone Number">
          <input name="phone" defaultValue={item?.phone || '+91 98765 43210'} />
        </Field>

        <Field label="Email Address">
          <input type="email" name="email" defaultValue={item?.email || 'pro@urbanfindr.demo'} />
        </Field>
      </div>

      <Field label="Services Offered (comma-separated tags)">
        <input
          name="services"
          defaultValue={Array.isArray(item?.services) ? item.services.join(', ') : item?.services || 'Switchboard Repair, Fan Installation, MCB Replacement, Wiring'}
          placeholder="e.g. Fan Repair, Switchboard, Rewiring, Inverter Setup"
        />
      </Field>

      <Field label="Avatar Image URL">
        <input
          name="avatar"
          defaultValue={item?.avatar || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=400&q=80'}
          placeholder="https://images.unsplash.com/..."
        />
      </Field>

      <Field label="Bio / Experience Description">
        <textarea
          name="bio"
          rows={3}
          defaultValue={item?.bio || ''}
          placeholder="Brief professional background, certifications, and service warranties..."
        />
      </Field>

      <div className="flex gap-6 items-center">
        <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold">
          <input type="checkbox" name="verified" defaultChecked={item ? item.verified !== false : true} />
          <span>Verified Professional Badge</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold">
          <input type="checkbox" name="featured" defaultChecked={Boolean(item?.featured)} />
          <span>Featured on Home Page</span>
        </label>
      </div>

      <div className="flex gap-3 justify-end pt-4 border-t border-stone-100">
        <button type="button" className="btn-outline" onClick={onCancel}>Cancel</button>
        <Submit busy={busy}>{item ? 'Update Provider' : 'Save to Database'}</Submit>
      </div>
    </form>
  );
}
