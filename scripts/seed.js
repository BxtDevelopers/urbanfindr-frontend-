import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { pathToFileURL } from 'node:url';
import { db } from '../lib/db.js';
import { User, Property, Project, Design, Thread, Message, Visit, Lead, Notification, SavedSearch, ServiceProvider } from '../lib/models.js';
import { initialServiceProviders } from '../lib/serviceProviders.js';
import { estimateInterior } from '../lib/validation.js';
import { propertyGallery, projectGallery, designPhoto } from '../lib/media.js';

export async function seed() {
  if (process.env.ALLOW_DEMO_SEED !== 'true') {
    throw new Error('Set ALLOW_DEMO_SEED=true only on a disposable local demo database.');
  }
  const password = process.env.DEMO_PASSWORD;
  if (!password || password.length < 10) {
    throw new Error('Set DEMO_PASSWORD to at least 10 characters.');
  }

  await db();
  const hash = await bcrypt.hash(password, 12);
  const accounts = [
    ['Aarav Mehta', 'user@urbanfinder.demo', 'user', '9000000001'],
    ['Ananya Rao', 'owner@urbanfinder.demo', 'owner', '9000000002'],
    ['Rohan Kapoor', 'owner2@urbanfinder.demo', 'owner', '9000000003'],
    ['UrbanFinder Coordinator', 'admin@urbanfinder.demo', 'admin', '9000000004']
  ];

  const users = [];
  for (const [name, email, role, phone] of accounts) {
    let u = await User.findOne({ email });
    if (!u) u = await User.create({ name, email, role, phone, password: hash });
    users.push(u);
  }
  const [buyer, owner, owner2, admin] = users;

  // Clean existing demo properties and projects to ensure exact counts (10 per city)
  await Property.deleteMany({});
  await Project.deleteMany({});

  const localityCoords = {
    'Gachibowli': { lat: 17.4401, lng: 78.3489 }, 'Kondapur': { lat: 17.4699, lng: 78.3578 },
    'Kokapet': { lat: 17.4111, lng: 78.3322 }, 'Miyapur': { lat: 17.4968, lng: 78.3614 },
    'Banjara Hills': { lat: 17.4156, lng: 78.4350 }, 'Hitec City': { lat: 17.4435, lng: 78.3772 },
    'Madhapur': { lat: 17.4483, lng: 78.3915 }, 'Jubilee Hills': { lat: 17.4319, lng: 78.4073 },
    'Manikonda': { lat: 17.4018, lng: 78.3844 }, 'Kukatpally': { lat: 17.4849, lng: 78.4138 },
    'Indiranagar': { lat: 12.9784, lng: 77.6408 }, 'Whitefield': { lat: 12.9698, lng: 77.7499 },
    'HSR Layout': { lat: 12.9121, lng: 77.6446 }, 'Sarjapur Road': { lat: 12.9242, lng: 77.6835 },
    'Koramangala': { lat: 12.9352, lng: 77.6245 }, 'Electronic City': { lat: 12.8452, lng: 77.6602 },
    'Bellandur': { lat: 12.9304, lng: 77.6784 }, 'Marathahalli': { lat: 12.9591, lng: 77.6974 },
    'Jayanagar': { lat: 12.9308, lng: 77.5838 }, 'Hebbal': { lat: 13.0358, lng: 77.5970 },
    'Powai': { lat: 19.1176, lng: 72.9060 }, 'Andheri West': { lat: 19.1363, lng: 72.8277 },
    'Chembur': { lat: 19.0622, lng: 72.8995 }, 'Thane West': { lat: 19.2183, lng: 72.9781 },
    'Bandra': { lat: 19.0596, lng: 72.8295 }, 'Worli': { lat: 19.0178, lng: 72.8178 },
    'Juhu': { lat: 19.0883, lng: 72.8262 }, 'Malad West': { lat: 19.1874, lng: 72.8484 },
    'Goregaon': { lat: 19.1663, lng: 72.8526 }, 'BKC': { lat: 19.0688, lng: 72.8700 },
    'Baner': { lat: 18.5590, lng: 73.7868 }, 'Wakad': { lat: 18.5987, lng: 73.7687 },
    'Kharadi': { lat: 18.5516, lng: 73.9349 }, 'Hinjewadi': { lat: 18.5913, lng: 73.7389 },
    'Viman Nagar': { lat: 18.5679, lng: 73.9143 }, 'Kothrud': { lat: 18.5074, lng: 73.8077 },
    'Aundh': { lat: 18.5580, lng: 73.8075 }, 'Hadapsar': { lat: 18.5089, lng: 73.9260 },
    'Magarpatta': { lat: 18.5135, lng: 73.9312 }, 'Bavdhan': { lat: 18.5158, lng: 73.7819 },
    'South Extension': { lat: 28.5727, lng: 77.2215 }, 'Dwarka': { lat: 28.5921, lng: 77.0460 },
    'Vasant Kunj': { lat: 28.5244, lng: 77.1588 }, 'Hauz Khas': { lat: 28.5494, lng: 77.2001 },
    'Saket': { lat: 28.5245, lng: 77.2066 }, 'Greater Kailash': { lat: 28.5482, lng: 77.2385 },
    'Lajpat Nagar': { lat: 28.5677, lng: 77.2433 }, 'Rohini': { lat: 28.7159, lng: 77.1158 },
    'Connaught Place': { lat: 28.6315, lng: 77.2167 }, 'Chanakyapuri': { lat: 28.5960, lng: 77.1895 },
    'Golf Course Road': { lat: 28.4595, lng: 77.0967 }, 'DLF Phase 5': { lat: 28.4619, lng: 77.1042 },
    'Cyber City': { lat: 28.4950, lng: 77.0895 }, 'Sohna Road': { lat: 28.4232, lng: 77.0396 },
    'Sector 54': { lat: 28.4395, lng: 77.1086 }, 'Golf Course Ext Road': { lat: 28.4092, lng: 77.0789 },
    'Sector 57': { lat: 28.4262, lng: 77.0892 }, 'MG Road': { lat: 28.4811, lng: 77.0864 },
    'Nirvana Country': { lat: 28.4182, lng: 77.0652 }, 'Sushant Lok': { lat: 28.4651, lng: 77.0759 },
    'Adyar': { lat: 13.0012, lng: 80.2565 }, 'Velachery': { lat: 12.9815, lng: 80.2180 },
    'OMR': { lat: 12.9168, lng: 80.2285 }, 'Anna Nagar': { lat: 13.0850, lng: 80.2101 },
    'T Nagar': { lat: 13.0418, lng: 80.2341 }, 'Besant Nagar': { lat: 13.0003, lng: 80.2667 },
    'Thiruvanmiyur': { lat: 12.9830, lng: 80.2594 }, 'Guindy': { lat: 13.0067, lng: 80.2025 },
    'Alwarpet': { lat: 13.0336, lng: 80.2519 }, 'Nungambakkam': { lat: 13.0569, lng: 80.2425 }
  };

  const places = [
    ['Hyderabad', ['Gachibowli', 'Kondapur', 'Kokapet', 'Miyapur', 'Banjara Hills', 'Hitec City', 'Madhapur', 'Jubilee Hills', 'Manikonda', 'Kukatpally']],
    ['Bengaluru', ['Indiranagar', 'Whitefield', 'HSR Layout', 'Sarjapur Road', 'Koramangala', 'Electronic City', 'Bellandur', 'Marathahalli', 'Jayanagar', 'Hebbal']],
    ['Mumbai', ['Powai', 'Andheri West', 'Chembur', 'Thane West', 'Bandra', 'Worli', 'Juhu', 'Malad West', 'Goregaon', 'BKC']],
    ['Pune', ['Baner', 'Wakad', 'Kharadi', 'Hinjewadi', 'Viman Nagar', 'Kothrud', 'Aundh', 'Hadapsar', 'Magarpatta', 'Bavdhan']],
    ['Delhi', ['South Extension', 'Dwarka', 'Vasant Kunj', 'Hauz Khas', 'Saket', 'Greater Kailash', 'Lajpat Nagar', 'Rohini', 'Connaught Place', 'Chanakyapuri']],
    ['Gurugram', ['Golf Course Road', 'DLF Phase 5', 'Cyber City', 'Sohna Road', 'Sector 54', 'Golf Course Ext Road', 'Sector 57', 'MG Road', 'Nirvana Country', 'Sushant Lok']],
    ['Chennai', ['Adyar', 'Velachery', 'OMR', 'Anna Nagar', 'T Nagar', 'Besant Nagar', 'Thiruvanmiyur', 'Guindy', 'Alwarpet', 'Nungambakkam']],
    ['Delhi NCR', ['Gurugram', 'Noida Sector 150', 'Dwarka', 'Greater Noida', 'Noida Expressway', 'Indirapuram', 'Faridabad', 'Ghaziabad', 'Sector 62 Noida', 'Vasant Kunj']]
  ];

  const homes = [];
  let i = 0;

  for (let cityIdx = 0; cityIdx < places.length; cityIdx++) {
    const [city, localities] = places[cityIdx];
    for (let k = 0; k < 10; k++) {
      const locality = localities[k];
      let purpose = 'rent';
      let bedrooms = 1;
      let type = 'Apartment';
      let transaction = 'lease';
      let title = '';
      let price = 25000;
      let area = 650;
      let sharing = undefined;
      let mealsIncluded = false;
      let availableBeds = 1;

      if (k === 0) {
        purpose = 'rent';
        bedrooms = 1;
        type = 'Apartment';
        title = `1 BHK cozy sunlit home in ${locality}`;
        price = 22000 + (cityIdx * 1200);
        area = 620;
      } else if (k === 1) {
        purpose = 'buy';
        bedrooms = 1;
        type = 'Apartment';
        title = `1 BHK modern studio apartment in ${locality}`;
        price = 5600000 + (cityIdx * 250000);
        area = 680;
      } else if (k === 2) {
        purpose = 'rent';
        bedrooms = 2;
        type = 'Apartment';
        title = `2 BHK garden-facing residence in ${locality}`;
        price = 32000 + (cityIdx * 1500);
        area = 1150;
      } else if (k === 3) {
        purpose = 'buy';
        bedrooms = 2;
        type = 'Apartment';
        title = `2 BHK contemporary home in ${locality}`;
        price = 8500000 + (cityIdx * 350000);
        area = 1220;
      } else if (k === 4) {
        purpose = 'rent';
        bedrooms = 3;
        type = 'Apartment';
        title = `3 BHK spacious luxury flat in ${locality}`;
        price = 45000 + (cityIdx * 2000);
        area = 1680;
      } else if (k === 5) {
        purpose = 'buy';
        bedrooms = 3;
        type = 'Apartment';
        title = `3 BHK skyline view apartment in ${locality}`;
        price = 13500000 + (cityIdx * 500000);
        area = 1750;
      } else if (k === 6) {
        purpose = 'buy';
        bedrooms = 4;
        type = 'Villa';
        title = `4 BHK independent designer villa in ${locality}`;
        price = 24000000 + (cityIdx * 800000);
        area = 2950;
      } else if (k === 7) {
        purpose = 'pg';
        bedrooms = 1;
        type = 'PG';
        sharing = 'Private room';
        mealsIncluded = true;
        availableBeds = 2;
        title = `The Social Nest — 1 BHK co-living in ${locality}`;
        price = 14500 + (cityIdx * 600);
        area = 280;
      } else if (k === 8) {
        purpose = 'commercial';
        bedrooms = 0;
        type = 'Office';
        transaction = 'lease';
        title = `Light-filled corporate office in ${locality}`;
        price = 68000 + (cityIdx * 2500);
        area = 1850;
      } else if (k === 9) {
        purpose = 'commercial';
        bedrooms = 0;
        type = 'Shop';
        transaction = 'sale';
        title = `Prime retail & boutique storefront in ${locality}`;
        price = 17500000 + (cityIdx * 600000);
        area = 1450;
      }

      const data = {
        title,
        owner: i % 2 === 0 ? owner._id : owner2._id,
        description: `A thoughtfully planned ${type.toLowerCase()} in ${locality}, ${city}. Features generous natural light, peaceful surroundings, and convenient access to transit and daily essentials.\n\nVerified direct listing on UrbanFinder. Contact directly to arrange a personalized visit.`,
        purpose,
        type,
        city,
        locality,
        address: `${20 + (i % 80)}, Metro Boulevard, ${locality}, ${city}`,
        price,
        deposit: purpose === 'buy' ? 0 : purpose === 'pg' ? 25000 : 90000,
        maintenance: purpose === 'pg' ? 0 : 2500,
        bedrooms,
        bathrooms: purpose === 'commercial' ? 2 : bedrooms || 1,
        area,
        furnishing: k % 3 === 0 ? 'Fully furnished' : k % 3 === 1 ? 'Semi-furnished' : 'Unfurnished',
        availableFrom: new Date(),
        preferredTenant: purpose === 'pg' ? 'Anyone' : purpose === 'commercial' ? 'Company' : 'Family',
        parking: purpose !== 'pg',
        amenities: purpose === 'pg'
          ? ['Wi-Fi', 'Meals', 'Housekeeping', 'Security']
          : ['Lift', 'Power backup', 'Security', 'Garden', 'Gym'],
        images: propertyGallery({ purpose, type }, i),
        status: 'approved',
        verified: true,
        featured: k === 0 || k === 3,
        ownership: ['owner', 'builder', 'broker'][k % 3],
        propertyAge: ['Newly built', 'Resale', 'Older property'][k % 3],
        coordinates: localityCoords[locality] || { lat: 12.9716, lng: 77.5946 },
        sharing,
        mealsIncluded,
        availableBeds,
        transaction
      };

      const home = await Property.create(data);
      homes.push(home);
      i++;
    }
  }

  // Seed 8 Projects (one for each city including Delhi and Gurugram)
  const projectList = [
    { title: 'The Willow Collective', city: 'Bengaluru', locality: 'Whitefield', builder: 'Northwood Living' },
    { title: 'Cedar Park Residences', city: 'Mumbai', locality: 'Andheri West', builder: 'Earthline Homes' },
    { title: 'Olive Grove Heights', city: 'Pune', locality: 'Wakad', builder: 'Terrace & Co.' },
    { title: 'The Courtyard Edit', city: 'Hyderabad', locality: 'Kondapur', builder: 'Northwood Living' },
    { title: 'Aster Green Avenue', city: 'Chennai', locality: 'Velachery', builder: 'Earthline Homes' },
    { title: 'Juniper Sky Gardens', city: 'Delhi NCR', locality: 'Noida Sector 150', builder: 'Terrace & Co.' },
    { title: 'The Capital Courtyard', city: 'Delhi', locality: 'South Extension', builder: 'Northwood Living' },
    { title: 'Cyber Heights Residences', city: 'Gurugram', locality: 'Golf Course Road', builder: 'Earthline Homes' }
  ];

  const projects = [];
  for (let j = 0; j < projectList.length; j++) {
    const item = projectList[j];
    const starting = 8500000 + j * 1500000;
    const project = await Project.create({
      title: item.title,
      builder: item.builder,
      manager: admin._id,
      city: item.city,
      locality: item.locality,
      description: `Discover ${item.title}, a premium master-planned development in ${item.locality}, ${item.city}. Designed with ample open landscape, clubhouse amenities, and seamless urban connectivity.\n\nAll dimensions, floor plans, and RERA disclosures are demo data.`,
      price: starting,
      maxPrice: starting * 1.8,
      area: 1200,
      acres: 7 + j,
      units: 250 + j * 50,
      towers: 3 + (j % 4),
      rera: `DEMO-${item.city.slice(0, 3).toUpperCase()}-2026-${100 + j}`,
      possession: j % 2 === 0 ? 'Ready now' : 'December 2028',
      stage: ['Ready to move', 'Under construction', 'New launch'][j % 3],
      amenities: ['Swimming pool', 'Clubhouse', 'Gym', 'Garden', 'Children’s play area', 'Security', 'Power backup', 'Visitor parking'],
      images: projectGallery(j),
      configurations: [
        { name: '1 BHK', area: 720, price: Math.round(starting * 0.7), plan: '/images/plan-1.svg' },
        { name: '2 BHK', area: 1150, price: starting, plan: '/images/plan-1.svg' },
        { name: '3 BHK', area: 1640, price: Math.round(starting * 1.4), plan: '/images/plan-2.svg' },
        { name: '4 BHK', area: 2150, price: Math.round(starting * 1.8), plan: '/images/plan-3.svg' }
      ],
      status: 'approved'
    });
    projects.push(project);
  }

  const designNames = [
    'The warm minimal home',
    'A kitchen for slow mornings',
    'Your restful retreat',
    'The everyday gathering space',
    'Storage, beautifully considered',
    'The modern family home',
    'A kitchen with character',
    'Soft Scandinavian bedroom',
    'The calm contemporary living room',
    'The perfectly planned wardrobe'
  ];
  const designCats = ['Full home', 'Kitchen', 'Bedroom', 'Living room', 'Wardrobe'];
  const designs = [];
  for (let j = 0; j < 10; j++) {
    const category = designCats[j % 5];
    let design = await Design.findOne({ title: designNames[j] });
    if (!design) {
      design = await Design.create({
        title: designNames[j],
        category,
        style: ['Modern', 'Scandinavian', 'Contemporary', 'Minimal'][j % 4],
        description: `Natural tones, considered proportions and thoughtful details make this ${category.toLowerCase()} concept feel both personal and practical.`,
        image: designPhoto(category, j),
        startingPrice: [550000, 180000, 140000, 120000, 90000][j % 5],
        inclusions: ['Personal design consultation', 'Space planning and layout recommendations', 'Material and finish selection', 'Custom storage planning', 'Scope and installation coordination']
      });
    }
    designs.push(design);
  }

  await User.updateOne({ _id: buyer._id }, { $set: { favorites: [homes[0]._id, homes[1]._id] } });

  let thread = await Thread.findOne({ property: homes[0]._id, participants: buyer._id });
  if (!thread) {
    thread = await Thread.create({
      property: homes[0]._id,
      participants: [buyer._id, owner._id],
      subject: homes[0].title
    });
    await Message.create([
      { thread: thread._id, sender: buyer._id, text: 'Hello! I love the natural light in this home. Could I arrange a visit this weekend?', readBy: [buyer._id] },
      { thread: thread._id, sender: owner._id, text: 'Of course. Please send a site visit request with your preferred time and I’ll confirm it.', readBy: [owner._id] }
    ]);
  }

  if (!await Visit.exists({ user: buyer._id, property: homes[0]._id })) {
    await Visit.create({
      user: buyer._id,
      owner: owner._id,
      property: homes[0]._id,
      scheduledAt: new Date(Date.now() + 3 * 864e5),
      note: 'Looking forward to seeing the neighbourhood too.',
      status: 'requested'
    });
  }

  if (!await Lead.exists({ user: buyer._id, design: designs[0]._id })) {
    await Lead.create({
      user: buyer._id,
      manager: admin._id,
      kind: 'interior',
      design: designs[0]._id,
      name: buyer.name,
      phone: buyer.phone,
      city: 'Bengaluru',
      homeSize: '2 BHK',
      service: 'Full home',
      budget: 650000,
      estimate: estimateInterior('2 BHK', 'Full home'),
      status: 'consultation',
      note: 'We are planning warm neutrals and practical storage.'
    });
  }

  for (const u of users) {
    if (!await Notification.exists({ user: u._id, title: 'Welcome to UrbanFinder' })) {
      await Notification.create({
        user: u._id,
        title: 'Welcome to UrbanFinder',
        body: 'Your next chapter starts here. Explore your dashboard to see what’s possible.',
        link: '/dashboard'
      });
    }
  }

  await SavedSearch.deleteMany({});
  await SavedSearch.create({
    user: buyer._id,
    title: '2 BHK in Hyderabad',
    city: 'Hyderabad',
    purpose: 'buy',
    query: 'Gachibowli, Kondapur',
    filters: { city: 'Hyderabad', purpose: 'buy', bedrooms: '2', q: 'Gachibowli, Kondapur' },
    alertEnabled: true
  });

  await ServiceProvider.deleteMany({});
  const seededProviders = await ServiceProvider.insertMany(initialServiceProviders.map(p => {
    const { _id, ...rest } = p;
    return rest;
  }));

  for (const Model of [User, Property, Project, Design, Thread, Message, Visit, Lead, Notification, SavedSearch, ServiceProvider]) {
    await Model.init();
  }

  console.log(`Seed complete: 4 accounts, ${homes.length} properties, ${projects.length} builder projects, 10 designs, and ${seededProviders.length} service professionals.`);
  return { users, homes, projects, designs };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  seed()
    .then(() => mongoose.disconnect())
    .catch(async error => {
      console.error(error.message);
      await mongoose.disconnect();
      process.exitCode = 1;
    });
}
