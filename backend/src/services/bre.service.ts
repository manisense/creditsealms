import { EmploymentMode } from '../models/Loan';

export interface BREResult {
  passed: boolean;
  reason?: string;
}

export const runBusinessRuleEngine = (
  dateOfBirth: Date,
  monthlySalary: number,
  employmentMode: EmploymentMode,
  panNumber: string
): BREResult => {
  // 1. Age check
  const today = new Date();
  let age = today.getFullYear() - dateOfBirth.getFullYear();
  const m = today.getMonth() - dateOfBirth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dateOfBirth.getDate())) {
    age--;
  }
  
  if (age < 23 || age > 50) {
    return { passed: false, reason: `Age must be between 23 and 50. Calculated age is ${age}.` };
  }

  // 2. Salary check
  if (monthlySalary < 25000) {
    return { passed: false, reason: 'Monthly salary must be at least ₹25,000.' };
  }

  // 3. Employment check
  if (employmentMode === EmploymentMode.Unemployed) {
    return { passed: false, reason: 'Unemployed individuals are not eligible for a loan.' };
  }

  // 4. PAN format check
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  if (!panRegex.test(panNumber)) {
    return { passed: false, reason: 'Invalid PAN format. Must be 5 letters, 4 numbers, 1 letter.' };
  }

  return { passed: true };
};
