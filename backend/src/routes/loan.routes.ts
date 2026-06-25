import { Router } from 'express';
import multer from 'multer';
import { applyForLoan, getMyLoans } from '../controllers/loan.controller';
import { authenticate, requireRole } from '../middlewares/auth';
import { Role } from '../models/User';

const router = Router();

// Multer config: memory storage, max 5MB, PDF/JPG/PNG only
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('Invalid file type. Only PDF, JPG, and PNG are allowed.'));
    }
    cb(null, true);
  }
});

// All loan routes require authentication and Borrower role
router.use(authenticate);
router.use(requireRole([Role.Borrower]));

router.post('/apply', upload.single('salarySlip'), applyForLoan);
router.get('/my-loans', getMyLoans);

export default router;
