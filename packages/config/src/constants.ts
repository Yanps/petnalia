/** Maximum service radius a veterinarian can set, in km. */
export const MAX_SERVICE_RADIUS_KM = 200 as const;

/** Default search radius when tutor doesn't specify one, in km. */
export const DEFAULT_SEARCH_RADIUS_KM = 20 as const;

/** Default page size for paginated lists. */
export const DEFAULT_PAGE_SIZE = 20 as const;

/** Maximum page size allowed in API requests. */
export const MAX_PAGE_SIZE = 100 as const;

/** Slot hold duration in minutes (prevents double-booking during checkout). */
export const SLOT_HOLD_MINUTES = 10 as const;

/** Access token TTL in seconds (15 minutes). */
export const ACCESS_TOKEN_TTL_SECONDS = 900 as const;

/** Refresh token TTL in days. */
export const REFRESH_TOKEN_TTL_DAYS = 30 as const;

/** Maximum file size for avatar/photo uploads, in bytes (5 MB). */
export const MAX_PHOTO_SIZE_BYTES = 5_242_880 as const;

/** Maximum file size for CRMV document uploads, in bytes (10 MB). */
export const MAX_DOCUMENT_SIZE_BYTES = 10_485_760 as const;

/** Accepted MIME types for avatar/photo uploads. */
export const ACCEPTED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

/** Accepted MIME types for CRMV document uploads. */
export const ACCEPTED_DOCUMENT_TYPES = ['image/jpeg', 'image/png', 'application/pdf'] as const;

/** Minimum appointment rating (stars). */
export const MIN_RATING = 1 as const;

/** Maximum appointment rating (stars). */
export const MAX_RATING = 5 as const;

/** Subscription prices in cents (BRL). */
export const SUBSCRIPTION_PRICES = {
  monthly: 9900,  // R$ 99,00
  annual: 89900,  // R$ 899,00
} as const;
