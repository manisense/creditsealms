import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

import authRoutes from './routes/auth.routes';
import loanRoutes from './routes/loan.routes';

app.use('/api/auth', authRoutes);
app.use('/api/loans', loanRoutes);

app.get('/', (req, res) => {
  res.send('CreditSea LMS API is running');
});

mongoose.connect(process.env.MONGODB_URI as string)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });
