export type CampaignStatus = 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';

export interface Campaign {
  id: string;
  brandId: string;
  userId: string;
  name: string;
  status: CampaignStatus;
  // Brief
  objective: string | null;
  audiences: Record<string, unknown>[] | null;
  platforms: string[];
  formats: string[];
  instructions: string | null;
  referenceUrls: string[];
  createdAt: string;
  updatedAt: string;
  brand?: {
    id: string;
    name: string;
  };
}

export interface CampaignBrief {
  objective: string;
  audiences: string[];
  platforms: string[];
  formats: string[];
  instructions?: string;
  referenceUrls?: string[];
}
