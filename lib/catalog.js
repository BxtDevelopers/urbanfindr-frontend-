// Shared route and discovery configuration. Safe for both browser and server imports.
export const categories = [
  { purpose: 'buy', path: '/buy', label: 'Buy', title: 'A home to call your own.', eyebrow: 'YOUR NEXT CHAPTER STARTS HERE', description: 'Explore apartments, villas, independent homes and plots. Compare your favourites and connect directly with owners.', action: 'Find a home to buy', types: ['Apartment', 'Villa', 'Independent house', 'Plot'], image: '/photos/house-1.jpg' },
  { purpose: 'rent', path: '/rent', label: 'Rent', title: 'A fresh start. A place to belong.', eyebrow: 'MOVE INTO YOUR NEXT CHAPTER', description: 'Find a rental that fits your neighbourhood, lifestyle and budget. Message the owner and arrange a visit.', action: 'Find a rental home', types: ['Apartment', 'Villa', 'Independent house'], image: '/photos/living-1.jpg' },
  { purpose: 'pg', path: '/pg', label: 'PG / Co-living', title: 'Your own space. A shared experience.', eyebrow: 'MORE THAN A ROOM', description: 'Discover PGs and co-living spaces with private or shared rooms. Filter by meals, furnishing and everyday amenities.', action: 'Find a PG or co-living space', types: ['PG'], image: '/photos/bedroom-3.jpg' },
  { purpose: 'commercial', path: '/commercial', label: 'Commercial', title: 'Space for your next big idea.', eyebrow: 'MAKE ROOM FOR YOUR BUSINESS', description: 'Explore offices, shops and warehouses for sale or lease. Find the right area, location and facilities for your business.', action: 'Find a commercial space', types: ['Office', 'Shop', 'Warehouse'], image: '/photos/office-1.jpg' },
];
// export const cityGuides = [
//   { name: 'Bengaluru', slug: 'bengaluru', tagline: 'Garden city. Great possibilities.', localities: ['Indiranagar', 'Whitefield', 'HSR Layout', 'Sarjapur Road'], image: '/images/city-bengaluru.svg' },
//   { name: 'Mumbai', slug: 'mumbai', tagline: 'Find your corner in a city on the move.', localities: ['Powai', 'Andheri West', 'Chembur', 'Thane West'], image: '/images/city-mumbai.svg' },
//   { name: 'Pune', slug: 'pune', tagline: 'A little more room to live your way.', localities: ['Baner', 'Wakad', 'Kharadi', 'Hinjewadi'], image: '/images/city-pune.svg' },
//   { name: 'Hyderabad', slug: 'hyderabad', tagline: 'New neighbourhoods. New beginnings.', localities: ['Gachibowli', 'Kondapur', 'Kokapet', 'Miyapur'], image: '/images/city-hyderabad.svg' },
//   { name: 'Chennai', slug: 'chennai', tagline: 'Coastal calm meets everyday connection.', localities: ['Adyar', 'Velachery', 'OMR', 'Anna Nagar'], image: '/images/city-chennai.svg' },
//   { name: 'Delhi NCR', slug: 'delhi-ncr', tagline: 'Make your next move in the capital region.', localities: ['Gurugram', 'Noida Sector 150', 'Dwarka', 'Greater Noida'], image: '/images/city-delhi-ncr.svg' },
// ];

