import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;
const from = process.env.TWILIO_PHONE_NUMBER!;

const client = twilio(accountSid, authToken);

export const sendSMS = async (to: string, body: string): Promise<boolean> => {
  try {
    await client.messages.create({ body, from, to });
    return true;
  } catch (error) {
    console.error('Twilio SMS error:', error);
    return false;
  }
}; 