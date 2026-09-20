import { ScenarioScript } from '../types';

export const SCENARIO_PRESETS: ScenarioScript[] = [
  {
    id: 'digital-arrest-cbi',
    title: 'CBI / Mumbai Police "Digital Arrest" Scam',
    scamType: 'Digital Arrest Impersonation',
    callerName: 'CBI Cyber Crime Cell (Fake)',
    callerNumber: '+91 98201 44521',
    language: 'ta', // Tamil + English
    chunks: [
      {
        delayMs: 2500,
        speaker: 'caller',
        text: 'Hello Mrs. Kavitha. This is Inspector Ramesh Rathore from Crime Branch Mumbai Headquarters.',
        translation: 'வணக்கம் திருமதி கவிதா. நான் மும்பை குற்றப்பிரிவு ஆய்வாளர் ரமேஷ் ரத்தோர் பேசுகிறேன்.',
        riskScore: 28,
        tactic: {
          id: 't-auth',
          name: 'Authority Claim',
          category: 'authority',
          timestamp: '00:07',
          confidence: 0.94,
          severity: 'medium',
          quote: 'Inspector Ramesh Rathore from Crime Branch Mumbai',
          description: 'Caller falsely impersonates a senior police or central investigation agency officer.'
        }
      },
      {
        delayMs: 3500,
        speaker: 'elder',
        text: 'Yes? Why are you calling me? What happened?',
        translation: 'ஆமாம்? எதற்காக எனக்கு போன் செய்கிறீர்கள்? என்ன நடந்தது?',
        riskScore: 32
      },
      {
        delayMs: 4000,
        speaker: 'caller',
        text: 'An arrest warrant is issued in your name under Money Laundering Act Section 420. Your bank account is linked to illicit transfers.',
        translation: 'பணமோசடி சட்டத்தின் கீழ் உங்கள் பெயரில் கைது வாரண்ட் பிறப்பிக்கப்பட்டுள்ளது.',
        riskScore: 58,
        tactic: {
          id: 't-urg',
          name: 'Urgency & Legal Threat',
          category: 'urgency',
          timestamp: '00:19',
          confidence: 0.98,
          severity: 'high',
          quote: 'Arrest warrant issued in your name under Section 420',
          description: 'Fabricated legal allegations designed to trigger panic and compliance.'
        }
      },
      {
        delayMs: 4500,
        speaker: 'caller',
        text: 'You are now placed under Digital Arrest. You MUST turn on your video call on Skype right now and do not leave this room.',
        translation: 'நீங்கள் இப்போது டிஜிட்டல் கைது செய்யப்பட்டுள்ளீர்கள். உடனடியாக வீடியோ அழைப்பை இயக்கவும், அறையை விட்டு வெளியேறாதீர்கள்.',
        riskScore: 78,
        tactic: {
          id: 't-arrest',
          name: 'Digital Arrest & Video Demand',
          category: 'digital_arrest',
          timestamp: '00:32',
          confidence: 0.99,
          severity: 'high',
          quote: 'You are placed under Digital Arrest. Turn on video call.',
          description: 'Victim is coerced into isolation via ongoing video monitoring under threat of police custody.'
        }
      },
      {
        delayMs: 4500,
        speaker: 'caller',
        text: 'Do not speak to your son or disconnect this call. The entire house is under surveillance. Transfer funds to our RBI Verification Escrow account to clear your name.',
        translation: 'உங்கள் மகனிடம் பேசாதீர்கள். உங்கள் கணக்கை சரிபார்க்க உடனடியாக பணத்தை பரிமாற்றம் செய்யவும்.',
        riskScore: 92,
        tactic: {
          id: 't-sec',
          name: 'Secrecy Demand & Fund Transfer',
          category: 'secrecy',
          timestamp: '00:46',
          confidence: 0.99,
          severity: 'high',
          quote: 'Do not speak to your son... Transfer funds to RBI Verification Escrow',
          description: 'High-pressure coercion to prevent family verification and execute fraudulent fund transfer.'
        }
      },
      {
        delayMs: 3500,
        speaker: 'elder',
        text: 'Sir please, I am 68 years old, I have done nothing wrong! I will call my daughter...',
        translation: 'ஐயா, எனக்கு 68 வயதாகிறது, நான் எந்த தவறும் செய்யவில்லை!',
        riskScore: 94
      }
    ]
  },
  {
    id: 'fedex-customs-parcel',
    title: 'Customs / FedEx Narcotics Parcel Scam',
    scamType: 'Customs Narcotics Extortion',
    callerName: 'DHL / Customs Clearance Bureau',
    callerNumber: '+91 22 6192 8800',
    language: 'hi', // Hindi + English
    chunks: [
      {
        delayMs: 2500,
        speaker: 'caller',
        text: 'Namaste, this is Customs Department at Delhi Airport. A parcel containing 14 fake passports and synthetic drugs addressed to you has been intercepted.',
        translation: 'नमस्ते, दिल्ली हवाई अड्डे पर सीमा शुल्क विभाग से बोल रहे हैं। आपके पते का एक पार्सल पकड़ा गया है।',
        riskScore: 42,
        tactic: {
          id: 't-customs-auth',
          name: 'Authority Claim',
          category: 'authority',
          timestamp: '00:08',
          confidence: 0.95,
          severity: 'medium',
          quote: 'Customs Department at Delhi Airport... narcotics intercepted',
          description: 'Falsely claiming illegal contraband arrived under the elder’s Aadhaar/identity.'
        }
      },
      {
        delayMs: 3500,
        speaker: 'elder',
        text: 'No, I have not sent or ordered any parcel! Who are you?',
        translation: 'नहीं, मैंने कोई पार्सल नहीं भेजा है! आप कौन हैं?',
        riskScore: 45
      },
      {
        delayMs: 4000,
        speaker: 'caller',
        text: 'Your Aadhaar card was used to register this consignment. We are connecting you immediately to DCP Cyber Security on this encrypted line.',
        translation: 'आपके आधार कार्ड का उपयोग हुआ है। हम तुरंत डीसीपी साइबर सेल को लाइन ट्रांसफर कर रहे हैं।',
        riskScore: 68,
        tactic: {
          id: 't-customs-urg',
          name: 'Identity Theft Leverage',
          category: 'urgency',
          timestamp: '00:22',
          confidence: 0.92,
          severity: 'high',
          quote: 'Your Aadhaar card was used... transferring to DCP',
          description: 'Escalating urgency by threatening national security charges and impersonating senior police.'
        }
      },
      {
        delayMs: 4500,
        speaker: 'caller',
        text: 'To cancel the immediate FIR and avoid non-bailable warrant, share your bank account OTP now for financial audit.',
        translation: 'तुरंत एफआईआर रद्द करने के लिए अपना बैंक ओटीपी साझा करें।',
        riskScore: 88,
        tactic: {
          id: 't-customs-otp',
          name: 'OTP & Financial Secrecy',
          category: 'financial',
          timestamp: '00:39',
          confidence: 0.99,
          severity: 'high',
          quote: 'Share your bank account OTP now to cancel FIR',
          description: 'Direct demand for authentication credentials / OTP under threat of imminent arrest.'
        }
      }
    ]
  },
  {
    id: 'safe-call-daughter',
    title: 'Safe Call – Daughter Checking In',
    scamType: 'Safe / Normal Call',
    callerName: 'Ananya (Daughter)',
    callerNumber: '+91 98402 11983',
    language: 'en',
    chunks: [
      {
        delayMs: 2500,
        speaker: 'caller',
        text: 'Hi Ma! Just finished my team meeting. Did you take your blood pressure medicine today?',
        translation: 'அம்மா! மாத்திரை சாப்பிட்டீர்களா?',
        riskScore: 4
      },
      {
        delayMs: 3000,
        speaker: 'elder',
        text: 'Yes Ananya, took it after breakfast. Are you coming home for dinner this Saturday?',
        translation: 'ஆமாம் அனன்யா. சனிக்கிழமை டின்னருக்கு வருகிறாயா?',
        riskScore: 5
      },
      {
        delayMs: 3000,
        speaker: 'caller',
        text: 'Yes! Rahul and I will be there by 7pm. I will bring the mango kulfi you like. Love you Ma, see you soon!',
        translation: 'கண்டிப்பாக வருகிறோம் அம்மா!',
        riskScore: 6
      }
    ]
  }
];

