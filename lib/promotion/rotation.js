// Fair rotation, frequency capping, and sponsored interleaving

import { ROTATION_CONFIG } from './config.js';

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
    if (Math.abs(prev.ranking.finalScore - curr.ranking.finalScore) <= threshold) {
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

export function interleaveSponsoredResults(organicItems = [], sponsoredItems = [], options = {}) {
  const maxSponsored = options.maxSponsored ?? ROTATION_CONFIG.maxSponsoredPerPage;
  const interval = options.interval ?? ROTATION_CONFIG.sponsoredSlotInterval;
  const seed = options.seed || '';

  if (!sponsoredItems || sponsoredItems.length === 0) {
    return organicItems;
  }

  const eligibleSponsored = applyFairRotation(sponsoredItems, seed).slice(0, maxSponsored);
  if (eligibleSponsored.length === 0) return organicItems;

  const sponsoredTargetIds = new Set(
    eligibleSponsored.map(s => String(s.target._id || s.target.id))
  );

  const filteredOrganic = organicItems.filter(
    item => !sponsoredTargetIds.has(String(item._id || item.id))
  );

  const result = [];
  let sIndex = 0;
  let oIndex = 0;

  if (sIndex < eligibleSponsored.length) {
    const sp = eligibleSponsored[sIndex++];
    result.push({
      ...sp.target,
      isSponsored: true,
      sponsoredData: {
        promotionId: String(sp.promo._id),
        planName: sp.promo.planId?.name || sp.promo.plan || 'Sponsored Boost',
        score: sp.ranking.finalScore,
        priority: sp.ranking.priorityScore
      }
    });
  }

  while (oIndex < filteredOrganic.length) {
    result.push(filteredOrganic[oIndex]);
    oIndex++;

    if (oIndex % interval === 0 && sIndex < eligibleSponsored.length) {
      const sp = eligibleSponsored[sIndex++];
      result.push({
        ...sp.target,
        isSponsored: true,
        sponsoredData: {
          promotionId: String(sp.promo._id),
          planName: sp.promo.planId?.name || sp.promo.plan || 'Sponsored Boost',
          score: sp.ranking.finalScore,
          priority: sp.ranking.priorityScore
        }
      });
    }
  }

  return result;
}
