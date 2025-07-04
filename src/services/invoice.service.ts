// This file is now obsolete as invoice logic is handled in the controller with Firestore.
// You can remove this file if not used elsewhere.

import { Invoice } from '../types/invoice.types';
import { invoices } from '../data/invoices';
import { v4 as uuidv4 } from 'uuid';

export const addInvoice = (invoice: Omit<Invoice, 'id' | 'uploadedAt'>): Invoice => {
  const newInvoice: Invoice = {
    ...invoice,
    id: uuidv4(),
    uploadedAt: new Date(),
  };
  invoices.push(newInvoice);
  return newInvoice;
};

export const getAllInvoices = (): Invoice[] => {
  return invoices;
}; 