export const INITIAL_RECENT_CALLS = [
  {
    id: 'call-1049',
    callerNumber: '+91 98201 44521',
    callerLabel: 'Fake Mumbai Police / CBI',
    elderName: 'Kavitha Ramaswamy (Mother)',
    elderPhone: '+91 94441 90212',
    preferredLanguage: 'ta',
    startTime: 'Today, 11:24 AM',
    durationSeconds: 142,
    status: 'ended' as const,
    riskScore: 92,
    riskLevel: 'high-risk' as const,
    scamType: 'Digital Arrest Impersonation',
    detectedTactics: [
      {
        id: 't-1',
        name: 'Authority Claim',
        category: 'authority' as const,
        timestamp: '00:07',
        confidence: 0.96,
        severity: 'medium' as const,
        quote: 'Inspector Ramesh Rathore from Crime Branch',
        description: 'Impersonating police official'
      },
      {
        id: 't-2',
        name: 'Digital Arrest Threat',
        category: 'digital_arrest' as const,
        timestamp: '00:32',
        confidence: 0.99,
        severity: 'high' as const,
        quote: 'You are placed under Digital Arrest. Turn on video call.',
        description: 'Coercive video confinement'
      },
      {
        id: 't-3',
        name: 'Secrecy Demand',
        category: 'secrecy' as const,
        timestamp: '00:46',
        confidence: 0.97,
        severity: 'high' as const,
        quote: 'Do not speak to your son or disconnect this call',
        description: 'Isolation from family help'
      }
    ],
    transcript: [
      { id: '1', timestamp: '00:07', speaker: 'caller' as const, text: 'Hello Mrs. Kavitha. This is Inspector Ramesh Rathore from Crime Branch Mumbai Headquarters.' },
      { id: '2', timestamp: '00:15', speaker: 'elder' as const, text: 'Yes? Why are you calling me? What happened?' },
      { id: '3', timestamp: '00:22', speaker: 'caller' as const, text: 'An arrest warrant is issued in your name under Money Laundering Act Section 420.' },
      { id: '4', timestamp: '00:34', speaker: 'caller' as const, text: 'You are placed under Digital Arrest. Turn on your video camera immediately and do not tell your family.' }
    ],
    alertTriggered: true,
    alertAcknowledged: true,
    bargeInActive: false,
    feedback: 'scam' as const
  },
  {
    id: 'call-1048',
    callerNumber: '+91 22 6192 8800',
    callerLabel: 'Customs Clearance Scam',
    elderName: 'Kavitha Ramaswamy (Mother)',
    elderPhone: '+91 94441 90212',
    preferredLanguage: 'hi',
    startTime: 'Yesterday, 3:15 PM',
    durationSeconds: 88,
    status: 'ended' as const,
    riskScore: 78,
    riskLevel: 'high-risk' as const,
    scamType: 'FedEx Customs Parcel Scam',
    detectedTactics: [
      {
        id: 't-4',
        name: 'Authority Claim',
        category: 'authority' as const,
        timestamp: '00:09',
        confidence: 0.93,
        severity: 'medium' as const,
        quote: 'Customs Department at Delhi Airport',
        description: 'Illegal cargo extortion'
      }
    ],
    transcript: [
      { id: '5', timestamp: '00:09', speaker: 'caller' as const, text: 'A parcel with contraband was found registered with your Aadhaar number.' },
      { id: '6', timestamp: '00:25', speaker: 'elder' as const, text: 'I never sent any parcel, this is a mistake!' }
    ],
    alertTriggered: true,
    alertAcknowledged: true,
    bargeInActive: false,
    feedback: 'scam' as const
  },
  {
    id: 'call-1047',
    callerNumber: '+91 98402 11983',
    callerLabel: 'Ananya (Daughter)',
    elderName: 'Kavitha Ramaswamy (Mother)',
    elderPhone: '+91 94441 90212',
    preferredLanguage: 'en',
    startTime: '2 days ago, 7:40 PM',
    durationSeconds: 195,
    status: 'ended' as const,
    riskScore: 6,
    riskLevel: 'safe' as const,
    scamType: 'Safe Call',
    detectedTactics: [],
    transcript: [
      { id: '7', timestamp: '00:05', speaker: 'caller' as const, text: 'Hi Ma! Just calling to check if you took your evening medicines.' },
      { id: '8', timestamp: '00:14', speaker: 'elder' as const, text: 'Yes Ananya, feeling energetic today. See you on Sunday!' }
    ],
    alertTriggered: false,
    alertAcknowledged: false,
    bargeInActive: false,
    feedback: 'safe' as const
  }
];

