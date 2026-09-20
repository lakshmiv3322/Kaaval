import { DetectedTactic, RiskLevel, AnalysisResult } from '../types';
import { redactSensitiveData } from './redaction';

export interface AnalysisInput {
  transcriptText: string;
  callerNumber?: string;
  callerLabel?: string;
  isFamily?: boolean;
  previousRiskScore?: number;
  recentTurns?: { speaker: string; text: string }[];
}

export interface RuleMatch {
  name: string;
  category: DetectedTactic['category'];
  severity: DetectedTactic['severity'];
  quote: string;
  description: string;
  weight: number;
}

// Multilingual Keyword Dictionaries
const AUTHORITY_PATTERNS = [
  { re: /\b(cbi|central bureau of investigation|crime branch|mumbai police|delhi police|cyber crime cell|inspector|dcp|commissioner|customs department|narcotics control bureau|ncb|enforcement directorate|ed)\b/i, label: 'Law Enforcement / Agency Impersonation', weight: 30 },
  { re: /(போலீஸ்|காவல்துறை|சிபிஐ|குற்றப்பிரிவு|ஆய்வாளர்|கஸ்டம்ஸ்|சுங்கத்துறை)/i, label: 'Tamil Authority Claim', weight: 30 },
  { re: /(पुलिस|सीबीआई|कस्टम्स|क्राइम ब्रांच|डीकाउंट|इंस्पेक्टर|साइबर सेल)/i, label: 'Hindi Authority Claim', weight: 30 },
  { re: /\b(police station la irundhu|cyber cell la irundhu|police bol rahe hain|customs se call hai)\b/i, label: 'Colloquial Authority Claim', weight: 30 }
];

const DIGITAL_ARREST_PATTERNS = [
  { re: /\b(digital arrest|placed under digital arrest|skype video|video call|keep video on|do not leave (the )?room|stay in the room|virtual custody)\b/i, label: 'Digital Arrest / Video Confinement', weight: 40 },
  { re: /(டிஜிட்டல் கைது|வீடியோ கால் ஆன்|அறையை விட்டு வெளியேறாதீர்கள்|கேமராவை ஆன் செய்)/i, label: 'Tamil Digital Arrest Threat', weight: 40 },
  { re: /(डिजिटल अरेस्ट|वीडियो कॉल ऑन|कमरे से बाहर मत जाओ|कैमरा बंद मत करना)/i, label: 'Hindi Digital Arrest Threat', weight: 40 },
  { re: /\b(video call on pannunga|room vittu veliya pogathinga|skype pe aao|camera on rakho)\b/i, label: 'Colloquial Digital Arrest Demand', weight: 40 }
];

const URGENCY_LEGAL_PATTERNS = [
  { re: /\b(arrest warrant|section 420|money laundering|illicit transfers|contraband|synthetic drugs|fake passports|consignment intercepted|non-bailable warrant|fir registered|immediate arrest)\b/i, label: 'Urgency & Legal Coercion', weight: 30 },
  { re: /(கைது வாரண்ட்|பணமோசடி|போதைப்பொருள்|போலி பாஸ்போர்ட்|எஃப்ஐஆர்|சட்டவிரோத)/i, label: 'Tamil Legal Threat', weight: 30 },
  { re: /(गिरफ्तारी वारंट|मनी लॉन्ड्रिंग|ड्रग्स|अवैध पार्सल|गैर-जमानती वारंट|एफआईआर दर्ज)/i, label: 'Hindi Legal Threat', weight: 30 },
  { re: /\b(case file aagirukku|parcel la drugs irukku|jail la poduvom|fir darj ho gayi|non bailable warrant nikla hai)\b/i, label: 'Colloquial Legal Threat', weight: 30 }
];

const SECRECY_ISOLATION_PATTERNS = [
  { re: /\b(do not speak to your (son|daughter|family|husband|wife)|do not tell (anyone|family)|surveillance|house is under surveillance|confidential line|do not disconnect)\b/i, label: 'Secrecy & Isolation Demand', weight: 35 },
  { re: /(யாருக்கும் சொல்லாதீர்கள்|மகனிடம் பேசாதீர்கள்|போனை கட் செய்யாதீர்கள்|ரகசிய விசாரணை)/i, label: 'Tamil Secrecy Demand', weight: 35 },
  { re: /(किसी को मत बताना|परिवार से बात मत करना|फोन मत काटना|गुप्त जांच)/i, label: 'Hindi Secrecy Demand', weight: 35 },
  { re: /\b(yarukittayum sollathinga|call cut pannathinga|kisi ko mat bolna|ghar me kisi ko mat batana)\b/i, label: 'Colloquial Secrecy Coercion', weight: 35 }
];

