import test, { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  CITY_CENTERS,
  LOCALITY_COORDINATES,
  hashOffset,
  getCoordinatesForProperty,
  getCityCenter,
  getTileSources,
  groupPropertiesByLocality,
} from '../lib/geo.js';

describe('1. Locality coordinate resolution and city center fallbacks', () => {
  it('resolves city centers accurately for all supported cities', () => {
    const expectedCities = [
      'Bengaluru',
      'Hyderabad',
      'Mumbai',
      'Pune',
      'Delhi',
      'Gurugram',
      'Chennai',
      'Delhi NCR',
    ];

    for (const city of expectedCities) {
      const center = getCityCenter(city);
      assert.ok(center, `City center for ${city} should exist`);
      assert.equal(typeof center.lat, 'number', `${city} lat should be number`);
      assert.equal(typeof center.lng, 'number', `${city} lng should be number`);
      assert.ok(center.zoom > 0, `${city} zoom should be greater than 0`);
      assert.deepEqual(center, CITY_CENTERS[city]);
    }
  });

  it('falls back to Bengaluru city center for unknown or empty city input', () => {
    const defaultCenter = CITY_CENTERS['Bengaluru'];
    assert.deepEqual(getCityCenter('UnknownCity'), defaultCenter);
    assert.deepEqual(getCityCenter(''), defaultCenter);
    assert.deepEqual(getCityCenter(null), defaultCenter);
    assert.deepEqual(getCityCenter(undefined), defaultCenter);
  });

  it('returns fallback city center when property object is null or undefined', () => {
    const blrCenter = CITY_CENTERS['Bengaluru'];
    const hydCenter = CITY_CENTERS['Hyderabad'];

    assert.deepEqual(getCoordinatesForProperty(null), { lat: blrCenter.lat, lng: blrCenter.lng });
    assert.deepEqual(getCoordinatesForProperty(undefined, 'Hyderabad'), { lat: hydCenter.lat, lng: hydCenter.lng });
    assert.deepEqual(getCoordinatesForProperty(null, 'NonExistentCity'), { lat: blrCenter.lat, lng: blrCenter.lng });
  });

  it('preserves explicit valid coordinates on property without jitter', () => {
    const propNumeric = {
      _id: 'prop-1',
      coordinates: { lat: 17.4412, lng: 78.3821 },
      locality: 'Gachibowli',
      city: 'Hyderabad',
    };
    const coords1 = getCoordinatesForProperty(propNumeric);
    assert.equal(coords1.lat, 17.4412);
    assert.equal(coords1.lng, 78.3821);

    // String coordinates should be cast to numbers
    const propString = {
      _id: 'prop-2',
      coordinates: { lat: '12.9716', lng: '77.5946' },
    };
    const coords2 = getCoordinatesForProperty(propString);
    assert.equal(coords2.lat, 12.9716);
    assert.equal(coords2.lng, 77.5946);
  });

  it('falls through to locality when coordinates are zero, NaN, or invalid', () => {
    const propZeroCoords = {
      _id: 'prop-zero',
      coordinates: { lat: 0, lng: 0 },
      locality: 'Indiranagar',
      city: 'Bengaluru',
    };
    const coords = getCoordinatesForProperty(propZeroCoords);
    const indiranagarBase = LOCALITY_COORDINATES['Indiranagar'];

    // Should resolve near Indiranagar, NOT (0,0)
    assert.ok(Math.abs(coords.lat - indiranagarBase.lat) < 0.005);
    assert.ok(Math.abs(coords.lng - indiranagarBase.lng) < 0.005);

    const propNaNCoords = {
      _id: 'prop-nan',
      coordinates: { lat: 'invalid', lng: 'coords' },
      locality: 'Koramangala',
      city: 'Bengaluru',
    };
    const coordsNaN = getCoordinatesForProperty(propNaNCoords);
    const koramangalaBase = LOCALITY_COORDINATES['Koramangala'];
    assert.ok(Math.abs(coordsNaN.lat - koramangalaBase.lat) < 0.005);
    assert.ok(Math.abs(coordsNaN.lng - koramangalaBase.lng) < 0.005);
  });

  it('resolves coordinates based on known locality with small jitter', () => {
    const sampleLocalities = ['Whitefield', 'Gachibowli', 'Powai', 'Baner', 'Hauz Khas', 'Adyar'];

    for (const loc of sampleLocalities) {
      const base = LOCALITY_COORDINATES[loc];
      assert.ok(base, `Locality ${loc} must exist in LOCALITY_COORDINATES`);

      const prop = { _id: `id-${loc}`, locality: loc };
      const resolved = getCoordinatesForProperty(prop);

      // Should be very close to the base locality coordinates (within ~200m or 0.0018 degrees)
      assert.ok(Math.abs(resolved.lat - base.lat) <= 0.0018 + 1e-9, `${loc} lat within jitter`);
      assert.ok(Math.abs(resolved.lng - base.lng) <= 0.0018 + 1e-9, `${loc} lng within jitter`);
    }
  });

  it('trims whitespace on locality name before lookup', () => {
    const base = LOCALITY_COORDINATES['Indiranagar'];
    const prop = { _id: 'trimmed-prop', locality: '   Indiranagar   ' };
    const resolved = getCoordinatesForProperty(prop);

    assert.ok(Math.abs(resolved.lat - base.lat) <= 0.0018 + 1e-9);
    assert.ok(Math.abs(resolved.lng - base.lng) <= 0.0018 + 1e-9);
  });

  it('falls back to city center with jitter when locality is unknown', () => {
    const hydCenter = CITY_CENTERS['Hyderabad'];
    const prop = { _id: 'unknown-loc-prop', locality: 'NonExistentLocality123', city: 'Hyderabad' };
    const resolved = getCoordinatesForProperty(prop);

    assert.ok(Math.abs(resolved.lat - hydCenter.lat) <= 0.0018 + 1e-9);
    assert.ok(Math.abs(resolved.lng - hydCenter.lng) <= 0.0018 + 1e-9);
  });

  it('falls back to Bengaluru city center when neither locality nor valid city is provided', () => {
    const blrCenter = CITY_CENTERS['Bengaluru'];
    const prop = { _id: 'no-loc-no-city' };
    const resolved = getCoordinatesForProperty(prop);

    assert.ok(Math.abs(resolved.lat - blrCenter.lat) <= 0.0018 + 1e-9);
    assert.ok(Math.abs(resolved.lng - blrCenter.lng) <= 0.0018 + 1e-9);
  });
});

