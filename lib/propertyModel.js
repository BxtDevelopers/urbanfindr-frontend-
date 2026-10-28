// Phase 4 - Step 1: Property Data Model Specification & Helper Functions
// Matches the 16 core fields defined in the UrbanFindr Real Estate Specification

export const PROPERTY_PURPOSES = [
  { value: 'buy', label: 'Buy', color: 'bg-emerald-700 text-white', description: 'Properties available for sale' },
  { value: 'rent', label: 'Rent', color: 'bg-amber-600 text-white', description: 'Properties available for lease or rent' },
  { value: 'pg', label: 'PG / Co-living', color: 'bg-purple-700 text-white', description: 'Paying guest and shared living' },
  { value: 'commercial', label: 'Commercial', color: 'bg-stone-800 text-white', description: 'Offices, retail shops, and warehouses' }
];

export const CATEGORIES_BY_PURPOSE = {
  buy: ['Apartment', 'Villa', 'Independent house', 'Plot'],
  rent: ['Apartment', 'Villa', 'Independent house'],
  pg: ['PG'],
  commercial: ['Office', 'Shop', 'Warehouse']
};

export const ALL_PROPERTY_TYPES = [
  'Apartment', 'Villa', 'Independent house', 'Plot', 'PG', 'Office', 'Shop', 'Warehouse'
];

export const FURNISHING_OPTIONS = [
  'Unfurnished', 'Semi-furnished', 'Fully furnished'
];

export const OWNERSHIP_ROLES = [
  { value: 'owner', label: 'Direct Owner', badge: 'bg-blue-100 text-blue-800' },
  { value: 'broker', label: 'Certified Broker', badge: 'bg-amber-100 text-amber-800' },
  { value: 'builder', label: 'Authorized Builder', badge: 'bg-emerald-100 text-emerald-800' }
];

