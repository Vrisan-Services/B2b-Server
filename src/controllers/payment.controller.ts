import fetch from 'node-fetch';
import { Request, Response } from 'express';

export const createPaymentLink = async (req: Request, res: Response) => {
  const { user, plan, amount } = req.body;
 
  try {
    // Generate a unique link_id using userId (if available) and timestamp
    const link_id = `link_${user.userId || 'nouser'}_${Date.now()}`;
    // It is generally safe to use environment variables for server-to-server API calls,
    // as long as you do not expose them to the client/browser.
    // Here, the env vars are only used on the server side and not sent to the frontend.

    const paymentUrl = process.env.PAYMENT_CASHFREE_URL;
    const clientId = process.env.PAYMENT_CASHFREE_APP_ID;
    const clientSecret = process.env.PAYMENT_CASHFREE_SECRET;
    const frontendUrl = 'http://localhost:5173';

    if (!paymentUrl || !clientId || !clientSecret) {
      throw new Error('Payment provider environment variables are not set');
    }

    const response = await fetch(paymentUrl, {
      method: 'POST',
      headers: {
        'x-api-version': '2022-09-01',
        'x-client-id': clientId,
        'x-client-secret': clientSecret,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        customer_details: {
          customer_email: user.email,
          customer_name: user.name,
          customer_phone: user.phone || '9999999999'
        },
        link_amount: amount,
        link_currency: "INR",
        link_purpose: `Subscription for ${plan}`,
        link_id,
        link_notify: {
          send_email: true,
          send_sms: false
        },
        link_meta: {
          return_url: `${frontendUrl}/#/payment-success?plan=${plan}`
        }
      })
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: 'Failed to create payment link' });
  }
}; 
