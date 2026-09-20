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
    // TODO: replace with sourced figure or benchmark result
    value: '—',
    numericTarget: 0,
    decimals: 0,
    label: 'Reported losses to digital arrest and authority impersonation fraud in India',
    source: 'TODO: replace with a verified public source',
  },
  {
    // TODO: replace with sourced figure or benchmark result
    value: '—',
    numericTarget: 0,
    decimals: 0,
    label: 'Languages supported by the prototype experience',
    source: 'TODO: replace with a benchmark result',
  },
  {
    // TODO: replace with sourced figure or benchmark result
    value: '—',
    numericTarget: 0,
    decimals: 1,
    label: 'Response window from coercive phrasing to family alert',
    source: 'TODO: replace with a benchmark result',
  },
];
