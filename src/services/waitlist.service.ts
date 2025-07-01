import { WaitlistData } from '../types/waitlist.types';

import { appendWaitlistToSheet, sendSheetLinkToAdmin } from '../utils/googleSheets';

export const sendWaitlistEmail = async (email:string ,fullName:string ,formData: WaitlistData): Promise<void> => {
  try {
    
    
    await appendWaitlistToSheet(formData);
    console.log('Waitlist email sent and data added to Google Sheet.');
    await sendSheetLinkToAdmin();
  } catch (error) {
    console.error('Error processing waitlist submission:', error);
    throw new Error('Failed to send waitlist email.');
  }
}; 