import { Request, Response } from 'express';
import { addInvoice, getAllInvoices } from '../services/invoice.service';
import path from 'path';
import { storage, db } from '../config/firebase';
import { v4 as uuidv4 } from 'uuid';
import { Invoice } from '../types/invoice.types';
import fs from 'fs';

export const uploadInvoice = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    const { userId, leadId, meta } = req.body;
    const localFilePath = req.file.path;
    const bucket = storage.bucket();
    const destination = `invoices/${uuidv4()}-${req.file.originalname}`;
    await bucket.upload(localFilePath, {
      destination,
      metadata: {
        contentType: req.file.mimetype,
      },
    });
    // Remove local file after upload
    fs.unlinkSync(localFilePath);
    // Get public URL
    const fileRef = bucket.file(destination);
    await fileRef.makePublic();
    const fileUrl = fileRef.publicUrl();
    const invoice: Omit<Invoice, 'id' | 'uploadedAt'> = {
      userId,
      fileUrl,
      fileName: req.file.originalname,
      leadId,
      meta: meta ? JSON.parse(meta) : undefined,
    };
    // Save to Firestore
    const docRef = await db.collection('invoices').add({
      ...invoice,
      uploadedAt: new Date(),
    });
    const savedInvoice: Invoice = {
      id: docRef.id,
      ...invoice,
      uploadedAt: new Date(),
    };
    res.status(201).json({ success: true, data: savedInvoice });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error uploading invoice', error });
  }
};

export const getInvoices = async (req: Request, res: Response) => {
  try {
    const snapshot = await db.collection('invoices').get();
    const invoices: Invoice[] = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        fileUrl: data.fileUrl,
        fileName: data.fileName,
        leadId: data.leadId,
        meta: data.meta,
        uploadedAt: data.uploadedAt?.toDate ? data.uploadedAt.toDate() : data.uploadedAt,
      };
    });
    res.json({ success: true, data: invoices });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching invoices', error });
  }
}; 