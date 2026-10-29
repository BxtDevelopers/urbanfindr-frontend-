import mongoose from 'mongoose';
const { Schema } = mongoose;
const ref = (name, required = true) => ({ type: Schema.Types.ObjectId, ref: name, required });
const model = (name, definition, indexes = []) => {
  const schema = new Schema(definition, { timestamps: true, strictPopulate: false });
  for (const [fields, options] of indexes) schema.index(fields, options);
  if (mongoose.models[name]) {
    delete mongoose.models[name];
  }
  return mongoose.model(name, schema);
};
export const User = model('User', {
  name: { type: String, required: true, trim: true }, email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, select: false }, phone: String,
  role: { type: String, enum: ['user', 'owner', 'broker', 'builder', 'channel_partner', 'admin'], default: 'user' }, active: { type: Boolean, default: true },
  company: String, bio: String, reraId: String, experience: String,
  favorites: [{ type: Schema.Types.ObjectId, ref: 'Property' }]
});
export const Property = model('Property', {
  owner: ref('User'), title: { type: String, required: true }, description: String,
  purpose: { type: String, enum: ['buy','rent','pg','commercial'], required: true },
  type: { type: String, enum: ['Apartment','Villa','Independent house','Plot','PG','Office','Shop','Warehouse'], required: true },
  city: { type: String, required: true }, locality: { type: String, required: true }, address: String,
  price: { type: Number, required: true, min: 1 }, deposit: { type: Number, default: 0 }, maintenance: { type: Number, default: 0 },
  bedrooms: { type: Number, default: 0 }, bathrooms: { type: Number, default: 0 }, area: { type: Number, min: 1, required: true },
  furnishing: { type: String, enum: ['Unfurnished','Semi-furnished','Fully furnished'], default: 'Unfurnished' },
  availableFrom: Date, preferredTenant: { type: String, default: 'Anyone' }, parking: Boolean,
  amenities: [String], images: [String],
  status: { type: String, enum: ['pending','approved','rejected','archived'], default: 'pending' },
  verified: { type: Boolean, default: false },
  featured: { type: Boolean, default: false },
  ownership: { type: String, enum: ['owner', 'broker', 'builder', 'channel_partner'], default: 'owner' },
  propertyAge: { type: String, enum: ['Newly built', 'Resale', 'Older property'], default: 'Newly built' },
  coordinates: { lat: { type: Number, default: 12.9716 }, lng: { type: Number, default: 77.5946 } },
  locationPrecision: { type: String, enum: ['exact', 'approximate', 'city'], default: 'exact' },
  radiusMeters: { type: Number, default: 500 },
  hideExactAddress: { type: Boolean, default: false },
  transaction: { type: String, enum: ['sale','lease'], default: 'lease' },
  sharing: { type: String, enum: ['Private room','2 sharing','3 sharing','4+ sharing'], default: 'Private room' },
  mealsIncluded: { type: Boolean, default: false }, availableBeds: { type: Number, default: 1, min: 0 }
}, [[{ city: 1, purpose: 1, status: 1, price: 1 }], [{ owner: 1 }], [{ status: 1, featured: 1, createdAt: -1 }]]);
export const Project = model('Project', {
  manager: ref('User'), title: String, builder: String, city: String, locality: String, description: String,
  price: Number, maxPrice: Number, area: Number, acres: Number, units: Number, towers: Number,
  rera: String, possession: String, stage: { type: String, enum: ['New launch','Under construction','Ready to move'] },
  amenities: [String], images: [String], configurations: [{ name: String, area: Number, price: Number, plan: String }],
  status: { type: String, enum: ['pending','approved','rejected','archived'], default: 'pending' }
});
export const Design = model('Design', {
  title: String, category: { type: String, enum: ['Full home','Kitchen','Bedroom','Living room','Wardrobe','Furniture & furnishing','Painting & renovation'] },
  style: String, description: String, image: String, startingPrice: Number, inclusions: [String]
});
export const Thread = model('Thread', { participants: [ref('User')], property: ref('Property', false), project: ref('Project', false), subject: String });
export const Message = model('Message', { thread: ref('Thread'), sender: ref('User'), text: { type: String, maxlength: 3000 }, readBy: [ref('User')] }, [[{ thread: 1, createdAt: 1 }]]);
export const Visit = model('Visit', {
  user: ref('User'), owner: ref('User'), property: ref('Property', false), project: ref('Project', false),
  scheduledAt: { type: Date, required: true }, note: String, status: { type: String, enum: ['requested','confirmed','completed','cancelled'], default: 'requested' }
});
export const Notification = model('Notification', { user: ref('User'), title: String, body: String, link: String, read: { type: Boolean, default: false } }, [[{ user: 1, createdAt: -1 }]]);
export const ChannelPartner = model('ChannelPartner', {
  user: ref('User'), company: { type: String, required: true }, reraId: { type: String, required: true },
  phone: String, email: String, city: { type: String, default: 'Bengaluru' }, localities: [String],
  tier: { type: String, enum: ['Silver', 'Gold', 'Platinum'], default: 'Gold' },
  verified: { type: Boolean, default: true }, bio: String,
  team: [{
    name: { type: String, required: true },
    role: { type: String, default: 'Property Specialist' },
    email: String,
    phone: String,
    status: { type: String, enum: ['active', 'inactive', 'on_leave'], default: 'active' },
    assignedLeadsCount: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
  }]
}, [[{ user: 1 }]]);

