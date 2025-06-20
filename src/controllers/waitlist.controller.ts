import { Request, Response } from 'express';
import { sendWaitlistEmail } from '../services/waitlist.service';

export const submitWaitlist = async (req: Request, res: Response) => {
    console.log("this the body" + req.body)
  try {
    // TODO: Add validation for the request body
    const { email, fullName, ...rest } = req.body;
    const formData = { email, fullName, ...rest };
    await sendWaitlistEmail(email, fullName, formData);
    res.status(200).json({
      success: true,
      message: 'Thank you for joining the waitlist! We will be in touch shortly.',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'An error occurred while submitting your request. Please try again later.',
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    });
  }
}; 