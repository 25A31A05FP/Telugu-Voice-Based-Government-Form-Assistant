import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateAadhaarLast4,
  validateMobileNumber,
  validatePinCode,
  normalizeIncome,
  calculateCompletionRate,
} from './validation.ts';

test('validateAadhaarLast4 extracts and accepts valid 4 digits', () => {
  assert.deepEqual(validateAadhaarLast4('1234'), {
    isValid: true,
    normalizedValue: '1234',
  });
  // Handles extracting last 4 from full number
  assert.deepEqual(validateAadhaarLast4('1234 5678 9012'), {
    isValid: true,
    normalizedValue: '9012',
  });
  // Rejects invalid input
  assert.equal(validateAadhaarLast4('12').isValid, false);
  assert.equal(validateAadhaarLast4('').isValid, false);
});

test('validateMobileNumber validates standard 10-digit Indian numbers', () => {
  assert.deepEqual(validateMobileNumber('9876543210'), {
    isValid: true,
    normalizedValue: '9876543210',
  });
  // Strips +91
  assert.deepEqual(validateMobileNumber('+91 9876543210'), {
    isValid: true,
    normalizedValue: '9876543210',
  });
  // Rejects invalid
  assert.equal(validateMobileNumber('12345').isValid, false);
});

test('validatePinCode validates 6-digit postal code', () => {
  assert.deepEqual(validatePinCode('500001'), {
    isValid: true,
    normalizedValue: '500001',
  });
  assert.equal(validatePinCode('5000').isValid, false);
  assert.equal(validatePinCode('012345').isValid, false);
});

test('calculateCompletionRate computes correct percentage', () => {
  assert.equal(calculateCompletionRate(0, 14), 0);
  assert.equal(calculateCompletionRate(7, 14), 50);
  assert.equal(calculateCompletionRate(14, 14), 100);
});
