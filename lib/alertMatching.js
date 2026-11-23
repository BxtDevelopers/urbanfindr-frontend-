import mongoose from 'mongoose';
import { Property, PropertyAlert, AlertNotificationLog, AlertDigestQueue, Notification, User } from './models.js';
import { sendPropertyAlertEmail, sendDailyDigestEmail } from './email.js';

function escapeRegex(value) {
  return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function normalizeText(str) {
  return String(str || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Checks whether an eligible property matches a saved alert's criteria.
 */
export function doesPropertyMatchAlert(property, alert) {
  if (!property || property.status !== 'approved') {
    return false;
  }

  const f = alert.filters || {};

  // 1. Listing Type / Purpose matching ('buy', 'rent', 'pg', 'commercial')
  if (f.listingType && f.listingType !== 'any') {
    if (normalizeText(property.purpose) !== normalizeText(f.listingType)) {
      return false;
    }
  }

  // 2. Property Category (Residential, Commercial, PG)
  if (f.category && f.category !== 'Any') {
    const cat = normalizeText(f.category);
    if (cat === 'residential') {
      if (!['buy', 'rent'].includes(normalizeText(property.purpose))) return false;
      if (['Office', 'Shop', 'Warehouse'].includes(property.type)) return false;
    } else if (cat === 'commercial') {
      if (normalizeText(property.purpose) !== 'commercial' && !['Office', 'Shop', 'Warehouse'].includes(property.type)) {
        return false;
      }
    } else if (cat === 'pg') {
      if (normalizeText(property.purpose) !== 'pg' && property.type !== 'PG') {
        return false;
      }
    }
  }

  // 3. City matching
  if (f.city && f.city.trim() !== '') {
    if (normalizeText(property.city) !== normalizeText(f.city)) {
      return false;
    }
  }

  // 4. Locality matching (can be one or multiple localities)
  if (Array.isArray(f.localities) && f.localities.length > 0) {
    const propLoc = normalizeText(property.locality);
    const matched = f.localities.some(loc => {
      const normLoc = normalizeText(loc);
      return propLoc === normLoc || propLoc.includes(normLoc) || normLoc.includes(propLoc);
    });
    if (!matched) return false;
  }

  // 5. Property Type (Apartment, Villa, Independent house, Plot, etc.)
  if (f.propertyType && f.propertyType !== 'Any') {
    if (normalizeText(property.type) !== normalizeText(f.propertyType)) {
      return false;
    }
  }

  // 6. BHK matching (array of numbers, e.g. [1, 2, 3, 4, 5])
  if (Array.isArray(f.bhk) && f.bhk.length > 0) {
    const bedrooms = Number(property.bedrooms);
    if (isNaN(bedrooms) || bedrooms === null || bedrooms === undefined) {
      return false;
    }
    const matchesBhk = f.bhk.some(b => {
      const num = Number(b);
      if (num >= 5) return bedrooms >= 5;
      return bedrooms === num;
    });
    if (!matchesBhk) return false;
  }

  // 7. Budget / Price matching
  const price = Number(property.price);
  if (f.minPrice !== null && f.minPrice !== undefined && f.minPrice > 0) {
    if (isNaN(price) || price < Number(f.minPrice)) return false;
  }
  if (f.maxPrice !== null && f.maxPrice !== undefined && f.maxPrice > 0) {
    if (isNaN(price) || price > Number(f.maxPrice)) return false;
  }

  // 8. Furnishing matching
  if (f.furnishing && f.furnishing !== 'Any') {
    if (normalizeText(property.furnishing) !== normalizeText(f.furnishing)) {
      return false;
    }
  }

  // 9. Verified listings only
  if (f.verifiedOnly === true) {
    if (!property.verified) return false;
  }

  // 10. Amenities matching (all requested amenities must be present)
  if (Array.isArray(f.amenities) && f.amenities.length > 0) {
    const propAmenities = (property.amenities || []).map(a => normalizeText(a));
    const allPresent = f.amenities.every(amenity => propAmenities.includes(normalizeText(amenity)));
    if (!allPresent) return false;
  }

  // 11. Property Age
  if (f.propertyAge && f.propertyAge !== 'Any') {
    if (property.propertyAge && normalizeText(property.propertyAge) !== normalizeText(f.propertyAge)) {
      return false;
    }
  }

  // 12. Area matching (sq ft)
  if (f.minArea !== null && f.minArea !== undefined && f.minArea > 0) {
    if (!property.area || property.area < Number(f.minArea)) return false;
  }
  if (f.maxArea !== null && f.maxArea !== undefined && f.maxArea > 0) {
    if (!property.area || property.area > Number(f.maxArea)) return false;
  }

  return true;
}

/**
 * Converts an alert's saved filters into an executable MongoDB query filter
 * for querying matching approved properties.
 */
export function buildMongoFilterFromAlert(alert) {
  const filter = { status: 'approved' };
  const f = alert.filters || {};

  if (f.listingType && f.listingType !== 'any') {
    filter.purpose = f.listingType.toLowerCase();
  }

  if (f.city && f.city.trim() !== '') {
    filter.city = new RegExp('^' + escapeRegex(f.city.trim()) + '$', 'i');
  }

  if (Array.isArray(f.localities) && f.localities.length > 0) {
    const locRegexes = f.localities.map(loc => new RegExp(escapeRegex(loc.trim()), 'i'));
    filter.locality = { $in: locRegexes };
  }

  if (f.propertyType && f.propertyType !== 'Any') {
    filter.type = f.propertyType;
  }

  if (Array.isArray(f.bhk) && f.bhk.length > 0) {
    const hasFivePlus = f.bhk.some(b => Number(b) >= 5);
    const normalBhk = f.bhk.map(Number).filter(b => b < 5);
    if (hasFivePlus && normalBhk.length > 0) {
      filter.$or = [{ bedrooms: { $in: normalBhk } }, { bedrooms: { $gte: 5 } }];
    } else if (hasFivePlus) {
      filter.bedrooms = { $gte: 5 };
    } else {
      filter.bedrooms = { $in: normalBhk };
    }
  }

  const priceCond = {};
  if (f.minPrice !== null && f.minPrice !== undefined && f.minPrice > 0) {
    priceCond.$gte = Number(f.minPrice);
  }
  if (f.maxPrice !== null && f.maxPrice !== undefined && f.maxPrice > 0) {
    priceCond.$lte = Number(f.maxPrice);
  }
  if (Object.keys(priceCond).length > 0) {
    filter.price = priceCond;
  }

  if (f.furnishing && f.furnishing !== 'Any') {
    filter.furnishing = f.furnishing;
  }

  if (f.verifiedOnly === true) {
    filter.verified = true;
  }

  if (Array.isArray(f.amenities) && f.amenities.length > 0) {
    filter.amenities = { $all: f.amenities };
  }

  const areaCond = {};
  if (f.minArea !== null && f.minArea !== undefined && f.minArea > 0) {
    areaCond.$gte = Number(f.minArea);
  }
  if (f.maxArea !== null && f.maxArea !== undefined && f.maxArea > 0) {
    areaCond.$lte = Number(f.maxArea);
  }
  if (Object.keys(areaCond).length > 0) {
    filter.area = areaCond;
  }

  return filter;
}

/**
 * Event-Driven Trigger: Matches a newly approved or activated property against all active alerts.
 */
export async function triggerAlertsForProperty(propertyId, options = {}) {
  try {
    const property = await Property.findById(propertyId).lean();
    if (!property || property.status !== 'approved') {
      return { matchesCount: 0, notificationsSent: 0, skipped: true, reason: 'Listing not approved or not found' };
    }

    // Candidate query using indexed fields for efficiency
    const candidateQuery = {
      status: 'active'
    };

    if (property.city) {
      candidateQuery.$or = [
        { 'filters.city': { $in: [null, '', undefined] } },
        { 'filters.city': new RegExp('^' + escapeRegex(property.city.trim()) + '$', 'i') }
      ];
    }

    const alerts = await PropertyAlert.find(candidateQuery).lean();
    let matchesCount = 0;
    let notificationsSent = 0;
    let deduplicatedCount = 0;

    for (const alert of alerts) {
      // Do not alert owners about their own property listings
      if (String(alert.user) === String(property.owner)) {
        continue;
      }

      if (!doesPropertyMatchAlert(property, alert)) {
        continue;
      }

      matchesCount++;

      // Strict Deduplication Check using unique compound key
      const dedupKey = `${alert.user}_${alert._id}_${property._id}_new_match`;
      let logEntry = null;

      try {
        logEntry = await AlertNotificationLog.create({
          dedupKey,
          user: alert.user,
          alert: alert._id,
          property: property._id,
          eventType: 'new_match',
          channel: alert.notificationPreferences?.frequency === 'daily' ? 'digest' : (alert.notificationPreferences?.email ? 'email' : 'in_app'),
          status: alert.notificationPreferences?.frequency === 'daily' ? 'queued' : 'sent',
          sentAt: new Date()
        });
      } catch (err) {
        if (err.code === 11000) {
          // Already notified for this property and alert. Skip duplicate!
          deduplicatedCount++;
          continue;
        }
        console.error('[Alert Matching Deduplication Error]:', err.message);
        continue;
      }

      // Atomically update alert statistics
      await PropertyAlert.findByIdAndUpdate(alert._id, {
        $inc: { totalMatches: 1 },
        $set: {
          lastMatchedAt: new Date(),
          lastNotificationAt: new Date(),
          latestMatch: property._id
        }
      });

      const prefs = alert.notificationPreferences || { inApp: true, email: false, frequency: 'instant' };

      // Handle Daily Digest queue
      if (prefs.frequency === 'daily') {
        await AlertDigestQueue.findOneAndUpdate(
          { user: alert.user, alert: alert._id, property: property._id },
          { $setOnInsert: { processed: false, createdAt: new Date() } },
          { upsert: true }
        ).catch(() => {});
        continue;
      }

      // Handle Instant In-App Notification
      if (prefs.inApp !== false) {
        const bhkPrefix = property.bedrooms ? `${property.bedrooms} BHK ` : '';
        await Notification.create({
          user: alert.user,
          title: 'New Property Matches Your Alert',
          body: `A new ${bhkPrefix}${property.type || 'property'} in ${property.locality}, ${property.city} is now available matching "${alert.name}".`,
          link: `/properties/${property._id}`,
          metadata: {
            type: 'property_alert',
            alertId: alert._id,
            alertName: alert.name,
            propertyId: property._id,
            title: property.title,
            thumbnail: property.images?.[0] || '',
            price: property.price,
            city: property.city,
            locality: property.locality,
            bhk: property.bedrooms,
            propertyType: property.type
          }
        });
        notificationsSent++;
      }

      // Handle Instant Email Notification
      if (prefs.email) {
        try {
          const recipient = await User.findById(alert.user).select('email').lean();
          if (recipient?.email) {
            await sendPropertyAlertEmail({
              to: recipient.email,
              alertName: alert.name,
              property,
              appUrl: process.env.APP_URL || 'http://localhost:3000'
            });
          }
        } catch (emailErr) {
          console.warn(`[Alert Email Notice] Failed to deliver alert email: ${emailErr.message}`);
          if (logEntry) {
            await AlertNotificationLog.findByIdAndUpdate(logEntry._id, {
              status: 'failed',
              errorMessage: emailErr.message
            }).catch(() => {});
          }
        }
      }
    }

    return { matchesCount, notificationsSent, deduplicatedCount };
  } catch (err) {
    console.error('[triggerAlertsForProperty Error]:', err);
    throw err;
  }
}

/**
 * Processes daily digests for alerts configured with frequency === 'daily'.
 */
export async function processDailyAlertDigests(appUrl = process.env.APP_URL || 'http://localhost:3000') {
  try {
    const queueItems = await AlertDigestQueue.find({ processed: false }).lean();
    if (!queueItems.length) {
      return { processedCount: 0, digestsSent: 0 };
    }

    // Group queue items by user and alert
    const grouped = {};
    for (const item of queueItems) {
      const key = `${item.user}_${item.alert}`;
      if (!grouped[key]) grouped[key] = { userId: item.user, alertId: item.alert, propertyIds: [], queueItemIds: [] };
      grouped[key].propertyIds.push(item.property);
      grouped[key].queueItemIds.push(item._id);
    }

    let digestsSent = 0;

    for (const group of Object.values(grouped)) {
      const alert = await PropertyAlert.findById(group.alertId).lean();
      if (!alert || alert.status !== 'active') {
        await AlertDigestQueue.updateMany({ _id: { $in: group.queueItemIds } }, { $set: { processed: true, processedAt: new Date() } });
        continue;
      }

      // Fetch eligible properties
      const properties = await Property.find({
        _id: { $in: group.propertyIds },
        status: 'approved'
      }).lean();

      if (!properties.length) {
        await AlertDigestQueue.updateMany({ _id: { $in: group.queueItemIds } }, { $set: { processed: true, processedAt: new Date() } });
        continue;
      }

      const recipient = await User.findById(group.userId).select('email').lean();
      const prefs = alert.notificationPreferences || {};

      // Send In-App Digest Summary
      if (prefs.inApp !== false) {
        await Notification.create({
          user: group.userId,
          title: `Daily Digest: ${properties.length} New Matches`,
          body: `${properties.length} new ${properties.length === 1 ? 'property matches' : 'properties match'} your saved alert "${alert.name}".`,
          link: `/dashboard/customer?section=saved-searches&alertId=${alert._id}&action=matches`,
          metadata: {
            type: 'property_alert_digest',
            alertId: alert._id,
            alertName: alert.name,
            matchCount: properties.length,
            thumbnail: properties[0]?.images?.[0] || ''
          }
        });
      }

      // Send Email Digest
      if (prefs.email && recipient?.email) {
        try {
          await sendDailyDigestEmail({
            to: recipient.email,
            alertName: alert.name,
            properties,
            appUrl
          });
        } catch (emailErr) {
          console.warn(`[Daily Digest Email Warning]: ${emailErr.message}`);
        }
      }

      // Mark queue items as processed
      await AlertDigestQueue.updateMany(
        { _id: { $in: group.queueItemIds } },
        { $set: { processed: true, processedAt: new Date() } }
      );
      digestsSent++;
    }

    return { processedCount: queueItems.length, digestsSent };
  } catch (err) {
    console.error('[processDailyAlertDigests Error]:', err);
    throw err;
  }
}
