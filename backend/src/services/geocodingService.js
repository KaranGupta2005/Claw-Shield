import logger from '../core/logger.js';

/**
 * Geocoding Service - Infrastructure layer for location enrichment
 * 
 * Transforms coordinates into semantic place types using OpenStreetMap Nominatim
 * (free, no API key required)
 * 
 * Returns probabilistic location distributions, not deterministic labels
 */

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';
const USER_AGENT = 'ClawShield/1.0';

// Cache to avoid repeated API calls
const geocodeCache = new Map();
const CACHE_TTL = 3600000; // 1 hour

/**
 * Reverse geocode coordinates to semantic place type
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<Object>} Probabilistic location distribution
 */
export async function reverseGeocode(lat, lng) {
  // Validate coordinates
  if (!lat || !lng || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    logger.warn('🌍 Invalid coordinates provided', { lat, lng });
    return getDefaultLocationDistribution();
  }

  // Check cache
  const cacheKey = `${lat.toFixed(3)},${lng.toFixed(3)}`;
  const cached = geocodeCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    logger.debug('🌍 Using cached geocoding result', { cacheKey });
    return cached.data;
  }

  try {
    logger.info('🌍 Reverse geocoding coordinates', { lat, lng });

    const url = `${NOMINATIM_BASE_URL}/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
      },
    });

    if (!response.ok) {
      throw new Error(`Geocoding API returned ${response.status}`);
    }

    const data = await response.json();
    
    // Extract semantic meaning from response
    const locationDistribution = extractSemanticLocation(data);

    // Cache result
    geocodeCache.set(cacheKey, {
      data: locationDistribution,
      timestamp: Date.now(),
    });

    logger.info('🌍 Geocoding successful', {
      lat,
      lng,
      primaryType: locationDistribution.primary,
    });

    return locationDistribution;
  } catch (error) {
    logger.error('🌍 Geocoding failed, using fallback', {
      error: error.message,
      lat,
      lng,
    });
    return getDefaultLocationDistribution();
  }
}

/**
 * Extract semantic meaning from Nominatim response
 * @private
 */
function extractSemanticLocation(data) {
  const { address, type, category } = data;
  
  // Build probabilistic distribution based on OSM tags
  const distribution = {
    library: 0.0,
    cafe: 0.0,
    office: 0.0,
    home: 0.0,
    transit: 0.0,
    outdoor: 0.0,
    commercial: 0.0,
    educational: 0.0,
  };

  // Analyze OSM category and type
  if (category === 'amenity') {
    if (type === 'library') distribution.library = 0.9;
    else if (type === 'cafe' || type === 'restaurant') distribution.cafe = 0.8;
    else if (type === 'university' || type === 'school') distribution.educational = 0.9;
  }

  if (category === 'building') {
    if (type === 'office' || type === 'commercial') distribution.office = 0.7;
    else if (type === 'residential' || type === 'house') distribution.home = 0.8;
    else if (type === 'university') distribution.educational = 0.8;
  }

  if (category === 'highway' || category === 'railway') {
    distribution.transit = 0.7;
  }

  if (category === 'leisure' || category === 'natural') {
    distribution.outdoor = 0.8;
  }

  // Analyze address components
  if (address) {
    if (address.amenity) {
      if (address.amenity.includes('library')) distribution.library += 0.3;
      if (address.amenity.includes('cafe')) distribution.cafe += 0.3;
    }
    
    if (address.shop || address.retail) {
      distribution.commercial += 0.4;
    }

    if (address.house_number || address.residential) {
      distribution.home += 0.3;
    }
  }

  // Normalize to ensure probabilities sum to reasonable values
  const total = Object.values(distribution).reduce((sum, val) => sum + val, 0);
  if (total > 0) {
    Object.keys(distribution).forEach(key => {
      distribution[key] = distribution[key] / total;
    });
  }

  // Determine primary type
  const primary = Object.entries(distribution)
    .sort(([, a], [, b]) => b - a)[0][0];

  return {
    primary,
    distribution,
    confidence: Math.max(...Object.values(distribution)),
    raw: {
      category,
      type,
      displayName: data.display_name,
    },
  };
}

/**
 * Get default location distribution when geocoding fails
 * @private
 */
function getDefaultLocationDistribution() {
  return {
    primary: 'unknown',
    distribution: {
      library: 0.125,
      cafe: 0.125,
      office: 0.125,
      home: 0.125,
      transit: 0.125,
      outdoor: 0.125,
      commercial: 0.125,
      educational: 0.125,
    },
    confidence: 0.125,
    raw: {
      category: 'unknown',
      type: 'unknown',
      displayName: 'Unknown location',
    },
  };
}

/**
 * Clear geocoding cache (for testing/maintenance)
 */
export function clearGeocodeCache() {
  geocodeCache.clear();
  logger.info('🌍 Geocoding cache cleared');
}
