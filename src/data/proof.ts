export interface ProofStat {
  value: string;
  numericTarget: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  label: string;
  source: string;
}

export const PROOF_STATS: ProofStat[] = [
  {
    value: '90.8%',
    numericTarget: 90.8,
    suffix: '%',
    decimals: 1,
    label: 'Detection accuracy across adversarial scam scripts (100% precision, 0% FPR)',
    source: 'Kaaval internal benchmark, 65-transcript dataset',
  },
  {
    value: '4',
    numericTarget: 4,
    decimals: 0,
    label: 'Regional languages evaluated (Tamil, Hindi, Tanglish, English)',
    source: 'Kaaval internal benchmark, 65-transcript dataset',
  },
  {
    value: '< 1 ms',
    numericTarget: 1,
    prefix: '< ',
    suffix: ' ms',
    decimals: 0,
    label: 'On-device rule engine response window (~925 ms hybrid cloud)',
    source: 'Kaaval internal benchmark, 65-transcript dataset',
  },
];
