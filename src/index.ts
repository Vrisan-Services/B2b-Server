import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import projectRoutes from './routes/project.routes';
import userRoutes from './routes/user.routes';
import waitlistRoutes from './routes/waitlist.routes';
import subscriptionRoutes from './routes/subscription.routes';
import paymentRoutes from './routes/payment.routes';
import gstRoutes from './routes/gst.route';
import crmSubscriptionRoutes from './routes/crm-subscription.routes';
import leadRoutes from './routes/lead.routes';
import path from 'path';
import invoiceRoutes from './routes/invoice.routes';
import fs from 'fs';
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
// Serve uploads folder statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/user', userRoutes);
app.use('/api/waitlist', waitlistRoutes);
app.use('/api/subscribe', subscriptionRoutes);
app.use('/api', paymentRoutes);
app.use('/api', gstRoutes);
app.use('/api/crm-subscription', crmSubscriptionRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/invoices', invoiceRoutes);
// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: err.message
  });
});

// Ensure uploads/invoices directory exists
const invoicesDir = path.join(__dirname, '../uploads/invoices');
if (!fs.existsSync(invoicesDir)) {
  fs.mkdirSync(invoicesDir, { recursive: true });
}

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 