export const SupportTicket = model('SupportTicket', {
  user: ref('User'), ticketNumber: { type: String, required: true },
  category: { type: String, enum: ['Listing Review', 'Lead Inquiry', 'Billing & RERA', 'Technical Support', 'Account Verification', 'Other'], default: 'Listing Review' },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  subject: { type: String, required: true }, message: { type: String, required: true },
  status: { type: String, enum: ['open', 'in_progress', 'resolved', 'closed'], default: 'open' },
  property: ref('Property', false),
  responses: [{
    sender: ref('User', false), senderName: String, role: String, message: String, createdAt: { type: Date, default: Date.now }
  }]
}, [[{ user: 1, createdAt: -1 }]]);

export const Lead = model('Lead', {
  user: ref('User', false), manager: ref('User', false),
  kind: { type: String, enum: ['project','interior','property','general'], default: 'property' },
  source: { type: String, enum: ['phone','message','enquiry'], default: 'enquiry' },
  project: ref('Project', false), design: ref('Design', false), property: ref('Property', false),
  name: String, phone: String, email: String, city: String, homeSize: String, service: String,
  finish: { type: String, enum: ['Essential','Premium','Luxe'], default: 'Essential' },
  budget: Number, estimate: Number, note: String, assignedTeamMember: String,
  preferredAt: Date, contactedAt: Date,
  status: { type: String, enum: ['new','uncontacted','contacted','interested','consultation','site_visit_scheduled','negotiation','deal_closed','converted','design','execution','completed','closed','lost','dropped'], default: 'uncontacted' },
  notes: [{ author: String, text: String, createdAt: { type: Date, default: Date.now } }]
}, [[{ manager: 1, createdAt: -1 }], [{ user: 1, createdAt: -1 }]]);
export const RateLimit = model('RateLimit', { key: { type: String, unique: true }, count: Number, expiresAt: Date }, [[{ expiresAt: 1 }, { expireAfterSeconds: 0 }]]);
export const Session = model('Session', { user: ref('User'), tokenHash: { type: String, unique: true }, expiresAt: Date }, [[{ expiresAt: 1 }, { expireAfterSeconds: 0 }]]);
export const SavedSearch = model('SavedSearch', {
  user: ref('User'), title: { type: String, required: true }, city: String, purpose: String, query: String,
  filters: Schema.Types.Mixed, alertEnabled: { type: Boolean, default: true }
}, [[{ user: 1, createdAt: -1 }]]);
export const ServiceProvider = model('ServiceProvider', {
  name: { type: String, required: true },
  specialist: String,
  category: { type: String, required: true },
  categorySlug: { type: String, required: true },
  city: { type: String, required: true },
  locality: String,
  rating: { type: Number, default: 4.8 },
  reviewsCount: { type: Number, default: 100 },
  avatar: { type: String, required: true },
  experience: String,
  badge: String,
  verified: { type: Boolean, default: true },
  featured: { type: Boolean, default: true },
  startingPrice: String,
  services: [String],
  phone: String,
  email: String,
  bio: String
}, [[{ categorySlug: 1, city: 1, featured: 1 }]]);


export const ServiceRequest = model('ServiceRequest', {
  requestId: { type: String, unique: true, required: true },
  category: { type: String, required: true },
  categorySlug: { type: String, required: true },
  serviceType: { type: String, required: true },
  description: { type: String, required: true },
  firstName: String,
  lastName: String,
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: String,
  city: { type: String, required: true },
  locality: String,
  preferredDate: String,
  preferredTime: String,
  assignedSpecialist: String,
  assignedSpecialistId: String,
  assignedSpecialistRating: Number,
  status: { type: String, enum: ['pending', 'assigned', 'in_progress', 'completed', 'cancelled'], default: 'pending' },
  user: ref('User', false)
}, [[{ categorySlug: 1, city: 1, createdAt: -1 }]]);
