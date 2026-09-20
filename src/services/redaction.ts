export interface RedactionResult {
  originalText: string;
  redactedText: string;
  redactedCount: number;
  redactedTypes: string[];
}

export function redactSensitiveData(text: string): RedactionResult {
  if (!text) {
    return {
      originalText: text,
      redactedText: text,
      redactedCount: 0,
      redactedTypes: [],
    };
  }

  let result = text;
  const typesSet = new Set<string>();
  let count = 0;

  // 1. Aadhaar-like 12-digit runs (e.g., 1234 5678 9012 or 1234-5678-9012 or 123456789012)
  const aadhaarRegex = /\b[2-9]\d{3}[\s-]?\d{4}[\s-]?\d{4}\b/g;
  result = result.replace(aadhaarRegex, () => {
    count++;
    typesSet.add('Aadhaar');
    return '[REDACTED_AADHAAR]';
  });

  // 2. Phone numbers (e.g. +91 98201 44521, +91-9820144521, 9820144521, 098201 44521)
  const phoneRegex = /(?:\+?91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}\b/g;
  result = result.replace(phoneRegex, () => {
    count++;
    typesSet.add('Phone Number');
    return '[REDACTED_PHONE]';
  });

  // 3. OTP codes (4-6 digits explicitly preceded or followed by OTP/code/pin/passcode)
  const otpRegex = /\b(?:otp|code|pin|password|verification code)\s*(?:is|:|-)?\s*(\d{4,6})\b/gi;
  result = result.replace(otpRegex, (_match, digits) => {
    count++;
    typesSet.add('OTP Code');
    return `OTP [REDACTED_OTP]`;
  });

  // 4. Account numbers (9 to 18 contiguous digits that were not already redacted)
  const accountRegex = /\b\d{9,18}\b/g;
  result = result.replace(accountRegex, () => {
    count++;
    typesSet.add('Account Number');
    return '[REDACTED_ACCOUNT]';
  });

  return {
    originalText: text,
    redactedText: result,
    redactedCount: count,
    redactedTypes: Array.from(typesSet),
  };
}
