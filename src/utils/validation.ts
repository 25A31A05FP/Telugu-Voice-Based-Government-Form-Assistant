/**
 * Form field validation rules and normalizers for Telugu Voice Form Assistant
 */

export interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
  normalizedValue?: string;
}

export function validateAadhaarLast4(input: string): ValidationResult {
  const digitsOnly = input.replace(/\D/g, '');
  if (!digitsOnly) {
    return { isValid: false, errorMessage: 'Aadhaar last 4 digits are required' };
  }
  // Check if exactly 4 digits or if user said/typed a full number and we extract the last 4
  if (digitsOnly.length === 4) {
    return { isValid: true, normalizedValue: digitsOnly };
  }
  if (digitsOnly.length > 4) {
    const last4 = digitsOnly.slice(-4);
    return { isValid: true, normalizedValue: last4 };
  }
  return { isValid: false, errorMessage: 'Please provide at least 4 digits for Aadhaar' };
}

export function validateMobileNumber(input: string): ValidationResult {
  const digitsOnly = input.replace(/\D/g, '');
  if (!digitsOnly) {
    return { isValid: false, errorMessage: 'Mobile number is required' };
  }
  // Indian mobile numbers typically 10 digits (ignoring leading +91 or 0)
  let standard = digitsOnly;
  if (standard.startsWith('91') && standard.length === 12) {
    standard = standard.slice(2);
  } else if (standard.startsWith('0') && standard.length === 11) {
    standard = standard.slice(1);
  }

  if (standard.length === 10 && /^[6-9]\d{9}$/.test(standard)) {
    return { isValid: true, normalizedValue: standard };
  }
  return { isValid: false, errorMessage: 'Enter a valid 10-digit Indian mobile number' };
}

export function validatePinCode(input: string): ValidationResult {
  const digitsOnly = input.replace(/\D/g, '');
  if (digitsOnly.length === 6 && /^[1-9]\d{5}$/.test(digitsOnly)) {
    return { isValid: true, normalizedValue: digitsOnly };
  }
  return { isValid: false, errorMessage: 'PIN code must be a valid 6-digit number' };
}

export function normalizeIncome(input: string): ValidationResult {
  // Extract numbers from phrases like "50,000", "50000 rupees", "యాభై వేలు", etc.
  const cleaned = input.replace(/,/g, '').trim();
  const match = cleaned.match(/\d+/);
  if (match) {
    const val = parseInt(match[0], 10);
    if (val > 0) {
      return { isValid: true, normalizedValue: val.toLocaleString('en-IN') };
    }
  }
  if (cleaned.length > 0) {
    return { isValid: true, normalizedValue: cleaned };
  }
  return { isValid: false, errorMessage: 'Please enter valid annual income' };
}

export function calculateCompletionRate(answeredCount: number, totalQuestions: number): number {
  if (totalQuestions <= 0) return 0;
  return Math.min(100, Math.round((answeredCount / totalQuestions) * 100));
}
