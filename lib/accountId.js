import crypto from 'node:crypto';
import { AccountIdRegistry, User } from './models.js';

export const ROLE_PREFIX_MAP = {
  channel_partner: 'CP',
  broker: 'BR',
  builder: 'BD',
  service_provider: 'SP',
  'service-provider': 'SP',
  provider: 'SP'
};

export const ROLE_LABEL_MAP = {
  channel_partner: 'Channel Partner',
  broker: 'Broker / Agent',
  builder: 'Builder',
  service_provider: 'Service Provider',
  'service-provider': 'Service Provider',
  provider: 'Service Provider'
};

export const ELIGIBLE_ROLES = ['channel_partner', 'broker', 'builder', 'service_provider'];

/**
 * Returns true if the role is one of the four eligible account types:
 * Channel Partner, Broker, Builder, Service Provider.
 * Customers ('customer', 'user') and Property Owners ('owner') are excluded.
 */
export function isEligibleRole(role) {
  return Boolean(role && ROLE_PREFIX_MAP[role]);
}

/**
 * Returns role code ('CP', 'BR', 'BD', 'SP') or null if not eligible.
 */
export function getRoleCode(role) {
  return ROLE_PREFIX_MAP[role] || null;
}

/**
 * Generates a 6-digit numeric string with exact 6 digits, including leading zeros where necessary.
 * Range: 000000 - 999999
 */
export function generateRandomSixDigitSuffix() {
  const num = crypto.randomInt(0, 1000000);
  return String(num).padStart(6, '0');
}

/**
 * Formats full Account ID: UF-[ROLE CODE]-[6 DIGIT NUMBER]
 * Format: UF-[ROLE CODE]-[6 DIGIT UNIQUE NUMBER]
 */
export function formatAccountId(role, suffix) {
  const code = getRoleCode(role);
  if (!code) throw new Error(`Role ${role} is not eligible for an UrbanFindr Account ID.`);
  const cleanSuffix = String(suffix).trim().padStart(6, '0');
  return `UF-${code}-${cleanSuffix}`;
}

/**
 * Concurrency-safe unique Account ID generator across all eligible roles.
 * The six-digit number must be globally unique across all four account types.
 * Retries on database uniqueness collisions.
 */
export async function generateUniqueAccountId(role, userId, maxRetries = 25) {
  if (!isEligibleRole(role)) {
    return null;
  }

  const roleCode = getRoleCode(role);
  const canonicalRole = (role === 'provider' || role === 'service-provider') ? 'service_provider' : role;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const suffix = generateRandomSixDigitSuffix();
    const accountId = `UF-${roleCode}-${suffix}`;

    // Fast check first against central registry & user collections
    const [existsInReg, existsInUser] = await Promise.all([
      AccountIdRegistry.exists({ number: suffix }),
      User.exists({ accountIdNumber: suffix })
    ]);

    if (existsInReg || existsInUser) {
      continue;
    }

    try {
      // Concurrency-safe insert protected by database unique index on `number`
      const registryEntry = await AccountIdRegistry.create({
        number: suffix,
        accountId,
        accountType: canonicalRole,
        user: userId
      });

      return {
        accountId,
        accountIdNumber: suffix,
        accountType: canonicalRole,
        registryId: registryEntry._id
      };
    } catch (err) {
      // MongoDB duplicate key error (code 11000)
      if (err.code === 11000) {
        continue;
      }
      throw err;
    }
  }

  throw new Error('Unable to generate unique Account ID after multiple attempts. Please try again.');
}

/**
 * Safely assigns an Account ID to an eligible user if they don't already have one.
 * Never overwrites existing valid IDs.
 */
export async function assignAccountIdToUser(user) {
  if (!user || !isEligibleRole(user.role)) {
    return null;
  }

  if (user.accountId && user.accountIdNumber) {
    return user.accountId;
  }

  const canonicalRole = (user.role === 'provider' || user.role === 'service-provider') ? 'service_provider' : user.role;
  const generated = await generateUniqueAccountId(canonicalRole, user._id);
  if (!generated) {
    return null;
  }

  user.accountId = generated.accountId;
  user.accountIdNumber = generated.accountIdNumber;
  user.accountType = generated.accountType;

  await user.save();
  return user.accountId;
}
