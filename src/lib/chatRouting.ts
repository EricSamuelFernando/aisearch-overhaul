export type ChatIntent = 'general' | 'property' | 'rent_vs_buy' | 'mortgage' | 'school';

export interface DetectIntentOptions {
  enableRentVsBuy?: boolean;
}

export function detectIntent(query: string, options: DetectIntentOptions = {}): ChatIntent {
  const q = query.toLowerCase();

  if (options.enableRentVsBuy && /\brent\s+vs\s+buy\b|\bshould\s+i\s+rent\b|\brent\s+or\s+buy\b/.test(q)) {
    return 'rent_vs_buy';
  }

  if (/\bmortgage\s+payment\b|\bmonthly\s+payment\b|\bwhat.*my\s+payment\b|\bwhat.*(?:payment|borrow)\b|\bcalculate\b|\b(?:monthly|payment)\s+on\s+a\s*\$/i.test(q)) {
    return 'mortgage';
  }

  if (/\bschool\b|\belementary\b|\bhigh\s+school\b|\bstem\b|\bcollege\b|\bdistrict\b|\bgraduate\b|\brating.*school\b|\bschool.*rating\b/.test(q)) {
    return 'school';
  }

  if (/\bwhat\s+is\b|\bhow\s+does\b|\bwhen\s+should\b|\bexplain\b|\btell\s+me\s+about\b|\bpmi\b|\bescrow\b|\bclosing\s+cost\b|\bdti\b|\bcredit\s+score\b|\bfha\b|\bconventional\b|\barm\b|\brefinanc/i.test(q)) {
    return 'general';
  }

  if (
    /\bwonder(?:ing)?\b|\bwhich\s+(?:city|area|neighborhood|place|location)\b/.test(q) ||
    /\bis\s+(?:\w+\s+){0,4}better\s+(?:or|than|for)\b/.test(q) ||
    /\bfor\s+(?:a\s+)?(?:(?:my|our)\s+)?family\b|\bfor\s+(?:us|our\s+family)\b/.test(q) ||
    /\bshould\s+(?:i|we)\s+(?:buy|live|move|consider|choose|go\s+with)\b/.test(q) ||
    /\badvice\b|\badvise\b|\brecommend\b/.test(q)
  ) {
    return 'general';
  }

  return 'property';
}
