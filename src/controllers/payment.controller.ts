import fetch from 'node-fetch';
import { Request, Response } from 'express';

export const createPaymentLink = async (req: Request, res: Response) => {
  const { user, plan, amount } = req.body;
  try {
    // Generate a unique link_id using userId (if available) and timestamp
    const link_id = `link_${user.userId || 'nouser'}_${Date.now()}`;
    const response = await fetch('https://sandbox.cashfree.com/pg/links', {
      method: 'POST',
      headers: {
        'x-api-version': '2022-09-01',
        'x-client-id': 'TEST103227535e02d66617da42de391535722301',
        'x-client-secret': 'cfsk_ma_test_40c4a1584fe88d481b38ec1d130b2801_5f97563d',
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
          return_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/#/payment-success?plan=${plan}`
        }
      })
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create payment link' });
  }
}; 