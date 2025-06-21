import { db } from '../config/firebase';
import { PlanInfo, PlanType } from '../types/subscription.types';

const PLAN_DETAILS: Record<PlanType, any> = {
  essentials: {
    name: 'Essentials',
    price: 25000,
    features: {
      projects: 3,
      areaLimit: 'Up to 6,000 sq. ft.',
      extraCharge: '₹3/sq. ft. above limit',
      validityDays: 365,
      layoutAccess: true,
      structuralDrawings: true,
      mepDesign: true,
      relationshipManager: true,
      unifiedTeam: true,
      techStackAccess: true,
      excessSqFtCarry: true,
      pmcToolAccessMonths: 1,
      financeSupport: 'Construction Project Financing, Home loan, Loan against property',
      procurementAccess: 'Selective Products & cities'
    }
  },
  growth: {
    name: 'Growth',
    price: 50000,
    features: {
      projects: 6,
      areaLimit: 'Up to 15,000 sq. ft.',
      extraCharge: '₹2/sq. ft. above limit',
      validityDays: 365,
      layoutAccess: true,
      structuralDrawings: true,
      mepDesign: true,
      relationshipManager: true,
      unifiedTeam: true,
      techStackAccess: true,
      excessSqFtCarry: true,
      pmcToolAccessMonths: 2,
      financeSupport: 'Construction Project Financing, Home loan, Loan against property + Invoice discounting',
      procurementAccess: 'Access to mutiple products & Brands'
    }
  },
  enterprise: {
    name: 'Enterprise',
    price: 'custom',
    features: {
      projects: 'custom',
      areaLimit: '15,000+ sq. ft.',
      extraCharge: 'As applicable',
      validityDays: 'custom',
      layoutAccess: true,
      structuralDrawings: true,
      mepDesign: true,
      relationshipManager: true,
      unifiedTeam: true,
      techStackAccess: true,
      excessSqFtCarry: true,
      pmcToolAccessMonths: 3,
      financeSupport: 'Construction Project Financing, Home loan, Loan against property + Invoice discounting',
      procurementAccess: 'Access to mutiple products & Brands'
    }
  }
};

export const setUserPlan = async (
  userId: string,
  plan: PlanType,
  options?: { projects: number; validityDays: number }
) => {
  const planDetails = PLAN_DETAILS[plan];
  const features = { ...planDetails.features };

  if (plan === 'enterprise' && options) {
    features.projects = options.projects;
    features.validityDays = options.validityDays;
  }

  const subscribedAt = new Date();
  let expiresAt: Date | 'custom';

  if (features.validityDays === 'custom') {
    expiresAt = 'custom';
  } else {
    expiresAt = new Date();
    expiresAt.setDate(subscribedAt.getDate() + (features.validityDays as number));
  }

  const planInfo: PlanInfo = {
    planName: plan,
    subscribedAt,
    expiresAt,
    features: features
  };

  await db.collection('users').doc(userId).update({
    isSubscribed: true,
    planInfo
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