export const PUBLICATION_STATUSES = [
  { value: 'approved', label: 'Published / Approved', badge: 'bg-green-100 text-green-800 border-green-200' },
  { value: 'pending', label: 'Pending Review', badge: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  { value: 'rejected', label: 'Rejected', badge: 'bg-red-100 text-red-800 border-red-200' },
  { value: 'archived', label: 'Archived', badge: 'bg-gray-100 text-gray-800 border-gray-200' }
];

export const STANDARD_AMENITIES = [
  'Lift',
  'Power backup',
  'Covered parking',
  '24/7 water supply',
  'Gated security',
  'Clubhouse',
  'Gym',
  'Swimming pool',
  'Park / Garden',
  'Gas pipeline',
  'Rainwater harvesting',
  'Intercom',
  'CCTV surveillance',
  'Fire fighting system',
  'Waste disposal'
];

// The 16 canonical fields defined in Phase 4 Step 1
export const PROPERTY_DATA_MODEL_FIELDS = [
  { key: 'title', label: 'Property Title', type: 'String', required: true, desc: 'Headline title (8-150 chars)' },
  { key: 'description', label: 'Description', type: 'String', required: true, desc: 'Detailed property writeup (30-5000 chars)' },
  { key: 'purpose', label: 'Listing Type', type: 'Enum', required: true, options: ['buy', 'rent', 'pg', 'commercial'], desc: 'Buy, Rent, PG, or Commercial' },
  { key: 'type', label: 'Property Category', type: 'Enum', required: true, options: ALL_PROPERTY_TYPES, desc: 'Apartment, Villa, Plot, Office, etc.' },
  { key: 'price', label: 'Price', type: 'Number', required: true, desc: 'Base price or monthly rent in INR' },
  { key: 'city', label: 'City', type: 'String', required: true, desc: 'Metro city name (e.g. Hyderabad, Bengaluru)' },
  { key: 'locality', label: 'Locality', type: 'String', required: true, desc: 'Neighborhood or sector name' },
  { key: 'address', label: 'Address / Coordinates', type: 'Object', required: false, desc: 'Street address & {lat, lng} geo-coordinates' },
  { key: 'area', label: 'Property Area', type: 'Number', required: true, desc: 'Carpet or super built-up area in sq. ft.' },
  { key: 'bedrooms', label: 'Bedrooms (BHK)', type: 'Number', required: false, desc: 'Number of bedrooms (0-20)' },
  { key: 'bathrooms', label: 'Bathrooms', type: 'Number', required: false, desc: 'Number of bathrooms (0-20)' },
  { key: 'furnishing', label: 'Furnishing', type: 'Enum', required: true, options: FURNISHING_OPTIONS, desc: 'Unfurnished, Semi, or Fully furnished' },
  { key: 'amenities', label: 'Amenities', type: 'Array<String>', required: false, desc: 'List of features like Lift, Gym, Parking' },
  { key: 'images', label: 'Photographs', type: 'Array<URL>', required: true, desc: '1 to 12 photo URLs' },
  { key: 'ownership', label: 'Owner / Broker Ref', type: 'Enum', required: true, options: ['owner', 'broker', 'builder'], desc: 'Identity relation to listing' },
  { key: 'verified', label: 'Verification Status', type: 'Boolean', required: false, desc: 'True if physically/document verified' },
  { key: 'status', label: 'Publication Status', type: 'Enum', required: true, options: ['pending', 'approved', 'rejected', 'archived'], desc: 'Review & visibility status' }
];

/**
 * Validates a property object against the 16 core Step 1 fields
 */
export function validatePropertyModel(data) {
  const errors = [];

  if (!data.title || data.title.trim().length < 8) errors.push('Title must be at least 8 characters');
  if (!data.description || data.description.trim().length < 30) errors.push('Description must be at least 30 characters');
  if (!['buy', 'rent', 'pg', 'commercial'].includes(data.purpose)) errors.push('Valid listing type (buy/rent/pg/commercial) required');
  if (!ALL_PROPERTY_TYPES.includes(data.type)) errors.push('Valid property category required');
  if (!data.price || Number(data.price) <= 0) errors.push('Price must be greater than zero');
  if (!data.city || data.city.trim().length < 2) errors.push('City is required');
  if (!data.locality || data.locality.trim().length < 2) errors.push('Locality is required');
  if (!data.area || Number(data.area) <= 0) errors.push('Property area (sq ft) is required');
  if (!FURNISHING_OPTIONS.includes(data.furnishing)) errors.push('Valid furnishing state required');
  if (!Array.isArray(data.images) || data.images.length === 0) errors.push('At least one photograph is required');
  if (!['owner', 'broker', 'builder'].includes(data.ownership)) errors.push('Owner/broker reference required');

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Sample compliant listing demonstrating all 16 fields
 */
export const SAMPLE_COMPLIANT_PROPERTY = {
  _id: 'prop-demo-sample-01',
  title: '4 BHK Ultra Luxury Sky Villa with Panoramic Views',
  description: 'Exquisite penthouse residence featuring double-height living room, Italian marble flooring, panoramic balcony, modular kitchen with premium fittings, and private elevator lobby access.',
  purpose: 'buy',
  type: 'Villa',
  price: 38500000,
  deposit: 0,
  maintenance: 12000,
  city: 'Hyderabad',
  locality: 'Jubilee Hills',
  address: 'Road No. 36, Jubilee Hills, Hyderabad',
  coordinates: { lat: 17.4319, lng: 78.4073 },
  area: 4250,
  bedrooms: 4,
  bathrooms: 5,
  furnishing: 'Fully furnished',
  amenities: ['Lift', 'Power backup', 'Covered parking', 'Clubhouse', 'Gym', 'Swimming pool', 'Gated security', 'CCTV surveillance'],
  images: [
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80'
  ],
  owner: { name: 'Dr. Suresh Reddy' },
  ownership: 'owner',
  verified: true,
  status: 'approved',
  createdAt: new Date().toISOString()
};

