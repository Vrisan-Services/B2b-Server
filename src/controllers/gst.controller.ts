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

        if (data.valid || data.success === true) {
            const usersRef = db.collection('users');
            const snapshot = await usersRef.where('gstNumber', '==', GSTIN).get();

            let updatedUserData = null;
            if (!snapshot.empty) {
                for (const doc of snapshot.docs) {
                    // Prepare address object from GST data
                    const split = data.principal_place_split_address || {};
                    const addressObj = {
                        address1: data.principal_place_address || '',
                        address2: split.street || '',
                        city: split.location || split.city || '',
                        state: split.state || '',
                        pincode: split.pincode || '',
                        isDefault: true,
                        updatedAt: new Date().toISOString(),
                        createdAt: new Date().toISOString(),
                    };
                    // Update orgName and addresses
                    await doc.ref.update({
                        gstVerified: true,
                        orgName: data.legal_name_of_business || data.trade_name_of_business || '',
                        addresses: [addressObj],
                    });
                    // Fetch the updated user data
                    const updatedDoc = await doc.ref.get();
                    updatedUserData = updatedDoc.data();
                }
            }
            return res.status(200).json({
                success: true,
                data: data,
                user: updatedUserData, // include updated user
            });
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
