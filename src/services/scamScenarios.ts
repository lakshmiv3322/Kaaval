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
        translation: 'வணக்கம் திருமதி கவிதா. நான் மும்பை குற்றப்பிரிவு ஆய்வாளர் ரமேஷ் ரத்தோர் பேசுகிறேன்.'
      },
      {
        delayMs: 3500,
        speaker: 'elder',
        text: 'Yes? Why are you calling me? What happened?',
        translation: 'ஆமாம்? எதற்காக எனக்கு போன் செய்கிறீர்கள்? என்ன நடந்தது?'
      },
      {
        delayMs: 4000,
        speaker: 'caller',
        text: 'An arrest warrant is issued in your name under Money Laundering Act Section 420. Your bank account is linked to illicit transfers.',
        translation: 'பணமோசடி சட்டத்தின் கீழ் உங்கள் பெயரில் கைது வாரண்ட் பிறப்பிக்கப்பட்டுள்ளது.'
      },
      {
        delayMs: 4500,
        speaker: 'caller',
        text: 'You are now placed under Digital Arrest. You MUST turn on your video call on Skype right now and do not leave this room.',
        translation: 'நீங்கள் இப்போது டிஜிட்டல் கைது செய்யப்பட்டுள்ளீர்கள். உடனடியாக வீடியோ அழைப்பை இயக்கவும், அறையை விட்டு வெளியேறாதீர்கள்.'
      },
      {
        delayMs: 4500,
        speaker: 'caller',
        text: 'Do not speak to your son or disconnect this call. The entire house is under surveillance. Transfer funds to our RBI Verification Escrow account to clear your name.',
        translation: 'உங்கள் மகனிடம் பேசாதீர்கள். உங்கள் கணக்கை சரிபார்க்க உடனடியாக பணத்தை பரிமாற்றம் செய்யவும்.'
      },
      {
        delayMs: 3500,
        speaker: 'elder',
        text: 'Sir please, I am 68 years old, I have done nothing wrong! I will call my daughter...',
        translation: 'ஐயா, எனக்கு 68 வயதாகிறது, நான் எந்த தவறும் செய்யவில்லை!'
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
        translation: 'नमस्ते, दिल्ली हवाई अड्डे पर सीमा शुल्क विभाग से बोल रहे हैं। आपके पते का एक पार्सल पकड़ा गया है।'
      },
      {
        delayMs: 3500,
        speaker: 'elder',
        text: 'No, I have not sent or ordered any parcel! Who are you?',
        translation: 'नहीं, मैंने कोई पार्सल नहीं भेजा है! आप कौन हैं?'
      },
      {
        delayMs: 4000,
        speaker: 'caller',
        text: 'Your Aadhaar card was used to register this consignment. We are connecting you immediately to DCP Cyber Security on this encrypted line.',
        translation: 'आपके आधार कार्ड का उपयोग हुआ है। हम तुरंत डीसीपी साइबर सेल को लाइन ट्रांसफर कर रहे हैं।'
      },
      {
        delayMs: 4500,
        speaker: 'caller',
        text: 'To cancel the immediate FIR and avoid non-bailable warrant, share your bank account OTP now for financial audit.',
        translation: 'तुरंत एफआईआर रद्द करने के लिए अपना बैंक ओटीपी साझा करें।'
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
        translation: 'அம்மா! மாத்திரை சாப்பிட்டீர்களா?'
      },
      {
        delayMs: 3000,
        speaker: 'elder',
        text: 'Yes Ananya, took it after breakfast. Are you coming home for dinner this Saturday?',
        translation: 'ஆமாம் அனன்யா. சனிக்கிழமை டின்னருக்கு வருகிறாயா?'
      },
      {
        delayMs: 3000,
        speaker: 'caller',
        text: 'Yes! Rahul and I will be there by 7pm. I will bring the mango kulfi you like. Love you Ma, see you soon!',
        translation: 'கண்டிப்பாக வருகிறோம் அம்மா!'
      }
    ]
  }
];

export const INITIAL_RECENT_CALLS: any[] = [];

export const REGIONAL_WARNINGS: Record<string, { title: string; subtitle: string; advice: string; audioWarning: string }> = {
  ta: {
    title: 'இது மோசடி அழைப்பாக இருக்கலாம்!',
    subtitle: 'டிஜிட்டல் கைது என்பது சட்டவிரோதமானது.',
    advice: 'எந்தவொரு நபரிடமும் OTP, கடவுச்சொல் அல்லது பணத்தை பகிர வேண்டாம்.',
    audioWarning: 'எச்சரிக்கை! இது ஒரு மோசடி அழைப்பு. உடனே இணைப்பை துண்டிக்கவும். காவல்துறையினர் ஒருபோதும் வீடியோ அழைப்பில் கைது செய்ய மாட்டார்கள்.'
  },
  hi: {
    title: 'सावधान! यह धोखाधड़ी कॉल हो सकती है!',
    subtitle: 'भारत में डिजिटल अरेस्ट नाम का कोई कानून नहीं है।',
    advice: 'कृपया किसी को भी बैंक विवरण, ओटीपी या पैसे ट्रांसफर न करें।',
    audioWarning: 'सावधान! यह एक फर्जी कॉल है। तुरंत फोन काट दें। पुलिस कभी भी वीडियो कॉल पर डिजिटल अरेस्ट नहीं करती।'
  },
  en: {
    title: 'Warning: Potential Scam Call Detected!',
    subtitle: 'Indian Law enforcement never conducts "Digital Arrests" or video bail.',
    advice: 'Do NOT share OTP, Aadhaar, or transfer money to any "clearing account".',
    audioWarning: 'Warning! This appears to be a fraudulent scam call. Please hang up immediately. Law enforcement never conducts digital arrests over phone or video call.'
  },
  te: {
    title: 'హెచ్చరిక: ఇది మోసపూరిత కాల్ కావచ్చు!',
    subtitle: 'పోలీసులు ఎప్పుడూ వీడియో కాల్‌లో అరెస్ట్ చేయరు.',
    advice: 'ఎవరికీ OTP లేదా డబ్బు బదిలీ చేయవద్దు.',
    audioWarning: 'హెచ్చరిక! ఇది మోసపూరిత కాల్. వెంటనే కాల్ కట్ చేయండి. పోలీసులు వీడియో కాల్ ద్వారా అరెస్ట్ చేయరు.'
  },
  kn: {
    title: 'ಎಚ್ಚರಿಕೆ: ಇದು ವಂಚನೆಯ ಕರೆ ಆಗಿರಬಹುದು!',
    subtitle: 'ಡಿಜಿಟಲ್ ಬಂಧನ ಎಂಬ ಕಾನೂನು ಭಾರತದಲ್ಲಿ ಇಲ್ಲ.',
    advice: 'ಯಾರಿಗೂ OTP ಅಥವಾ ಹಣವನ್ನು ವರ್ಗಾವಣೆ ಮಾಡಬೇಡಿ.',
    audioWarning: 'ಎಚ್ಚರಿಕೆ! ಇದು ವಂಚನೆಯ ಕರೆ. ತಕ್ಷಣ ಫೋನ್ ಕಟ್ ಮಾಡಿ.'
  }
};
