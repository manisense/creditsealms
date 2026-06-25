"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateLoanMath = void 0;
const calculateLoanMath = (principal, rate, tenureDays) => {
    // Simple Interest: SI = (P × R × T) / (365 × 100)
    const simpleInterest = (principal * rate * tenureDays) / (365 * 100);
    // Total Repayment = P + SI
    const totalRepayment = principal + simpleInterest;
    return {
        simpleInterest: parseFloat(simpleInterest.toFixed(2)),
        totalRepayment: parseFloat(totalRepayment.toFixed(2))
    };
};
exports.calculateLoanMath = calculateLoanMath;
