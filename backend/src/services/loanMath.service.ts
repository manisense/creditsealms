export const calculateLoanMath = (principal: number, rate: number, tenureDays: number) => {
  // Simple Interest: SI = (P × R × T) / (365 × 100)
  const simpleInterest = (principal * rate * tenureDays) / (365 * 100);
  
  // Total Repayment = P + SI
  const totalRepayment = principal + simpleInterest;

  return {
    simpleInterest: parseFloat(simpleInterest.toFixed(2)),
    totalRepayment: parseFloat(totalRepayment.toFixed(2))
  };
};
