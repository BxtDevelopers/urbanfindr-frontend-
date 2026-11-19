// Promotion eligibility verification

/**
 * Checks whether a promotion is currently valid and active to be considered for placement
 * @param {Object} promo - Promotion document
 * @param {Date} now - Current timestamp (defaults to new Date())
 * @returns {{ eligible: boolean, reason?: string }}
 */
export function isPromotionActiveAndValid(promo, now = new Date()) {
  if (!promo) {
    return { eligible: false, reason: 'Promotion does not exist.' };
  }

  if (promo.paymentStatus !== 'paid') {
    return { eligible: false, reason: `Unpaid promotion (status: ${promo.paymentStatus}).` };
  }

  if (promo.approvalStatus !== 'approved') {
    return { eligible: false, reason: `Pending or rejected approval (status: ${promo.approvalStatus}).` };
  }

  if (promo.promotionStatus !== 'active') {
    return { eligible: false, reason: `Promotion is not active (status: ${promo.promotionStatus}).` };
  }

  const startDate = promo.startDate ? new Date(promo.startDate) : null;
  const expiryDate = promo.expiryDate ? new Date(promo.expiryDate) : null;

  if (!startDate || !expiryDate) {
    return { eligible: false, reason: 'Invalid promotion duration dates.' };
  }

  if (now < startDate) {
    return { eligible: false, reason: 'Promotion has not started yet.' };
  }

  if (now > expiryDate) {
    return { eligible: false, reason: 'Promotion has expired.' };
  }

  return { eligible: true };
}

/**
 * Checks whether the underlying listing document is in an active, approved, and available state
 * @param {Object} target - The target property, project, or service provider
 * @param {string} targetType - 'property' | 'builder_project' | 'service_provider'
 * @returns {{ eligible: boolean, reason?: string }}
 */
export function isTargetListingEligible(target, targetType) {
  if (!target) {
    return { eligible: false, reason: 'Target listing was deleted or not found.' };
  }

  if (targetType === 'property') {
    if (target.status !== 'approved') {
      return { eligible: false, reason: `Property is not approved (status: ${target.status}).` };
    }
    if (target.status === 'closed' || target.status === 'archived') {
      return { eligible: false, reason: 'Property listing is closed or archived.' };
    }
  } else if (targetType === 'builder_project' || targetType === 'project') {
    if (target.status !== 'approved') {
      return { eligible: false, reason: `Builder project is not approved (status: ${target.status}).` };
    }
    if (target.status === 'archived') {
      return { eligible: false, reason: 'Builder project is archived.' };
    }
  } else if (targetType === 'service_provider' || targetType === 'service') {
    if (target.active === false || target.status === 'inactive') {
      return { eligible: false, reason: 'Service provider or service is inactive.' };
    }
  }

  return { eligible: true };
}

/**
 * Verifies that the advertiser owns the target listing being promoted
 * @param {Object} user - Logged in user
 * @param {Object} target - Target listing document
 * @param {string} targetType - 'property' | 'builder_project' | 'service_provider'
 * @returns {boolean}
 */
export function isUserAuthorizedToPromote(user, target, targetType) {
  if (!user || !target) return false;
  if (user.role === 'admin') return true;

  const userIdStr = String(user._id);

  if (targetType === 'property') {
    const ownerId = target.owner?._id || target.owner;
    return String(ownerId) === userIdStr;
  }

  if (targetType === 'builder_project' || targetType === 'project') {
    const managerId = target.manager?._id || target.manager;
    return String(managerId) === userIdStr;
  }

  if (targetType === 'service_provider' || targetType === 'service') {
    const providerId = target.provider?._id || target.provider || target.user?._id || target.user;
    if (providerId && String(providerId) === userIdStr) return true;
    if (String(target._id) === userIdStr) return true;
  }

  return false;
}
