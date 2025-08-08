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
  },

  free: {
    name: 'free',
    price: 'free',
    features: {
      freshLeadsPerMonth: 5,
      welcomeBonusLeads: 5,
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
  }
  else if (plan === 'free') {
    expiresAt = new Date();
    expiresAt.setDate(subscribedAt.getDate() + 7); // Free plan lasts for 7 days
  }
  else {
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

  // make free leads available
  db.collection('leads').where('userId', '==', userId).get().then(snapshot => {
    const batch = db.batch();
    snapshot.forEach(doc => {
      const leadData = doc.data();
      if (leadData.viewUpto) {
        batch.update(doc.ref, { viewUpto: null }); // 7 days
      }
    });
    return batch.commit();
  }).catch(error => {
    console.error('Error updating leads:', error);
  });

  return { success: true, plan };
};


export const setFreePlansForRegisteredUsers = async () => {
  const usersSnapshot = await db.collection('users').where('isCrmSubscribed', '==', false).get();

  for (const userDoc of usersSnapshot.docs) {
    const userId = userDoc.data().userId;
    console.log(`Checking user ${userId} for free plan assignment...`);


    // if these users has 5 leads assigned, then they are eligible for free plan, the plan expiry start from 1 week from now

    // check if user has 5 leads assigned
    // Await the leads query and check the number of leads
    const leadsSnapshot = await db.collection('leads').where('userId', '==', userId).limit(5).get();
    if (leadsSnapshot.size < 5) {
      console.log(`User ${userId} does not have enough leads for free plan.`);
      continue; // Skip to the next user if they don't have 5 leads
    }
    console.log(`User ${userId} has 5 leads, assigning free plan.`);
    // User has 5 leads, assign free plan
    console.log(`Assigning free plan to user ${userId} with 5 leads.`);

    // Assign free plan
    // Set the CRM plan info for the user

    const CRMplanInfo: CRMPlanInfo = {
      planName: 'free',
      subscribedAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
      features: PLAN_DETAILS.free.features
    };
    const batch = db.batch();


    batch.update(userDoc.ref, {
      isCrmSubscribed: true,
      CRMplanInfo
    });
    batch.set(db.collection('subscriptions').doc(), {
      userId,
      plan: 'free',
      subscribedAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
      price: 'free',
      features: PLAN_DETAILS.free.features
    });



    await batch.commit();

  }

}