describe('2. Coordinate jitter determinism', () => {
  it('produces identical offset for identical input and salt across calls', () => {
    const val1 = hashOffset('prop-12345', 1);
    const val2 = hashOffset('prop-12345', 1);
    const val3 = hashOffset('prop-12345', 1);

    assert.equal(val1, val2);
    assert.equal(val2, val3);
  });

  it('produces values strictly bounded within +/- 0.0018 degrees (~200 meters)', () => {
    const testIds = ['1', 'abc', 'random_id_999', 'property-uuid-v4', 'another-long-string-identifier'];
    for (const id of testIds) {
      for (let salt = 0; salt < 10; salt++) {
        const offset = hashOffset(id, salt);
        assert.ok(offset >= -0.0018, `Offset ${offset} should be >= -0.0018`);
        assert.ok(offset <= 0.0018, `Offset ${offset} should be <= 0.0018`);
      }
    }
  });

  it('produces distinct offsets for different salts or different IDs', () => {
    const offsetSalt1 = hashOffset('property-a', 1);
    const offsetSalt2 = hashOffset('property-a', 2);
    assert.notEqual(offsetSalt1, offsetSalt2, 'Different salts should produce different offsets');

    const offsetPropA = hashOffset('property-a', 1);
    const offsetPropB = hashOffset('property-b', 1);
    assert.notEqual(offsetPropA, offsetPropB, 'Different string IDs should produce different offsets');
  });

  it('handles empty string and default arguments without error', () => {
    const offsetEmpty = hashOffset('');
    assert.equal(typeof offsetEmpty, 'number');
    assert.ok(!isNaN(offsetEmpty));

    const offsetNoArgs = hashOffset();
    assert.equal(typeof offsetNoArgs, 'number');
    assert.ok(!isNaN(offsetNoArgs));
  });

  it('ensures getCoordinatesForProperty is fully deterministic for repeated calls', () => {
    const prop = { _id: 'prop-det-1', locality: 'Koramangala', city: 'Bengaluru' };
    const firstCall = getCoordinatesForProperty(prop);
    const secondCall = getCoordinatesForProperty(prop);

    assert.deepEqual(firstCall, secondCall);
  });

  it('spreads multiple properties in the same locality so they do not overlap identically', () => {
    const prop1 = { _id: 'prop-alpha', locality: 'Koramangala', city: 'Bengaluru' };
    const prop2 = { _id: 'prop-beta', locality: 'Koramangala', city: 'Bengaluru' };

    const coords1 = getCoordinatesForProperty(prop1);
    const coords2 = getCoordinatesForProperty(prop2);

    assert.ok(coords1.lat !== coords2.lat || coords1.lng !== coords2.lng, 'Coordinates should not overlap completely');
  });
});

