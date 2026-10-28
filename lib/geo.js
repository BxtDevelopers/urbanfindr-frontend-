// Accurate geographic coordinate data and resolvers for UrbanFindr Map Search

export const CITY_CENTERS = {
  'Bengaluru': { lat: 12.9716, lng: 77.5946, zoom: 12 },
  'Hyderabad': { lat: 17.3850, lng: 78.4867, zoom: 12 },
  'Mumbai': { lat: 19.0760, lng: 72.8777, zoom: 12 },
  'Pune': { lat: 18.5204, lng: 73.8567, zoom: 12 },
  'Delhi': { lat: 28.6139, lng: 77.2090, zoom: 12 },
  'Gurugram': { lat: 28.4595, lng: 77.0266, zoom: 12 },
  'Chennai': { lat: 13.0827, lng: 80.2707, zoom: 12 },
  'Delhi NCR': { lat: 28.5355, lng: 77.3910, zoom: 11 },
};

export const LOCALITY_COORDINATES = {
  // ── Hyderabad ──
  'Gachibowli': { lat: 17.4401, lng: 78.3489 },
  'Kondapur': { lat: 17.4699, lng: 78.3578 },
  'Kokapet': { lat: 17.4111, lng: 78.3322 },
  'Miyapur': { lat: 17.4968, lng: 78.3614 },
  'Banjara Hills': { lat: 17.4156, lng: 78.4350 },
  'Hitec City': { lat: 17.4435, lng: 78.3772 },
  'Madhapur': { lat: 17.4483, lng: 78.3915 },
  'Jubilee Hills': { lat: 17.4319, lng: 78.4073 },
  'Manikonda': { lat: 17.4018, lng: 78.3844 },
  'Kukatpally': { lat: 17.4849, lng: 78.4138 },
  'Tellapur': { lat: 17.4624, lng: 78.2789 },
  'Nanakramguda': { lat: 17.4184, lng: 78.3475 },
  'Begumpet': { lat: 17.4447, lng: 78.4664 },
  'Secunderabad': { lat: 17.4399, lng: 78.4983 },

  // ── Bengaluru ──
  'Indiranagar': { lat: 12.9784, lng: 77.6408 },
  'Whitefield': { lat: 12.9698, lng: 77.7499 },
  'HSR Layout': { lat: 12.9121, lng: 77.6446 },
  'Sarjapur Road': { lat: 12.9242, lng: 77.6835 },
  'Koramangala': { lat: 12.9352, lng: 77.6245 },
  'Electronic City': { lat: 12.8452, lng: 77.6602 },
  'Bellandur': { lat: 12.9304, lng: 77.6784 },
  'Marathahalli': { lat: 12.9591, lng: 77.6974 },
  'Jayanagar': { lat: 12.9308, lng: 77.5838 },
  'Hebbal': { lat: 13.0358, lng: 77.5970 },
  'Yelahanka': { lat: 13.1007, lng: 77.5963 },
  'Malleshwaram': { lat: 13.0031, lng: 77.5643 },
  'JP Nagar': { lat: 12.9063, lng: 77.5857 },
  'BTM Layout': { lat: 12.9166, lng: 77.6101 },

  // ── Mumbai ──
  'Powai': { lat: 19.1176, lng: 72.9060 },
  'Andheri West': { lat: 19.1363, lng: 72.8277 },
  'Chembur': { lat: 19.0622, lng: 72.8995 },
  'Thane West': { lat: 19.2183, lng: 72.9781 },
  'Bandra': { lat: 19.0596, lng: 72.8295 },
  'Worli': { lat: 19.0178, lng: 72.8178 },
  'Juhu': { lat: 19.0883, lng: 72.8262 },
  'Malad West': { lat: 19.1874, lng: 72.8484 },
  'Goregaon': { lat: 19.1663, lng: 72.8526 },
  'BKC': { lat: 19.0688, lng: 72.8700 },
  'Dadar': { lat: 19.0178, lng: 72.8478 },
  'Lower Parel': { lat: 18.9953, lng: 72.8317 },
  'Vashi': { lat: 19.0771, lng: 72.9986 },

  // ── Pune ──
  'Baner': { lat: 18.5590, lng: 73.7868 },
  'Wakad': { lat: 18.5987, lng: 73.7687 },
  'Kharadi': { lat: 18.5516, lng: 73.9349 },
  'Hinjewadi': { lat: 18.5913, lng: 73.7389 },
  'Viman Nagar': { lat: 18.5679, lng: 73.9143 },
  'Kothrud': { lat: 18.5074, lng: 73.8077 },
  'Aundh': { lat: 18.5580, lng: 73.8075 },
  'Hadapsar': { lat: 18.5089, lng: 73.9260 },
  'Magarpatta': { lat: 18.5135, lng: 73.9312 },
  'Bavdhan': { lat: 18.5158, lng: 73.7819 },
  'Kalyani Nagar': { lat: 18.5463, lng: 73.9034 },
  'Koregaon Park': { lat: 18.5362, lng: 73.8940 },

  // ── Delhi ──
  'South Extension': { lat: 28.5727, lng: 77.2215 },
  'Dwarka': { lat: 28.5921, lng: 77.0460 },
  'Vasant Kunj': { lat: 28.5244, lng: 77.1588 },
  'Hauz Khas': { lat: 28.5494, lng: 77.2001 },
  'Saket': { lat: 28.5245, lng: 77.2066 },
  'Greater Kailash': { lat: 28.5482, lng: 77.2385 },
  'Lajpat Nagar': { lat: 28.5677, lng: 77.2433 },
  'Rohini': { lat: 28.7159, lng: 77.1158 },
  'Connaught Place': { lat: 28.6315, lng: 77.2167 },
  'Chanakyapuri': { lat: 28.5960, lng: 77.1895 },
  'Defence Colony': { lat: 28.5725, lng: 77.2320 },
  'Janakpuri': { lat: 28.6219, lng: 77.0878 },

  // ── Gurugram ──
  'Golf Course Road': { lat: 28.4595, lng: 77.0967 },
  'DLF Phase 5': { lat: 28.4619, lng: 77.1042 },
  'Cyber City': { lat: 28.4950, lng: 77.0895 },
  'Sohna Road': { lat: 28.4232, lng: 77.0396 },
  'Sector 54': { lat: 28.4395, lng: 77.1086 },
  'Golf Course Ext Road': { lat: 28.4092, lng: 77.0789 },
  'Sector 57': { lat: 28.4262, lng: 77.0892 },
  'MG Road': { lat: 28.4811, lng: 77.0864 },
  'Nirvana Country': { lat: 28.4182, lng: 77.0652 },
  'Sushant Lok': { lat: 28.4651, lng: 77.0759 },

  // ── Chennai ──
  'Adyar': { lat: 13.0012, lng: 80.2565 },
  'Velachery': { lat: 12.9815, lng: 80.2180 },
  'OMR': { lat: 12.9168, lng: 80.2285 },
  'Anna Nagar': { lat: 13.0850, lng: 80.2101 },
  'T Nagar': { lat: 13.0418, lng: 80.2341 },
  'Besant Nagar': { lat: 13.0003, lng: 80.2667 },
  'Thiruvanmiyur': { lat: 12.9830, lng: 80.2594 },
  'Guindy': { lat: 13.0067, lng: 80.2025 },
  'Alwarpet': { lat: 13.0336, lng: 80.2519 },
  'Nungambakkam': { lat: 13.0569, lng: 80.2425 },
  'Sholinganallur': { lat: 12.8996, lng: 80.2279 },

  // ── Delhi NCR / Noida ──
  'Noida Sector 150': { lat: 28.4485, lng: 77.4916 },
  'Greater Noida': { lat: 28.4744, lng: 77.5040 },
  'Noida Expressway': { lat: 28.5132, lng: 77.3820 },
  'Indirapuram': { lat: 28.6415, lng: 77.3714 },
  'Faridabad': { lat: 28.4089, lng: 77.3178 },
  'Ghaziabad': { lat: 28.6692, lng: 77.4538 },
  'Sector 62 Noida': { lat: 28.6279, lng: 77.3649 },
};

