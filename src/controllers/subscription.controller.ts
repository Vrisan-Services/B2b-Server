import { Request, Response } from 'express';
import { setUserPlan } from '../services/subscription.service';
import { PlanType } from '../types/subscription.types';

export const handleSubscription = async (req: Request, res: Response) => {
  const { userId, projects, validityDays } = req.body;
  const plan = req.params.plan as PlanType;

  if (!userId) return res.status(400).json({ error: 'Missing userId' });

  try {
    if (plan === 'enterprise') {
      if (!projects || !validityDays) {
        return res
          .status(400)
          .json({ error: 'For the enterprise plan, `projects` and `validityDays` are required in the request body.' });
      }
      const result = await setUserPlan(userId, plan, { projects, validityDays });
      return res.status(200).json(result);
    }

    const result = await setUserPlan(userId, plan);
    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const handleUpdateSubscription = async (req: Request, res: Response) => {
  const { userId, projects, validityDays } = req.body;
  const plan = req.params.plan as PlanType;

  if (!userId) return res.status(400).json({ error: 'Missing userId' });

  try {
    if (plan === 'enterprise') {
      if (!projects || !validityDays) {
        return res
          .status(400)
          .json({ error: 'For the enterprise plan, `projects` and `validityDays` are required in the request body.' });
      }
      const result = await setUserPlan(userId, plan, { projects, validityDays });
      return res.status(200).json(result);
    }

    const result = await setUserPlan(userId, plan);
    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};