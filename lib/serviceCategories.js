// Shared Explore by Category configuration and metadata
export const serviceCategories = [
  {
    slug: 'properties',
    label: 'Properties',
    line1: 'Properties',
    line2: '',
    shortTitle: 'Properties',
    iconName: 'Home',
    href: '/properties',
    isLive: true,
    tagline: 'Verified homes, apartments & commercial properties',
    accentColor: '#15803d',
    bgTint: '#f0fdf4',
    borderTint: '#bbf7d0',
    description: 'Explore verified residential homes, plots, builder floors, and commercial spaces directly from owners.',
  },
  {
    slug: 'interior-designers',
    label: 'Interior Designers',
    line1: 'Interior',
    line2: 'Designers',
    shortTitle: 'Interiors',
    iconName: 'Armchair',
    href: '/interiors',
    isLive: true,
    tagline: 'Modular kitchens, living spaces & turnkey interiors',
    accentColor: '#e11d48',
    bgTint: '#fff1f2',
    borderTint: '#fecdd3',
    description: 'Connect with expert interior designers for custom modular kitchens, bedrooms, living spaces, and turnkey styling.',
  },
  {
    slug: 'landscapers',
    label: 'Landscapers',
    line1: 'Landscapers',
    line2: '',
    shortTitle: 'Landscapers',
    iconName: 'Sprout',
    href: '/categories/landscapers',
    isLive: false,
    tagline: 'Garden planning, balcony greenery & terrace landscaping',
    accentColor: '#16a34a',
    bgTint: '#f0fdf4',
    borderTint: '#bbf7d0',
    description: 'Professional landscape architects, terrace garden curators, lawn maintenance, and irrigation specialists.',
    expectedServices: [
      'Terrace & balcony garden setups',
      'Lawn installation & grass sodding',
      'Automated drip irrigation systems',
      'Vertical green walls & indoor plants',
      'Ongoing horticultural maintenance'
    ]
  },
  {
    slug: 'lawyers',
    label: 'Lawyers',
    line1: 'Lawyers',
    line2: '',
    shortTitle: 'Lawyers',
    iconName: 'Scale',
    href: '/categories/lawyers',
    isLive: false,
    tagline: 'Property deed verification, agreement drafting & legal advisory',
    accentColor: '#2563eb',
    bgTint: '#eff6ff',
    borderTint: '#bfdbfe',
    description: 'Verified real estate advocates and legal advisors for document vetting, encumbrance checks, and sales deed drafting.',
    expectedServices: [
      'Title deed & encumbrance certificate vetting',
      'Sale agreement & lease deed drafting',
      'RERA approvals & parent document search',
      'Property registration & stamp duty guidance',
      'Dispute resolution & legal scrutiny reports'
    ]
  },
  {
    slug: 'electricians',
    label: 'Electricians',
    line1: 'Electricians',
    line2: '',
    shortTitle: 'Electricians',
    iconName: 'Zap',
    href: '/categories/electricians',
    isLive: false,
    tagline: 'Licensed electrical installations, switchboards & power safety',
    accentColor: '#d97706',
    bgTint: '#fffbeb',
    borderTint: '#fde68a',
    description: 'Certified electricians for complete home wiring, MCB installations, decorative lighting, and power breakdown repairs.',
    expectedServices: [
      'Complete home rewiring & short-circuit repair',
      'Smart lighting, chandeliers & fan installations',
      'MCB, sub-meter & distribution board setup',
      'Earthing and surge protection checks',
      'EV home charger station installation'
    ]
  },
  {
    slug: 'ac-technicians',
    label: 'AC Technicians',
    line1: 'AC',
    line2: 'Technicians',
    shortTitle: 'AC Technicians',
    iconName: 'AirVent',
    href: '/categories/ac-technicians',
    isLive: false,
    tagline: 'Precision AC repair, servicing, installation & gas refill',
    accentColor: '#0284c7',
    bgTint: '#f0f9ff',
    borderTint: '#bae6fd',
    description: 'Trained HVAC & air conditioning professionals for split, window, and VRF systems across all top brands.',
    expectedServices: [
      'Deep chemical foam wash & filter sanitization',
      'Eco-friendly gas leak detection & charging',
      'Split & inverter AC uninstallation/installation',
      'Compressor, capacitor & PCB circuit repairs',
      'Annual maintenance contracts (AMC)'
    ]
  },
  {
    slug: 'pest-control',
    label: 'Pest Control',
    line1: 'Pest Control',
    line2: '',
    shortTitle: 'Pest Control',
    iconName: 'Bug',
    href: '/categories/pest-control',
    isLive: false,
    tagline: 'Odorless termite, cockroach, rodent & bedbug eradication',
    accentColor: '#475569',
    bgTint: '#f8fafc',
    borderTint: '#e2e8f0',
    description: 'Government-approved, odorless, child-safe pest management solutions for homes, commercial offices, and societies.',
    expectedServices: [
      'Pre & post-construction anti-termite drilling',
      'Advanced cockroach herbal gel treatments',
      'Bedbug heat treatment & chemical spraying',
      'Rodent baiting & entry point exclusion',
      'Society & commercial fogging disinfection'
    ]
  },
  {
    slug: 'pool-cleaning',
    label: 'Pool Cleaning',
    line1: 'Pool Cleaning',
    line2: '',
    shortTitle: 'Pool Cleaning',
    iconName: 'Waves',
    href: '/categories/pool-cleaning',
    isLive: false,
    tagline: 'Swimming pool vacuuming, water balance & filter care',
    accentColor: '#0891b2',
    bgTint: '#ecfeff',
    borderTint: '#a5f3fc',
    description: 'Professional pool technicians for robotic vacuuming, pH water chemistry balancing, and pump room maintenance.',
    expectedServices: [
      'Automated vacuuming & surface skimming',
      'Chlorine, pH balance & algae shock treatments',
      'Sand filter backwashing & cartridge replacement',
      'Pool underwater tile scrubbing & grouting',
      'Residential & villa community pool AMCs'
    ]
  },
  {
    slug: 'tank-cleaning',
    label: 'Tank Cleaning',
    line1: 'Tank',
    line2: 'Cleaning',
    shortTitle: 'Tank Cleaning',
    iconName: 'Cylinder',
    href: '/categories/tank-cleaning',
    isLive: false,
    tagline: 'Mechanized 6-stage overhead & underground tank hygiene',
    accentColor: '#2563eb',
    bgTint: '#eff6ff',
    borderTint: '#bfdbfe',
    description: 'High-pressure mechanized cleaning, sludge de-watering, and UV antibacterial treatment for clean, safe household water.',
    expectedServices: [
      'Sludge de-watering & deep sediment vacuuming',
      'Rotary high-pressure jet washing',
      'Antifungal & antibacterial scrub treatment',
      'UV germicidal radiation sanitization',
      'Sump & overhead Sintex/concrete tank maintenance'
    ]
  },
  {
    slug: 'inverter-maintenance',
    label: 'Inverter Maintenance',
    line1: 'Inverter',
    line2: 'Maintenance',
    shortTitle: 'Inverter Maint.',
    iconName: 'BatteryCharging',
    href: '/categories/inverter-maintenance',
    isLive: false,
    tagline: 'Inverter, UPS & battery health check, distilled water top-up',
    accentColor: '#059669',
    bgTint: '#ecfdf5',
    borderTint: '#a7f3d0',
    description: 'Expert backup power technicians for solar/home inverters, lead-acid & tubular battery load testing and diagnostics.',
    expectedServices: [
      'Battery terminal descaling & distilled water top-up',
      'Load capacity testing & backup hour diagnostics',
      'Inverter motherboard & charging circuit repair',
      'Safe old battery exchange & buyback support',
      'Solar hybrid inverter setup & maintenance'
    ]
  },
  {
    slug: 'lift-maintenance',
    label: 'Lift Maintenance',
    line1: 'Lift',
    line2: 'Maintenance',
    shortTitle: 'Lift Maint.',
    iconName: 'ArrowUpDown',
    href: '/categories/lift-maintenance',
    isLive: false,
    tagline: 'Elevator safety auditing, preventive lubrication & 24/7 breakdown support',
    accentColor: '#1d4ed8',
    bgTint: '#eff6ff',
    borderTint: '#bfdbfe',
    description: 'Certified elevator engineers for passenger lifts, freight elevators, and residential dumbwaiters.',
    expectedServices: [
      'Monthly safety inspections & motor lubrication',
      'Automatic Rescue Device (ARD) battery checks',
      'Brake testing, rope tension & governor calibration',
      'Lift controller PCB troubleshooting',
      'Annual maintenance contracts with 24/7 hotline'
    ]
  },
  {
    slug: 'office-supplies',
    label: 'Office Supplies',
    line1: 'Office Supplies',
    line2: '',
    shortTitle: 'Office Supplies',
    iconName: 'Briefcase',
    href: '/categories/office-supplies',
    isLive: false,
    tagline: 'Ergonomic furnishings, commercial stationery & office pantry supplies',
    accentColor: '#0284c7',
    bgTint: '#f0f9ff',
    borderTint: '#bae6fd',
    description: 'Bulk procurement and doorstep delivery of ergonomic office chairs, desks, paper essentials, tech accessories, and cafeteria provisions.',
    expectedServices: [
      'Ergonomic workstation desks & mesh chairs',
      'Commercial stationery & printer consumables',
      'Conference room AV hardware & cable management',
      'Breakroom coffee machines & snack supplies',
      'Scheduled monthly commercial restocking'
    ]
  },
  {
    slug: 'facility-management',
    label: 'Facility Management',
    line1: 'Facility',
    line2: 'Management',
    shortTitle: 'Facility Mgmt',
    iconName: 'Building2',
    href: '/categories/facility-management',
    isLive: false,
    tagline: 'Comprehensive housekeeping, security guards & property upkeep',
    accentColor: '#4f46e5',
    bgTint: '#eef2ff',
    borderTint: '#c7d2fe',
    description: 'End-to-end commercial building, gated community, and residential estate operations with trained on-site staff.',
    expectedServices: [
      'Trained commercial housekeeping & deep cleaning',
      '24/7 security personnel & visitor management',
      'Plumbing, HVAC & MEP preventive oversight',
      'Waste management, composting & recycling programs',
      'Dedicated facility manager and vendor supervision'
    ]
  }
];

export function getCategoryBySlug(slug) {
  if (!slug) return null;
  const normalized = String(slug).toLowerCase().trim();
  return serviceCategories.find(c => c.slug === normalized) || null;
}
