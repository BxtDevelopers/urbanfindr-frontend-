// Comprehensive Domain & Seed Data for Home Interior Project Management System
// Covering all 15 Home Interior steps:
// 1. Designer profiles, 2. Categories, 3. Packages, 4. Portfolio galleries,
// 5. Consultation booking, 6. Floor-plan uploads, 7. Site-visit requests,
// 8. Customized quotations, 9. Design proposals, 10. Project milestones,
// 11. Customer approvals, 12. Progress tracking, 13. Invoice management,
// 14. Project completion & warranty, 15. Customer reviews.

export const interiorCategories = [
  {
    id: 'modular-kitchens',
    title: 'Modular Kitchens',
    tagline: 'Ergonomic, Waterproof & Scratch-Resistant',
    heroImage: '/photos/kitchen-1.jpg',
    description: 'Precision-engineered modular kitchen layouts designed for Indian cooking habits. Featuring marine-grade BWP plywood, soft-close Blum & Hafele hardware, anti-fingerprint acrylic shutters, and heat-resistant quartz countertops.',
    startingPrice: '₹1,49,000',
    turnaround: '28-35 Days',
    layouts: ['L-Shaped Kitchen', 'Parallel Kitchen', 'U-Shaped Island', 'Straight Linear'],
    features: [
      'BWP 710 Boiling Waterproof Marine Ply carcass',
      'Hafele / Blum soft-close tandem drawer systems',
      'Anti-scratch, anti-fingerprint 1.5mm acrylic shutters',
      'KalingaStone / Silestone quartz countertops with waterfall edge',
      'Concealed warm-white profile under-cabinet LED lighting',
      'Faber / Elica ceiling & slant chimney ducting integration'
    ]
  },
  {
    id: 'living-dining',
    title: 'Living & Dining Spaces',
    tagline: 'Modern Elegance & Ambient Warmth',
    heroImage: '/photos/living-1.jpg',
    description: 'Welcoming living spaces tailored for family time and entertaining guests. Designed with bespoke TV entertainment consoles, acoustic fluted charcoal wall panels, designer foyer partitions, and concealed warm coved ceilings.',
    startingPrice: '₹1,85,000',
    turnaround: '30-40 Days',
    layouts: ['Open Concept Hall', 'Formal Drawing Room', 'Compact Urban Living', 'Duplex Living'],
    features: [
      'Floating wall-hung TV entertainment units with fluted louvers',
      'CNC-cut brass & tinted fluted glass decorative foyer partitions',
      'Saint-Gobain Gyproc false ceiling with magnetic track spotlighting',
      'Custom bar cabinets with soft-lit bronze glass display shelves',
      'Asian Paints Royale Aspire velvet finish wall treatments',
      'Concealed raceways for zero cable clutter'
    ]
  },
  {
    id: 'master-bedrooms',
    title: 'Master Bedrooms',
    tagline: 'Quiet Luxury & Personalized Comfort',
    heroImage: '/photos/bedroom-1.jpg',
    description: 'Sanctuaries crafted for rest and rejuvenation. Featuring floor-to-ceiling sliding wardrobes with integrated profile lighting, upholstered cushioned headboards, floating nightstands, and ergonomic work-from-home study nooks.',
    startingPrice: '₹1,95,000',
    turnaround: '30-42 Days',
    layouts: ['Master Suite', 'Guest Bedroom', 'Kids Adventure Room', 'Senior Citizen Room'],
    features: [
      'Floor-to-ceiling 9ft sliding wardrobes with soft-dampeners',
      'Custom velvet / leatherette upholstered acoustic headboard paneling',
      'Built-in sensor-activated wardrobe interior LED lighting',
      'Concealed vanity dresser with touch-sensor LED backlit mirror',
      'Minimalist floating study desk with wire managers and overhead bookshelves',
      'Acoustic sound-dampening wall paneling behind bed back'
    ]
  },
  {
    id: 'wardrobes-storage',
    title: 'Wardrobes & Storage Systems',
    tagline: 'Smart Organization & Maximum Utility',
    heroImage: '/photos/wardrobe-1.jpg',
    description: 'Maximized vertical storage engineered to eliminate bedroom clutter. Choose from sleek aluminum glass-profile shutters, anti-scratch PU lacquered finishes, and custom internal configurations with pull-out organizers.',
    startingPrice: '₹89,000',
    turnaround: '21-30 Days',
    layouts: ['Sliding Door Wardrobe', 'Hinged Shutter Wardrobe', 'Walk-in Closet', 'Loft Storage Units'],
    features: [
      'Slim anodized aluminum profile tinted glass shutters',
      'Modular interior pull-out organizers for watches, jewelry & belts',
      'Hydraulic pull-down wardrobe hanging lift for high lofts',
      'Dedicated digital biometric safe locker compartment',
      'Plywood internal carcass with anti-fungal fabric-textured laminate',
      'Motion-detecting internal LED light strips'
    ]
  },
  {
    id: 'false-ceiling-lighting',
    title: 'False Ceiling & Architectural Lighting',
    tagline: 'Ambient Layers & Sculptural Depth',
    heroImage: '/photos/interior-hero-bg.jpg',
    description: 'Transform room acoustics and aesthetics with seamless gypsum false ceilings. Layer direct, indirect, and ambient illumination using magnetic track spots, warm COB downlights, and concealed perimeter cove profiles.',
    startingPrice: '₹115 / sq.ft',
    turnaround: '12-18 Days',
    layouts: ['Perimeter Cove Ceiling', 'Rafter Wooden Ceiling', 'Magnetic Track Layout', 'Minimalist Flat Drop'],
    features: [
      'Saint-Gobain Gyproc moisture-resistant 12.5mm gypsum boards',
      'GI framing with anti-rust zinc-plated perimeter channels',
      'Magnetic low-voltage track lighting with movable spot and flood modules',
      'Philips / Wipro 3000K warm-white high-CRI concealed LED strips',
      'Seamless fiber-tape taped joints with zero crack warranty',
      'Smart WiFi / Zigbee dimmer integration with mobile app controls'
    ]
  },
  {
    id: 'bathroom-vanities',
    title: 'Bathroom Vanities & Utilities',
    tagline: 'Moisture-Proof & Resort-Inspired',
    heroImage: '/photos/house-1.jpg',
    description: 'High-durability moisture-resistant vanity units and concealed plumbing enclosures. Custom quartz counter basins, anti-fog LED mirrors, and water-repellent PVC/marine-plywood cabinetry.',
    startingPrice: '₹45,000',
    turnaround: '14-20 Days',
    layouts: ['Floating Vanity', 'Twin Basin Counter', 'Linen Cabinet Unit', 'Utility Washer Enclosure'],
    features: [
      '100% waterproof PVC foam board & Marine 710 ply construction',
      'Countertop ceramic basins with Kohler / Grohe high-flow brassware',
      'Smart touch anti-fog demister LED vanity mirrors',
      'Concealed laundry hamper pull-out basket',
      'Quartz countertop with integrated backsplash slab'
    ]
  },
  {
    id: 'full-home-turnkey',
    title: 'Full Home Turnkey Interiors',
    tagline: 'End-to-End Design, Execution & 45-Day Handover',
    heroImage: '/photos/apartment-1.jpg',
    description: 'Complete home transformation from bare shell or resale to ready-to-move sanctuary. We manage civil alterations, electrical rewiring, false ceilings, custom modular woodwork, painting, and deep cleaning under one dedicated Project Manager.',
    startingPrice: '₹3,49,000',
    turnaround: '45-Day Move-In Guarantee',
    layouts: ['1 BHK Starter', '2 BHK Standard', '3 BHK Premium', '4 BHK / Luxury Villa'],
    features: [
      'Dedicated On-site Project Manager with daily photo progress updates',
      'Photorealistic 3D virtual walkthroughs & 2D CAD layout plans',
      'Complete civil modifications, granite framing, and tile laying',
      'Factory-assembled precision modular woodwork with 10-year warranty',
      'Comprehensive final snag list inspection & mechanized deep cleaning',
      'Formal Handover Certificate & 10-Year Material Warranty Card'
    ]
  }
];

