// Centralized Explore by Category & Service Provider Configuration
export const serviceCategories = [
  {
    slug: 'electricians',
    label: 'Electricians',
    line1: 'Electricians',
    line2: '',
    shortTitle: 'Electricians',
    iconName: 'Zap',
    href: '/categories/electricians',
    isLive: true,
    headline: 'Safe electrical solutions for your home and business.',
    supportingText: 'Find verified professionals for wiring, installations, electrical repairs, short-circuit troubleshooting, and routine maintenance.',
    tagline: 'Licensed electrical installations, switchboards & power safety',
    slogan: 'Safe Wiring, Sound Living',
    heroImage: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=1200&q=85',
    accentColor: '#d97706',
    bgTint: '#fffbeb',
    borderTint: '#fde68a',
    description: 'Certified electricians for complete home wiring, MCB installations, decorative lighting, and power breakdown repairs.',
    benefits: [
      { title: 'Verified Professionals', desc: 'Background-checked, licensed, and trained electricians.' },
      { title: 'Transparent Pricing', desc: 'Upfront rates with no hidden costs or extra charges.' },
      { title: 'Convenient Service Requests', desc: 'Doorstep service scheduling at your preferred date and time.' }
    ],
    serviceOptions: [
      'Wiring and Rewiring',
      'Switch and Socket Repair',
      'Fan Installation and Repair',
      'Lighting Installation',
      'Electrical Fault Finding',
      'Circuit Breaker Repair',
      'Short Circuit Problems',
      'Home Electrical Installation',
      'Emergency Electrical Repairs'
    ],
    defaultPlaceholder: 'Describe your electrical problem, such as a faulty switch, fan issue, or wiring problem.',
    servicePlaceholders: {
      'Wiring and Rewiring': 'Specify the rooms or areas that need rewiring, age of the property, or any power trip concerns.',
      'Switch and Socket Repair': 'Tell us how many switches, sockets, or modular plates need replacement or troubleshooting.',
      'Fan Installation and Repair': 'Describe the fan model (ceiling/exhaust), installation height, or wobble/speed issues.',
      'Lighting Installation': 'Mention whether you are installing chandeliers, LED strip profiles, downlights, or track lights.',
      'Electrical Fault Finding': 'Describe any power tripping, MCB issues, or sparking you have noticed.',
      'Circuit Breaker Repair': 'Specify your main distribution box brand and the frequency of breaker trips.',
      'Short Circuit Problems': 'Describe the location of the short circuit, any burning smell, or affected appliances.',
      'Home Electrical Installation': 'Tell us about your new home electrical scope, appliance points, and timeline.',
      'Emergency Electrical Repairs': 'Explain the urgent electrical failure, power outage, or safety hazard.'
    },
    popularServices: [
      { name: 'Switch & Socket Replacement', desc: 'Quick fix for sparky, loose, or broken electrical points.', price: 'From ₹199' },
      { name: 'Ceiling Fan & Light Installation', desc: 'Secure mounting and wiring for all decorative lighting and fans.', price: 'From ₹249' },
      { name: 'MCB & Fuse Box Repair', desc: 'Diagnostic testing for continuous breaker trips and load balancing.', price: 'From ₹349' },
      { name: 'Complete Home Rewiring', desc: 'Full copper wiring overhaul with earthing and surge protection.', price: 'Custom Quote' }
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
    isLive: true,
    headline: 'Precision cooling & HVAC solutions for every space.',
    supportingText: 'Trained HVAC & air conditioning professionals for split, window, and inverter systems across all top brands.',
    tagline: 'Precision AC repair, servicing, installation & gas refill',
    slogan: 'Cooler Homes, Happier Lives',
    heroImage: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1200&q=85',
    accentColor: '#0284c7',
    bgTint: '#f0f9ff',
    borderTint: '#bae6fd',
    description: 'Trained HVAC & air conditioning professionals for split, window, and VRF systems across all top brands.',
    benefits: [
      { title: 'Certified HVAC Technicians', desc: 'OEM-trained experts for split, window, and inverter ACs.' },
      { title: 'Eco-Friendly Gas Refills', desc: 'Accurate pressure checks and genuine refrigerant charging.' },
      { title: '30-Day Service Guarantee', desc: 'Complete warranty on cooling performance and workmanship.' }
    ],
    serviceOptions: [
      'AC Repair',
      'AC Installation',
      'AC Uninstallation',
      'AC Servicing',
      'Gas Refill',
      'Water Leakage Repair',
      'AC Not Cooling',
      'Inverter AC Repair',
      'Annual Maintenance'
    ],
    defaultPlaceholder: 'Describe your AC issue, such as poor cooling, unusual noise, or water leakage.',
    servicePlaceholders: {
      'AC Repair': 'Mention the AC brand, error code on display, or unusual sound from the compressor.',
      'AC Installation': 'Tell us if core cutting is required, tonnage of the AC, and indoor/outdoor location.',
      'AC Uninstallation': 'Specify if you need safe dismounting with gas lock for relocation.',
      'AC Servicing': 'Tell us when the AC was last serviced and if deep jet foam wash is requested.',
      'Gas Refill': 'Mention your AC brand, tonnage (1T/1.5T/2T), and if you suspect a refrigerant leak.',
      'Water Leakage Repair': 'Describe where the water is dripping from (indoor unit, drain pipe, or wall).',
      'AC Not Cooling': 'Tell us if the fan is spinning, any warm air output, or compressor tripping.',
      'Inverter AC Repair': 'Mention any blinking LED lights, PCB sensor faults, or capacitor issues.',
      'Annual Maintenance': 'State how many split or window AC units need comprehensive seasonal AMCs.'
    },
    popularServices: [
      { name: 'Deep Jet Chemical Foam Wash', desc: 'Thorough coil cleaning, filter sanitization, and drain tray wash.', price: 'From ₹499' },
      { name: 'Eco Gas Refill & Leak Check', desc: 'Nitrogen pressure leak detection followed by precision R32/R410A refill.', price: 'From ₹1,499' },
      { name: 'Split AC Installation & Core Drill', desc: 'Vibration-free bracket mounting and copper piping connection.', price: 'From ₹999' },
      { name: 'Water Leakage & Drain Clearing', desc: 'Immediate unblocking of drain pipes and slope adjustment.', price: 'From ₹399' }
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
    isLive: true,
    headline: 'Trusted legal advisory & real estate documentation.',
    supportingText: 'Verified real estate advocates and legal advisors for document vetting, encumbrance checks, and sales deed drafting.',
    tagline: 'Property deed verification, agreement drafting & legal advisory',
    slogan: 'Clear Deeds, Confident Deals',
    heroImage: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=85',
    accentColor: '#2563eb',
    bgTint: '#eff6ff',
    borderTint: '#bfdbfe',
    description: 'Verified real estate advocates and legal advisors for document vetting, encumbrance checks, and sales deed drafting.',
    benefits: [
      { title: 'Verified Advocates', desc: 'Experienced legal practitioners enrolled with State Bar Councils.' },
      { title: 'Comprehensive Due Diligence', desc: '30-year title searches, encumbrance certificate checks, and RERA scrutiny.' },
      { title: 'Confidential & Timely', desc: 'Secure document review and fast turnaround on legal opinions.' }
    ],
    serviceOptions: [
      'Property Disputes',
      'Property Documentation',
      'Rental Agreement Assistance',
      'Legal Consultation',
      'Property Registration Guidance',
      'Sale Agreement Review',
      'Tenant and Landlord Disputes',
      'Business Legal Assistance'
    ],
    defaultPlaceholder: 'Briefly explain your legal requirement or property-related concern.',
    servicePlaceholders: {
      'Property Disputes': 'Explain the nature of the dispute (inheritance, boundary, encroachment, or builder delay).',
      'Property Documentation': 'Mention the documents you hold (khata, patta, sale deed, mother deed) and what needs vetting.',
      'Rental Agreement Assistance': 'Specify the lease duration, monthly rent, lock-in period, and security deposit clauses.',
      'Legal Consultation': 'Outline your primary questions regarding real estate acquisition, transfer, or litigation.',
      'Property Registration Guidance': 'Mention the sub-registrar jurisdiction, property type, and stamp duty assistance needed.',
      'Sale Agreement Review': 'Upload or describe the builder/seller draft agreement clauses you wish to scrutinize.',
      'Tenant and Landlord Disputes': 'Describe non-payment of rent, eviction notice, or deposit refund contentions.',
      'Business Legal Assistance': 'Explain commercial lease drafting, shop establishment, or corporate real estate contracts.'
    },
    popularServices: [
      { name: '30-Year Title Search & Scrutiny', desc: 'Exhaustive verification of parent deeds, encumbrances, and revenue records.', price: 'From ₹2,999' },
      { name: 'Sale Agreement Drafting & Vetting', desc: 'Watertight legal clauses protecting buyer/seller advance money and terms.', price: 'From ₹1,999' },
      { name: 'Sub-Registrar Registration Support', desc: 'Guidance through challan generation, stamp duty, and biometric execution.', price: 'From ₹3,499' },
      { name: 'Legal Notice & Dispute Advisory', desc: 'Drafting formal notices for builder delay, breach of contract, or rent issues.', price: 'From ₹1,499' }
    ]
  },
  {
    slug: 'landscapers',
    label: 'Landscapers',
    line1: 'Landscapers',
    line2: '',
    shortTitle: 'Landscapers',
    iconName: 'Sprout',
    href: '/categories/landscapers',
    isLive: true,
    headline: 'Bespoke green landscapes & garden architecture.',
    supportingText: 'Professional landscape architects, terrace garden curators, lawn maintenance specialists, and automated irrigation experts.',
    tagline: 'Garden planning, balcony greenery & terrace landscaping',
    slogan: 'Lush Greens, Serene Scenes',
    heroImage: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1200&q=85',
    accentColor: '#16a34a',
    bgTint: '#f0fdf4',
    borderTint: '#bbf7d0',
    description: 'Professional landscape architects, terrace garden curators, lawn maintenance, and irrigation specialists.',
    benefits: [
      { title: 'Horticulture Specialists', desc: 'Expert botanists and landscape designers suited to local climate.' },
      { title: 'Water-Smart Irrigation', desc: 'Drip automation and rainwater conservation systems.' },
      { title: 'End-to-End Execution', desc: 'From soil preparation and plant curation to ongoing garden AMCs.' }
    ],
    serviceOptions: [
      'Garden Design',
      'Lawn Installation',
      'Lawn Maintenance',
      'Plant Installation',
      'Garden Irrigation',
      'Tree and Shrub Maintenance',
      'Outdoor Landscaping',
      'Garden Renovation'
    ],
    defaultPlaceholder: 'Describe your garden, lawn, or landscaping requirements.',
    servicePlaceholders: {
      'Garden Design': 'Tell us your space dimensions (balcony, terrace, villa lawn) and preferred aesthetic.',
      'Lawn Installation': 'Specify natural Mexican/Bermuda grass sodding or premium artificial turf installation.',
      'Lawn Maintenance': 'Mention lawn mowing frequency, de-weeding, aeration, and fertilizer requirements.',
      'Plant Installation': 'Tell us if you want flowering perennials, exotic palms, or indoor air-purifying foliage.',
      'Garden Irrigation': 'Describe your water source and if you require a programmable smart timer.',
      'Tree and Shrub Maintenance': 'Specify height of trees, pruning needs, or shaping of boundary hedges.',
      'Outdoor Landscaping': 'Describe stone pathways, gazebo, water fountain, or exterior illumination plans.',
      'Garden Renovation': 'Tell us about the existing garden state and what enhancements you envision.'
    },
    popularServices: [
      { name: 'Balcony & Terrace Garden Makeover', desc: 'Vertical green walls, planter boxes, and lightweight potting media.', price: 'From ₹4,999' },
      { name: 'Natural Grass Sodding & Lawn Prep', desc: 'Soil leveling, manure mixing, and fresh carpet grass installation.', price: 'From ₹35/sq.ft' },
      { name: 'Smart Drip Irrigation Automation', desc: 'Micro-drippers and timer valves for effortless everyday plant hydration.', price: 'From ₹2,499' },
      { name: 'Monthly Horticultural Maintenance', desc: 'Bi-weekly pruning, pest treatment, weeding, and organic feeding.', price: 'From ₹1,799/mo' }
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
    isLive: true,
    headline: 'Odorless, government-approved pest eradication.',
    supportingText: 'Government-approved, odorless, child-safe pest management solutions for homes, commercial offices, and residential societies.',
    tagline: 'Odorless termite, cockroach, rodent & bedbug eradication',
    slogan: 'Pest-Free Peace, Guaranteed',
    heroImage: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=85',
    accentColor: '#475569',
    bgTint: '#f8fafc',
    borderTint: '#e2e8f0',
    description: 'Government-approved, odorless, child-safe pest management solutions for homes, commercial offices, and societies.',
    benefits: [
      { title: '100% Odorless & Safe', desc: 'Bayer-certified herbal gels and child/pet safe chemicals.' },
      { title: 'Long-Term Warranty', desc: 'Free follow-up visits if pests reappear within the warranty period.' },
      { title: 'Certified Exterminators', desc: 'Trained technicians licensed by the Central Insecticides Board.' }
    ],
    serviceOptions: [
      'Cockroach Control',
      'Termite Treatment',
      'Mosquito Control',
      'Rodent Control',
      'Bed Bug Treatment',
      'Ant Control',
      'General Pest Inspection',
      'Preventive Pest Control'
    ],
    defaultPlaceholder: 'Tell us which pests you are experiencing and where the problem occurs.',
    servicePlaceholders: {
      'Cockroach Control': 'Specify the problem areas (kitchen cabinets, drain lines, appliances) and home size.',
      'Termite Treatment': 'Mention wooden doors, wardrobes, skirting boards, or mud tubes visible on walls.',
      'Mosquito Control': 'Tell us if indoor fogging, balcony mesh spray, or garden anti-larval treatment is needed.',
      'Rodent Control': 'Describe signs of rats/mice in false ceilings, kitchens, or society parking basements.',
      'Bed Bug Treatment': 'Mention how many bedrooms or mattresses are affected and the duration of infestation.',
      'Ant Control': 'Describe black/red ant trails near kitchen counters, balconies, or garden perimeters.',
      'General Pest Inspection': 'Request a comprehensive site survey for crawlspaces, attics, and plumbing shafts.',
      'Preventive Pest Control': 'Schedule quarterly preventive pest shielding for residential flats or villas.'
    },
    popularServices: [
      { name: 'Advanced Cockroach Herbal Gel', desc: 'Zero odor gel application in kitchen crevices with drain line spray.', price: 'From ₹699' },
      { name: 'Drill-Fill-Seal Anti-Termite Treatment', desc: 'Drilling along wall perimeter and infusing anti-termite barrier with 5-yr warranty.', price: 'From ₹2,499' },
      { name: '2-Stage Bed Bug Thermal Treatment', desc: 'Intensive steam treatment followed by residual spray on furniture.', price: 'From ₹1,299' },
      { name: 'Society & Commercial Fogging', desc: 'Large area cold mist fogging for basements, clubhouse, and compound.', price: 'Custom Quote' }
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
    isLive: true,
    headline: 'Crystal clear swimming pool maintenance & filtration.',
    supportingText: 'Professional pool technicians for robotic vacuuming, pH water chemistry balancing, and pump room servicing.',
    tagline: 'Swimming pool vacuuming, water balance & filter care',
    slogan: 'Crystal Waters, Carefree Swims',
    heroImage: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1200&q=85',
    accentColor: '#0891b2',
    bgTint: '#ecfeff',
    borderTint: '#a5f3fc',
    description: 'Professional pool technicians for robotic vacuuming, pH water chemistry balancing, and pump room maintenance.',
    benefits: [
      { title: 'Balanced Water Chemistry', desc: 'Accurate chlorine, alkalinity, and pH water safety testing.' },
      { title: 'Mechanical Pump Servicing', desc: 'Sand filter backwashing, strainers, and motor seal replacements.' },
      { title: 'Flexible AMC Packages', desc: 'Daily, weekly, or seasonal maintenance for villas and clubs.' }
    ],
    serviceOptions: [
      'Swimming Pool Cleaning',
      'Pool Water Treatment',
      'Filter Cleaning',
      'Pool Pump Maintenance',
      'Algae Removal',
      'Pool Inspection',
      'Regular Pool Maintenance'
    ],
    defaultPlaceholder: 'Describe your pool cleaning or maintenance requirement.',
    servicePlaceholders: {
      'Swimming Pool Cleaning': 'Mention pool size, water volume, and whether deep algae or leaf accumulation exists.',
      'Pool Water Treatment': 'Tell us if water is cloudy, green, or stinging eyes, and current chlorine levels.',
      'Filter Cleaning': 'Specify if you have sand filters, cartridge filters, or DE filters needing media change.',
      'Pool Pump Maintenance': 'Describe pump motor humming, low suction pressure, or pipe leaks.',
      'Algae Removal': 'Tell us about black/green algae patches on floor tiles or water discoloration.',
      'Pool Inspection': 'Request comprehensive testing of lights, balancing tank, overflow gutters, and coping.',
      'Regular Pool Maintenance': 'Schedule weekly maintenance visits for residential villa or community pools.'
    },
    popularServices: [
      { name: 'Complete Pool Deep Scrub & Shock', desc: 'Super-chlorination shock treatment, tile scrubbing, and automated vacuuming.', price: 'From ₹1,999' },
      { name: 'Sand Filter Backwash & Media Change', desc: 'Replacement of silica sand/glass media for pristine water filtration.', price: 'From ₹2,499' },
      { name: 'Monthly Villa Pool Maintenance AMC', desc: 'Twice-a-week vacuuming, skimming, chemical dosage, and water testing.', price: 'From ₹3,999/mo' },
      { name: 'Pool Pump & Motor Overhaul', desc: 'Mechanical seal replacement, impeller clearing, and priming fix.', price: 'From ₹1,499' }
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
    isLive: true,
    headline: 'Mechanized 6-stage overhead & sump tank sanitization.',
    supportingText: 'High-pressure mechanized cleaning, sludge de-watering, and UV antibacterial treatment for safe, pure household water.',
    tagline: 'Mechanized 6-stage overhead & underground tank hygiene',
    slogan: 'Pure Water, Healthy Living',
    heroImage: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=1200&q=85',
    accentColor: '#2563eb',
    bgTint: '#eff6ff',
    borderTint: '#bfdbfe',
    description: 'High-pressure mechanized cleaning, sludge de-watering, and UV antibacterial treatment for clean, safe household water.',
    benefits: [
      { title: '6-Stage Mechanized Process', desc: 'Sludge suction, high pressure jetting, scrub, and germicidal UV rays.' },
      { title: 'Antibacterial Disinfection', desc: 'Food-grade certified organic sanitizers with zero chemical odor.' },
      { title: 'Safe Water Certification', desc: 'Complete photographic before-after report and water testing.' }
    ],
    serviceOptions: [
      'Overhead Water Tank Cleaning',
      'Underground Tank Cleaning',
      'Water Tank Disinfection',
      'Tank Inspection',
      'Residential Tank Cleaning',
      'Commercial Tank Cleaning'
    ],
    defaultPlaceholder: 'Tell us the tank type, approximate capacity, and cleaning requirement.',
    servicePlaceholders: {
      'Overhead Water Tank Cleaning': 'Specify tank material (Sintex/plastic/concrete), capacity in liters (500L, 1000L, etc.).',
      'Underground Tank Cleaning': 'State sump capacity in liters and accessibility of the manhole cover.',
      'Water Tank Disinfection': 'Request specialized UV irradiation and antibacterial spray treatment.',
      'Tank Inspection': 'Check for internal cracks, pipe rusting, silt build-up, or valve seepage.',
      'Residential Tank Cleaning': 'Schedule combined overhead tank + sump package for independent house or villa.',
      'Commercial Tank Cleaning': 'State apartment society or office building tank capacity (50,000L+).'
    },
    popularServices: [
      { name: '1000L Overhead Sintex Tank Clean', desc: 'Sludge de-watering, high-pressure jet spray, antibacterial scrub & UV treatment.', price: 'From ₹699' },
      { name: 'Underground Sump Cleaning (Up to 5000L)', desc: 'Heavy-duty submersible vacuuming, wall tile scrubbing, and disinfection.', price: 'From ₹1,299' },
      { name: 'Combined Villa Water Tank Package', desc: 'Complete sanitization of 2 overhead tanks + 1 ground sump with report.', price: 'From ₹1,899' },
      { name: 'Society High-Capacity Tank Hygiene', desc: 'Commercial high-volume deep mechanized cleaning with minimum water wastage.', price: 'Custom Quote' }
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
    isLive: true,
    headline: 'Uninterrupted power backup diagnostics & battery care.',
    supportingText: 'Expert backup power technicians for home/solar inverters, UPS units, lead-acid & tubular battery load testing.',
    tagline: 'Inverter, UPS & battery health check, distilled water top-up',
    slogan: 'Uninterrupted Power, Always On',
    heroImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=85',
    accentColor: '#059669',
    bgTint: '#ecfdf5',
    borderTint: '#a7f3d0',
    description: 'Expert backup power technicians for solar/home inverters, lead-acid & tubular battery load testing and diagnostics.',
    benefits: [
      { title: 'Trained Battery Engineers', desc: 'Multi-brand diagnostics for Luminous, Exide, Microtek, and Amaron.' },
      { title: 'Accurate Load Diagnostics', desc: 'Digital specific gravity checks and inverter charging calibration.' },
      { title: 'Doorstep Battery Replacement', desc: 'Genuine fresh stock delivery with manufacturer warranty and buyback.' }
    ],
    serviceOptions: [
      'Inverter Repair',
      'Battery Inspection',
      'Battery Replacement',
      'Inverter Servicing',
      'Backup Problems',
      'Charging Problems',
      'Wiring Inspection',
      'Annual Maintenance'
    ],
    defaultPlaceholder: 'Describe your inverter or battery issue, including any backup or charging problems.',
    servicePlaceholders: {
      'Inverter Repair': 'Mention inverter brand/model, continuous beeping sounds, or failure to switch to battery mode.',
      'Battery Inspection': 'Request terminal descaling, electrolyte specific gravity test, and distilled water top-up.',
      'Battery Replacement': 'Specify current battery Ah capacity (150Ah/200Ah), age, and exchange requirement.',
      'Inverter Servicing': 'Comprehensive motherboard dust cleaning, cooling fan servicing, and circuit test.',
      'Backup Problems': 'Tell us how many hours of backup you currently get versus expected duration.',
      'Charging Problems': 'Describe battery not holding charge, low charging current, or transformer heating.',
      'Wiring Inspection': 'Check heavy gauge DC battery cables, bypass changeover switch, and main earthing.',
      'Annual Maintenance': 'Schedule preventive bi-annual checkups before the peak monsoon or summer seasons.'
    },
    popularServices: [
      { name: 'Comprehensive Inverter & Battery Health Check', desc: 'Specific gravity hydrometer test, terminal cleaning, and inverter board check.', price: 'From ₹299' },
      { name: 'Inverter Motherboard & Relay Repair', desc: 'MOSFET replacement, charging circuit repair, and relay calibration.', price: 'From ₹799' },
      { name: 'Tubular Battery Distilled Water & Descale', desc: 'Top-up with laboratory grade distilled water and terminal grease protection.', price: 'From ₹249' },
      { name: 'New Inverter & Battery Combo Setup', desc: 'Full installation with heavy-duty copper cables and manual bypass switch.', price: 'From ₹899' }
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
    isLive: true,
    headline: 'Certified elevator safety auditing & engineering support.',
    supportingText: 'Certified elevator engineers for passenger lifts, residential dumbwaiters, and freight elevators with 24/7 breakdown helpline.',
    tagline: 'Elevator safety auditing, preventive lubrication & 24/7 breakdown support',
    slogan: 'Smooth Rides, Safety First',
    heroImage: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1200&q=85',
    accentColor: '#1d4ed8',
    bgTint: '#eff6ff',
    borderTint: '#bfdbfe',
    description: 'Certified elevator engineers for passenger lifts, freight elevators, and residential dumbwaiters.',
    benefits: [
      { title: 'Certified Lift Engineers', desc: 'Compliant with Indian Lift Acts and international safety norms.' },
      { title: 'Automatic Rescue Verification', desc: 'Thorough ARD battery checks to eliminate passenger entrapment.' },
      { title: '24/7 Breakdown Response', desc: 'Dedicated emergency dispatch for residential societies and buildings.' }
    ],
    serviceOptions: [
      'Lift Inspection',
      'Lift Repair',
      'Preventive Maintenance',
      'Lift Door Problems',
      'Lift Noise Inspection',
      'Elevator Electrical Problems',
      'Annual Maintenance'
    ],
    defaultPlaceholder: 'Describe the lift issue, equipment problem, or maintenance requirement.',
    servicePlaceholders: {
      'Lift Inspection': 'State number of stops/floors, lift capacity (persons/kg), and current certification status.',
      'Lift Repair': 'Describe the breakdown symptom (stuck between floors, leveling error, brake slippage).',
      'Preventive Maintenance': 'Schedule monthly safety checks, machine oiling, and door sensor alignment.',
      'Lift Door Problems': 'Explain automatic door sticking, optical sensor failure, or landing door lock issues.',
      'Lift Noise Inspection': 'Describe grinding noises from guide rails, counterweight vibration, or motor hum.',
      'Elevator Electrical Problems': 'Specify control panel error codes, indicator displays, or push button faults.',
      'Annual Maintenance': 'Request non-comprehensive or comprehensive AMC proposal for society lifts.'
    },
    popularServices: [
      { name: 'Comprehensive Monthly Safety Audit', desc: '50-point inspection including ARD, governor, guide shoes, and door locks.', price: 'From ₹1,499' },
      { name: 'Elevator Automatic Door Overhaul', desc: 'Door drive belt tightening, optical curtain sensor fix, and operator repair.', price: 'From ₹1,299' },
      { name: 'ARD Emergency Battery Bank Replacement', desc: 'Fresh heavy-duty UPS batteries ensuring fail-safe landing during power cuts.', price: 'From ₹2,999' },
      { name: 'Annual Lift Maintenance Contract (AMC)', desc: '12 scheduled visits + unlimited emergency breakdown breakdown visits.', price: 'From ₹14,999/yr' }
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
    isLive: true,
    headline: 'B2B commercial procurement & ergonomic workspace essentials.',
    supportingText: 'Bulk procurement and doorstep delivery of ergonomic office chairs, modular desks, paper supplies, IT peripherals, and cafeteria provisions.',
    tagline: 'Ergonomic furnishings, commercial stationery & office pantry supplies',
    slogan: 'Smarter Workspaces, Better Days',
    heroImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=85',
    accentColor: '#0284c7',
    bgTint: '#f0f9ff',
    borderTint: '#bae6fd',
    description: 'Bulk procurement and doorstep delivery of ergonomic office chairs, desks, paper essentials, tech accessories, and cafeteria provisions.',
    benefits: [
      { title: 'Wholesale B2B Pricing', desc: 'Discounted bulk rates with GST tax invoices and credit support.' },
      { title: 'Doorstep Next-Day Delivery', desc: 'Scheduled recurring restocking directly to your commercial floor.' },
      { title: 'Ergonomic Quality Spares', desc: 'BIFMA-certified furniture and genuine branded consumables.' }
    ],
    serviceOptions: [
      'Office Furniture',
      'Office Stationery',
      'Printer and Office Equipment',
      'Computer Accessories',
      'Bulk Office Supplies',
      'Office Setup Requirements',
      'Recurring Supply Requirements'
    ],
    defaultPlaceholder: 'Tell us which products or equipment you need and the approximate quantity.',
    servicePlaceholders: {
      'Office Furniture': 'Specify mesh chairs, height-adjustable desks, conference tables, or storage pedestals.',
      'Office Stationery': 'List requirement for copier paper (75/80 GSM), pens, sticky notes, files, and binders.',
      'Printer and Office Equipment': 'State printer cartridge models (HP/Canon), paper shredders, or laminating machines.',
      'Computer Accessories': 'Mention wireless mouse/keyboard combos, monitor arms, HDMI adapters, and surge strips.',
      'Bulk Office Supplies': 'List combined requirement for breakroom coffee/tea provisions and cleaning consumables.',
      'Office Setup Requirements': 'Describe new branch setup for 10 to 500+ workstations with required timelines.',
      'Recurring Supply Requirements': 'Setup automated monthly scheduled delivery for consumable office inventory.'
    },
    popularServices: [
      { name: 'Ergonomic High-Back Mesh Chairs', desc: 'BIFMA-tested multi-lock lumbar support chairs with 3-year warranty.', price: 'From ₹4,499' },
      { name: '75 GSM Copier Paper Bundles (A4)', desc: 'Bulk cartons of premium brightness multipurpose printing paper.', price: 'From ₹1,299/box' },
      { name: 'Workstation Setup & Cable Management', desc: 'Monitor arms, spine cable conduits, and under-desk power distribution.', price: 'From ₹799/desk' },
      { name: 'Monthly Office Pantry & Restock Care', desc: 'Automated delivery of coffee beans, tea bags, tissue rolls, and cleaning liquids.', price: 'Custom Quote' }
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
    isLive: true,
    headline: 'Comprehensive building operations, security & housekeeping.',
    supportingText: 'End-to-end commercial building, gated community, and residential estate operations with trained on-site staff and supervision.',
    tagline: 'Comprehensive housekeeping, security guards & property upkeep',
    slogan: 'Flawless Care, Seamless Spaces',
    heroImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=85',
    accentColor: '#4f46e5',
    bgTint: '#eef2ff',
    borderTint: '#c7d2fe',
    description: 'End-to-end commercial building, gated community, and residential estate operations with trained on-site staff.',
    benefits: [
      { title: 'Trained & Vetted Staff', desc: 'Background-verified security guards, janitors, and MEP technicians.' },
      { title: 'Strict Quality SLAs', desc: 'Daily logbooks, automated attendance, and dedicated facility managers.' },
      { title: 'Cost-Effective Operations', desc: 'Consolidated vendor management reducing overhead for societies and offices.' }
    ],
    serviceOptions: [
      'Commercial Housekeeping',
      'Security Guard Services',
      'Plumbing & Electrical MEP',
      'Waste Management & Composting',
      'Society & Estate Management',
      'Deep Cleaning & Sanitization'
    ],
    defaultPlaceholder: 'Describe your facility, building size, staff requirements, or maintenance scope.',
    servicePlaceholders: {
      'Commercial Housekeeping': 'Specify office square footage, shift timings, and number of daily cleaning personnel needed.',
      'Security Guard Services': 'State gate checkpoints, 24/7 shifts, boom barrier supervision, and visitor logging needs.',
      'Plumbing & Electrical MEP': 'Dedicated on-site electrician and plumber for building maintenance and pump rooms.',
      'Waste Management & Composting': 'Segregated wet/dry waste collection, organic composting, and recyclables management.',
      'Society & Estate Management': 'Comprehensive management of gated society including billing, vendor auditing, and AGM support.',
      'Deep Cleaning & Sanitization': 'Machine scrubbing for parking basements, glass facade wash, and clubhouse sanitization.'
    },
    popularServices: [
      { name: 'Corporate Daily Housekeeping Contract', desc: 'Dedicated janitorial team with industrial floor scrubbers and eco-friendly chemicals.', price: 'Custom Quote' },
      { name: '24/7 Security Personnel & Visitor Access', desc: 'Trained, uniform-clad security guards with digital app visitor verification.', price: 'Custom Quote' },
      { name: 'Basement & Facade Pressure Washing', desc: 'Heavy-duty degreasing and mechanized pressure scrubbing of driveways.', price: 'From ₹3,999' },
      { name: 'Society Facility Manager & Helpdesk', desc: 'On-site coordinator overseeing complaint tickets, lifts, generators, and guards.', price: 'Custom Quote' }
    ]
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
    headline: 'Turnkey interior design & bespoke modular living spaces.',
    supportingText: 'Connect with expert interior designers for custom modular kitchens, bedrooms, living spaces, false ceilings, and turnkey styling.',
    tagline: 'Modular kitchens, living spaces & turnkey interiors',
    slogan: 'Thoughtful Spaces, Beautiful Lives',
    heroImage: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=85',
    accentColor: '#e11d48',
    bgTint: '#fff1f2',
    borderTint: '#fecdd3',
    description: 'Connect with expert interior designers for custom modular kitchens, bedrooms, living spaces, and turnkey styling.',
    benefits: [
      { title: '45-Day Move-In Guarantee', desc: 'Factory-finish precision with strict move-in timeline assurance.' },
      { title: '10-Year Material Warranty', desc: 'Waterproof plywood, Hafele hardware, and anti-scratch acrylic laminates.' },
      { title: 'Transparent Cost Estimates', desc: 'Detailed bill of materials with zero hidden surcharges.' }
    ],
    serviceOptions: [
      'Modular Kitchens',
      'Full Home Interiors',
      'Living Room & Wardrobe Design',
      '3D Design Consultation',
      'Turnkey Renovation',
      'False Ceiling & Lighting'
    ],
    defaultPlaceholder: 'Tell us your home configuration (e.g. 2 BHK, 3 BHK Villa), style preferences, and budget.',
    servicePlaceholders: {
      'Modular Kitchens': 'Mention kitchen layout (L-shape, U-shape, Parallel), finish (acrylic/laminate), and chimney needs.',
      'Full Home Interiors': 'State apartment name, handover date, number of bedrooms, and preferred finish tier.',
      'Living Room & Wardrobe Design': 'Specify floor-to-ceiling sliding wardrobes, TV unit design, and crockery cabinet.',
      '3D Design Consultation': 'Request in-person site measurement and virtual photorealistic 3D render presentation.',
      'Turnkey Renovation': 'Describe older property revamp including civil changes, tiling, and complete interior revamp.',
      'False Ceiling & Lighting': 'Mention gypsum cove ceiling plans, magnetic track lights, and ambient dimmers.'
    },
    popularServices: [
      { name: 'Modular Kitchen with Hafele Hardware', desc: 'Soft-close tandem drawers, waterproof marine ply, and acrylic shutters.', price: 'From ₹1.49 L' },
      { name: 'Sliding Floor-to-Ceiling Wardrobes', desc: 'Custom internal organizers, loft storage, and profile lighting.', price: 'From ₹49,999' },
      { name: 'Designer False Ceiling & Ambient Lighting', desc: 'Saint-Gobain gypsum board with concealed warm LED strip profiles.', price: 'From ₹110/sq.ft' },
      { name: 'Complete 2 BHK Full Home Interior', desc: 'Living room, modular kitchen, and 2 fully furnished bedrooms.', price: 'From ₹3.49 L' }
    ]
  },
  {
    slug: 'properties',
    label: 'Properties',
    line1: 'Properties',
    line2: '',
    shortTitle: 'Properties',
    iconName: 'Home',
    href: '/properties',
    isLive: true,
    headline: 'Verified residential homes, plots & commercial spaces.',
    supportingText: 'Explore verified residential homes, plots, builder floors, and commercial spaces directly from verified owners.',
    tagline: 'Verified homes, apartments & commercial properties',
    slogan: 'Verified Spaces, New Beginnings',
    heroImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85',
    accentColor: '#15803d',
    bgTint: '#f0fdf4',
    borderTint: '#bbf7d0',
    description: 'Explore verified residential homes, plots, builder floors, and commercial spaces directly from owners.',
    benefits: [
      { title: '100% Direct Owners', desc: 'Connect directly with verified property hosts without middleman friction.' },
      { title: 'Direct Owner Transparency', desc: 'Connect directly with verified hosts on sales and rental leases.' },
      { title: 'Doorstep Legal & Documentation', desc: 'End-to-end rental agreement and sale deed registration assistance.' }
    ],
    serviceOptions: [
      'Property Buying Consultation',
      'Property Rental Assistance',
      'Commercial Lease Enquiry',
      'Free Property Valuation',
      'Site Visit Scheduling',
      'Owner Contact Assistance'
    ],
    defaultPlaceholder: 'Describe the property you are looking for, including preferred localities and budget.',
    servicePlaceholders: {
      'Property Buying Consultation': 'Specify BHK configuration, budget range, preferred localities, and ready-to-move status.',
      'Property Rental Assistance': 'State family/bachelor preference, furnishing needs, budget, and move-in timeline.',
      'Commercial Lease Enquiry': 'Specify office/retail carpet area, parking requirements, and business nature.',
      'Free Property Valuation': 'Tell us your property locality, square footage, and age for market valuation.',
      'Site Visit Scheduling': 'Mention property ID or preferred day/time to coordinate an accompanied visit.',
      'Owner Contact Assistance': 'Tell us which property owner you would like direct contact details for.'
    },
    popularServices: [
      { name: 'Verified Residential Sale Listings', desc: 'Apartments, villas, and independent plots directly listed by owners.', price: 'Free to browse' },
      { name: 'Verified Direct Rental Homes', desc: 'Fully vetted rental flats with transparent security deposit terms.', price: 'Free to browse' },
      { name: 'Legal Title Check & Sale Deed Registration', desc: 'Complete advocate scrutiny of ownership deeds and sub-registrar assistance.', price: 'From ₹2,999' },
      { name: 'Digital Biometric Rental Agreement', desc: 'Doorstep biometric verification and registered rental agreement.', price: 'From ₹999' }
    ]
  }
];

export function getCategoryBySlug(slug) {
  if (!slug) return null;
  const normalized = String(slug).toLowerCase().trim();
  return (
    serviceCategories.find(c => c.slug === normalized) ||
    serviceCategories.find(c => c.label.toLowerCase() === normalized) ||
    serviceCategories.find(c => c.shortTitle.toLowerCase() === normalized) ||
    null
  );
}
