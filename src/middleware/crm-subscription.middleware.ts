import { Request, Response, NextFunction } from 'express';
import { db } from '../config/firebase';

export const validateCRMSubscription = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.body.userId || req.params.userId;
    
    if (!userId) {
      return res.status(400).json({ 
        error: 'User ID is required',
        details: 'userId must be provided in request body or params'
      });
    }
    
    const userQuery = await db.collection('users').where('userId', '==', userId).get();
    if (userQuery.empty) {
      return res.status(404).json({ 
        error: 'User not found',
        details: 'No user found with the provided userId'
      });
    }
    
    const userData = userQuery.docs[0].data();
    
    // Check if user has CRM subscription
    if (!userData.isCrmSubscribed) {
      return res.status(403).json({ 
        error: 'CRM subscription required',
        details: 'You need an active CRM subscription to access this feature'
      });
    }
    
    // Check if CRM subscription has expired
    if (userData.CRMplanInfo && userData.CRMplanInfo.expiresAt !== 'custom') {
      const expiresAt = new Date(userData.CRMplanInfo.expiresAt);
      if (expiresAt < new Date()) {
        // Update user status to reflect expired subscription
        await userQuery.docs[0].ref.update({ 
          isCrmSubscribed: false,
          updatedAt: new Date()
        });
        
        return res.status(403).json({ 
          error: 'CRM subscription has expired',
          details: 'Your CRM subscription has expired. Please renew to continue accessing CRM features.'
        });
      }
    }
    
    // Add user data to request for use in controllers
    (req as any).userData = userData;
    next();
  } catch (error) {
    console.error('Error in CRM subscription middleware:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: 'Failed to validate CRM subscription'
    });
  }
};

export const validateMainSubscription = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.body.userId || req.params.userId;
    
    if (!userId) {
      return res.status(400).json({ 
        error: 'User ID is required',
        details: 'userId must be provided in request body or params'
      });
    }
    
    const userQuery = await db.collection('users').where('userId', '==', userId).get();
    if (userQuery.empty) {
      return res.status(404).json({ 
        error: 'User not found',
        details: 'No user found with the provided userId'
      });
    }
    
    const userData = userQuery.docs[0].data();
    
    // Check if user has main subscription
    if (!userData.isSubscribed) {
      return res.status(403).json({ 
        error: 'Subscription required',
        details: 'You need an active subscription to access this feature'
      });
    }
    
    // Check if main subscription has expired
    if (userData.planInfo && userData.planInfo.expiresAt !== 'custom') {
      const expiresAt = new Date(userData.planInfo.expiresAt);
      if (expiresAt < new Date()) {
        // Update user status to reflect expired subscription
        await userQuery.docs[0].ref.update({ 
          isSubscribed: false,
          updatedAt: new Date()
        });
        
        return res.status(403).json({ 
          error: 'Subscription has expired',
          details: 'Your subscription has expired. Please renew to continue accessing premium features.'
        });
      }
    }
    
    // Add user data to request for use in controllers
    (req as any).userData = userData;
    next();
  } catch (error) {
    console.error('Error in main subscription middleware:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: 'Failed to validate subscription'
    });
  }
}; 