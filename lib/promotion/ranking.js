// Promotion ranking algorithm with normalized multi-factor scoring

import { RANKING_WEIGHTS } from './config.js';

export function clampScore(val) {
  if (isNaN(val) || val <= 0) return 0;
  if (val >= 100) return 100;
  return Math.round(val * 100) / 100;
}

export function calculateRelevanceScore(target, targetType, searchFilters = {}) {
  if (!target) return 0;

  const filterKeys = Object.keys(searchFilters).filter(
    k => searchFilters[k] !== undefined && searchFilters[k] !== '' && searchFilters[k] !== null
  );
  if (filterKeys.length === 0) return 80;

  let totalWeight = 0;
  let earnedScore = 0;

  if (searchFilters.city) {
    totalWeight += 30;
    const filterCity = String(searchFilters.city).trim().toLowerCase();
    const targetCity = String(target.city || '').trim().toLowerCase();

    const isBangalore = (c) => c === 'bangalore' || c === 'bengaluru';
    const isDelhi = (c) => c === 'delhi' || c === 'new delhi' || c === 'delhi ncr';

    if (filterCity === targetCity || (isBangalore(filterCity) && isBangalore(targetCity)) || (isDelhi(filterCity) && isDelhi(targetCity))) {
      earnedScore += 30;
    } else {
      return 0;
    }
  }

  if (targetType === 'property' && searchFilters.purpose) {
    totalWeight += 25;
    const filterPurpose = String(searchFilters.purpose).trim().toLowerCase();
    const targetPurpose = String(target.purpose || '').trim().toLowerCase();
    if (filterPurpose === targetPurpose || (filterPurpose === 'buy' && targetPurpose === 'sale')) {
      earnedScore += 25;
    } else {
      return 0;
    }
  }

  if ((targetType === 'service_provider' || targetType === 'service') && (searchFilters.category || searchFilters.categorySlug)) {
    totalWeight += 30;
    const filterCat = String(searchFilters.category || searchFilters.categorySlug).toLowerCase().replace(/[-_]/g, ' ');
    const targetCat = String(target.category || target.categorySlug || '').toLowerCase().replace(/[-_]/g, ' ');
    if (targetCat.includes(filterCat) || filterCat.includes(targetCat)) {
      earnedScore += 30;
    } else {
      return 0;
    }
  }

  if (searchFilters.locality || searchFilters.localities) {
    totalWeight += 20;
    const filterLoc = String(searchFilters.locality || searchFilters.localities).toLowerCase();
    const targetLoc = String(target.locality || '').toLowerCase();
    if (targetLoc && filterLoc.includes(targetLoc)) {
      earnedScore += 20;
    } else if (targetLoc) {
      earnedScore += 5;
    }
  }

  if (searchFilters.type && target.type) {
    totalWeight += 15;
    const filterType = String(searchFilters.type).toLowerCase();
    const targetTypeStr = String(target.type).toLowerCase();
    if (filterType.includes(targetTypeStr) || targetTypeStr.includes(filterType)) {
      earnedScore += 15;
    }
  }

  if (searchFilters.bedrooms !== undefined && target.bedrooms !== undefined) {
    totalWeight += 15;
    const filterBhk = Number(searchFilters.bedrooms);
    const targetBhk = Number(target.bedrooms);
    if (!isNaN(filterBhk) && filterBhk > 0) {
      if (targetBhk === filterBhk) {
        earnedScore += 15;
      } else if (Math.abs(targetBhk - filterBhk) === 1) {
        earnedScore += 7;
      }
    }
  }

  if ((searchFilters.minPrice || searchFilters.maxPrice) && target.price) {
    totalWeight += 15;
    const price = Number(target.price);
    const min = Number(searchFilters.minPrice) || 0;
    const max = Number(searchFilters.maxPrice) || Infinity;
    if (price >= min && price <= max) {
      earnedScore += 15;
    } else if (price >= min * 0.8 && price <= max * 1.2) {
      earnedScore += 8;
    }
  }

  if (searchFilters.q) {
    totalWeight += 10;
    const term = String(searchFilters.q).toLowerCase();
    const title = String(target.title || target.name || '').toLowerCase();
    const desc = String(target.description || target.bio || '').toLowerCase();
    if (title.includes(term) || desc.includes(term)) {
      earnedScore += 10;
    }
  }

  if (totalWeight === 0) return 80;
  return clampScore((earnedScore / totalWeight) * 100);
}