export const interiorDesigners = [
  {
    id: 'pro-int-1',
    name: 'Deepika Rao',
    studio: 'DesignHut Interiors',
    specialist: 'Lead Residential Architect',
    rating: 4.9,
    reviewsCount: 184,
    completedProjects: 142,
    experience: '11+ Years Exp.',
    badge: 'Master Designer',
    city: 'Hyderabad',
    locality: 'Gachibowli & Financial District',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    startingPrice: '₹1.5 Lakhs onwards',
    specialties: ['Modern Luxury', 'Modular Kitchens', 'Scandinavian Living', 'Smart Space Planning'],
    awards: ['IIID Design Excellence 2024', 'Best Residential Studio Hyderabad 2025'],
    teamSize: '14 Specialists (Designers, 3D Renderers & Site Engineers)',
    phone: '+91 98490 12001',
    email: 'deepika@designhut.demo',
    bio: 'Alumnus of CEPT Ahmedabad with over a decade of experience crafting bespoke homes in Hyderabad’s prime gated communities. Known for balancing sleek aesthetics with durable, low-maintenance materials.',
    portfolioHighlights: ['My Home Bhooja 3 BHK', 'Aparna Sarovar 4 BHK Villa', 'Jayabheri The Peak Penthouse']
  },
  {
    id: 'pro-int-2',
    name: 'Ananya Sharma',
    studio: 'LuxeSpaces Studio',
    specialist: 'Principal Interior Stylist',
    rating: 4.8,
    reviewsCount: 120,
    completedProjects: 96,
    experience: '8+ Years Exp.',
    badge: 'Top Rated Stylist',
    city: 'Hyderabad',
    locality: 'Jubilee Hills & Madhapur',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
    startingPrice: '₹2.0 Lakhs onwards',
    specialties: ['Minimalist Chic', 'Warm Bohemian', 'Wardrobes & Walk-in Closets', 'Architectural Lighting'],
    awards: ['Elle Decor Rising Star 2023', 'Top 30 Under 35 Designers'],
    teamSize: '9 Curators & Draftspersons',
    phone: '+91 98490 12055',
    email: 'ananya@luxespaces.demo',
    bio: 'Specializing in light-filled, airy spaces with warm neutral color palettes, fluted wooden details, and organic textures. Believes that every square foot of an apartment should serve both purpose and poetry.',
    portfolioHighlights: ['Lodha Bellezza 3 BHK', 'Phoenix Golf Edge Duplex', 'Prestige High Fields 2.5 BHK']
  },
  {
    id: 'pro-int-3',
    name: 'Rajesh Varma',
    studio: 'Varma & Associates Interiors',
    specialist: 'Turnkey Execution Director',
    rating: 4.9,
    reviewsCount: 210,
    completedProjects: 185,
    experience: '14+ Years Exp.',
    badge: 'Turnkey Specialist',
    city: 'Hyderabad',
    locality: 'Banjara Hills & Hitec City',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80',
    startingPrice: '₹3.0 Lakhs onwards',
    specialties: ['Turnkey Renovation', 'Civil Transformations', 'Luxury Italian PU Finishes', 'Home Theaters'],
    awards: ['National Turnkey Excellence 2024', 'Verified Factory Finish Partner'],
    teamSize: '22 On-site Engineers & Master Carpenters',
    phone: '+91 98490 12088',
    email: 'rajesh@varma-interiors.demo',
    bio: 'Specialist in heavy civil transformations and high-end turnkey execution. Oversees in-house factory manufacturing using European CNC edge-banding machinery for zero-defect carpentry.',
    portfolioHighlights: ['Rainbow Vistas 4 BHK', 'Lanco Hills Luxury Apartment', 'Tellapur Independent Villa']
  },
  {
    id: 'pro-int-4',
    name: 'Priya Sengupta',
    studio: 'Bespoke Habitat',
    specialist: 'Modular Space Consultant',
    rating: 4.9,
    reviewsCount: 156,
    completedProjects: 118,
    experience: '9+ Years Exp.',
    badge: 'Modular Specialist',
    city: 'Hyderabad',
    locality: 'Kondapur & Hitec City',
    avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=400&q=80',
    startingPrice: '₹1.8 Lakhs onwards',
    specialties: ['Ergonomic Kitchens', 'Kid-friendly Homes', 'Compact Space Optimization', 'Eco-friendly Materials'],
    awards: ['Green Living Designer 2024', 'Hettich Certified Space Planner'],
    teamSize: '11 Interior Designers & Project Managers',
    phone: '+91 98490 12099',
    email: 'priya@bespokehabitat.demo',
    bio: 'Passionate about smart compact living, child-safe rounded furniture profiles, and sustainable low-VOC laminate finishes. Helps young working families turn standard developer apartments into dream living spaces.',
    portfolioHighlights: ['SMR Vinay Iconia 3 BHK', 'My Home Avatar 2 BHK', 'Candeur 40 3 BHK']
  }
];

