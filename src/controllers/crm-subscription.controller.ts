import { Request, Response } from 'express';
import * as crmSubscriptionService from '../services/crm-subscription.service';
import { PlanType } from '../types/crm-subscription.types';

export const subscribeToPlan = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body as { userId: string };
    const { plan } = req.params as { plan: PlanType };

    if (!userId || !plan) {
      return res.status(400).json({ success: false, message: 'userId and plan are required.' });
    }

    if (plan !== 'achipreneur' && plan !== 'custom') {
      return res.status(400).json({ message: 'Invalid plan type provided.' });
    }

    const result = await crmSubscriptionService.setUserPlan(userId, plan);

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error in subscribeToPlan:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return res.status(500).json({ success: false, message: 'Internal server error.', error: errorMessage });
  }
};




export const subscribeToFreePlan = async (req: Request, res: Response) => {
  try {
    console.log('subscribeToFreePlan called');
    const result = await crmSubscriptionService.setFreePlansForRegisteredUsers();

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error in subscribeToPlan:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return res.status(500).json({ success: false, message: 'Internal server error.', error: errorMessage });
  }
};