const FINANCIAL_EXTORTION_PATTERNS = [
  { re: /\b(rbi verification|escrow account|transfer funds|clear your name|share (your )?(bank )?otp|bank account password|financial audit deposit|penalty transfer|security deposit to unfreeze|penalty fee|deposit [0-9,]+ rupees|transfer [0-9,]+ rupees|outside court)\b/i, label: 'Financial Verification / Escrow Coercion', weight: 35 },
  { re: /(பணம் பரிமாற்றம்|ஓடிபி பகிரவும்|சரிபார்ப்பு கணக்கு|வைப்புத்தொகை|பணத்தை மாற்று|ஓடிபி சொல்லுங்க|ஓடிபி கொடுங்க|ஓடிபி சொல்லாவிட்டால்|பணம் அனுப்பவும்)/i, label: 'Tamil Financial Demand', weight: 35 },
  { re: /(पैसे ट्रांसफर करो|ओटीपी साझा करें|सुरक्षा जमा|खाता अनफ्रीज|आरबीआई सत्यापन|सुरक्षा निधि|क्लियरेंस पेनल्टी|तुरंत यूपीआई करो|ओटीपी बताओ)/i, label: 'Hindi Financial Demand', weight: 35 },
  { re: /\b(otp sollunga|rbi escrow ku anupunga|paise bhejo|account verify karne ke liye paise|otp batao)\b/i, label: 'Colloquial Financial Transfer Extortion', weight: 35 }
];

const UTILITY_AND_DISTRESS_PATTERNS = [
  { re: /\b(electricity (board|distribution|bill)|power (dispatch|will be disconnected|cut)|in total darkness|anydesk|teamviewer|unpaid balance|meter blocked|water leakage pipe)\b/i, label: 'Utility Cutoff & Remote Device Access', weight: 35 },
  { re: /(மின்சார வாரிய|மின்சார துறை|மின் இணைப்பு துண்டிக்கப்படும்|பவர் கட்|மின் கட்டணம்|கரண்ட் கட்)/i, label: 'Tamil Utility Cutoff Threat', weight: 35 },
  { re: /(बिजली विभाग|बिजली का बिल बकाया|लाइन काट दी जाएगी|बत्ती गुल|बिजली कट)/i, label: 'Hindi Utility Cutoff Threat', weight: 35 },
  { re: /\b(kyc (unlinked|update|link|suspended|expired)|debit card (has been )?suspended|account (will be|is) (permanently )?blocked|pension account (will be )?frozen|16 digit card|cvv)\b/i, label: 'KYC Suspension & Card Expiry Trap', weight: 35 },
  { re: /(ஆதார் கார்டு பேங்க்|அக்கவுண்ட் லாக்|பென்ஷன் பணம் முடக்கப்படும்|கேஒய்சி)/i, label: 'Tamil Bank Block Threat', weight: 35 },
  { re: /(खाता तुरंत बंद|खाता फ्रीज|केवाईसी नहीं हुआ|पैन कार्ड लिंक|खाता ब्लॉक)/i, label: 'Hindi Bank Block Threat', weight: 35 },
  { re: /\b(hit and run|fatal collision|emergency treatment deposit|settle outside court|involvement in accident|remanded in prison|in custody after|involved in a hit and run)\b/i, label: 'Relative Distress & Emergency Bail Trap', weight: 35 },
  { re: /(விபத்து ஏற்பட்டுவிட்டது|மருத்துவமனை கணக்கிற்கு|பெரிய விபத்து|விடுவிக்க பணம்)/i, label: 'Tamil Relative Distress Coercion', weight: 35 },
  { re: /(गंभीर एक्सीडेंट|बेल के लिए|जेल चला जाएगा|हिरासत में ले लिया|ड्रग्स केस में)/i, label: 'Hindi Relative Distress Coercion', weight: 35 },
];