describe('3. Property clustering / locality grouping', () => {
  it('clusters 2 or more properties with the same locality together', () => {
    const properties = [
      { _id: 'p1', locality: 'Indiranagar', city: 'Bengaluru', price: 12000000, purpose: 'buy' },
      { _id: 'p2', locality: 'Indiranagar', city: 'Bengaluru', price: 8500000, purpose: 'buy' },
      { _id: 'p3', locality: 'Indiranagar', city: 'Bengaluru', price: 45000, purpose: 'rent' },
    ];

    const result = groupPropertiesByLocality(properties, 'Bengaluru');
    assert.equal(result.length, 1);

    const cluster = result[0];
    assert.equal(cluster.type, 'cluster');
    assert.equal(cluster.locality, 'Indiranagar');
    assert.equal(cluster.city, 'Bengaluru');
    assert.equal(cluster.count, 3);
    assert.ok(cluster.count >= 2);
    assert.deepEqual(cluster.properties, properties);
    assert.equal(cluster.minPrice, 45000);
    assert.equal(cluster.maxPrice, 12000000);
    assert.deepEqual(cluster.purposes.sort(), ['buy', 'rent']);
    assert.equal(cluster.lat, LOCALITY_COORDINATES['Indiranagar'].lat);
    assert.equal(cluster.lng, LOCALITY_COORDINATES['Indiranagar'].lng);
  });

  it('returns single items when only 1 property exists in a locality', () => {
    const properties = [
      { _id: 'p1', locality: 'Indiranagar', city: 'Bengaluru', price: 10000000 },
      { _id: 'p2', locality: 'Whitefield', city: 'Bengaluru', price: 7500000 },
    ];

    const result = groupPropertiesByLocality(properties, 'Bengaluru');
    assert.equal(result.length, 2);

    for (const item of result) {
      assert.equal(item.type, 'single');
      assert.ok(item.property);
      assert.ok(item.lat);
      assert.ok(item.lng);
    }

    assert.equal(result[0].locality, 'Indiranagar');
    assert.equal(result[0].property._id, 'p1');
    assert.equal(result[1].locality, 'Whitefield');
    assert.equal(result[1].property._id, 'p2');
  });

  it('handles mixed clusters and single properties in the same dataset', () => {
    const properties = [
      { _id: 'p1', locality: 'HSR Layout', city: 'Bengaluru', price: 5000000 },
      { _id: 'p2', locality: 'HSR Layout', city: 'Bengaluru', price: 6000000 },
      { _id: 'p3', locality: 'Bellandur', city: 'Bengaluru', price: 4000000 },
    ];

    const result = groupPropertiesByLocality(properties, 'Bengaluru');
    assert.equal(result.length, 2);

    const hsrCluster = result.find((r) => r.locality === 'HSR Layout');
    assert.ok(hsrCluster);
    assert.equal(hsrCluster.type, 'cluster');
    assert.equal(hsrCluster.count, 2);
    assert.equal(hsrCluster.minPrice, 5000000);
    assert.equal(hsrCluster.maxPrice, 6000000);

    const bellandurSingle = result.find((r) => r.locality === 'Bellandur');
    assert.ok(bellandurSingle);
    assert.equal(bellandurSingle.type, 'single');
    assert.equal(bellandurSingle.property._id, 'p3');
  });

  it('handles empty properties list or non-array inputs gracefully', () => {
    assert.deepEqual(groupPropertiesByLocality([]), []);
    assert.deepEqual(groupPropertiesByLocality(null), []);
    assert.deepEqual(groupPropertiesByLocality(undefined), []);
    assert.deepEqual(groupPropertiesByLocality('invalid-data'), []);
    assert.deepEqual(groupPropertiesByLocality({}), []);
  });

  it('handles missing or empty locality by treating them as distinct items', () => {
    const properties = [
      { _id: 'unspec-1', price: 30000 },
      { _id: 'unspec-2', locality: '', price: 40000 },
      { _id: 'unspec-3', locality: '   ', price: 50000 },
    ];

    const result = groupPropertiesByLocality(properties, 'Bengaluru');
    // Each unspecified locality must remain a separate single item rather than falsely grouping
    assert.equal(result.length, 3);
    for (const item of result) {
      assert.equal(item.type, 'single');
      assert.equal(item.locality, 'City Center');
    }
  });

  it('handles missing, zero, or non-numeric prices correctly', () => {
    const properties = [
      { _id: 'p1', locality: 'Indiranagar', city: 'Bengaluru', price: null },
      { _id: 'p2', locality: 'Indiranagar', city: 'Bengaluru', price: 0 },
      { _id: 'p3', locality: 'Indiranagar', city: 'Bengaluru', price: 'invalid' },
      { _id: 'p4', locality: 'Indiranagar', city: 'Bengaluru', price: 50000 },
      { _id: 'p5', locality: 'Indiranagar', city: 'Bengaluru', price: 80000 },
    ];

    const result = groupPropertiesByLocality(properties, 'Bengaluru');
    assert.equal(result.length, 1);
    const cluster = result[0];
    assert.equal(cluster.minPrice, 50000);
    assert.equal(cluster.maxPrice, 80000);

    // If all prices are missing or 0:
    const propertiesZeroPrice = [
      { _id: 'p-a', locality: 'Whitefield', price: 0 },
      { _id: 'p-b', locality: 'Whitefield', price: null },
    ];
    const resultZero = groupPropertiesByLocality(propertiesZeroPrice, 'Bengaluru');
    assert.equal(resultZero[0].minPrice, 0);
    assert.equal(resultZero[0].maxPrice, 0);
  });

  it('groups case-insensitively while preserving trimmed locality key', () => {
    const properties = [
      { _id: 'p1', locality: 'Whitefield', city: 'Bengaluru' },
      { _id: 'p2', locality: 'whitefield', city: 'Bengaluru' },
      { _id: 'p3', locality: '  WHITEFIELD  ', city: 'Bengaluru' },
    ];

    const result = groupPropertiesByLocality(properties, 'Bengaluru');
    assert.equal(result.length, 1);
    assert.equal(result[0].type, 'cluster');
    assert.equal(result[0].count, 3);
  });

  it('separates properties in different cities even if locality name is identical', () => {
    const properties = [
      { _id: 'p1', locality: 'Main Road', city: 'Bengaluru' },
      { _id: 'p2', locality: 'Main Road', city: 'Hyderabad' },
    ];

    const result = groupPropertiesByLocality(properties);
    assert.equal(result.length, 2);
    assert.equal(result[0].city, 'Bengaluru');
    assert.equal(result[1].city, 'Hyderabad');
  });
});

