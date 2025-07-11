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
    expiresAt.setDate(subscribedAt.getDate() + 30);
  }

  const CRMplanInfo: CRMPlanInfo = {
    planName: plan,
    subscribedAt,
    expiresAt,
    features: features
  };

  const userQuery = await db.collection('users').where('userId', '==', userId).get();
  if (userQuery.empty) throw new Error('User not found');
  const userDoc = userQuery.docs[0];
  await userDoc.ref.update({
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