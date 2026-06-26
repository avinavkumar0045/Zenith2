export function getScoreRating(score: number): { rating: 'Excellent' | 'Good' | 'Fair' | 'Poor'; colorClass: string } {
  if (score >= 85) return { rating: 'Excellent', colorClass: 'text-emerald-400' };
  if (score >= 65) return { rating: 'Good', colorClass: 'text-cyan-400' };
  if (score >= 40) return { rating: 'Fair', colorClass: 'text-amber-400' };
  return { rating: 'Poor', colorClass: 'text-rose-400' };
}

export function getRelativeTimeLabel(targetTime: number): string {
  const diffMs = targetTime - Date.now();
  if (diffMs <= 0) return 'now';
  
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 60) {
    return `in ${diffMin} min`;
  }
  
  const diffHr = (diffMs / 3600000).toFixed(1);
  return `in ${diffHr} hr`;
}

export function formatTimeLabel(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
}
