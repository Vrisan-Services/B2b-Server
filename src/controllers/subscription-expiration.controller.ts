import { Request, Response } from 'express';
import { checkAndUpdateExpiredSubscriptions, checkAndUpdateExpiredMainSubscriptions, checkAllExpiredSubscriptions } from '../services/subscription-expiration.service';

export const checkExpiredCRMSubscriptions = async (req: Request, res: Response) => {
  try {
    const result = await checkAndUpdateExpiredSubscriptions();
    res.status(200).json({
      message: 'CRM subscription expiration check completed',
      ...result
    });
  } catch (error) {
    console.error('Error in checkExpiredCRMSubscriptions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check expired CRM subscriptions',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const checkExpiredMainSubscriptions = async (req: Request, res: Response) => {
  try {
    const result = await checkAndUpdateExpiredMainSubscriptions();
    res.status(200).json({
      message: 'Main subscription expiration check completed',
      ...result
    });
  } catch (error) {
    console.error('Error in checkExpiredMainSubscriptions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check expired main subscriptions',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const checkAllExpiredSubscriptionsHandler = async (req: Request, res: Response) => {
  try {
    const result = await checkAllExpiredSubscriptions();
    res.status(200).json({
      message: 'All subscription expiration checks completed',
      ...result
    });
  } catch (error) {
    console.error('Error in checkAllExpiredSubscriptionsHandler:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check expired subscriptions',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}; 