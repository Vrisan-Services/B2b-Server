import fetch from 'node-fetch';
import { Request, Response } from 'express';

export const createPaymentLink = async (req: Request, res: Response) => {
  const { user, plan, amount } = req.body;
 
  try {
    // Generate a unique link_id using userId (if available) and timestamp
    const link_id = `link_${user.userId || 'nouser'}_${Date.now()}`;
    const response = await fetch('https://api.cashfree.com/pg/links', {
      method: 'POST',
      headers: {
        'x-api-version': '2022-09-01',
        'x-client-id': process.env.PAYMENT_CASHFREE_APP_ID || '',
        'x-client-secret': process.env.PAYMENT_CASHFREE_SECRET || '',
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
          return_url: `${process.env.FRONTEND_URL || 'https://b2b-dashboard.designelementary.com'}/#/payment-success?plan=${plan}`
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
