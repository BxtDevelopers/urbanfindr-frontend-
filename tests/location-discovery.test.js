import test, { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateDistance,
  formatDistance,
  getDistanceTier,
  findNearestCity,
  rankPropertiesByLocation,
  getCoordinatesForProperty,
  CITY_CENTERS,
  LOCALITY_COORDINATES
} from '../lib/geo.js';

describe('Location-Based Property Discovery & Prioritization System', () => {
  describe('1. Geographic Haversine Distance Calculation & Formatting', () => {
    it('calculates exact distance between two known points accurately using Haversine', () => {
      // Gachibowli (17.4401, 78.3489) to Hitec City (17.4435, 78.3772) in Hyderabad
      const dist = calculateDistance(17.4401, 78.3489, 17.4435, 78.3772);
      assert.ok(dist !== null);
      // Distance is approximately 3.0 km
      assert.ok(dist >= 2.9 && dist <= 3.2, `Expected ~3.0 km, got ${dist}`);
    });

    it('calculates long distance across cities accurately', () => {
      // Hyderabad center to Bengaluru center is approx ~500 km
      const hyd = CITY_CENTERS['Hyderabad'];
      const blr = CITY_CENTERS['Bengaluru'];
      const dist = calculateDistance(hyd.lat, hyd.lng, blr.lat, blr.lng);
      assert.ok(dist >= 490 && dist <= 515, `Expected ~500 km, got ${dist}`);
    });

    it('handles identical points with zero distance', () => {
      const dist = calculateDistance(12.9716, 77.5946, 12.9716, 77.5946);
      assert.equal(dist, 0);
    });

    it('handles invalid or null coordinates gracefully without crashing', () => {
      assert.equal(calculateDistance(null, 77.5, 12.9, 77.6), null);
      assert.equal(calculateDistance(12.9, null, 12.9, 77.6), null);
      assert.equal(calculateDistance(12.9, 77.5, undefined, 77.6), null);
      assert.equal(calculateDistance(NaN, 77.5, 12.9, 77.6), null);
      assert.equal(calculateDistance('not-a-number', 77.5, 12.9, 77.6), null);
    });

    it('formats distances cleanly for property cards', () => {
      assert.equal(formatDistance(0.05), 'Within 100 m');
      assert.equal(formatDistance(0.45), '450 m away');
      assert.equal(formatDistance(1.23), '1.2 km away');
      assert.equal(formatDistance(3.54), '3.5 km away');
      assert.equal(formatDistance(8.0), '8.0 km away');
      assert.equal(formatDistance(24.6), '25 km away');
      assert.equal(formatDistance(null), '');
      assert.equal(formatDistance(undefined), '');
    });

    it('categorizes distances into the 5 standard prioritization tiers', () => {
      // Tier 1: 0–5 km
      assert.equal(getDistanceTier(0), 1);
      assert.equal(getDistanceTier(2.5), 1);
      assert.equal(getDistanceTier(5.0), 1);

      // Tier 2: 5–10 km
      assert.equal(getDistanceTier(5.1), 2);
      assert.equal(getDistanceTier(10.0), 2);

      // Tier 3: 10–20 km
      assert.equal(getDistanceTier(10.1), 3);
      assert.equal(getDistanceTier(20.0), 3);

      // Tier 4: 20–50 km
      assert.equal(getDistanceTier(20.1), 4);
      assert.equal(getDistanceTier(50.0), 4);

      // Tier 5: > 50 km
      assert.equal(getDistanceTier(50.1), 5);
      assert.equal(getDistanceTier(500), 5);

      // Missing
      assert.equal(getDistanceTier(null), 999);
    });

    it('identifies nearest metro city correctly', () => {
      // Coordinates near Jubilee Hills, Hyderabad
      const nearestHyd = findNearestCity(17.43, 78.40);
      assert.equal(nearestHyd?.name, 'Hyderabad');
      assert.ok(nearestHyd.distanceKm < 15);

      // Coordinates near Indiranagar, Bengaluru
      const nearestBlr = findNearestCity(12.97, 77.64);
      assert.equal(nearestBlr?.name, 'Bengaluru');
      assert.ok(nearestBlr.distanceKm < 15);
    });
  });

  describe('2. Property Ranking & Distance Prioritization', () => {
    const mockProperties = [
      {
        _id: 'p-hyd-gachi',
        title: 'Gachibowli Flat',
        locality: 'Gachibowli',
        city: 'Hyderabad',
        coordinates: { lat: 17.4401, lng: 78.3489 },
        featured: false,
        verified: true,
        price: 35000,
        purpose: 'rent',
      },
      {
        _id: 'p-hyd-hitec',
        title: 'Hitec City Luxury Home',
        locality: 'Hitec City',
        city: 'Hyderabad',
        coordinates: { lat: 17.4435, lng: 78.3772 },
        featured: true,
        verified: true,
        price: 65000,
        purpose: 'rent',
      },
      {
        _id: 'p-hyd-jubilee',
        title: 'Jubilee Hills Villa',
        locality: 'Jubilee Hills',
        city: 'Hyderabad',
        coordinates: { lat: 17.4319, lng: 78.4073 },
        featured: false,
        verified: false,
        price: 15000000,
        purpose: 'buy',
      },
      {
        _id: 'p-blr-indira',
        title: 'Indiranagar Residence',
        locality: 'Indiranagar',
        city: 'Bengaluru',
        coordinates: { lat: 12.9784, lng: 77.6408 },
        featured: true,
        verified: true,
        price: 45000,
        purpose: 'rent',
      },
      {
        _id: 'p-no-coords',
        title: 'Unmapped Listing',
        locality: 'Remote Area',
        city: 'Unknown City',
        coordinates: { lat: null, lng: null },
        featured: true,
        verified: true,
        price: 20000,
        purpose: 'rent',
      },
    ];

    it('sorts properties by actual ascending distance in Nearest to me mode', () => {
      // User is located in Gachibowli (17.4401, 78.3489)
      const userLat = 17.4401;
      const userLng = 78.3489;

      const ranked = rankPropertiesByLocation(mockProperties, userLat, userLng, { mode: 'nearest' });

      // First property must be Gachibowli (0 km)
      assert.equal(ranked[0]._id, 'p-hyd-gachi');
      assert.equal(ranked[0].distanceKm, 0);
      assert.equal(ranked[0].distanceText, 'Within 100 m');

      // Second property must be Hitec City (~3.0 km)
      assert.equal(ranked[1]._id, 'p-hyd-hitec');
      assert.ok(ranked[1].distanceKm < 4);

      // Third property must be Jubilee Hills (~6.2 km)
      assert.equal(ranked[2]._id, 'p-hyd-jubilee');
      assert.ok(ranked[2].distanceKm < 10);

      // Fourth property must be Indiranagar (~500 km away)
      assert.equal(ranked[3]._id, 'p-blr-indira');
      assert.ok(ranked[3].distanceKm > 400);

      // Distances must be strictly non-decreasing
      for (let i = 0; i < 3; i++) {
        assert.ok(ranked[i].distanceKm <= ranked[i + 1].distanceKm);
      }
    });

    it('ensures paid featured status does NOT override location relevance in Nearest to me mode', () => {
      // p-hyd-gachi is NOT featured, but is 0 km away.
      // p-blr-indira IS featured, but is 500 km away.
      const ranked = rankPropertiesByLocation(mockProperties, 17.4401, 78.3489, { mode: 'nearest' });

      const gachiIndex = ranked.findIndex(p => p._id === 'p-hyd-gachi');
      const indiraIndex = ranked.findIndex(p => p._id === 'p-blr-indira');

      assert.ok(gachiIndex < indiraIndex, 'Closer non-featured property must appear before farther featured property');
    });

    it('safely places properties with missing coordinates after properties with valid calculations', () => {
      const ranked = rankPropertiesByLocation(mockProperties, 17.4401, 78.3489, { mode: 'nearest' });

      // The property with missing coordinates must be kept visible and placed at the end
      const lastProp = ranked[ranked.length - 1];
      assert.equal(lastProp._id, 'p-no-coords');
      assert.equal(lastProp.distanceKm, null);
      assert.equal(lastProp.distanceText, '');

      // All properties must remain in the returned list
      assert.equal(ranked.length, mockProperties.length);
    });

    it('uses balanced ranking in Recommended mode with proximity tiers', () => {
      const userLat = 17.4401;
      const userLng = 78.3489;

      const ranked = rankPropertiesByLocation(mockProperties, userLat, userLng, { mode: 'recommended' });

      // In Hyderabad, local properties (Tier 1/2) must rank significantly higher than Bengaluru (Tier 5)
      const top3Ids = ranked.slice(0, 3).map(p => p._id);
      assert.ok(top3Ids.includes('p-hyd-gachi'));
      assert.ok(top3Ids.includes('p-hyd-hitec'));

      const indiraIndex = ranked.findIndex(p => p._id === 'p-blr-indira');
      assert.ok(indiraIndex >= 2, 'Faraway property must rank lower than nearby properties');
    });

    it('attaches distanceKm and distanceText to properties when passthrough sort is used', () => {
      const ranked = rankPropertiesByLocation(mockProperties, 17.4401, 78.3489, { mode: 'price-asc' });

      // All properties receive distance calculation without re-sorting
      for (const p of ranked) {
        if (p._id !== 'p-no-coords') {
          assert.ok(typeof p.distanceKm === 'number');
          assert.ok(typeof p.distanceText === 'string');
          assert.ok(p.distanceText.length > 0);
        }
      }
    });

    it('handles empty properties list or null coordinates without throwing', () => {
      assert.deepEqual(rankPropertiesByLocation([], 17.44, 78.34), []);
      assert.equal(rankPropertiesByLocation(mockProperties, null, null).length, mockProperties.length);
      assert.equal(rankPropertiesByLocation(mockProperties, undefined, undefined).length, mockProperties.length);
    });
  });

  describe('3. Coordinate Resolution Fallbacks & Default Jitter Strategy', () => {
    it('resolves coordinates using known locality when explicit coordinates are absent', () => {
      const prop = {
        _id: 'test-p-1',
        title: 'Apartment in Indiranagar',
        city: 'Bengaluru',
        locality: 'Indiranagar',
      };
      const coords = getCoordinatesForProperty(prop);
      assert.ok(coords.lat && coords.lng);
      // Indiranagar base lat is 12.9784, lng is 77.6408
      assert.ok(Math.abs(coords.lat - 12.9784) < 0.05);
      assert.ok(Math.abs(coords.lng - 77.6408) < 0.05);
    });

    it('does not incorrectly assign default Bengaluru coordinates to Mumbai/Delhi properties', () => {
      const mumbaiProp = {
        _id: 'mumbai-sample-1',
        title: 'Mumbai Sea View',
        city: 'Mumbai',
        locality: 'Juhu',
        coordinates: { lat: 12.9716, lng: 77.5946 }, // Default schema coords
      };
      const coords = getCoordinatesForProperty(mumbaiProp, 'Mumbai');
      // Should resolve to Juhu, Mumbai (~19.088, ~72.826) instead of Bengaluru (12.9716)
      assert.ok(coords.lat > 18.5 && coords.lat < 19.5, `Expected Mumbai lat ~19, got ${coords.lat}`);
      assert.ok(coords.lng > 72.5 && coords.lng < 73.5, `Expected Mumbai lng ~72, got ${coords.lng}`);
    });
  });

  describe('4. Filter Combinations with Location Prioritization & Search Non-Conflict', () => {
    const multiCityProps = [
      {
        _id: 'hyd-1',
        title: '2 BHK in Gachibowli',
        city: 'Hyderabad',
        locality: 'Gachibowli',
        purpose: 'rent',
        type: 'Apartment',
        bedrooms: 2,
        price: 30000,
        coordinates: { lat: 17.4401, lng: 78.3489 }
      },
      {
        _id: 'hyd-2',
        title: '3 BHK in Hitec City',
        city: 'Hyderabad',
        locality: 'Hitec City',
        purpose: 'buy',
        type: 'Apartment',
        bedrooms: 3,
        price: 9500000,
        coordinates: { lat: 17.4435, lng: 78.3772 }
      },
      {
        _id: 'blr-1',
        title: '2 BHK in Indiranagar',
        city: 'Bengaluru',
        locality: 'Indiranagar',
        purpose: 'rent',
        type: 'Apartment',
        bedrooms: 2,
        price: 45000,
        coordinates: { lat: 12.9784, lng: 77.6408 }
      },
      {
        _id: 'blr-2',
        title: '3 BHK in Whitefield',
        city: 'Bengaluru',
        locality: 'Whitefield',
        purpose: 'buy',
        type: 'Villa',
        bedrooms: 3,
        price: 18000000,
        coordinates: { lat: 12.9698, lng: 77.7499 }
      }
    ];

    it('respects manual city selection when user GPS is in a different city', () => {
      // User is physically in Hyderabad
      const userLat = 17.4401;
      const userLng = 78.3489;

      // User manually searches for Bengaluru
      const filteredByCity = multiCityProps.filter(p => p.city.toLowerCase() === 'bengaluru');
      const ranked = rankPropertiesByLocation(filteredByCity, userLat, userLng, { mode: 'nearest' });

      // All returned properties MUST be from Bengaluru, respecting explicit selection
      assert.equal(ranked.length, 2);
      assert.ok(ranked.every(p => p.city === 'Bengaluru'));
      // Distances must reflect the real physical distance (~500 km away)
      assert.ok(ranked[0].distanceKm > 400);
      assert.ok(ranked[1].distanceKm > 400);
    });

    it('combines Buy/Rent filter with location prioritization', () => {
      const userLat = 17.4401;
      const userLng = 78.3489;

      // User filters for Rent listings only
      const rentalOnly = multiCityProps.filter(p => p.purpose === 'rent');
      const ranked = rankPropertiesByLocation(rentalOnly, userLat, userLng, { mode: 'nearest' });

      assert.equal(ranked.length, 2);
      assert.ok(ranked.every(p => p.purpose === 'rent'));
      // The nearest rental (Gachibowli) must appear first
      assert.equal(ranked[0]._id, 'hyd-1');
      assert.equal(ranked[0].distanceKm, 0);
      // Farther rental (Indiranagar) appears after
      assert.equal(ranked[1]._id, 'blr-1');
      assert.ok(ranked[1].distanceKm > 400);
    });

    it('combines price and bedroom filters with location ranking', () => {
      const userLat = 17.4401;
      const userLng = 78.3489;

      // Filter: 3 BHK properties
      const threeBhk = multiCityProps.filter(p => p.bedrooms === 3);
      const ranked = rankPropertiesByLocation(threeBhk, userLat, userLng, { mode: 'nearest' });

      assert.equal(ranked.length, 2);
      assert.ok(ranked.every(p => p.bedrooms === 3));
      // Nearest 3 BHK (Hitec City, Hyd) must appear before Whitefield, Blr
      assert.equal(ranked[0]._id, 'hyd-2');
      assert.equal(ranked[1]._id, 'blr-2');
    });
  });
});
