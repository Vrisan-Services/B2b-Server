export type PlanType = 'essentials' | 'growth' | 'enterprise';

export interface PlanFeatureAccess {
  projects: number | 'custom';
  areaLimit: string;
  extraCharge: string;
  validityDays: number | 'custom';
  layoutAccess: boolean;
  structuralDrawings: boolean;
  mepDesign: boolean;
  relationshipManager: boolean;
  unifiedTeam: boolean;
  techStackAccess: boolean;
  excessSqFtCarry: boolean;
  pmcToolAccessMonths: number;
  financeSupport: string;
  procurementAccess: string;
}

export interface PlanInfo {
  planName: PlanType;
  subscribedAt: Date;
  expiresAt: Date | 'custom';
  features: PlanFeatureAccess;
}

export interface UserUpdatePayload {
  isSubscribed: boolean;
  planInfo: PlanInfo;
}