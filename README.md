# Loot Backend — Deploy Guide (no experience needed)

This is a tiny server with ONE job: fetch live stock prices from Yahoo
Finance and hand them to your Loot app in a clean format.

## What's in here
- `api/quote.js` — the actual function that fetches a stock quote
- `package.json` — just tells Vercel this is a project

## Step 1 — Put this on GitHub
1. Go to github.com, create a free account if you don't have one
2. Create a new repository (e.g. "loot-backend")
3. Upload these two files (`api/quote.js` and `package.json`) into it,
   keeping the `api` folder structure — GitHub's web upload lets you
   create the folder by typing `api/quote.js` as the file name when
   uploading

## Step 2 — Deploy on Vercel
1. Go to vercel.com, sign up (the "Continue with GitHub" option is
   easiest — it connects the two automatically)
2. Click "Add New... → Project"
3. Pick the `loot-backend` repo you just created
4. Leave all settings on default, click "Deploy"
5. Wait ~30 seconds — Vercel gives you a live URL like:
   `https://loot-backend-yourname.vercel.app`

## Step 3 — Test it
Open this in a browser (swap in your real URL):
```
https://loot-backend-yourname.vercel.app/api/quote?ticker=AAPL
```
You should see JSON like:
```json
{
  "ticker": "AAPL",
  "price": "$228.40",
  "change": "+0.92%",
  "positive": true,
  "stats": { "range": "$226.90 – $229.10", "volume": "41.2M shares", "cap": "—" }
}
```
If you see an error instead, screenshot it and send it over — Yahoo's
endpoints occasionally need small adjustments.

## Step 4 — Connect it to the app
In `App.js`, find this line near the top:
```js
const BACKEND_URL = 'https://YOUR-PROJECT-NAME.vercel.app';
```
Replace it with your real Vercel URL from Step 2. That's it — the app
auto-detects the change and starts pulling live prices instead of mock
data. Every stock/index card will show a small "🟢 Live prices" tag
once it's working; if the fetch ever fails for a ticker, that one
quietly falls back to the mock number instead of breaking the screen.

## Known limitation (for now)
Market cap isn't included yet — Yahoo's basic quote endpoint doesn't
return it, so it'll keep showing the mock market cap even with live
data on. We can add a second endpoint for that later if it matters to
you.
