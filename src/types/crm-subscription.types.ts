export type PlanType = 'achipreneur' |  'custom';

export interface PlanFeatureAccess {
    
    freshLeadsPerMonth: number;
    welcomeBonusLeads: number;
    crmAccess: boolean;
    proposalsAndInvoicing: boolean;
    loanAssistance: boolean;
    performanceReports: boolean;
    usedLeadsThisMonth?: number; // Number of leads used this month
    remainingLeadsThisMonth?: number; // Number of leads remaining this month
} 

export interface CRMPlanInfo {
  planName: PlanType;
  subscribedAt: Date;
  expiresAt: Date | 'custom';
  features: PlanFeatureAccess;
  leadsUsageHistory?: Array<{
    month: string; // e.g. '2024-06'
    used: number;
    remaining: number;
  }>;
}

export interface UserUpdatePayload {
  isCrmSubscribed: boolean;
  planInfo: CRMPlanInfo;
}