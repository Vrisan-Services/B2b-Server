import { db } from '../config/firebase';
import { CRMPlanInfo, PlanType, PlanFeatureAccess } from '../types/crm-subscription.types';

const PLAN_DETAILS: Record<PlanType, { name: string; price: number | string; features: PlanFeatureAccess }> = {
    achipreneur: {
    name: 'Achipreneur',
    price: 4999,
    features: {
      freshLeadsPerMonth: 15,
      welcomeBonusLeads: 5,
      crmAccess: true,
      proposalsAndInvoicing: true,
      loanAssistance: true,
      performanceReports: true
    }
  },
 
  custom: {
    name: 'custom',
    price: 'custom',
    features: {
      freshLeadsPerMonth: 40,
      welcomeBonusLeads: 10,
      crmAccess: true,
      proposalsAndInvoicing: true,
      loanAssistance: true,
      performanceReports: true
    }
  }
};

export const setUserPlan = async (
  userId: string,
  plan: PlanType
) => {
  const planDetails = PLAN_DETAILS[plan];
  const features = { ...planDetails.features };

  const subscribedAt = new Date();
  let expiresAt: Date | 'custom';

  if (plan === 'custom') {
    expiresAt = 'custom';
  } else {
    expiresAt = new Date();
    expiresAt.setDate(subscribedAt.getDate() + 365);
  }

  const CRMplanInfo: CRMPlanInfo = {
    planName: plan,
    subscribedAt,
    expiresAt,
    features: features
  };

  await db.collection('users').doc(userId).update({
    isCrmSubscribed: true,
    CRMplanInfo
  });

  await db.collection('subscriptions').add({
    userId,
    plan,
    subscribedAt,
    expiresAt,
    price: planDetails.price,
    features: features
  });

  return { success: true, plan };
};