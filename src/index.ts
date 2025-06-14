import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { signup, login } from './controllers/auth.controller';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.post('/api/auth/signup', signup);
app.post('/api/auth/login', login);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: err.message
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 