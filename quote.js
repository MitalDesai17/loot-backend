// api/quote.js
// Deploy this on Vercel. Once live, it'll be reachable at:
//   https://your-project-name.vercel.app/api/quote?ticker=AAPL
//
// Returns JSON shaped to drop straight into the app's ASSETS objects:
// {
//   ticker: "AAPL",
//   price: "$228.40",
//   change: "+0.92%",
//   positive: true,
//   stats: { range: "$226.90 – $229.10", volume: "41.2M shares", cap: "$3.4T" }
// }

export default async function handler(req, res) {
  // Allow the app to call this from anywhere (safe for a public read-only endpoint)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const rawTicker = req.query.ticker;
  if (!rawTicker) {
    res.status(400).json({ error: 'Missing ?ticker=SYMBOL' });
    return;
  }
  // Indices are typically passed with a leading ^ (e.g. ^GSPC for S&P 500)
  const ticker = String(rawTicker).toUpperCase();

  try {
    const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
      ticker
    )}?interval=1d&range=1d`;

    const yahooRes = await fetch(yahooUrl, {
      headers: {
        // Yahoo's endpoints sometimes reject requests with no user-agent at all
        'User-Agent': 'Mozilla/5.0 (compatible; LootApp/1.0)',
      },
    });

    if (!yahooRes.ok) {
      res.status(502).json({ error: `Yahoo returned ${yahooRes.status} for ${ticker}` });
      return;
    }

    const data = await yahooRes.json();
    const result = data?.chart?.result?.[0];

    if (!result) {
      res.status(404).json({ error: `No data found for ${ticker}` });
      return;
    }

    const meta = result.meta;
    const price = meta.regularMarketPrice;
    const prevClose = meta.previousClose ?? meta.chartPreviousClose;
    const dayHigh = meta.regularMarketDayHigh;
    const dayLow = meta.regularMarketDayLow;
    const volume = meta.regularMarketVolume;
    const currencySymbol = meta.currency === 'USD' ? '$' : '';

    const changePct = prevClose ? ((price - prevClose) / prevClose) * 100 : 0;
    const positive = changePct >= 0;

    const formatMoney = (n) =>
      n == null ? '—' : `${currencySymbol}${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const formatVolume = (n) => {
      if (n == null) return '—';
      if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M shares`;
      if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K shares`;
      return `${n} shares`;
    };

    res.status(200).json({
      ticker,
      price: formatMoney(price),
      change: `${positive ? '+' : ''}${changePct.toFixed(2)}%`,
      positive,
      stats: {
        range: `${formatMoney(dayLow)} – ${formatMoney(dayHigh)}`,
        volume: formatVolume(volume),
        // Market cap isn't in this endpoint — see note in README on adding it later
        cap: '—',
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch quote', detail: String(err) });
  }
}