export const interiorPackages = [
  {
    id: 'pkg-1bhk',
    bhk: '1 BHK',
    name: '1 BHK Starter Makeover',
    tagline: 'Ideal for bachelors, rental investment, or compact first homes',
    carpetArea: '450 - 650 sq.ft',
    turnaroundDays: 35,
    tiers: {
      essential: {
        price: 189000,
        label: 'Essential',
        tag: 'Value for Money',
        materials: 'Commercial MR Plywood + 0.8mm Gloss Laminate + Ebco Fittings',
        inclusions: [
          'Modular L-shape kitchen with 3 wire baskets & sink cabinet',
          'Master bedroom 2-door hinged wardrobe (6ft x 7ft) with internal shelves',
          'Sleek wall-mounted TV entertainment console with cable ducting',
          'Basic false ceiling with perimeter warm-white LED strip in living room',
          'Asian Paints Tractor Emulsion 2-coat repainting',
          '3-Year Warranty & 35-Day Move-In Guarantee'
        ]
      },
      premium: {
        price: 249000,
        label: 'Premium',
        tag: 'Most Popular',
        materials: 'IS:710 Marine BWP Plywood + 1.0mm Anti-Scratch Acrylic + Hafele Hardware',
        inclusions: [
          'Modular kitchen with soft-close tandem drawers, cutlery tray & loft storage',
          'Floor-to-ceiling 3-door sliding wardrobe with loft storage & mirror',
          'Fluted charcoal wall paneling + floating TV unit with drawer storage',
          'Full-room Gyproc false ceiling with magnetic track spotlighting in living',
          'Asian Paints Royale Luxury Emulsion finish across all rooms',
          '5-Year Warranty & 35-Day Move-In Guarantee'
        ]
      },
      luxe: {
        price: 329000,
        label: 'Luxe',
        tag: 'Executive Finish',
        materials: 'Action TESA HDHMR / BWP Marine Ply + 1.5mm Mirror Gloss PU + Blum Servo-Drive',
        inclusions: [
          'Complete modular kitchen with KalingaStone quartz counter & Blum soft-close',
          'Floor-to-ceiling tinted glass profile wardrobe with sensor LED strip lights',
          'Italian marble texture TV back-wall paneling with ambient back-lighting',
          'Designer cove ceiling with smart dimmable RGBW lighting control',
          'Asian Paints Royale Aspire PU velvet wall treatment with feature wall',
          '10-Year Warranty & Dedicated Project Manager'
        ]
      }
    }
  },
  {
    id: 'pkg-2bhk',
    bhk: '2 BHK',
    name: '2 BHK Comfort Living',
    tagline: 'Designed for nuclear families wanting durable elegance and smart storage',
    carpetArea: '900 - 1,250 sq.ft',
    turnaroundDays: 45,
    tiers: {
      essential: {
        price: 349000,
        label: 'Essential',
        tag: 'Budget Smart',
        materials: 'BWP Marine Ply in Wet Areas + MR Ply in Bedrooms + 0.8mm Laminate',
        inclusions: [
          'Modular kitchen with stainless steel tandem drawers, tall pantry & loft',
          'Master bedroom 7ft sliding wardrobe with internal chest of drawers',
          'Guest bedroom 2-door wardrobe with dressing mirror',
          'Living room TV console with open display book rack',
          'Perimeter false ceiling in living & dining room with warm LED coves',
          'Asian Paints Premium Emulsion painting across whole home',
          '5-Year Warranty & 45-Day Handover'
        ]
      },
      premium: {
        price: 479000,
        label: 'Premium',
        tag: 'Urban Favorite',
        materials: 'Century / Greenply 710 BWP Plywood + 1.2mm High-Gloss Acrylic + Hafele Soft-Close',
        inclusions: [
          'Chef modular kitchen with Hafele tandem drawers, wicker basket & bottle pull-out',
          'Master suite 8ft floor-to-ceiling sliding wardrobe with fluted profile loft',
          'Guest bedroom 3-door hinged wardrobe with study table & floating bookshelf',
          'Designer foyer shoe cabinet with CNC jali partition & seating bench',
          'Living room floating TV console with fluted paneling & magnetic track lights',
          'Full false ceiling in living, dining & master bedroom with warm Philips LED',
          'Asian Paints Royale Luxury washable paint + 1 designer accent wall',
          '10-Year Warranty & 45-Day Move-In Guarantee'
        ]
      },
      luxe: {
        price: 629000,
        label: 'Luxe',
        tag: 'High-End Luxury',
        materials: 'HDHMR Grade A + European Acrylic / Natural Veneer + Blum Blumotion + Quartz',
        inclusions: [
          'Luxury kitchen with waterfall quartz island, Blum servo-drive drawers & profile lights',
          'Master walk-in wardrobe with bronze-tinted glass shutters & motion sensor LED',
          'Kids bedroom themed loft bed with integrated ergonomic study & toy storage',
          'Living room Italian bookmatched fluted paneling with concealed wire conduits',
          'Designer vanity counters with touch-lit LED mirrors in both bathrooms',
          'Smart home lighting automation with mobile app and voice assistant sync',
          '10-Year Warranty & Dedicated Site Supervisor'
        ]
      }
    }
  },
  {
    id: 'pkg-3bhk',
    bhk: '3 BHK',
    name: '3 BHK Signature Residence',
    tagline: 'Spacious family haven with luxury finishes and dedicated work-study spaces',
    carpetArea: '1,350 - 1,900 sq.ft',
    turnaroundDays: 45,
    tiers: {
      essential: {
        price: 499000,
        label: 'Essential',
        tag: 'Practical Choice',
        materials: 'BWP Marine Plywood + 0.8mm Textured Laminate + Hettich Fittings',
        inclusions: [
          'Large modular kitchen with tandem drawers, corner carousel & oil pull-out',
          '3 full-size bedroom wardrobes (Master, Guest, Kids) with overhead lofts',
          'Living room TV unit with wall-mounted storage cabinet',
          'Study table with drawers in kids/work room',
          'False ceiling in living, dining, and master bedroom with LED fixtures',
          'Asian Paints Royale interior wall painting',
          '5-Year Warranty & 45-Day Handover'
        ]
      },
      premium: {
        price: 689000,
        label: 'Premium',
        tag: 'Best Value',
        materials: 'Century Club Prime BWP 710 + 1.2mm Acrylic & PU + Hafele Soft-Close',
        inclusions: [
          'Turnkey modular kitchen with quartz countertop, tandem drawers, pantry unit & chimney ducting',
          'Master suite floor-to-ceiling wardrobe with integrated vanity mirror & organizer',
          'Kids bedroom 3-door wardrobe with integrated study desk & magnetic pin-board',
          'Guest bedroom sliding wardrobe with loft storage',
          'Designer foyer partition with brass accents and shoe seating rack',
          'Sculptural TV back-panel with fluted louvers, profile lighting & stone shelf',
          'Full-house designer false ceiling with perimeter cove and track lighting',
          'Asian Paints Royale Aspire velvet finish + 2 wallpaper/stencil accent walls',
          '10-Year Warranty & 45-Day Move-In Guarantee'
        ]
      },
      luxe: {
        price: 949000,
        label: 'Luxe',
        tag: 'Architectural Masterpiece',
        materials: 'Teak / Natural Wood Veneer + Polyurethane (PU) Polish + Blum Servo-Drive + Quartz',
        inclusions: [
          'Showstopper kitchen with breakfast island, Caesarstone quartz, and Blum touch-to-open cabinets',
          'Master bedroom walk-in closet with bronze tinted aluminum glass shutters and warm internal lights',
          'Bespoke acoustic upholstered master bed back panel with integrated floating brass nightstands',
          'Living room bookmatched Italian composite marble TV wall with fluted hardwood battens',
          'Kids room bunk / storage bed with integrated study workstation and bookshelf tower',
          'Mandir unit with CNC-cut backlit Corian / teak wood jali and storage drawers',
          'Smart automated lighting scenes + mechanized deep clean + 10-Year Warranty'
        ]
      }
    }
  },
  {
    id: 'pkg-villa',
    bhk: '4 BHK / Villa',
    name: '4 BHK & Luxury Villa Mansion',
    tagline: 'Expansive bespoke residences, double-height living spaces & private suites',
    carpetArea: '2,200 - 4,500 sq.ft',
    turnaroundDays: 60,
    tiers: {
      essential: {
        price: 799000,
        label: 'Essential',
        tag: 'Foundational',
        materials: 'BWP 710 Marine Ply + 1.0mm Anti-Scratch Laminate + Hettich German Hardware',
        inclusions: [
          'Expansive modular kitchen with utility wash cabinets and tall pantry',
          '4 bedroom wardrobes with loft storage and internal accessories',
          'Living room entertainment unit + family lounge TV unit',
          'Foyer storage console with shoe rack and mirror',
          'Gyproc false ceiling across living, dining, family room and 4 bedrooms',
          'Asian Paints Royale finish across all villa levels',
          '7-Year Warranty & 60-Day Handover'
        ]
      },
      premium: {
        price: 1150000,
        label: 'Premium',
        tag: 'Grand Living',
        materials: 'Greenply Marine 710 + Ultra-High Gloss Acrylic + Hafele Premium Fittings',
        inclusions: [
          'Island modular kitchen with Silestone quartz, tall unit with oven cavity, and Blum soft-close',
          '4 designer floor-to-ceiling sliding wardrobes with sensor-activated internal lights',
          'Double-height living room acoustic fluted wall treatment with concealed brass profiles',
          'Bespoke pooja room with teakwood arch, brass bells & backlit onyx stone',
          'Family lounge bar counter with bronze-tinted glass wine racks',
          'Architectural magnetic track lighting with smart WiFi automation controllers',
          '10-Year Warranty & 60-Day Move-In Guarantee'
        ]
      },
      luxe: {
        price: 1600000,
        label: 'Luxe',
        tag: 'Ultra-Luxury',
        materials: 'Italian PU Polish + Natural Smoked Oak Veneer + Blum Servo-Drive + Imported Onyx',
        inclusions: [
          'Chef kitchen + secondary wet kitchen with imported quartz, Blum touch-open & Sub-Zero paneling',
          'Two full walk-in designer dressing rooms with tinted glass and velvet drawer organizers',
          'Private home theater acoustic wall paneling with fiber-optic starlight ceiling',
          'Handcrafted solid teakwood prayer sanctuary with carved jali doors',
          'Balcony deck composite wood flooring with vertical green plant wall & ambient lanterns',
          'Full-house smart home automation (lighting, curtains, HVAC integration)',
          '10-Year Comprehensive Warranty & Handover Gold Plaque'
        ]
      }
    }
  },
  {
    id: 'pkg-kitchen',
    bhk: 'Kitchen',
    name: 'Modular Kitchen Express',
    tagline: 'Bespoke modular kitchen revamps with factory precision within 25 days',
    carpetArea: '80 - 200 sq.ft',
    turnaroundDays: 25,
    tiers: {
      essential: {
        price: 149000,
        label: 'Essential',
        tag: 'Compact Fast',
        materials: 'BWP 710 Marine Ply + 0.8mm Matte Laminate + Ebco Soft-Close',
        inclusions: [
          'Base cabinets with 3 stainless steel tandem drawers',
          'Overhead wall cabinets with hydraulic stay-up lift doors',
          'Granite-friendly under-sink waterproof carcass unit',
          'Spice pull-out rack and cutlery tray',
          '5-Year Water-Resistant Warranty'
        ]
      },
      premium: {
        price: 219000,
        label: 'Premium',
        tag: 'Chef Choice',
        materials: 'Century Club BWP Plywood + 1.2mm Scratch-Resistant Acrylic + Hafele Hardware',
        inclusions: [
          'Full kitchen cabinetry with anti-fingerprint acrylic shutters',
          'Hafele soft-close tandem drawers with 45kg dynamic load rating',
          'Loft storage to ceiling with push-to-open touch latches',
          'Wicker vegetable basket and dual-tier corner carousel',
          'Under-cabinet warm LED lighting strip with sensor switch',
          '10-Year Comprehensive Warranty'
        ]
      },
      luxe: {
        price: 299000,
        label: 'Luxe',
        tag: 'Gourmet Studio',
        materials: 'BWP Marine Ply + High-Gloss Italian PU + Blum Blumotion + Kalinga Quartz',
        inclusions: [
          'High-durability Quartz countertop with seamless undermount sink cutout',
          'Blum Servo-Drive motorized electronic touch-to-open drawer units',
          'Tall pantry unit with 6 pull-out internal drawers and glass sides',
          'Integrated profile handles with magnetic track spice rack shelf',
          'Faber 1200 m3/hr auto-clean ceiling chimney installation included',
          '10-Year Warranty & Free 6-Month Kitchen Deep Cleaning'
        ]
      }
    }
  }
];

