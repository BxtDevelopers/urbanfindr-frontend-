// Promotion system configuration and ranking weights

export const DEFAULT_PROMOTION_PLANS = [
  {
    name: 'Basic Boost',
    slug: 'basic-boost',
    description: 'Essential sponsored placement for quick visibility and local inquiries.',
    price: 499,
    duration: 7,
    priority: 30,
    features: [
      'Sponsored badge on search & listing cards',
      'Boosted ranking across category searches',
      'Targeted local visibility',
      'Basic impressions and clicks analytics'
    ],
    supportedTargetTypes: ['property', 'builder_project', 'service_provider'],
    placementEligibility: ['search', 'category'],
    isActive: true
  },
  {
    name: 'Premium Boost',
    slug: 'premium-boost',
    description: 'High-priority placement across search, locality highlights, and recommendations.',
    price: 999,
    duration: 15,
    priority: 60,
    features: [
      'High promotional priority in search results',
      'Eligibility for premium sponsored top spots',
      'Locality spotlight & category banner visibility',
      'Detailed analytics (impressions, clicks, enquiries)',
      'Verified advertiser tag on listing'
    ],
    supportedTargetTypes: ['property', 'builder_project', 'service_provider'],
    placementEligibility: ['search', 'category', 'home_spotlight'],
    isActive: true
  },
  {
    name: 'Elite Boost',
    slug: 'elite-boost',
    description: 'Maximum exposure package for high-value properties, projects, and top service providers.',
    price: 1999,
    duration: 30,
    priority: 100,
    features: [
      'Highest promotional priority across all search views',
      'Guaranteed top 3 sponsored placement rotation',
      'Homepage spotlight & cross-category placements',
      'Advanced conversion analytics (CTR, enquiry breakdown, site visits)',
      'Dedicated promotion advisor review'
    ],
    supportedTargetTypes: ['property', 'builder_project', 'service_provider'],
    placementEligibility: ['search', 'category', 'home_spotlight'],
    isActive: true
  }
];

export const RANKING_WEIGHTS = {
  relevance: 0.35,
  promotionPriority: 0.25,
  listingQuality: 0.15,
  engagement: 0.15,
  freshness: 0.10
};

export const ROTATION_CONFIG = {
  maxSponsoredPerPage: 3,
  sponsoredSlotInterval: 4,
  minOrganicBetweenSponsored: 2,
  frequencyCapPerSession: 6,
  scoreSimilarityThreshold: 5
};

export const PAYMENT_CONFIG = {
  currency: 'INR',
  taxPercentage: 18,
  gateway: 'razorpay'
};
