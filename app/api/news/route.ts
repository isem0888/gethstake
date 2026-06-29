import { NextResponse } from 'next/server';

export const revalidate = 300; // cache 5 min on Vercel

/* ── Sources ───────────────────────────────────────────────── */
const SOURCES = [
  { url: 'https://cointelegraph.com/rss',                                       name: 'CoinTelegraph' },
  { url: 'https://www.coindesk.com/arc/outboundfeeds/rss/',                     name: 'CoinDesk' },
  { url: 'https://decrypt.co/feed',                                             name: 'Decrypt' },
  { url: 'https://www.theblock.co/rss.xml',                                     name: 'The Block' },
  { url: 'https://bitcoinmagazine.com/.rss/full/',                              name: 'Bitcoin Magazine' },
];

/* ── XML helpers ─────────────────────────────────────────────── */
function getText(xml: string, tag: string): string {
  // CDATA
  const cd = xml.match(new RegExp(`<${tag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*</${tag}>`, 'i'));
  if (cd) return cd[1].trim();
  // Normal
  const nm = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i'));
  if (nm) return nm[1].replace(/<[^>]+>/g, '').trim();
  return '';
}

function getAttr(xml: string, tag: string, attr: string): string {
  const m = xml.match(new RegExp(`<${tag}[^>]*\\s${attr}="([^"]*)"`, 'i'));
  return m ? m[1] : '';
}

function getFirstImg(html: string): string {
  const m = html.match(/<img[^>]+src="([^"]+)"/i);
  return m ? m[1] : '';
}

function stripHtml(s: string): string {
  return s.replace(/<[^>]+>/g, '').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#039;/g,"'").replace(/&nbsp;/g,' ').trim();
}

export interface NewsArticle {
  id: string;
  title: string;
  url: string;
  source: string;
  body: string;
  imageurl: string;
  published_on: number;   // unix timestamp
  categories: string;    // comma-separated tags
}

/* ── Category tagger ─────────────────────────────────────────── */
function tagArticle(title: string, rawCats: string): string {
  const t = (title + ' ' + rawCats).toLowerCase();
  const tags: string[] = [];
  if (/ethereum|eth\b|ether/.test(t))                                          tags.push('ETH');
  if (/bitcoin|btc|crypto|blockchain|defi|nft|web3|altcoin|solana/.test(t))    tags.push('Crypto');
  if (/market|price|trad|bull|bear|rally|dump|ath|volatil/.test(t))            tags.push('Market');
  if (/sec\b|regulat|legal|law|ban|govern|sanction|compliance|bill/.test(t))   tags.push('Regulation');
  if (/stake|staking|validator|pos|proof.of.stake|eigen|lido|rocketpool/.test(t)) tags.push('Staking');
  return tags.join(',') || 'General';
}

/* ── Parse one RSS/Atom feed ─────────────────────────────────── */
function parseFeed(xml: string, sourceName: string): NewsArticle[] {
  const articles: NewsArticle[] = [];
  const itemRe = /<item[^>]*>([\s\S]*?)<\/item>|<entry[^>]*>([\s\S]*?)<\/entry>/gi;
  let m: RegExpExecArray | null;

  while ((m = itemRe.exec(xml)) !== null) {
    const raw = m[1] || m[2];

    const title = stripHtml(getText(raw, 'title')).slice(0, 180);
    if (!title) continue;

    // Link: <link>...</link> OR <link href="..."/> (Atom)
    let url = getText(raw, 'link').trim();
    if (!url || url.startsWith('<')) {
      url = getAttr(raw, 'link', 'href');
    }
    if (!url) url = getText(raw, 'guid').trim();
    if (!url || !url.startsWith('http')) continue;

    const pubRaw = getText(raw, 'pubDate') || getText(raw, 'published') || getText(raw, 'dc:date') || getText(raw, 'updated');
    const published_on = pubRaw ? Math.floor(new Date(pubRaw).getTime() / 1000) : Math.floor(Date.now() / 1000);
    if (isNaN(published_on)) continue;

    const descRaw = getText(raw, 'description') || getText(raw, 'content:encoded') || getText(raw, 'summary') || getText(raw, 'content');
    const body = stripHtml(descRaw).slice(0, 280);

    // Image: media:thumbnail / media:content / enclosure / first <img>
    let imageurl = getAttr(raw, 'media:thumbnail', 'url') || getAttr(raw, 'media:content', 'url');
    if (!imageurl) {
      const enc = getAttr(raw, 'enclosure', 'type');
      if (enc.startsWith('image')) imageurl = getAttr(raw, 'enclosure', 'url');
    }
    if (!imageurl) imageurl = getFirstImg(descRaw);

    const rawCats = getText(raw, 'category');
    const categories = tagArticle(title, rawCats);

    articles.push({ id: url, title, url, source: sourceName, body, imageurl, published_on, categories });
  }

  return articles;
}

/* ── Fetch one source ────────────────────────────────────────── */
async function fetchSource(src: { url: string; name: string }): Promise<NewsArticle[]> {
  try {
    const res = await fetch(src.url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; GethStake/1.0)' },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];
    const text = await res.text();
    return parseFeed(text, src.name);
  } catch {
    return [];
  }
}

/* ── Route handler ───────────────────────────────────────────── */
export async function GET() {
  const results = await Promise.allSettled(SOURCES.map(fetchSource));

  const combined: NewsArticle[] = [];
  const seen = new Set<string>();

  for (const r of results) {
    if (r.status === 'fulfilled') {
      for (const a of r.value) {
        if (!seen.has(a.id)) {
          seen.add(a.id);
          combined.push(a);
        }
      }
    }
  }

  // Sort by newest first, cap at 40
  combined.sort((a, b) => b.published_on - a.published_on);
  const articles = combined.slice(0, 40);

  return NextResponse.json({ articles, count: articles.length }, {
    headers: { 'Cache-Control': 's-maxage=300, stale-while-revalidate=60' },
  });
}
