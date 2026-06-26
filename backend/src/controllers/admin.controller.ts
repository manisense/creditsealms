import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { Loan, LoanStatus } from '../models/Loan';
import { Payment } from '../models/Payment';
import { Role, User } from '../models/User';

export const getLoans = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.query;
    const filter = status ? { status: status as LoanStatus } : {};
    
    // Handle REGISTERED status for Sales role
    if (status === LoanStatus.REGISTERED || req.user?.role === Role.Sales) {
      const borrowersWithLoans = await Loan.find().distinct('borrowerId');
      const registeredUsers = await User.find({
        role: Role.Borrower,
        _id: { $nin: borrowersWithLoans }
      });
      
      const mockLoans = registeredUsers.map(user => ({
        _id: user._id, // mock loan ID
        borrowerId: { _id: user._id, name: user.name, email: user.email },
        panNumber: 'PENDING',
        loanAmount: 0,
        tenureDays: 0,
        status: LoanStatus.REGISTERED,
        outstandingBalance: 0,
        totalRepayment: 0,
        createdAt: user.createdAt
      }));

      if (status === LoanStatus.REGISTERED) {
         res.status(200).json({ loans: mockLoans });
         return;
      } else {
         const loans = await Loan.find(filter).populate('borrowerId', 'name email').sort({ createdAt: -1 });
         res.status(200).json({ loans: [...mockLoans, ...loans] });
         return;
      }
    }

    const loans = await Loan.find(filter).populate('borrowerId', 'name email').sort({ createdAt: -1 });
    res.status(200).json({ loans });
  } catch (error) {
    console.error('Get loans error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateLoanStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { loanId } = req.params;
    const { status, rejectionReason } = req.body;
    const userRole = req.user?.role;

    const loan = await Loan.findById(loanId);
    if (!loan) {
      res.status(404).json({ error: 'Loan not found' });
      return;
    }

    // Role-based status transition checks
    if (userRole === Role.Sanction) {
      if (![LoanStatus.APPROVED, LoanStatus.REJECTED].includes(status)) {
        res.status(403).json({ error: 'Sanction can only Approve or Reject' });
        return;
      }
    } else if (userRole === Role.Disbursement) {
      if (status !== LoanStatus.DISBURSED) {
        res.status(403).json({ error: 'Disbursement can only mark as Disbursed' });
        return;
      }
      if (loan.status !== LoanStatus.APPROVED) {
        res.status(400).json({ error: 'Loan must be APPROVED before disbursement' });
        return;
      }
    } else if (userRole !== Role.Admin) {
      res.status(403).json({ error: 'Unauthorized role for this action' });
      return;
    }

    loan.status = status;
    if (status === LoanStatus.REJECTED && rejectionReason) {
      loan.rejectionReason = rejectionReason;
    }

    await loan.save();
    res.status(200).json({ message: 'Loan status updated', loan });
  } catch (error) {
    console.error('Update loan status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const recordPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { loanId } = req.params;
    const { amount, paymentDate, utrNumber } = req.body;
    const userId = req.user?.id;

    if (!amount || !paymentDate || !utrNumber) {
      res.status(400).json({ error: 'Amount, date, and UTR number are required' });
      return;
    }

    const loan = await Loan.findById(loanId);
    if (!loan) {
      res.status(404).json({ error: 'Loan not found' });
      return;
    }

    if (loan.status !== LoanStatus.DISBURSED) {
      res.status(400).json({ error: 'Payments can only be recorded for DISBURSED loans' });
      return;
    }

    const paymentAmount = parseFloat(amount);
    
    if (paymentAmount > loan.outstandingBalance) {
      res.status(400).json({ error: 'Payment amount exceeds outstanding balance' });
      return;
    }
    
    // Record the payment
    const payment = new Payment({
      loanId,
      amount: paymentAmount,
      paymentDate: new Date(paymentDate),
      utrNumber,
      recordedBy: userId
    });
    await payment.save();

    // Update loan balance
    loan.outstandingBalance = Math.max(0, loan.outstandingBalance - paymentAmount);
    
    // Auto-closure check
    if (loan.outstandingBalance <= 0) {
      loan.status = LoanStatus.CLOSED;
    }

    await loan.save();

    res.status(201).json({ 
      message: 'Payment recorded successfully', 
      payment, 
      loan 
    });
  } catch (error: any) {
    console.error('Record payment error:', error);
    if (error.code === 11000) {
      res.status(400).json({ error: 'UTR number already exists' });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};