/**
 * Deterministic hash-based small coordinate jitter so multiple
 * properties in the same locality don't overlap completely.
 */
export function hashOffset(str = '', salt = 0) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const seed = (Math.abs(hash) + salt * 997) % 10000;
  // Offset within ~200 meters (+/- 0.0018 degrees)
  return ((seed / 10000) - 0.5) * 0.0036;
}

/**
 * Resolves accurate {lat, lng} for any property record.
 */
export function getCoordinatesForProperty(prop, fallbackCity = 'Bengaluru', index = 0) {
  if (!prop) {
    const center = CITY_CENTERS[fallbackCity] || CITY_CENTERS['Bengaluru'];
    return { lat: center.lat, lng: center.lng };
  }

  // 1. Explicit property coordinates if already valid numbers
  const pLat = Number(prop.coordinates?.lat);
  const pLng = Number(prop.coordinates?.lng);
  if (pLat && pLng && !isNaN(pLat) && !isNaN(pLng) && pLat !== 0 && pLng !== 0) {
    return { lat: pLat, lng: pLng };
  }

  // 2. Locality coordinate lookup
  const localityKey = prop.locality?.trim();
  const baseLoc = LOCALITY_COORDINATES[localityKey];
  const idStr = String(prop._id || prop.id || index);

  if (baseLoc) {
    return {
      lat: baseLoc.lat + hashOffset(idStr, 1),
      lng: baseLoc.lng + hashOffset(idStr, 2),
    };
  }

  // 3. Fallback to city center with slight spread
  const cityKey = prop.city || fallbackCity || 'Bengaluru';
  const center = CITY_CENTERS[cityKey] || CITY_CENTERS['Bengaluru'];
  return {
    lat: center.lat + hashOffset(idStr, 3),
    lng: center.lng + hashOffset(idStr, 4),
  };
}