export function calculateListingQualityScore(target, targetType) {
  if (!target) return 50;
  let score = 0;

  const title = String(target.title || target.name || '').trim();
  if (title.length >= 20) score += 15;
  else if (title.length >= 8) score += 10;

  const desc = String(target.description || target.about || target.bio || '').trim();
  if (desc.length >= 150) score += 20;
  else if (desc.length >= 50) score += 12;
  else if (desc.length > 0) score += 5;

  const images = Array.isArray(target.images) ? target.images : (target.avatar || target.logo ? [target.avatar || target.logo] : []);
  if (images.length >= 5) score += 25;
  else if (images.length >= 3) score += 18;
  else if (images.length >= 1) score += 10;

  if (target.price > 0 || target.startingPrice) score += 15;

  if (target.locality && (target.address || target.headquarters)) score += 15;
  else if (target.locality || target.city) score += 10;

  if (Array.isArray(target.amenities) && target.amenities.length > 0) score += 10;
  else if (Array.isArray(target.configurations) && target.configurations.length > 0) score += 10;
  else if (Array.isArray(target.services) && target.services.length > 0) score += 10;

  return clampScore(score);
}

export function calculateEngagementScore(promo) {
  if (!promo) return 50;

  const impressions = Math.max(0, Number(promo.impressions) || 0);
  const clicks = Math.max(0, Number(promo.clicks) || 0);
  const enquiries = Math.max(0, Number(promo.enquiries) || 0);
  const siteVisits = Math.max(0, Number(promo.siteVisits) || 0);

  if (impressions < 5) return 60;

  const ctr = (clicks / impressions) * 100;
  let ctrScore = Math.min(50, ctr * 6.25);
  const enquiryScore = Math.min(30, (enquiries * 5) + (siteVisits * 10));
  const activityScore = Math.min(20, clicks * 2);

  return clampScore(ctrScore + enquiryScore + activityScore);
}

export function calculateFreshnessScore(target) {
  if (!target) return 50;
  const date = target.updatedAt || target.createdAt ? new Date(target.updatedAt || target.createdAt) : new Date();
  const diffDays = Math.max(0, (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays <= 3) return 100;
  if (diffDays <= 7) return 90;
  if (diffDays <= 14) return 80;
  if (diffDays <= 30) return 65;
  if (diffDays <= 60) return 50;
  if (diffDays <= 90) return 35;
  return 20;
}

export function calculateFinalRankingScore({
  promo,
  target,
  targetType,
  searchFilters = {},
  weights = RANKING_WEIGHTS
}) {
  const relevanceScore = calculateRelevanceScore(target, targetType, searchFilters);

  if (relevanceScore === 0) {
    return {
      finalScore: 0,
      relevanceScore: 0,
      priorityScore: 0,
      qualityScore: 0,
      engagementScore: 0,
      freshnessScore: 0,
      eligible: false
    };
  }

  const planPriority = Number(promo?.planId?.priority || promo?.priority || 30);
  const priorityScore = clampScore(planPriority);

  const qualityScore = calculateListingQualityScore(target, targetType);
  const engagementScore = calculateEngagementScore(promo);
  const freshnessScore = calculateFreshnessScore(target);

  const finalScore = clampScore(
    (relevanceScore * weights.relevance) +
    (priorityScore * weights.promotionPriority) +
    (qualityScore * weights.listingQuality) +
    (engagementScore * weights.engagement) +
    (freshnessScore * weights.freshness)
  );

  return {
    finalScore,
    relevanceScore,
    priorityScore,
    qualityScore,
    engagementScore,
    freshnessScore,
    eligible: finalScore > 0
  };
}
