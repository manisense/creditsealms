"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyLoans = exports.applyForLoan = void 0;
const Loan_1 = require("../models/Loan");
const bre_service_1 = require("../services/bre.service");
const loanMath_service_1 = require("../services/loanMath.service");
const r2_1 = require("../utils/r2");
const applyForLoan = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const { panNumber, dateOfBirth, monthlySalary, employmentMode, loanAmount, tenureDays } = req.body;
        const file = req.file;
        // 1. Validate inputs
        if (!panNumber || !dateOfBirth || !monthlySalary || !employmentMode || !loanAmount || !tenureDays || !file) {
            res.status(400).json({ error: 'Missing required fields or salary slip file' });
            return;
        }
        const parsedDob = new Date(dateOfBirth);
        const parsedSalary = parseFloat(monthlySalary);
        const parsedAmount = parseFloat(loanAmount);
        const parsedTenure = parseInt(tenureDays, 10);
        if (parsedAmount < 50000 || parsedAmount > 500000) {
            res.status(400).json({ error: 'Loan amount must be between ₹50,000 and ₹5,00,000' });
            return;
        }
        if (parsedTenure < 30 || parsedTenure > 365) {
            res.status(400).json({ error: 'Tenure must be between 30 and 365 days' });
            return;
        }
        // 2. Upload file to Cloudflare R2
        const salarySlipUrl = await (0, r2_1.uploadFileToR2)(file.buffer, file.originalname, file.mimetype);
        // 3. Run Business Rule Engine (BRE)
        const breResult = (0, bre_service_1.runBusinessRuleEngine)(parsedDob, parsedSalary, employmentMode, panNumber);
        // 4. Calculate Loan Math
        const rate = 12; // 12% fixed
        const { totalRepayment } = (0, loanMath_service_1.calculateLoanMath)(parsedAmount, rate, parsedTenure);
        // 5. Create Loan Record
        const newLoan = new Loan_1.Loan({
            borrowerId: userId,
            panNumber,
            dateOfBirth: parsedDob,
            monthlySalary: parsedSalary,
            employmentMode,
            salarySlipUrl,
            loanAmount: parsedAmount,
            tenureDays: parsedTenure,
            interestRate: rate,
            totalRepayment,
            outstandingBalance: totalRepayment,
            status: breResult.passed ? Loan_1.LoanStatus.PENDING : Loan_1.LoanStatus.REJECTED,
            rejectionReason: breResult.passed ? undefined : breResult.reason
        });
        await newLoan.save();
        if (!breResult.passed) {
            res.status(400).json({
                error: 'Application rejected by Business Rule Engine',
                reason: breResult.reason,
                loanId: newLoan._id
            });
            return;
        }
        res.status(201).json({
            message: 'Loan application submitted successfully',
            loan: newLoan
        });
    }
    catch (error) {
        console.error('Apply for loan error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.applyForLoan = applyForLoan;
const getMyLoans = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const loans = await Loan_1.Loan.find({ borrowerId: userId }).sort({ createdAt: -1 });
        res.status(200).json({ loans });
    }
    catch (error) {
        console.error('Get my loans error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getMyLoans = getMyLoans;
