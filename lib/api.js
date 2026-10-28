import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { db } from './db.js';
import { summarizeDiscovery } from './catalog.js';
import { User, Property, Project, Design, Thread, Message, Visit, Notification, Lead, Session, SavedSearch, ServiceProvider } from './models.js';
import { initialServiceProviders } from './serviceProviders.js';
import { currentUser, requireUser, publicUser, signIn, signOut, sameOrigin, throttle, fail } from './auth.js';
import { registerSchema, loginSchema, propertySchema, projectSchema, designSchema, leadSchema, messageSchema, estimateInterior } from './validation.js';
const json = (data, status=200) => NextResponse.json(data,{status});
const id = value => { if(!mongoose.isValidObjectId(value))fail('Invalid record ID.');return value; };
const eq = (a,b) => String(a)===String(b);
const pageInfo = q => ({page:Math.max(1,Math.min(10000,Number(q.get('page'))||1)),limit:Math.max(1,Math.min(50,Number(q.get('limit'))||12))});
const escapeRegex = value => value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
async function paginate(Model,filter,q,populate,sort={createdAt:-1}){const {page,limit}=pageInfo(q);let query=Model.find(filter).sort(sort).skip((page-1)*limit).limit(limit);if(populate)query=query.populate(populate);const [items,total]=await Promise.all([query.lean(),Model.countDocuments(filter)]);return {items,total,page,pages:Math.ceil(total/limit),limit};}
async function notify(user,title,body,link='/dashboard'){await Notification.create({user,title,body,link});}
async function body(req){if(req.parsedBody)return req.parsedBody;try{return await req.json();}catch{fail('Provide a valid JSON request body.');}}
async function record(Model,key){const item=await Model.findById(id(key));if(!item)fail('Record not found.',404);return item;}
const canManage = (user,owner) => user.role==='admin'||eq(user._id,owner);
async function target(body,user){
 if(Boolean(body.property)===Boolean(body.project))fail('Choose one property or builder project.');
 const item=body.property?await record(Property,body.property):await record(Project,body.project);
 if(item.status!=='approved')fail('This listing is not available.',404);
 const owner=item.owner||item.manager;if(eq(owner,user._id))fail('You cannot enquire about your own listing.');
 return {item,owner,ref:body.property?{property:item._id}:{project:item._id}};
}
async function dispatch(req,segments){
 const method=req.method;const q=new URL(req.url).searchParams;const [root,key,action]=segments;
 if(method!=='GET')sameOrigin(req);
 if(root==='health'&&method==='GET'){await db();return json({ok:true,database:'connected'});}
 if(root==='auth'){
  if(key==='me'&&method==='GET'){const user=await currentUser();return json({user:user?publicUser(user):null});}
  if(key==='become-owner'&&method==='POST'){const user=await requireUser();if(user.role==='user'){user.role='owner';await user.save();}return json({user:publicUser(user)});}
  if(key==='profile'&&method==='PATCH'){const user=await requireUser();const data=await body(req);if(typeof data.name==='string'&&data.name.trim())user.name=data.name.trim().slice(0,80);if(typeof data.phone==='string')user.phone=data.phone.trim().slice(0,20);if(typeof data.company==='string')user.company=data.company.trim().slice(0,120);if(typeof data.bio==='string')user.bio=data.bio.trim().slice(0,1000);if(typeof data.reraId==='string')user.reraId=data.reraId.trim().slice(0,60);if(typeof data.experience==='string')user.experience=data.experience.trim().slice(0,30);await user.save();return json({user:publicUser(user)});}
  if(key==='logout'&&method==='POST'){await signOut();return json({ok:true});}
  if(['register','login'].includes(key)&&method==='POST'){
   await db();const input=(key==='register'?registerSchema:loginSchema).parse(await body(req));
   await throttle(`auth:${input.email}`,12);let user;
   if(key==='register'){
    if(await User.exists({email:input.email}))fail('An account with this email already exists.',409);
    user=await User.create({...input,password:await bcrypt.hash(input.password,12)});
   }else{user=await User.findOne({email:input.email}).select('+password');if(!user||!user.active||!await bcrypt.compare(input.password,user.password))fail('Invalid email or password.',401);}
   await signIn(user);return json({user:publicUser(user)},key==='register'?201:200);
  }
 }
 await db();
 if(root==='discovery'&&method==='GET'){
  const [propertyGroups, projectGroups, featured] = await Promise.all([
   Property.aggregate([{$match:{status:'approved'}},{$group:{_id:{city:'$city',purpose:'$purpose'},count:{$sum:1}}}]),
   Project.aggregate([{$match:{status:'approved'}},{$group:{_id:'$city',count:{$sum:1}}}]),
   Property.countDocuments({status:'approved',featured:true})
  ]);
  return json(summarizeDiscovery(propertyGroups,projectGroups,featured));
 }
 if(root==='properties'){
  if(!key&&method==='GET'){
   let filter={status:'approved'};
   if(q.get('mine')==='true'){const user=await requireUser(['owner','admin']);filter={owner:user._id};}
   if(q.get('favorites')==='true'){const user=await requireUser();filter._id={$in:user.favorites};}
   if(q.get('ids'))filter._id={$in:q.get('ids').split(',').slice(0,4).map(id)};
   for(const field of ['purpose','preferredTenant'])if(q.get(field))filter[field]=q.get(field).slice(0,100);
   if(q.get('city'))filter.city=new RegExp(`^${escapeRegex(q.get('city').trim())}$`,'i');
   if(q.get('type')){
     const t = q.get('type');
     if(t === 'Plot' || t === 'Land' || t === 'Land / Plot') filter.type = { $in: ['Plot', 'Land'] };
     else if(t === 'Gated community') filter.$or = [{ amenities: { $in: ['Security', 'Clubhouse'] } }, { title: /gated/i }, { description: /gated/i }];
     else if(t === 'Commercial') filter.type = { $in: ['Office', 'Shop', 'Warehouse'] };
     else filter.type = t.slice(0,100);
   }
   if(q.get('furnishing')){
     const f = q.get('furnishing').toLowerCase();
     if(f.includes('semi')) filter.furnishing = 'Semi-furnished';
     else if(f.includes('full')) filter.furnishing = 'Fully furnished';
     else if(f.includes('un')) filter.furnishing = 'Unfurnished';
     else filter.furnishing = q.get('furnishing');
   }
   if(q.get('ownership')) filter.ownership = q.get('ownership').toLowerCase();
   if(q.get('propertyAge')) filter.propertyAge = q.get('propertyAge');
   const propStatus = q.get('propertyStatus') || q.get('stage') || q.get('availability');
   if(propStatus){
     if(propStatus.toLowerCase().includes('ready')) filter.availableFrom = { $lte: new Date() };
     else if(propStatus.toLowerCase().includes('under') || propStatus.toLowerCase().includes('launch')) filter.availableFrom = { $gt: new Date() };
   }
   if(q.get('featured')==='true')filter.featured=true;
   if(q.get('verified')==='true')filter.verified=true;
   if(['sale','lease'].includes(q.get('transaction')))filter.transaction=q.get('transaction');
   if(['Private room','2 sharing','3 sharing','4+ sharing'].includes(q.get('sharing')))filter.sharing=q.get('sharing');
   if(q.get('mealsIncluded')==='true')filter.mealsIncluded=true;
   if(q.get('availableBeds')==='true')filter.availableBeds={$gte:1};
   if(q.get('localities')){const locList=q.get('localities').split(',').map(l=>l.trim()).filter(Boolean);if(locList.length)filter.locality={$in:locList.map(l=>new RegExp(`^${escapeRegex(l)}$`,'i'))};}
   const search=q.get('q')?.trim().slice(0,100);if(search){const terms=search.split(',').map(s=>s.trim()).filter(Boolean);filter.$or=terms.flatMap(term=>{const exp=new RegExp(escapeRegex(term),'i');const conds=[{title:exp},{locality:exp},{city:exp},{description:exp}];const bhkMatch=term.match(/\b([1-5])\s*bhk\b/i)||term.match(/^([1-5])\s*bhk$/i);if(bhkMatch)conds.push({bedrooms:Number(bhkMatch[1])});return conds;});}
   for(const [field,min,max] of [['price','minPrice','maxPrice'],['area','minArea','maxArea']]){const range={};if(q.get(min)&&Number.isFinite(Number(q.get(min))))range.$gte=Number(q.get(min));if(q.get(max)&&Number.isFinite(Number(q.get(max))))range.$lte=Number(q.get(max));if(Object.keys(range).length)filter[field]=range;}
   if(q.get('bedrooms')){
     const b = String(q.get('bedrooms')).trim();
     if(b.includes('+') || Number(b) >= 4) filter.bedrooms = { $gte: 4 };
     else if(b.includes(',')) filter.bedrooms = { $in: b.split(',').map(Number) };
     else filter.bedrooms = Number(b);
   }
   if(q.get('parking')==='true')filter.parking=true;
   if(q.get('amenities'))filter.amenities={$all:q.get('amenities').split(',').slice(0,20)};
   const sortMap = { 'price-asc': { price: 1 }, 'price-desc': { price: -1 }, 'area-desc': { area: -1 }, 'newest': { createdAt: -1 }, 'recommended': { featured: -1, verified: -1, createdAt: -1 } };
   const sort = sortMap[q.get('sort')] || (q.get('sort') === 'recommended' ? { featured: -1, verified: -1, createdAt: -1 } : { createdAt: -1 });
   return json(await paginate(Property,filter,q,{path:'owner',select:'name'},sort));
  }
  if(!key&&method==='POST'){const user=await requireUser(['owner','admin']);await throttle(`post:${user._id}`,30);const input=propertySchema.parse(await body(req));const item=await Property.create({...input,owner:user._id,status:user.role==='admin'?'approved':'pending'});for(const admin of await User.find({role:'admin',active:true}))await notify(admin._id,'Listing awaiting review',input.title,'/admin');return json(item,201);}
  if(key&&method==='GET'){
   const item=await record(Property,key);const user=await currentUser();if(item.status!=='approved'&&(!user||!canManage(user,item.owner)))fail('Property not found.',404);
   const result=item.toObject();const owner=await User.findById(item.owner).select('name');result.owner=owner;return json(result);
  }
  if(key&&method==='PATCH'){const user=await requireUser(['owner','admin']);const item=await record(Property,key);if(!canManage(user,item.owner))fail('You cannot edit this listing.',403);const input=propertySchema.parse(await body(req));Object.assign(item,input);if(user.role!=='admin'){item.status='pending';item.verified=false;item.featured=false;}await item.save();return json(item);}
  if(key&&method==='DELETE'){const user=await requireUser(['owner','admin']);const item=await record(Property,key);if(!canManage(user,item.owner))fail('You cannot archive this listing.',403);item.status='archived';item.featured=false;await item.save();return json({ok:true});}
  if(key&&action==='promote'&&method==='POST'){const user=await requireUser(['owner','admin']);const item=await record(Property,key);if(!canManage(user,item.owner))fail('Unauthorized',403);if(item.status!=='approved')fail('Only approved listings can be promoted.',400);item.featured=!item.featured;await item.save();return json({featured:item.featured});}
 }
 if(root==='favorites'&&key&&method==='POST'){
  const user=await requireUser();const property=await record(Property,key);if(property.status!=='approved')fail('Property unavailable.',404);
  const saved=user.favorites.some(v=>eq(v,key));await User.updateOne({_id:user._id},saved?{$pull:{favorites:key}}:{$addToSet:{favorites:key}});return json({saved:!saved});
 }
 if(root==='contact'&&key&&method==='GET'){
  const user=await requireUser();await throttle(`contact:${user._id}`,40);const property=await record(Property,key);if(property.status!=='approved')fail('Property unavailable.',404);const owner=await User.findById(property.owner).select('name phone');return json(owner);
 }
 if(root==='projects'){
  if(!key&&method==='GET'){
   if(q.get('mine')==='true'){
    const user=await requireUser();
    const filter=user.role==='admin'?{}:{ $or:[{manager:user._id},{builder:new RegExp(escapeRegex(user.company||user.name),'i')}] };
    return json(await paginate(Project,filter,q,null,{createdAt:-1}));
   }
   const filter={status:'approved'};
   if(q.get('stage'))filter.stage=q.get('stage');
   if(q.get('city'))filter.city=new RegExp(`^${escapeRegex(q.get('city').trim())}$`,'i');
   if(q.get('locality'))filter.locality=new RegExp(escapeRegex(q.get('locality').trim()),'i');
   if(q.get('featured')==='true')filter.featured=true;
   const stageVal = q.get('propertyStatus') || q.get('stage');
   if(stageVal) filter.stage = stageVal;
   if(q.get('minPrice'))filter.price={...(filter.price||{}),$gte:Number(q.get('minPrice'))||0};
   if(q.get('maxPrice'))filter.price={...(filter.price||{}),$lte:Number(q.get('maxPrice'))||1e12};
   if(q.get('bedrooms')){
     const bedNum = String(q.get('bedrooms')).replace(/[^0-9]/g, '');
     if(bedNum) filter['configurations.name'] = new RegExp(`${bedNum}\\s*BHK`, 'i');
   }
   if(q.get('q'))filter.$or=[{title:new RegExp(escapeRegex(q.get('q').slice(0,100)),'i')},{locality:new RegExp(escapeRegex(q.get('q').slice(0,100)),'i')},{builder:new RegExp(escapeRegex(q.get('q').slice(0,100)),'i')}];
   const sort = q.get('sort')==='price-asc'?{price:1}:q.get('sort')==='price-desc'?{price:-1}:{createdAt:-1};
   return json(await paginate(Project,filter,q,null,sort));
  }
  if(!key&&method==='POST'){
   const user=await requireUser();
   if(!['builder','admin'].includes(user.role))fail('Only registered builders and administrators can publish projects.',403);
   const input=projectSchema.parse(await body(req));
   const project=await Project.create({
     ...input,
     manager:user._id,
     builder:input.builder||user.company||user.name,
     status:user.role==='admin'?'approved':'pending'
   });
   return json(project,201);
  }
  if(key&&action==='brochure'&&method==='GET'){
   const project=await record(Project,key);if(project.status!=='approved')fail('Project unavailable.',404);
   const text=[`URBANFINDR | ${project.title}`,`Demo project information sheet`,`${project.builder} • ${project.locality}, ${project.city}`,`RERA reference (demo): ${project.rera}`,`Possession: ${project.possession}`,project.description,'',...project.configurations.map(v=>`${v.name} | ${v.area} sq ft | INR ${v.price.toLocaleString('en-IN')}`),'',`Amenities: ${project.amenities.join(', ')}`,'All listings, builders, prices and RERA references in the demo are fictional. Verify official records before a real purchase.'].join('\n');
   return new NextResponse(text,{headers:{'Content-Type':'text/plain; charset=utf-8','Content-Disposition':`attachment; filename="urbanfindr-project-${project._id}.txt"`}});
  }
  if(key&&action==='promote'&&method==='POST'){
   const user=await requireUser();
   const project=await record(Project,key);
   if(user.role!=='admin'&&String(project.manager)!==String(user._id))fail('Permission denied.',403);
   project.featured=!project.featured;
   await project.save();
   return json({featured:project.featured});
  }
  if(key&&method==='PATCH'){
   const user=await requireUser();
   const project=await record(Project,key);
   if(user.role!=='admin'&&String(project.manager)!==String(user._id))fail('Permission denied.',403);
   const data=await body(req);
   if(data.status&&user.role!=='admin')delete data.status;
   if(data.featured!==undefined&&user.role!=='admin')delete data.featured;
   const parsed=projectSchema.partial().parse(data);
   Object.assign(project,parsed);
   await project.save();
   return json(project);
  }
  if(key&&method==='DELETE'){
   const user=await requireUser();
   const project=await record(Project,key);
   if(user.role!=='admin'&&String(project.manager)!==String(user._id))fail('Permission denied.',403);
   project.status='archived';
   await project.save();
   return json({success:true,status:'archived'});
  }
  if(key&&method==='GET'){const item=await record(Project,key);const user=await currentUser();if(item.status!=='approved'&&user?.role!=='admin'&&String(item.manager)!==String(user?._id))fail('Project not found.',404);return json(item);}
 }
 if(root==='professionals'||root==='service-providers'){
  if(method==='GET'&&!key){
   let filter={};
   if(q.get('featured')==='true')filter.featured=true;
   if(q.get('category'))filter.categorySlug=q.get('category');
   if(q.get('city'))filter.city=new RegExp(`^${escapeRegex(q.get('city').trim())}$`,'i');
   if(q.get('q')){
     const regex=new RegExp(escapeRegex(q.get('q').trim()),'i');
     filter['$or']=[{name:regex},{specialist:regex},{category:regex},{services:regex},{locality:regex}];
   }
   let items=[];try{items=await ServiceProvider.find(filter).lean();}catch(e){}
   if(!items||items.length===0){
    items=[...initialServiceProviders];
    if(q.get('featured')==='true')items=items.filter(p=>p.featured);
    if(q.get('category'))items=items.filter(p=>p.categorySlug===q.get('category'));
    if(q.get('city'))items=items.filter(p=>p.city.toLowerCase()===q.get('city').trim().toLowerCase());
    if(q.get('q')){
      const needle=q.get('q').trim().toLowerCase();
      items=items.filter(p=>
        p.name.toLowerCase().includes(needle)||
        (p.specialist&&p.specialist.toLowerCase().includes(needle))||
        p.category.toLowerCase().includes(needle)||
        (p.services&&p.services.some(s=>s.toLowerCase().includes(needle)))
      );
    }
   }
   const limit=Number(q.get('limit'))||items.length;
   return json({items:items.slice(0,limit),total:items.length});
  }
  if(key==='enquiry'&&method==='POST'){
   const data=await body(req);
   return json({ok:true,message:'Enquiry received. The professional will contact you shortly.',enquiry:data});
  }
  if(method==='POST'&&!key){
    const user=await requireUser(['admin']);
    const data=await body(req);
    if(!data.name||!data.category)fail('Name and category are required.',400);
    const item=await ServiceProvider.create({
      name:data.name,
      specialist:data.specialist||data.category,
      category:data.category,
      categorySlug:data.categorySlug||data.category.toLowerCase().replace(/[^a-z0-9]+/g,'-'),
      city:data.city||'Bengaluru',
      locality:data.locality||'',
      rating:Number(data.rating)||4.8,
      reviewsCount:Number(data.reviewsCount)||50,
      avatar:data.avatar||'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=400&q=80',
      experience:data.experience||'5+ yrs exp',
      badge:data.badge||'Verified Pro',
      verified:data.verified!==false,
      featured:Boolean(data.featured),
      startingPrice:data.startingPrice||'₹299 onwards',
      services:Array.isArray(data.services)?data.services:typeof data.services==='string'?data.services.split(',').map(s=>s.trim()).filter(Boolean):[],
      phone:data.phone||'+91 98000 00000',
      email:data.email||'pro@urbanfindr.demo',
      bio:data.bio||''
    });
    return json(item,201);
  }
  if(method==='PATCH'&&key){
    const user=await requireUser(['admin']);
    const data=await body(req);
    if(data.services&&typeof data.services==='string')data.services=data.services.split(',').map(s=>s.trim()).filter(Boolean);
    const item=await ServiceProvider.findByIdAndUpdate(key,data,{new:true});
    if(!item)fail('Service provider not found.',404);
    return json(item);
  }
  if(method==='DELETE'&&key){
    const user=await requireUser(['admin']);
    const item=await ServiceProvider.findByIdAndDelete(key);
    if(!item)fail('Service provider not found.',404);
    return json({success:true,message:'Service provider deleted.'});
  }
 }
  if(root==='designs'&&method==='GET'){
  if(key)return json(await record(Design,key));const filter={};for(const field of ['category','style'])if(q.get(field))filter[field]=q.get(field);return json(await paginate(Design,filter,q));
 }
 if(root==='estimate'&&method==='POST'){
  const input=await body(req);if(!['1 BHK','2 BHK','3 BHK','4+ BHK'].includes(input.homeSize)||!['Full home','Kitchen','Bedroom','Living room','Wardrobe'].includes(input.service)||!['Essential','Premium','Luxe'].includes(input.finish))fail('Invalid estimate options.');return json({estimate:estimateInterior(input.homeSize,input.service,input.finish),homeSize:input.homeSize,service:input.service,finish:input.finish,disclaimer:'Indicative demo estimate; final quote follows a site measurement and material selection.'});
 }
 if(root==='leads'){
  const user=await requireUser();
  if(method==='GET'&&!key)return json(await paginate(Lead,user.role==='admin'?{}:user.role==='owner'?{$or:[{user:user._id},{manager:user._id}]}:{user:user._id},q,[{path:'project',select:'title'},{path:'design',select:'title'}]));
  if(method==='POST'&&!key){await throttle(`lead:${user._id}`,20);const input=leadSchema.parse(await body(req));if(input.preferredAt&&new Date(input.preferredAt)<=new Date())fail('Choose a future consultation time.');let manager;
   if(input.kind==='project'){if(!input.project)fail('Project is required.');const p=await record(Project,input.project);if(p.status!=='approved')fail('Project unavailable.',404);manager=p.manager;}
   else{if(input.design)await record(Design,input.design);manager=(await User.findOne({role:'admin',active:true}))?._id;if(!manager)fail('No interior coordinator available.',503);}
   const item=await Lead.create({...input,project:input.kind==='project'?input.project:undefined,design:input.kind==='interior'?input.design:undefined,user:user._id,manager,estimate:input.kind==='interior'?estimateInterior(input.homeSize,input.service,input.finish):undefined});await notify(manager,`New ${input.kind} enquiry`,`${user.name} requested a consultation.`,'/dashboard/leads');await notify(user._id,'Your enquiry is received','Track the response in your dashboard.','/dashboard/leads');return json(item,201);
  }
  if(method==='PATCH'&&key){const item=await record(Lead,key);if(!canManage(user,item.manager))fail('Only the assigned manager can update this enquiry.',403);const {status,note}=await body(req);if(!['new','contacted','consultation','design','execution','completed','closed'].includes(status))fail('Invalid enquiry status.');item.status=status;if(typeof note==='string')item.note=note.slice(0,2000);await item.save();await notify(item.user,'Enquiry updated',`Your ${item.kind} enquiry is now ${status}.`,'/dashboard/leads');return json(item);}
 }
 if(root==='threads'){
  const user=await requireUser();
  if(!key&&method==='GET')return json(await paginate(Thread,{participants:user._id},q,[{path:'participants',select:'name'},{path:'property',select:'title'},{path:'project',select:'title'}],{updatedAt:-1}));
  if(!key&&method==='POST'){await throttle(`thread:${user._id}`,40);const data=await body(req);const {item,owner,ref}=await target(data,user);let thread=await Thread.findOne({...ref,participants:{$all:[user._id,owner]}});if(!thread)thread=await Thread.create({...ref,participants:[user._id,owner],subject:item.title});return json(thread,201);}
  if(key){const thread=await record(Thread,key);if(!thread.participants.some(p=>eq(p,user._id)))fail('This conversation is private.',403);
   if(action==='messages'&&method==='GET'){await Message.updateMany({thread:key,readBy:{$ne:user._id}},{$addToSet:{readBy:user._id}});return json(await paginate(Message,{thread:key},q,{path:'sender',select:'name'},{createdAt:-1}));}
   if(action==='messages'&&method==='POST'){await throttle(`message:${user._id}`,80,60000);const data=messageSchema.parse(await body(req));const message=await Message.create({...data,thread:key,sender:user._id,readBy:[user._id]});await Thread.updateOne({_id:key},{$set:{updatedAt:new Date()}});for(const p of thread.participants)if(!eq(p,user._id))await notify(p,'New message',`${user.name}: ${data.text.slice(0,100)}`,`/dashboard/messages?thread=${key}`);return json(message,201);}
  }
 }
 if(root==='visits'){
  const user=await requireUser();
  if(!key&&method==='GET')return json(await paginate(Visit,user.role==='admin'?{}:{$or:[{user:user._id},{owner:user._id}]},q,[{path:'property',select:'title'},{path:'project',select:'title'},{path:'user',select:'name'},{path:'owner',select:'name'}],{scheduledAt:1}));
  if(!key&&method==='POST'){await throttle(`visit:${user._id}`,20);const data=await body(req);const {owner,ref}=await target(data,user);const scheduledAt=new Date(data.scheduledAt);if(Number.isNaN(+scheduledAt)||scheduledAt<=new Date()||scheduledAt>new Date(Date.now()+90*864e5))fail('Choose a visit within the next 90 days.');const duplicate=await Visit.exists({...ref,user:user._id,status:{$in:['requested','confirmed']}});if(duplicate)fail('You already have an active visit for this listing.',409);const item=await Visit.create({...ref,user:user._id,owner,scheduledAt,note:typeof data.note==='string'?data.note.slice(0,1000):''});await notify(owner,'New site visit request',`${user.name} requested a visit.`,'/dashboard/visits');return json(item,201);}
  if(key&&method==='PATCH'){const item=await record(Visit,key);const {status}=await body(req);const manager=canManage(user,item.owner);if(!manager&&!eq(item.user,user._id))fail('This visit is private.',403);if(!['requested','confirmed'].includes(item.status))fail('This visit has already ended.',409);if(!['confirmed','completed','cancelled'].includes(status)||(!manager&&status!=='cancelled'))fail('Invalid visit update.',403);if(status==='completed'&&item.status!=='confirmed')fail('Confirm the visit first.');item.status=status;await item.save();await notify(eq(item.user,user._id)?item.owner:item.user,'Site visit updated',`Your visit is ${status}.`,'/dashboard/visits');return json(item);}
 }
 if(root==='notifications'){
  const user=await requireUser();if(method==='GET')return json({...await paginate(Notification,{user:user._id},q),unread:await Notification.countDocuments({user:user._id,read:false})});
  if(method==='PATCH'){await Notification.updateMany(key?{_id:id(key),user:user._id}:{user:user._id},{$set:{read:true}});return json({ok:true});}
 }
 if(root==='uploads'&&method==='POST'){
  const user=await requireUser(['owner','admin']);await throttle(`upload:${user._id}`,60);const contentLength=Number(req.headers.get('content-length'));if(!contentLength||contentLength>6*1024*1024)fail('Upload one image up to 5 MB.',413);
  const form=await req.formData();const file=form.get('file');if(!file||typeof file==='string'||file.size>5*1024*1024||file.size<12)fail('Choose a JPEG, PNG or WebP image, up to 5 MB.');
  const bytes=Buffer.from(await file.arrayBuffer());let ext;if(bytes[0]===0xff&&bytes[1]===0xd8&&bytes[2]===0xff)ext='jpg';else if(bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))ext='png';else if(bytes.toString('ascii',0,4)==='RIFF'&&bytes.toString('ascii',8,12)==='WEBP')ext='webp';else fail('Image file signature is invalid.');
  const name=`${randomUUID()}.${ext}`;const directory=path.join(process.cwd(),'storage','uploads');await mkdir(directory,{recursive:true});await writeFile(path.join(directory,name),bytes,{flag:'wx'});return json({url:`/uploads/${name}`},201);
 }
 if(root==='dashboard'&&method==='GET'){
  const user=await requireUser();const filter=user.role==='admin'?{}:{owner:user._id};return json({properties:await Property.countDocuments(filter),pending:await Property.countDocuments({...filter,status:'pending'}),favorites:user.favorites.length,visits:await Visit.countDocuments({$or:[{user:user._id},{owner:user._id}],status:{$in:['requested','confirmed']}}),enquiries:await Lead.countDocuments(user.role==='admin'?{}:{$or:[{user:user._id},{manager:user._id}]}),messages:await Thread.countDocuments({participants:user._id}),savedSearches:await SavedSearch.countDocuments({user:user._id})});
 }
  if(root==='saved-searches'){
   const user=await requireUser();
   if(method==='GET'&&!key){const items=await SavedSearch.find({user:user._id}).sort({createdAt:-1});return json({items,total:items.length});}
   if(method==='POST'&&!key){
     const data=await body(req);if(!data.title)fail('Provide a name for this saved search.',400);
     const item=await SavedSearch.create({user:user._id,title:data.title.slice(0,100),city:data.city,purpose:data.purpose,query:data.query,filters:data.filters||{},alertEnabled:true});
     await Notification.create({user:user._id,title:'Saved search alert active',body:`We will alert you whenever new properties matching "${data.title}" are listed.`,link:`/properties?${new URLSearchParams(data.filters||{}).toString()}`});
     return json({ok:true,item},201);
   }
   if(method==='DELETE'&&key){await SavedSearch.findOneAndDelete({_id:key,user:user._id});return json({ok:true});}
   if(method==='PATCH'&&key&&action==='alert'){const item=await SavedSearch.findOne({_id:key,user:user._id});if(!item)fail('Not found',404);item.alertEnabled=!item.alertEnabled;await item.save();return json({ok:true,alertEnabled:item.alertEnabled});}
  }
 if(root==='admin'){
  const user=await requireUser(['admin']);
  if(key==='stats'&&method==='GET')return json({users:await User.countDocuments(),properties:await Property.countDocuments(),pending:await Property.countDocuments({status:'pending'}),projects:await Project.countDocuments(),leads:await Lead.countDocuments(),designs:await Design.countDocuments(),services:await ServiceProvider.countDocuments()});
  if(key==='users'){
   if(method==='GET')return json(await paginate(User,{},q,null));
   if(method==='PATCH'&&action){const item=await record(User,action);if(eq(item._id,user._id))fail('You cannot change your own administrative access.');const data=await body(req);if(data.role!==undefined){if(!['user','owner','admin'].includes(data.role))fail('Invalid role.');if(data.role==='user'&&await Property.exists({owner:item._id,status:{$ne:'archived'}}))fail('Archive this owner’s listings before changing them to a user.');item.role=data.role;}if(typeof data.active==='boolean')item.active=data.active;await item.save();await Session.deleteMany({user:item._id});return json(publicUser(item));}
  }
  if(['properties','projects','designs'].includes(key)){
   const Model={properties:Property,projects:Project,designs:Design}[key];
   if(method==='GET')return json(await paginate(Model,q.get('status')?{status:q.get('status')}:{},q));
   if(method==='POST'&&key==='projects'){const input=projectSchema.parse(await body(req));return json(await Project.create({...input,manager:user._id,status:'approved'}),201);}
   if(method==='POST'&&key==='designs')return json(await Design.create(designSchema.parse(await body(req))),201);
   if(method==='PATCH'&&action){const item=await record(Model,action);const data=await body(req);
    if(key==='properties'&&typeof data.featured==='boolean'){
     if(data.featured&&item.status!=='approved')fail('Approve a listing before featuring it.');
     item.featured=data.featured;
    }else if(data.status!==undefined&&key!=='designs'){if(!['approved','rejected','archived','pending'].includes(data.status))fail('Invalid status.');item.status=data.status;if(key==='properties'){item.verified=data.status==='approved';if(data.status!=='approved')item.featured=false;}}
    else if(key==='projects')Object.assign(item,projectSchema.parse(data));else if(key==='designs')Object.assign(item,designSchema.parse(data));else fail('Use the property editor to update listing fields.');
    await item.save();if(item.owner)await notify(item.owner,'Property review updated',`${item.title}: ${item.status}`,'/dashboard/properties');return json(item);
   }
   if(method==='DELETE'&&action){const item=await record(Model,action);if(key==='designs')await Design.deleteOne({_id:item._id});else{item.status='archived';if(key==='properties')item.featured=false;await item.save();}return json({ok:true});}
  }
 }
 fail('API endpoint not found.',404);
}
export async function handle(req,context){try{const params=await context.params;return await dispatch(req,params.path||[]);}catch(error){
 if(error.name==='ZodError')return json({error:'Please check the form fields.',details:error.issues.map(v=>`${v.path.join('.')}: ${v.message}`)},422);
 if(error.code===11000)return json({error:'This record already exists. Please try again.'},409);
 if(error.name==='CastError')return json({error:'Invalid record ID.'},400);
 if(error.name==='MongooseServerSelectionError'||error.name==='MongoServerSelectionError'||error.code==='ECONNREFUSED'||error.syscall==='querySrv')return json({error:'MongoDB is unavailable. Please check your network connection and MONGODB_URI.'},503);
 if(!error.status)console.error(error);return json({error:error.status?error.message:'An unexpected server error occurred.'},error.status||500);
}}
