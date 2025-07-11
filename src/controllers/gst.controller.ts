import { Request, Response } from 'express';
import { db } from '../config/firebase';

export const gstVerification = async (req: Request, res: Response) => {
    try {
        const { GSTIN, business_name } = req.body;

        if (!GSTIN) {
            return res.status(400).json({
                success: false,
                message: 'GSTIN is required'
            });
        }

        const url = process.env.GST_CASHFREE_URL || 'https://sandbox.cashfree.com/verification/gstin';

        const options = {
            method: 'POST',
            headers: {
                'x-client-id': process.env.GST_CASHFREE_CLIENT_ID || '',
                'x-client-secret': process.env.GST_CASHFREE_CLIENT_SECRET || '',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                GSTIN,
                business_name: business_name || ''
            })
        };

        const response = await fetch(url, options);

        if (!response.ok) {
            let errorText = await response.text();

            let errorMessage = errorText;
            try {
                const errorObj = JSON.parse(errorText);
                if (errorObj && errorObj.message) {
                    errorMessage = errorObj.message;
                }
            } catch (e) {
                // Not JSON, keep errorText as is
            }

            return res.status(response.status).json({
                success: false,
                message: errorMessage || `API request failed with status: ${response.status}`
            });
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
            data
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error during GST verification',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
