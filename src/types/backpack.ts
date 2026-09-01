export interface BackpackColorway {
  name: string;
  hex: string;
  isPopular?: boolean;
}

export interface ReviewScore {
  score: number;       // e.g. 4.8 or 9.5
  maxScore: number;    // e.g. 5.0 or 10.0
  sourceName?: string; // e.g. "Pack Hacker", "Carryology", "Verified Buyers"
  reviewCount?: number;
}

export interface BackpackItem {
  id: string;
  brand: string;
  name: string;
  capacityLiters: number;
  lowestPriceUSD: number;
  primaryRetailer: string;
  review: ReviewScore;
  colorways: BackpackColorway[];
  images: string[];
  description?: string;
  material?: string;
  dimensions?: string;
  weightKg?: number;
  features?: string[];
  contrastFallback?: '#FFFFFF' | '#000000';
}

export type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'rating-desc' | 'capacity-desc' | 'brand-asc';
