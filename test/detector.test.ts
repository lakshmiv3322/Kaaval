import { redactSensitiveData } from '../src/services/redaction';
import { runHeuristics, validateVerbatimQuotes } from '../src/services/detector';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${testName}`);
    failed++;
  }
}

console.log('\n--- Running Kaaval Unit Tests ---\n');

// 1. Redaction Tests
console.log('1. Redaction of Sensitive Entities:');
const sampleText = 'My Aadhaar is 5421 8942 1029, phone is +91 98201 44521, bank account is 94820194821, and your OTP is 492018. Section 420 case with 68 years old victim.';
const redacted = redactSensitiveData(sampleText);

assert(redacted.redactedText.includes('[REDACTED_AADHAAR]'), 'Aadhaar 12-digit run redacted');
assert(!redacted.redactedText.includes('5421 8942 1029'), 'Original Aadhaar digits removed');
assert(redacted.redactedText.includes('[REDACTED_PHONE]'), 'Phone number redacted');
assert(!redacted.redactedText.includes('98201 44521'), 'Original phone number removed');
assert(redacted.redactedText.includes('[REDACTED_ACCOUNT]'), 'Bank account number redacted');
assert(redacted.redactedText.includes('[REDACTED_OTP]'), 'OTP code redacted');
assert(redacted.redactedText.includes('Section 420'), 'Legal section number preserved (not redacted)');
assert(redacted.redactedText.includes('68 years old'), 'Age preserved (not redacted)');
assert(redacted.redactedCount >= 4, 'Detected at least 4 sensitive entities');

// 2. Verbatim Substring Validation Tests
console.log('\n2. Verbatim Quote Verification:');
const transcript = 'This is Mumbai Police Cyber Crime Cell. You are under digital arrest.';
const realQuoteTactic: any = {
  id: '1',
  name: 'Digital Arrest',
  category: 'digital_arrest',
  quote: 'under digital arrest',
  severity: 'high',
  confidence: 0.99,
  timestamp: 'Live',
  description: ''
};
const hallucinatedQuoteTactic: any = {
  id: '2',
  name: 'Digital Arrest',
  category: 'digital_arrest',
  quote: 'The suspect was placed under immediate virtual custody',
  severity: 'high',
  confidence: 0.99,
  timestamp: 'Live',
  description: ''
};

const verified = validateVerbatimQuotes([realQuoteTactic, hallucinatedQuoteTactic], transcript);
assert(verified.length === 1, 'Dropped hallucinated quote and kept real quote');
assert(verified[0].quote === 'under digital arrest', 'Preserved verbatim quote');

// 3. Benign Family Context Safety Cap
console.log('\n3. Benign Family Context:');
const familyCallText = 'Hi Mom, did you take your morning blood pressure medicine? I will transfer 5,000 rupees to your bank account for vegetables. Love you!';
const familyAnalysis = runHeuristics({
  transcriptText: familyCallText,
  callerLabel: 'Ananya (Daughter)',
  isFamily: true
});
assert(familyAnalysis.riskScore < 25, `Family routine money talk is capped low (got ${familyAnalysis.riskScore})`);
assert(familyAnalysis.riskLevel === 'safe', 'Family call classified as safe');
assert((familyAnalysis.benignSignals?.length || 0) > 0, 'Detected benign family signals');

// 4. Multilingual Keyword Detection
console.log('\n4. Multilingual Coercion Detection:');
// Tamil
const tamilAnalysis = runHeuristics({
  transcriptText: 'டெல்லி காவல்துறை. உங்கள் மீது கைது வாரண்ட். நீங்கள் இப்போது டிஜிட்டல் கைது செய்யப்படுகிறீர்கள். வீடியோ காலில் இருங்கள்.',
});
assert(tamilAnalysis.riskScore >= 65, `Tamil Digital Arrest triggers high risk (got ${tamilAnalysis.riskScore})`);
assert(tamilAnalysis.tactics.some(t => t.category === 'digital_arrest'), 'Tamil Digital Arrest tactic flagged');

// Hindi
const hindiAnalysis = runHeuristics({
  transcriptText: 'सीबीआई हेडक्वार्टर से इंस्पेक्टर शर्मा। गैर-जमानती गिरफ्तारी वारंट। डिजिटल अरेस्ट लागू है, कैमरा बंद मत करना।',
});
assert(hindiAnalysis.riskScore >= 65, `Hindi Digital Arrest triggers high risk (got ${hindiAnalysis.riskScore})`);
assert(hindiAnalysis.tactics.some(t => t.category === 'authority'), 'Hindi Authority tactic flagged');

// Tanglish
const tanglishAnalysis = runHeuristics({
  transcriptText: 'Cyber cell la irundhu pesuren. Digital arrest la irukkeenga, room vittu veliya pogathinga.',
});
assert(tanglishAnalysis.riskScore >= 65, `Tanglish Digital Arrest triggers high risk (got ${tanglishAnalysis.riskScore})`);

console.log(`\n===================================`);
console.log(`Test Results: ${passed} passed, ${failed} failed`);
console.log(`===================================\n`);

if (failed > 0) {
  process.exit(1);
}
