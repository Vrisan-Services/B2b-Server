import { Request, Response } from 'express';
import { db } from '../config/firebase';


export const gstVerification = async (req: Request, res: Response) => {

    try {
        const { GSTIN, business_name } = req.body;

        // Validate required fields
        if (!GSTIN) {
            return res.status(400).json({
                success: false,
                message: 'GSTIN is required'
            });
        }

        const options = {
            method: 'POST',
            headers: {
                'x-client-id': process.env.GST_CASHFREE_CLIENT_ID || '',
                'x-client-secret': process.env.GST_CASHFREE_CLIENT_SECRET || '',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                GSTIN: GSTIN,
                business_name: business_name || ''
            })
        };

        const response = await fetch('https://sandbox.cashfree.com/verification/gstin', options);

        if (!response.ok) {
            throw new Error(`API request failed with status: ${response.status}`);
        }

        const data = await response.json();

        if (data.valid) {
            const usersRef = db.collection('users');
            const snapshot = await usersRef.where('gstNumber', '==', GSTIN).get();

            if (!snapshot.empty) {
                snapshot.forEach(doc => {
                    doc.ref.update({ gstVerified: true });
                });
            }
        }

        return res.status(200).json({
            success: true,
            data: data
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: 'Internal server error during GST verification',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
