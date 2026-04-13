const RATE_LIMIT_WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 30;
const MAX_ENTRIES = 10_000;

interface RateLimitEntry {
  timestamps: number[];
  lastAccess: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();
let lastCleanup = Date.now();
const CLEANUP_INTERVAL_MS = 30_000;

function cleanupIfNeeded(): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;

  for (const [key, entry] of rateLimitStore.entries()) {
    if (now - entry.lastAccess > RATE_LIMIT_WINDOW_MS * 2) {
      rateLimitStore.delete(key);
    }
  }

  const cutoff = now - DUPLICATE_WINDOW_MS * 3;
  for (const [key, ts] of recentFingerprints.entries()) {
    if (ts < cutoff) recentFingerprints.delete(key);
  }
}

function evictIfNeeded(): void {
  if (rateLimitStore.size <= MAX_ENTRIES) return;
  const entries = Array.from(rateLimitStore.entries());
  entries.sort((a, b) => a[1].lastAccess - b[1].lastAccess);
  const toRemove = Math.floor(entries.length * 0.2);
  for (let i = 0; i < toRemove; i++) {
    rateLimitStore.delete(entries[i][0]);
  }
}

export function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  cleanupIfNeeded();
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry) {
    evictIfNeeded();
    rateLimitStore.set(ip, { timestamps: [now], lastAccess: now });
    return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - 1 };
  }

  entry.timestamps = entry.timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  entry.lastAccess = now;

  if (entry.timestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    return { allowed: false, remaining: 0 };
  }

  entry.timestamps.push(now);
  return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - entry.timestamps.length };
}

// ─── Duplicate Click Detection ──────────────────────────────────────────────

const DUPLICATE_WINDOW_MS = 5_000;
const MAX_FINGERPRINTS = 50_000;
const recentFingerprints = new Map<string, number>();

export function isDuplicateClick(ip: string, funnelId: string): boolean {
  const now = Date.now();
  const bucket = Math.floor(now / DUPLICATE_WINDOW_MS);
  const fingerprint = `${ip}:${funnelId}:${bucket}`;

  if (recentFingerprints.has(fingerprint)) return true;

  if (recentFingerprints.size > MAX_FINGERPRINTS) {
    const cutoff = now - DUPLICATE_WINDOW_MS * 2;
    for (const [key, ts] of recentFingerprints.entries()) {
      if (ts < cutoff) recentFingerprints.delete(key);
    }
  }

  recentFingerprints.set(fingerprint, now);
  return false;
}

// ─── Bot Detection ──────────────────────────────────────────────────────────

const BOT_PATTERNS = [
  /googlebot/i, /bingbot/i, /yandexbot/i, /baiduspider/i, /duckduckbot/i,
  /bot\b/i, /crawler/i, /spider/i, /scraper/i, /archiver/i,
  /curl/i, /wget/i, /httpie/i, /python-requests/i, /python-urllib/i,
  /java\//i, /go-http-client/i, /node-fetch/i, /axios/i,
  /headless/i, /phantomjs/i, /selenium/i, /puppeteer/i, /playwright/i,
  /webdriver/i, /chrome-lighthouse/i,
  /facebookexternalhit/i, /twitterbot/i, /linkedinbot/i, /whatsapp/i,
  /telegrambot/i, /slackbot/i, /discordbot/i,
  /semrush/i, /ahrefs/i, /mj12bot/i, /dotbot/i, /petalbot/i,
  /uptimerobot/i, /pingdom/i, /statuscake/i,
];

const MIN_UA_LENGTH = 20;

export function isBot(userAgent: string): boolean {
  if (!userAgent || userAgent.length < MIN_UA_LENGTH) return true;
  return BOT_PATTERNS.some((pattern) => pattern.test(userAgent));
}