export const interiorPortfolio = [
  {
    id: 'port-1',
    title: 'The Modern Nordic Haven',
    room: 'Living Room',
    category: 'living-dining',
    style: 'Scandinavian Minimalist',
    bhk: '3 BHK',
    carpetArea: '1,540 sq.ft',
    locality: 'Gachibowli, Hyderabad',
    budget: '₹6.2 Lakhs',
    designer: 'Deepika Rao',
    beforeImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
    afterImage: '/photos/living-1.jpg',
    renders: ['/photos/living-1.jpg', '/photos/living-2.jpg', '/photos/interior-hero-bg.jpg'],
    description: 'Transforming a dark, compartmentalized builder hall into a sunlit open-concept living and dining lounge featuring warm fluted ash wood, soft ambient cove lighting, and tailored sectional seating.',
    tags: ['Fluted Paneling', 'Warm 3000K Cove', 'Open Living', 'Zero Cable Clutter']
  },
  {
    id: 'port-2',
    title: 'Sage & Quartz Gourmet Kitchen',
    room: 'Modular Kitchen',
    category: 'modular-kitchens',
    style: 'Modern Contemporary',
    bhk: '2 BHK',
    carpetArea: '120 sq.ft',
    locality: 'Madhapur, Hyderabad',
    budget: '₹2.4 Lakhs',
    designer: 'Priya Sengupta',
    beforeImage: 'https://images.unsplash.com/photo-1588854337221-4cf9fa96059c?auto=format&fit=crop&w=800&q=80',
    afterImage: '/photos/kitchen-1.jpg',
    renders: ['/photos/kitchen-1.jpg', '/photos/kitchen-2.jpg', '/photos/apartment-1.jpg'],
    description: 'Bespoke parallel kitchen finished in anti-fingerprint sage green acrylic with Calacatta quartz countertops, Hafele soft-close tandem drawers, and concealed under-cabinet illumination.',
    tags: ['Waterproof BWP 710', 'Hafele Soft-Close', 'Quartz Counter', 'Anti-Fingerprint']
  },
  {
    id: 'port-3',
    title: 'Warm Velvet Suite',
    room: 'Master Bedroom',
    category: 'master-bedrooms',
    style: 'Modern Luxury',
    bhk: '3 BHK',
    carpetArea: '210 sq.ft',
    locality: 'Jubilee Hills, Hyderabad',
    budget: '₹3.1 Lakhs',
    designer: 'Ananya Sharma',
    beforeImage: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80',
    afterImage: '/photos/bedroom-1.jpg',
    renders: ['/photos/bedroom-1.jpg', '/photos/bedroom-2.jpg', '/photos/bedroom-3.jpg'],
    description: 'Acoustic padded bed-back wall with warm brass inlays, 9ft floor-to-ceiling sliding wardrobe in bronze profile glass, and a floating study desk with wire management.',
    tags: ['Floor-to-Ceiling Sliding', 'Acoustic Headboard', 'Touch-lit Vanity', 'Warm Ambiance']
  },
  {
    id: 'port-4',
    title: 'Bronze & Glass Dressing Walk-in',
    room: 'Wardrobes & Storage',
    category: 'wardrobes-storage',
    style: 'Contemporary Chic',
    bhk: '4 BHK Villa',
    carpetArea: '160 sq.ft',
    locality: 'Banjara Hills, Hyderabad',
    budget: '₹2.8 Lakhs',
    designer: 'Rajesh Varma',
    beforeImage: 'https://images.unsplash.com/photo-1558997519-83ea9252def8?auto=format&fit=crop&w=800&q=80',
    afterImage: '/photos/wardrobe-1.jpg',
    renders: ['/photos/wardrobe-1.jpg', '/photos/wardrobe-2.jpg', '/photos/bedroom-3.jpg'],
    description: 'Custom walk-in wardrobe with anodized bronze aluminum frames, tinted fluted glass, sensor-activated interior lighting, and built-in velvet jewelry trays.',
    tags: ['Fluted Glass', 'Sensor Lights', 'Jewelry Organizer', 'Walk-in Closet']
  },
  {
    id: 'port-5',
    title: 'Monochrome Urban Sanctuary',
    room: 'Full Home Turnkey',
    category: 'full-home-turnkey',
    style: 'Industrial Modern',
    bhk: '2 BHK',
    carpetArea: '1,120 sq.ft',
    locality: 'Kondapur, Hyderabad',
    budget: '₹4.9 Lakhs',
    designer: 'Deepika Rao',
    beforeImage: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80',
    afterImage: '/photos/apartment-1.jpg',
    renders: ['/photos/apartment-1.jpg', '/photos/living-2.jpg', '/photos/kitchen-2.jpg'],
    description: 'Complete 45-day turnkey revamp of a bare shell 2 BHK into a sleek monochrome home with charcoal accents, concrete finish false ceilings, and smart lighting.',
    tags: ['45-Day Handover', 'Civil Alterations', 'Smart Lighting', 'Turnkey']
  },
  {
    id: 'port-6',
    title: 'Earthy Bohemian Family Room',
    room: 'Living Room',
    category: 'living-dining',
    style: 'Warm Bohemian',
    bhk: '3 BHK',
    carpetArea: '1,420 sq.ft',
    locality: 'Hitec City, Hyderabad',
    budget: '₹5.5 Lakhs',
    designer: 'Ananya Sharma',
    beforeImage: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
    afterImage: '/photos/interior-hero-bg.jpg',
    renders: ['/photos/interior-hero-bg.jpg', '/photos/living-1.jpg'],
    description: 'Warm amber tones, cane louvers, fluted TV consoles, and ambient recessed spotlights designed for relaxed weekend family living.',
    tags: ['Cane & Oak', 'Warm Amber Lighting', 'Louvers', 'Boho Comfort']
  }
];

