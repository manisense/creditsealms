import mongoose, { Document, Schema } from 'mongoose';

export enum EmploymentMode {
  Salaried = 'Salaried',
  SelfEmployed = 'Self-Employed',
  Unemployed = 'Unemployed'
}

export enum LoanStatus {
  REGISTERED = 'REGISTERED',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  DISBURSED = 'DISBURSED',
  CLOSED = 'CLOSED'
}

export interface ILoan extends Document {
  borrowerId: mongoose.Types.ObjectId;
  panNumber: string;
  dateOfBirth: Date;
  monthlySalary: number;
  employmentMode: EmploymentMode;
  salarySlipUrl: string;
  loanAmount: number;
  tenureDays: number;
  interestRate: number;
  totalRepayment: number;
  status: LoanStatus;
  rejectionReason?: string;
  outstandingBalance: number;
  createdAt: Date;
  updatedAt: Date;
}

const loanSchema = new Schema<ILoan>({
  borrowerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  panNumber: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  monthlySalary: { type: Number, required: true },
  employmentMode: { type: String, enum: Object.values(EmploymentMode), required: true },
  salarySlipUrl: { type: String, required: true },
  loanAmount: { type: Number, required: true },
  tenureDays: { type: Number, required: true },
  interestRate: { type: Number, default: 12 },
  totalRepayment: { type: Number, required: true },
  status: { type: String, enum: Object.values(LoanStatus), default: LoanStatus.PENDING },
  rejectionReason: { type: String },
  outstandingBalance: { type: Number, required: true }
}, { timestamps: true });

export const Loan = mongoose.model<ILoan>('Loan', loanSchema);