export const REGIONAL_WARNINGS: Record<string, { title: string; subtitle: string; advice: string }> = {
  ta: {
    title: 'இது மோசடி அழைப்பாக இருக்கலாம்!',
    subtitle: 'டிஜிட்டல் கைது என்பது சட்டவிரோதமானது.',
    advice: 'எந்தவொரு நபரிடமும் OTP, கடவுச்சொல் அல்லது பணத்தை பகிர வேண்டாம்.'
  },
  hi: {
    title: 'सावधान! यह धोखाधड़ी कॉल हो सकती है!',
    subtitle: 'भारत में डिजिटल अरेस्ट नाम का कोई कानून नहीं है।',
    advice: 'कृपया किसी को भी बैंक विवरण, ओटीपी या पैसे ट्रांसफर न करें।'
  },
  en: {
    title: 'Warning: Potential Scam Call Detected!',
    subtitle: 'Indian Law enforcement never conducts "Digital Arrests" or video bail.',
    advice: 'Do NOT share OTP, Aadhaar, or transfer money to any "clearing account".'
  },
  te: {
    title: 'హెచ్చరిక: ఇది మోసపూరిత కాల్ కావచ్చు!',
    subtitle: 'పోలీసులు ఎప్పుడూ వీడియో కాల్‌లో అరెస్ట్ చేయరు.',
    advice: 'ఎవరికీ OTP లేదా డబ్బు బదిలీ చేయవద్దు.'
  },
  kn: {
    title: 'ಎಚ್ಚರಿಕೆ: ಇದು ವಂಚನೆಯ ಕರೆ ಆಗಿರಬಹುದು!',
    subtitle: 'ಡಿಜಿಟಲ್ ಬಂಧನ ಎಂಬ ಕಾನೂನು ಭಾರತದಲ್ಲಿ ಇಲ್ಲ.',
    advice: 'ಯಾರಿಗೂ OTP ಅಥವಾ ಹಣವನ್ನು ವರ್ಗಾವಣೆ ಮಾಡಬೇಡಿ.'
  }
};