export const sampleInteriorProject = {
  projectId: 'INT-PRJ-2026-08492',
  title: '3 BHK Contemporary Residence Makeover',
  clientName: 'Aditya & Neha Sharma',
  clientPhone: '+91 98490 84920',
  clientEmail: 'aditya.sharma@demo.urbanfindr',
  property: 'My Home Bhooja, Tower 4, Flat 1204',
  locality: 'Gachibowli, Hyderabad',
  bhk: '3 BHK',
  carpetAreaSqFt: 1450,
  packageSelected: '3 BHK Signature Residence (Premium Tier)',
  packagePrice: 689000,
  contractValue: 712000,
  amountPaid: 484160,
  amountDue: 227840,
  totalDays: 45,
  currentDay: 26,
  percentComplete: 68,
  status: 'in_progress',
  startDate: '2026-10-08',
  targetCompletionDate: '2026-11-22',
  designer: {
    id: 'pro-int-1',
    name: 'Deepika Rao',
    studio: 'DesignHut Interiors',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    phone: '+91 98490 12001',
    rating: 4.9,
    role: 'Lead Architect & Space Planner'
  },
  projectManager: {
    name: 'Venkatesh Murthy',
    phone: '+91 98490 33412',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80',
    role: 'Senior On-Site Civil & Quality Engineer'
  },
  floorPlan: {
    filename: 'MyHome_Bhooja_3BHK_1450sqft_FloorPlan.pdf',
    url: '/photos/apartment-1.jpg',
    uploadedAt: '2026-10-05',
    carpetArea: 1450,
    roomsCount: '3 Bedrooms, 3 Bathrooms, Living, Dining, Utility & Kitchen',
    notes: 'Laser measurement completed on 2026-10-07. Structural walls verified, no load-bearing columns disturbed.'
  },
  siteVisit: {
    scheduledDate: '2026-10-07',
    timeSlot: '10:30 AM - 12:00 PM',
    surveyor: 'Venkatesh Murthy (Site Engineer)',
    status: 'completed',
    notes: 'Laser room-by-room dimensional verification completed. Electrical switchboard positions marked. Plumbing points aligned for modular sink.'
  },
  customQuote: {
    quoteNumber: 'QT-2026-8492',
    createdAt: '2026-10-09',
    validUntil: '2026-11-09',
    status: 'accepted',
    subtotal: 689000,
    discount: 35000,
    gst: 58000,
    grandTotal: 712000,
    items: [
      { category: 'Modular Woodwork', item: 'L-Shaped Modular Kitchen with Hafele Tandem Drawers & Acrylic Shutters', quantity: 1, unit: 'Unit', rate: 215000, amount: 215000 },
      { category: 'Modular Woodwork', item: 'Master Bedroom 9ft Sliding Wardrobe with Bronze Fluted Glass Loft', quantity: 1, unit: 'Unit', rate: 125000, amount: 125000 },
      { category: 'Modular Woodwork', item: 'Guest Bedroom 3-Door Wardrobe with Dressing Mirror & Study Desk', quantity: 1, unit: 'Unit', rate: 88000, amount: 88000 },
      { category: 'Modular Woodwork', item: 'Kids Bedroom Sliding Wardrobe with Bookshelf & Study Workstation', quantity: 1, unit: 'Unit', rate: 94000, amount: 94000 },
      { category: 'Living Space', item: 'Fluted Louvered TV Entertainment Wall with Floating Quartz Shelf', quantity: 1, unit: 'Unit', rate: 58000, amount: 58000 },
      { category: 'False Ceiling', item: 'Gyproc Perimeter False Ceiling with Magnetic Track Light Fixtures', quantity: 650, unit: 'sq.ft', rate: 110, amount: 71500 },
      { category: 'Painting & Civil', item: 'Asian Paints Royale Luxury Velvet Emulsion + 2 Feature Walls', quantity: 1, unit: 'Whole Flat', rate: 60500, amount: 60500 },
      { category: 'Foyer & Mandir', item: 'CNC-cut Backlit Teakwood Pooja Sanctuary with Jali Shutters', quantity: 1, unit: 'Unit', rate: 42000, amount: 42000 }
    ]
  },
  proposals: [
    {
      proposalId: 'PROP-01',
      title: 'Initial 2D Layout & Space Plan',
      version: 'v1.0',
      submittedAt: '2026-10-10',
      status: 'approved',
      renders: ['/photos/apartment-1.jpg'],
      moodboard: ['/photos/living-1.jpg'],
      layoutPlan: 'Open living-dining configuration with breakfast counter facing living room.',
      materials: [
        { item: 'Kitchen Carcass', specification: 'Century Club Prime BWP 710 Marine Plywood', brand: 'CenturyPly' },
        { item: 'Shutters', specification: '1.2mm High-Gloss Anti-Scratch Acrylic', brand: 'Rehau German' },
        { item: 'Hardware', specification: 'Soft-Close Tandem Matrix Box Drawers', brand: 'Hafele' }
      ],
      notes: 'Client requested extra pantry unit and wider drawer for pots and pans.',
      feedback: 'Approved by Neha Sharma on 2026-10-11.',
      reviewedAt: '2026-10-11'
    },
    {
      proposalId: 'PROP-02',
      title: 'Photorealistic 3D Renders & Material Palette',
      version: 'v1.2',
      submittedAt: '2026-10-14',
      status: 'approved',
      renders: ['/photos/living-1.jpg', '/photos/kitchen-1.jpg', '/photos/bedroom-1.jpg'],
      moodboard: ['/photos/living-2.jpg', '/photos/interior-hero-bg.jpg', '/photos/wardrobe-1.jpg'],
      layoutPlan: 'Finalized 3D renders with day/night illumination scenes and exact material codes.',
      materials: [
        { item: 'Countertop', specification: 'White Calacatta Quartz with Gold Veins (18mm)', brand: 'KalingaStone' },
        { item: 'Living TV Wall', specification: 'Acoustic Fluted Charcoal Battens with Brass Trim', brand: 'EuroPratik' },
        { item: 'Master Bed Wall', specification: 'Velvet Channel Tufted Headboard Panel', brand: 'D’Decor' },
        { item: 'Lighting', specification: '3000K Warm-White Concealed COB & Track Spots', brand: 'Philips Hue' }
      ],
      notes: 'All renders reviewed with client during Virtual 3D walkthrough session. Final approval granted.',
      feedback: 'Approved by Aditya Sharma on 2026-10-15. Cleared for factory production.',
      reviewedAt: '2026-10-15'
    }
  ],
  milestones: [
    {
      milestoneId: 'M1',
      stage: 1,
      title: 'Design Signoff & 3D Walkthrough Finalization',
      percentage: 10,
      amount: 71200,
      targetDate: '2026-10-15',
      completedAt: '2026-10-14',
      status: 'completed',
      deliverables: ['2D Furniture Layout', '3D Walkthrough Renders', 'Material Palette Sign-off', 'Bill of Quantities Freeze'],
      sitePhotos: ['/photos/living-1.jpg'],
      approvedByCustomer: true,
      approvedAt: '2026-10-15',
      invoiceNumber: 'INV-2026-08492-1',
      paymentStatus: 'paid'
    },
    {
      milestoneId: 'M2',
      stage: 2,
      title: 'Civil, Electrical & Plumbing Rough-In',
      percentage: 20,
      amount: 142400,
      targetDate: '2026-10-23',
      completedAt: '2026-10-22',
      status: 'completed',
      deliverables: ['Wall Chasing for Concealed Conduits', 'AC Copper Piping Routing', 'Plumbing Core Cutting & Waste Relocation', 'Tile Framing & Leveling'],
      sitePhotos: ['/photos/house-1.jpg', '/photos/apartment-1.jpg'],
      approvedByCustomer: true,
      approvedAt: '2026-10-23',
      invoiceNumber: 'INV-2026-08492-2',
      paymentStatus: 'paid'
    },
    {
      milestoneId: 'M3',
      stage: 3,
      title: 'Modular Factory Production & Dispatch to Site',
      percentage: 40,
      amount: 284800,
      targetDate: '2026-11-04',
      completedAt: '2026-11-01',
      status: 'completed',
      deliverables: ['European CNC Carcass Precision Cutting', 'PUR Zero-Joint Hot-Melt Edge Banding', 'Factory Quality Inspection & Shrink-Wrap', 'Flat-Pack Delivery to Flat 1204'],
      sitePhotos: ['/photos/kitchen-2.jpg', '/photos/wardrobe-2.jpg'],
      approvedByCustomer: true,
      approvedAt: '2026-11-02',
      invoiceNumber: 'INV-2026-08492-3',
      paymentStatus: 'paid'
    },
    {
      milestoneId: 'M4',
      stage: 4,
      title: 'On-Site Modular Assembly & Quartz Installation',
      percentage: 15,
      amount: 106800,
      targetDate: '2026-11-12',
      completedAt: null,
      status: 'in_progress',
      deliverables: ['Kitchen Base & Wall Cabinet Alignment', 'Hafele Soft-Close Tandem Fitting', 'Wardrobe Sliding Shutter Mounting', 'Kalinga Quartz Countertop Waterfall Jointing'],
      sitePhotos: ['/photos/kitchen-1.jpg'],
      approvedByCustomer: false,
      approvedAt: null,
      invoiceNumber: 'INV-2026-08492-4',
      paymentStatus: 'unpaid'
    },
    {
      milestoneId: 'M5',
      stage: 5,
      title: 'False Ceiling, Painting & Lighting Fixtures',
      percentage: 10,
      amount: 71200,
      targetDate: '2026-11-18',
      completedAt: null,
      status: 'upcoming',
      deliverables: ['Saint-Gobain Gyproc Board Installation', 'Perimeter Warm LED Cove Testing', 'Magnetic Track Spot Alignment', 'Asian Paints Royale Final Coats'],
      sitePhotos: [],
      approvedByCustomer: false,
      approvedAt: null,
      invoiceNumber: 'INV-2026-08492-5',
      paymentStatus: 'upcoming'
    },
    {
      milestoneId: 'M6',
      stage: 6,
      title: 'Final Snag Audit, Deep Cleaning & Key Handover',
      percentage: 5,
      amount: 35600,
      targetDate: '2026-11-22',
      completedAt: null,
      status: 'upcoming',
      deliverables: ['108-Point Quality Snag Checklist Verification', 'Industrial Mechanized Floor & Window Deep Scrubbing', '10-Year Warranty Card Certificate Issue', 'Official Welcome Box & Key Handover'],
      sitePhotos: [],
      approvedByCustomer: false,
      approvedAt: null,
      invoiceNumber: 'INV-2026-08492-6',
      paymentStatus: 'upcoming'
    }
  ],
  progressUpdates: [
    {
      updateId: 'UPD-26',
      date: '2026-11-02',
      percentComplete: 68,
      dayNumber: 26,
      totalDays: 45,
      title: 'Modular Kitchen Cabinets Assembled & Quartz Slab Positioned',
      description: 'Factory-dispatched BWP marine carcasses for the modular kitchen have been leveled and anchored to the walls with laser accuracy. All Hafele tandem drawer runners fitted smoothly. Quartz countertop templating complete, waterfall edge adhesive curing overnight.',
      photos: ['/photos/kitchen-1.jpg', '/photos/wardrobe-1.jpg'],
      supervisor: 'Venkatesh Murthy (On-Site Supervisor)'
    },
    {
      updateId: 'UPD-24',
      date: '2026-10-31',
      percentComplete: 60,
      dayNumber: 24,
      totalDays: 45,
      title: 'Factory Quality Clearance & Site Material Unloading',
      description: 'All 42 flat-packed modular components cleared the 7-stage factory QC check at our automated Bengaluru plant. Safely unloaded at My Home Bhooja Flat 1204. Protective corrugated floor shielding laid across all vitrified tiles.',
      photos: ['/photos/living-2.jpg'],
      supervisor: 'Venkatesh Murthy (On-Site Supervisor)'
    },
    {
      updateId: 'UPD-18',
      date: '2026-10-25',
      percentComplete: 45,
      dayNumber: 18,
      totalDays: 45,
      title: 'Electrical Chasing Completed & Gyproc Channels Suspended',
      description: 'All conduits for wall lighting, magnetic tracks, and island breakfast counters laid. Ceiling GI grid leveled with laser plum line.',
      photos: ['/photos/bedroom-2.jpg'],
      supervisor: 'Venkatesh Murthy (On-Site Supervisor)'
    }
  ],
  approvals: [
    { approvalType: '2D Layout Floor Plan', title: 'Open Living & Kitchen Flow', status: 'approved', approvedAt: '2026-10-11', notes: 'Pantry position approved.' },
    { approvalType: '3D Photorealistic Design Proposal', title: 'Concept 3D Proposal v1.2', status: 'approved', approvedAt: '2026-10-15', notes: 'Approved after material review.' },
    { approvalType: 'Material & Swatch Selection', title: 'Sage Acrylic & Calacatta Quartz Swatch', status: 'approved', approvedAt: '2026-10-16', notes: 'Physical samples inspected at Experience Center.' },
    { approvalType: 'Milestone 2 Civil Sign-off', title: 'Electrical & Plumbing Rough-In Inspection', status: 'approved', approvedAt: '2026-10-23', notes: 'Concealed wiring inspected on site.' },
    { approvalType: 'Milestone 3 Factory Dispatch Sign-off', title: 'Modular Flat-Pack On-Site Delivery', status: 'approved', approvedAt: '2026-11-02', notes: 'Package verified intact.' },
    { approvalType: 'Milestone 4 Modular Assembly Sign-off', title: 'Cabinet & Countertop Assembly', status: 'pending', approvedAt: null, notes: 'Scheduled for inspection on 2026-11-12.' }
  ],
  invoices: [
    {
      invoiceNumber: 'INV-2026-08492-1',
      milestone: 'Milestone 1: 3D Design Approval',
      issueDate: '2026-10-15',
      amount: 71200,
      tax: 12816,
      total: 71200,
      status: 'paid',
      paidAt: '2026-10-15',
      paymentMethod: 'HDFC NetBanking (Ref: UPI/628190412)'
    },
    {
      invoiceNumber: 'INV-2026-08492-2',
      milestone: 'Milestone 2: Civil & Electrical Rough-in',
      issueDate: '2026-10-23',
      amount: 142400,
      tax: 25632,
      total: 142400,
      status: 'paid',
      paidAt: '2026-10-23',
      paymentMethod: 'ICICI UPI (Ref: UPI/639102481)'
    },
    {
      invoiceNumber: 'INV-2026-08492-3',
      milestone: 'Milestone 3: Factory Production & Dispatch',
      issueDate: '2026-11-02',
      amount: 284800,
      tax: 51264,
      total: 284800,
      status: 'paid',
      paidAt: '2026-11-02',
      paymentMethod: 'Axis Bank Wire Transfer (Ref: NEFT/AXIS83921)'
    },
    {
      invoiceNumber: 'INV-2026-08492-4',
      milestone: 'Milestone 4: On-site Modular Assembly',
      issueDate: '2026-11-12',
      amount: 106800,
      tax: 19224,
      total: 106800,
      status: 'unpaid',
      paidAt: null,
      paymentMethod: null
    },
    {
      invoiceNumber: 'INV-2026-08492-5',
      milestone: 'Milestone 5: Ceiling, Painting & Lighting',
      issueDate: '2026-11-18',
      amount: 71200,
      tax: 12816,
      total: 71200,
      status: 'upcoming',
      paidAt: null,
      paymentMethod: null
    },
    {
      invoiceNumber: 'INV-2026-08492-6',
      milestone: 'Milestone 6: Handover & Final Snag Sign-off',
      issueDate: '2026-11-22',
      amount: 35600,
      tax: 6408,
      total: 35600,
      status: 'upcoming',
      paidAt: null,
      paymentMethod: null
    }
  ],
  warranty: {
    certificateId: 'WAR-UF-2026-8492',
    years: 10,
    issueDate: 'Pending Handover',
    coverageSummary: '10-Year Comprehensive Structural Warranty against borer, fungus and delamination on all BWP Marine Plywood & Hafele hinges.',
    snagListStatus: 'Pending Final Walkthrough (0 open snags so far)'
  },
  review: {
    rating: 5,
    date: 'In Progress (Preliminary feedback: 5/5)',
    comment: 'Deepika and Venkatesh have been exceptionally responsive. Seeing the 3D renders materialize into our real flat on Day 26 with zero noise disruption is sheer delight!',
    categories: {
      designCreativity: 5,
      executionSpeed: 5,
      materialQuality: 5,
      pmResponsiveness: 5
    }
  }
};