export const cityGuides = [
  {
    name: 'Bengaluru',
    slug: 'bengaluru',
    tagline: 'Garden city. Great possibilities.',
    localities: ['Indiranagar', 'Whitefield', 'HSR Layout', 'Sarjapur Road', 'Koramangala', 'Electronic City', 'Bellandur', 'Marathahalli', 'Jayanagar', 'Hebbal'],
    image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=1200&q=85',
  },
  {
    name: 'Mumbai',
    slug: 'mumbai',
    tagline: 'Find your corner in a city on the move.',
    localities: ['Powai', 'Andheri West', 'Chembur', 'Thane West', 'Bandra', 'Worli', 'Juhu', 'Malad West', 'Goregaon', 'BKC'],
    image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1200&q=85',
  },
  {
    name: 'Pune',
    slug: 'pune',
    tagline: 'A little more room to live your way.',
    localities: ['Baner', 'Wakad', 'Kharadi', 'Hinjewadi', 'Viman Nagar', 'Kothrud', 'Aundh', 'Hadapsar', 'Magarpatta', 'Bavdhan'],
    image: 'https://images.unsplash.com/photo-1595658658481-d53d3f999875?auto=format&fit=crop&w=1200&q=85',
  },
  {
    name: 'Hyderabad',
    slug: 'hyderabad',
    tagline: 'New neighbourhoods. New beginnings.',
    localities: ['Gachibowli', 'Kondapur', 'Kokapet', 'Miyapur', 'Banjara Hills', 'Hitec City', 'Madhapur', 'Jubilee Hills', 'Manikonda', 'Kukatpally'],
    image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1200&q=85',
  },
  {
    name: 'Chennai',
    slug: 'chennai',
    tagline: 'Coastal calm meets everyday connection.',
    localities: ['Adyar', 'Velachery', 'OMR', 'Anna Nagar', 'T Nagar', 'Besant Nagar', 'Thiruvanmiyur', 'Guindy', 'Alwarpet', 'Nungambakkam'],
    image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=85',
  },
  {
    name: 'Delhi NCR',
    slug: 'delhi-ncr',
    tagline: 'Make your next move in the capital region.',
    localities: ['Gurugram', 'Noida Sector 150', 'Dwarka', 'Greater Noida', 'Noida Expressway', 'Indirapuram', 'Faridabad', 'Ghaziabad'],
    image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=85',
  },
  {
    name: 'Delhi',
    slug: 'delhi',
    tagline: 'Heart of the nation. Historic charm & modern avenues.',
    localities: ['South Extension', 'Dwarka', 'Vasant Kunj', 'Hauz Khas', 'Saket', 'Greater Kailash', 'Lajpat Nagar', 'Rohini', 'Connaught Place', 'Chanakyapuri'],
    image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=85',
  },
  {
    name: 'Gurugram',
    slug: 'gurugram',
    tagline: 'Cyber city living. High-rises & modern communities.',
    localities: ['Golf Course Road', 'DLF Phase 5', 'Cyber City', 'Sohna Road', 'Sector 54', 'Golf Course Ext Road', 'Sector 57', 'MG Road', 'Nirvana Country', 'Sushant Lok'],
    image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=1200&q=85',
  },
];

export const searchTabs = [
  { purpose: 'buy', label: 'Buy' },
  { purpose: 'rent', label: 'Rent' },
  { purpose: 'pg', label: 'PG / Co-living' },
  { purpose: 'commercial', label: 'Commercial' },
  { purpose: 'services', label: 'Service Provider' },
];

export const categoryFor = purpose => {
  if (purpose === 'services') return { purpose: 'services', path: '/categories', label: 'Service Provider', title: 'Verified service providers & home experts' };
  if (purpose === 'projects') return { purpose: 'projects', path: '/projects', label: 'Builder Projects', title: 'New builder projects' };
  return categories.find(item => item.purpose === purpose);
};
export const cityFor = slug => cityGuides.find(item => item.slug === slug);
export function listingQuery(params, { purpose, city, favorites } = {}) {
  const result = new URLSearchParams(params.toString());
  if (purpose) result.set('purpose', purpose);
  if (city) result.set('city', city);
  if (favorites) result.set('favorites', 'true');
  return result;
}
export const isMonthly = item => item.purpose !== 'buy' && !(item.purpose === 'commercial' && item.transaction === 'sale');

export function summarizeDiscovery(propertyGroups, projectGroups, featured) {
  const cities = cityGuides.map(city => {
    const purposes = Object.fromEntries(categories.map(category => [category.purpose,
      propertyGroups.filter(group => group._id.city === city.name && group._id.purpose === category.purpose).reduce((total, group) => total + group.count, 0),
    ]));
    return { ...city, purposes, total: Object.values(purposes).reduce((total, count) => total + count, 0), projects: projectGroups.find(group => group._id === city.name)?.count || 0 };
  });
  return { cities, total: propertyGroups.reduce((total, group) => total + group.count, 0), projects: projectGroups.reduce((total, group) => total + group.count, 0), featured,
    purposes: Object.fromEntries(categories.map(category => [category.purpose, propertyGroups.filter(group => group._id.purpose === category.purpose).reduce((total, group) => total + group.count, 0)])),
  };
}
