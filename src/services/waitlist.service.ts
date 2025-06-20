import { WaitlistData } from '../types/waitlist.types';
import { sendWaitlistSubmissionEmail } from '../config/email';

export const sendWaitlistEmail = async (email:string ,fullName:string ,formData: WaitlistData): Promise<void> => {
  try {
    
    const emailSent = await sendWaitlistSubmissionEmail(email,fullName,formData);
    if (!emailSent) {
      throw new Error('Failed to send waitlist email');
    }
    console.log('Waitlist email sent successfully.');
  } catch (error) {
    console.error('Error processing waitlist submission:', error);
    throw new Error('Failed to send waitlist email.');
  }
}; 