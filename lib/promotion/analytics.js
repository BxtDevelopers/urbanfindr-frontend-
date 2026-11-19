// Analytics event recording, deduplication, and aggregation

import { Promotion, PromotionAnalytics } from '../models.js';

const COOLDOWN_MS = {
  impression: 15 * 60 * 1000,
  click: 3 * 60 * 1000,
  enquiry: 10 * 60 * 1000,
  phone_call: 5 * 60 * 1000,
  site_visit: 10 * 60 * 1000
};

export async function trackPromotionEvent({
  promotionId,
  eventType,
  visitorIdentifier = '',
  sessionId = '',
  sourcePage = '',
  placement = '',
  userId = null
}) {
  if (!promotionId || !eventType) return { recorded: false, reason: 'Missing required parameters.' };

  const validEvents = ['impression', 'click', 'enquiry', 'phone_call', 'site_visit'];
  if (!validEvents.includes(eventType)) {
    return { recorded: false, reason: 'Invalid event type.' };
  }

  const promo = await Promotion.findById(promotionId);
  if (!promo) {
    return { recorded: false, reason: 'Promotion not found.' };
  }

  const cooldown = COOLDOWN_MS[eventType] || 60000;
  const cutoff = new Date(Date.now() - cooldown);

  const identifier = visitorIdentifier || sessionId;
  if (identifier) {
    const recentDuplicate = await PromotionAnalytics.findOne({
      promotionId: promo._id,
      eventType,
      $or: [
        { visitorIdentifier: identifier },
        { sessionId: identifier }
      ],
      createdAt: { $gte: cutoff }
    });

    if (recentDuplicate) {
      return { recorded: false, deduplicated: true };
    }
  }

  await PromotionAnalytics.create({
    promotionId: promo._id,
    userId: userId || promo.userId || promo.user,
    targetId: promo.targetId,
    targetType: promo.targetType,
    eventType,
    sessionId: sessionId || '',
    visitorIdentifier: visitorIdentifier || '',
    sourcePage: sourcePage || '',
    placement: placement || ''
  });

  const incField =
    eventType === 'impression' ? 'impressions' :
    eventType === 'click' ? 'clicks' :
    eventType === 'enquiry' ? 'enquiries' :
    eventType === 'phone_call' ? 'phoneCalls' :
    eventType === 'site_visit' ? 'siteVisits' : null;

  if (incField) {
    await Promotion.findByIdAndUpdate(promo._id, { $inc: { [incField]: 1 } });
  }

  return { recorded: true };
}

export async function getPromotionAnalyticsSummary(promotionId, dateRange = 30) {
  const promo = await Promotion.findById(promotionId);
  if (!promo) return null;

  const cutoff = new Date(Date.now() - dateRange * 24 * 60 * 60 * 1000);

  const events = await PromotionAnalytics.aggregate([
    {
      $match: {
        promotionId: promo._id,
        createdAt: { $gte: cutoff }
      }
    },
    {
      $group: {
        _id: '$eventType',
        count: { $sum: 1 }
      }
    }
  ]);

  const stats = {
    impressions: promo.impressions || 0,
    clicks: promo.clicks || 0,
    enquiries: promo.enquiries || 0,
    phoneCalls: promo.phoneCalls || 0,
    siteVisits: promo.siteVisits || 0
  };

  for (const e of events) {
    if (e._id === 'impression') stats.periodImpressions = e.count;
    if (e._id === 'click') stats.periodClicks = e.count;
    if (e._id === 'enquiry') stats.periodEnquiries = e.count;
    if (e._id === 'phone_call') stats.periodPhoneCalls = e.count;
    if (e._id === 'site_visit') stats.periodSiteVisits = e.count;
  }

  const ctr = stats.impressions > 0 ? (stats.clicks / stats.impressions) * 100 : 0;
  const conversionRate = stats.clicks > 0 ? (stats.enquiries / stats.clicks) * 100 : 0;

  return {
    stats,
    ctr: Math.round(ctr * 100) / 100,
    conversionRate: Math.round(conversionRate * 100) / 100,
    dateRangeDays: dateRange
  };
}