describe('4. Tile source resolution with and without env tokens', () => {
  const originalMapbox = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const originalMaptiler = process.env.NEXT_PUBLIC_MAPTILER_KEY;
  const originalStadia = process.env.NEXT_PUBLIC_STADIA_API_KEY;
  const originalCarto = process.env.NEXT_PUBLIC_CARTO_KEY;

  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    delete process.env.NEXT_PUBLIC_MAPTILER_KEY;
    delete process.env.NEXT_PUBLIC_STADIA_API_KEY;
    delete process.env.NEXT_PUBLIC_CARTO_KEY;
  });

  afterEach(() => {
    if (originalMapbox !== undefined) {
      process.env.NEXT_PUBLIC_MAPBOX_TOKEN = originalMapbox;
    } else {
      delete process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    }

    if (originalMaptiler !== undefined) {
      process.env.NEXT_PUBLIC_MAPTILER_KEY = originalMaptiler;
    } else {
      delete process.env.NEXT_PUBLIC_MAPTILER_KEY;
    }

    if (originalStadia !== undefined) {
      process.env.NEXT_PUBLIC_STADIA_API_KEY = originalStadia;
    } else {
      delete process.env.NEXT_PUBLIC_STADIA_API_KEY;
    }

    if (originalCarto !== undefined) {
      process.env.NEXT_PUBLIC_CARTO_KEY = originalCarto;
    } else {
      delete process.env.NEXT_PUBLIC_CARTO_KEY;
    }
  });

  it('returns default base tile sources (voyager, osm, satellite) when no env tokens are set', () => {
    const sources = getTileSources();

    assert.ok(sources.voyager, 'voyager source should exist');
    assert.ok(sources.osm, 'osm source should exist');
    assert.ok(sources.satellite, 'satellite source should exist');

    assert.ok(sources.voyager.url.includes('cartocdn.com'));
    assert.ok(sources.osm.url.includes('tile.openstreetmap.org'));
    assert.ok(sources.satellite.url.includes('arcgisonline.com'));

    assert.equal(sources.mapbox_streets, undefined);
    assert.equal(sources.mapbox_satellite, undefined);
    assert.equal(sources.maptiler, undefined);
    assert.equal(sources.stadia, undefined);
  });

  it('includes Mapbox sources when NEXT_PUBLIC_MAPBOX_TOKEN is configured', () => {
    process.env.NEXT_PUBLIC_MAPBOX_TOKEN = 'pk.test_mapbox_secret_token';
    const sources = getTileSources();

    assert.ok(sources.mapbox_streets, 'mapbox_streets should be present');
    assert.ok(sources.mapbox_satellite, 'mapbox_satellite should be present');

    assert.ok(
      sources.mapbox_streets.url.includes('access_token=pk.test_mapbox_secret_token'),
      'mapbox_streets url should contain access token'
    );
    assert.ok(
      sources.mapbox_satellite.url.includes('access_token=pk.test_mapbox_secret_token'),
      'mapbox_satellite url should contain access token'
    );
    assert.equal(sources.mapbox_streets.maxZoom, 22);
  });

  it('includes MapTiler source when NEXT_PUBLIC_MAPTILER_KEY is configured', () => {
    process.env.NEXT_PUBLIC_MAPTILER_KEY = 'maptiler_test_key_123';
    const sources = getTileSources();

    assert.ok(sources.maptiler, 'maptiler source should be present');
    assert.ok(
      sources.maptiler.url.includes('key=maptiler_test_key_123'),
      'maptiler url should contain key'
    );
    assert.equal(sources.maptiler.maxZoom, 20);
  });

  it('includes Stadia source when NEXT_PUBLIC_STADIA_API_KEY is configured', () => {
    process.env.NEXT_PUBLIC_STADIA_API_KEY = 'stadia_test_key_456';
    const sources = getTileSources();

    assert.ok(sources.stadia, 'stadia source should be present');
    assert.ok(
      sources.stadia.url.includes('api_key=stadia_test_key_456'),
      'stadia url should contain api key'
    );
    assert.equal(sources.stadia.maxZoom, 20);
  });

  it('appends key to CARTO Voyager URL when NEXT_PUBLIC_CARTO_KEY is configured', () => {
    process.env.NEXT_PUBLIC_CARTO_KEY = 'carto_test_key_789';
    const sources = getTileSources();

    assert.ok(sources.voyager.url.includes('key=carto_test_key_789'), 'voyager url should contain key parameter');
    delete process.env.NEXT_PUBLIC_CARTO_KEY;
  });

  it('includes both Mapbox and MapTiler sources when both tokens are configured', () => {
    process.env.NEXT_PUBLIC_MAPBOX_TOKEN = 'pk.test_mapbox_both';
    process.env.NEXT_PUBLIC_MAPTILER_KEY = 'maptiler_test_both';
    const sources = getTileSources();

    assert.ok(sources.voyager);
    assert.ok(sources.osm);
    assert.ok(sources.satellite);
    assert.ok(sources.mapbox_streets);
    assert.ok(sources.mapbox_satellite);
    assert.ok(sources.maptiler);
  });

  it('ignores empty or whitespace-only env tokens', () => {
    process.env.NEXT_PUBLIC_MAPBOX_TOKEN = '   ';
    process.env.NEXT_PUBLIC_MAPTILER_KEY = '';
    const sources = getTileSources();

    assert.equal(sources.mapbox_streets, undefined);
    assert.equal(sources.mapbox_satellite, undefined);
    assert.equal(sources.maptiler, undefined);
  });
});
