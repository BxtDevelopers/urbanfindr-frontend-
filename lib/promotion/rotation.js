// Fair rotation, frequency capping, and tier-ordered sponsored placement

import { ROTATION_CONFIG } from './config.js';

/**
 * Returns the numerical tier level for a promotion:
 * 3: Elite Boost
 * 2: Premium Boost
 * 1: Basic Boost
 * 0: Other / fallback
 */
export function getPromotionTierLevel(promo) {
  if (!promo) return 0;
  const slug = String(promo?.planId?.slug || promo?.plan || promo?.planSlug || promo?.planId?.name || '').toLowerCase();
  const priority = Number(promo?.planId?.priority || promo?.priority || 0);
  const name = String(promo?.planId?.name || '').toLowerCase();

  // Tier 3: Elite Boost (Highest priority - always first)
  if (slug.includes('elite') || name.includes('elite') || priority >= 90) return 3;
  // Tier 2: Premium Boost (Second priority - shows after Elite Boost)
  if (slug.includes('premium') || name.includes('premium') || priority >= 50) return 2;
  // Tier 1: Basic Boost (Third priority - shows after Premium Boost)
  if (slug.includes('basic') || name.includes('basic') || priority >= 20) return 1;
  return 0;
}

/**
 * Sorts sponsored candidates strictly by promotion tier:
 * 1st: Elite Boost
 * 2nd: Premium Boost
 * 3rd: Basic Boost
 * Within each tier, sorts by ranking finalScore descending.
 */
export function sortSponsoredByTier(candidates = []) {
  return [...candidates].sort((a, b) => {
    const tierA = getPromotionTierLevel(a.promo);
    const tierB = getPromotionTierLevel(b.promo);

    // 1. Strict Tier Priority: Elite (3) > Premium (2) > Basic (1)
    if (tierB !== tierA) {
      return tierB - tierA;
    }

    // 2. Within the same tier, sort by computed ranking finalScore descending
    const scoreA = Number(a.ranking?.finalScore || 0);
    const scoreB = Number(b.ranking?.finalScore || 0);
    if (scoreB !== scoreA) {
      return scoreB - scoreA;
    }

    // 3. Tie-break by newest listing
    const dateA = new Date(a.target?.createdAt || 0).getTime();
    const dateB = new Date(b.target?.createdAt || 0).getTime();
    return dateB - dateA;
  });
}

function seededOffset(items, seed = '') {
  if (!items || items.length <= 1 || !seed) return items;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const offset = Math.abs(hash) % items.length;
  return [...items.slice(offset), ...items.slice(0, offset)];
}

export function applyFairRotation(rankedList, seed = '', threshold = ROTATION_CONFIG.scoreSimilarityThreshold) {
  if (!rankedList || rankedList.length <= 1) return rankedList;

  const buckets = [];
  let currentBucket = [rankedList[0]];

  for (let i = 1; i < rankedList.length; i++) {
    const prev = currentBucket[0];
    const curr = rankedList[i];
    const prevScore = prev.ranking?.finalScore ?? 0;
    const currScore = curr.ranking?.finalScore ?? 0;
    if (Math.abs(prevScore - currScore) <= threshold) {
      currentBucket.push(curr);
    } else {
      buckets.push(currentBucket);
      currentBucket = [curr];
    }
  }
  if (currentBucket.length > 0) buckets.push(currentBucket);

  const rotated = [];
  for (const bucket of buckets) {
    if (bucket.length > 1) {
      rotated.push(...seededOffset(bucket, seed));
    } else {
      rotated.push(...bucket);
    }
  }
  return rotated;
}

/**
 * Applies fair rotation ONLY within the same tier so that Elite listings
 * NEVER drop below Premium, and Premium listings NEVER drop below Basic.
 */
export function applyFairRotationWithinTiers(rankedList, seed = '') {
  if (!rankedList || rankedList.length <= 1) return rankedList;

  const eliteBucket = [];
  const premiumBucket = [];
  const basicBucket = [];
  const otherBucket = [];

  for (const item of rankedList) {
    const level = getPromotionTierLevel(item.promo);
    if (level === 3) eliteBucket.push(item);
    else if (level === 2) premiumBucket.push(item);
    else if (level === 1) basicBucket.push(item);
    else otherBucket.push(item);
  }

  const rotElite = applyFairRotation(eliteBucket, seed);
  const rotPremium = applyFairRotation(premiumBucket, seed);
  const rotBasic = applyFairRotation(basicBucket, seed);
  const rotOther = applyFairRotation(otherBucket, seed);

  return [...rotElite, ...rotPremium, ...rotBasic, ...rotOther];
}

/**
 * Combines organic items with sponsored items strictly ordered by tier:
 * 1. Elite Boost properties (shown first)
 * 2. Premium Boost properties (shown after Elite Boost)
 * 3. Basic Boost properties (shown after Premium Boost)
 * 4. Normal / Organic listings (shown after all boosted properties)
 */
export function interleaveSponsoredResults(organicItems = [], sponsoredItems = [], options = {}) {
  const maxSponsored = options.maxSponsored ?? ROTATION_CONFIG.maxSponsoredPerPage;
  const seed = options.seed || '';

  if (!sponsoredItems || sponsoredItems.length === 0) {
    return organicItems;
  }

  // 1. Sort strictly by Tier: Elite Boost -> Premium Boost -> Basic Boost
  const tierOrderedSponsored = sortSponsoredByTier(sponsoredItems);

  // 2. Rotate fairly within identical tiers
  const rotated = applyFairRotationWithinTiers(tierOrderedSponsored, seed);
  const eligibleSponsored = rotated.slice(0, maxSponsored);

  if (eligibleSponsored.length === 0) return organicItems;

  const sponsoredTargetIds = new Set(
    eligibleSponsored.map(s => String(s.target._id || s.target.id))
  );

  // 3. Remove organic duplicates of any sponsored item
  const filteredOrganic = organicItems.filter(
    item => !sponsoredTargetIds.has(String(item._id || item.id))
  );

  // 4. Format sponsored items with metadata and badges
  const formattedSponsored = eligibleSponsored.map(sp => {
    const tierLevel = getPromotionTierLevel(sp.promo);
    const tierName = tierLevel === 3 ? 'Elite Boost' : tierLevel === 2 ? 'Premium Boost' : 'Basic Boost';
    const tierSlug = tierLevel === 3 ? 'elite' : tierLevel === 2 ? 'premium' : 'basic';

    return {
      ...sp.target,
      isSponsored: true,
      sponsoredData: {
        promotionId: String(sp.promo._id),
        planName: sp.promo.planId?.name || sp.promo.plan || tierName,
        tier: tierSlug,
        tierLevel,
        score: sp.ranking?.finalScore || 0,
        priority: sp.ranking?.priorityScore || (tierLevel === 3 ? 100 : tierLevel === 2 ? 60 : 30)
      }
    };
  });

  // 5. Tiered hierarchy: Elite Boost -> Premium Boost -> Basic Boost -> Normal (organic) properties
  return [...formattedSponsored, ...filteredOrganic];
}
