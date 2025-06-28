export type PlanType = 'achipreneur' |  'custom';

export interface PlanFeatureAccess {
    
    freshLeadsPerMonth: number;
    welcomeBonusLeads: number;
    crmAccess: boolean;
    proposalsAndInvoicing: boolean;
    loanAssistance: boolean;
    performanceReports: boolean;
  } 

export interface CRMPlanInfo {
  planName: PlanType;
  subscribedAt: Date;
  expiresAt: Date | 'custom';
  features: PlanFeatureAccess;
}

export interface UserUpdatePayload {
  isCrmSubscribed: boolean;
  planInfo: CRMPlanInfo;
}