// Benign / Safe indicators
const BENIGN_PATTERNS = [
  { re: /\b(we will never ask for (your )?(otp|password|pin)|bank never asks for otp|kabhi bhi otp share na karein|வங்கி ஒருபோதும் ஓடிபி கேட்காது)\b/i, label: 'Legitimate Anti-Fraud Disclaimer', scoreReduction: 40 },
  { re: /\b(did you take your (medicine|tablets|blood pressure)|evening medicine|lunch|dinner|coming home|love you|bring (mango )?kulfi|weekend|how are you feeling|grandkids)\b/i, label: 'Family Care Check-in', scoreReduction: 35 },
  { re: /(மாத்திரை சாப்பிட்டீர்களா|மருந்து|டின்னர்|சாப்பாடு|அம்மா|அன்பு|வீட்டுக்கு வருகிறேன்)/i, label: 'Tamil Family Care Expressions', scoreReduction: 35 },
  { re: /(दवाई ली आपने|खाना खाया|घर आ रहा हूँ|माँ|बेटा|तबीयत कैसी है)/i, label: 'Hindi Family Care Expressions', scoreReduction: 35 },
  { re: /\b(package delivered to your doorstep|delivery agent reached|otp only at delivery)\b/i, label: 'Normal Delivery Status', scoreReduction: 20 }
];

// Helper: Extract matching verbatim substring
function findVerbatimQuote(text: string, regex: RegExp): string | null {
  const match = text.match(regex);
  if (!match) return null;
  // Pick matching string
  return match[0].trim();
}

/**
 * Deterministic multilingual heuristics engine
 */