export function getCityCenter(city = 'Bengaluru') {
  return CITY_CENTERS[city] || CITY_CENTERS['Bengaluru'];
}

/**
 * Available Tile Provider Sources.
 * Defaults to free CartoDB Voyager and OSM tiles.
 * If user configures NEXT_PUBLIC_MAPBOX_TOKEN or NEXT_PUBLIC_MAPTILER_KEY in .env.local,
 * high-performance commercial vector/raster tiles become available.
 */
export function getTileSources() {
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN?.trim();
  const maptilerKey = process.env.NEXT_PUBLIC_MAPTILER_KEY?.trim();
  const stadiaKey = process.env.NEXT_PUBLIC_STADIA_API_KEY?.trim();

  const sources = {
    voyager: {
      id: 'voyager',
      name: 'Streets (CARTO)',
      url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      attrib: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
      maxZoom: 19,
      subdomains: 'abcd',
    },
    osm: {
      id: 'osm',
      name: 'Standard OSM',
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attrib: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
      subdomains: 'abc',
    },
    satellite: {
      id: 'satellite',
      name: 'Satellite (Esri)',
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attrib: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
      maxZoom: 18,
      subdomains: '',
    },
  };

  if (mapboxToken) {
    sources.mapbox_streets = {
      id: 'mapbox_streets',
      name: 'Mapbox Streets',
      url: `https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/{z}/{x}/{y}?access_token=${mapboxToken}`,
      attrib: '&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 22,
      subdomains: '',
    };
    sources.mapbox_satellite = {
      id: 'mapbox_satellite',
      name: 'Mapbox Satellite',
      url: `https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/tiles/{z}/{x}/{y}?access_token=${mapboxToken}`,
      attrib: '&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 22,
      subdomains: '',
    };
  }

  if (maptilerKey) {
    sources.maptiler = {
      id: 'maptiler',
      name: 'MapTiler Streets',
      url: `https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${maptilerKey}`,
      attrib: '&copy; <a href="https://www.maptiler.com/">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 20,
      subdomains: '',
    };
  }

  if (stadiaKey) {
    sources.stadia = {
      id: 'stadia',
      name: 'Stadia Smooth',
      url: `https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png?api_key=${stadiaKey}`,
      attrib: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>',
      maxZoom: 20,
      subdomains: '',
    };
  }

  return sources;
}

/**
 * Group properties by locality to prevent overlapping pins and enable cluster inspection.
 * - Single property in a locality -> returns { type: 'single', property, lat, lng }
 * - 2+ properties in a locality -> returns { type: 'cluster', locality, count, properties, lat, lng, minPrice, maxPrice, purposes }
 */
export function groupPropertiesByLocality(properties = [], fallbackCity = 'Bengaluru') {
  if (!Array.isArray(properties) || properties.length === 0) return [];

  const groups = new Map();

  properties.forEach((prop, index) => {
    const rawLocality = (prop?.locality || '').trim();
    const city = prop?.city || fallbackCity || 'Bengaluru';
    // Group key by city and locality
    const groupKey = rawLocality ? `${city}::${rawLocality.toLowerCase()}` : `${city}::unspecified_${index}`;

    if (!groups.has(groupKey)) {
      groups.set(groupKey, {
        locality: rawLocality || 'City Center',
        city,
        properties: [],
      });
    }
    groups.get(groupKey).properties.push(prop);
  });

  const clusters = [];

  groups.forEach((group) => {
    const { locality, city, properties: propList } = group;
    const baseCoords = getCoordinatesForProperty(propList[0], city, 0);
    const locCoords = LOCALITY_COORDINATES[locality] || baseCoords;

    const prices = propList.map((p) => Number(p.price) || 0).filter((p) => p > 0);
    const minPrice = prices.length ? Math.min(...prices) : 0;
    const maxPrice = prices.length ? Math.max(...prices) : 0;
    const purposes = Array.from(new Set(propList.map((p) => p.purpose).filter(Boolean)));

    if (propList.length === 1) {
      clusters.push({
        type: 'single',
        id: propList[0]._id || `single_${locality}_0`,
        property: propList[0],
        locality,
        city,
        lat: baseCoords.lat,
        lng: baseCoords.lng,
      });
    } else {
      clusters.push({
        type: 'cluster',
        id: `cluster_${city}_${locality.replace(/\s+/g, '_').toLowerCase()}`,
        locality,
        city,
        count: propList.length,
        properties: propList,
        lat: locCoords.lat,
        lng: locCoords.lng,
        minPrice,
        maxPrice,
        purposes,
      });
    }
  });

  return clusters;
}

