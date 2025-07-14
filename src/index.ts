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
import subscriptionExpirationRoutes from './routes/subscription-expiration.routes';
import path from 'path';
import invoiceRoutes from './routes/invoice.routes';
import fs from 'fs';
import { subscriptionCronService } from './services/cron.service';
import designaiRoutes from './routes/designai.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
// Serve uploads folder statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/users', userRoutes);
app.use('/api/waitlist', waitlistRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/gst', gstRoutes);
app.use('/api/crm-subscription', crmSubscriptionRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/subscription-expiration', subscriptionExpirationRoutes);
app.use('/api/invoice', invoiceRoutes);
app.use('/api/designai', designaiRoutes);
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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  
  // Start the subscription expiration cron service
  subscriptionCronService.start();
}); 