export const interiorReviews = [
  {
    id: 'rev-1',
    author: 'Sunil & Kavita Reddy',
    property: 'Aparna Sarovar Zenith, 3 BHK',
    city: 'Hyderabad',
    rating: 5,
    designer: 'Deepika Rao',
    date: '14 Oct 2026',
    verifiedHomeowner: true,
    photo: '/photos/living-1.jpg',
    comment: 'The 45-day move-in guarantee seemed ambitious, but Deepika delivered on Day 43! The Hafele modular kitchen and magnetic track lighting in our living hall look like a spread from Architectural Digest.',
    criteria: { design: 5, execution: 5, materials: 5, communication: 5 }
  },
  {
    id: 'rev-2',
    author: 'Meera Krishnan',
    property: 'Prestige High Fields, 2 BHK',
    city: 'Hyderabad',
    rating: 5,
    designer: 'Ananya Sharma',
    date: '28 Sep 2026',
    verifiedHomeowner: true,
    photo: '/photos/bedroom-1.jpg',
    comment: 'As working professionals, we had zero time to oversee carpenters. The live photo feed and digital approval system allowed us to approve materials and milestone payments right from our phones.',
    criteria: { design: 5, execution: 5, materials: 5, communication: 5 }
  },
  {
    id: 'rev-3',
    author: 'Kunal & Ritu Singhal',
    property: 'My Home Bhooja, 4 BHK Villa',
    city: 'Hyderabad',
    rating: 5,
    designer: 'Rajesh Varma',
    date: '10 Sep 2026',
    verifiedHomeowner: true,
    photo: '/photos/apartment-1.jpg',
    comment: 'Rajesh handled major civil alterations, granite flooring, and luxury Italian PU finishes. The 10-year warranty certificate gave us complete peace of mind. Highest recommendation.',
    criteria: { design: 5, execution: 4.8, materials: 5, communication: 5 }
  }
];

