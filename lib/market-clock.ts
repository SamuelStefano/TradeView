// Brazilian tax and reporting periods are calendar periods in local time, not
// in UTC. Slicing an ISO timestamp buckets a trade made at 21:30 in São Paulo
// into the next UTC day — and, on the last day of a month, into the next month,
// which is the month the exemption ceiling is measured against.
const SAO_PAULO = 'America/Sao_Paulo';

// en-CA renders ISO-ordered parts, so the result sorts lexicographically.
const dayFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: SAO_PAULO,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export function saoPauloDayKey(value: string | number | Date): string {
  return dayFormatter.format(new Date(value));
}

export function saoPauloMonthKey(value: string | number | Date): string {
  return saoPauloDayKey(value).slice(0, 7);
}

export function dayKeyLabel(dayKey: string): string {
  return `${dayKey.slice(8, 10)}/${dayKey.slice(5, 7)}`;
}
