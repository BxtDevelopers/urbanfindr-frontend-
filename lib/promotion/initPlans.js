// Promotion plans initialization & seeding

import { PromotionPlan } from '../models.js';
import { DEFAULT_PROMOTION_PLANS } from './config.js';

export async function ensureDefaultPromotionPlans() {
  try {
    for (const plan of DEFAULT_PROMOTION_PLANS) {
      await PromotionPlan.findOneAndUpdate(
        { slug: plan.slug },
        { $setOnInsert: plan },
        { upsert: true, new: true }
      );
    }
  } catch (err) {
    console.error('[Promotion Plans] Error ensuring default plans:', err.message);
  }
}
