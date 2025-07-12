import { db } from '../config/firebase';

export const checkAndUpdateExpiredSubscriptions = async () => {
  try {
    console.log('Checking for expired CRM subscriptions...');
    
    const usersSnapshot = await db.collection('users')
      .where('isCrmSubscribed', '==', true)
      .get();
    
    const batch = db.batch();
    let expiredCount = 0;
    
    usersSnapshot.docs.forEach(doc => {
      const userData = doc.data();
      if (userData.CRMplanInfo && userData.CRMplanInfo.expiresAt !== 'custom') {
        const expiresAt = new Date(userData.CRMplanInfo.expiresAt);
        if (expiresAt < new Date()) {
          batch.update(doc.ref, { 
            isCrmSubscribed: false,
            updatedAt: new Date()
          });
          expiredCount++;
          console.log(`Marking user ${userData.userId} CRM subscription as expired`);
        }
      }
    });
    
    if (expiredCount > 0) {
      await batch.commit();
      console.log(`Updated ${expiredCount} expired CRM subscriptions`);
    } else {
      console.log('No expired CRM subscriptions found');
    }
    
    return { success: true, expiredCount };
  } catch (error) {
    console.error('Error checking expired subscriptions:', error);
    throw new Error(`Failed to check expired subscriptions: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const checkAndUpdateExpiredMainSubscriptions = async () => {
  try {
    console.log('Checking for expired main subscriptions...');
    
    const usersSnapshot = await db.collection('users')
      .where('isSubscribed', '==', true)
      .get();
    
    const batch = db.batch();
    let expiredCount = 0;
    
    usersSnapshot.docs.forEach(doc => {
      const userData = doc.data();
      if (userData.planInfo && userData.planInfo.expiresAt !== 'custom') {
        const expiresAt = new Date(userData.planInfo.expiresAt);
        if (expiresAt < new Date()) {
          batch.update(doc.ref, { 
            isSubscribed: false,
            updatedAt: new Date()
          });
          expiredCount++;
          console.log(`Marking user ${userData.userId} main subscription as expired`);
        }
      }
    });
    
    if (expiredCount > 0) {
      await batch.commit();
      console.log(`Updated ${expiredCount} expired main subscriptions`);
    } else {
      console.log('No expired main subscriptions found');
    }
    
    return { success: true, expiredCount };
  } catch (error) {
    console.error('Error checking expired main subscriptions:', error);
    throw new Error(`Failed to check expired main subscriptions: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const checkAllExpiredSubscriptions = async () => {
  try {
    const [crmResult, mainResult] = await Promise.all([
      checkAndUpdateExpiredSubscriptions(),
      checkAndUpdateExpiredMainSubscriptions()
    ]);
    
    return {
      success: true,
      crm: crmResult,
      main: mainResult
    };
  } catch (error) {
    console.error('Error checking all expired subscriptions:', error);
    throw error;
  }
}; 