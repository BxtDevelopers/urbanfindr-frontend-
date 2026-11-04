import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { db } from './db.js';
import { summarizeDiscovery } from './catalog.js';
import { User, Property, Project, Design, Thread, Message, Visit, Notification, Lead, Session, SavedSearch, ServiceProvider, ChannelPartner, SupportTicket, ServiceRequest } from './models.js';
import { initialServiceProviders } from './serviceProviders.js';
import { sampleInteriorProject } from './interiorData.js';
import { currentUser, requireUser, publicUser, signIn, signOut, sameOrigin, throttle, fail } from './auth.js';
import { registerSchema, loginSchema, propertySchema, projectSchema, designSchema, leadSchema, messageSchema, estimateInterior } from './validation.js';
const json = (data, status=200) => NextResponse.json(data,{status});
const id = value => { if(!mongoose.isValidObjectId(value))fail('Invalid record ID.');return value; };
const eq = (a,b) => String(a)===String(b);
const pageInfo = q => ({page:Math.max(1,Math.min(10000,Number(q.get('page'))||1)),limit:Math.max(1,Math.min(50,Number(q.get('limit'))||12))});
const escapeRegex = value => value.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
async function paginate(Model,filter,q,populate,sort={createdAt:-1}){const {page,limit}=pageInfo(q);let query=Model.find(filter).sort(sort).skip((page-1)*limit).limit(limit);if(populate)query=query.populate(populate);const [items,total]=await Promise.all([query.lean(),Model.countDocuments(filter)]);return {items,total,page,pages:Math.ceil(total/limit),limit};}
async function notify(user,title,body,link='/dashboard'){await Notification.create({user,title,body,link});}
async function body(req){try{return await req.json();}catch{fail('Provide a valid JSON request body.');}}
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
  if(key==='profile'&&method==='PATCH'){const user=await requireUser();const data=await body(req);if(typeof data.name==='string'&&data.name.trim())user.name=data.name.trim().slice(0,80);if(typeof data.phone==='string')user.phone=data.phone.trim().slice(0,20);if(typeof data.company==='string')user.company=data.company.trim().slice(0,120);if(typeof data.bio==='string')user.bio=data.bio.trim().slice(0,1000);if(typeof data.reraId==='string')user.reraId=data.reraId.trim().slice(0,60);if(typeof data.experience==='string')user.experience=data.experience.trim().slice(0,30);if(typeof data.serviceCategory==='string')user.serviceCategory=data.serviceCategory.trim().slice(0,80);await user.save();return json({user:publicUser(user)});}
  if(key==='password'&&method==='POST'){
    const user=await requireUser();
    const data=await body(req);
    // TODO: In future, integrate SMS / Email OTP verification flow before confirming password reset.
    if(!data.newPassword||data.newPassword.length<8)fail('Password must be at least 8 characters long.');
    const fullUser=await User.findById(user._id).select('+password');
    if(data.currentPassword&&!await bcrypt.compare(data.currentPassword,fullUser.password))fail('Current password does not match.');
    fullUser.password=await bcrypt.hash(data.newPassword,12);
    await fullUser.save();
    return json({ok:true,message:'Password updated successfully.'});
  }
  if(key==='logout'&&method==='POST'){await signOut();return json({ok:true});}
  if(['register','login'].includes(key)&&method==='POST'){
   await db();const input=(key==='register'?registerSchema:loginSchema).parse(await body(req));
   await throttle(`auth:${input.email}`,12);let user;
   if(key==='register'){
    if(await User.exists({email:input.email}))fail('An account with this email already exists.',409);
    user=await User.create({...input,password:await bcrypt.hash(input.password,12)});
    if(user.role==='channel_partner'){
      await ChannelPartner.findOneAndUpdate(
        { user: user._id },
        {
          $setOnInsert: {
            user: user._id,
            company: user.company || 'Channel Partner Network',
            reraId: user.reraId || 'PENDING-RERA',
            phone: user.phone || '',
            email: user.email,
            city: 'Bengaluru',
            tier: 'Gold',
            team: []
          }
        },
        { upsert: true, new: true }
      );
    }
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
  if(key==='meta'&&method==='GET'){
   return json({
    purposes: [
     { value: 'buy', label: 'Buy', description: 'Properties available for sale' },
     { value: 'rent', label: 'Rent', description: 'Properties available for lease or rent' },
     { value: 'pg', label: 'PG / Co-living', description: 'Paying guest and shared spaces' },
     { value: 'commercial', label: 'Commercial', description: 'Offices, retail shops, and warehouses' }
    ],
    categoriesByPurpose: {
     buy: ['Apartment', 'Villa', 'Independent house', 'Plot'],
     rent: ['Apartment', 'Villa', 'Independent house'],
     pg: ['PG'],
     commercial: ['Office', 'Shop', 'Warehouse']
    },
    allCategories: ['Apartment', 'Villa', 'Independent house', 'Plot', 'PG', 'Office', 'Shop', 'Warehouse'],
    furnishingOptions: ['Unfurnished', 'Semi-furnished', 'Fully furnished'],
    ownershipOptions: ['owner', 'broker', 'builder'],
    propertyAgeOptions: ['Newly built', 'Resale', 'Older property'],
    publicationStatuses: ['pending', 'approved', 'rejected', 'archived'],
    sharingOptions: ['Private room', '2 sharing', '3 sharing', '4+ sharing'],
    transactionOptions: ['sale', 'lease'],
    amenitiesList: ['Lift', 'Power backup', 'Covered parking', '24/7 water supply', 'Gated security', 'Clubhouse', 'Gym', 'Swimming pool', 'Park / Garden', 'Gas pipeline', 'Rainwater harvesting', 'Intercom', 'CCTV surveillance', 'Fire fighting system', 'Waste disposal', 'Wi-Fi included', 'Housekeeping', 'Cafeteria'],
    cities: ['Bengaluru', 'Mumbai', 'Pune', 'Hyderabad', 'Chennai', 'Delhi', 'Gurugram', 'Delhi NCR']
   });
  }
  if(!key&&method==='GET'){
   let filter={status:'approved'};
   if(q.get('mine')==='true'){const user=await requireUser(['owner','broker','builder','channel_partner','admin']);filter={owner:user._id};}
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
  if(!key&&method==='POST'){const user=await requireUser(['user','owner','broker','builder','channel_partner','admin']);await throttle(`post:${user._id}`,30);const input=propertySchema.parse(await body(req));if(user.role==='user'){user.role=input.ownership==='broker'?'broker':input.ownership==='channel_partner'?'channel_partner':input.ownership==='builder'?'builder':'owner';await user.save();}const item=await Property.create({...input,owner:user._id,status:(user.role==='admin'||user.role==='channel_partner')?'approved':'pending'});for(const admin of await User.find({role:'admin',active:true}))await notify(admin._id,'Listing awaiting review',input.title,`/admin?tab=properties&filter=pending&propertyId=${item._id}`);return json(item,201);}
  if(key&&method==='GET'){
   const item=await record(Property,key);const user=await currentUser();if(item.status!=='approved'&&(!user||!canManage(user,item.owner)))fail('Property not found.',404);
   const result=item.toObject();const owner=await User.findById(item.owner).select('name');result.owner=owner;return json(result);
  }
  if(key&&method==='PATCH'){const user=await requireUser(['owner','broker','builder','channel_partner','admin']);const item=await record(Property,key);if(!canManage(user,item.owner))fail('You cannot edit this listing.',403);const input=propertySchema.parse(await body(req));Object.assign(item,input);if(user.role!=='admin'){item.status='pending';item.verified=false;item.featured=false;}await item.save();return json(item);}
  if(key&&method==='DELETE'){const user=await requireUser(['owner','broker','builder','channel_partner','admin']);const item=await record(Property,key);if(!canManage(user,item.owner))fail('You cannot archive this listing.',403);item.status='archived';item.featured=false;await item.save();return json({ok:true});}
  if(key&&action==='promote'&&method==='POST'){const user=await requireUser(['owner','broker','builder','channel_partner','admin']);const item=await record(Property,key);if(!canManage(user,item.owner))fail('Unauthorized',403);if(item.status!=='approved')fail('Only approved listings can be promoted.',400);item.featured=!item.featured;await item.save();return json({featured:item.featured});}
 }
 if(root==='favorites'&&key&&method==='POST'){
  const user=await requireUser();const property=await record(Property,key);if(property.status!=='approved')fail('Property unavailable.',404);
  const saved=user.favorites.some(v=>eq(v,key));await User.updateOne({_id:user._id},saved?{$pull:{favorites:key}}:{$addToSet:{favorites:key}});return json({saved:!saved});
 }
 if(root==='contact'&&key&&method==='GET'){
  const user=await requireUser();await throttle(`contact:${user._id}`,40);const property=await record(Property,key);if(property.status!=='approved')fail('Property unavailable.',404);const owner=await User.findById(property.owner).select('name phone');
  if(!eq(user._id, property.owner)){
    const recentLead = await Lead.findOne({
      user: user._id,
      property: property._id,
      source: 'phone',
      createdAt: { $gte: new Date(Date.now() - 6 * 60 * 60 * 1000) }
    });
    if(!recentLead){
      await Lead.create({
        user: user._id,
        manager: property.owner,
        property: property._id,
        source: 'phone',
        kind: 'property',
        name: user.name || 'Interested Buyer',
        phone: user.phone || 'Phone Contact Requested',
        email: user.email || '',
        city: property.city || 'Hyderabad',
        status: 'uncontacted',
        note: `Buyer clicked "Contact owner" to call regarding ${property.title}.`,
        notes: [{ author: 'System', text: `Buyer revealed contact phone on ${new Date().toLocaleDateString('en-IN')}`, createdAt: new Date() }]
      });
      await notify(property.owner, 'New Phone Call Lead', `${user.name} viewed your contact number for ${property.title}.`, '/dashboard/leads');
    }
  }
  return json(owner);
 }
 if(root==='projects'){
  if(!key&&method==='GET'){
   const filter={status:'approved'};
   if(q.get('stage'))filter.stage=q.get('stage');
   if(q.get('city'))filter.city=new RegExp(`^${escapeRegex(q.get('city').trim())}$`,'i');
   const stageVal = q.get('propertyStatus') || q.get('stage');
   if(stageVal) filter.stage = stageVal;
   if(q.get('minPrice'))filter.price={...(filter.price||{}),$gte:Number(q.get('minPrice'))||0};
   if(q.get('maxPrice'))filter.price={...(filter.price||{}),$lte:Number(q.get('maxPrice'))||1e12};
   if(q.get('bedrooms')){
     const bedNum = String(q.get('bedrooms')).replace(/[^0-9]/g, '');
     if(bedNum) filter['configurations.name'] = new RegExp(`${bedNum}\\s*BHK`, 'i');
   }
   if(q.get('q'))filter.$or=[{title:new RegExp(escapeRegex(q.get('q').slice(0,100)),'i')},{locality:new RegExp(escapeRegex(q.get('q').slice(0,100)),'i')},{builder:new RegExp(escapeRegex(q.get('q').slice(0,100)),'i')}];
   return json(await paginate(Project,filter,q,null,q.get('sort')==='price-asc'?{price:1}:{createdAt:-1}));
  }
  if(key&&action==='brochure'&&method==='GET'){
   const project=await record(Project,key);if(project.status!=='approved')fail('Project unavailable.',404);
   const text=[`URBANFINDR | ${project.title}`,`Demo project information sheet`,`${project.builder} • ${project.locality}, ${project.city}`,`RERA reference (demo): ${project.rera}`,`Possession: ${project.possession}`,project.description,'',...project.configurations.map(v=>`${v.name} | ${v.area} sq ft | INR ${v.price.toLocaleString('en-IN')}`),'',`Amenities: ${project.amenities.join(', ')}`,'All listings, builders, prices and RERA references in the demo are fictional. Verify official records before a real purchase.'].join('\n');
   return new NextResponse(text,{headers:{'Content-Type':'text/plain; charset=utf-8','Content-Disposition':`attachment; filename="urbanfindr-project-${project._id}.txt"`}});
  }
  if(key&&method==='GET'){const item=await record(Project,key);const user=await currentUser();if(item.status!=='approved'&&user?.role!=='admin')fail('Project not found.',404);return json(item);}
 }
 if(root==='professionals'||root==='service-providers'){
  if(method==='GET'){
   let filter={};
   if(q.get('featured')==='true')filter.featured=true;
   if(q.get('category'))filter.categorySlug=q.get('category');
   if(q.get('city'))filter.city=new RegExp(`^${escapeRegex(q.get('city').trim())}$`,'i');
   let items=[];try{items=await ServiceProvider.find(filter).sort({ rating: -1 }).lean();}catch(e){}
   const initialList = initialServiceProviders.filter(p => {
     if(q.get("featured")==="true" && !p.featured) return false;
     if(q.get("category") && p.categorySlug !== q.get("category")) return false;
     if(q.get("city") && p.city.toLowerCase() !== q.get("city").trim().toLowerCase()) return false;
     return true;
   });
   if(!items) items = [];
   for(const pro of initialList){
     const match = items.find(i => (i.specialist || i.name || "").toLowerCase() === (pro.specialist || pro.name || "").toLowerCase());
     if(!match){
       items.push(pro);
     } else {
       if(pro.rating && (!match.rating || pro.rating > match.rating)) match.rating = pro.rating;
       if(pro.locality && (!match.locality || match.locality !== pro.locality)) match.locality = pro.locality;
       if(pro.badge) match.badge = pro.badge;
       if(pro.experience) match.experience = pro.experience;
     }
   }
   const localityQuery = (q.get('locality')||'').trim().toLowerCase();
   if(localityQuery){
    items.sort((a,b)=>{
     const aLoc = (a.locality||'').toLowerCase().includes(localityQuery)?1:0;
     const bLoc = (b.locality||'').toLowerCase().includes(localityQuery)?1:0;
     if(bLoc!==aLoc)return bLoc-aLoc;
     return (b.rating||0)-(a.rating||0);
    });
   } else {
    items.sort((a,b)=>(b.rating||0)-(a.rating||0));
   }
   const limit=Number(q.get('limit'))||items.length;
   const cleanItems = items.slice(0,limit).map(item => ({
     ...item,
     services: (item.services || []).map(s => typeof s === "string" ? s : s?.name || "")
   }));
   return json({items:cleanItems,total:items.length});
  }
  if(key==='enquiry'&&method==='POST'){
   const data=await body(req);
   return json({ok:true,message:'Enquiry received. The professional will contact you shortly.',enquiry:data});
  }
 }

function generateServiceQuotations(categorySlug, serviceType, categoryFields, city) {
  const cSlug = String(categorySlug || '').toLowerCase();
  const sType = String(serviceType || '').toLowerCase();

  let standardAmount = 499;
  let standardLabor = 350;
  let compAmount = 799;
  let compLabor = 600;
  let premAmount = 1199;
  let premLabor = 950;
  let inspectionFee = 149;

  let standardTitle = 'Standard Service Quotation';
  let standardInclusions = [
    'Doorstep diagnostic & safety inspection',
    'Essential filter & component cleaning',
    'Basic electrical & wiring test',
    '15-Day Service Guarantee'
  ];
  let standardNotes = 'Standard diagnostic inspection and service labor.';

  let compTitle = 'Comprehensive Quotation (Recommended)';
  let compInclusions = [
    'Complete deep diagnostic assessment',
    'Deep pressure jet & anti-bacterial foam wash',
    'System pressure, voltage & cooling efficiency audit',
    'Condensate drain tray flush (leak prevention)',
    '30-Day Complete Peace-of-Mind Guarantee'
  ];
  let compNotes = 'Comprehensive deep cleaning, high-pressure foam wash, and performance tuning.';

  let premTitle = 'Premium Care & Extended Protection Quotation';
  let premInclusions = [
    'Full master overhaul & deep chemical sanitization',
    'Indoor & outdoor unit comprehensive deep servicing',
    'Electrical capacitor, amp & refrigerant health certificate',
    'Priority same-day technician dispatch',
    '60-Day Extended Service Guarantee'
  ];
  let premNotes = 'Master overhaul, complete chemical sanitization, and extended 60-day warranty.';

  if (cSlug.includes('ac') || sType.includes('ac') || sType.includes('cooling')) {
    inspectionFee = 199;
    if (sType.includes('gas') || sType.includes('leak') || sType.includes('refill')) {
      standardAmount = 1499;
      standardLabor = 1200;
      standardTitle = 'Standard Gas Leak Diagnostic & Top-up';
      standardInclusions = [
        'Electronic leak detection across indoor & outdoor units',
        'Valve sealing and safety pressure test',
        'Refrigerant gas top-up (up to 20% PSI)',
        '15-Day Gas Leak Guarantee'
      ];
      standardNotes = 'Leak detection, valve tightening, and refrigerant top-up.';

      compAmount = 1899;
      compLabor = 1600;
      compTitle = 'Comprehensive Full Gas Recharge & Vacuuming (Recommended)';
      compInclusions = [
        'Complete electronic leak diagnosis & copper brazing repair',
        'Deep motorized system vacuuming & moisture purging',
        '100% pure eco-friendly refrigerant gas recharge',
        'Operating current (Amps) and sub-cooling calibration',
        '30-Day Cooling & Leak-Free Guarantee'
      ];
      compNotes = 'Complete AC gas leak testing, vacuuming, and eco-friendly refrigerant recharge.';

      premAmount = 2499;
      premLabor = 2100;
      premTitle = 'Premium Gas Recharge + Jet Deep Clean Overhaul';
      premInclusions = [
        'Full leak repair + 100% eco-gas recharge',
        'High-pressure indoor & outdoor jet wash included',
        'Electrical capacitor & contactor health audit',
        'Priority 2-hour technician visit',
        '60-Day Comprehensive Cooling Guarantee'
      ];
      premNotes = 'Complete gas recharge combined with full high-pressure deep clean and 60-day warranty.';
    } else if (sType.includes('install') && !sType.includes('uninstall')) {
      standardAmount = 999;
      standardLabor = 800;
      standardTitle = 'Standard AC Installation Quotation';
      standardInclusions = [
        'Indoor unit wall mounting & bracket setup',
        'Outdoor unit basic positioning',
        'Standard copper line connection & power cable hookup',
        'Basic cooling operational check',
        '15-Day Installation Guarantee'
      ];
      standardNotes = 'Standard indoor/outdoor mounting and basic connection.';

      compAmount = 1299;
      compLabor = 1100;
      compTitle = 'Comprehensive Precision AC Installation (Recommended)';
      compInclusions = [
        'Precision spirit-level indoor & heavy-duty outdoor bracket mounting',
        'Core wall hole sealing & high-grade thermal insulation wrap',
        'Nitrogen vacuuming of copper lines before gas release',
        'Digital temperature differential & airflow CFM test',
        '30-Day Workmanship & Vibration Guarantee'
      ];
      compNotes = 'Complete indoor and outdoor unit mounting, bracket setup, vacuuming, and cooling test.';

      premAmount = 1799;
      premLabor = 1550;
      premTitle = 'Premium Heavy-Duty Installation & Surge Protection';
      premInclusions = [
        'Heavy-gauge powder-coated anti-rust outdoor stand included',
        'Complete copper flare nut re-tooling & vacuum testing',
        'Electrical MCB / isolator connection & voltage stabilization check',
        'Free doorstep follow-up inspection at 30 days',
        '60-Day Master Installation Warranty'
      ];
      premNotes = 'Heavy-duty installation with anti-rust brackets, electrical stabilization, and 60-day warranty.';
    } else if (sType.includes('uninstall') || sType.includes('dismantle')) {
      standardAmount = 499;
      standardLabor = 350;
      standardTitle = 'Standard AC Uninstallation';
      standardInclusions = [
        'Safe refrigerant gas lock-down into compressor',
        'Indoor unit unmounting from wall',
        'Basic copper pipe detachment',
        'Safe handling guarantee'
      ];
      standardNotes = 'Refrigerant lock-down and indoor unmounting.';

      compAmount = 699;
      compLabor = 500;
      compTitle = 'Comprehensive Safe AC Dismantling (Recommended)';
      compInclusions = [
        '100% refrigerant gas pump-down & lock-in (no gas loss)',
        'Indoor unit + outdoor condenser safe unmounting',
        'Copper piping coiling, flare nut sealing & power isolation',
        'Wall hole weather-proof temporary plugging',
        'Transit packaging preparation'
      ];
      compNotes = 'Safe refrigerant lock-down, indoor & outdoor bracket dismantling, and safe packaging.';

      premAmount = 999;
      premLabor = 750;
      premTitle = 'Premium AC Dismantle + Transit Bubble Wrap Pack';
      premInclusions = [
        'Full safe gas lock-down & dual unit unmounting',
        'Heavy-duty multi-layer bubble wrap & corner guard packing for transit',
        'All screws, brackets, and copper lines neatly labeled & packaged',
        'Damage-free relocation preparation guarantee'
      ];
      premNotes = 'Complete dismantling with multi-layer bubble packing for safe home shifting.';
    } else if (sType.includes('jet') || sType.includes('deep') || sType.includes('cleaning')) {
      standardAmount = 699;
      standardLabor = 500;
      standardTitle = 'Standard Foam Jet Cleaning';
      standardInclusions = [
        'High-pressure water jet cleaning of indoor cooling coil',
        'Air filter & blower wheel wash',
        'Drain tray clearing & basic odor wipe',
        '15-Day Service Guarantee'
      ];
      standardNotes = 'Indoor unit jet spray and filter clean.';

      compAmount = 899;
      compLabor = 700;
      compTitle = 'Comprehensive Indoor + Outdoor Power Jet Clean (Recommended)';
      compInclusions = [
        'High-pressure power jet wash of indoor cooling coil & blower wheel',
        'Deep pressure cleaning of outdoor condenser coil & fan fins',
        'Anti-bacterial & anti-fungal chemical foam treatment',
        'Drain pipe back-flush to eliminate water leakage risks',
        'Operating cooling temperature check (digital thermometer)',
        '30-Day Cooling & Leak-Free Guarantee'
      ];
      compNotes = 'High-pressure foam jet cleaning of indoor cooling coils and outdoor condenser fins.';

      premAmount = 1299;
      premLabor = 1050;
      premTitle = 'Premium Master Jet Sanitization + Electrical Health Audit';
      premInclusions = [
        'Full indoor + outdoor unit jet deep cleaning',
        'Medical-grade anti-microbial disinfection & fresh scent mist',
        'Electrical terminal tightening, capacitor test, and compressor amp draw check',
        'Refrigerant gas pressure verification report',
        '60-Day Extended Cooling Guarantee'
      ];
      premNotes = 'Complete master jet cleaning, medical sanitization, and full electrical diagnostic audit.';
    } else {
      // General Servicing
      standardAmount = 449;
      standardLabor = 300;
      standardTitle = 'Standard AC Inspection & Filter Service';
      standardInclusions = [
        'Multi-point diagnostic inspection',
        'Air filter dry/wet wash and surface wipe',
        'Thermostat & remote control test',
        'Airflow delivery check',
        '15-Day Service Guarantee'
      ];
      standardNotes = 'Basic filter cleaning and diagnostic check.';

      compAmount = 599;
      compLabor = 400;
      compTitle = 'Comprehensive AC General Servicing (Recommended)';
      compInclusions = [
        'Comprehensive multi-point diagnostic inspection',
        'High-grade filter wash, cooling coil surface foam wash',
        'Condensate drain tray flush (prevent water dripping)',
        'Operating electrical current & voltage check',
        'Digital cooling grill temperature measurement',
        '30-Day Service Guarantee'
      ];
      compNotes = 'Comprehensive filter wash, electrical diagnostics, drain tray clearing, and cooling efficiency test.';

      premAmount = 999;
      premLabor = 750;
      premTitle = 'Premium AC Pro-Tune & Deep Foam Service';
      premInclusions = [
        'Everything in Comprehensive Servicing',
        'High-pressure outdoor coil wash',
        'Anti-bacterial coil sanitization coating',
        'Capacitor & compressor efficiency health report',
        '60-Day Service Guarantee'
      ];
      premNotes = 'Pro-tune deep foam service with outdoor coil cleaning and 60-day warranty.';
    }

    const units = categoryFields?.unitsCount;
    let multiplier = 1;
    let unitLabel = '';
    if (units === '2 Units') {
      multiplier = 1.85;
      unitLabel = ' (2 Units)';
    } else if (units === '3 Units') {
      multiplier = 2.7;
      unitLabel = ' (3 Units)';
    } else if (units === '4+ Units') {
      multiplier = 3.5;
      unitLabel = ' (4+ Units)';
    }

    standardAmount = Math.round(standardAmount * multiplier);
    standardLabor = Math.round(standardLabor * multiplier);
    compAmount = Math.round(compAmount * multiplier);
    compLabor = Math.round(compLabor * multiplier);
    premAmount = Math.round(premAmount * multiplier);
    premLabor = Math.round(premLabor * multiplier);

    if (unitLabel) {
      standardTitle += unitLabel;
      compTitle += unitLabel;
      premTitle += unitLabel;
    }
  } else if (cSlug.includes('electric')) {
    inspectionFee = 149;
    standardAmount = 299; standardLabor = 180;
    standardTitle = 'Basic Electrical Fix Quotation';
    compAmount = 449; compLabor = 300;
    compTitle = 'Standard Electrical Repair & Diagnostic (Recommended)';
    premAmount = 799; premLabor = 600;
    premTitle = 'Complete Home Electrical Safety Audit & Repair';
  } else if (cSlug.includes('plumb')) {
    inspectionFee = 149;
    standardAmount = 349; standardLabor = 220;
    standardTitle = 'Standard Plumbing Diagnostic & Quick Fix';
    compAmount = 549; compLabor = 380;
    compTitle = 'Comprehensive Leak Detection & Pipe Repair (Recommended)';
    premAmount = 999; premLabor = 780;
    premTitle = 'Full Home Plumbing Inspection & Pressure Calibration';
  }

  const now = new Date();
  const validUntil = new Date(now.getTime() + 7 * 86400000);

  return [
    {
      id: 'quote-standard',
      title: standardTitle,
      tier: 'standard',
      amount: standardAmount,
      inspectionFee,
      laborCost: standardLabor,
      partsCost: 0,
      tax: Math.round(standardAmount * 0.18),
      duration: '45-60 mins',
      warranty: '15-Day Service Guarantee',
      recommended: false,
      inclusions: standardInclusions,
      notes: standardNotes,
      submittedAt: now,
      validUntil,
      status: 'pending'
    },
    {
      id: 'quote-comprehensive',
      title: compTitle,
      tier: 'comprehensive',
      amount: compAmount,
      inspectionFee,
      laborCost: compLabor,
      partsCost: 0,
      tax: Math.round(compAmount * 0.18),
      duration: '60-90 mins',
      warranty: '30-Day Service Guarantee',
      recommended: true,
      inclusions: compInclusions,
      notes: compNotes,
      submittedAt: now,
      validUntil,
      status: 'pending'
    },
    {
      id: 'quote-premium',
      title: premTitle,
      tier: 'premium',
      amount: premAmount,
      inspectionFee,
      laborCost: premLabor,
      partsCost: 0,
      tax: Math.round(premAmount * 0.18),
      duration: '90-120 mins',
      warranty: '60-Day Extended Guarantee',
      recommended: false,
      inclusions: premInclusions,
      notes: premNotes,
      submittedAt: now,
      validUntil,
      status: 'pending'
    }
  ];
}

function calculateServiceQuotation(categorySlug, serviceType, categoryFields, city) {
  const list = generateServiceQuotations(categorySlug, serviceType, categoryFields, city);
  return list.find(q => q.recommended) || list[0];
}

  if(root==='service-requests'){
    if(method==='POST'&&!key){
      const data=await body(req);
      const fullName = [data.firstName, data.lastName].filter(Boolean).join(' ').trim() || String(data.name || '').trim();
      const desc = String(data.description || `Doorstep service booking for ${data.serviceType} in ${data.city}.`).trim();
      const categoryName = String(data.category || (data.categorySlug ? data.categorySlug.replace(/-/g, ' ') : '')).trim();
      if(!categoryName||!data.serviceType||!fullName||!data.phone||!data.city){
        fail('Please fill in all required fields.');
      }
      const digits=String(data.phone).replace(/\D/g,'');
      if(digits.length<10){
        fail('Please enter a valid 10-digit phone number.');
      }
      const count=await ServiceRequest.countDocuments();
      const requestId=`SR-${new Date().getFullYear()}-${String(count+1).padStart(5,'0')}`;
      const user=await currentUser();
      const preferredDate = data.preferredDate ? String(data.preferredDate).trim() : '';
      const preferredTimeSlot = data.preferredTimeSlot ? String(data.preferredTimeSlot).trim() : (data.preferredTime ? String(data.preferredTime).trim() : '');
      const pricingType = data.pricingType === 'predefined' ? 'predefined' : 'quote';
      const predefinedPrice = Number(data.predefinedPrice) || undefined;

      const categorySlug = String(data.categorySlug||data.category).toLowerCase().trim().replace(/\s+/g,'-');
      // No static quotations on initial booking:
      // Dynamic quotations are only created when a service provider sends an itemized quotation
      const quotations = [];
      const initialQuote = undefined;

      const contactPref = ['call', 'message', 'quote', 'direct_quotation'].includes(data.contactPreference)
        ? data.contactPreference
        : 'call';
      const contactPrefLabel = contactPref === 'message'
        ? 'Talk via Message / WhatsApp'
        : (contactPref === 'quote' || contactPref === 'direct_quotation')
        ? 'Direct Quotation'
        : 'Direct Phone Call';
      const custMsg = data.customerMessage ? String(data.customerMessage).trim().slice(0, 1000) : '';

      const initialTimeline = [
        {
          status: 'submitted',
          label: 'Service Request Sent',
          timestamp: new Date(),
          notes: `Customer sent service request for ${data.serviceType} in ${data.locality || data.address || ''}, ${data.city}. Customer preference: ${contactPrefLabel}.${custMsg ? ` Details: "${custMsg}"` : ''}`,
          updatedBy: user ? user.name : fullName
        }
      ];

      const item=await ServiceRequest.create({
        requestId,
        category:String(data.category).trim(),
        categorySlug,
        serviceType:String(data.serviceType).trim(),
        workflowType:String(data.workflowType || 'booking'),
        pricingType,
        predefinedPrice,
        description: desc.slice(0,3000),
        firstName:data.firstName?String(data.firstName).trim().slice(0,60):undefined,
        lastName:data.lastName?String(data.lastName).trim().slice(0,60):undefined,
        name:fullName.slice(0,120),
        phone:String(data.phone).trim().slice(0,30),
        email:data.email?String(data.email).trim().slice(0,120):undefined,
        city:String(data.city).trim(),
        locality:data.locality?String(data.locality).trim().slice(0,200):undefined,
        address:data.address?String(data.address).trim().slice(0,300):undefined,
        landmark:data.landmark?String(data.landmark).trim().slice(0,120):undefined,
        pincode:data.pincode?String(data.pincode).trim().slice(0,10):undefined,
        preferredDate:preferredDate || undefined,
        preferredTime:preferredTimeSlot || undefined,
        preferredTimeSlot:preferredTimeSlot || undefined,
        categoryFields:data.categoryFields && typeof data.categoryFields === 'object' ? data.categoryFields : {},
        assignedSpecialist:data.assignedSpecialist?String(data.assignedSpecialist).trim():undefined,
        assignedSpecialistId:data.assignedSpecialistId?String(data.assignedSpecialistId).trim():undefined,
        assignedSpecialistRating:data.assignedSpecialistRating?Number(data.assignedSpecialistRating):undefined,
        contactPreference: contactPref,
        customerMessage: custMsg || undefined,
        status:'submitted',
        quotations,
        quotation: initialQuote,
        timeline:initialTimeline,
        user:user?user._id:undefined
      });

      // Mirror as a Lead for unified lead tracking across service provider views
      try {
        await Lead.create({
          user: user ? user._id : undefined,
          kind: 'general',
          source: contactPref === 'message' ? 'message' : contactPref === 'call' ? 'phone' : 'enquiry',
          name: fullName,
          phone: String(data.phone).trim(),
          email: data.email || (user ? user.email : ''),
          city: String(data.city).trim(),
          service: data.category,
          note: `[${requestId}] ${data.serviceType} (${contactPrefLabel}) - ${data.address || ''}, ${data.city}.${custMsg ? ` Customer Note: ${custMsg}` : ''}`,
          status: 'new'
        });
      } catch (e) {
        // non-blocking
      }

      return json({ok:true,requestId:item.requestId,message:'Service request sent successfully.',item, quotations},201);
    }

    if(method==='GET'&&!key){
      const user=await currentUser();
      let filter={};
      const parseStatusFilter = (st) => {
        if(!st || st === 'all') return undefined;
        if(st === 'new' || st === 'submitted' || st === 'requested' || st === 'pending') {
          return { $in: ['submitted', 'requested', 'pending', 'new', 'quotation', 'quoted'] };
        }
        if(st === 'active' || st === 'in_progress') {
          return { $in: ['in_progress', 'scheduled', 'accepted'] };
        }
        if(st === 'completed') return 'completed';
        if(st === 'closed') return 'closed';
        if(st === 'issues') return { $in: ['disputed', 'cancelled', 'rejected'] };
        return st;
      };

      if(user?.role==='admin'){
        if(q.get('category')) filter.categorySlug=q.get('category');
        if(q.get('city')) filter.city=q.get('city');
        if(q.get('status')) filter.status=parseStatusFilter(q.get('status'));
      }else if(user?.role==='service_provider' || user?.role==='service-provider'){
        const targetCategory = q.get('category') || q.get('categorySlug') || user.serviceCategory;
        if(targetCategory){
          const catClean = targetCategory.toLowerCase().trim();
          const baseCat = catClean.replace(/s$/, '').replace(/[-_ ]/g, '[-_ ]?');
          const catRg = new RegExp(baseCat, 'i');
          filter = {
            $or: [
              { categorySlug: catClean },
              { categorySlug: catRg },
              { category: catRg },
              { assignedSpecialistId: String(user._id) }
            ]
          };
        } else {
          filter = { assignedSpecialistId: String(user._id) };
        }
        if(q.get('status')) filter.status=parseStatusFilter(q.get('status'));
      }else if(user){
        filter={
          $or: [
            { user: user._id },
            { phone: user.phone },
            { email: user.email }
          ]
        };
        if(q.get('status')) filter.status=parseStatusFilter(q.get('status'));
      } else {
        if(q.get('phone')) filter.phone=q.get('phone');
        else if(q.get('email')) filter.email=q.get('email');
        else if(q.get('requestId')) filter.requestId=q.get('requestId');
        else return json({ items: [], total: 0, page: 1, pages: 1 });
      }
      return json(await paginate(ServiceRequest,filter,q,null,{createdAt:-1}));
    }

    if(method==='GET'&&key){
      const query = mongoose.isValidObjectId(key) ? { _id: key } : { requestId: key };
      const item = await ServiceRequest.findOne(query).lean();
      if(!item) fail('Service booking not found.', 404);
      return json({ ok: true, item });
    }

    if(method==='PATCH'&&key){
      const query = mongoose.isValidObjectId(key) ? { _id: key } : { requestId: key };
      const item = await ServiceRequest.findOne(query);
      if(!item) fail('Service booking not found.', 404);
      const user = await currentUser();
      const data = await body(req);
      const action = String(data.action || '').toLowerCase();
      const now = new Date();
      const actorName = user ? (user.name || user.role) : (data.updatedBy || 'System');

      // Step 3: Provider submits quotation
      if(action === 'quote'){
        const amount = Number(data.amount);
        if(!amount || amount <= 0) fail('Please provide a valid quotation amount.');
        let laborCost = Number(data.laborCost) || 0;
        let partsCost = Number(data.partsCost) || 0;
        let inspectionFee = Number(data.inspectionFee) || 0;
        const tax = Number(data.tax) || Math.round(amount * 0.18);
        const notes = data.notes ? String(data.notes).trim() : '';
        const title = data.title ? String(data.title).trim() : `${item.serviceType} Quotation`;
        const validDays = Number(data.validDays) || 7;

        // Ensure breakdown adds up exactly to quotation amount so customer sees 100% consistent numbers
        if (laborCost + partsCost + inspectionFee !== amount) {
          if (partsCost + inspectionFee < amount) {
            laborCost = amount - partsCost - inspectionFee;
          } else {
            laborCost = amount;
            partsCost = 0;
            inspectionFee = 0;
          }
        }

        const newQuote = {
          id: `quote-${Date.now()}`,
          title,
          tier: data.tier || 'custom',
          amount,
          inspectionFee,
          laborCost,
          partsCost,
          tax,
          duration: data.duration || '60 mins',
          warranty: data.warranty || '30-Day Service Guarantee',
          recommended: true,
          inclusions: Array.isArray(data.inclusions) ? data.inclusions : ['Doorstep diagnostic & inspection', notes || 'Expert service labor'],
          notes,
          submittedAt: now,
          validUntil: new Date(now.getTime() + validDays * 86400000),
          status: 'pending'
        };

        if(!Array.isArray(item.quotations)) {
          item.quotations = [];
        }
        item.quotations.push(newQuote);
        item.quotation = newQuote;
        item.selectedQuotationId = newQuote.id;
        item.status = 'quotation';

        // Synchronize invoice directly with provider's quotation so customer sees exact quotation
        let invoiceItems = [];
        if (inspectionFee > 0) {
          invoiceItems.push({ description: 'Doorstep Inspection & Diagnostic', amount: inspectionFee });
        }
        if (laborCost > 0) {
          invoiceItems.push({ description: title || `${item.serviceType} Service & Labor`, amount: laborCost });
        }
        if (partsCost > 0) {
          invoiceItems.push({ description: 'Replacement Parts & Materials', amount: partsCost });
        }
        if (!invoiceItems.length) {
          invoiceItems.push({ description: `${item.serviceType} (${item.category})`, amount });
        }

        const invoiceNumber = item.invoice?.invoiceNumber || `INV-${now.getFullYear()}-${String(Math.floor(10000 + Math.random() * 90000))}`;
        item.invoice = {
          invoiceNumber,
          issueDate: now,
          items: invoiceItems,
          subtotal: amount,
          tax: tax,
          total: amount + tax,
          status: item.invoice?.status || 'unpaid'
        };

        item.timeline.push({
          status: 'quotation',
          label: 'Quotation Submitted',
          timestamp: now,
          notes: `Provider submitted quotation: "${title}" for ₹${amount.toLocaleString('en-IN')}${notes ? ` (${notes})` : ''}.`,
          updatedBy: actorName
        });
        await item.save();
        return json({ ok: true, message: 'Quotation submitted successfully.', item });
      }

      // Step 4: Customer accepts quotation or confirms booking
      if(action === 'accept' || action === 'accept-quote'){
        if(item.status === 'completed' || item.status === 'cancelled') {
          fail('Cannot accept a closed or cancelled booking.');
        }

        const targetQId = data.quotationId || data.selectedQuotationId;
        let acceptedQuote = null;
        if(targetQId && Array.isArray(item.quotations)) {
          acceptedQuote = item.quotations.find(q => q.id === targetQId || String(q._id) === String(targetQId));
        }
        if(!acceptedQuote && data.acceptedQuotation) {
          acceptedQuote = data.acceptedQuotation;
        }
        if(!acceptedQuote) {
          acceptedQuote = item.quotation || (Array.isArray(item.quotations) && item.quotations[0]);
        }

        if(acceptedQuote) {
          item.selectedQuotationId = acceptedQuote.id || targetQId || 'quote-accepted';
          item.quotation = {
            ...acceptedQuote,
            status: 'accepted'
          };
          if(Array.isArray(item.quotations)) {
            item.quotations.forEach(q => {
              if(q.id === item.selectedQuotationId || String(q._id) === String(item.selectedQuotationId)) {
                q.status = 'accepted';
              } else {
                q.status = 'rejected';
              }
            });
          }
        }
        item.status = 'accepted';
        const methodDesc = data.paymentMethod === 'online' ? 'Online Payment' : 'Pay After Service (Cash / UPI)';
        const quoteName = acceptedQuote?.title
          ? `"${acceptedQuote.title}" (₹${Number(acceptedQuote.amount || 0).toLocaleString('en-IN')})`
          : `quotation of ₹${Number(item.quotation?.amount || 599).toLocaleString('en-IN')}`;

        item.timeline.push({
          status: 'accepted',
          label: 'Service Accepted',
          timestamp: now,
          notes: `Customer accepted ${quoteName}. Selected payment method: ${methodDesc}.`,
          updatedBy: actorName
        });
        await item.save();
        return json({ ok: true, message: 'Offer accepted successfully.', item });
      }

      // Customer declines quotation
      if(action === 'reject-quote' || action === 'reject'){
        if(item.quotation) {
          item.quotation.status = 'rejected';
        }
        if(Array.isArray(item.quotations)) {
          item.quotations.forEach(q => { q.status = 'rejected'; });
        }
        item.status = 'rejected';
        const reason = data.reason ? String(data.reason).trim() : 'Customer declined the quotation.';
        item.timeline.push({
          status: 'rejected',
          label: 'Quotation Declined',
          timestamp: now,
          notes: reason,
          updatedBy: actorName
        });
        await item.save();
        return json({ ok: true, message: 'Quotation marked as declined.', item });
      }

      // Step 5: Provider assigns technician and schedules visit
      if(action === 'assign'){
        const techName = String(data.technicianName || data.name || '').trim();
        const techPhone = String(data.technicianPhone || data.phone || '').trim();
        if(!techName || !techPhone) fail('Technician name and contact phone are required.');

        item.technician = {
          name: techName,
          phone: techPhone,
          photo: data.technicianPhoto || '/photos/avatar-pro.jpg',
          badge: data.technicianBadge || 'Certified Technician',
          assignedAt: now,
          notes: data.technicianNotes ? String(data.technicianNotes).trim() : undefined
        };
        if(data.scheduledDate) item.preferredDate = String(data.scheduledDate).trim();
        if(data.scheduledTime) item.preferredTimeSlot = String(data.scheduledTime).trim();
        item.status = 'scheduled';
        item.timeline.push({
          status: 'scheduled',
          label: 'Technician Assigned & Scheduled',
          timestamp: now,
          notes: `Technician ${techName} (${techPhone}) scheduled for ${item.preferredDate || 'confirmed date'} (${item.preferredTimeSlot || 'confirmed slot'}).`,
          updatedBy: actorName
        });
        await item.save();
        return json({ ok: true, message: 'Technician assigned and booking scheduled.', item });
      }

      // Step 6: Job tracking - In progress (Technician started)
      if(action === 'start' || action === 'in_progress'){
        item.status = 'in_progress';
        item.timeline.push({
          status: 'in_progress',
          label: 'Job In Progress',
          timestamp: now,
          notes: data.notes || 'Service provider commenced work on site.',
          updatedBy: actorName
        });
        await item.save();
        return json({ ok: true, message: 'Service marked in progress.', item });
      }

      // Step 7: Completion with notes and photographs + Step 8: Invoice generation
      if(action === 'complete'){
        const workSummary = data.workSummary ? String(data.workSummary).trim() : 'Service completed successfully.';
        const serviceNotes = data.serviceNotes ? String(data.serviceNotes).trim() : '';
        const photos = Array.isArray(data.photos) ? data.photos.filter(Boolean) : (data.photo ? [data.photo] : []);
        const partsReplaced = Array.isArray(data.partsReplaced) ? data.partsReplaced.filter(Boolean) : [];

        // Calculate invoice totals directly from quotation if available
        const quote = item.quotation || (Array.isArray(item.quotations) && item.quotations[0]) || null;
        const baseAmount = Number(data.finalAmount) || (quote?.amount) || (item.predefinedPrice) || 499;
        const partsAmount = Number(data.partsAmount) || (quote?.partsCost) || 0;
        const inspectionFee = Number(quote?.inspectionFee) || 0;
        const laborAmount = Number(data.laborAmount) || (quote?.laborCost) || Math.max(0, baseAmount - partsAmount - inspectionFee);
        const tax = quote?.tax ? Number(quote.tax) : Math.round(baseAmount * 0.18);
        const total = baseAmount + tax;

        const invoiceNumber = `INV-${now.getFullYear()}-${String(Math.floor(10000 + Math.random() * 90000))}`;
        
        let invoiceItems = [];
        if (quote && (quote.laborCost || quote.partsCost || quote.inspectionFee)) {
          if (inspectionFee > 0) {
            invoiceItems.push({ description: 'Doorstep Inspection & Diagnostic', amount: inspectionFee });
          }
          if (laborAmount > 0) {
            invoiceItems.push({ description: quote.title || `${item.serviceType} Service & Labor`, amount: laborAmount });
          }
          if (partsAmount > 0) {
            invoiceItems.push({ description: 'Replacement Parts & Materials', amount: partsAmount });
          }
        }
        if (!invoiceItems.length) {
          invoiceItems = [
            { description: quote?.title || `${item.serviceType} (${item.category})`, amount: laborAmount || baseAmount },
            ...(partsAmount > 0 ? [{ description: 'Replacement Parts & Materials', amount: partsAmount }] : [])
          ];
        }

        item.completion = {
          completedAt: now,
          workSummary,
          serviceNotes,
          photos,
          partsReplaced
        };

        item.invoice = {
          invoiceNumber,
          issueDate: now,
          items: invoiceItems,
          subtotal: baseAmount,
          tax,
          total,
          status: 'unpaid'
        };

        item.status = 'completed';
        item.timeline.push({
          status: 'completed',
          label: 'Service Completed & Invoice Generated',
          timestamp: now,
          notes: `${workSummary} Generated invoice ${invoiceNumber} for ₹${total.toLocaleString('en-IN')}.`,
          updatedBy: actorName
        });
        await item.save();
        try {
          await Lead.updateOne({ note: new RegExp(escapeRegex(item.requestId)) }, { status: 'completed' });
        } catch (e) {}
        return json({ ok: true, message: 'Service marked completed and invoice generated.', item });
      }

      // Lead completion / closure
      if(action === 'close' || action === 'close-lead'){
        item.status = 'closed';
        const closeNote = data.notes || data.workSummary || 'Service provider marked the lead as completed and closed.';
        item.timeline.push({
          status: 'closed',
          label: 'Lead Completed & Closed',
          timestamp: now,
          notes: closeNote,
          updatedBy: actorName
        });
        await item.save();
        try {
          await Lead.updateOne({ note: new RegExp(escapeRegex(item.requestId)) }, { status: 'closed' });
        } catch (e) {}
        return json({ ok: true, message: 'Lead has been marked as completed and closed.', item });
      }

      if(action === 'status' || (data.status && ['submitted', 'requested', 'pending', 'new', 'contacted', 'connected', 'in_progress', 'scheduled', 'completed', 'closed'].includes(data.status))){
        const newStatus = data.status || action;
        item.status = newStatus;
        item.timeline.push({
          status: newStatus,
          label: `Status Updated to ${newStatus.replace('_', ' ')}`,
          timestamp: now,
          notes: data.notes || `Status transitioned to ${newStatus}.`,
          updatedBy: actorName
        });
        await item.save();
        try {
          await Lead.updateOne({ note: new RegExp(escapeRegex(item.requestId)) }, { status: newStatus === 'closed' ? 'closed' : newStatus === 'completed' ? 'completed' : 'contacted' });
        } catch (e) {}
        return json({ ok: true, message: `Status updated to ${newStatus}.`, item });
      }

      // Step 8: Review submission
      if(action === 'review'){
        const rating = Math.min(5, Math.max(1, Number(data.rating) || 5));
        const comment = data.comment ? String(data.comment).trim() : '';
        item.review = {
          rating,
          comment,
          reviewedAt: now
        };
        item.timeline.push({
          status: item.status,
          label: 'Customer Review Submitted',
          timestamp: now,
          notes: `Customer rated ${rating}/5 stars: "${comment || 'Great service'}"`,
          updatedBy: actorName
        });
        await item.save();
        return json({ ok: true, message: 'Thank you for your review!', item });
      }

      // Pay invoice
      if(action === 'pay' || action === 'pay-invoice'){
        if(item.invoice){
          item.invoice.status = 'paid';
          item.invoice.paidAt = now;
          item.invoice.paymentMethod = data.paymentMethod || 'UPI / Card';
        } else {
          const quote = item.quotation || (Array.isArray(item.quotations) && item.quotations[0]) || null;
          const baseAmount = quote?.amount || item.predefinedPrice || 499;
          const tax = quote?.tax ? Number(quote.tax) : Math.round(baseAmount * 0.18);
          const total = baseAmount + tax;
          item.invoice = {
            invoiceNumber: `INV-${now.getFullYear()}-${String(Math.floor(10000 + Math.random() * 90000))}`,
            issueDate: now,
            paidAt: now,
            items: [{ description: quote?.title || `${item.serviceType} (${item.category})`, amount: baseAmount }],
            subtotal: baseAmount,
            tax,
            total,
            status: 'paid',
            paymentMethod: data.paymentMethod || 'UPI / Online'
          };
        }
        item.timeline.push({
          status: item.status,
          label: 'Invoice Paid by Customer',
          timestamp: now,
          notes: `Customer paid invoice (₹${item.invoice?.total || ''}) via ${data.paymentMethod || 'Online / UPI'}.`,
          updatedBy: actorName
        });
        await item.save();
        return json({ ok: true, message: 'Invoice paid successfully.', item });
      }

      // Cancellation / Decline Lead
      if(action === 'cancel' || action === 'decline-lead' || action === 'cancel-lead'){
        const isProv = user?.role === 'service_provider' || user?.role === 'service-provider';
        const defaultReason = isProv ? 'Lead declined/cancelled by service provider.' : 'Booking cancelled by customer.';
        const reason = data.reason ? String(data.reason).trim() : defaultReason;
        item.status = 'cancelled';
        item.cancellation = {
          reason,
          cancelledBy: actorName,
          cancelledAt: now
        };
        item.timeline.push({
          status: 'cancelled',
          label: isProv ? 'Lead Declined by Provider' : 'Service Booking Cancelled',
          timestamp: now,
          notes: `Reason: ${reason}`,
          updatedBy: actorName
        });
        await item.save();
        try {
          await Lead.updateOne({ note: new RegExp(escapeRegex(item.requestId)) }, { status: 'cancelled' });
        } catch (e) {}
        return json({ ok: true, message: isProv ? 'Lead has been declined and cancelled.' : 'Service request cancelled.', item });
      }

      // Dispute
      if(action === 'dispute'){
        const reason = data.reason ? String(data.reason).trim() : 'Issue reported with service.';
        item.status = 'disputed';
        item.dispute = {
          reason,
          status: 'open',
          raisedAt: now
        };
        item.timeline.push({
          status: 'disputed',
          label: 'Dispute Raised',
          timestamp: now,
          notes: `Dispute filed: ${reason}`,
          updatedBy: actorName
        });
        await item.save();
        return json({ ok: true, message: 'Dispute submitted. Our support team will review this shortly.', item });
      }

      // Resolve Dispute
      if(action === 'resolve-dispute'){
        if(item.dispute){
          item.dispute.status = 'resolved';
          item.dispute.resolvedAt = now;
          item.dispute.notes = data.resolutionNotes ? String(data.resolutionNotes).trim() : 'Resolved by agreement';
        }
        item.status = data.targetStatus || 'completed';
        item.timeline.push({
          status: item.status,
          label: 'Dispute Resolved',
          timestamp: now,
          notes: data.resolutionNotes || 'Dispute was successfully resolved.',
          updatedBy: actorName
        });
        await item.save();
        return json({ ok: true, message: 'Dispute resolved.', item });
      }

      // Interior Project Lifecycle Actions
      if(action.startsWith('interior_') || action.startsWith('interior-')){
        const subAction = action.replace(/^interior[-_]/, '');
        if(!item.interiorProject){
          item.interiorProject = JSON.parse(JSON.stringify(sampleInteriorProject));
        }
        item.interiorProject.projectId = item.requestId;

        // 6. Floor-plan uploads & updates
        if(subAction === 'update_floorplan' || subAction === 'floorplan'){
          item.interiorProject.floorPlan = {
            filename: data.filename || item.interiorProject.floorPlan?.filename || 'FloorPlan.pdf',
            url: data.url || item.interiorProject.floorPlan?.url || '/photos/apartment-1.jpg',
            uploadedAt: now.toISOString().split('T')[0],
            carpetArea: Number(data.carpetArea) || item.interiorProject.floorPlan?.carpetArea || 1200,
            roomsCount: data.roomsCount || item.interiorProject.floorPlan?.roomsCount || '3 BHK',
            notes: data.notes || 'Updated floor plan uploaded by customer.'
          };
          item.timeline.push({
            status: item.status,
            label: 'Floor Plan Uploaded',
            timestamp: now,
            notes: `Floor plan uploaded for ${item.interiorProject.floorPlan.carpetArea} sq.ft (${item.interiorProject.floorPlan.roomsCount}).`,
            updatedBy: actorName
          });
          item.markModified('interiorProject');
          await item.save();
          return json({ ok: true, message: 'Floor plan uploaded successfully.', item });
        }

        // 9. Design proposals submission
        if(subAction === 'submit_proposal' || subAction === 'proposal'){
          const proposalId = `PROP-${String((item.interiorProject.proposals?.length || 0) + 1).padStart(2, '0')}`;
          const newProposal = {
            proposalId,
            title: data.title || `3D Design Proposal v${(item.interiorProject.proposals?.length || 0) + 1}.0`,
            version: data.version || `v${(item.interiorProject.proposals?.length || 0) + 1}.0`,
            submittedAt: now,
            status: 'pending',
            renders: Array.isArray(data.renders) && data.renders.length ? data.renders : ['/photos/living-1.jpg', '/photos/kitchen-1.jpg'],
            moodboard: Array.isArray(data.moodboard) ? data.moodboard : ['/photos/living-2.jpg'],
            layoutPlan: data.layoutPlan || '2D Furniture and Space Plan layout',
            materials: Array.isArray(data.materials) ? data.materials : [],
            notes: data.notes || '',
            feedback: ''
          };
          if(!Array.isArray(item.interiorProject.proposals)) item.interiorProject.proposals = [];
          item.interiorProject.proposals.push(newProposal);
          item.timeline.push({
            status: item.status,
            label: 'Design Proposal Submitted',
            timestamp: now,
            notes: `Designer submitted ${newProposal.title} with 3D renderings and material palette.`,
            updatedBy: actorName
          });
          item.markModified('interiorProject');
          await item.save();
          return json({ ok: true, message: 'Design proposal submitted successfully.', item });
        }

        // 11. Customer approvals for Design Proposals
        if(subAction === 'approve_proposal'){
          const proposalId = data.proposalId;
          const status = data.approved === false ? 'revision_requested' : 'approved';
          const feedback = data.feedback ? String(data.feedback).trim() : (status === 'approved' ? 'Design proposal approved by customer.' : 'Customer requested revisions.');
          if(Array.isArray(item.interiorProject.proposals)){
            const prop = item.interiorProject.proposals.find(p => p.proposalId === proposalId) || item.interiorProject.proposals[item.interiorProject.proposals.length - 1];
            if(prop){
              prop.status = status;
              prop.feedback = feedback;
              prop.reviewedAt = now;
            }
          }
          if(!Array.isArray(item.interiorProject.approvals)) item.interiorProject.approvals = [];
          item.interiorProject.approvals.push({
            approvalType: '3D Design Proposal Signoff',
            title: `Proposal ${proposalId || 'Latest'} - ${status === 'approved' ? 'Approved' : 'Revision Requested'}`,
            status: status === 'approved' ? 'approved' : 'rejected',
            approvedAt: now,
            notes: feedback
          });
          item.timeline.push({
            status: item.status,
            label: status === 'approved' ? 'Design Proposal Approved' : 'Design Revision Requested',
            timestamp: now,
            notes: feedback,
            updatedBy: actorName
          });
          item.markModified('interiorProject');
          await item.save();
          return json({ ok: true, message: status === 'approved' ? 'Design proposal approved!' : 'Revision request submitted.', item });
        }

        // 10 & 11. Project milestones & Customer milestone sign-off
        if(subAction === 'approve_milestone' || subAction === 'milestone_signoff'){
          const milestoneId = data.milestoneId;
          if(Array.isArray(item.interiorProject.milestones)){
            const ms = item.interiorProject.milestones.find(m => m.milestoneId === milestoneId);
            if(ms){
              ms.approvedByCustomer = true;
              ms.approvedAt = now;
              ms.status = 'completed';
            }
          }
          if(!Array.isArray(item.interiorProject.approvals)) item.interiorProject.approvals = [];
          item.interiorProject.approvals.push({
            approvalType: 'Milestone Completion Signoff',
            title: `Milestone ${milestoneId} Approved`,
            status: 'approved',
            approvedAt: now,
            notes: data.notes || 'Customer inspected site and signed off milestone.'
          });
          item.timeline.push({
            status: item.status,
            label: `Milestone ${milestoneId} Approved`,
            timestamp: now,
            notes: `Customer signed off milestone ${milestoneId}.`,
            updatedBy: actorName
          });
          item.markModified('interiorProject');
          await item.save();
          return json({ ok: true, message: `Milestone ${milestoneId} approved successfully.`, item });
        }

        // 12. Progress tracking - Add supervisor daily photo log & update %
        if(subAction === 'add_progress' || subAction === 'progress_update'){
          const newPercent = Number(data.percentComplete) || item.interiorProject.percentComplete || 68;
          item.interiorProject.percentComplete = Math.min(100, Math.max(0, newPercent));
          const newUpdate = {
            updateId: `UPD-${Date.now().toString().slice(-4)}`,
            date: now.toISOString().split('T')[0],
            percentComplete: item.interiorProject.percentComplete,
            dayNumber: Number(data.dayNumber) || (item.interiorProject.currentDay || 26) + 1,
            totalDays: item.interiorProject.totalDays || 45,
            title: data.title || 'On-site execution update',
            description: data.description || 'Supervisor verified modular woodwork alignment and electrical conduits.',
            photos: Array.isArray(data.photos) && data.photos.length ? data.photos : ['/photos/kitchen-1.jpg'],
            supervisor: actorName
          };
          if(!Array.isArray(item.interiorProject.progressUpdates)) item.interiorProject.progressUpdates = [];
          item.interiorProject.progressUpdates.unshift(newUpdate);
          item.timeline.push({
            status: item.status,
            label: `Progress Update: ${item.interiorProject.percentComplete}% Complete`,
            timestamp: now,
            notes: newUpdate.title,
            updatedBy: actorName
          });
          item.markModified('interiorProject');
          await item.save();
          return json({ ok: true, message: 'Progress update posted successfully.', item });
        }

        // 13. Milestone invoice payment
        if(subAction === 'pay_milestone' || subAction === 'pay_invoice'){
          const invNum = data.invoiceNumber;
          if(Array.isArray(item.interiorProject.invoices)){
            const inv = item.interiorProject.invoices.find(i => i.invoiceNumber === invNum);
            if(inv){
              inv.status = 'paid';
              inv.paidAt = now.toISOString().split('T')[0];
              inv.paymentMethod = data.paymentMethod || 'Online UPI Payment (Verified)';
            }
          }
          if(Array.isArray(item.interiorProject.milestones)){
            const ms = item.interiorProject.milestones.find(m => m.invoiceNumber === invNum);
            if(ms) ms.paymentStatus = 'paid';
          }
          item.interiorProject.amountPaid = (item.interiorProject.amountPaid || 0) + (Number(data.amount) || 0);
          item.interiorProject.amountDue = Math.max(0, (item.interiorProject.contractValue || 0) - item.interiorProject.amountPaid);
          item.timeline.push({
            status: item.status,
            label: `Milestone Payment Received (${invNum})`,
            timestamp: now,
            notes: `Payment received for ${invNum} via ${data.paymentMethod || 'Online Payment'}.`,
            updatedBy: actorName
          });
          item.markModified('interiorProject');
          await item.save();
          return json({ ok: true, message: 'Milestone payment recorded successfully.', item });
        }

        // 14. Project completion & 10-year warranty certificate
        if(subAction === 'complete_project' || subAction === 'handover'){
          item.interiorProject.status = 'completed';
          item.interiorProject.percentComplete = 100;
          item.interiorProject.warranty = {
            certificateId: `WAR-UF-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
            years: 10,
            issueDate: now.toISOString().split('T')[0],
            coverageSummary: '10-Year Comprehensive Warranty against termites, borer and hardware malfunction on all BWP Marine Plywood and soft-close fittings.',
            snagListStatus: 'All 108 Snag Checklist Items Verified & Cleared'
          };
          item.status = 'completed';
          item.timeline.push({
            status: 'completed',
            label: 'Project Handover Complete & 10-Year Warranty Issued',
            timestamp: now,
            notes: `Formal handover complete. Warranty certificate ${item.interiorProject.warranty.certificateId} issued.`,
            updatedBy: actorName
          });
          item.markModified('interiorProject');
          await item.save();
          return json({ ok: true, message: 'Interior project completed and 10-year warranty generated!', item });
        }
      }
      // Generic update (notes, etc.)
      if(data.notes) item.description = String(data.notes).trim();
      await item.save();
      return json({ ok: true, item });
    }
  }


  if(root === 'interior-project'){
    if(method === 'GET'){
      if(key){
        const query = mongoose.isValidObjectId(key) ? { _id: key } : { requestId: key };
        const found = await ServiceRequest.findOne(query).lean();
        if(found && found.interiorProject){
          return json({ ok: true, project: found.interiorProject, request: found });
        }
      }
      return json({ ok: true, project: sampleInteriorProject });
    }

    if(method === 'PATCH' || method === 'POST'){
      const data = await body(req);
      if(key && key !== 'demo' && key !== sampleInteriorProject.projectId){
        const query = mongoose.isValidObjectId(key) ? { _id: key } : { requestId: key };
        const item = await ServiceRequest.findOne(query);
        if(item){
          // if body contains interior action, apply it
          if(data.action){
            const action = String(data.action).toLowerCase();
            // will be handled cleanly
          }
        }
      }
      return json({ ok: true, message: 'Interior project action recorded.', project: sampleInteriorProject });
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
   if(method==='GET'&&!key){
    let filter={};
    if(user.role==='admin'){
      filter={};
    }else if(['owner','broker','builder','channel_partner'].includes(user.role)){
      const myProps=await Property.find({owner:user._id}).distinct('_id');
      filter={$or:[{manager:user._id},{user:user._id},{property:{$in:myProps}}]};
    }else{
      filter={user:user._id};
    }
    if(q.get('source')) filter.source=q.get('source');
    if(q.get('status')) filter.status=q.get('status');
    if(q.get('search')){
      const rg=new RegExp(escapeRegex(q.get('search').trim()),'i');
      filter.$and = filter.$and || [];
      filter.$and.push({$or:[{name:rg},{phone:rg},{email:rg},{city:rg}]});
    }
    if(q.get('channelPartner')==='true'||q.get('cp')==='true'){
      const cpUsers=await User.find({role:'channel_partner'}).distinct('_id');
      const cpProps=cpUsers.length?await Property.find({owner:{$in:cpUsers}}).distinct('_id'):[];
      filter.$and=filter.$and||[];
      filter.$and.push({$or:[{manager:{$in:cpUsers}},{user:{$in:cpUsers}},{property:{$in:cpProps}},{assignedTeamMember:{$exists:true,$ne:''}}]});
    }
    return json(await paginate(Lead,filter,q,[
      {path:'project',select:'title'},
      {path:'design',select:'title'},
      {path:'manager',select:'name email role company phone reraId'},
      {path:'property',select:'title locality city price images purpose type owner',populate:{path:'owner',select:'name email role company phone reraId'}}
    ]));
   }
   if(method==='POST'&&!key){
    await throttle(`lead:${user._id}`,20);
    const data=await body(req);
    if(data.source&&['phone','message','enquiry'].includes(data.source)){
      let manager=data.manager;
      if(!manager&&data.property){
        const prop=await record(Property,data.property);
        manager=prop.owner;
      }
      const item=await Lead.create({
        user:user._id,
        manager:manager||user._id,
        property:data.property||undefined,
        source:data.source,
        kind:'property',
        name:data.name||user.name,
        phone:data.phone||user.phone||'',
        email:data.email||user.email||'',
        city:data.city||'Bengaluru',
        note:data.note||'',
        status:'new',
        notes:data.note?[{author:user.name,text:data.note,createdAt:new Date()}]:[]
      });
      if(manager&&!eq(manager,user._id)) await notify(manager,`New ${data.source} contact received`,`${item.name} contacted you regarding your listing.`,'/dashboard/leads');
      return json(item,201);
    }
    const input=leadSchema.parse(data);if(input.preferredAt&&new Date(input.preferredAt)<=new Date())fail('Choose a future consultation time.');let manager;
    if(input.kind==='project'){if(!input.project)fail('Project is required.');const p=await record(Project,input.project);if(p.status!=='approved')fail('Project unavailable.',404);manager=p.manager;}
    else{if(input.design)await record(Design,input.design);manager=(await User.findOne({role:'admin',active:true}))?._id;if(!manager)fail('No interior coordinator available.',503);}
    const item=await Lead.create({...input,project:input.kind==='project'?input.project:undefined,design:input.kind==='interior'?input.design:undefined,user:user._id,manager,estimate:input.kind==='interior'?estimateInterior(input.homeSize,input.service,input.finish):undefined});await notify(manager,`New ${input.kind} enquiry`,`${user.name} requested a consultation.`,'/dashboard/leads');await notify(user._id,'Your enquiry is received','Track the response in your dashboard.','/dashboard/leads');return json(item,201);
   }
   if(method==='PATCH'&&key){
    const item=await record(Lead,key);
    const myProps=await Property.find({owner:user._id}).distinct('_id');
    const isOwnerOrPartner=item.property&&myProps.some(p=>eq(p,item.property));
    if(!canManage(user,item.manager)&&!isOwnerOrPartner&&!(user.role==='channel_partner'&&eq(item.user,user._id)))fail('Only the assigned manager can update this enquiry.',403);
    const {status,note,assignedTeamMember}=await body(req);
    if(status){
      if(!['new','uncontacted','contacted','interested','consultation','site_visit_scheduled','negotiation','deal_closed','converted','design','execution','completed','closed','lost','dropped'].includes(status))fail('Invalid enquiry status.');
      if(!item.contactedAt && status !== 'new' && status !== 'uncontacted') item.contactedAt = new Date();
      item.status=status;
    }
    if(typeof assignedTeamMember==='string') item.assignedTeamMember=assignedTeamMember.trim();
    if(typeof note==='string'&&note.trim()){
      item.note=note.slice(0,2000);
      item.notes.push({author:user.name,text:note.trim(),createdAt:new Date()});
    }
    await item.save();
    try {
      const partner = await ChannelPartner.findOne({
        $or: [
          { user: user._id },
          { user: item.manager },
          ...(item.assignedTeamMember ? [{ 'team.name': item.assignedTeamMember }] : [])
        ]
      });
      if (partner && partner.team && partner.team.length > 0) {
        const pOwner = partner.user;
        const partnerProps = await Property.find({ owner: pOwner }).distinct('_id');
        const pFilter = { $or: [{ manager: pOwner }, { user: pOwner }, { property: { $in: partnerProps } }] };
        for (const member of partner.team) {
          member.assignedLeadsCount = await Lead.countDocuments({
            ...pFilter,
            assignedTeamMember: member.name
          });
        }
        await partner.save();
      }
    } catch (err) {
      console.warn('Failed to sync team member lead count:', err);
    }
    if(item.user) await notify(item.user,'Enquiry updated',`Your ${item.kind||'lead'} enquiry is now ${item.status}.`,'/dashboard/leads');
    return json(item);
   }
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
 
  if(root==='channel-partner'){
   const user=await requireUser(['channel_partner','admin','broker','builder']);
   let partner=await ChannelPartner.findOne({user:user._id});
   if(!partner){
     partner=await ChannelPartner.create({
       user:user._id,
       company:user.company||'Apex Realty Network',
       reraId:user.reraId||'KA/RERA/AGENT/2024/00842',
       phone:user.phone||'+91 98765 43210',
       email:user.email,
       city:'Bengaluru',
       tier:'Gold',
       team:[
         { name: 'Rohit Verma', role: 'Senior Property Advisor', email: 'rohit@agency.demo', phone: '+91 98765 43210', status: 'active', assignedLeadsCount: 4, createdAt: new Date() },
         { name: 'Ananya Deshmukh', role: 'Luxury Housing Specialist', email: 'ananya@agency.demo', phone: '+91 98765 43211', status: 'active', assignedLeadsCount: 2, createdAt: new Date() },
         { name: 'Kunal Singhania', role: 'Commercial Spaces Lead', email: 'kunal@agency.demo', phone: '+91 98765 43212', status: 'active', assignedLeadsCount: 1, createdAt: new Date() }
       ]
     });
   }
   if(!key&&method==='GET'){
     const myProps=await Property.find({owner:user._id}).distinct('_id');
     const leadFilter={$or:[{manager:user._id},{user:user._id},{property:{$in:myProps}}]};
     if(partner.team&&partner.team.length>0){
       let changed=false;
       for(const member of partner.team){
         const count=await Lead.countDocuments({...leadFilter,assignedTeamMember:member.name});
         if(member.assignedLeadsCount!==count){
           member.assignedLeadsCount=count;
           changed=true;
         }
       }
       if(changed) await partner.save();
     }
     const [totalLeads,phoneLeads,messageLeads,enquiryLeads,propertiesCount,pendingPropertiesCount,ticketsCount,openTicketsCount]=await Promise.all([
       Lead.countDocuments(leadFilter),
       Lead.countDocuments({...leadFilter,source:'phone'}),
       Lead.countDocuments({...leadFilter,source:'message'}),
       Lead.countDocuments({...leadFilter,source:'enquiry'}),
       Property.countDocuments({owner:user._id}),
       Property.countDocuments({owner:user._id,status:'pending'}),
       SupportTicket.countDocuments({user:user._id}),
       SupportTicket.countDocuments({user:user._id,status:{$in:['open','in_progress']}})
     ]);
     return json({
       partner,
       stats:{
         totalLeads,
         phoneLeads,
         messageLeads,
         enquiryLeads,
         propertiesCount,
         pendingPropertiesCount,
         teamCount:partner.team?.length||0,
         ticketsCount,
         openTicketsCount
       }
     });
   }
   if(!key&&method==='PATCH'){
     const data=await body(req);
     if(data.company) { partner.company=data.company; user.company=data.company; }
     if(data.reraId) { partner.reraId=data.reraId; user.reraId=data.reraId; }
     if(data.phone) { partner.phone=data.phone; user.phone=data.phone; }
     if(data.email) partner.email=data.email;
     if(data.city) partner.city=data.city;
     if(data.bio) { partner.bio=data.bio; user.bio=data.bio; }
     await Promise.all([partner.save(),user.save()]);
     return json({ok:true,partner});
   }
   if(key==='team'&&method==='POST'){
     const data=await body(req);
     if(!data.name||!data.name.trim()) fail('Member name is required.');
     partner.team.push({
       name:data.name.trim(),
       role:data.role||'Property Advisor',
       email:data.email||'',
       phone:data.phone||'',
       status:data.status||'active',
       assignedLeadsCount:0,
       createdAt:new Date()
     });
     await partner.save();
     return json({ok:true,team:partner.team},201);
   }
   if(key==='team'&&method==='PATCH'&&action){
     const data=await body(req);
     const member=partner.team.id(action);
     if(!member) fail('Team member not found.',404);
     if(data.name) member.name=data.name.trim();
     if(data.role) member.role=data.role;
     if(data.email!==undefined) member.email=data.email;
     if(data.phone!==undefined) member.phone=data.phone;
     if(data.status) member.status=data.status;
     await partner.save();
     return json({ok:true,team:partner.team});
   }
   if(key==='team'&&method==='DELETE'&&action){
     partner.team.pull({_id:action});
     await partner.save();
     return json({ok:true,team:partner.team});
   }
  }
  if(root==='support-tickets'){
   const user=await requireUser();
   if(!key&&method==='GET'){
     const filter=user.role==='admin'?{}:{user:user._id};
     if(q.get('status')) filter.status=q.get('status');
     return json(await paginate(SupportTicket,filter,q,[{path:'property',select:'title city locality'},{path:'user',select:'name company role email'}]));
   }
   if(!key&&method==='POST'){
     const data=await body(req);
     if(!data.subject||!data.subject.trim()) fail('Ticket subject is required.');
     if(!data.message||!data.message.trim()) fail('Ticket message is required.');
     const ticketNumber=`CP-${Math.floor(100000+Math.random()*900000)}`;
     const ticket=await SupportTicket.create({
       user:user._id,
       ticketNumber,
       category:data.category||'Listing Review',
       priority:data.priority||'medium',
       subject:data.subject.trim(),
       message:data.message.trim(),
       property:data.property||undefined,
       status:'open',
       responses:[]
     });
     for(const admin of await User.find({role:'admin',active:true})) {
       await notify(admin._id,`New Support Ticket ${ticketNumber}`,`${user.name}: ${data.subject.slice(0,80)}`,`/admin?tab=support&ticketId=${ticket._id}`);
     }
     return json(ticket,201);
   }
   if(key&&action==='reply'&&method==='POST'){
     const ticket=await record(SupportTicket,key);
     const data=await body(req);
     if(!data.message||!data.message.trim()) fail('Message is required.');
     ticket.responses.push({
       sender:user._id,
       senderName:user.name,
       role:user.role,
       message:data.message.trim(),
       createdAt:new Date()
     });
     if(user.role==='admin'&&ticket.status==='open') ticket.status='in_progress';
     await ticket.save();
     const recipient=user.role==='admin'?ticket.user:((await User.findOne({role:'admin'}))?._id||user._id);
     await notify(recipient,`Update on Ticket ${ticket.ticketNumber}`,`${user.name}: ${data.message.slice(0,80)}`,'/dashboard/support');
     return json(ticket);
   }
   if(key&&method==='PATCH'){
     const ticket=await record(SupportTicket,key);
     const data=await body(req);
     if(data.status){
       if(!['open','in_progress','resolved','closed'].includes(data.status)) fail('Invalid status.');
       ticket.status=data.status;
     }
     await ticket.save();
     return json(ticket);
   }
  }
  if(root==='uploads'&&method==='POST'){
  const user=await requireUser(['owner','broker','channel_partner','builder','user','admin']);await throttle(`upload:${user._id}`,120);
  const form=await req.formData();
  const filesList = form.getAll('files').filter(f => f && typeof f !== 'string');
  const fileList = form.getAll('file').filter(f => f && typeof f !== 'string');
  const rawFiles = filesList.length > 0 ? filesList : fileList;
  if(rawFiles.length === 0) fail('Choose a JPEG, PNG or WebP image, up to 5 MB.');
  const directory=path.join(process.cwd(),'storage','uploads');
  await mkdir(directory,{recursive:true});
  const urls = [];
  for(const file of rawFiles){
   if(file.size>5*1024*1024||file.size<12)fail('Choose a JPEG, PNG or WebP image, up to 5 MB.');
   const bytes=Buffer.from(await file.arrayBuffer());let ext;
   if(bytes[0]===0xff&&bytes[1]===0xd8&&bytes[2]===0xff)ext='jpg';
   else if(bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))ext='png';
   else if(bytes.toString('ascii',0,4)==='RIFF'&&bytes.toString('ascii',8,12)==='WEBP')ext='webp';
   else fail('Image file signature is invalid.');
   const name=`${randomUUID()}.${ext}`;
   await writeFile(path.join(directory,name),bytes,{flag:'wx'});
   urls.push(`/uploads/${name}`);
  }
  return json({url:urls[0],urls},201);
 }
 if(root==='dashboard'&&method==='GET'){
  const user=await requireUser();const filter=user.role==='admin'?{}:{owner:user._id};return json({properties:await Property.countDocuments(filter),pending:await Property.countDocuments({...filter,status:'pending'}),favorites:user.favorites.length,visits:await Visit.countDocuments({$or:[{user:user._id},{owner:user._id}],status:{$in:['requested','confirmed']}}),enquiries:await Lead.countDocuments(user.role==='admin'?{}:{$or:[{user:user._id},{manager:user._id}]}),messages:await Thread.countDocuments({participants:user._id}),savedSearches:await SavedSearch.countDocuments({user:user._id}),bookings:await ServiceRequest.countDocuments(user.role==='admin'?{}:(user.role==='service_provider'||user.role==='service-provider')?(user.serviceCategory?{$or:[{categorySlug:user.serviceCategory},{assignedSpecialistId:String(user._id)},{user:user._id}]}:{}):{$or:[{user:user._id},{phone:user.phone},{email:user.email},{assignedSpecialistId:String(user._id)}]})});
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
  if(key==='stats'&&method==='GET'){
    const [users,properties,pending,projects,leads,designs,channelPartners,brokers,openTickets]=await Promise.all([
      User.countDocuments(),
      Property.countDocuments(),
      Property.countDocuments({status:'pending'}),
      Project.countDocuments(),
      Lead.countDocuments(),
      Design.countDocuments(),
      User.countDocuments({role:'channel_partner'}),
      User.countDocuments({role:'broker'}),
      SupportTicket.countDocuments({status:{$in:['open','in_progress']}})
    ]);
    const cpUsers=await User.find({role:'channel_partner'}).distinct('_id');
    const cpProps=cpUsers.length?await Property.find({owner:{$in:cpUsers}}).distinct('_id'):[];
    const cpLeadFilter=cpUsers.length>0
      ? {$or:[{manager:{$in:cpUsers}},{user:{$in:cpUsers}},{property:{$in:cpProps}},{assignedTeamMember:{$exists:true,$ne:''}}]}
      : {assignedTeamMember:{$exists:true,$ne:''}};
    const [channelPartnerLeads,channelPartnerProperties]=await Promise.all([
      Lead.countDocuments(cpLeadFilter),
      Property.countDocuments({$or:[{owner:{$in:cpUsers}},{ownership:'channel_partner'}]})
    ]);
    return json({users,properties,pending,projects,leads,designs,channelPartners,channelPartnerLeads,channelPartnerProperties,openTickets,brokers});
  }
  if(key==='users'){
   if(method==='GET'){
    let uFilter = {};
    if(q.get('role')) uFilter.role = q.get('role');
    if(q.get('q')){ const rg = new RegExp(String(q.get('q')).trim(), 'i'); uFilter.$or = [{name:rg},{email:rg},{company:rg},{phone:rg},{reraId:rg}]; }
    const data = await paginate(User, uFilter, q, null);
     const uids = data.items.map(u => u._id);
     const counts = await Property.aggregate([
       { $match: { owner: { $in: uids } } },
       { $group: { _id: '$owner', count: { $sum: 1 } } }
     ]);
     const countMap = Object.fromEntries(counts.map(c => [String(c._id), c.count]));
     const partners = await ChannelPartner.find({ user: { $in: uids } });
     const partnerMap = Object.fromEntries(partners.map(p => [String(p.user), p]));

     data.items = await Promise.all(data.items.map(async (u) => {
       const base = {
         ...publicUser(u),
         propertiesCount: countMap[String(u._id)] || 0
       };
       if (u.role === 'channel_partner') {
         let cp = partnerMap[String(u._id)];
         if (!cp) {
           cp = await ChannelPartner.create({
             user: u._id,
             company: u.company || 'Channel Partner Network',
             reraId: u.reraId || 'PENDING-RERA',
             phone: u.phone || '',
             email: u.email,
             city: 'Bengaluru',
             tier: 'Gold',
             team: []
           });
         }
         const partnerProps = await Property.find({ owner: u._id }).distinct('_id');
         const leadsCount = await Lead.countDocuments({ $or: [{ manager: u._id }, { user: u._id }, { property: { $in: partnerProps } }] });
         return {
           ...base,
           tier: cp.tier || 'Gold',
           verified: cp.verified !== undefined ? cp.verified : true,
           team: cp.team || [],
           teamCount: cp.team?.length || 0,
           leadsCount,
           partnerId: cp._id,
           channelPartner: cp
         };
       }
       return base;
     }));
     return json(data);
   }
   if(method==='PATCH'&&action){
     const item=await record(User,action);
     if(eq(item._id,user._id))fail('You cannot change your own administrative access.');
     const data=await body(req);
     if(data.role!==undefined){
       if(!['user','owner','broker','channel_partner','builder','admin'].includes(data.role))fail('Invalid role.');
       if(data.role==='user'&&await Property.exists({owner:item._id,status:{$ne:'archived'}}))fail('Archive this owner’s listings before changing them to a user.');
       item.role=data.role;
     }
     if(typeof data.active==='boolean')item.active=data.active;
     if(data.company) item.company=data.company;
     if(data.reraId) item.reraId=data.reraId;
     if(data.tier||typeof data.verified==='boolean'||data.company||data.reraId||item.role==='channel_partner'){
       let partner=await ChannelPartner.findOne({user:item._id});
       if(!partner&&(item.role==='channel_partner'||data.role==='channel_partner')){
         partner=await ChannelPartner.create({
           user: item._id,
           company: data.company||item.company||'Channel Partner Network',
           reraId: data.reraId||item.reraId||'PENDING-RERA',
           phone: item.phone||'',
           email: item.email,
           city: 'Bengaluru',
           tier: data.tier||'Gold',
           team: []
         });
       }
       if(partner){
         if(data.tier&&['Silver','Gold','Platinum'].includes(data.tier)) partner.tier=data.tier;
         if(typeof data.verified==='boolean') partner.verified=data.verified;
         if(data.company) partner.company=data.company;
         if(data.reraId) partner.reraId=data.reraId;
         await partner.save();
       }
     }
     await item.save();
     await Session.deleteMany({user:item._id});
     return json(publicUser(item));
   }
  }
  if(key==='channel-partners'){
   if(method==='GET'&&action){
     let partner=await ChannelPartner.findOne({$or:[{_id:id(action)},{user:id(action)}]}).populate('user','name email role company phone reraId active');
     if(!partner){
       const usr=await User.findById(id(action));
       if(usr&&usr.role==='channel_partner'){
         partner=await ChannelPartner.create({
           user: usr._id,
           company: usr.company||'Channel Partner Network',
           reraId: usr.reraId||'PENDING-RERA',
           phone: usr.phone||'',
           email: usr.email,
           city: 'Bengaluru',
           tier: 'Gold',
           team: []
         });
         partner=await ChannelPartner.findById(partner._id).populate('user','name email role company phone reraId active');
       } else fail('Channel partner not found.', 404);
     }
     const uid=partner.user?._id||partner.user;
     const partnerProps=uid?await Property.find({owner:uid}).distinct('_id'):[];
     const [propertiesCount,leadsCount]=await Promise.all([
       uid?Property.countDocuments({owner:uid}):0,
       uid?Lead.countDocuments({$or:[{manager:uid},{user:uid},{property:{$in:partnerProps}}]}):0
     ]);
     const resObj=partner.toObject?partner.toObject():partner;
     resObj.propertiesCount=propertiesCount;
     resObj.teamCount=partner.team?.length||0;
     resObj.leadsCount=leadsCount;
     return json(resObj);
   }
   if(method==='GET'){
     const cpFilter={};
     if(q.get('tier')) cpFilter.tier=q.get('tier');
     if(q.get('q')){ const rg=new RegExp(String(q.get('q')).trim(),'i'); cpFilter.$or=[{company:rg},{reraId:rg},{city:rg},{email:rg},{phone:rg}]; }
     const data=await paginate(ChannelPartner,cpFilter,q,{path:'user',select:'name email role company phone reraId active'});
     const uids=data.items.map(cp=>cp.user?._id||cp.user).filter(Boolean);
     const counts=await Property.aggregate([
       {$match:{owner:{$in:uids}}},
       {$group:{_id:'$owner',count:{$sum:1}}}
     ]);
     const countMap=Object.fromEntries(counts.map(c=>[String(c._id),c.count]));
     data.items=await Promise.all(data.items.map(async cp=>{
       const uid=cp.user?._id||cp.user;
       const partnerProps=uid?await Property.find({owner:uid}).distinct('_id'):[];
       const leadsCount=uid?await Lead.countDocuments({$or:[{manager:uid},{user:uid},{property:{$in:partnerProps}}]}):0;
       const obj=cp.toObject?cp.toObject():cp;
       return {
         ...obj,
         propertiesCount:countMap[String(uid)]||0,
         teamCount:cp.team?.length||0,
         leadsCount
       };
     }));
     return json(data);
   }
   if(method==='PATCH'&&action){
     let partner=await ChannelPartner.findOne({$or:[{_id:id(action)},{user:id(action)}]});
     if(!partner){
       const usr=await User.findById(id(action));
       if(usr&&usr.role==='channel_partner'){
         partner=await ChannelPartner.create({
           user: usr._id,
           company: usr.company||'Channel Partner Network',
           reraId: usr.reraId||'PENDING-RERA',
           phone: usr.phone||'',
           email: usr.email,
           city: 'Bengaluru',
           tier: 'Gold',
           team: []
         });
       } else fail('Channel partner not found.', 404);
     }
     const data=await body(req);
     if(data.tier!==undefined){
       if(!['Silver','Gold','Platinum'].includes(data.tier)) fail('Invalid tier.');
       partner.tier=data.tier;
     }
     if(typeof data.verified==='boolean') partner.verified=data.verified;
     if(data.company) partner.company=data.company;
     if(data.reraId) partner.reraId=data.reraId;
     await partner.save();
     if(partner.user){
       const usr=await User.findById(partner.user);
       if(usr){
         if(typeof data.active==='boolean') usr.active=data.active;
         if(data.company) usr.company=data.company;
         if(data.reraId) usr.reraId=data.reraId;
         await usr.save();
       }
     }
     const updated=await ChannelPartner.findById(partner._id).populate('user','name email role company phone reraId active');
     return json(updated);
   }
  }
  if(['properties','projects','designs'].includes(key)){
   const Model={properties:Property,projects:Project,designs:Design}[key];
   if(method==='GET'&&action){ const item=await record(Model,action); const result=item.toObject(); if(key==='properties') result.owner=await User.findById(item.owner).select('name email role company phone reraId'); return json(result); }
   if(method==='GET'){ const f = {}; if(q.get('status')) f.status = q.get('status'); if(q.get('owner')) f.owner = id(q.get('owner')); if(q.get('purpose')) f.purpose = q.get('purpose'); if(q.get('q')){ const rg = new RegExp(String(q.get('q')).trim(),'i'); f.$or=[{title:rg},{city:rg},{locality:rg}]; } return json(await paginate(Model, f, q, key === 'properties' ? { path: 'owner', select: 'name email role company phone reraId' } : null)); }
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
