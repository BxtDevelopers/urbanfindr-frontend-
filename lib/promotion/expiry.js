// Scheduled auto-expiry, status management, and renewal notifications

import { Promotion, Notification } from '../models.js';

export async function processPromotionExpiries(now = new Date()) {
  const results = {
    expiredCount: 0,
    warned3DaysCount: 0,
    warned1DayCount: 0
  };

  try {
    const expiredPromotions = await Promotion.find({
      promotionStatus: 'active',
      expiryDate: { $lte: now }
    });

    for (const promo of expiredPromotions) {
      promo.promotionStatus = 'expired';
      promo.status = 'expired';
      await promo.save();
      results.expiredCount++;

      const ownerId = promo.userId || promo.user;
      if (ownerId) {
        await Notification.create({
          user: ownerId,
          title: 'Promotion Expired',
          body: `Your promotion for "${promo.targetTitle || 'listing'}" has ended. Renew now to maintain sponsored reach.`,
          link: '/dashboard?tab=promotions'
        }).catch(() => {});
      }
    }

    const in1Day = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const expiringIn1Day = await Promotion.find({
      promotionStatus: 'active',
      expiryDate: { $gt: now, $lte: in1Day }
    });

    for (const promo of expiringIn1Day) {
      const ownerId = promo.userId || promo.user;
      if (ownerId) {
        const existingNotif = await Notification.findOne({
          user: ownerId,
          title: 'Promotion Expiring Tomorrow',
          createdAt: { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) }
        });
        if (!existingNotif) {
          await Notification.create({
            user: ownerId,
            title: 'Promotion Expiring Tomorrow',
            body: `Your sponsored promotion for "${promo.targetTitle || 'listing'}" will expire in less than 24 hours.`,
            link: '/dashboard?tab=promotions'
          }).catch(() => {});
          results.warned1DayCount++;
        }
      }
    }

    const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const in2Days = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
    const expiringIn3Days = await Promotion.find({
      promotionStatus: 'active',
      expiryDate: { $gt: in2Days, $lte: in3Days }
    });

    for (const promo of expiringIn3Days) {
      const ownerId = promo.userId || promo.user;
      if (ownerId) {
        const existingNotif = await Notification.findOne({
          user: ownerId,
          title: 'Promotion Expiring in 3 Days',
          createdAt: { $gte: new Date(now.getTime() - 48 * 60 * 60 * 1000) }
        });
        if (!existingNotif) {
          await Notification.create({
            user: ownerId,
            title: 'Promotion Expiring in 3 Days',
            body: `Your promotion for "${promo.targetTitle || 'listing'}" expires in 3 days. Renew early to keep your high search rank.`,
            link: '/dashboard?tab=promotions'
          }).catch(() => {});
          results.warned3DaysCount++;
        }
      }
    }
  } catch (err) {
    console.error('[Promotion Expiry Service] Error processing expiries:', err);
  }

  return results;
}
