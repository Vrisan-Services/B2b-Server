import fetch from 'node-fetch';
import { Request, Response } from 'express';

export const createPaymentLink = async (req: Request, res: Response) => {
  const { user, plan, amount } = req.body;

  try {
    // Generate a unique reference_id using userId (if available) and timestamp, max 40 chars
    const userIdShort = (user.userId || 'nouser').toString().slice(0, 16); // max 16 chars
    const reference_id = `lnk_${userIdShort}_${Date.now().toString().slice(-8)}`.slice(0, 40);

    const paymentUrl = (process.env.BASE_RZP_URL || 'https://api.razorpay.com/v1') + '/payment_links';
    const keyId = process.env.RZP_KEY_ID;
    const keySecret = process.env.RZP_KEY_SECRET;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    if (!paymentUrl || !keyId || !keySecret) {
      throw new Error('Razorpay environment variables are not set');
    }

    // Razorpay expects amount in paise (integer)
    const amountPaise = Math.round(Number(amount) * 100);

    const body = {
      amount: amountPaise,
      currency: 'INR',
      accept_partial: false,
      reference_id,
      description: `Subscription for ${plan}`,
      customer: {
        name: user.name,
        email: user.email,
        contact: user.phone || '9999999999',
      },
      notify: {
        sms: false,
        email: true,
      },
      callback_url: `${frontendUrl}/#/payment-success?plan=${plan}`,
      callback_method: 'get',
    };

    const response = await fetch(paymentUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64'),
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: data.error || 'Failed to create payment link' });
    }
    // Return the payment link as link_url for frontend compatibility
    res.json({ ...data, link_url: data.short_url });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Failed to create payment link' });
  }
};

export const verifyPayment = async (req: Request, res: Response) => {
  const { paymentId } = req.body;
  try {
    const paymentUrl = `${process.env.BASE_RZP_URL}/payments/${paymentId}`;
    const keyId = process.env.RZP_KEY_ID;
    const keySecret = process.env.RZP_KEY_SECRET;
    if (!paymentId || !keyId || !keySecret) {
      return res.status(400).json({ success: false, message: 'Missing paymentId or Razorpay credentials' });
    }
    const response = await fetch(paymentUrl, {
      method: 'GET',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64'),
      },
    });
    const data = await response.json();
    if (response.ok && (data.status === 'captured' || data.status === 'authorized')) {
      return res.json({ success: true, payment: data });
    } else {
      return res.json({ success: false, payment: data });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Payment verification failed' });
  }
}; 
