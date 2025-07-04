import express from 'express';
import multer from 'multer';
import path from 'path';
import { uploadInvoice, getInvoices } from '../controllers/invoice.controller';

const router = express.Router();

// Set up multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads/invoices'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// POST /api/invoices/upload
router.post('/upload', upload.single('file'), uploadInvoice);

// GET /api/invoices
router.get('/', getInvoices);

export default router; 