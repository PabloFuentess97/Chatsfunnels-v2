const ipClickMap = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60 * 1000; // 1 minute window
const MAX_CLICKS_PER_WINDOW = 30;

export function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const entry = ipClickMap.get(ip);

  if (!entry || now > entry.resetAt) {
    ipClickMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: MAX_CLICKS_PER_WINDOW - 1 };
  }

  if (entry.count >= MAX_CLICKS_PER_WINDOW) {
    return { allowed: false, remaining: 0 };
  }

  entry.count++;
  return { allowed: true, remaining: MAX_CLICKS_PER_WINDOW - entry.count };
}

// Duplicate click detection
const recentClicks = new Map<string, number>();
const DUPLICATE_WINDOW_MS = 5 * 1000; // 5 seconds

export function isDuplicateClick(ip: string, funnelId: string): boolean {
  const key = `${ip}:${funnelId}`;
  const lastClick = recentClicks.get(key);
  const now = Date.now();

  if (lastClick && now - lastClick < DUPLICATE_WINDOW_MS) {
    return true;
  }

  recentClicks.set(key, now);
  return false;
}

// Bot detection
const BOT_PATTERNS = [
  /bot/i, /crawler/i, /spider/i, /scraper/i,
  /curl/i, /wget/i, /python-requests/i,
  /headless/i, /phantom/i, /selenium/i,
];

export function isBot(userAgent: string): boolean {
  if (!userAgent) return true;
  return BOT_PATTERNS.some((pattern) => pattern.test(userAgent));
}

// Cleanup stale entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of ipClickMap.entries()) {
    if (now > entry.resetAt) ipClickMap.delete(key);
  }
  for (const [key, timestamp] of recentClicks.entries()) {
    if (now - timestamp > DUPLICATE_WINDOW_MS) recentClicks.delete(key);
  }
}, 60 * 1000);