export function runHeuristics(input: AnalysisInput): AnalysisResult {
  const startTime = Date.now();
  const text = input.transcriptText || '';
  const lower = text.toLowerCase();
  
  // Check if caller is family or allowed contact
  const isFamily = Boolean(
    input.isFamily ||
    (input.callerLabel && /daughter|son|ananya|rahul|mom|dad|mother|father|family|sister|brother/i.test(input.callerLabel))
  );

  const matchedTactics: DetectedTactic[] = [];
  const benignSignals: string[] = [];
  let score = 5;

  // 1. Check for Benign Context first
  for (const bp of BENIGN_PATTERNS) {
    if (bp.re.test(text)) {
      benignSignals.push(bp.label);
      score -= bp.scoreReduction;
    }
  }

  // 2. Pattern Scans
  // Authority
  for (const p of AUTHORITY_PATTERNS) {
    const quote = findVerbatimQuote(text, p.re);
    if (quote) {
      matchedTactics.push({
        id: `t-auth-${Date.now()}-${matchedTactics.length}`,
        name: 'Authority Claim',
        category: 'authority',
        timestamp: 'Live',
        confidence: 0.95,
        severity: 'medium',
        quote,
        description: 'Impersonating law enforcement or government investigation authority'
      });
      score += p.weight;
      break;
    }
  }

  // Digital Arrest / Video Demand
  for (const p of DIGITAL_ARREST_PATTERNS) {
    const quote = findVerbatimQuote(text, p.re);
    if (quote) {
      matchedTactics.push({
        id: `t-arrest-${Date.now()}-${matchedTactics.length}`,
        name: 'Digital Arrest Threat',
        category: 'digital_arrest',
        timestamp: 'Live',
        confidence: 0.98,
        severity: 'high',
        quote,
        description: 'Coercive video confinement or unlawful "Digital Arrest" command'
      });
      score += p.weight;
      break;
    }
  }

  // Urgency / Legal Threat
  for (const p of URGENCY_LEGAL_PATTERNS) {
    const quote = findVerbatimQuote(text, p.re);
    if (quote) {
      matchedTactics.push({
        id: `t-urg-${Date.now()}-${matchedTactics.length}`,
        name: 'Urgency & Legal Threat',
        category: 'urgency',
        timestamp: 'Live',
        confidence: 0.94,
        severity: 'high',
        quote,
        description: 'Fabricated warrants, Section 420 or narcotics allegations creating urgency'
      });
      score += p.weight;
      break;
    }
  }

  // Secrecy / Isolation
  for (const p of SECRECY_ISOLATION_PATTERNS) {
    const quote = findVerbatimQuote(text, p.re);
    if (quote) {
      matchedTactics.push({
        id: `t-sec-${Date.now()}-${matchedTactics.length}`,
        name: 'Secrecy Demand',
        category: 'secrecy',
        timestamp: 'Live',
        confidence: 0.96,
        severity: 'high',
        quote,
        description: 'Demand to isolate elder from family members and prevent verification'
      });
      score += p.weight;
      break;
    }
  }

  // Financial Extortion
  for (const p of FINANCIAL_EXTORTION_PATTERNS) {
    const quote = findVerbatimQuote(text, p.re);
    if (quote) {
      // If family member mentioned money without coercive threats, don't flag as extortion
      if (isFamily && !matchedTactics.some(t => t.category === 'authority' || t.category === 'digital_arrest')) {
        benignSignals.push('Family routine financial discussion');
      } else {
        matchedTactics.push({
          id: `t-fin-${Date.now()}-${matchedTactics.length}`,
          name: 'Financial Verification Demand',
          category: 'financial',
          timestamp: 'Live',
          confidence: 0.97,
          severity: 'high',
          quote,
          description: 'Coercion to transfer money to escrow/clearing account or disclose OTP'
        });
        score += p.weight;
      }
      break;
    }
  }

  // Utility, KYC & Distress Extortion
  for (const p of UTILITY_AND_DISTRESS_PATTERNS) {
    const quote = findVerbatimQuote(text, p.re);
    if (quote) {
      if (isFamily && !matchedTactics.some(t => t.category === 'authority' || t.category === 'digital_arrest')) {
        // Safe family topic
      } else {
        matchedTactics.push({
          id: `t-util-${Date.now()}-${matchedTactics.length}`,
          name: 'Utility / Distress Coercion',
          category: 'urgency',
          timestamp: 'Live',
          confidence: 0.96,
          severity: 'high',
          quote,
          description: 'Power cut, account freeze, or family emergency bail pressure'
        });
        score += p.weight;
      }
      break;
    }
  }

  // Handle Family Allowlist safety cap
  if (isFamily) {
    benignSignals.push('Verified Family Contact');
    // If no strong coercive threat like digital arrest is detected, cap risk strictly at safe (<20)
    const hasCoercion = matchedTactics.some(t => t.category === 'digital_arrest');
    if (!hasCoercion) {
      score = Math.min(score, 18);
      // Filter out spurious financial tactics in family calls
      const filteredTactics = matchedTactics.filter(t => t.category !== 'financial');
      matchedTactics.length = 0;
      matchedTactics.push(...filteredTactics);
    }
  }

  // Incorporate previous risk score with accumulation and decay
  let finalScore = score;
  if (input.previousRiskScore !== undefined && input.previousRiskScore > 0) {
    if (matchedTactics.length > 0) {
      // Accumulate risk: highest of current score or previous score + increment
      finalScore = Math.max(score, input.previousRiskScore + 5);
    } else if (benignSignals.length > 0) {
      // Decay risk when conversation is benign
      finalScore = Math.max(5, Math.floor(input.previousRiskScore * 0.75));
    } else {
      // Gentle decay
      finalScore = Math.max(score, Math.floor(input.previousRiskScore * 0.9));
    }
  }

  const clampedScore = Math.min(100, Math.max(0, finalScore));
  const riskLevel: RiskLevel = clampedScore >= 65 ? 'high-risk' : clampedScore >= 30 ? 'suspicious' : 'safe';

  // Substring verification
  const verifiedTactics = matchedTactics.filter(t => {
    return text.toLowerCase().includes(t.quote.toLowerCase());
  });

  const latencyMs = Date.now() - startTime;

  let summary = 'Normal conversational dialogue with no coercive patterns detected.';
  if (verifiedTactics.length > 0) {
    summary = `Detected ${verifiedTactics.length} scam indicators: ${verifiedTactics.map(t => t.name).join(', ')}.`;
  } else if (benignSignals.length > 0) {
    summary = `Benign signals present: ${benignSignals.join(', ')}. Safe interaction.`;
  }

  return {
    riskScore: clampedScore,
    riskLevel,
    tactics: verifiedTactics,
    summary,
    benignSignals,
    engine: 'heuristics',
    latencyMs
  };
}

/**
 * Validate that every tactic quote is a verbatim substring of transcriptText.
 * Drops any tactic whose quote does not appear in the transcript.
 */
export function validateVerbatimQuotes(tactics: DetectedTactic[], transcriptText: string): DetectedTactic[] {
  if (!transcriptText || !Array.isArray(tactics)) return [];
  const lowerTranscript = transcriptText.toLowerCase();

  return tactics.filter(t => {
    if (!t || !t.quote) return false;
    const cleanQuote = t.quote.trim().toLowerCase();
    if (cleanQuote.length < 3) return false;
    return lowerTranscript.includes(cleanQuote);
  });
}
