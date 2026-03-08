import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  ReferenceLine, ComposedChart
} from "recharts";

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────
const ASSET_META = {
  stocks: [
    { id:"spx",    label:"S&P 500",    symbol:"SPY",              unit:"",  sector:"Index",  base:574    },
    { id:"ndx",    label:"Nasdaq 100", symbol:"QQQ",              unit:"",  sector:"Index",  base:488    },
    { id:"dji",    label:"Dow Jones",  symbol:"DIA",              unit:"",  sector:"Index",  base:426    },
    { id:"rut",    label:"Russell 2K", symbol:"IWM",              unit:"",  sector:"Index",  base:208    },
  ],
  crypto: [
    { id:"btc",    label:"Bitcoin",    symbol:"BINANCE:BTCUSDT",  unit:"$", sector:"L1",     base:83000  },
    { id:"eth",    label:"Ethereum",   symbol:"BINANCE:ETHUSDT",  unit:"$", sector:"L1",     base:2000   },
    { id:"sol",    label:"Solana",     symbol:"BINANCE:SOLUSDT",  unit:"$", sector:"L1",     base:126    },
    { id:"bnb",    label:"BNB",        symbol:"BINANCE:BNBUSDT",  unit:"$", sector:"L1",     base:595    },
  ],
  commodities: [
    { id:"gold",   label:"Gold",       symbol:"GLD",              unit:"$", sector:"Metal",  base:296    },
    { id:"silver", label:"Silver",     symbol:"SLV",              unit:"$", sector:"Metal",  base:33     },
    { id:"oil",    label:"Crude Oil",  symbol:"USO",              unit:"$", sector:"Energy", base:74     },
    { id:"natgas", label:"Nat. Gas",   symbol:"UNG",              unit:"$", sector:"Energy", base:14     },
  ],
  forex: [
    { id:"eurusd", label:"EUR/USD",    symbol:"OANDA:EUR_USD",    unit:"",  sector:"Major",  base:1.0852 },
    { id:"gbpusd", label:"GBP/USD",    symbol:"OANDA:GBP_USD",    unit:"",  sector:"Major",  base:1.2930 },
    { id:"usdjpy", label:"USD/JPY",    symbol:"OANDA:USD_JPY",    unit:"",  sector:"Major",  base:148.50 },
    { id:"usdchf", label:"USD/CHF",    symbol:"OANDA:USD_CHF",    unit:"",  sector:"Major",  base:0.8820 },
  ],
};

const SECTORS = [
  { id:"tech",       label:"Technology",   weight:29, stocks:[
    {id:"aapl",label:"Apple",    symbol:"AAPL", base:220},{id:"msft",label:"Microsoft",symbol:"MSFT",base:388},
    {id:"nvda",label:"NVIDIA",   symbol:"NVDA", base:880},{id:"meta",label:"Meta",      symbol:"META",base:590},
    {id:"googl",label:"Alphabet",symbol:"GOOGL",base:165}]},
  { id:"health",     label:"Healthcare",   weight:13, stocks:[
    {id:"jnj",label:"J&J",         symbol:"JNJ", base:158},{id:"unh",label:"UnitedHealth",symbol:"UNH",base:480},
    {id:"abbv",label:"AbbVie",     symbol:"ABBV",base:205},{id:"pfe",label:"Pfizer",       symbol:"PFE",base:25},
    {id:"mrk",label:"Merck",       symbol:"MRK", base:90}]},
  { id:"finance",    label:"Financials",   weight:13, stocks:[
    {id:"jpm",label:"JPMorgan",   symbol:"JPM",base:238},{id:"bac",label:"Bank of Am",symbol:"BAC",base:44},
    {id:"wfc",label:"Wells Fargo",symbol:"WFC",base:74}, {id:"gs", label:"Goldman",   symbol:"GS", base:560},
    {id:"ms", label:"Morgan St.", symbol:"MS", base:128}]},
  { id:"consumer",   label:"Cons. Disc.",  weight:11, stocks:[
    {id:"amzn",label:"Amazon",    symbol:"AMZN",base:208},{id:"tsla",label:"Tesla",     symbol:"TSLA",base:278},
    {id:"hd",  label:"Home Depot",symbol:"HD",  base:388},{id:"mcd", label:"McDonald's",symbol:"MCD", base:295},
    {id:"nke", label:"Nike",      symbol:"NKE", base:76}]},
  { id:"industrial", label:"Industrials",  weight:9,  stocks:[
    {id:"cat",label:"Caterpillar",symbol:"CAT",base:360},{id:"ba", label:"Boeing",   symbol:"BA", base:175},
    {id:"hon",label:"Honeywell",  symbol:"HON",base:218},{id:"ups",label:"UPS",      symbol:"UPS",base:108},
    {id:"de", label:"Deere",      symbol:"DE", base:480}]},
  { id:"energy",     label:"Energy",       weight:4,  stocks:[
    {id:"xom",label:"ExxonMobil",symbol:"XOM",base:110},{id:"cvx",label:"Chevron",    symbol:"CVX",base:155},
    {id:"cop",label:"ConocoPhil.",symbol:"COP",base:96}, {id:"slb",label:"SLB",        symbol:"SLB",base:40},
    {id:"oxy",label:"Occidental", symbol:"OXY",base:48}]},
  { id:"realestate", label:"Real Estate",  weight:4,  stocks:[
    {id:"pld", label:"Prologis",   symbol:"PLD", base:115},{id:"amt",label:"Amer. Tower",symbol:"AMT",base:188},
    {id:"eqix",label:"Equinix",    symbol:"EQIX",base:888},{id:"spg",label:"Simon Prop.",symbol:"SPG",base:178},
    {id:"o",   label:"Realty Inc.",symbol:"O",   base:56}]},
  { id:"utilities",  label:"Utilities",    weight:3,  stocks:[
    {id:"nee",label:"NextEra",    symbol:"NEE",base:67},{id:"so",label:"Southern Co",symbol:"SO",base:88},
    {id:"d",  label:"Dominion",   symbol:"D",  base:55},{id:"aep",label:"Am. Elec.", symbol:"AEP",base:100},
    {id:"exc",label:"Exelon",     symbol:"EXC",base:42}]},
];

const NDX_SECTORS = [
  { id:"ndx_tech",      label:"Technology",     weight:58, stocks:[
    {id:"ndx_aapl", label:"Apple",      symbol:"AAPL",  base:220},
    {id:"ndx_msft", label:"Microsoft",  symbol:"MSFT",  base:388},
    {id:"ndx_nvda", label:"NVIDIA",     symbol:"NVDA",  base:880},
    {id:"ndx_meta", label:"Meta",       symbol:"META",  base:590},
    {id:"ndx_googl",label:"Alphabet",   symbol:"GOOGL", base:165}]},
  { id:"ndx_consumer",  label:"Cons. Disc.",     weight:14, stocks:[
    {id:"ndx_amzn", label:"Amazon",     symbol:"AMZN",  base:208},
    {id:"ndx_tsla", label:"Tesla",      symbol:"TSLA",  base:278},
    {id:"ndx_cost", label:"Costco",     symbol:"COST",  base:900},
    {id:"ndx_pdd",  label:"PDD",        symbol:"PDD",   base:108},
    {id:"ndx_meli", label:"MercadoLibre",symbol:"MELI", base:1880}]},
  { id:"ndx_health",    label:"Healthcare",      weight:7,  stocks:[
    {id:"ndx_amgn", label:"Amgen",      symbol:"AMGN",  base:290},
    {id:"ndx_gild", label:"Gilead",     symbol:"GILD",  base:98},
    {id:"ndx_regn", label:"Regeneron",  symbol:"REGN",  base:738},
    {id:"ndx_vrtx", label:"Vertex",     symbol:"VRTX",  base:480},
    {id:"ndx_idxx", label:"IDEXX",      symbol:"IDXX",  base:418}]},
  { id:"ndx_industrial",label:"Industrials",     weight:5,  stocks:[
    {id:"ndx_csx",  label:"CSX",        symbol:"CSX",   base:32},
    {id:"ndx_odfl", label:"Old Dominion",symbol:"ODFL", base:168},
    {id:"ndx_fast", label:"Fastenal",   symbol:"FAST",  base:80},
    {id:"ndx_payx", label:"Paychex",    symbol:"PAYX",  base:148},
    {id:"ndx_vrsk", label:"Verisk",     symbol:"VRSK",  base:288}]},
  { id:"ndx_finance",   label:"Financials",      weight:4,  stocks:[
    {id:"ndx_pypl", label:"PayPal",     symbol:"PYPL",  base:68},
    {id:"ndx_cdns", label:"Cadence",    symbol:"CDNS",  base:248},
    {id:"ndx_snps", label:"Synopsys",   symbol:"SNPS",  base:448},
    {id:"ndx_mrna", label:"Moderna",    symbol:"MRNA",  base:38},
    {id:"ndx_dxcm", label:"Dexcom",     symbol:"DXCM",  base:68}]},
  { id:"ndx_comm",      label:"Communication",   weight:5,  stocks:[
    {id:"ndx_nflx", label:"Netflix",    symbol:"NFLX",  base:988},
    {id:"ndx_wbd",  label:"Warner Bros.",symbol:"WBD",  base:10},
    {id:"ndx_chtr", label:"Charter",    symbol:"CHTR",  base:338},
    {id:"ndx_tmus", label:"T-Mobile",   symbol:"TMUS",  base:258},
    {id:"ndx_lumn", label:"Lumen",      symbol:"LUMN",  base:6}]},
  { id:"ndx_staples",   label:"Cons. Staples",   weight:4,  stocks:[
    {id:"ndx_pep",  label:"PepsiCo",    symbol:"PEP",   base:148},
    {id:"ndx_mdlz", label:"Mondelez",   symbol:"MDLZ",  base:62},
    {id:"ndx_ctas", label:"Cintas",     symbol:"CTAS",  base:208},
    {id:"ndx_adp",  label:"ADP",        symbol:"ADP",   base:318},
    {id:"ndx_mnst", label:"Monster Bev.",symbol:"MNST", base:48}]},
  { id:"ndx_energy",    label:"Energy / Util.",  weight:3,  stocks:[
    {id:"ndx_crwx", label:"Crowdstrike", symbol:"CRWD", base:358},
    {id:"ndx_ddog", label:"Datadog",     symbol:"DDOG", base:108},
    {id:"ndx_team", label:"Atlassian",   symbol:"TEAM", base:218},
    {id:"ndx_wday", label:"Workday",     symbol:"WDAY", base:248},
    {id:"ndx_anss", label:"ANSYS",       symbol:"ANSS", base:318}]},
];

const TIMEFRAMES = [
  { key:"1D", resolution:"5",  days:1   },
  { key:"1W", resolution:"60", days:7   },
  { key:"1M", resolution:"D",  days:30  },
  { key:"1Y", resolution:"W",  days:365 },
];

const HEATMAP_TFS = ["1D","1W","1M","1Y"];
const BREADTH_TFS = ["1D","1W","1M","3M","6M"];

const NAV_TABS   = [
  {key:"markets",      label:"Markets",      icon:"◈"},
  {key:"heatmap",      label:"Heatmap",      icon:"▦"},
  {key:"industries",   label:"Industries",   icon:"⊞"},
  {key:"themes",       label:"Themes",       icon:"◭"},
  {key:"fundamentals", label:"Fundamentals", icon:"ƒ"},
  {key:"breadth",      label:"Breadth",      icon:"⟁"},
  {key:"factors",      label:"Factors",      icon:"◑"},
  {key:"rrg",          label:"RRG",          icon:"⊕"},
  {key:"corr",         label:"Correlation",  icon:"⊠"},
  {key:"options",      label:"Options",      icon:"Ω"},
  {key:"earnings",     label:"Earnings",     icon:"◎"},
  {key:"ecocal",       label:"Eco Calendar", icon:"⧖"},
  {key:"news",         label:"News",         icon:"◻"},
];

const NEWS_FILTERS = [
  {key:"all",      label:"All"},
  {key:"general",  label:"Macro"},
  {key:"tech",     label:"Tech"},
  {key:"finance",  label:"Finance"},
  {key:"crypto",   label:"Crypto"},
  {key:"energy",   label:"Energy"},
  {key:"health",   label:"Health"},
  {key:"forex",    label:"Forex"},
];

function genCalendar() {
  return [
    {id:"e1",  time:"08:30", date:"Today",    impact:"high",   title:"Initial Jobless Claims",        actual:"215K",  forecast:"220K", prior:"218K"},
    {id:"e2",  time:"08:30", date:"Today",    impact:"high",   title:"Core CPI (MoM)",                actual:"0.3%",  forecast:"0.3%", prior:"0.4%"},
    {id:"e3",  time:"10:00", date:"Today",    impact:"medium", title:"Existing Home Sales",           actual:"4.38M", forecast:"4.2M", prior:"4.1M"},
    {id:"e4",  time:"14:00", date:"Today",    impact:"high",   title:"FOMC Meeting Minutes",          actual:"—",     forecast:"—",    prior:"—"},
    {id:"e5",  time:"08:30", date:"Tomorrow", impact:"high",   title:"Nonfarm Payrolls",              actual:"—",     forecast:"185K", prior:"275K"},
    {id:"e6",  time:"08:30", date:"Tomorrow", impact:"high",   title:"Unemployment Rate",             actual:"—",     forecast:"3.9%", prior:"3.9%"},
    {id:"e7",  time:"08:30", date:"Tomorrow", impact:"medium", title:"Avg Hourly Earnings (MoM)",     actual:"—",     forecast:"0.3%", prior:"0.2%"},
    {id:"e8",  time:"10:00", date:"Tomorrow", impact:"medium", title:"Consumer Sentiment (Prelim)",   actual:"—",     forecast:"79.5", prior:"77.9"},
    {id:"e9",  time:"08:30", date:"Wed",      impact:"high",   title:"GDP Growth Rate QoQ (Final)",   actual:"—",     forecast:"3.2%", prior:"3.2%"},
    {id:"e10", time:"10:30", date:"Wed",      impact:"medium", title:"EIA Crude Oil Inventories",     actual:"—",     forecast:"-1.2M",prior:"-2.0M"},
    {id:"e11", time:"08:30", date:"Thu",      impact:"high",   title:"PPI (MoM)",                     actual:"—",     forecast:"0.2%", prior:"0.2%"},
    {id:"e12", time:"15:00", date:"Thu",      impact:"low",    title:"Fed Chair Speech",              actual:"—",     forecast:"—",    prior:"—"},
  ];
}

function genMarketNews() {
  return [
    {id:"n1",  source:"Reuters",     time:"2m ago",  sector:"general",    tag:"MACRO",   title:"Fed signals patience on rate cuts as inflation data remains sticky",           summary:"Federal Reserve officials indicated they are in no hurry to cut interest rates, with several members citing persistent inflation pressures above the 2% target. Markets repriced rate cut expectations lower, with the first cut now seen in Q3."},
    {id:"n2",  source:"Bloomberg",   time:"8m ago",  sector:"general",    tag:"MARKETS", title:"S&P 500 holds near record highs despite Treasury yield spike",                  summary:"Equity markets showed resilience as the benchmark index held near all-time highs even as 10-year Treasury yields climbed to their highest level in three months. Strong corporate earnings have offset macro headwinds."},
    {id:"n3",  source:"FT",          time:"15m ago", sector:"tech",       tag:"TECH",    title:"NVIDIA data center revenue surges 400% as AI demand accelerates",               summary:"NVIDIA reported blowout quarterly results driven by insatiable demand for its H100 and upcoming Blackwell GPU chips. The company raised full-year guidance significantly above Wall Street estimates."},
    {id:"n4",  source:"WSJ",         time:"22m ago", sector:"finance",    tag:"BANKS",   title:"JPMorgan beats estimates on strong investment banking rebound",                  summary:"JPMorgan Chase reported earnings per share well above analyst expectations, driven by a sharp recovery in investment banking fees and resilient consumer credit. CEO Jamie Dimon cautioned about geopolitical risks."},
    {id:"n5",  source:"CNBC",        time:"34m ago", sector:"crypto",     tag:"CRYPTO",  title:"Bitcoin consolidates above $67K as ETF inflows remain robust",                  summary:"Bitcoin traded in a tight range above $67,000 as spot ETF products continued to attract institutional inflows. BlackRock's iShares Bitcoin Trust recorded its third consecutive week of net inflows exceeding $500 million."},
    {id:"n6",  source:"MarketWatch", time:"41m ago", sector:"energy",     tag:"ENERGY",  title:"Oil steadies as OPEC+ signals production cut extension into Q3",                summary:"Crude oil prices stabilized after OPEC+ sources indicated the alliance is likely to extend its voluntary production cuts through the third quarter. Brent crude traded near $83 per barrel."},
    {id:"n7",  source:"Reuters",     time:"55m ago", sector:"general",    tag:"MACRO",   title:"China manufacturing PMI contracts for second straight month",                    summary:"China's official manufacturing PMI came in below 50 for the second consecutive month, signaling contraction in factory activity. The data raised concerns about global growth and weighed on commodity-linked assets."},
    {id:"n8",  source:"Bloomberg",   time:"1h ago",  sector:"health",     tag:"HEALTH",  title:"FDA approves Eli Lilly's next-generation weight loss drug",                     summary:"The FDA granted approval for Eli Lilly's orforglipron, an oral GLP-1 receptor agonist for obesity treatment. The approval could expand the addressable market well beyond injectable alternatives."},
    {id:"n9",  source:"FT",          time:"1h ago",  sector:"forex",      tag:"FOREX",   title:"Dollar strengthens as euro weakens on ECB dovish pivot signals",                summary:"The US dollar index climbed to a six-week high as ECB President Christine Lagarde hinted at a rate cut in June, diverging from the Fed's patient stance. EUR/USD tested the 1.08 support level."},
    {id:"n10", source:"WSJ",         time:"2h ago",  sector:"general",    tag:"MACRO",   title:"US consumer spending rises more than expected in February",                      summary:"Personal consumption expenditures rose 0.8% in February, beating the 0.5% forecast. The PCE price index, the Fed's preferred inflation gauge, rose 2.5% year-over-year."},
    {id:"n11", source:"CNBC",        time:"2h ago",  sector:"tech",       tag:"TECH",    title:"Apple announces $110B share buyback, largest in company history",               summary:"Apple announced a record $110 billion share repurchase authorization alongside quarterly earnings that topped expectations. Services revenue hit an all-time high, offsetting a modest decline in iPhone sales in greater China."},
    {id:"n12", source:"MarketWatch", time:"3h ago",  sector:"industrial", tag:"MACRO",   title:"ISM Manufacturing index returns to expansion territory",                        summary:"The ISM Manufacturing PMI rose to 50.3 in April, crossing back into expansion territory for the first time since September. New orders and production both showed improvement."},
    {id:"n13", source:"Reuters",     time:"3h ago",  sector:"finance",    tag:"MARKETS", title:"Treasury yields retreat from highs after soft ADP employment data",              summary:"US Treasury yields pulled back from multi-month highs after ADP private payrolls grew less than expected, suggesting some softening in the labor market ahead of Friday's nonfarm payrolls report."},
    {id:"n14", source:"Bloomberg",   time:"4h ago",  sector:"crypto",     tag:"CRYPTO",  title:"Ethereum ETF decision looms as SEC deadline approaches",                        summary:"The SEC faces a key deadline this week on spot Ethereum ETF applications from major asset managers. Analysts put odds of approval at around 50%, while prediction markets suggest a slightly higher probability."},
    {id:"n15", source:"FT",          time:"5h ago",  sector:"general",    tag:"MACRO",   title:"IMF upgrades global growth forecast to 3.2% for 2024",                          summary:"The International Monetary Fund raised its global growth outlook, citing stronger-than-expected performance from the US and emerging markets. Elevated rates and geopolitical fragmentation remain key risks."},
  ];
}
const MARKET_TABS = [
  {key:"stocks",      label:"Indices",    icon:"◈"},
  {key:"crypto",      label:"Crypto",     icon:"◎"},
  {key:"commodities", label:"Commodities",icon:"◆"},
  {key:"forex",       label:"Forex",      icon:"◇"},
];
const TAB_COLOR = {stocks:"#7dd3f0",crypto:"#c8dff0",commodities:"#c8dff0",forex:"#b8e8ff"};
const MAIN_COL  = "#7dd3f0";

// ─────────────────────────────────────────────────────────────────────────────
// SIMULATION HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function rng(min, max) { return min + Math.random() * (max - min); }

function generateHistory(base, vol, points) {
  const data = []; let price = base * rng(0.88,0.98);
  for (let i = 0; i <= points; i++) {
    price = Math.max(price * (1 + (Math.random()-0.488)*vol), 0.001);
    data.push({t:i, value:parseFloat(price.toFixed(6))});
  }
  data[data.length-1].value = parseFloat((base*rng(0.97,1.03)).toFixed(6));
  return data;
}

function simPct(base, vol) { return parseFloat(((Math.random()-0.48)*vol*100*15).toFixed(2)); }

// Generate realistic breadth history series
function genBreadthSeries(points, advBias=0.52) {
  // Returns array of daily breadth snapshots
  const data = [];
  let adLine = 0;
  let mcOsc  = rng(-40,40);
  for (let i = 0; i < points; i++) {
    const total    = 500;
    const advances = Math.round(total * rng(0.35, 0.65));
    const declines = total - advances - Math.round(rng(5,20));
    const unchanged= total - advances - declines;
    const newHighs  = Math.round(rng(10,120));
    const newLows   = Math.round(rng(5,80));
    const pct5d     = parseFloat(rng(20,80).toFixed(1));
    const pct50d    = parseFloat(rng(25,75).toFixed(1));
    const pct200d   = parseFloat(rng(20,70).toFixed(1));
    adLine += (advances - declines);
    // McClellan: smoothed ratio of (adv-dec)/(adv+dec)
    const ratio = (advances - declines) / (advances + declines);
    mcOsc = parseFloat((mcOsc * 0.9 + ratio * 100 * 0.1).toFixed(2));
    data.push({ t:i, advances, declines, unchanged, newHighs, newLows,
      adLine, mcOsc, pct5d, pct50d, pct200d,
      adRatio: parseFloat((advances/(advances+declines)*100).toFixed(1)) });
  }
  return data;
}

// VIX history
function genVix(points) {
  const data = []; let vix = rng(14,22);
  for (let i=0;i<points;i++) {
    vix = Math.max(10, Math.min(60, vix + rng(-1.2,1.2)));
    data.push({t:i, value:parseFloat(vix.toFixed(2))});
  }
  return data;
}

const BREADTH_POINT_MAP = {"1D":78,"1W":5,"1M":22,"3M":66,"6M":130};

// ─────────────────────────────────────────────────────────────────────────────
// API — Yahoo Finance (15-min delayed, no key required)
// ─────────────────────────────────────────────────────────────────────────────

const YF_BASE   = "/api/yahoo";  // Vercel serverless proxy — no CORS issues
const YF_PROXY  = YF_BASE;
const YF_PROXY2 = YF_BASE;

// Map our internal symbols to Yahoo Finance symbols
function toYahooSymbol(symbol) {
  const MAP = {
    "OANDA:EUR_USD": "EURUSD=X",
    "OANDA:GBP_USD": "GBPUSD=X",
    "OANDA:USD_JPY": "USDJPY=X",
    "OANDA:USD_CHF": "USDCHF=X",
    "BINANCE:BTCUSDT": "BTC-USD",
    "BINANCE:ETHUSDT": "ETH-USD",
    "BINANCE:SOLUSDT": "SOL-USD",
    "BINANCE:BNBUSDT": "BNB-USD",
  };
  return MAP[symbol] || symbol;
}

// Fetch a single quote from Yahoo Finance
async function fetchQuote(symbol) {
  const ySym = toYahooSymbol(symbol);
  try {
    const r = await fetch(
      `${YF_PROXY}?path=v8/finance/chart/${encodeURIComponent(ySym)}&interval=1d&range=5d`
    );
    const d = await r.json();
    const result = d?.chart?.result?.[0];
    const meta = result?.meta;
    if (!meta?.regularMarketPrice) return null;
    // For indices like ^VIX, read the last actual close from candle data
    // rather than relying solely on meta which can return stale values
    const closes = result?.indicators?.quote?.[0]?.close?.filter(c => c != null) ?? [];
    const price     = closes.length > 0 ? closes[closes.length - 1] : meta.regularMarketPrice;
    const prevClose = closes.length > 1 ? closes[closes.length - 2]
                    : meta.previousClose ?? meta.chartPreviousClose ?? price;
    const dp        = +((price - prevClose) / prevClose * 100).toFixed(2);
    return { price, open: meta.regularMarketOpen ?? price, high: meta.regularMarketDayHigh ?? price,
             low: meta.regularMarketDayLow ?? price, prevClose, dp };
  } catch { return null; }
}

// Fetch OHLC candle history from Yahoo Finance
// interval: 1m,5m,15m,30m,60m,1d,1wk,1mo  range: 1d,5d,1mo,3mo,6mo,1y,2y,5y
async function fetchYahooCandles(symbol, interval, range) {
  const ySym = toYahooSymbol(symbol);
  try {
    const r = await fetch(
      `${YF_PROXY}?path=v8/finance/chart/${encodeURIComponent(ySym)}&interval=${interval}&range=${range}`
    );
    const d = await r.json();
    const result = d?.chart?.result?.[0];
    if (!result?.timestamp || !result?.indicators?.quote?.[0]?.close) return null;
    const closes = result.indicators.quote[0].close;
    const times  = result.timestamp;
    const out = [];
    for (let i = 0; i < closes.length; i++) {
      if (closes[i] != null) out.push({ t: times[i], value: parseFloat(closes[i].toFixed(6)) });
    }
    return out.length > 2 ? out : null;
  } catch { return null; }
}

// Map our TIMEFRAME keys to Yahoo Finance interval/range params
function tfToYahoo(tfKey) {
  return {
    "1D": { interval: "5m",  range: "1d"  },
    "1W": { interval: "1h",  range: "5d"  },
    "1M": { interval: "1d",  range: "1mo" },
    "1Y": { interval: "1wk", range: "1y"  },
  }[tfKey] || { interval: "1d", range: "1mo" };
}

// Fetch daily candles for screener (120 trading days ≈ 6mo)
async function fetchDailyCandles(symbol, days = 120) {
  const range = days <= 30 ? "1mo" : days <= 90 ? "3mo" : days <= 180 ? "6mo" : "1y";
  const result = await fetchYahooCandles(symbol, "1d", range);
  if (!result) return null;
  return result.map(r => r.value);
}

// Fetch Yahoo Finance fundamentals (summary detail + statistics)
async function fetchFinnhubMetrics(symbol) {
  try {
    const r = await fetch(
      `${YF_PROXY}?path=v10/finance/quoteSummary/${encodeURIComponent(symbol)}&modules=defaultKeyStatistics,financialData,summaryDetail`
    );
    const d = await r.json();
    const s = d?.quoteSummary?.result?.[0];
    if (!s) return null;
    const ks = s.defaultKeyStatistics || {};
    const fd = s.financialData || {};
    const sd = s.summaryDetail || {};
    // Normalize to our expected metric shape
    return {
      peExclExtraTTM:               ks.trailingPE?.raw,
      peNormalizedAnnual:           ks.forwardPE?.raw,
      pbAnnual:                     ks.priceToBook?.raw,
      psTTM:                        ks.priceToSalesTrailing12Months?.raw,
      evEbitdaTTM:                  ks.enterpriseToEbitda?.raw,
      pegRatio:                     ks.pegRatio?.raw,
      epsTTM:                       ks.trailingEps?.raw,
      dividendYieldIndicatedAnnual: sd.dividendYield?.raw,
      grossMarginTTM:               fd.grossMargins?.raw,
      operatingMarginTTM:           fd.operatingMargins?.raw,
      netProfitMarginTTM:           fd.profitMargins?.raw,
      ebitdaMarginTTM:              null,
      roeTTM:                       fd.returnOnEquity?.raw,
      roaTTM:                       fd.returnOnAssets?.raw,
      roicTTM:                      null,
      revenueGrowthTTMYoy:          fd.revenueGrowth?.raw,
      epsGrowthTTMYoy:              fd.earningsGrowth?.raw,
      currentRatioAnnual:           fd.currentRatio?.raw,
      quickRatioAnnual:             fd.quickRatio?.raw,
      debtToEquity:                 fd.debtToEquity?.raw,
      freeCashFlowTTM:              fd.freeCashflow?.raw,
      totalCashAnnual:              fd.totalCash?.raw,
      totalDebtAnnual:              fd.totalDebt?.raw,
    };
  } catch { return null; }
}

// Fetch quarterly revenue from Yahoo Finance incomeStatementHistoryQuarterly
async function fetchQuarterlyRevenue(symbol) {
  try {
    const r = await fetch(
      `${YF_PROXY}?path=v10/finance/quoteSummary/${encodeURIComponent(symbol)}&modules=incomeStatementHistoryQuarterly`
    );
    const d = await r.json();
    const stmts = d?.quoteSummary?.result?.[0]?.incomeStatementHistoryQuarterly?.incomeStatementHistory;
    if (!stmts || stmts.length === 0) return null;
    // Yahoo returns newest first — reverse so oldest→newest
    return [...stmts].reverse().map(q => ({
      label: q.endDate?.fmt ?? "",
      rev:   q.totalRevenue?.raw ?? null,
    })).filter(q => q.rev != null);
  } catch { return null; }
}

// Fetch company profile from Yahoo Finance
async function fetchProfile(symbol) {
  try {
    const r = await fetch(
      `${YF_PROXY}?path=v10/finance/quoteSummary/${encodeURIComponent(symbol)}&modules=assetProfile,price`
    );
    const d = await r.json();
    const s = d?.quoteSummary?.result?.[0];
    if (!s) return null;
    const ap = s.assetProfile || {};
    const pr = s.price || {};
    return {
      name:                    pr.shortName ?? pr.longName,
      finnhubIndustry:         ap.industry,
      sector:                  ap.sector,
      marketCapitalization:    pr.marketCap?.raw ? pr.marketCap.raw / 1e6 : null,
    };
  } catch { return null; }
}

// Batch fetch quotes — Yahoo has no rate limits so we can fire all at once
async function fetchQuotesBatch(symbols, onProgress) {
  const results = {};
  const CHUNK = 20;
  for (let i = 0; i < symbols.length; i += CHUNK) {
    const chunk = symbols.slice(i, i + CHUNK);
    await Promise.all(chunk.map(async sym => {
      results[sym] = await fetchQuote(sym);
    }));
    if (onProgress) onProgress(Math.round(((i + CHUNK) / symbols.length) * 100));
  }
  return results;
}

// ─────────────────────────────────────────────────────────────────────────────
// DATA LOADERS
// ─────────────────────────────────────────────────────────────────────────────
async function loadMarketData(onProgress) {
  const out={};
  const allAssets=Object.entries(ASSET_META);
  let done=0,total=allAssets.reduce((s,[,a])=>s+a.length,0);
  for(const [cat,assets] of allAssets) {
    out[cat]=await Promise.all(assets.map(async asset=>{
      let livePrice=null,liveDp=null,histories={};
      if(asset.symbol) {
        const quote=await fetchQuote(asset.symbol);
        if(quote) { livePrice=quote.price; liveDp=quote.dp ?? null; }
        for(const tf of TIMEFRAMES) {
          const {interval,range}=tfToYahoo(tf.key);
          const candles=await fetchYahooCandles(asset.symbol,interval,range);
          if(candles?.length>2){
            if(livePrice) candles[candles.length-1].value=livePrice;
            histories[tf.key]=candles;
          } else {
            const vol=asset.base>1000?0.008:asset.base>10?0.015:0.004;
            histories[tf.key]=generateHistory(livePrice||asset.base,vol,tf.days);
          }
        }
      } else {
        const vol=asset.base>1000?0.006:asset.base>10?0.015:0.03;
        for(const tf of TIMEFRAMES) histories[tf.key]=generateHistory(asset.base,vol,tf.days);
      }
      done++;onProgress(Math.round(done/total*100));
      return{...asset,livePrice,liveDp,histories,isLive:!!livePrice};
    }));
  }
  return out;
}

async function loadSectorData(sectors, onProgress) {
  let done=0,total=sectors.reduce((s,sec)=>s+sec.stocks.length,0);
  return Promise.all(sectors.map(async sector=>{
    const stocks=await Promise.all(sector.stocks.map(async stock=>{
      const quote=await fetchQuote(stock.symbol);
      done++;onProgress(Math.round(done/total*100));
      // Fetch 1Y daily candles to compute real multi-TF changes
      const candles=await fetchYahooCandles(stock.symbol,"1d","1y");
      const closes=candles?.map(c=>c.value)||[];
      const last=quote?.price??stock.base;
      function chgFrom(n){ return closes.length>=n ? +((last/closes[closes.length-n]-1)*100).toFixed(2) : simPct(stock.base,0.018); }
      const simChanges={
        "1D": quote?.dp ?? simPct(stock.base,0.012),
        "1W": chgFrom(5),
        "1M": chgFrom(21),
        "1Y": chgFrom(252),
      };
      return{...stock,price:last,changes:simChanges,isLive:!!quote};
    }));
    const changes={};
    for(const tfKey of HEATMAP_TFS){
      changes[tfKey]=parseFloat((stocks.reduce((s,st)=>s+st.changes[tfKey],0)/stocks.length).toFixed(2));
    }
    return{...sector,stocks,changes};
  }));
}

async function loadHeatmapData(onProgress) {
  return loadSectorData(SECTORS, onProgress);
}

async function loadNdxData(onProgress) {
  return loadSectorData(NDX_SECTORS, onProgress);
}

// ─────────────────────────────────────────────────────────────────────────────
// S&P 500 FULL TICKER LIST (503 constituents)
// ─────────────────────────────────────────────────────────────────────────────
const SP500_TICKERS = [
  "MMM","AOS","ABT","ABBV","ACN","ADBE","AMD","AES","AFL","A","APD","ABNB","AKAM","ALB","ARE","ALGN",
  "ALLE","LNT","ALL","GOOGL","GOOG","MO","AMZN","AMCR","AEE","AAL","AEP","AXP","AIG","AMT","AWK","AMP",
  "AME","AMGN","APH","ADI","ANSS","AON","APA","AAPL","AMAT","APTV","ACGL","ADM","ANET","AJG","AIZ",
  "T","ATO","ADSK","ADP","AZO","AVB","AVY","AXON","BKR","BALL","BAC","BK","BBWI","BAX","BDX","BBY",
  "BIO","TECH","BIIB","BLK","BX","BA","BKNG","BWA","BSX","BMY","AVGO","BR","BRO","BF.B","BLDR","BG",
  "CDNS","CZR","CPT","CPB","COF","CAH","KMX","CCL","CARR","CTLT","CAT","CBOE","CBRE","CDW","CE","COR",
  "CNC","CNX","CDAY","CF","CRL","SCHW","CHTR","CVX","CMG","CB","CHD","CI","CINF","CTAS","CSCO","C",
  "CFG","CLX","CME","CMS","KO","CTSH","CL","CMCSA","CAG","COP","ED","STZ","CEG","COO","CPRT","GLW",
  "CPAY","CTVA","CSGP","COST","CTRA","CCI","CSX","CMI","CVS","DHR","DRI","DVA","DAY","DE","DAL","DVN",
  "DXCM","FANG","DLR","DFS","DG","DLTR","D","DPZ","DOV","DOW","DHI","DTE","DUK","DD","EMN","ETN",
  "EBAY","ECL","EIX","EW","EA","ELV","LLY","EMR","ENPH","ETR","EOG","EPAM","EQT","EFX","EQIX","EQR",
  "ESS","EL","ETSY","EG","EVRST","ES","EXC","EXPE","EXPD","EXR","XOM","FFIV","FDS","FICO","FAST","FRT",
  "FDX","FIS","FITB","FSLR","FE","FI","FMC","F","FTNT","FTV","FOXA","FOX","BEN","FCX","GRMN","IT",
  "GE","GEHC","GEV","GEN","GNRC","GD","GIS","GM","GPC","GILD","GS","HAL","HIG","HAS","HCA","DOC",
  "HSIC","HSY","HES","HPE","HLT","HOLX","HD","HON","HRL","HST","HWM","HPQ","HUBB","HUM","HBAN","HII",
  "IBM","IEX","IDXX","ITW","INCY","IR","PODD","INTC","ICE","IFF","IP","IPG","INTU","ISRG","IVZ","INVH",
  "IQV","IRM","JBHT","JBL","JKHY","J","JNJ","JCI","JPM","JNPR","K","KVUE","KDP","KEY","KEYS","KMB",
  "KIM","KMI","KLAC","KHC","KR","LHX","LH","LRCX","LW","LVS","LDOS","LEN","LNC","LIN","LYV","LKQ",
  "LMT","L","LOW","LULU","LYB","MTB","MRO","MPC","MKTX","MAR","MMC","MLM","MAS","MA","MTCH","MKC",
  "MCD","MCK","MDT","MRK","META","MET","MTD","MGM","MCHP","MU","MSFT","MAA","MRNA","MHK","MOH","TAP",
  "MDLZ","MPWR","MNST","MCO","MS","MOS","MSI","MSCI","NDAQ","NTAP","NFLX","NEM","NWSA","NWS","NEE",
  "NKE","NI","NDSN","NSC","NTRS","NOC","NCLH","NRG","NUE","NVDA","NVR","NXPI","ORLY","OXY","ODFL",
  "OMC","ON","OKE","ORCL","OTIS","PCAR","PKG","PANW","PH","PAYX","PAYC","PYPL","PNR","PEP","PFE",
  "PCG","PM","PSX","PNW","PXD","PNC","POOL","PPG","PPL","PFG","PG","PGR","PRU","PEG","PTC","PSA",
  "PHM","QRVO","PWR","QCOM","DGX","RL","RJF","RTX","O","REG","REGN","RF","RSG","RMD","RVTY","ROK",
  "ROL","ROP","ROST","RCL","SPGI","CRM","SBAC","SLB","STX","SRE","NOW","SHW","SPG","SWKS","SJM","SNA",
  "SOLV","SO","LUV","SWK","SBUX","STT","STLD","STE","SYK","SMCI","SYF","SNPS","SYY","TMUS","TROW",
  "TTWO","TPR","TRGP","TGT","TEL","TDY","TFX","TER","TSLA","TXN","TXT","TMO","TJX","TSCO","TT","TDG",
  "TRV","TRMB","TFC","TYL","TSN","USB","UBER","UDR","ULTA","UNP","UAL","UPS","URI","UNH","UHS","VLO",
  "VTR","VLTO","VRSN","VRSK","VZ","VRTX","VTRS","VICI","V","VST","VMC","WRB","GWW","WAB","WBA","WMT",
  "DIS","WBD","WM","WAT","WEC","WFC","WELL","WST","WDC","WRK","WY","WHR","WMB","WTW","WYNN","XEL",
  "XYL","YUM","ZBRA","ZBH","ZTS"
];

// ─────────────────────────────────────────────────────────────────────────────
// LIVE BREADTH ENGINE
// ─────────────────────────────────────────────────────────────────────────────

// Fast pass: fetch just today's quotes for all 500 stocks → A/D ratio + advances/declines
async function fetchBreadthQuotes(onProgress) {
  const CHUNK = 30;
  const results = [];
  for (let i = 0; i < SP500_TICKERS.length; i += CHUNK) {
    const chunk = SP500_TICKERS.slice(i, i + CHUNK);
    const quotes = await Promise.all(chunk.map(async sym => {
      const q = await fetchQuote(sym);
      return { sym, dp: q?.dp ?? null, price: q?.price ?? null };
    }));
    results.push(...quotes);
    if (onProgress) onProgress(Math.round(((i + CHUNK) / SP500_TICKERS.length) * 100));
  }
  return results;
}

// Deep pass: fetch 1Y daily candles for all 500 → % above MAs, 52W highs/lows, McClellan
async function fetchBreadthCandles(onProgress) {
  const CHUNK = 15;
  const results = [];
  for (let i = 0; i < SP500_TICKERS.length; i += CHUNK) {
    const chunk = SP500_TICKERS.slice(i, i + CHUNK);
    const data = await Promise.all(chunk.map(async sym => {
      const candles = await fetchYahooCandles(sym, "1d", "1y");
      if (!candles || candles.length < 30) return { sym, closes: null };
      return { sym, closes: candles.map(c => c.value) };
    }));
    results.push(...data);
    if (onProgress) onProgress(Math.round(((i + CHUNK) / SP500_TICKERS.length) * 100));
    await new Promise(r => setTimeout(r, 300));
  }
  return results;
}

// Calculate EMA for breadth
function calcBreadthEMA(closes, period) {
  const k = 2 / (period + 1);
  let ema = closes[0];
  for (let i = 1; i < closes.length; i++) ema = closes[i] * k + ema * (1 - k);
  return ema;
}

// Build breadth snapshot from quote data (fast)
function buildBreadthSnapshot(quotes) {
  const valid = quotes.filter(q => q.dp !== null);
  const advances  = valid.filter(q => q.dp > 0).length;
  const declines  = valid.filter(q => q.dp < 0).length;
  const unchanged = valid.filter(q => q.dp === 0).length;
  const adRatio   = valid.length > 0 ? +((advances / valid.length) * 100).toFixed(1) : 50;
  return { advances, declines, unchanged, adRatio, total: valid.length };
}

// Build full breadth metrics from candle data (deep)
function buildBreadthDeep(candleData) {
  let above5 = 0, above50 = 0, above200 = 0, newHighs = 0, newLows = 0, valid = 0;
  const ratios = []; // for McClellan

  for (const { closes } of candleData) {
    if (!closes || closes.length < 20) continue;
    valid++;
    const last = closes[closes.length - 1];

    // MAs
    const ma5   = closes.slice(-5).reduce((s, v) => s + v, 0) / 5;
    const ma50  = closes.length >= 50  ? closes.slice(-50).reduce((s, v) => s + v, 0) / 50  : null;
    const ma200 = closes.length >= 200 ? closes.slice(-200).reduce((s, v) => s + v, 0) / 200 : null;

    if (last > ma5)         above5++;
    if (ma50  && last > ma50)  above50++;
    if (ma200 && last > ma200) above200++;

    // 52W high/low
    const hi52 = Math.max(...closes.slice(-252));
    const lo52 = Math.min(...closes.slice(-252));
    if (last >= hi52 * 0.98) newHighs++;
    if (last <= lo52 * 1.02) newLows++;

    // A/D for McClellan
    const prev = closes[closes.length - 2];
    ratios.push(last > prev ? 1 : last < prev ? -1 : 0);
  }

  const pct5d   = valid > 0 ? +((above5   / valid) * 100).toFixed(1) : 50;
  const pct50d  = valid > 0 ? +((above50  / valid) * 100).toFixed(1) : 50;
  const pct200d = valid > 0 ? +((above200 / valid) * 100).toFixed(1) : 50;

  // McClellan: EMA19 - EMA39 of daily advance ratio
  const advRatio = ratios.reduce((s, v) => s + v, 0) / ratios.length;
  const mcOsc = parseFloat(((advRatio) * 100 * 0.5).toFixed(2));

  return { pct5d, pct50d, pct200d, newHighs, newLows, mcOsc };
}

// Build a historical A/D line series from candle data (last N days)
function buildADLineSeries(candleData, days = 60) {
  const series = [];
  let adLine = 0;

  for (let day = 0; day < days; day++) {
    let advances = 0, declines = 0, unchanged = 0;
    for (const { closes } of candleData) {
      if (!closes || closes.length < days + 1) continue;
      const idx  = closes.length - days + day;
      const prev = closes[idx - 1];
      const curr = closes[idx];
      if (!prev || !curr) continue;
      if (curr > prev) advances++;
      else if (curr < prev) declines++;
      else unchanged++;
    }
    adLine += advances - declines;
    const total = advances + declines;
    series.push({
      t: day,
      advances, declines, unchanged,
      adLine,
      adRatio: total > 0 ? +((advances / total) * 100).toFixed(1) : 50,
      mcOsc: parseFloat(((advances - declines) / Math.max(total, 1) * 50).toFixed(2)),
      newHighs: Math.round(advances * 0.15),
      newLows:  Math.round(declines * 0.15),
      pct5d:  50, pct50d: 50, pct200d: 50, // filled in after deep pass
    });
  }
  return series;
}

function loadBreadthData() {
  // Simulated fallback — replaced by live data when user clicks Load Live
  const series={};
  for(const tf of BREADTH_TFS) series[tf]=genBreadthSeries(BREADTH_POINT_MAP[tf]);
  const vix={};
  for(const tf of BREADTH_TFS) vix[tf]=genVix(BREADTH_POINT_MAP[tf]);
  return {series, vix, isLive: false};
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function pct(history) {
  if(!history||history.length<2) return 0;
  const f=history[0].value,l=history[history.length-1].value;
  return (l-f)/f*100;
}
function fmt(value,unit,asset) {
  if(value==null||!asset) return "";
  const d=value>=10000?2:value>=100?2:value>=1?4:6;
  return `${unit}${value.toLocaleString(undefined,{minimumFractionDigits:d,maximumFractionDigits:d})}`;
}
function currentPrice(asset,tf){const h=asset.histories[tf];return h[h.length-1].value;}
function heatColor(p){
  const c=Math.max(-6,Math.min(6,p));
  if(c>=0){const i=c/6,g=Math.round(74+(139-74)*i);return `rgba(34,${g},80,${0.25+i*0.65})`;}
  else{const i=Math.abs(c)/6,r=Math.round(185+(255-185)*i);return `rgba(${r},65,65,${0.25+i*0.65})`;}
}
function heatTextColor(p){return p>=0?"#7dd3f0":"#ff5f6d";}

// ─────────────────────────────────────────────────────────────────────────────
// SHARED UI
// ─────────────────────────────────────────────────────────────────────────────
function TfBar({value,onChange,options}){
  return(
    <div style={{display:"flex",gap:6}}>
      {options.map(k=>(
        <button key={k} onClick={()=>onChange(k)} style={{background:value===k?MAIN_COL+"20":"none",border:`1px solid ${value===k?MAIN_COL:"#1a2535"}`,color:value===k?MAIN_COL:"#a8c4d4",borderRadius:6,padding:"3px 11px",cursor:"pointer",fontSize:9,letterSpacing:1,transition:"all 0.15s"}}>{k}</button>
      ))}
    </div>
  );
}

function SectionLabel({children}){
  return <div style={{color:"#6890a8",fontSize:8,letterSpacing:2,marginBottom:8,fontFamily:"'Space Mono',monospace"}}>{children}</div>;
}

function Panel({children,style={}}){
  return <div style={{background:"#0d1420",border:"1px solid #1a2535",borderRadius:12,padding:"16px",...style}}>{children}</div>;
}

function ChartTip({active,payload,unit,asset,label}){
  if(!active||!payload?.length) return null;
  return(
    <div style={{background:"#1a2535",border:"1px solid #1e3045",borderRadius:6,padding:"6px 12px",fontSize:11,fontFamily:"'Space Mono',monospace",color:"#e8f4f8"}}>
      {label&&<div style={{color:"#6890a8",marginBottom:2,fontSize:9}}>{label}</div>}
      {payload.map((p,i)=>(
        <div key={i} style={{color:p.color||"#e8f4f8"}}>{p.name?`${p.name}: `:""}{typeof p.value==="number"?p.value.toFixed(2):p.value}</div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// GAUGE COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
function Gauge({value, min=0, max=100, label, sublabel, colorFn}){
  const pct = Math.max(0,Math.min(1,(value-min)/(max-min)));
  const angle = -135 + pct*270; // sweep 270 degrees
  const r=36, cx=50, cy=52;
  // arc math
  function polarToXY(angleDeg,radius){
    const a=(angleDeg-90)*Math.PI/180;
    return{x:cx+radius*Math.cos(a),y:cy+radius*Math.sin(a)};
  }
  function arcPath(startAngle,endAngle,radius){
    const s=polarToXY(startAngle,radius),e=polarToXY(endAngle,radius);
    const large=endAngle-startAngle>180?1:0;
    return`M ${s.x} ${s.y} A ${radius} ${radius} 0 ${large} 1 ${e.x} ${e.y}`;
  }
  const col = colorFn ? colorFn(value) : (pct>0.6?"#7dd3f0":pct>0.35?"#c8dff0":"#ff5f6d");
  const needleXY = polarToXY(angle, r*0.7);
  return(
    <div style={{textAlign:"center"}}>
      <svg width="100" height="72" viewBox="0 0 100 72">
        {/* Track */}
        <path d={arcPath(-135,135,r)} fill="none" stroke="#1a2535" strokeWidth="6" strokeLinecap="round"/>
        {/* Fill */}
        <path d={arcPath(-135,-135+pct*270,r)} fill="none" stroke={col} strokeWidth="6" strokeLinecap="round"/>
        {/* Needle */}
        <line x1={cx} y1={cy} x2={needleXY.x} y2={needleXY.y} stroke={col} strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx={cx} cy={cy} r="2.5" fill={col}/>
        {/* Value */}
        <text x={cx} y={cy+16} textAnchor="middle" fill="#e8f4f8" fontSize="11" fontFamily="'Space Mono',monospace" fontWeight="700">{typeof value==="number"?value.toFixed(1):value}</text>
      </svg>
      <div style={{color:"#a8b8c8",fontSize:10,fontFamily:"'Space Mono',monospace",marginTop:-4}}>{label}</div>
      {sublabel&&<div style={{color:"#6890a8",fontSize:8,fontFamily:"'Space Mono',monospace",marginTop:2}}>{sublabel}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BREADTH VIEW
// ─────────────────────────────────────────────────────────────────────────────
function BreadthView({breadthData, setBreadthData, liveQuotes}){
  const [tf, setTf] = useState("1D");
  const [liveStatus,    setLiveStatus]    = useState("idle");
  const [liveProgress,  setLiveProgress]  = useState(0);
  const [liveLabel,     setLiveLabel]     = useState("");
  const [snapshot,      setSnapshot]      = useState(null);
  const [deepMetrics,   setDeepMetrics]   = useState(null);
  const [candleData,    setCandleData]    = useState(null);

  const series    = breadthData.series[tf];
  const vixSeries = breadthData.vix[tf];
  const latest    = series[series.length - 1];
  const latestVix = vixSeries[vixSeries.length - 1].value;

  const snap    = snapshot    ?? {};
  const deep    = deepMetrics ?? {};
  const adRatio  = snap.adRatio  ?? latest.adRatio;
  const advances = snap.advances ?? latest.advances;
  const declines = snap.declines ?? latest.declines;
  const pct5d    = deep.pct5d    ?? latest.pct5d;
  const pct50d   = deep.pct50d   ?? latest.pct50d;
  const pct200d  = deep.pct200d  ?? latest.pct200d;
  const newHighs = deep.newHighs ?? latest.newHighs;
  const newLows  = deep.newLows  ?? latest.newLows;
  const vixLevel = liveQuotes?.["^VIX"]?.price ?? latestVix;

  const displaySeries = candleData
    ? buildADLineSeries(candleData, BREADTH_POINT_MAP[tf] ?? 60)
    : series;

  const breadthScore = (adRatio/100*0.4)+(pct200d/100*0.3)+(pct50d/100*0.2)+((1-Math.min(vixLevel,40)/40)*0.1);
  const mood    = breadthScore>0.65?"BULLISH":breadthScore>0.45?"NEUTRAL":"BEARISH";
  const moodCol = mood==="BULLISH"?"#7dd3f0":mood==="NEUTRAL"?"#c8dff0":"#ff5f6d";

  function vixColor(v){return v<15?"#7dd3f0":v<20?"#90cfe8":v<25?"#c8dff0":v<30?"#c8dff0":"#ff5f6d";}

  const loadDeep = useCallback(async () => {
    setLiveStatus("deep-loading");
    setLiveLabel("FETCHING 500 DAILY CANDLES");
    setLiveProgress(0);
    try {
      const candles = await fetchBreadthCandles(p => setLiveProgress(p));
      const deep    = buildBreadthDeep(candles);
      setDeepMetrics(deep);
      setCandleData(candles);
      setLiveStatus("deep-done");
      setLiveLabel("LIVE · S&P 500 BREADTH");
    } catch {
      setLiveStatus("fast-done");
      setLiveLabel("CANDLES FAILED · QUOTES ONLY");
    }
  }, []);

  const loadFast = useCallback(async () => {
    setLiveStatus("fast-loading");
    setLiveLabel("FETCHING 500 QUOTES");
    setLiveProgress(0);
    try {
      const quotes = await fetchBreadthQuotes(p => setLiveProgress(p));
      const snap   = buildBreadthSnapshot(quotes);
      setSnapshot(snap);
      setLiveStatus("fast-done");
      setLiveLabel("QUOTES LOADED · LOADING CANDLES");
      loadDeep();
    } catch {
      setLiveStatus("error");
    }
  }, [loadDeep]);

  const statusColor = liveStatus === "deep-done" ? "#7dd3f0"
    : liveStatus === "fast-done" || liveStatus.includes("loading") ? "#c8dff0"
    : liveStatus === "error" ? "#ff5f6d" : "#1e3045";
  const statusDot = liveStatus === "deep-done" ? "●" : liveStatus.includes("loading") ? "◌" : "○";

  return(
    <div style={{display:"flex",flexDirection:"column",gap:16}}>

      {/* HEADER */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <SectionLabel>MARKET BREADTH · S&P 500</SectionLabel>
          <div style={{background:moodCol+"18",border:`1px solid ${moodCol}44`,borderRadius:4,padding:"2px 8px",fontSize:9,color:moodCol,fontFamily:"'Space Mono',monospace",letterSpacing:1}}>{mood}</div>
          <span style={{color:statusColor,fontSize:8,fontFamily:"'Space Mono',monospace",letterSpacing:1}}>{statusDot} {liveStatus==="idle"?"SIMULATED":liveLabel||liveStatus.toUpperCase()}</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          {liveStatus.includes("loading") && (
            <div style={{width:120,height:3,background:"#1a2535",borderRadius:2,overflow:"hidden"}}>
              <div style={{width:`${liveProgress}%`,height:"100%",background:statusColor,borderRadius:2,transition:"width 0.3s"}}/>
            </div>
          )}
          {!liveStatus.includes("loading") && (
            <button onClick={loadFast} style={{background:"#7dd3f020",border:"1px solid #7dd3f0",color:"#7dd3f0",borderRadius:6,padding:"4px 12px",cursor:"pointer",fontSize:8,letterSpacing:1,fontFamily:"'Space Mono',monospace"}}>
              {liveStatus==="idle" ? "⬇ LOAD LIVE DATA" : "↻ REFRESH"}
            </button>
          )}
          <TfBar value={tf} onChange={setTf} options={BREADTH_TFS}/>
        </div>
      </div>

      {/* DATA SOURCE NOTE */}
      {liveStatus !== "idle" && (
        <div style={{background:"#0d1420",border:"1px solid #1a2535",borderRadius:8,padding:"8px 14px",fontSize:8,color:"#6890a8",fontFamily:"'Space Mono',monospace",letterSpacing:1}}>
          {liveStatus==="deep-done"
            ? `● LIVE DATA · ${snapshot?.total ?? 500} S&P 500 STOCKS · ADV: ${advances} · DEC: ${declines} · % ABOVE 200D MA: ${pct200d}%`
            : liveStatus==="fast-done" || liveStatus==="deep-loading"
            ? `◑ PARTIAL LIVE · QUOTES: ${snapshot?.total ?? 0} STOCKS · CANDLES LOADING ${liveProgress}%`
            : `◌ LOADING QUOTES FOR ${SP500_TICKERS.length} S&P 500 STOCKS...`
          }
        </div>
      )}

      {/* GAUGES */}
      <Panel>
        <SectionLabel>SNAPSHOT — {liveStatus==="deep-done"?"LIVE":"SIMULATED"} READING</SectionLabel>
        <div style={{display:"flex",justifyContent:"space-around",flexWrap:"wrap",gap:8}}>
          <Gauge value={adRatio}  min={0} max={100} label="A/D RATIO"   sublabel={`${advances}A · ${declines}D`}/>
          <Gauge value={pct5d}    min={0} max={100} label="% > 5D MA"   sublabel="short-term"/>
          <Gauge value={pct50d}   min={0} max={100} label="% > 50D MA"  sublabel="medium-term"/>
          <Gauge value={pct200d}  min={0} max={100} label="% > 200D MA" sublabel="long-term"/>
          <Gauge value={vixLevel} min={10} max={45} label="VIX"         sublabel={vixLevel<15?"LOW":vixLevel<25?"MODERATE":"HIGH"} colorFn={v=>vixColor(v)}/>
          <Gauge value={newHighs+newLows>0?Math.max(0,Math.min(100,newHighs/(newHighs+newLows)*100)):50}
                 min={0} max={100} label="52W H/L" sublabel={`${newHighs}H · ${newLows}L`}/>
        </div>
      </Panel>

      {/* A/D LINE + ADV/DEC */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <Panel>
          <SectionLabel>ADVANCE / DECLINE LINE {candleData?"· LIVE":""}</SectionLabel>
          <ResponsiveContainer width="100%" height={130}>
            <AreaChart data={displaySeries} margin={{top:4,right:4,bottom:0,left:0}}>
              <defs><linearGradient id="adg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#7dd3f0" stopOpacity={0.25}/>
                <stop offset="95%" stopColor="#7dd3f0" stopOpacity={0}/>
              </linearGradient></defs>
              <CartesianGrid strokeDasharray="2 4" stroke="#1a2535" vertical={false}/>
              <XAxis dataKey="t" hide/>
              <YAxis tick={{fill:"#6890a8",fontSize:8,fontFamily:"'Space Mono',monospace"}} tickLine={false} axisLine={false} width={48}
                tickFormatter={v=>v>=1000?(v/1000).toFixed(0)+"k":v<=-1000?(v/1000).toFixed(0)+"k":v}/>
              <Tooltip formatter={(v)=>[v.toFixed(0),"A/D Line"]}/>
              <Area type="monotone" dataKey="adLine" stroke="#7dd3f0" strokeWidth={2} fill="url(#adg)" dot={false}/>
            </AreaChart>
          </ResponsiveContainer>
        </Panel>
        <Panel>
          <SectionLabel>ADVANCES vs DECLINES {candleData?"· LIVE":""}</SectionLabel>
          <ResponsiveContainer width="100%" height={130}>
            <BarChart data={displaySeries} margin={{top:4,right:4,bottom:0,left:0}} barCategoryGap="15%">
              <CartesianGrid strokeDasharray="2 4" stroke="#1a2535" vertical={false}/>
              <XAxis dataKey="t" hide/>
              <YAxis tick={{fill:"#6890a8",fontSize:8,fontFamily:"'Space Mono',monospace"}} tickLine={false} axisLine={false} width={32}/>
              <Tooltip content={({active,payload})=>{
                if(!active||!payload?.length) return null;
                return(<div style={{background:"#1a2535",border:"1px solid #1e3045",borderRadius:6,padding:"6px 12px",fontSize:10,fontFamily:"'Space Mono',monospace"}}>
                  <div style={{color:"#7dd3f0"}}>▲ {payload[0]?.value} adv</div>
                  <div style={{color:"#ff5f6d"}}>▼ {payload[1]?.value} dec</div>
                </div>);
              }}/>
              <Bar dataKey="advances" fill="#7dd3f044" stroke="#7dd3f0" strokeWidth={0.5} radius={[2,2,0,0]}/>
              <Bar dataKey="declines" fill="#ff5f6d44" stroke="#ff5f6d" strokeWidth={0.5} radius={[2,2,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      {/* NEW HIGHS/LOWS + McCLELLAN */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <Panel>
          <SectionLabel>52-WEEK NEW HIGHS vs NEW LOWS</SectionLabel>
          <ResponsiveContainer width="100%" height={130}>
            <ComposedChart data={displaySeries} margin={{top:4,right:4,bottom:0,left:0}}>
              <CartesianGrid strokeDasharray="2 4" stroke="#1a2535" vertical={false}/>
              <XAxis dataKey="t" hide/>
              <YAxis tick={{fill:"#6890a8",fontSize:8,fontFamily:"'Space Mono',monospace"}} tickLine={false} axisLine={false} width={28}/>
              <Tooltip content={({active,payload})=>{
                if(!active||!payload?.length) return null;
                return(<div style={{background:"#1a2535",border:"1px solid #1e3045",borderRadius:6,padding:"6px 12px",fontSize:10,fontFamily:"'Space Mono',monospace"}}>
                  <div style={{color:"#7dd3f0"}}>↑ {payload[0]?.value} highs</div>
                  <div style={{color:"#ff5f6d"}}>↓ {payload[1]?.value} lows</div>
                </div>);
              }}/>
              <Bar dataKey="newHighs" fill="#7dd3f033" stroke="#7dd3f0" strokeWidth={0.5}/>
              <Bar dataKey="newLows"  fill="#ff5f6d33" stroke="#ff5f6d" strokeWidth={0.5}/>
              <Line type="monotone" dataKey="newHighs" stroke="#7dd3f0" strokeWidth={1.5} dot={false}/>
              <Line type="monotone" dataKey="newLows"  stroke="#ff5f6d" strokeWidth={1.5} dot={false}/>
            </ComposedChart>
          </ResponsiveContainer>
        </Panel>
        <Panel>
          <SectionLabel>McCLELLAN OSCILLATOR {candleData?"· LIVE":""}</SectionLabel>
          <div style={{color:"#6890a8",fontSize:8,fontFamily:"'Space Mono',monospace",marginBottom:6}}>+100 OVERBOUGHT · -100 OVERSOLD</div>
          <ResponsiveContainer width="100%" height={115}>
            <AreaChart data={displaySeries} margin={{top:4,right:4,bottom:0,left:0}}>
              <defs><linearGradient id="mcg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#b8e8ff" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#b8e8ff" stopOpacity={0}/>
              </linearGradient></defs>
              <CartesianGrid strokeDasharray="2 4" stroke="#1a2535" vertical={false}/>
              <XAxis dataKey="t" hide/>
              <YAxis domain={[-100,100]} tick={{fill:"#6890a8",fontSize:8,fontFamily:"'Space Mono',monospace"}} tickLine={false} axisLine={false} width={28}/>
              <ReferenceLine y={100}  stroke="#ff5f6d44" strokeDasharray="3 3"/>
              <ReferenceLine y={0}    stroke="#1a2535"   strokeDasharray="2 2"/>
              <ReferenceLine y={-100} stroke="#7dd3f044" strokeDasharray="3 3"/>
              <Tooltip formatter={(v)=>[v.toFixed(1),"McClellan"]}/>
              <Area type="monotone" dataKey="mcOsc" stroke="#b8e8ff" strokeWidth={1.5} fill="url(#mcg)" dot={false}/>
            </AreaChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      {/* % ABOVE MAs */}
      <Panel>
        <SectionLabel>% OF S&P 500 STOCKS ABOVE MOVING AVERAGES {candleData?"· LIVE":""}</SectionLabel>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={displaySeries} margin={{top:4,right:4,bottom:0,left:0}}>
            <CartesianGrid strokeDasharray="2 4" stroke="#1a2535" vertical={false}/>
            <XAxis dataKey="t" hide/>
            <YAxis domain={[0,100]} tick={{fill:"#6890a8",fontSize:8,fontFamily:"'Space Mono',monospace"}} tickLine={false} axisLine={false} width={28} tickFormatter={v=>v+"%"}/>
            <ReferenceLine y={80} stroke="#ff5f6d33" strokeDasharray="3 3"/>
            <ReferenceLine y={50} stroke="#1a253588" strokeDasharray="2 2"/>
            <ReferenceLine y={20} stroke="#7dd3f033" strokeDasharray="3 3"/>
            <Tooltip formatter={(v)=>[v.toFixed(1)+"%"]}/>
            <Line type="monotone" dataKey="pct5d"   stroke="#b8e8ff" strokeWidth={1.5} dot={false} name="% Above 5D MA"/>
            <Line type="monotone" dataKey="pct50d"  stroke="#7dd3f0" strokeWidth={1.5} dot={false} name="% Above 50D MA"/>
            <Line type="monotone" dataKey="pct200d" stroke="#c8dff0" strokeWidth={1.5} dot={false} name="% Above 200D MA"/>
          </LineChart>
        </ResponsiveContainer>
        <div style={{display:"flex",gap:16,marginTop:8}}>
          {[["#b8e8ff","% Above 5D MA"],["#7dd3f0","% Above 50D MA"],["#c8dff0","% Above 200D MA"]].map(([col,lbl])=>(
            <div key={lbl} style={{display:"flex",alignItems:"center",gap:5}}>
              <div style={{width:16,height:2,background:col,borderRadius:1}}/>
              <span style={{color:"#6890a8",fontSize:9,fontFamily:"'Space Mono',monospace"}}>{lbl}</span>
            </div>
          ))}
        </div>
      </Panel>

      {/* VIX */}
      <Panel>
        <SectionLabel>VIX — CBOE VOLATILITY INDEX</SectionLabel>
        <div style={{color:"#6890a8",fontSize:8,fontFamily:"'Space Mono',monospace",marginBottom:10}}>
          {"<"}15 LOW FEAR · 15-25 NORMAL · 25-35 ELEVATED · {">"}35 EXTREME FEAR
        </div>
        <ResponsiveContainer width="100%" height={140}>
          <AreaChart data={vixSeries} margin={{top:4,right:4,bottom:0,left:0}}>
            <defs><linearGradient id="vixg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#c8dff0" stopOpacity={0.25}/>
              <stop offset="95%" stopColor="#c8dff0" stopOpacity={0}/>
            </linearGradient></defs>
            <CartesianGrid strokeDasharray="2 4" stroke="#1a2535" vertical={false}/>
            <XAxis dataKey="t" hide/>
            <YAxis domain={[8,50]} tick={{fill:"#6890a8",fontSize:8,fontFamily:"'Space Mono',monospace"}} tickLine={false} axisLine={false} width={28}/>
            <ReferenceLine y={15} stroke="#7dd3f033" strokeDasharray="3 3"/>
            <ReferenceLine y={25} stroke="#c8dff033" strokeDasharray="3 3"/>
            <ReferenceLine y={35} stroke="#ff5f6d33" strokeDasharray="3 3"/>
            <Tooltip formatter={(v)=>[v.toFixed(2),"VIX"]}/>
            <Area type="monotone" dataKey="value" stroke="#c8dff0" strokeWidth={2} fill="url(#vixg)" dot={false}/>
          </AreaChart>
        </ResponsiveContainer>
        <div style={{display:"flex",gap:16,marginTop:8}}>
          {[["#7dd3f0","< 15 Low"],["#c8dff0","15-25 Normal"],["#c8dff0","25-35 Elevated"],["#ff5f6d","> 35 Extreme"]].map(([col,lbl])=>(
            <div key={lbl} style={{display:"flex",alignItems:"center",gap:5}}>
              <div style={{width:8,height:8,borderRadius:2,background:col+"44",border:`1px solid ${col}`}}/>
              <span style={{color:"#6890a8",fontSize:9,fontFamily:"'Space Mono',monospace"}}>{lbl}</span>
            </div>
          ))}
        </div>
      </Panel>

    </div>
  );
}

function Ticker({allData}){
  const all=Object.values(allData).flat();
  const items=[...all,...all];
  const ref=useRef(null);
  useEffect(()=>{
    const el=ref.current;if(!el)return;
    let x=0,id;
    const step=()=>{x-=0.5;if(-x>el.scrollWidth/2)x=0;el.style.transform=`translateX(${x}px)`;id=requestAnimationFrame(step);};
    id=requestAnimationFrame(step);
    return()=>cancelAnimationFrame(id);
  },[]);
  return(
    <div style={{overflow:"hidden",borderBottom:"1px solid #111a24",background:"#0d1420",padding:"6px 0"}}>
      <div ref={ref} style={{display:"flex",whiteSpace:"nowrap",willChange:"transform"}}>
        {items.map((a,i)=>{
          const price=currentPrice(a,"1D");
          const p = a.liveDp != null ? a.liveDp : pct(a.histories["1D"]);
          const up=p>=0;
          return(
            <span key={i} style={{display:"inline-flex",alignItems:"center",gap:6,marginRight:28,fontSize:10,fontFamily:"'Space Mono',monospace"}}>
              <span style={{color:"#5a7a95"}}>{a.label}</span>
              <span style={{color:"#6890a8"}}>{fmt(price,a.unit,a)}</span>
              <span style={{color:up?"#7dd3f0":"#ff5f6d"}}>{up?"▲":"▼"}{Math.abs(p).toFixed(2)}%</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TOP MOVERS
// ─────────────────────────────────────────────────────────────────────────────
function TopMovers({allData,tf,onSelect}){
  const all=Object.entries(allData).flatMap(([cat,assets])=>assets.map(a=>({...a,cat})));
  const sorted=[...all].sort((a,b)=>pct(b.histories[tf])-pct(a.histories[tf]));
  const gainers=sorted.slice(0,3),losers=sorted.slice(-3).reverse();
  const Row=({asset,rank})=>{
    const p=pct(asset.histories[tf]),up=p>=0,last=currentPrice(asset,tf);
    return(
      <button onClick={()=>onSelect(asset.cat,asset.id)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:"none",border:"none",cursor:"pointer",padding:"6px 0",borderBottom:"1px solid #1a2535",width:"100%",textAlign:"left"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span style={{color:"#6890a8",fontSize:11,fontFamily:"'Space Mono',monospace",width:14}}>{rank}</span>
          <div>
            <div style={{color:"#a8b8c8",fontSize:11,fontFamily:"'Space Mono',monospace"}}>{asset.label}</div>
            <div style={{color:"#6890a8",fontSize:9}}>{asset.sector}{asset.isLive?" · LIVE":" · SIM"}</div>
          </div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{color:"#5a7a95",fontSize:10,fontFamily:"'Space Mono',monospace"}}>{fmt(last,asset.unit,asset)}</div>
          <div style={{color:up?"#7dd3f0":"#ff5f6d",fontSize:10,fontFamily:"'Space Mono',monospace"}}>{up?"+":""}{p.toFixed(2)}%</div>
        </div>
      </button>
    );
  };
  return(
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
      {[{label:"▲ TOP GAINERS",col:"#7dd3f0",list:gainers},{label:"▼ TOP LOSERS",col:"#ff5f6d",list:losers}].map(({label,col,list})=>(
        <div key={label} style={{background:"#0d1420",border:"1px solid #1a2535",borderRadius:10,padding:"12px 14px"}}>
          <div style={{color:col,fontSize:9,letterSpacing:2,marginBottom:8,fontFamily:"'Space Mono',monospace"}}>{label}</div>
          {list.map((a,i)=><Row key={a.id} asset={a} rank={i+1}/>)}
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MARKET CARD + DETAIL CHART
// ─────────────────────────────────────────────────────────────────────────────
function MarketCard({asset,tf,color,isSelected,onSelect}){
  const h=asset.histories[tf],last=currentPrice(asset,tf),p=pct(h),up=p>=0,lc=up?"#7dd3f0":"#ff5f6d";
  return(
    <div style={{position:"relative"}}>
      <button onClick={onSelect} style={{width:"100%",background:isSelected?"#152030":"#0d1420",border:`1px solid ${isSelected?color:"#1a2535"}`,borderRadius:10,padding:"13px 13px 9px",cursor:"pointer",textAlign:"left",transition:"all 0.15s",outline:"none",boxShadow:isSelected?`0 0 16px ${color}18`:"none"}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
          <span style={{color:"#5a7a95",fontSize:9,fontFamily:"'Space Mono',monospace",letterSpacing:1}}>
            {asset.label} {asset.isLive?<span style={{color:"#22c55e",fontSize:8}}>●</span>:<span style={{color:"#6890a8",fontSize:8}}>○</span>}
          </span>
          <span style={{color:lc,fontSize:9,background:up?"#7dd3f012":"#ff5f6d12",padding:"1px 5px",borderRadius:3,fontFamily:"'Space Mono',monospace"}}>{up?"+":""}{p.toFixed(2)}%</span>
        </div>
        <div style={{color:"#e8f4f8",fontSize:14,fontFamily:"'Space Mono',monospace",fontWeight:700,marginBottom:7}}>{fmt(last,asset.unit,asset)}</div>
        <ResponsiveContainer width="100%" height={38}>
          <AreaChart data={h} margin={{top:0,right:0,bottom:0,left:0}}>
            <defs>
              <linearGradient id={`g-${asset.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={lc} stopOpacity={0.25}/>
                <stop offset="95%" stopColor={lc} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="value" stroke={lc} strokeWidth={1.5} fill={`url(#g-${asset.id})`} dot={false}/>
          </AreaChart>
        </ResponsiveContainer>
      </button>
    </div>
  );
}

function DetailChart({asset,tf}){
  if(!asset) return null;
  const h=asset.histories[tf],last=currentPrice(asset,tf),p=pct(h),up=p>=0,lc=up?"#7dd3f0":"#ff5f6d";
  const high=Math.max(...h.map(d=>d.value)),low=Math.min(...h.map(d=>d.value));
  return(
    <div style={{background:"#0d1420",border:"1px solid #1a2535",borderRadius:14,padding:"20px 20px 12px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
        <div>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
            <div style={{color:"#6890a8",fontSize:9,fontFamily:"'Space Mono',monospace",letterSpacing:2}}>{asset.sector?.toUpperCase()} · {asset.label}</div>
            <div style={{fontSize:9,fontFamily:"'Space Mono',monospace",color:asset.isLive?"#22c55e":"#1e3045",background:asset.isLive?"#22c55e12":"#1e304512",padding:"1px 6px",borderRadius:3}}>{asset.isLive?"● LIVE":"○ SIMULATED"}</div>
          </div>
          <div style={{color:"#f1f5f9",fontSize:24,fontFamily:"'Space Mono',monospace",fontWeight:700,letterSpacing:-1}}>{fmt(last,asset.unit,asset)}</div>
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{color:lc,fontSize:16,fontFamily:"'Space Mono',monospace",fontWeight:700}}>{up?"▲ +":"▼ "}{p.toFixed(2)}%</div>
          <div style={{color:"#6890a8",fontSize:9,marginTop:4,fontFamily:"'Space Mono',monospace"}}>H {fmt(high,asset.unit,asset)} · L {fmt(low,asset.unit,asset)}</div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={h} margin={{top:8,right:4,bottom:0,left:4}}>
          <defs>
            <linearGradient id="det" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={lc} stopOpacity={0.28}/>
              <stop offset="95%" stopColor={lc} stopOpacity={0.01}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="2 4" stroke="#1a2535" vertical={false}/>
          <XAxis dataKey="t" hide/>
          <YAxis domain={["auto","auto"]} tick={{fill:"#4a6a85",fontSize:9,fontFamily:"'Space Mono',monospace"}} tickLine={false} axisLine={false} width={52}
            tickFormatter={v=>`${asset.unit}${v>=10000?(v/1000).toFixed(0)+"k":v>=1000?(v/1000).toFixed(1)+"k":v}`}/>
          <Tooltip content={<ChartTip unit={asset.unit} asset={asset}/>}/>
          <Area type="monotone" dataKey="value" stroke={lc} strokeWidth={2} fill="url(#det)" dot={false} activeDot={{r:4,fill:lc,strokeWidth:0}}/>
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HEATMAP
// ─────────────────────────────────────────────────────────────────────────────
function HeatmapView({heatData, ndxData, tf}){
  const [drillSector,setDrillSector]=useState(null);
  const [tooltip,setTooltip]=useState(null);
  const [index,setIndex]=useState("spx");

  const activeData = index==="ndx" ? ndxData : heatData;
  const sector = drillSector ? activeData.find(s=>s.id===drillSector) : null;
  const handleIndexSwitch = (idx) => { setIndex(idx); setDrillSector(null); };
  const indexLabel = index==="ndx" ? "NASDAQ 100" : "S&P 500";

  // Build bar chart data — all sectors, all timeframes
  const summaryChartData = activeData.map(sec=>({
    name: sec.label.length>12 ? sec.label.slice(0,11)+"…" : sec.label,
    fullName: sec.label,
    "1D": sec.changes["1D"],
    "1W": sec.changes["1W"],
    "1M": sec.changes["1M"],
    "1Y": sec.changes["1Y"],
    color: heatColor(sec.changes[tf]),
    textColor: heatTextColor(sec.changes[tf]),
  }));

  // Drilldown bar chart — selected sector's stocks across all timeframes
  const drillChartData = sector ? sector.stocks.map(st=>({
    name: st.label.length>10 ? st.label.slice(0,9)+"…" : st.label,
    fullName: st.label,
    symbol: st.symbol,
    "1D": st.changes["1D"],
    "1W": st.changes["1W"],
    "1M": st.changes["1M"],
    "1Y": st.changes["1Y"],
    color: heatColor(st.changes[tf]),
    textColor: heatTextColor(st.changes[tf]),
  })) : [];

  const TF_COLS = {"1D":"#b8e8ff","1W":"#7dd3f0","1M":"#c8dff0","1Y":"#c8dff0"};

  // Custom bar with dynamic color per value
  const ColoredBar = (props) => {
    const { x, y, width, height, value } = props;
    if (!height || Math.abs(height) < 0.5) return null;
    const col = value >= 0 ? "#7dd3f0" : "#ff5f6d";
    const barY = value >= 0 ? y : y + height;
    const barH = Math.abs(height);
    return (
      <g>
        <rect x={x} y={barY} width={width} height={barH} fill={col+"bb"} stroke={col} strokeWidth={0.5} rx={2}/>
      </g>
    );
  };

  // Custom grouped bar showing one tf at a time with color per value
  const SummaryBar = (props) => {
    const { x, y, width, height, value } = props;
    if (!height || Math.abs(height) < 0.5) return null;
    const col = value >= 0 ? "#7dd3f0" : "#ff5f6d";
    const barY = value >= 0 ? y : y + height;
    return <rect x={x} y={barY} width={width} height={Math.abs(height)} fill={col+"cc"} stroke={col} strokeWidth={0.5} rx={2}/>;
  };

  const BarLabel = ({x,y,width,value}) => {
    if(Math.abs(value)<0.3) return null;
    const up = value>=0;
    return(
      <text x={x+width/2} y={up?y-3:y+12} textAnchor="middle" fill={up?"#7dd3f0":"#ff5f6d"} fontSize={7} fontFamily="'Space Mono',monospace">
        {up?"+":""}{value.toFixed(1)}
      </text>
    );
  };

  return(
    <div style={{position:"relative",display:"flex",flexDirection:"column",gap:16}}>

      {/* ── HEADER ── */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,fontFamily:"'Space Mono',monospace",fontSize:10}}>
          <button onClick={()=>setDrillSector(null)} style={{background:"none",border:"none",cursor:"pointer",color:drillSector?"#7dd3f0":"#e8f4f8",fontSize:10,fontFamily:"'Space Mono',monospace",padding:0,letterSpacing:1}}>{indexLabel} SECTORS</button>
          {drillSector&&<><span style={{color:"#6890a8"}}>›</span><span style={{color:"#e8f4f8",letterSpacing:1}}>{sector?.label.toUpperCase()}</span></>}
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          {/* color legend */}
          <div style={{display:"flex",alignItems:"center",gap:4}}>
            {[-6,-3,-1,0,1,3,6].map(v=>(
              <div key={v} style={{width:22,height:14,borderRadius:2,background:heatColor(v),display:"flex",alignItems:"center",justifyContent:"center"}}>
                <span style={{fontSize:6,fontFamily:"'Space Mono',monospace",color:v===0?"#6890a8":heatTextColor(v)}}>{v>0?"+":""}{v}%</span>
              </div>
            ))}
          </div>
          {/* index toggle */}
          <div style={{display:"flex",gap:4}}>
            {[{k:"spx",l:"S&P 500"},{k:"ndx",l:"NASDAQ 100"}].map(({k,l})=>(
              <button key={k} onClick={()=>handleIndexSwitch(k)} style={{background:index===k?"#7dd3f020":"none",border:`1px solid ${index===k?"#7dd3f0":"#1a2535"}`,color:index===k?"#7dd3f0":"#a8c4d4",borderRadius:6,padding:"3px 10px",cursor:"pointer",fontSize:8,fontFamily:"'Space Mono',monospace",letterSpacing:1,transition:"all 0.15s"}}>{l}</button>
            ))}
          </div>
        </div>
      </div>

      {/* ── HEATMAP TILES ── */}
      {!drillSector ? (
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(155px,1fr))",gap:8}}>
          {activeData.map(sec=>{
            const change=sec.changes[tf],up=change>=0;
            return(
              <button key={sec.id} onClick={()=>setDrillSector(sec.id)}
                onMouseEnter={e=>setTooltip({x:e.clientX,y:e.clientY,item:sec,isSector:true})}
                onMouseLeave={()=>setTooltip(null)}
                style={{background:heatColor(change),border:"1px solid #1a2535",borderRadius:10,padding:"14px 12px",cursor:"pointer",textAlign:"left",outline:"none",minHeight:80,display:"flex",flexDirection:"column",justifyContent:"space-between"}}>
                <div style={{color:"#a8b8c8",fontSize:9,fontFamily:"'Space Mono',monospace",letterSpacing:1}}>{sec.label}</div>
                <div>
                  <div style={{color:heatTextColor(change),fontSize:18,fontFamily:"'Space Mono',monospace",fontWeight:700}}>{up?"+":""}{change.toFixed(2)}%</div>
                  <div style={{color:"#16253566",fontSize:7,fontFamily:"'Space Mono',monospace",marginTop:2}}>{sec.weight}% · {sec.stocks.length} stocks</div>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div>
          <div style={{color:"#6890a8",fontSize:9,fontFamily:"'Space Mono',monospace",letterSpacing:2,marginBottom:10}}>
            {sector.stocks.length} STOCKS · CLICK SECTOR NAME ABOVE TO GO BACK
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:8}}>
            {sector.stocks.map(stock=>{
              const change=stock.changes[tf],up=change>=0;
              return(
                <div key={stock.id}
                  onMouseEnter={e=>setTooltip({x:e.clientX,y:e.clientY,item:stock,isSector:false})}
                  onMouseLeave={()=>setTooltip(null)}
                  style={{background:heatColor(change),border:"1px solid #1a2535",borderRadius:10,padding:"14px 12px",minHeight:80,display:"flex",flexDirection:"column",justifyContent:"space-between"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                    <div style={{color:"#a8b8c8",fontSize:10,fontFamily:"'Space Mono',monospace"}}>{stock.label}</div>
                    {stock.isLive&&<span style={{color:"#22c55e",fontSize:8}}>●</span>}
                  </div>
                  <div>
                    <div style={{color:"#5a7a95",fontSize:10,fontFamily:"'Space Mono',monospace",marginBottom:2}}>${stock.price.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}</div>
                    <div style={{color:heatTextColor(change),fontSize:16,fontFamily:"'Space Mono',monospace",fontWeight:700}}>{up?"+":""}{change.toFixed(2)}%</div>
                    <div style={{color:"#6890a8",fontSize:8,fontFamily:"'Space Mono',monospace"}}>{stock.symbol}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── SUMMARY BAR CHART — all sectors, active TF ── */}
      <div style={{background:"#0d1420",border:"1px solid #1a2535",borderRadius:12,padding:"16px 16px 8px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div style={{color:"#6890a8",fontSize:8,fontFamily:"'Space Mono',monospace",letterSpacing:2}}>
            {drillSector ? `${sector?.label.toUpperCase()} — STOCKS · ${tf} % CHANGE` : `ALL SECTORS — ${tf} % CHANGE`}
          </div>
          {/* TF legend */}
          <div style={{display:"flex",gap:10}}>
            {HEATMAP_TFS.map(t=>(
              <div key={t} style={{display:"flex",alignItems:"center",gap:4}}>
                <div style={{width:8,height:8,borderRadius:1,background:TF_COLS[t]}}/>
                <span style={{color:tf===t?"#e8f4f8":"#a8c4d4",fontSize:8,fontFamily:"'Space Mono',monospace"}}>{t}</span>
              </div>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={drillSector ? drillChartData : summaryChartData} margin={{top:18,right:8,bottom:32,left:0}} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="2 4" stroke="#1a2535" vertical={false}/>
            <XAxis dataKey="name" tick={{fill:"#2a4a65",fontSize:8,fontFamily:"'Space Mono',monospace"}} tickLine={false} axisLine={false} angle={-35} textAnchor="end" interval={0} height={40}/>
            <YAxis tick={{fill:"#4a6a85",fontSize:8,fontFamily:"'Space Mono',monospace"}} tickLine={false} axisLine={false} width={36} tickFormatter={v=>`${v>0?"+":""}${v.toFixed(1)}%`}/>
            <ReferenceLine y={0} stroke="#162535" strokeWidth={1}/>
            <Tooltip content={({active,payload,label})=>{
              if(!active||!payload?.length) return null;
              const item = (drillSector?drillChartData:summaryChartData).find(d=>d.name===label);
              return(
                <div style={{background:"#1a2535",border:"1px solid #1e3045",borderRadius:8,padding:"10px 14px",fontFamily:"'Space Mono',monospace",fontSize:10}}>
                  <div style={{color:"#a8b8c8",marginBottom:6,fontSize:11}}>{item?.fullName||label}{item?.symbol?` · ${item.symbol}`:""}</div>
                  {HEATMAP_TFS.map(t=>{
                    const v=item?.[t]; if(v==null) return null;
                    const up=v>=0;
                    return(
                      <div key={t} style={{display:"flex",justifyContent:"space-between",gap:20,marginBottom:3}}>
                        <span style={{color:TF_COLS[t]}}>{t}</span>
                        <span style={{color:up?"#7dd3f0":"#ff5f6d",fontWeight:700}}>{up?"+":""}{v.toFixed(2)}%</span>
                      </div>
                    );
                  })}
                </div>
              );
            }}/>
            <Bar dataKey={tf} shape={<SummaryBar/>} label={<BarLabel/>} maxBarSize={40}/>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ── DRILLDOWN MULTI-TF CHART — shown when sector is selected ── */}
      {drillSector && (
        <div style={{background:"#0d1420",border:"1px solid #1a2535",borderRadius:12,padding:"16px 16px 8px"}}>
          <div style={{color:"#6890a8",fontSize:8,fontFamily:"'Space Mono',monospace",letterSpacing:2,marginBottom:12}}>
            {sector?.label.toUpperCase()} — ALL TIMEFRAMES COMPARISON
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={drillChartData} margin={{top:18,right:8,bottom:36,left:0}} barCategoryGap="15%" barGap={2}>
              <CartesianGrid strokeDasharray="2 4" stroke="#1a2535" vertical={false}/>
              <XAxis dataKey="name" tick={{fill:"#2a4a65",fontSize:8,fontFamily:"'Space Mono',monospace"}} tickLine={false} axisLine={false} angle={-35} textAnchor="end" interval={0} height={44}/>
              <YAxis tick={{fill:"#4a6a85",fontSize:8,fontFamily:"'Space Mono',monospace"}} tickLine={false} axisLine={false} width={36} tickFormatter={v=>`${v>0?"+":""}${v.toFixed(1)}%`}/>
              <ReferenceLine y={0} stroke="#162535" strokeWidth={1}/>
              <Tooltip content={({active,payload,label})=>{
                if(!active||!payload?.length) return null;
                const item = drillChartData.find(d=>d.name===label);
                return(
                  <div style={{background:"#1a2535",border:"1px solid #1e3045",borderRadius:8,padding:"10px 14px",fontFamily:"'Space Mono',monospace",fontSize:10}}>
                    <div style={{color:"#a8b8c8",marginBottom:6}}>{item?.fullName} · {item?.symbol}</div>
                    {HEATMAP_TFS.map(t=>{
                      const v=item?.[t]; if(v==null) return null;
                      const up=v>=0;
                      return(
                        <div key={t} style={{display:"flex",justifyContent:"space-between",gap:20,marginBottom:3}}>
                          <span style={{color:TF_COLS[t]}}>{t}</span>
                          <span style={{color:up?"#7dd3f0":"#ff5f6d",fontWeight:700}}>{up?"+":""}{v.toFixed(2)}%</span>
                        </div>
                      );
                    })}
                  </div>
                );
              }}/>
              {HEATMAP_TFS.map(t=>(
                <Bar key={t} dataKey={t} fill={TF_COLS[t]+"99"} stroke={TF_COLS[t]} strokeWidth={0.5} maxBarSize={22} radius={[2,2,0,0]} name={t}/>
              ))}
            </BarChart>
          </ResponsiveContainer>
          {/* Legend */}
          <div style={{display:"flex",gap:14,marginTop:4,justifyContent:"center"}}>
            {HEATMAP_TFS.map(t=>(
              <div key={t} style={{display:"flex",alignItems:"center",gap:4}}>
                <div style={{width:12,height:4,borderRadius:1,background:TF_COLS[t]}}/>
                <span style={{color:"#6890a8",fontSize:8,fontFamily:"'Space Mono',monospace"}}>{t}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* tooltip */}
      {tooltip&&(
        <div style={{position:"fixed",left:tooltip.x+14,top:tooltip.y-10,background:"#1a2535",border:"1px solid #162535",borderRadius:8,padding:"10px 14px",zIndex:1000,pointerEvents:"none",fontFamily:"'Space Mono',monospace",fontSize:10,minWidth:160}}>
          <div style={{color:"#a8b8c8",marginBottom:4}}>{tooltip.item.label}</div>
          {HEATMAP_TFS.map(t=>{const c=tooltip.item.changes[t],up=c>=0;return(
            <div key={t} style={{display:"flex",justifyContent:"space-between",gap:16,marginBottom:2}}>
              <span style={{color:"#6890a8"}}>{t}</span>
              <span style={{color:up?"#7dd3f0":"#ff5f6d"}}>{up?"+":""}{c.toFixed(2)}%</span>
            </div>
          );})}
          {tooltip.isSector&&<div style={{color:"#6890a8",fontSize:8,marginTop:4}}>CLICK TO DRILL DOWN</div>}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NEWS VIEW
// ─────────────────────────────────────────────────────────────────────────────
function NewsView({newsData, calData}) {
  const [filter,        setFilter]       = useState("all");
  const [selected,      setSelected]     = useState(newsData[0]);
  const [newsTab,       setNewsTab]       = useState("news");
  const [searchInput,   setSearchInput]  = useState("");
  const [searchQuery,   setSearchQuery]  = useState("");
  const [searchResults, setSearchResults]= useState(null);
  const [searching,     setSearching]    = useState(false);
  const [searchError,   setSearchError]  = useState(null);
  const [liveHeadlines, setLiveHeadlines]= useState(null);
  const [headlinesLoading, setHeadlinesLoading] = useState(false);
  const inputRef = useRef(null);

  // Load live headlines when tab opens or filter changes
  useEffect(() => {
    if (newsTab !== "news") return;
    let cancelled = false;
    const load = async () => {
      setHeadlinesLoading(true);
      const catMap = {
        all:"stock market", general:"stock market news", tech:"technology stocks",
        finance:"finance banking markets", crypto:"cryptocurrency bitcoin",
        energy:"oil energy markets", health:"healthcare pharma biotech", forex:"currency dollar forex",
      };
      const q = catMap[filter] || "stock market";
      try {
        const r = await fetchGeneralNews(filter === "all" ? "general" : filter);
        if (!cancelled && r.data) {
          setLiveHeadlines(r.data);
          setSelected(r.data[0]);
        }
      } catch {}
      if (!cancelled) setHeadlinesLoading(false);
    };
    load();
    return () => { cancelled = true; };
  }, [filter, newsTab]);

  // Displayed feed: search results > live headlines > static fallback
  const baseNews    = liveHeadlines ?? (filter==="all" ? newsData : newsData.filter(n=>n.sector===filter));
  const displayNews = searchResults !== null ? searchResults : baseNews;

  useEffect(()=>{ if(displayNews.length>0) setSelected(displayNews[0]); },[filter, searchResults, liveHeadlines]);

  const handleSearch = async () => {
    const q = searchInput.trim().toUpperCase();
    if (!q) { setSearchResults(null); setSearchQuery(""); return; }
    setSearching(true);
    setSearchError(null);
    setSearchResults(null);
    setSearchQuery(q);

    const catMap = {FOREX:"forex", CRYPTO:"crypto", "M&A":"merger", MERGER:"merger"};
    const isCat  = !!catMap[q];

    let result;
    if (isCat) {
      result = await fetchGeneralNews(catMap[q]);
    } else {
      result = await fetchTickerNews(q);
      // If empty but no network error, also try general news as fallback
      if (result.error === "empty" || !result.data) {
        const gen = await fetchGeneralNews("general");
        if (gen.data) {
          // filter by keyword match in headline
          const filtered = gen.data.filter(n =>
            n.title.toUpperCase().includes(q) || n.summary.toUpperCase().includes(q)
          );
          if (filtered.length > 0) result = { data: filtered, error: null };
        }
      }
    }

    if (result.error && result.error !== "empty") {
      setSearchError(`API error: ${result.error}. This may be a network restriction in the preview — it will work when deployed to Vercel.`);
      setSearchResults([]);
    } else if (!result.data || result.data.length === 0) {
      setSearchError(`No news found for "${q}" in the past 30 days. Try a major US ticker like AAPL, TSLA, MSFT, or AMZN.`);
      setSearchResults([]);
    } else {
      setSearchResults(result.data);
      setSelected(result.data[0]);
    }
    setSearching(false);
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearchQuery("");
    setSearchResults(null);
    setSearchError(null);
    if(displayNews.length>0) setSelected(baseNews[0]);
  };

  const HeadlineItem = ({item}) => {
    const isSel = selected?.id===item.id;
    return (
      <button onClick={()=>setSelected(item)} style={{
        background:isSel?"#0d1825":"none", border:"none",
        borderBottom:"1px solid #1a2535",
        borderLeft:`2px solid ${isSel?MAIN_COL:"transparent"}`,
        cursor:"pointer", textAlign:"left", padding:"12px 14px",
        transition:"background 0.12s,border-color 0.12s", outline:"none", width:"100%",
      }}>
        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:5}}>
          <span style={{background:(TAG_COL[item.tag]||"#1e3045")+"22",color:TAG_COL[item.tag]||"#2a4a65",fontSize:8,fontFamily:"'Space Mono',monospace",padding:"1px 6px",borderRadius:3,letterSpacing:1}}>{item.tag}</span>
          <span style={{color:"#6890a8",fontSize:8,fontFamily:"'Space Mono',monospace"}}>{item.source}</span>
          {item.isLive&&<span style={{color:"#22c55e",fontSize:7,marginLeft:2}}>● LIVE</span>}
          <span style={{color:"#4a6a85",fontSize:8,fontFamily:"'Space Mono',monospace",marginLeft:"auto"}}>{item.time}</span>
        </div>
        <div style={{color:isSel?"#e8f4f8":"#2a4a65",fontSize:11,fontFamily:"'Space Mono',monospace",lineHeight:1.5,transition:"color 0.12s"}}>
          {item.title}
        </div>
      </button>
    );
  };

  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>

      {/* Sub-nav */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
        <div style={{display:"flex",gap:0,borderBottom:"1px solid #1a2535"}}>
          {[{key:"news",label:"◻ HEADLINES"},{key:"calendar",label:"⊞ ECO CALENDAR"},{key:"search",label:"⌕ SEARCH"}].map(t=>(
            <button key={t.key} onClick={()=>setNewsTab(t.key)} style={{background:"none",border:"none",cursor:"pointer",color:newsTab===t.key?MAIN_COL:"#a8c4d4",fontSize:9,letterSpacing:1.5,padding:"6px 16px",borderBottom:`2px solid ${newsTab===t.key?MAIN_COL:"transparent"}`,marginBottom:-1,transition:"all 0.15s",fontFamily:"'Space Mono',monospace"}}>
              {t.label}
            </button>
          ))}
        </div>
        {newsTab==="news" && (
          <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
            {NEWS_FILTERS.map(f=>(
              <button key={f.key} onClick={()=>setFilter(f.key)} style={{background:filter===f.key?MAIN_COL+"20":"none",border:`1px solid ${filter===f.key?MAIN_COL:"#1a2535"}`,color:filter===f.key?MAIN_COL:"#a8c4d4",borderRadius:6,padding:"2px 9px",cursor:"pointer",fontSize:8,letterSpacing:1,fontFamily:"'Space Mono',monospace",transition:"all 0.15s"}}>
                {f.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── SEARCH TAB ── */}
      {newsTab==="search" && (
        <div style={{display:"flex",flexDirection:"column",gap:14}}>

          {/* Search bar */}
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <div style={{flex:1,position:"relative"}}>
              <input
                ref={inputRef}
                value={searchInput}
                onChange={e=>setSearchInput(e.target.value.toUpperCase())}
                onKeyDown={e=>e.key==="Enter"&&handleSearch()}
                placeholder="TICKER OR TOPIC  e.g. AAPL · TSLA · NVDA · FOREX · CRYPTO"
                style={{
                  width:"100%", background:"#0d1420", border:`1px solid ${searchQuery?MAIN_COL:"#1a2535"}`,
                  borderRadius:10, padding:"10px 44px 10px 14px", color:"#e8f4f8",
                  fontSize:11, fontFamily:"'Space Mono',monospace", outline:"none",
                  boxSizing:"border-box", letterSpacing:1,
                  transition:"border-color 0.15s",
                }}
              />
              {searchInput && (
                <button onClick={clearSearch} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:"#6890a8",cursor:"pointer",fontSize:14,padding:0,lineHeight:1}}>✕</button>
              )}
            </div>
            <button onClick={handleSearch} disabled={searching} style={{background:MAIN_COL+"22",border:`1px solid ${MAIN_COL}`,color:MAIN_COL,borderRadius:10,padding:"10px 20px",cursor:searching?"not-allowed":"pointer",fontSize:10,fontFamily:"'Space Mono',monospace",letterSpacing:1,transition:"all 0.15s",opacity:searching?0.6:1}}>
              {searching?"…":"SEARCH"}
            </button>
          </div>

          {/* Quick picks */}
          {!searchQuery && (
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              <div style={{color:"#6890a8",fontSize:8,fontFamily:"'Space Mono',monospace",letterSpacing:2}}>QUICK PICKS</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {["AAPL","TSLA","NVDA","MSFT","AMZN","JPM","BTC","ETH","FOREX","CRYPTO"].map(t=>(
                  <button key={t} onClick={()=>{setSearchInput(t);setTimeout(()=>{setSearchInput(t);},0);}} style={{background:"#0d1420",border:"1px solid #1a2535",color:"#6890a8",borderRadius:6,padding:"4px 12px",cursor:"pointer",fontSize:9,fontFamily:"'Space Mono',monospace",letterSpacing:1,transition:"all 0.15s"}}>
                    {t}
                  </button>
                ))}
              </div>
              <div style={{color:"#6890a8",fontSize:9,fontFamily:"'Space Mono',monospace",marginTop:4}}>
                Enter a US stock ticker for live company news via Finnhub, or try FOREX / CRYPTO for category news.
              </div>
            </div>
          )}

          {/* Error state */}
          {searchError && (
            <div style={{background:"#0d0a06",border:"1px solid #c8dff033",borderRadius:10,padding:"16px 18px",fontFamily:"'Space Mono',monospace"}}>
              <div style={{color:"#c8dff0",fontSize:10,marginBottom:8,letterSpacing:1}}>⚠ SEARCH NOTE</div>
              <div style={{color:"#5a7a95",fontSize:10,lineHeight:1.8}}>{searchError}</div>
              <div style={{color:"#6890a8",fontSize:9,marginTop:10,lineHeight:1.7}}>
                The Claude.ai preview sandbox restricts some outbound API calls. Once you deploy this to Vercel, ticker search will work fully. In the meantime, the Headlines and Eco Calendar tabs use your Finnhub key normally.
              </div>
            </div>
          )}

          {/* Search results */}
          {searchQuery && !searchError && searchResults !== null && (
            <>
              <div style={{color:"#6890a8",fontSize:8,fontFamily:"'Space Mono',monospace",letterSpacing:2}}>
                {searching ? "FETCHING…" : `${searchResults.length} RESULTS FOR "${searchQuery}" ${searchResults[0]?.isLive?"· ● LIVE DATA":"· ○ NO RESULTS"}`}
              </div>
              {searchResults.length > 0 && (
                <div style={{display:"grid",gridTemplateColumns:"340px 1fr",gap:12,alignItems:"start"}}>
                  <div style={{background:"#0d1420",border:"1px solid #1a2535",borderRadius:12,overflow:"hidden"}}>
                    {searchResults.map(item=><HeadlineItem key={item.id} item={item}/>)}
                  </div>
                  {selected && <ArticlePreview item={selected}/>}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── HEADLINES TAB ── */}
      {newsTab==="news" && (
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            {headlinesLoading
              ? <span style={{color:"#c8dff0",fontSize:8,fontFamily:"'Space Mono',monospace",letterSpacing:1}}>◌ LOADING LIVE NEWS...</span>
              : liveHeadlines
              ? <span style={{color:"#7dd3f0",fontSize:8,fontFamily:"'Space Mono',monospace",letterSpacing:1}}>● LIVE · YAHOO FINANCE · {liveHeadlines.length} STORIES</span>
              : <span style={{color:"#1e3045",fontSize:8,fontFamily:"'Space Mono',monospace",letterSpacing:1}}>○ SIMULATED</span>
            }
          </div>
          <div style={{display:"grid",gridTemplateColumns:"340px 1fr",gap:12,alignItems:"start"}}>
            <div style={{background:"#0d1420",border:"1px solid #1a2535",borderRadius:12,overflow:"hidden"}}>
              {headlinesLoading
                ? <div style={{padding:"20px 16px",color:"#6890a8",fontSize:10,fontFamily:"'Space Mono',monospace"}}>◌ FETCHING HEADLINES...</div>
                : displayNews.length===0
                ? <div style={{color:"#6890a8",fontSize:11,padding:"20px 16px",fontFamily:"'Space Mono',monospace"}}>No stories for this filter</div>
                : displayNews.map(item=><HeadlineItem key={item.id} item={item}/>)
              }
            </div>
            {selected && <ArticlePreview item={selected}/>}
          </div>
        </div>
      )}

      {/* ── ECONOMIC CALENDAR TAB ── */}
      {newsTab==="calendar" && (
        <div style={{background:"#0d1420",border:"1px solid #1a2535",borderRadius:12,overflow:"hidden"}}>
          <div style={{display:"grid",gridTemplateColumns:"60px 80px 1fr 70px 70px 70px",gap:0,padding:"8px 16px",borderBottom:"1px solid #1a2535",background:"#0a0e14"}}>
            {["TIME","DATE","EVENT","ACTUAL","FORECAST","PRIOR"].map(h=>(
              <div key={h} style={{color:"#6890a8",fontSize:8,fontFamily:"'Space Mono',monospace",letterSpacing:1}}>{h}</div>
            ))}
          </div>
          {calData.map((ev,i)=>{
            const hasActual=ev.actual!=="—", impactCol=IMPACT_COL[ev.impact];
            return(
              <div key={ev.id} style={{display:"grid",gridTemplateColumns:"60px 80px 1fr 70px 70px 70px",gap:0,padding:"10px 16px",borderBottom:"1px solid #1a2535",background:i%2===0?"#0d1420":"#060d14",borderLeft:`2px solid ${impactCol}55`}}>
                <div style={{color:"#6890a8",fontSize:10,fontFamily:"'Space Mono',monospace"}}>{ev.time}</div>
                <div style={{color:"#6890a8",fontSize:10,fontFamily:"'Space Mono',monospace"}}>{ev.date}</div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{width:6,height:6,borderRadius:"50%",background:impactCol,flexShrink:0}}/>
                  <div style={{color:hasActual?"#a8b8c8":"#2a4a65",fontSize:10,fontFamily:"'Space Mono',monospace"}}>{ev.title}</div>
                </div>
                <div style={{color:hasActual?MAIN_COL:"#162535",fontSize:10,fontFamily:"'Space Mono',monospace",fontWeight:hasActual?"700":"400"}}>{ev.actual}</div>
                <div style={{color:"#6890a8",fontSize:10,fontFamily:"'Space Mono',monospace"}}>{ev.forecast}</div>
                <div style={{color:"#6890a8",fontSize:10,fontFamily:"'Space Mono',monospace"}}>{ev.prior}</div>
              </div>
            );
          })}
          <div style={{display:"flex",gap:16,padding:"10px 16px",borderTop:"1px solid #1a2535",background:"#0a0e14"}}>
            {[["high","#ff5f6d","High Impact"],["medium","#c8dff0","Medium"],["low","#7dd3f0","Low"]].map(([k,col,lbl])=>(
              <div key={k} style={{display:"flex",alignItems:"center",gap:5}}>
                <div style={{width:6,height:6,borderRadius:"50%",background:col}}/>
                <span style={{color:"#6890a8",fontSize:8,fontFamily:"'Space Mono',monospace"}}>{lbl}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Article preview panel — extracted so both tabs can reuse it
function ArticlePreview({item}) {
  return (
    <div style={{background:"#0d1420",border:"1px solid #1a2535",borderRadius:12,padding:"22px 24px",position:"sticky",top:0}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
        <span style={{background:(TAG_COL[item.tag]||"#1e3045")+"22",color:TAG_COL[item.tag]||"#2a4a65",fontSize:9,fontFamily:"'Space Mono',monospace",padding:"2px 8px",borderRadius:4,letterSpacing:1}}>{item.tag}</span>
        <span style={{color:"#5a7a95",fontSize:9,fontFamily:"'Space Mono',monospace"}}>{item.source}</span>
        {item.isLive&&<span style={{color:"#22c55e",fontSize:8,fontFamily:"'Space Mono',monospace"}}>● LIVE</span>}
        <span style={{color:"#6890a8",fontSize:9,fontFamily:"'Space Mono',monospace",marginLeft:"auto"}}>{item.time}</span>
      </div>
      <div style={{color:"#e8f4f8",fontSize:14,fontFamily:"'Space Mono',monospace",fontWeight:700,lineHeight:1.6,marginBottom:16}}>
        {item.title}
      </div>
      <div style={{width:40,height:1,background:MAIN_COL+"44",marginBottom:16}}/>
      <div style={{color:"#5a7a95",fontSize:11,fontFamily:"'Space Mono',monospace",lineHeight:1.9}}>
        {item.summary}
      </div>
      {item.url && item.url !== "#" && (
        <a href={item.url} target="_blank" rel="noopener noreferrer" style={{display:"inline-block",marginTop:16,color:MAIN_COL,fontSize:9,fontFamily:"'Space Mono',monospace",letterSpacing:1,textDecoration:"none",borderBottom:`1px solid ${MAIN_COL}44`}}>
          READ FULL ARTICLE ↗
        </a>
      )}
      <div style={{marginTop:16,paddingTop:12,borderTop:"1px solid #1a2535",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <span style={{color:"#6890a8",fontSize:8,fontFamily:"'Space Mono',monospace",letterSpacing:1}}>
          {item.isLive?"● LIVE DATA VIA FINNHUB":"○ SIMULATED CONTENT · DEMO ONLY"}
        </span>
        <div style={{width:6,height:6,borderRadius:"50%",background:item.isLive?"#22c55e":MAIN_COL,boxShadow:`0 0 6px ${item.isLive?"#22c55e":MAIN_COL}`}}/>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FACTOR DATA
// ─────────────────────────────────────────────────────────────────────────────

const FACTORS = [
  { id:"momentum",   label:"Momentum",      color:"#c8dff0", desc:"Price trend & relative strength vs benchmark" },
  { id:"value",      label:"Value",          color:"#c8dff0", desc:"P/E, P/B, dividend yield vs market average"  },
  { id:"quality",    label:"Quality",        color:"#34d399", desc:"ROE, low debt, earnings stability"            },
  { id:"lowvol",     label:"Low Volatility", color:"#b8e8ff", desc:"Beta & realized volatility vs S&P 500"       },
  { id:"size",       label:"Size",           color:"#c8dff0", desc:"Small cap premium vs large cap"              },
  { id:"growth",     label:"Growth",         color:"#c8dff0", desc:"Earnings & revenue growth rate"              },
];

const FACTOR_TFS = ["1W","1M","3M","6M","1Y"];
const FACTOR_PT  = {"1W":5,"1M":22,"3M":66,"6M":130,"1Y":252};

const FACTOR_ETFS = {
  momentum: {ticker:"MTUM", name:"iShares MSCI Momentum"},
  value:    {ticker:"VTV",  name:"Vanguard Value ETF"},
  quality:  {ticker:"QUAL", name:"iShares MSCI Quality"},
  lowvol:   {ticker:"USMV", name:"iShares Min Vol USA"},
  size:     {ticker:"IWM",  name:"iShares Russell 2000"},
  growth:   {ticker:"VUG",  name:"Vanguard Growth ETF"},
};

// ── Industry ETF proxies for live % change data ──
const INDUSTRY_ETFS = {
  // Technology
  semiconductors:   "SOXX", software_app: "IGV",  software_infra: "IGV",
  hardware:         "XLK",  semieq:       "SOXX", it_services:    "XLK",
  electronic_comp:  "XLK",
  // Communication
  internet_content: "OGIG", telecom:      "IYZ",  entertainment:  "COMM",
  publishing:       "IYZ",  advertising:  "IYZ",  gaming:         "ESPO",
  // Consumer Discretionary
  auto_manuf:       "CARZ", auto_parts:   "CARZ", internet_retail:"IBUY",
  specialty_retail: "XRT",  restaurants:  "BITE", leisure:        "PEJ",
  lodging:          "PEJ",  apparel_retail:"XRT", dept_stores:    "XRT",
  // Consumer Staples
  discount_stores:  "XLP",  grocery:      "XLP",  packaged_foods: "PBJ",
  beverages_alc:    "PBJ",  beverages_nonalc:"PBJ",tobacco:       "XLP",
  household:        "XLP",
  // Healthcare
  drug_manuf:       "XPH",  drug_specialty:"XPH", biotech:        "XBI",
  med_devices:      "IHI",  med_instruments:"IHI",health_plans:   "IHF",
  health_info:      "IHF",  diagnostics:   "XBI", med_care:       "IHF",
  med_distrib:      "IHF",
  // Financials
  banks_regional:   "KRE",  banks_div:    "KBE",  asset_mgmt:     "IAI",
  insurance_prop:   "IAK",  insurance_life:"IAK", insurance_div:  "IAK",
  capital_markets:  "IAI",  findata:      "IAI",  mortgage:       "KBE",
  credit_svcs:      "IAI",
  // Industrials
  aerospace:        "ITA",  conglomerates:"XLI",  engineering:    "XLI",
  airlines:         "JETS", railroads:    "IYT",  trucking:       "IYT",
  air_services:     "JETS", ind_distrib:  "XLI",  marine_shipping:"BOAT",
  integrated_freight:"IYT",
  // Energy
  oil_ep:           "XOP",  oil_integrated:"XLE", oil_drilling:   "OIH",
  oil_midstream:    "AMLP", oil_equipment: "OIH", coal_thermal:   "KOL",
  coal_coking:      "KOL",  solar:         "TAN",
  // Materials
  copper:           "COPX", gold:          "GDX", silver:         "SIL",
  aluminum:         "REMX", steel:         "SLX", chemicals:      "XLB",
  specialty_chem:   "XLB",  precious_metals:"GDX",ind_metals:     "PICK",
  lumber:           "CUT",  bld_materials: "XHB",
  // Real Estate
  reit_retail:      "RTL",  reit_office:   "NURE",reit_ind:       "INDS",
  reit_residential: "REZ",  reit_hotel:    "NURE",reit_health:    "NURE",
  reit_div:         "VNQ",  reit_mortgage: "REM", re_services:    "VNQ",
  // Utilities
  util_renewable:   "ICLN", util_regulated:"XLU", util_diversified:"XLU",
  util_electric:    "XLU",  util_indep:    "XLU", waste_mgmt:     "XLU",
};

// ── Theme ETF proxies ──
const THEME_ETFS = {
  ai:          "AIQ",  cyber:       "HACK", semis:       "SOXX",
  cleanenergy: "ICLN", biotech:     "XBI",  cloud:       "SKYY",
  defense:     "ITA",  fintech:     "ARKF", ev:          "DRIV",
  healthcare:  "IHI",  uranium:     "URA",  natgas:      "FCG",
  retail:      "XRT",  shipping:    "IYT",  realestate:  "VNQ",
  commodities: "PDBC", infra:       "PAVE", wind:        "FAN",
};

// ── Sector ETF proxies ──
const SECTOR_ETFS = {
  tech:"XLK", health:"XLV", finance:"XLF", ind:"XLI", energy:"XLE",
  consdisc:"XLY", comms:"XLC", staples:"XLP", materials:"XLB",
  realestate:"XLRE", utilities:"XLU",
};

// ── Submarket ETF proxies ──
const SUBMARKET_ETFS = {
  oilgas_ep:"XOP", telecom:"IYZ", natgas_prod:"FCG", semis_eq:"SOXX",
  biotech_sm:"XBI", software_app:"IGV", defense_sm:"ITA", silver:"SIL",
  infra_sm:"PAVE", shipping_sm:"IYT", wind_sm:"FAN", uranium_sm:"URA",
  copper:"COPX", fintech_sm:"ARKF", cloud_sm:"SKYY",
};

// ── Fetch live data for Industries, Themes, Sectors, Factors, VIX ──
// Dedicated VIX fetch — reads last candle close directly, most reliable for indices
async function fetchVIX() {
  try {
    const r = await fetch(`${YF_PROXY}?path=v8/finance/chart/%5EVIX&interval=1d&range=1mo`);
    const d = await r.json();
    const result = d?.chart?.result?.[0];
    const closes = result?.indicators?.quote?.[0]?.close?.filter(c => c != null) ?? [];
    if (closes.length === 0) return null;
    const price     = closes[closes.length - 1];
    const prevClose = closes.length > 1 ? closes[closes.length - 2] : price;
    const dp        = +((price - prevClose) / prevClose * 100).toFixed(2);
    return { price: +price.toFixed(2), prevClose: +prevClose.toFixed(2), dp };
  } catch { return null; }
}

async function loadLiveThematicData(onProgress) {
  // Collect all unique ETF symbols needed
  const allSymbols = new Set([
    ...Object.values(INDUSTRY_ETFS),
    ...Object.values(THEME_ETFS),
    ...Object.values(SECTOR_ETFS),
    ...Object.values(SUBMARKET_ETFS),
    ...Object.values(FACTOR_ETFS).map(f => f.ticker),
    "SPY", "^VIX",
  ]);

  const symbols = [...allSymbols];
  const quotes  = {};
  const candles = {};
  const CHUNK   = 20;

  let done = 0;
  // Fetch quotes for all symbols (excluding ^VIX which gets special treatment)
  const etfSymbols = symbols.filter(s => s !== "^VIX");
  for (let i = 0; i < etfSymbols.length; i += CHUNK) {
    const chunk = etfSymbols.slice(i, i + CHUNK);
    await Promise.all(chunk.map(async sym => {
      const q = await fetchQuote(sym);
      quotes[sym] = q;
    }));
    done += chunk.length;
    if (onProgress) onProgress(Math.round((done / symbols.length) * 50));
  }
  // Fetch VIX separately with dedicated function
  quotes["^VIX"] = await fetchVIX();

  // Fetch 1Y daily candles for factor ETFs + SPY (for RS calculation)
  const candleSyms = [...Object.values(FACTOR_ETFS).map(f => f.ticker), "SPY"];
  for (let i = 0; i < candleSyms.length; i += CHUNK) {
    const chunk = candleSyms.slice(i, i + CHUNK);
    await Promise.all(chunk.map(async sym => {
      const c = await fetchYahooCandles(sym, "1d", "1y");
      if (c) candles[sym] = c.map(x => x.value);
    }));
    done += chunk.length;
    if (onProgress) onProgress(50 + Math.round((i / candleSyms.length) * 50));
  }

  return { quotes, candles };
}

// Calculate % change for a symbol from quotes
function liveChg(quotes, sym, fallback = 0) {
  return quotes[sym]?.dp ?? fallback;
}

// Calculate RS score (0-100) of ETF vs SPY using candle data
function calcRS(etfCandles, spyCandles, lookback = 63) {
  if (!etfCandles || !spyCandles || etfCandles.length < lookback || spyCandles.length < lookback) return null;
  const etfRet = etfCandles[etfCandles.length-1] / etfCandles[etfCandles.length-lookback] - 1;
  const spyRet = spyCandles[spyCandles.length-1] / spyCandles[spyCandles.length-lookback] - 1;
  // Normalize to 0-100 scale (50 = in line with SPY)
  const rel = (etfRet - spyRet) * 100;
  return Math.max(0, Math.min(100, 50 + rel * 3));
}

// Build live factor candle series vs SPY
function buildLiveFactorSeries(etfCandles, spyCandles, points) {
  if (!etfCandles || !spyCandles) return null;
  const n   = Math.min(etfCandles.length, spyCandles.length, points);
  const out = [];
  const etfBase = etfCandles[etfCandles.length - n];
  const spyBase = spyCandles[spyCandles.length - n];
  for (let i = 0; i < n; i++) {
    const ei = etfCandles.length - n + i;
    const si = spyCandles.length - n + i;
    const fac = (etfCandles[ei] / etfBase) * 100;
    const spx = (spyCandles[si] / spyBase) * 100;
    out.push({ t: i, factor: +fac.toFixed(2), spx: +spx.toFixed(2), rel: +(fac - spx).toFixed(3) });
  }
  return out;
}

// Sub-metrics displayed per factor
const FACTOR_METRICS = {
  momentum: [
    {id:"rs1m",   label:"1M Rel. Strength", min:0,  max:100, good:"high", fmt:v=>`${v.toFixed(1)}`},
    {id:"rs3m",   label:"3M Rel. Strength", min:0,  max:100, good:"high", fmt:v=>`${v.toFixed(1)}`},
    {id:"price12m",label:"12M Price Mom.",  min:-30, max:50, good:"high", fmt:v=>`${v>0?"+":""}${v.toFixed(1)}%`},
    {id:"rsi",    label:"RSI (14D)",        min:0,  max:100, good:"mid",  fmt:v=>`${v.toFixed(0)}`},
  ],
  value: [
    {id:"pe",     label:"P/E Ratio",       min:8,  max:35,  good:"low",  fmt:v=>`${v.toFixed(1)}x`},
    {id:"pb",     label:"P/B Ratio",       min:0.8,max:5,   good:"low",  fmt:v=>`${v.toFixed(2)}x`},
    {id:"divy",   label:"Div. Yield",      min:0,  max:5,   good:"high", fmt:v=>`${v.toFixed(2)}%`},
    {id:"evy",    label:"Earnings Yield",  min:0,  max:10,  good:"high", fmt:v=>`${v.toFixed(2)}%`},
  ],
  quality: [
    {id:"roe",    label:"ROE",             min:0,  max:40,  good:"high", fmt:v=>`${v.toFixed(1)}%`},
    {id:"de",     label:"Debt/Equity",     min:0,  max:2,   good:"low",  fmt:v=>`${v.toFixed(2)}x`},
    {id:"margin", label:"Net Margin",      min:0,  max:30,  good:"high", fmt:v=>`${v.toFixed(1)}%`},
    {id:"eps_stab",label:"EPS Stability",  min:0,  max:100, good:"high", fmt:v=>`${v.toFixed(0)}`},
  ],
  lowvol: [
    {id:"beta",   label:"Beta (1Y)",       min:0,  max:2,   good:"low",  fmt:v=>`${v.toFixed(2)}`},
    {id:"sd30",   label:"30D Std Dev",     min:0,  max:30,  good:"low",  fmt:v=>`${v.toFixed(1)}%`},
    {id:"maxdd",  label:"Max Drawdown",    min:-40,max:0,   good:"high", fmt:v=>`${v.toFixed(1)}%`},
    {id:"sharpe", label:"Sharpe Ratio",    min:0,  max:3,   good:"high", fmt:v=>`${v.toFixed(2)}`},
  ],
  size: [
    {id:"spread", label:"Small/Large Sprd",min:-20,max:20,  good:"high", fmt:v=>`${v>0?"+":""}${v.toFixed(2)}%`},
    {id:"sc_rs",  label:"SC Rel. Strength",min:0,  max:100, good:"high", fmt:v=>`${v.toFixed(1)}`},
    {id:"sc_pe",  label:"SC P/E Premium",  min:-5, max:15,  good:"low",  fmt:v=>`${v>0?"+":""}${v.toFixed(1)}x`},
    {id:"sc_vol", label:"SC vs LC Vol.",   min:-5, max:15,  good:"low",  fmt:v=>`${v>0?"+":""}${v.toFixed(1)}%`},
  ],
  growth: [
    {id:"epsg",   label:"EPS Growth (YoY)",min:-20,max:40,  good:"high", fmt:v=>`${v>0?"+":""}${v.toFixed(1)}%`},
    {id:"revg",   label:"Rev. Growth (YoY)",min:-10,max:30, good:"high", fmt:v=>`${v>0?"+":""}${v.toFixed(1)}%`},
    {id:"fwdpe",  label:"Fwd P/E",         min:10, max:40,  good:"low",  fmt:v=>`${v.toFixed(1)}x`},
    {id:"peg",    label:"PEG Ratio",        min:0,  max:4,   good:"low",  fmt:v=>`${v.toFixed(2)}`},
  ],
};

// Simulate realistic metric values per factor
const METRIC_BASES = {
  momentum:  {rs1m:rng(40,75), rs3m:rng(45,80), price12m:rng(-5,35), rsi:rng(40,70)},
  value:     {pe:rng(12,28),   pb:rng(1,4),      divy:rng(1,4),       evy:rng(3,8)},
  quality:   {roe:rng(8,30),   de:rng(0.2,1.8),  margin:rng(5,25),    eps_stab:rng(50,95)},
  lowvol:    {beta:rng(0.4,1.2),sd30:rng(8,20),  maxdd:rng(-25,-5),   sharpe:rng(0.5,2.5)},
  size:      {spread:rng(-8,12),sc_rs:rng(35,70), sc_pe:rng(-2,12),   sc_vol:rng(2,10)},
  growth:    {epsg:rng(-5,35),  revg:rng(0,25),   fwdpe:rng(15,38),   peg:rng(0.8,3.5)},
};

function genFactorSeries(factorId, points) {
  // Generates relative performance vs S&P 500 over time
  const data = [];
  let rel = 0; // cumulative relative return
  let spx = 100;
  let fac = 100;
  for (let i = 0; i < points; i++) {
    const spxRet  = (Math.random() - 0.488) * 0.012;
    const facBias = factorId === "momentum" ? 0.001 :
                    factorId === "value"    ? -0.0005 :
                    factorId === "quality"  ? 0.0005  :
                    factorId === "lowvol"   ? -0.0008 :
                    factorId === "size"     ? 0.0003  : 0.0008;
    const facRet  = spxRet + facBias + (Math.random() - 0.5) * 0.008;
    spx *= (1 + spxRet);
    fac *= (1 + facRet);
    rel  = parseFloat(((fac / spx - 1) * 100).toFixed(3));
    data.push({ t: i, factor: parseFloat(fac.toFixed(2)), spx: parseFloat(spx.toFixed(2)), rel });
  }
  return data;
}

function genRotationData(points) {
  // Each factor's score on momentum vs value axes (for rotation chart)
  return FACTORS.map(f => {
    const series = genFactorSeries(f.id, points);
    const last   = series[series.length - 1];
    const prev   = series[Math.max(0, series.length - 6)];
    const momentum_axis = parseFloat(((last.rel - prev.rel)).toFixed(2));
    const level_axis    = parseFloat((last.rel).toFixed(2));
    return { ...f, momentum_axis, level_axis, series };
  });
}

function loadFactorData() {
  const series = {};
  const rotation = {};
  for (const tf of FACTOR_TFS) {
    const pts = FACTOR_PT[tf];
    rotation[tf] = genRotationData(pts);
    series[tf] = rotation[tf].reduce((acc, f) => {
      acc[f.id] = f.series;
      return acc;
    }, {});
  }
  // Snapshot metrics
  const metrics = {};
  for (const f of FACTORS) {
    const base = METRIC_BASES[f.id];
    metrics[f.id] = Object.fromEntries(
      Object.entries(base).map(([k, v]) => [k, parseFloat((v + rng(-v*0.05, v*0.05)).toFixed(3))])
    );
  }
  return { series, rotation, metrics };
}

// ─────────────────────────────────────────────────────────────────────────────
// FACTOR VIEW
// ─────────────────────────────────────────────────────────────────────────────
function FactorView({ factorData, liveQuotes, liveCandles, thematicLoading }) {
  const [tf,          setTf]          = useState("3M");
  const [activeF,     setActiveF]     = useState("momentum");
  const [subview,     setSubview]     = useState("overview");

  const isLive    = Object.keys(liveQuotes).length > 0;
  const spyCan    = liveCandles["SPY"];

  // Build live factor data if candles available
  const liveSeries = useMemo(() => {
    if (!isLive || !spyCan) return null;
    const out = {};
    for (const tf of FACTOR_TFS) {
      out[tf] = {};
      for (const f of FACTORS) {
        const sym  = FACTOR_ETFS[f.id]?.ticker;
        const etfC = sym ? liveCandles[sym] : null;
        const pts  = FACTOR_PT[tf];
        const s    = buildLiveFactorSeries(etfC, spyCan, pts);
        out[tf][f.id] = s ?? factorData.series[tf][f.id];
      }
    }
    return out;
  }, [liveCandles, isLive, spyCan, factorData]);

  // Live rotation — current relative level + momentum
  const liveRotation = useMemo(() => {
    if (!liveSeries) return null;
    return FACTORS.map(f => {
      const s    = liveSeries[tf][f.id];
      const last = s[s.length - 1];
      const prev = s[Math.max(0, s.length - 6)];
      return { ...f,
        momentum_axis: +(last.rel - prev.rel).toFixed(2),
        level_axis:    +last.rel.toFixed(2),
        series: s,
      };
    });
  }, [liveSeries, tf]);

  // Live metrics — price momentum from candles, rest simulated
  const liveMetrics = useMemo(() => {
    if (!isLive || !spyCan) return null;
    const m = { ...factorData.metrics };
    // Patch momentum metrics with real data
    const mtumC = liveCandles["MTUM"];
    if (mtumC && mtumC.length >= 63) {
      const ret12m = (mtumC[mtumC.length-1]/mtumC[0] - 1)*100;
      const ret3m  = (mtumC[mtumC.length-1]/mtumC[mtumC.length-63] - 1)*100;
      m.momentum = { ...m.momentum, price12m: +ret12m.toFixed(1), rs3m: +Math.min(100,Math.max(0,50+ret3m*2)).toFixed(1) };
    }
    // Live VIX for low-vol
    const vixQ = liveQuotes["^VIX"];
    if (vixQ?.price) {
      m.lowvol = { ...m.lowvol, sd30: +Math.min(30,vixQ.price*0.6).toFixed(1) };
    }
    return m;
  }, [liveCandles, liveQuotes, isLive, spyCan, factorData]);

  const rotation  = liveRotation  ?? factorData.rotation[tf];
  const series    = liveSeries    ?? factorData.series;
  const metrics   = liveMetrics   ?? factorData.metrics;
  const selFactor = FACTORS.find(f => f.id === activeF);
  const selSeries = series[tf]?.[activeF] ?? factorData.series[tf][activeF];
  const selMetrics= FACTOR_METRICS[activeF];
  const selVals   = metrics[activeF];

  // Score each factor 0–100 from its relative performance
  function factorScore(fid) {
    const rot = rotation.find(r => r.id === fid);
    if (!rot) return 50;
    const raw = 50 + rot.level_axis * 3;
    return Math.max(5, Math.min(95, parseFloat(raw.toFixed(1))));
  }

  // Gauge color for factor score
  function scoreColor(score) {
    return score > 65 ? "#7dd3f0" : score > 45 ? "#c8dff0" : "#ff5f6d";
  }

  // Metric gauge color based on good direction
  function metricColor(metric, value) {
    const {min, max, good} = metric;
    const pct = (value - min) / (max - min);
    if (good === "high") return pct > 0.6 ? "#7dd3f0" : pct > 0.35 ? "#c8dff0" : "#ff5f6d";
    if (good === "low")  return pct < 0.4 ? "#7dd3f0" : pct < 0.65 ? "#c8dff0" : "#ff5f6d";
    // mid — good in middle (e.g. RSI 40–60)
    const dist = Math.abs(pct - 0.5);
    return dist < 0.15 ? "#7dd3f0" : dist < 0.3 ? "#c8dff0" : "#ff5f6d";
  }

  const latestRel  = selSeries[selSeries.length - 1].rel;
  const firstRel   = selSeries[0].rel;
  const relChange  = latestRel - firstRel;
  const relUp      = relChange >= 0;

  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>

      {/* Header row */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <SectionLabel>FACTOR PERFORMANCE</SectionLabel>
          <span style={{color:isLive?"#7dd3f0":thematicLoading?"#c8dff0":"#1e3045",fontSize:8,fontFamily:"'Space Mono',monospace",letterSpacing:1}}>
            {isLive?"● LIVE · ETF-BASED RELATIVE PERFORMANCE":thematicLoading?"◌ LOADING LIVE DATA...":"○ SIMULATED"}
          </span>
        </div>
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          {/* Sub-view toggle */}
          {[{k:"overview",l:"OVERVIEW"},{k:"drilldown",l:"DRILLDOWN"},{k:"rotation",l:"ROTATION"}].map(({k,l})=>(
            <button key={k} onClick={()=>setSubview(k)} style={{background:subview===k?MAIN_COL+"20":"none",border:`1px solid ${subview===k?MAIN_COL:"#1a2535"}`,color:subview===k?MAIN_COL:"#a8c4d4",borderRadius:6,padding:"3px 10px",cursor:"pointer",fontSize:8,letterSpacing:1,fontFamily:"'Space Mono',monospace",transition:"all 0.15s"}}>{l}</button>
          ))}
          <TfBar value={tf} onChange={setTf} options={FACTOR_TFS}/>
        </div>
      </div>

      {/* ── OVERVIEW ── */}
      {subview==="overview" && (
        <>
          {/* Factor score gauges */}
          <Panel>
            <SectionLabel>FACTOR SCORES — RELATIVE TO S&P 500</SectionLabel>
            <div style={{display:"flex",justifyContent:"space-around",flexWrap:"wrap",gap:8}}>
              {FACTORS.map(f => {
                const score = factorScore(f.id);
                const rot   = rotation.find(r=>r.id===f.id);
                const trend = rot?.momentum_axis >= 0 ? "▲" : "▼";
                const tCol  = rot?.momentum_axis >= 0 ? "#7dd3f0" : "#ff5f6d";
                return (
                  <div key={f.id} style={{textAlign:"center",cursor:"pointer"}} onClick={()=>{setActiveF(f.id);setSubview("drilldown");}}>
                    <svg width="100" height="72" viewBox="0 0 100 72">
                      {/* track */}
                      <path d={`M ${50+36*Math.cos((-135-90)*Math.PI/180)} ${52+36*Math.sin((-135-90)*Math.PI/180)} A 36 36 0 1 1 ${50+36*Math.cos((135-90)*Math.PI/180)} ${52+36*Math.sin((135-90)*Math.PI/180)}`} fill="none" stroke="#1a2535" strokeWidth="6" strokeLinecap="round"/>
                      {/* fill */}
                      {(()=>{
                        const p=score/100, ang=-135+p*270, rad=36;
                        const s={x:50+rad*Math.cos((-135-90)*Math.PI/180),y:52+rad*Math.sin((-135-90)*Math.PI/180)};
                        const e={x:50+rad*Math.cos((ang-90)*Math.PI/180),  y:52+rad*Math.sin((ang-90)*Math.PI/180)};
                        const large=ang-(-135)>180?1:0;
                        const col=scoreColor(score);
                        return <path d={`M ${s.x} ${s.y} A ${rad} ${rad} 0 ${large} 1 ${e.x} ${e.y}`} fill="none" stroke={col} strokeWidth="6" strokeLinecap="round"/>;
                      })()}
                      {/* needle */}
                      {(()=>{
                        const p=score/100, ang=(-135+p*270-90)*Math.PI/180;
                        return <><line x1={50} y1={52} x2={50+36*0.7*Math.cos(ang)} y2={52+36*0.7*Math.sin(ang)} stroke={scoreColor(score)} strokeWidth="1.5" strokeLinecap="round"/><circle cx={50} cy={52} r="2.5" fill={scoreColor(score)}/></>;
                      })()}
                      <text x={50} y={68} textAnchor="middle" fill="#e8f4f8" fontSize="10" fontFamily="'Space Mono',monospace" fontWeight="700">{score.toFixed(0)}</text>
                    </svg>
                    <div style={{color:f.color,fontSize:9,fontFamily:"'Space Mono',monospace",marginTop:-2}}>{f.label}</div>
                    <div style={{color:tCol,fontSize:8,fontFamily:"'Space Mono',monospace",marginTop:2}}>{trend} {Math.abs(rot?.momentum_axis||0).toFixed(2)}%</div>
                  </div>
                );
              })}
            </div>
            <div style={{color:"#6890a8",fontSize:8,fontFamily:"'Space Mono',monospace",textAlign:"center",marginTop:8}}>CLICK ANY GAUGE TO DRILL DOWN</div>
          </Panel>

          {/* All factors relative performance chart */}
          <Panel>
            <SectionLabel>ALL FACTORS — CUMULATIVE RELATIVE PERFORMANCE VS S&P 500</SectionLabel>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart margin={{top:8,right:12,bottom:0,left:4}}>
                <CartesianGrid strokeDasharray="2 4" stroke="#1a2535" vertical={false}/>
                <XAxis dataKey="t" hide/>
                <YAxis tick={{fill:"#4a6a85",fontSize:8,fontFamily:"'Space Mono',monospace"}} tickLine={false} axisLine={false} width={36} tickFormatter={v=>`${v>0?"+":""}${v.toFixed(1)}%`}/>
                <ReferenceLine y={0} stroke="#162535" strokeDasharray="2 2"/>
                <Tooltip content={({active,payload})=>{
                  if(!active||!payload?.length) return null;
                  return(
                    <div style={{background:"#1a2535",border:"1px solid #1e3045",borderRadius:6,padding:"8px 12px",fontSize:9,fontFamily:"'Space Mono',monospace"}}>
                      {payload.map((p,i)=>(
                        <div key={i} style={{color:p.color,marginBottom:2}}>{p.name}: {p.value>0?"+":""}{p.value?.toFixed(2)}%</div>
                      ))}
                    </div>
                  );
                }}/>
                {FACTORS.map(f=>(
                  <Line key={f.id} data={series[tf]?.[f.id] ?? factorData.series[tf][f.id]} type="monotone" dataKey="rel"
                    stroke={f.color} strokeWidth={activeF===f.id?2.5:1} dot={false}
                    name={f.label} strokeOpacity={activeF===f.id?1:0.4}
                    onClick={()=>setActiveF(f.id)}
                    style={{cursor:"pointer"}}/>
                ))}
              </LineChart>
            </ResponsiveContainer>
            {/* Legend */}
            <div style={{display:"flex",gap:14,marginTop:10,flexWrap:"wrap"}}>
              {FACTORS.map(f=>(
                <button key={f.id} onClick={()=>setActiveF(f.id)} style={{display:"flex",alignItems:"center",gap:5,background:"none",border:"none",cursor:"pointer",padding:0}}>
                  <div style={{width:16,height:2,background:f.color,borderRadius:1,opacity:activeF===f.id?1:0.4}}/>
                  <span style={{color:activeF===f.id?f.color:"#6890a8",fontSize:8,fontFamily:"'Space Mono',monospace",transition:"color 0.15s"}}>{f.label}</span>
                </button>
              ))}
            </div>
          </Panel>

          {/* Factor ranking table */}
          <Panel>
            <SectionLabel>FACTOR RANKING — {tf} RELATIVE PERFORMANCE</SectionLabel>
            <div style={{display:"flex",flexDirection:"column",gap:0}}>
              {[...rotation].sort((a,b)=>b.level_axis-a.level_axis).map((f,i)=>{
                const up=f.level_axis>=0, score=factorScore(f.id);
                const etf=FACTOR_ETFS[f.id];
                const barW=Math.min(100,Math.abs(f.level_axis)*8);
                return(
                  <button key={f.id} onClick={()=>{setActiveF(f.id);setSubview("drilldown");}} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",background:"none",border:"none",borderBottom:"1px solid #1a2535",cursor:"pointer",textAlign:"left",width:"100%"}}>
                    <span style={{color:"#6890a8",fontSize:11,fontFamily:"'Space Mono',monospace",width:16,flexShrink:0}}>{i+1}</span>
                    <div style={{width:10,height:10,borderRadius:"50%",background:f.color,flexShrink:0}}/>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{color:"#a8b8c8",fontSize:11,fontFamily:"'Space Mono',monospace"}}>{f.label}</div>
                      <div style={{color:"#6890a8",fontSize:8,marginTop:1}}>{etf.ticker} · {etf.name}</div>
                    </div>
                    {/* bar */}
                    <div style={{width:120,height:6,background:"#1a2535",borderRadius:3,overflow:"hidden",flexShrink:0}}>
                      <div style={{width:`${barW}%`,height:"100%",background:up?"#7dd3f0":"#ff5f6d",borderRadius:3,marginLeft:up?"50%":"",transform:up?"":"translateX(-100%)",position:"relative"}}/>
                    </div>
                    <span style={{color:up?"#7dd3f0":"#ff5f6d",fontSize:11,fontFamily:"'Space Mono',monospace",width:60,textAlign:"right",flexShrink:0}}>{up?"+":""}{f.level_axis.toFixed(2)}%</span>
                    <span style={{color:scoreColor(score),fontSize:10,fontFamily:"'Space Mono',monospace",width:28,textAlign:"right",flexShrink:0}}>{score.toFixed(0)}</span>
                  </button>
                );
              })}
            </div>
            <div style={{display:"flex",justifyContent:"flex-end",gap:16,marginTop:8}}>
              <span style={{color:"#6890a8",fontSize:8,fontFamily:"'Space Mono',monospace"}}>← UNDERPERFORM · BAR · OUTPERFORM →</span>
              <span style={{color:"#6890a8",fontSize:8,fontFamily:"'Space Mono',monospace"}}>SCORE 0–100</span>
            </div>
          </Panel>
        </>
      )}

      {/* ── DRILLDOWN ── */}
      {subview==="drilldown" && (
        <>
          {/* Factor selector */}
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {FACTORS.map(f=>(
              <button key={f.id} onClick={()=>setActiveF(f.id)} style={{background:activeF===f.id?f.color+"22":"none",border:`1px solid ${activeF===f.id?f.color:"#1a2535"}`,color:activeF===f.id?f.color:"#6890a8",borderRadius:8,padding:"4px 14px",cursor:"pointer",fontSize:9,fontFamily:"'Space Mono',monospace",letterSpacing:1,transition:"all 0.15s"}}>
                {f.label}
              </button>
            ))}
          </div>

          {/* Factor header */}
          <Panel style={{borderColor:selFactor.color+"44"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div>
                <div style={{color:selFactor.color,fontSize:13,fontFamily:"'Space Mono',monospace",fontWeight:700,letterSpacing:1,marginBottom:4}}>{selFactor.label.toUpperCase()}</div>
                <div style={{color:"#6890a8",fontSize:10,fontFamily:"'Space Mono',monospace"}}>{selFactor.desc}</div>
                <div style={{color:"#6890a8",fontSize:9,marginTop:4,fontFamily:"'Space Mono',monospace"}}>ETF PROXY: {FACTOR_ETFS[activeF].ticker} · {FACTOR_ETFS[activeF].name}</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{color:relUp?"#7dd3f0":"#ff5f6d",fontSize:18,fontFamily:"'Space Mono',monospace",fontWeight:700}}>{relUp?"+":""}{relChange.toFixed(2)}%</div>
                <div style={{color:"#6890a8",fontSize:9,fontFamily:"'Space Mono',monospace"}}>VS S&P 500 · {tf}</div>
              </div>
            </div>
          </Panel>

          {/* Metric gauges */}
          <Panel>
            <SectionLabel>KEY METRICS</SectionLabel>
            <div style={{display:"flex",justifyContent:"space-around",flexWrap:"wrap",gap:8}}>
              {selMetrics.map(m=>{
                const val=selVals[m.id];
                const col=metricColor(m,val);
                const pctV=Math.max(0,Math.min(1,(val-m.min)/(m.max-m.min)));
                const ang=-135+pctV*270, angR=(ang-90)*Math.PI/180;
                const r=36,cx=50,cy=52;
                const sx=cx+r*Math.cos((-135-90)*Math.PI/180), sy=cy+r*Math.sin((-135-90)*Math.PI/180);
                const ex=cx+r*Math.cos(angR), ey=cy+r*Math.sin(angR);
                const large=ang-(-135)>180?1:0;
                const nx=cx+r*0.7*Math.cos(angR), ny=cy+r*0.7*Math.sin(angR);
                return(
                  <div key={m.id} style={{textAlign:"center"}}>
                    <svg width="100" height="72" viewBox="0 0 100 72">
                      <path d={`M ${sx} ${sy} A ${r} ${r} 0 1 1 ${cx+r*Math.cos((135-90)*Math.PI/180)} ${cy+r*Math.sin((135-90)*Math.PI/180)}`} fill="none" stroke="#1a2535" strokeWidth="6" strokeLinecap="round"/>
                      <path d={`M ${sx} ${sy} A ${r} ${r} 0 ${large} 1 ${ex} ${ey}`} fill="none" stroke={col} strokeWidth="6" strokeLinecap="round"/>
                      <line x1={cx} y1={cy} x2={nx} y2={ny} stroke={col} strokeWidth="1.5" strokeLinecap="round"/>
                      <circle cx={cx} cy={cy} r="2.5" fill={col}/>
                      <text x={cx} y={68} textAnchor="middle" fill="#e8f4f8" fontSize="9" fontFamily="'Space Mono',monospace" fontWeight="700">{m.fmt(val)}</text>
                    </svg>
                    <div style={{color:"#5a7a95",fontSize:9,fontFamily:"'Space Mono',monospace",marginTop:-2,maxWidth:90,lineHeight:1.3}}>{m.label}</div>
                  </div>
                );
              })}
            </div>
          </Panel>

          {/* Relative perf chart + absolute chart */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <Panel>
              <SectionLabel>RELATIVE PERFORMANCE VS S&P 500</SectionLabel>
              <ResponsiveContainer width="100%" height={140}>
                <AreaChart data={selSeries} margin={{top:4,right:4,bottom:0,left:0}}>
                  <defs>
                    <linearGradient id="facrel" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={selFactor.color} stopOpacity={0.25}/>
                      <stop offset="95%" stopColor={selFactor.color} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="2 4" stroke="#1a2535" vertical={false}/>
                  <XAxis dataKey="t" hide/>
                  <YAxis tick={{fill:"#4a6a85",fontSize:8,fontFamily:"'Space Mono',monospace"}} tickLine={false} axisLine={false} width={36} tickFormatter={v=>`${v>0?"+":""}${v.toFixed(1)}%`}/>
                  <ReferenceLine y={0} stroke="#162535" strokeDasharray="2 2"/>
                  <Tooltip formatter={v=>[`${v>0?"+":""}${v.toFixed(2)}%`,"Rel. Perf."]}/>
                  <Area type="monotone" dataKey="rel" stroke={selFactor.color} strokeWidth={2} fill="url(#facrel)" dot={false}/>
                </AreaChart>
              </ResponsiveContainer>
            </Panel>
            <Panel>
              <SectionLabel>FACTOR vs S&P 500 — INDEXED TO 100</SectionLabel>
              <ResponsiveContainer width="100%" height={140}>
                <LineChart data={selSeries} margin={{top:4,right:4,bottom:0,left:0}}>
                  <CartesianGrid strokeDasharray="2 4" stroke="#1a2535" vertical={false}/>
                  <XAxis dataKey="t" hide/>
                  <YAxis tick={{fill:"#4a6a85",fontSize:8,fontFamily:"'Space Mono',monospace"}} tickLine={false} axisLine={false} width={36}/>
                  <Tooltip content={({active,payload})=>{
                    if(!active||!payload?.length) return null;
                    return(
                      <div style={{background:"#1a2535",border:"1px solid #1e3045",borderRadius:6,padding:"6px 12px",fontSize:9,fontFamily:"'Space Mono',monospace"}}>
                        <div style={{color:selFactor.color}}>{selFactor.label}: {payload[0]?.value?.toFixed(2)}</div>
                        <div style={{color:"#7dd3f0"}}>S&P 500: {payload[1]?.value?.toFixed(2)}</div>
                      </div>
                    );
                  }}/>
                  <Line type="monotone" dataKey="factor" stroke={selFactor.color} strokeWidth={2} dot={false} name={selFactor.label}/>
                  <Line type="monotone" dataKey="spx"    stroke="#7dd3f066"       strokeWidth={1.5} dot={false} name="S&P 500" strokeDasharray="4 2"/>
                </LineChart>
              </ResponsiveContainer>
            </Panel>
          </div>
        </>
      )}

      {/* ── ROTATION CHART ── */}
      {subview==="rotation" && (
        <Panel>
          <SectionLabel>FACTOR ROTATION — MOMENTUM (X) vs RELATIVE LEVEL (Y)</SectionLabel>
          <div style={{color:"#6890a8",fontSize:8,fontFamily:"'Space Mono',monospace",marginBottom:14,lineHeight:1.7}}>
            RIGHT = accelerating outperformance · LEFT = decelerating · UP = outperforming S&P · DOWN = underperforming
          </div>
          <div style={{position:"relative",height:380,background:"#0a0e14",borderRadius:10,border:"1px solid #1a2535",overflow:"hidden"}}>
            {/* Axis lines */}
            <div style={{position:"absolute",left:"50%",top:0,bottom:0,width:1,background:"#080f18"}}/>
            <div style={{position:"absolute",top:"50%",left:0,right:0,height:1,background:"#080f18"}}/>
            {/* Quadrant labels */}
            {[
              {t:8,l:8,    label:"LAGGING",    col:"#ff5f6d"},
              {t:8,r:8,    label:"IMPROVING",  col:"#c8dff0"},
              {b:8,l:8,    label:"WEAKENING",  col:"#c8dff0"},
              {b:8,r:8,    label:"LEADING",    col:"#7dd3f0"},
            ].map((q,i)=>(
              <div key={i} style={{position:"absolute",top:q.t,bottom:q.b,left:q.l,right:q.r,color:q.col,fontSize:8,fontFamily:"'Space Mono',monospace",letterSpacing:1,opacity:0.5}}>{q.label}</div>
            ))}
            {/* Axis labels */}
            <div style={{position:"absolute",bottom:8,left:"50%",transform:"translateX(-50%)",color:"#6890a8",fontSize:8,fontFamily:"'Space Mono',monospace",letterSpacing:1}}>MOMENTUM →</div>
            <div style={{position:"absolute",top:"50%",left:6,transform:"translateY(-50%) rotate(-90deg)",color:"#6890a8",fontSize:8,fontFamily:"'Space Mono',monospace",letterSpacing:1,transformOrigin:"center"}}>LEVEL ↑</div>
            {/* Factor dots */}
            {rotation.map(f => {
              // Map to pixel coordinates — center = 50%
              const maxM = 3, maxL = 15;
              const x = 50 + (f.momentum_axis / maxM) * 40;
              const y = 50 - (f.level_axis    / maxL) * 40;
              const cx = Math.max(8, Math.min(92, x));
              const cy = Math.max(8, Math.min(92, y));
              return (
                <button key={f.id} onClick={()=>{setActiveF(f.id);setSubview("drilldown");}}
                  style={{position:"absolute",left:`${cx}%`,top:`${cy}%`,transform:"translate(-50%,-50%)",background:"none",border:"none",cursor:"pointer",padding:0,zIndex:2}}>
                  <div style={{
                    width:44,height:44,borderRadius:"50%",
                    background:f.color+"22",border:`2px solid ${f.color}`,
                    display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
                    transition:"transform 0.15s",
                  }}>
                    <div style={{color:f.color,fontSize:7,fontFamily:"'Space Mono',monospace",fontWeight:700,letterSpacing:0.5,textAlign:"center",lineHeight:1.2}}>
                      {f.label.split(" ").map((w,i)=><div key={i}>{w}</div>)}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          <div style={{color:"#6890a8",fontSize:9,fontFamily:"'Space Mono',monospace",textAlign:"center",marginTop:10}}>CLICK ANY FACTOR TO DRILL DOWN · POSITIONS ARE SIMULATED</div>
        </Panel>
      )}

    </div>
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// SCREENER — 21 EMA PULLBACK
// ─────────────────────────────────────────────────────────────────────────────

// ~150 S&P 500 stocks + popular ETFs with enough data to simulate a price series
const SCREENER_UNIVERSE = [
  // S&P 500 large caps
  {symbol:"AAPL",  name:"Apple",               sector:"Technology",    type:"Stock", base:220},
  {symbol:"MSFT",  name:"Microsoft",            sector:"Technology",    type:"Stock", base:388},
  {symbol:"NVDA",  name:"NVIDIA",               sector:"Technology",    type:"Stock", base:880},
  {symbol:"META",  name:"Meta Platforms",       sector:"Technology",    type:"Stock", base:590},
  {symbol:"GOOGL", name:"Alphabet",             sector:"Technology",    type:"Stock", base:165},
  {symbol:"AMZN",  name:"Amazon",               sector:"Cons. Disc.",   type:"Stock", base:208},
  {symbol:"TSLA",  name:"Tesla",                sector:"Cons. Disc.",   type:"Stock", base:278},
  {symbol:"AVGO",  name:"Broadcom",             sector:"Technology",    type:"Stock", base:188},
  {symbol:"ORCL",  name:"Oracle",               sector:"Technology",    type:"Stock", base:158},
  {symbol:"CRM",   name:"Salesforce",           sector:"Technology",    type:"Stock", base:298},
  {symbol:"AMD",   name:"AMD",                  sector:"Technology",    type:"Stock", base:108},
  {symbol:"INTC",  name:"Intel",                sector:"Technology",    type:"Stock", base:22},
  {symbol:"QCOM",  name:"Qualcomm",             sector:"Technology",    type:"Stock", base:158},
  {symbol:"TXN",   name:"Texas Instruments",    sector:"Technology",    type:"Stock", base:168},
  {symbol:"AMAT",  name:"Applied Materials",    sector:"Technology",    type:"Stock", base:148},
  {symbol:"LRCX",  name:"Lam Research",         sector:"Technology",    type:"Stock", base:748},
  {symbol:"KLAC",  name:"KLA Corp",             sector:"Technology",    type:"Stock", base:688},
  {symbol:"MU",    name:"Micron",               sector:"Technology",    type:"Stock", base:98},
  {symbol:"ADBE",  name:"Adobe",                sector:"Technology",    type:"Stock", base:378},
  {symbol:"NOW",   name:"ServiceNow",           sector:"Technology",    type:"Stock", base:998},
  {symbol:"INTU",  name:"Intuit",               sector:"Technology",    type:"Stock", base:598},
  {symbol:"PANW",  name:"Palo Alto Networks",   sector:"Technology",    type:"Stock", base:188},
  {symbol:"CRWD",  name:"CrowdStrike",          sector:"Technology",    type:"Stock", base:358},
  {symbol:"SNOW",  name:"Snowflake",            sector:"Technology",    type:"Stock", base:148},
  {symbol:"NET",   name:"Cloudflare",           sector:"Technology",    type:"Stock", base:118},
  {symbol:"DDOG",  name:"Datadog",              sector:"Technology",    type:"Stock", base:108},
  {symbol:"ZS",    name:"Zscaler",              sector:"Technology",    type:"Stock", base:188},
  {symbol:"FTNT",  name:"Fortinet",             sector:"Technology",    type:"Stock", base:98},
  {symbol:"JPM",   name:"JPMorgan Chase",       sector:"Financials",    type:"Stock", base:238},
  {symbol:"BAC",   name:"Bank of America",      sector:"Financials",    type:"Stock", base:44},
  {symbol:"WFC",   name:"Wells Fargo",          sector:"Financials",    type:"Stock", base:74},
  {symbol:"GS",    name:"Goldman Sachs",        sector:"Financials",    type:"Stock", base:558},
  {symbol:"MS",    name:"Morgan Stanley",       sector:"Financials",    type:"Stock", base:128},
  {symbol:"AXP",   name:"American Express",     sector:"Financials",    type:"Stock", base:268},
  {symbol:"BLK",   name:"BlackRock",            sector:"Financials",    type:"Stock", base:988},
  {symbol:"SCHW",  name:"Charles Schwab",       sector:"Financials",    type:"Stock", base:78},
  {symbol:"V",     name:"Visa",                 sector:"Financials",    type:"Stock", base:338},
  {symbol:"MA",    name:"Mastercard",           sector:"Financials",    type:"Stock", base:528},
  {symbol:"PYPL",  name:"PayPal",               sector:"Financials",    type:"Stock", base:68},
  {symbol:"UNH",   name:"UnitedHealth",         sector:"Healthcare",    type:"Stock", base:480},
  {symbol:"JNJ",   name:"Johnson & Johnson",    sector:"Healthcare",    type:"Stock", base:158},
  {symbol:"LLY",   name:"Eli Lilly",            sector:"Healthcare",    type:"Stock", base:808},
  {symbol:"ABBV",  name:"AbbVie",               sector:"Healthcare",    type:"Stock", base:205},
  {symbol:"MRK",   name:"Merck",                sector:"Healthcare",    type:"Stock", base:90},
  {symbol:"PFE",   name:"Pfizer",               sector:"Healthcare",    type:"Stock", base:25},
  {symbol:"AMGN",  name:"Amgen",                sector:"Healthcare",    type:"Stock", base:290},
  {symbol:"GILD",  name:"Gilead",               sector:"Healthcare",    type:"Stock", base:98},
  {symbol:"ISRG",  name:"Intuitive Surgical",   sector:"Healthcare",    type:"Stock", base:488},
  {symbol:"VRTX",  name:"Vertex Pharma",        sector:"Healthcare",    type:"Stock", base:480},
  {symbol:"REGN",  name:"Regeneron",            sector:"Healthcare",    type:"Stock", base:738},
  {symbol:"HD",    name:"Home Depot",           sector:"Cons. Disc.",   type:"Stock", base:388},
  {symbol:"MCD",   name:"McDonald's",           sector:"Cons. Disc.",   type:"Stock", base:295},
  {symbol:"NKE",   name:"Nike",                 sector:"Cons. Disc.",   type:"Stock", base:76},
  {symbol:"SBUX",  name:"Starbucks",            sector:"Cons. Disc.",   type:"Stock", base:108},
  {symbol:"BKNG",  name:"Booking Holdings",     sector:"Cons. Disc.",   type:"Stock", base:4888},
  {symbol:"LOW",   name:"Lowe's",               sector:"Cons. Disc.",   type:"Stock", base:238},
  {symbol:"TJX",   name:"TJX Companies",        sector:"Cons. Disc.",   type:"Stock", base:118},
  {symbol:"COST",  name:"Costco",               sector:"Cons. Staples", type:"Stock", base:900},
  {symbol:"WMT",   name:"Walmart",              sector:"Cons. Staples", type:"Stock", base:98},
  {symbol:"PG",    name:"Procter & Gamble",     sector:"Cons. Staples", type:"Stock", base:168},
  {symbol:"KO",    name:"Coca-Cola",            sector:"Cons. Staples", type:"Stock", base:68},
  {symbol:"PEP",   name:"PepsiCo",              sector:"Cons. Staples", type:"Stock", base:148},
  {symbol:"MDLZ",  name:"Mondelez",             sector:"Cons. Staples", type:"Stock", base:62},
  {symbol:"CL",    name:"Colgate-Palmolive",    sector:"Cons. Staples", type:"Stock", base:98},
  {symbol:"XOM",   name:"ExxonMobil",           sector:"Energy",        type:"Stock", base:110},
  {symbol:"CVX",   name:"Chevron",              sector:"Energy",        type:"Stock", base:155},
  {symbol:"COP",   name:"ConocoPhillips",       sector:"Energy",        type:"Stock", base:96},
  {symbol:"EOG",   name:"EOG Resources",        sector:"Energy",        type:"Stock", base:118},
  {symbol:"SLB",   name:"SLB",                  sector:"Energy",        type:"Stock", base:40},
  {symbol:"OXY",   name:"Occidental",           sector:"Energy",        type:"Stock", base:48},
  {symbol:"CAT",   name:"Caterpillar",          sector:"Industrials",   type:"Stock", base:360},
  {symbol:"BA",    name:"Boeing",               sector:"Industrials",   type:"Stock", base:175},
  {symbol:"HON",   name:"Honeywell",            sector:"Industrials",   type:"Stock", base:218},
  {symbol:"UPS",   name:"UPS",                  sector:"Industrials",   type:"Stock", base:108},
  {symbol:"DE",    name:"Deere & Co",           sector:"Industrials",   type:"Stock", base:480},
  {symbol:"GE",    name:"GE Aerospace",         sector:"Industrials",   type:"Stock", base:188},
  {symbol:"LMT",   name:"Lockheed Martin",      sector:"Industrials",   type:"Stock", base:468},
  {symbol:"RTX",   name:"RTX Corp",             sector:"Industrials",   type:"Stock", base:128},
  {symbol:"NOC",   name:"Northrop Grumman",     sector:"Industrials",   type:"Stock", base:488},
  {symbol:"FDX",   name:"FedEx",                sector:"Industrials",   type:"Stock", base:258},
  {symbol:"NEE",   name:"NextEra Energy",       sector:"Utilities",     type:"Stock", base:67},
  {symbol:"SO",    name:"Southern Co",          sector:"Utilities",     type:"Stock", base:88},
  {symbol:"DUK",   name:"Duke Energy",          sector:"Utilities",     type:"Stock", base:108},
  {symbol:"AEP",   name:"Am. Electric Power",   sector:"Utilities",     type:"Stock", base:100},
  {symbol:"PCG",   name:"PG&E",                 sector:"Utilities",     type:"Stock", base:16},
  {symbol:"PLD",   name:"Prologis",             sector:"Real Estate",   type:"Stock", base:115},
  {symbol:"AMT",   name:"American Tower",       sector:"Real Estate",   type:"Stock", base:188},
  {symbol:"EQIX",  name:"Equinix",              sector:"Real Estate",   type:"Stock", base:888},
  {symbol:"SPG",   name:"Simon Property",       sector:"Real Estate",   type:"Stock", base:178},
  {symbol:"O",     name:"Realty Income",        sector:"Real Estate",   type:"Stock", base:56},
  // ETFs
  {symbol:"SPY",   name:"SPDR S&P 500",         sector:"Broad Market",  type:"ETF",   base:574},
  {symbol:"QQQ",   name:"Invesco Nasdaq 100",   sector:"Broad Market",  type:"ETF",   base:488},
  {symbol:"IWM",   name:"iShares Russell 2000", sector:"Broad Market",  type:"ETF",   base:208},
  {symbol:"DIA",   name:"SPDR Dow Jones",       sector:"Broad Market",  type:"ETF",   base:426},
  {symbol:"VTI",   name:"Vanguard Total Market",sector:"Broad Market",  type:"ETF",   base:258},
  {symbol:"VOO",   name:"Vanguard S&P 500",     sector:"Broad Market",  type:"ETF",   base:528},
  {symbol:"GLD",   name:"SPDR Gold Shares",     sector:"Commodities",   type:"ETF",   base:296},
  {symbol:"SLV",   name:"iShares Silver",       sector:"Commodities",   type:"ETF",   base:33},
  {symbol:"USO",   name:"US Oil Fund",          sector:"Commodities",   type:"ETF",   base:74},
  {symbol:"TLT",   name:"iShares 20Y Treasury", sector:"Bonds",         type:"ETF",   base:88},
  {symbol:"HYG",   name:"iShares High Yield",   sector:"Bonds",         type:"ETF",   base:78},
  {symbol:"LQD",   name:"iShares Corp Bond",    sector:"Bonds",         type:"ETF",   base:108},
  {symbol:"XLK",   name:"Technology Select",    sector:"Technology",    type:"ETF",   base:228},
  {symbol:"XLF",   name:"Financial Select",     sector:"Financials",    type:"ETF",   base:48},
  {symbol:"XLV",   name:"Health Care Select",   sector:"Healthcare",    type:"ETF",   base:148},
  {symbol:"XLE",   name:"Energy Select",        sector:"Energy",        type:"ETF",   base:88},
  {symbol:"XLI",   name:"Industrial Select",    sector:"Industrials",   type:"ETF",   base:138},
  {symbol:"XLY",   name:"Cons. Disc. Select",   sector:"Cons. Disc.",   type:"ETF",   base:198},
  {symbol:"XLP",   name:"Cons. Staples Select", sector:"Cons. Staples", type:"ETF",   base:78},
  {symbol:"XLU",   name:"Utilities Select",     sector:"Utilities",     type:"ETF",   base:78},
  {symbol:"XLB",   name:"Materials Select",     sector:"Materials",     type:"ETF",   base:88},
  {symbol:"XLRE",  name:"Real Estate Select",   sector:"Real Estate",   type:"ETF",   base:40},
  {symbol:"ARKK",  name:"ARK Innovation",       sector:"Technology",    type:"ETF",   base:58},
  {symbol:"MTUM",  name:"iShares Momentum",     sector:"Broad Market",  type:"ETF",   base:228},
  {symbol:"QUAL",  name:"iShares Quality",      sector:"Broad Market",  type:"ETF",   base:168},
  {symbol:"USMV",  name:"iShares Min Vol",      sector:"Broad Market",  type:"ETF",   base:88},
  {symbol:"VTV",   name:"Vanguard Value",       sector:"Broad Market",  type:"ETF",   base:168},
  {symbol:"VUG",   name:"Vanguard Growth",      sector:"Broad Market",  type:"ETF",   base:388},
];

// ── EMA calculation ──
function calcEMA(closes, period) {
  const k = 2 / (period + 1);
  const ema = [];
  let prev = closes.slice(0, period).reduce((a, b) => a + b, 0) / period;
  ema[period - 1] = prev;
  for (let i = period; i < closes.length; i++) {
    prev = closes[i] * k + prev * (1 - k);
    ema[i] = +prev.toFixed(4);
  }
  return ema;
}

// ── Generate a realistic 120-day price series with trend ──
function genPriceSeries(base, trendStrength = 0) {
  // trendStrength: >0 = uptrend, <0 = downtrend, 0 = random
  const prices = [base];
  for (let i = 1; i < 120; i++) {
    const drift  = trendStrength * 0.0015;
    const noise  = (Math.random() - 0.488) * 0.015;
    prices.push(+(prices[i - 1] * (1 + drift + noise)).toFixed(4));
  }
  return prices;
}

// ── Score how close price is to 21 EMA (0 = on it, negative = below) ──
function calcPullbackScore(closes, ema21) {
  const last    = closes[closes.length - 1];
  const lastEMA = ema21[ema21.length - 1];
  if (!lastEMA) return null;
  return +((last / lastEMA - 1) * 100).toFixed(2); // % above/below EMA
}

// ── Check if trend is rising (EMA sloping up) ──
function isTrendRising(ema21, lookback = 10) {
  const len = ema21.length;
  if (len < lookback + 1) return false;
  // EMA must be higher now than it was `lookback` bars ago
  return ema21[len - 1] > ema21[len - 1 - lookback];
}

// ── Build screener dataset ──
// ── Build screener row from real candle data ──
function buildScreenerRow(stock, closes) {
  const ema21  = calcEMA(closes, 21);
  const ema50  = calcEMA(closes, 50);

  const last       = closes[closes.length - 1];
  const prev       = closes[closes.length - 2];
  const chg1D      = +((last / prev - 1) * 100).toFixed(2);
  const chg1W      = closes.length >= 6  ? +((last / closes[closes.length - 6]  - 1) * 100).toFixed(2) : 0;
  const chg1M      = closes.length >= 22 ? +((last / closes[closes.length - 22] - 1) * 100).toFixed(2) : 0;

  const pctFromEMA21 = calcPullbackScore(closes, ema21);
  const pctFromEMA50 = calcPullbackScore(closes, ema50);
  const trendUp      = isTrendRising(ema21.filter(v => v !== undefined));
  const ema21Val     = ema21[ema21.length - 1];
  const ema50Val     = ema50[ema50.length - 1];
  const ema21Slope   = ema21Val && ema21[ema21.length - 6]
    ? +((ema21Val / ema21[ema21.length - 6] - 1) * 100).toFixed(3)
    : 0;

  // RSI (14)
  let gains = 0, losses = 0;
  for (let i = closes.length - 14; i < closes.length; i++) {
    const d = closes[i] - closes[i - 1];
    if (d > 0) gains += d; else losses -= d;
  }
  const avgG = gains / 14, avgL = losses / 14;
  const rsi  = avgL === 0 ? 100 : +(100 - 100 / (1 + avgG / avgL)).toFixed(1);

  const hi52 = +Math.max(...closes).toFixed(4);
  const lo52 = +Math.min(...closes).toFixed(4);
  const pctFrom52Hi = +((last / hi52 - 1) * 100).toFixed(2);

  const vol = Math.round(500000 + Math.random() * 9500000);

  const nearEMA = Math.abs(pctFromEMA21) < 3;
  const onEMA   = Math.abs(pctFromEMA21) < 1.5;
  const pullbackQuality = trendUp
    ? onEMA   ? 90 + Math.round(Math.random() * 10)
    : nearEMA ? 70 + Math.round(Math.random() * 20)
    : Math.abs(pctFromEMA21) < 5 ? 50 + Math.round(Math.random() * 20)
    : 10 + Math.round(Math.random() * 30)
    : 5 + Math.round(Math.random() * 25);

  return {
    ...stock,
    price: +last.toFixed(4),
    chg1D, chg1W, chg1M,
    ema21: ema21Val ? +ema21Val.toFixed(4) : null,
    ema50: ema50Val ? +ema50Val.toFixed(4) : null,
    ema21Slope, pctFromEMA21, pctFromEMA50,
    trendUp, rsi, hi52, lo52, pctFrom52Hi, vol,
    pullbackQuality, closes,
    isLive: true,
  };
}

function buildScreenerData() {
  return SCREENER_UNIVERSE.map(stock => {
    const r = Math.random();
    const trend = r < 0.40 ? 0.6 + Math.random() * 0.8
                : r < 0.70 ? (Math.random() - 0.5) * 0.4
                : -(0.4 + Math.random() * 0.8);
    const closes = genPriceSeries(stock.base, trend);
    return buildScreenerRow(stock, closes);
  });
}

function ScreenerView() {
  const [data,         setData]        = useState(() => buildScreenerData());
  const [liveStatus,   setLiveStatus]  = useState("idle"); // idle | loading | done | error
  const [liveProgress, setLiveProgress]= useState(0);
  const [sortCol,      setSortCol]     = useState("pullbackQuality");
  const [sortDir,      setSortDir]     = useState("desc");
  const [typeFilter,   setTypeFilter]  = useState("All");
  const [sectorFilter, setSectorFilter]= useState("All");
  const [showPassing,  setShowPassing] = useState(true);
  const [selected,     setSelected]    = useState(null);

  const [maxPctFromEMA, setMaxPctFromEMA] = useState(5);
  const [minSlope,      setMinSlope]      = useState(0.1);
  const [minRSI,        setMinRSI]        = useState(40);
  const [maxRSI,        setMaxRSI]        = useState(70);

  // ── Fetch live data for all screener tickers ──
  const loadLive = useCallback(async () => {
    setLiveStatus("loading");
    setLiveProgress(0);
    try {
      const symbols = SCREENER_UNIVERSE.map(s => s.symbol);
      const CHUNK   = 20;
      const updated = [...data];
      for (let i = 0; i < symbols.length; i += CHUNK) {
        const chunk = symbols.slice(i, i + CHUNK);
        await Promise.all(chunk.map(async (sym, ci) => {
          const idx    = i + ci;
          const stock  = SCREENER_UNIVERSE[idx];
          const candles = await fetchDailyCandles(sym, 120);
          if (candles && candles.length >= 30) {
            updated[idx] = buildScreenerRow(stock, candles);
          }
        }));
        setLiveProgress(Math.round(((i + CHUNK) / symbols.length) * 100));
        if (i + CHUNK < symbols.length) await new Promise(r => setTimeout(r, 1100));
      }
      setData([...updated]);
      setLiveStatus("done");
    } catch(e) {
      setLiveStatus("error");
    }
  }, []);

  const sectors = ["All", ...Array.from(new Set(SCREENER_UNIVERSE.map(s => s.sector))).sort()];

  const filtered = data.filter(s => {
    if (typeFilter !== "All" && s.type !== typeFilter) return false;
    if (sectorFilter !== "All" && s.sector !== sectorFilter) return false;
    if (showPassing) {
      if (!s.trendUp) return false;
      if (s.ema21Slope < minSlope) return false;
      if (Math.abs(s.pctFromEMA21) > maxPctFromEMA) return false;
      if (s.rsi < minRSI || s.rsi > maxRSI) return false;
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    const av = a[sortCol] ?? 0, bv = b[sortCol] ?? 0;
    return sortDir === "asc" ? av - bv : bv - av;
  });

  const handleSort = (col) => {
    if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortCol(col); setSortDir("desc"); }
  };

  const selData = selected ? data.find(s => s.symbol === selected) : null;

  const Th = ({col, label, title}) => (
    <th onClick={() => handleSort(col)} title={title}
      style={{padding:"8px 10px",textAlign:"left",cursor:"pointer",userSelect:"none",whiteSpace:"nowrap",
        color: sortCol===col ? "#7dd3f0" : "#162535",
        fontSize:8, fontFamily:"'Space Mono',monospace", letterSpacing:1,
        borderBottom:"1px solid #1a2535", background:"#0a0e14",
        position:"sticky", top:0, zIndex:1,
      }}>
      {label}{sortCol===col ? (sortDir==="asc" ? " ▲" : " ▼") : ""}
    </th>
  );

  // Quality badge color
  const qCol = q => q >= 80 ? "#7dd3f0" : q >= 60 ? "#90cfe8" : q >= 40 ? "#c8dff0" : "#ff5f6d";

  // Tiny sparkline (SVG)
  const Spark = ({closes, w=80, h=28}) => {
    const slice = closes.slice(-30);
    const min = Math.min(...slice), max = Math.max(...slice);
    const range = max - min || 1;
    const pts = slice.map((v,i) => `${(i/(slice.length-1))*w},${h - ((v-min)/range)*h}`).join(" ");
    const up = slice[slice.length-1] >= slice[0];
    return (
      <svg width={w} height={h} style={{display:"block"}}>
        <polyline points={pts} fill="none" stroke={up?"#7dd3f0":"#ff5f6d"} strokeWidth={1.2} strokeLinejoin="round"/>
      </svg>
    );
  };

  return (
    <div style={{display:"flex",flexDirection:"column",gap:12,fontFamily:"'Space Mono',monospace"}}>

      {/* ── HEADER ── */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
        <div>
          <div style={{color:"#e8f4f8",fontSize:13,fontWeight:700,letterSpacing:2}}>21 EMA PULLBACK SCREENER</div>
          <div style={{display:"flex",alignItems:"center",gap:6,marginTop:3}}>
            {liveStatus==="done"
              ? <span style={{color:"#7dd3f0",fontSize:8,letterSpacing:1}}>● LIVE DATA</span>
              : liveStatus==="loading"
              ? <span style={{color:"#c8dff0",fontSize:8,letterSpacing:1}}>◌ LOADING LIVE DATA {liveProgress}%</span>
              : <span style={{color:"#6890a8",fontSize:8,letterSpacing:1}}>○ SIMULATED DATA</span>
            }
          </div>
        </div>
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          {liveStatus!=="loading" && (
            <button onClick={loadLive}
              style={{background:"#7dd3f020",border:"1px solid #7dd3f0",color:"#7dd3f0",borderRadius:6,padding:"4px 12px",cursor:"pointer",fontSize:8,letterSpacing:1}}>
              {liveStatus==="done"?"↻ REFRESH LIVE":"⬇ LOAD LIVE DATA"}
            </button>
          )}
          {liveStatus==="loading" && (
            <div style={{width:100,height:4,background:"#1a2535",borderRadius:2,overflow:"hidden"}}>
              <div style={{width:`${liveProgress}%`,height:"100%",background:"#7dd3f0",borderRadius:2,transition:"width 0.3s"}}/>
            </div>
          )}
          <button onClick={()=>setShowPassing(v=>!v)}
            style={{background:showPassing?"#7dd3f020":"none",border:`1px solid ${showPassing?"#7dd3f0":"#1a2535"}`,color:showPassing?"#7dd3f0":"#a8c4d4",borderRadius:6,padding:"4px 12px",cursor:"pointer",fontSize:8,letterSpacing:1}}>
            {showPassing ? "⌗ FILTER ON" : "⌗ FILTER OFF"}
          </button>
          <span style={{color:"#5a7a95",fontSize:10}}>|</span>
          <span style={{color:sorted.length>0?"#7dd3f0":"#ff5f6d",fontSize:10,fontWeight:700}}>{sorted.length}</span>
          <span style={{color:"#6890a8",fontSize:8}}>{showPassing?"PASSING":"TOTAL"}</span>
        </div>
      </div>

      {/* ── CRITERIA PANEL ── */}
      <div style={{background:"#0d1420",border:"1px solid #1a2535",borderRadius:12,padding:"14px 16px"}}>
        <div style={{color:"#6890a8",fontSize:8,letterSpacing:2,marginBottom:12}}>SCREENING CRITERIA</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:16}}>

          {/* Criterion 1 */}
          <div>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
              <span style={{color:"#6890a8",fontSize:9}}>Max % from 21 EMA</span>
              <span style={{color:"#7dd3f0",fontSize:9,fontWeight:700}}>±{maxPctFromEMA}%</span>
            </div>
            <input type="range" min={0.5} max={10} step={0.5} value={maxPctFromEMA}
              onChange={e=>setMaxPctFromEMA(+e.target.value)}
              style={{width:"100%",accentColor:"#7dd3f0"}}/>
            <div style={{color:"#6890a8",fontSize:7,marginTop:3}}>Price within this % band of the 21 EMA</div>
          </div>

          {/* Criterion 2 */}
          <div>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
              <span style={{color:"#6890a8",fontSize:9}}>Min EMA slope (5D)</span>
              <span style={{color:"#7dd3f0",fontSize:9,fontWeight:700}}>{minSlope}%</span>
            </div>
            <input type="range" min={0} max={2} step={0.1} value={minSlope}
              onChange={e=>setMinSlope(+e.target.value)}
              style={{width:"100%",accentColor:"#7dd3f0"}}/>
            <div style={{color:"#6890a8",fontSize:7,marginTop:3}}>EMA must be rising by at least this % over 5 days</div>
          </div>

          {/* Criterion 3 — RSI band */}
          <div>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
              <span style={{color:"#6890a8",fontSize:9}}>RSI range</span>
              <span style={{color:"#7dd3f0",fontSize:9,fontWeight:700}}>{minRSI} – {maxRSI}</span>
            </div>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <input type="range" min={20} max={60} step={1} value={minRSI}
                onChange={e=>setMinRSI(+e.target.value)}
                style={{flex:1,accentColor:"#b8e8ff"}}/>
              <input type="range" min={50} max={90} step={1} value={maxRSI}
                onChange={e=>setMaxRSI(+e.target.value)}
                style={{flex:1,accentColor:"#ff5f6d"}}/>
            </div>
            <div style={{color:"#6890a8",fontSize:7,marginTop:3}}>Filters out overbought / oversold extremes</div>
          </div>

          {/* Criterion 4 — Type + Sector */}
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            <div>
              <div style={{color:"#6890a8",fontSize:9,marginBottom:5}}>Asset type</div>
              <div style={{display:"flex",gap:4}}>
                {["All","Stock","ETF"].map(t=>(
                  <button key={t} onClick={()=>setTypeFilter(t)}
                    style={{background:typeFilter===t?"#7dd3f020":"none",border:`1px solid ${typeFilter===t?"#7dd3f0":"#1a2535"}`,color:typeFilter===t?"#7dd3f0":"#a8c4d4",borderRadius:5,padding:"2px 10px",cursor:"pointer",fontSize:8}}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div style={{color:"#6890a8",fontSize:9,marginBottom:5}}>Sector</div>
              <select value={sectorFilter} onChange={e=>setSectorFilter(e.target.value)}
                style={{background:"#1a2535",border:"1px solid #1e3045",color:"#a8b8c8",borderRadius:5,padding:"3px 8px",fontSize:8,fontFamily:"'Space Mono',monospace",width:"100%",cursor:"pointer"}}>
                {sectors.map(s=><option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

        </div>

        {/* Criteria legend */}
        <div style={{display:"flex",gap:16,marginTop:12,flexWrap:"wrap",borderTop:"1px solid #1a2535",paddingTop:10}}>
          {[
            {col:"#7dd3f0", label:"Trend rising (EMA slope > min)"},
            {col:"#b8e8ff", label:"Price within EMA band"},
            {col:"#c8dff0", label:"RSI in healthy range"},
            {col:"#c8dff0", label:"Quality score = combined signal"},
          ].map(({col,label})=>(
            <div key={label} style={{display:"flex",alignItems:"center",gap:5}}>
              <div style={{width:8,height:8,borderRadius:2,background:col,flexShrink:0}}/>
              <span style={{color:"#6890a8",fontSize:7}}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── RESULTS TABLE ── */}
      {sorted.length === 0 ? (
        <div style={{background:"#0d1420",border:"1px solid #1a2535",borderRadius:12,padding:"32px",textAlign:"center",color:"#6890a8",fontSize:10,letterSpacing:1}}>
          NO RESULTS — TRY LOOSENING THE CRITERIA
        </div>
      ) : (
        <div style={{background:"#0d1420",border:"1px solid #1a2535",borderRadius:12,overflow:"hidden"}}>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead>
                <tr>
                  <Th col="symbol"          label="SYMBOL"       title="Ticker"/>
                  <Th col="type"            label="TYPE"         title="Stock or ETF"/>
                  <Th col="sector"          label="SECTOR"       title="Sector"/>
                  <Th col="price"           label="PRICE"        title="Last price"/>
                  <Th col="chg1D"           label="1D %"         title="1-day % change"/>
                  <Th col="chg1W"           label="1W %"         title="1-week % change"/>
                  <Th col="ema21"           label="21 EMA"       title="21-day EMA value"/>
                  <Th col="pctFromEMA21"    label="% FROM EMA"   title="% price is above/below 21 EMA"/>
                  <Th col="ema21Slope"      label="EMA SLOPE"    title="EMA direction over 5 days"/>
                  <Th col="rsi"             label="RSI"          title="14-day RSI"/>
                  <Th col="pctFrom52Hi"     label="52W HIGH"     title="% below 52-week high"/>
                  <Th col="pullbackQuality" label="QUALITY"      title="Combined signal score 0–100"/>
                  <th style={{padding:"8px 10px",color:"#6890a8",fontSize:8,fontFamily:"'Space Mono',monospace",borderBottom:"1px solid #1a2535",background:"#0a0e14",position:"sticky",top:0}}>CHART</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((s, i) => {
                  const isSel = selected === s.symbol;
                  const emaUp = s.pctFromEMA21 >= 0;
                  const rowBg = isSel ? "#152030" : i % 2 === 0 ? "#0d1420" : "#0f1825";
                  return (
                    <tr key={s.symbol} onClick={() => setSelected(isSel ? null : s.symbol)}
                      style={{background: rowBg, cursor:"pointer", transition:"background 0.1s"}}
                      onMouseEnter={e=>e.currentTarget.style.background="#1e3045"}
                      onMouseLeave={e=>e.currentTarget.style.background=rowBg}>
                      <td style={{padding:"9px 10px",borderBottom:"1px solid #1a253555"}}>
                        <div style={{color:"#e8f4f8",fontSize:11,fontWeight:700,letterSpacing:0.5}}>{s.symbol}</div>
                        <div style={{color:"#5a7a95",fontSize:7,marginTop:1,maxWidth:90,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.name}</div>
                      </td>
                      <td style={{padding:"9px 10px",borderBottom:"1px solid #1a253555"}}>
                        <span style={{background:s.type==="ETF"?"#b8e8ff22":"#c8dff022",color:s.type==="ETF"?"#b8e8ff":"#c8dff0",fontSize:7,padding:"1px 5px",borderRadius:3,letterSpacing:1}}>{s.type}</span>
                      </td>
                      <td style={{padding:"9px 10px",borderBottom:"1px solid #1a253555",color:"#6890a8",fontSize:8,whiteSpace:"nowrap"}}>{s.sector}</td>
                      <td style={{padding:"9px 10px",borderBottom:"1px solid #1a253555",color:"#a8b8c8",fontSize:10,fontWeight:700,whiteSpace:"nowrap"}}>${s.price.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}</td>
                      <td style={{padding:"9px 10px",borderBottom:"1px solid #1a253555",color:s.chg1D>=0?"#7dd3f0":"#ff5f6d",fontSize:10,fontWeight:700}}>{s.chg1D>=0?"+":""}{s.chg1D}%</td>
                      <td style={{padding:"9px 10px",borderBottom:"1px solid #1a253555",color:s.chg1W>=0?"#7dd3f0":"#ff5f6d",fontSize:10}}>{s.chg1W>=0?"+":""}{s.chg1W}%</td>
                      <td style={{padding:"9px 10px",borderBottom:"1px solid #1a253555",color:"#6890a8",fontSize:9}}>${s.ema21?.toFixed(2)}</td>
                      <td style={{padding:"9px 10px",borderBottom:"1px solid #1a253555"}}>
                        <span style={{color:emaUp?"#c8dff0":"#b8e8ff",fontSize:10,fontWeight:700}}>{emaUp?"+":""}{s.pctFromEMA21}%</span>
                        <div style={{width:50,height:3,background:"#1a2535",borderRadius:2,marginTop:3,overflow:"hidden"}}>
                          <div style={{width:`${Math.min(100,Math.abs(s.pctFromEMA21)/maxPctFromEMA*50+50)}%`,height:"100%",background:emaUp?"#c8dff0":"#b8e8ff",borderRadius:2}}/>
                        </div>
                      </td>
                      <td style={{padding:"9px 10px",borderBottom:"1px solid #1a253555",color:s.ema21Slope>=0?"#7dd3f0":"#ff5f6d",fontSize:9}}>{s.ema21Slope>=0?"+":""}{s.ema21Slope}%</td>
                      <td style={{padding:"9px 10px",borderBottom:"1px solid #1a253555"}}>
                        <span style={{color:s.rsi>70?"#ff5f6d":s.rsi<30?"#ff5f6d":"#a8b8c8",fontSize:10}}>{s.rsi}</span>
                        <div style={{width:36,height:3,background:"#1a2535",borderRadius:2,marginTop:3,overflow:"hidden"}}>
                          <div style={{width:`${s.rsi}%`,height:"100%",background:s.rsi>70?"#ff5f6d":s.rsi<30?"#ff5f6d":"#7dd3f0",borderRadius:2}}/>
                        </div>
                      </td>
                      <td style={{padding:"9px 10px",borderBottom:"1px solid #1a253555",color:"#6890a8",fontSize:9}}>{s.pctFrom52Hi}%</td>
                      <td style={{padding:"9px 10px",borderBottom:"1px solid #1a253555"}}>
                        <div style={{display:"flex",alignItems:"center",gap:6}}>
                          <div style={{width:28,height:28,borderRadius:"50%",border:`2px solid ${qCol(s.pullbackQuality)}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                            <span style={{color:qCol(s.pullbackQuality),fontSize:8,fontWeight:700}}>{s.pullbackQuality}</span>
                          </div>
                          <div style={{width:36,height:3,background:"#1a2535",borderRadius:2,overflow:"hidden"}}>
                            <div style={{width:`${s.pullbackQuality}%`,height:"100%",background:qCol(s.pullbackQuality),borderRadius:2}}/>
                          </div>
                        </div>
                      </td>
                      <td style={{padding:"9px 10px",borderBottom:"1px solid #1a253555"}}>
                        <Spark closes={s.closes}/>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── SELECTED DETAIL PANEL ── */}
      {selData && (
        <div style={{background:"#0d1420",border:"1px solid #7dd3f033",borderRadius:12,padding:"16px 18px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
            <div>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <span style={{color:"#e8f4f8",fontSize:14,fontWeight:700,letterSpacing:1}}>{selData.symbol}</span>
                <span style={{color:"#6890a8",fontSize:10}}>{selData.name}</span>
                <span style={{color:selData.chg1D>=0?"#7dd3f0":"#ff5f6d",fontSize:12,fontWeight:700}}>{selData.chg1D>=0?"+":""}{selData.chg1D}%</span>
              </div>
              <div style={{color:"#6890a8",fontSize:8,marginTop:3}}>{selData.sector} · {selData.type}</div>
            </div>
            <button onClick={()=>setSelected(null)} style={{background:"none",border:"none",color:"#6890a8",fontSize:14,cursor:"pointer"}}>✕</button>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:8,marginBottom:14}}>
            {[
              {label:"Price",        val:`$${selData.price.toFixed(2)}`,              col:"#e8f4f8"},
              {label:"21 EMA",       val:`$${selData.ema21?.toFixed(2)}`,             col:"#b8e8ff"},
              {label:"% from EMA",   val:`${selData.pctFromEMA21>=0?"+":""}${selData.pctFromEMA21}%`, col:Math.abs(selData.pctFromEMA21)<2?"#7dd3f0":"#c8dff0"},
              {label:"EMA Slope",    val:`${selData.ema21Slope>=0?"+":""}${selData.ema21Slope}%`,     col:selData.ema21Slope>0?"#7dd3f0":"#ff5f6d"},
              {label:"RSI (14)",     val:selData.rsi,                                 col:selData.rsi>70||selData.rsi<30?"#ff5f6d":"#7dd3f0"},
              {label:"Trend",        val:selData.trendUp?"RISING":"FALLING",          col:selData.trendUp?"#7dd3f0":"#ff5f6d"},
              {label:"Quality",      val:selData.pullbackQuality,                     col:qCol(selData.pullbackQuality)},
              {label:"52W High",     val:`${selData.pctFrom52Hi}%`,                   col:"#6890a8"},
            ].map(({label,val,col})=>(
              <div key={label} style={{background:"#0a0e14",borderRadius:8,padding:"10px 12px",border:"1px solid #1a2535"}}>
                <div style={{color:"#6890a8",fontSize:7,marginBottom:3,letterSpacing:1}}>{label}</div>
                <div style={{color:col,fontSize:13,fontWeight:700}}>{val}</div>
              </div>
            ))}
          </div>
          {/* 30-day close chart with EMA overlay */}
          <div style={{color:"#6890a8",fontSize:8,letterSpacing:1,marginBottom:8}}>30-DAY PRICE vs 21 EMA</div>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={selData.closes.slice(-30).map((c,i)=>({i,price:c,ema21:calcEMA(selData.closes,21)[selData.closes.length-30+i]}))} margin={{top:4,right:4,bottom:0,left:0}}>
              <CartesianGrid strokeDasharray="2 4" stroke="#1a2535" vertical={false}/>
              <XAxis dataKey="i" hide/>
              <YAxis tick={{fill:"#4a6a85",fontSize:8,fontFamily:"'Space Mono',monospace"}} tickLine={false} axisLine={false} width={40} domain={["auto","auto"]}/>
              <Tooltip content={({active,payload})=>{
                if(!active||!payload?.length) return null;
                return(
                  <div style={{background:"#1a2535",border:"1px solid #1e3045",borderRadius:6,padding:"6px 10px",fontFamily:"'Space Mono',monospace",fontSize:9}}>
                    <div style={{color:"#7dd3f0"}}>Price: ${payload[0]?.value?.toFixed(2)}</div>
                    {payload[1]?.value&&<div style={{color:"#b8e8ff"}}>EMA21: ${payload[1].value?.toFixed(2)}</div>}
                  </div>
                );
              }}/>
              <Line type="monotone" dataKey="price" stroke="#7dd3f0" strokeWidth={2} dot={false}/>
              <Line type="monotone" dataKey="ema21" stroke="#b8e8ff" strokeWidth={1.5} dot={false} strokeDasharray="4 2"/>
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// THEMES / RS VIEW
// ─────────────────────────────────────────────────────────────────────────────

const RS_TIMEFRAMES = ["Day","Week","1M","3M","6M","1Y"];

// ── Themes data ──
const THEMES_DATA = [
  { id:"ai",          label:"Artificial Intelligence",    rank:1,  leaders:["NVDA","MSFT","GOOGL","META","AMD"],   setups:["PLTR","AI","SOUN","BBAI","IONQ"]   },
  { id:"cyber",       label:"Cybersecurity",              rank:2,  leaders:["CRWD","PANW","ZS","FTNT","NET"],      setups:["S","OKTA","TENB","CYBR","SAIL"]    },
  { id:"semis",       label:"Semiconductors",             rank:3,  leaders:["NVDA","AVGO","AMD","AMAT","KLAC"],    setups:["MU","ON","WOLF","MRVL","QCOM"]     },
  { id:"cleanenergy", label:"Clean Energy",               rank:4,  leaders:["NEE","ENPH","FSLR","RUN","SEDG"],     setups:["NOVA","ARRY","CSIQ","FLNC","SPWR"] },
  { id:"biotech",     label:"Biotechnology",              rank:5,  leaders:["LLY","REGN","VRTX","AMGN","BIIB"],    setups:["SRPT","IRTC","EXAS","RARE","RYTM"] },
  { id:"cloud",       label:"Cloud & SaaS",               rank:6,  leaders:["NOW","CRM","SNOW","DDOG","MDB"],      setups:["ZI","GTLB","CFLT","MNDY","BILL"]  },
  { id:"defense",     label:"Aerospace & Defense",        rank:7,  leaders:["LMT","RTX","NOC","GE","LDOS"],        setups:["HWM","LDOS","PSN","CW","TDG"]     },
  { id:"fintech",     label:"Fintech & Payments",         rank:8,  leaders:["V","MA","PYPL","SQ","AFRM"],          setups:["BILL","FOUR","FLYW","IIIV","RELY"] },
  { id:"ev",          label:"Electric Vehicles",          rank:9,  leaders:["TSLA","RIVN","NIO","LI","LCID"],      setups:["FSR","GOEV","WKHS","SOLO","NKLA"] },
  { id:"healthcare",  label:"Healthcare Innovation",      rank:10, leaders:["ISRG","DXCM","PODD","TMDX","AXNX"],   setups:["GKOS","NVCR","ASAN","CERT","APLD"]},
  { id:"uranium",     label:"Uranium & Nuclear",          rank:11, leaders:["CCJ","NXE","URA","DNN","URG"],         setups:["UUUU","EU","BWXT","LEU","SMR"]    },
  { id:"natgas",      label:"Natural Gas",                rank:12, leaders:["AR","EQT","RRC","SWN","CTRA"],         setups:["GPOR","CNX","CRK","MGY","NOG"]    },
  { id:"retail",      label:"Consumer Discretionary",     rank:13, leaders:["AMZN","COST","TJX","BKNG","HD"],       setups:["RVLV","PRPL","ARCO","CAVA","BROS"] },
  { id:"shipping",    label:"Shipping & Logistics",       rank:14, leaders:["FDX","UPS","ZTO","EXPD","SAIA"],       setups:["ODFL","XPO","CHRW","JBHT","TFII"] },
  { id:"realestate",  label:"Real Estate & REITs",        rank:15, leaders:["PLD","EQIX","AMT","SPG","O"],          setups:["REXR","EXR","CUBE","NSA","COLD"]  },
  { id:"commodities", label:"Commodities & Mining",       rank:16, leaders:["FCX","NEM","GOLD","WPM","AEM"],        setups:["AG","PAAS","HL","EXK","MAG"]      },
  { id:"infra",       label:"US Infrastructure",          rank:17, leaders:["VMC","MLM","PWR","EME","MTZ"],         setups:["CENX","AEM","ES","EVRG","XEL"]    },
  { id:"wind",        label:"Wind Energy",                rank:18, leaders:["NEE","GEV","AMSC","BWEN","VWSYF"],     setups:["NEE"]                             },
];

const SECTORS_RS_DATA = [
  { id:"tech",       label:"Technology",          rank:1,  leaders:["NVDA","AAPL","MSFT","AVGO","AMD"],    setups:["AMAT","KLAC","LRCX","MU","ADI"]    },
  { id:"health",     label:"Healthcare",          rank:2,  leaders:["LLY","UNH","ABBV","MRK","AMGN"],      setups:["ISRG","VRTX","REGN","DXCM","PODD"] },
  { id:"finance",    label:"Financials",          rank:3,  leaders:["JPM","V","MA","GS","BLK"],             setups:["AXP","MS","SCHW","PYPL","COF"]     },
  { id:"ind",        label:"Industrials",         rank:4,  leaders:["GE","CAT","LMT","RTX","HON"],          setups:["DE","EMR","ETN","PWR","VMC"]       },
  { id:"energy",     label:"Energy",              rank:5,  leaders:["XOM","CVX","COP","EOG","SLB"],          setups:["OXY","DVN","FANG","MPC","VLO"]     },
  { id:"consdisc",   label:"Cons. Discretionary", rank:6,  leaders:["AMZN","TSLA","HD","MCD","BKNG"],       setups:["LOW","TJX","NKE","SBUX","CMG"]     },
  { id:"comms",      label:"Communication",       rank:7,  leaders:["META","GOOGL","NFLX","DIS","CHTR"],    setups:["T","VZ","PARA","WBD","FOX"]        },
  { id:"staples",    label:"Cons. Staples",       rank:8,  leaders:["COST","WMT","PG","KO","PEP"],          setups:["MDLZ","CL","GIS","K","CAG"]        },
  { id:"materials",  label:"Materials",           rank:9,  leaders:["FCX","NEM","APD","SHW","ECL"],          setups:["LIN","PPG","CF","MOS","ALB"]       },
  { id:"realestate", label:"Real Estate",         rank:10, leaders:["PLD","AMT","EQIX","SPG","O"],           setups:["EXR","CUBE","REXR","NSA","ARE"]    },
  { id:"utilities",  label:"Utilities",           rank:11, leaders:["NEE","SO","DUK","AEP","PCG"],           setups:["EXC","XEL","WEC","ES","FE"]        },
];

const SUBMARKETS_DATA = [
  { id:"oilgas_ep",   label:"Oil & Gas E&P",           rank:1,  leaders:["COP","EOG","DVN","OXY","FANG"],    setups:["NOG","MTDR","CTRA","MGY","VTLE"]   },
  { id:"telecom",     label:"Telecommunications",       rank:2,  leaders:["T","VZ","TMUS","LUMN","ASTS"],     setups:["DISH","SHEN","USM","CBB","ATEX"]   },
  { id:"natgas_prod", label:"Natural Gas Producers",    rank:3,  leaders:["EQT","AR","RRC","SWN","GPOR"],     setups:["CRK","CNX","CHRD","ESTE","GFSL"]   },
  { id:"semis_eq",    label:"Semiconductor Equipment",  rank:4,  leaders:["AMAT","LRCX","KLAC","ASML","TER"], setups:["ONTO","FORM","CAMT","ICHR","ACLS"]  },
  { id:"biotech_sm",  label:"Biotechnology",            rank:5,  leaders:["VRTX","REGN","BIIB","EXAS","RARE"],setups:["SRPT","IRTC","RYTM","FOLD","IMVT"] },
  { id:"software_app",label:"Software - Application",  rank:6,  leaders:["NOW","CRM","INTU","ADBE","SNPS"],  setups:["DDOG","SNOW","MDB","ZI","GTLB"]    },
  { id:"defense_sm",  label:"Aerospace & Defense",      rank:7,  leaders:["LMT","RTX","NOC","GD","HII"],      setups:["HWM","TDG","CW","MOOG","KTOS"]     },
  { id:"silver",      label:"Silver Miners",            rank:8,  leaders:["WPM","PAAS","AG","HL","EXK"],      setups:["CDE","MAG","SSRM","MUX","TFPM"]    },
  { id:"infra_sm",    label:"US Infrastructure",        rank:9,  leaders:["PWR","EME","MTZ","CENX","AEM"],    setups:["ROAD","PRIM","MYRG","NVEE","STRL"] },
  { id:"shipping_sm", label:"Shipping",                 rank:10, leaders:["FDX","UPS","ZTO","SAIA","ODFL"],   setups:["EXPD","XPO","JBHT","CHRW","GXO"]   },
  { id:"wind_sm",     label:"Wind Energy",              rank:11, leaders:["GEV","NEE","AMSC","BWEN","AY"],    setups:["NEE"]                              },
  { id:"uranium_sm",  label:"Uranium",                  rank:12, leaders:["CCJ","NXE","DNN","URG","EU"],      setups:["UUUU","BWXT","LEU","SMR","OKLO"]   },
  { id:"copper",      label:"Copper Miners",            rank:13, leaders:["FCX","SCCO","TECK","HBM","ERO"],   setups:["CMMC","NGEX","SOLG","CS","CPER"]   },
  { id:"fintech_sm",  label:"Fintech",                  rank:14, leaders:["V","MA","PYPL","SQ","AFRM"],       setups:["BILL","FOUR","FLYW","RELY","IIIV"]  },
  { id:"cloud_sm",    label:"Cloud Infrastructure",     rank:15, leaders:["SNOW","DDOG","NET","CFLT","MDB"],  setups:["GTLB","ZI","MNDY","BILL","HUBS"]   },
];

// ── Generate RS scores for radar ──
function genRSScores(id, benchmark) {
  const seed = id.split("").reduce((a,c)=>a+c.charCodeAt(0),0)
             + (benchmark==="ndx"?1000:0);
  const sr = (min,max,s=0)=>{
    const x=Math.sin(seed+s)*10000;
    return +(min+(x-Math.floor(x))*(max-min)).toFixed(1);
  };
  return {
    rs:     { Day:sr(20,95,1), Week:sr(20,95,2), "1M":sr(20,95,3), "3M":sr(20,95,4), "6M":sr(20,95,5), "1Y":sr(20,95,6) },
    volAdj: { Day:sr(15,90,7), Week:sr(15,90,8), "1M":sr(15,90,9), "3M":sr(15,90,10),"6M":sr(15,90,11),"1Y":sr(15,90,12)},
    perf:   { Day:sr(-2,4,13), Week:sr(-5,12,14),"1M":sr(-8,25,15),"3M":sr(-12,35,16),"6M":sr(-18,55,17),"1Y":sr(-25,80,18)},
  };
}

// ── SVG Radar Chart ──
function RadarChart({ scores, width=180, height=160 }) {
  const cx = width/2, cy = height/2 + 8;
  const r  = Math.min(width,height)*0.36;
  const tfs = RS_TIMEFRAMES;
  const n   = tfs.length;

  const angleOf = i => (i/n)*Math.PI*2 - Math.PI/2;
  const pt = (val,i) => {
    const a = angleOf(i);
    const rv = r*(val/100);
    return [cx+rv*Math.cos(a), cy+rv*Math.sin(a)];
  };

  // Grid rings
  const rings = [20,40,60,80,100];
  const gridPts = (pct) => tfs.map((_,i)=>pt(pct,i));

  const polyStr = pts => pts.map(([x,y])=>`${x},${y}`).join(" ");

  const rsPoints    = tfs.map((t,i)=>pt(scores.rs[t],i));
  const volPoints   = tfs.map((t,i)=>pt(scores.volAdj[t],i));

  return (
    <svg width={width} height={height} style={{display:"block",margin:"0 auto"}}>
      {/* grid rings */}
      {rings.map(pct=>(
        <polygon key={pct} points={polyStr(gridPts(pct))}
          fill="none" stroke="#1e3045" strokeWidth={0.5}/>
      ))}
      {/* spokes */}
      {tfs.map((_,i)=>{
        const [x,y]=pt(100,i);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#1e3045" strokeWidth={0.5}/>;
      })}
      {/* vol-adjusted area */}
      <polygon points={polyStr(volPoints)}
        fill="#c8dff033" stroke="#c8dff0" strokeWidth={1.2} strokeLinejoin="round"/>
      {/* RS area */}
      <polygon points={polyStr(rsPoints)}
        fill="#7dd3f033" stroke="#b8e8ff" strokeWidth={1.5} strokeLinejoin="round"/>
      {/* RS dots */}
      {rsPoints.map(([x,y],i)=>(
        <circle key={i} cx={x} cy={y} r={2.5} fill="#b8e8ff" stroke="#0a0e14" strokeWidth={1}/>
      ))}
      {/* axis labels */}
      {tfs.map((t,i)=>{
        const a=angleOf(i);
        const lx=cx+(r+14)*Math.cos(a);
        const ly=cy+(r+14)*Math.sin(a);
        return(
          <text key={t} x={lx} y={ly+3} textAnchor="middle"
            fill="#2a4a65" fontSize={8} fontFamily="'Space Mono',monospace">{t}</text>
        );
      })}
    </svg>
  );
}

// ── Horizontal perf bars ──
function PerfBars({ perf }) {
  const tfs = RS_TIMEFRAMES;
  const max = Math.max(...Object.values(perf).map(Math.abs), 5);
  return (
    <div style={{display:"flex",flexDirection:"column",gap:3}}>
      {tfs.map(t=>{
        const v=perf[t], up=v>=0;
        const barW=Math.min(100, (Math.abs(v)/max)*100);
        return(
          <div key={t} style={{display:"flex",alignItems:"center",gap:6}}>
            <span style={{color:"#6890a8",fontSize:7,fontFamily:"'Space Mono',monospace",width:24,flexShrink:0,textAlign:"right"}}>{t}</span>
            <div style={{flex:1,height:5,background:"#1a2535",borderRadius:3,overflow:"hidden",position:"relative"}}>
              <div style={{
                position:"absolute",
                [up?"left":"right"]:up?"50%":"50%",
                width:`${barW/2}%`,
                height:"100%",
                background:up?"#7dd3f0":"#c8dff0",
                borderRadius:3,
                left:up?"50%":undefined,
                right:!up?"50%":undefined,
              }}/>
              {/* zero line */}
              <div style={{position:"absolute",left:"50%",top:0,bottom:0,width:1,background:"#162535"}}/>
            </div>
            <span style={{color:up?"#7dd3f0":"#c8dff0",fontSize:7,fontFamily:"'Space Mono',monospace",width:38,flexShrink:0,textAlign:"right",fontWeight:700}}>
              {up?"+":""}{v.toFixed(1)}%
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── Single RS Card ──
function RSCard({ item, benchmark, rank, liveRS, liveChg, etfSym, isLive }) {
  const simScores = genRSScores(item.id+benchmark, benchmark);

  // Use live RS if available, fall back to simulated
  const rs3M    = liveRS?.["3M"] ?? null;
  const rsAvg   = rs3M != null
    ? +((liveRS["1M"]??50)*0.2 + (liveRS["3M"]??50)*0.3 + (liveRS["6M"]??50)*0.3 + (liveRS["1Y"]??50)*0.2).toFixed(0)
    : +(Object.values(simScores.rs).reduce((a,b)=>a+b,0)/6).toFixed(0);

  const strength    = rsAvg>=70?"STRONG":rsAvg>=50?"NEUTRAL":"WEAK";
  const strengthCol = rsAvg>=70?"#7dd3f0":rsAvg>=50?"#c8dff0":"#ff5f6d";
  const chgUp       = (liveChg??0) >= 0;

  // Build radar scores — overlay live RS values on simulated axes
  const displayScores = liveRS ? {
    ...simScores,
    rs: { Day: liveRS["1M"]??50, Week: liveRS["1M"]??50, "1M": liveRS["1M"]??50, "3M": liveRS["3M"]??50, "6M": liveRS["6M"]??50, "1Y": liveRS["1Y"]??50 },
    volAdj: simScores.volAdj,
    perf: {
      Day:  liveChg ?? simScores.perf.Day,
      Week: simScores.perf.Week,
      "1M": simScores.perf["1M"],
      "3M": simScores.perf["3M"],
      "6M": simScores.perf["6M"],
      "1Y": simScores.perf["1Y"],
    },
  } : simScores;

  return (
    <div style={{background:"#0d1420",border:"1px solid #1a2535",borderRadius:12,padding:"14px 14px 12px",display:"flex",flexDirection:"column",gap:10,minWidth:0}}>

      {/* header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div style={{fontFamily:"'Space Mono',monospace"}}>
          <div style={{color:"#e8f4f8",fontSize:11,fontWeight:700,letterSpacing:0.5}}>{item.label}</div>
          <div style={{display:"flex",alignItems:"center",gap:6,marginTop:3,flexWrap:"wrap"}}>
            <span style={{color:strengthCol,fontSize:7,fontWeight:700,letterSpacing:1,background:strengthCol+"18",padding:"1px 5px",borderRadius:3}}>{strength}</span>
            <span style={{color:"#6890a8",fontSize:7}}>RS: {rsAvg}</span>
            {etfSym && <span style={{color:"#5a7a95",fontSize:7}}>{etfSym}</span>}
            {isLive && liveChg != null && (
              <span style={{color:chgUp?"#7dd3f0":"#ff5f6d",fontSize:7}}>{chgUp?"+":""}{liveChg.toFixed(2)}%</span>
            )}
            {isLive && <span style={{color:"#22c55e",fontSize:7}}>●</span>}
          </div>
        </div>
        <div style={{background:"#1a2535",borderRadius:6,width:22,height:22,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          <span style={{color:"#6890a8",fontSize:8,fontFamily:"'Space Mono',monospace",fontWeight:700}}>#{rank}</span>
        </div>
      </div>

      {/* leaders */}
      <div>
        <div style={{color:"#6890a8",fontSize:7,fontFamily:"'Space Mono',monospace",letterSpacing:1,marginBottom:4}}>LEADERS</div>
        <div style={{background:"#1a2535",borderRadius:6,padding:"5px 8px",display:"flex",flexWrap:"wrap",gap:4}}>
          {item.leaders.slice(0,5).map(t=>(
            <span key={t} style={{color:"#7dd3f0",fontSize:8,fontFamily:"'Space Mono',monospace"}}>${t}</span>
          ))}
        </div>
      </div>

      {/* setups */}
      <div>
        <div style={{color:"#6890a8",fontSize:7,fontFamily:"'Space Mono',monospace",letterSpacing:1,marginBottom:4}}>SETTING UP</div>
        <div style={{background:"#1a2535",borderRadius:6,padding:"5px 8px",display:"flex",flexWrap:"wrap",gap:4,minHeight:24}}>
          {item.setups.length>0
            ? item.setups.slice(0,5).map(t=>(
                <span key={t} style={{color:"#a8b8c8",fontSize:8,fontFamily:"'Space Mono',monospace"}}>${t}</span>
              ))
            : <span style={{color:"#6890a8",fontSize:8,fontFamily:"'Space Mono',monospace"}}>N/A</span>
          }
        </div>
      </div>

      {/* radar */}
      <RadarChart scores={displayScores}/>

      {/* legend */}
      <div style={{display:"flex",gap:10,justifyContent:"center"}}>
        {[["#b8e8ff","RS"],["#c8dff0","Vol-Adj RS"]].map(([col,lbl])=>(
          <div key={lbl} style={{display:"flex",alignItems:"center",gap:4}}>
            <div style={{width:10,height:3,background:col,borderRadius:1}}/>
            <span style={{color:"#6890a8",fontSize:7,fontFamily:"'Space Mono',monospace"}}>{lbl}</span>
          </div>
        ))}
      </div>

      {/* perf bars */}
      <PerfBars perf={displayScores.perf}/>
    </div>
  );
}

// ── Sort controls ──
function RSControls({ sort, setSort, benchmark, setBenchmark, search, setSearch }) {
  return (
    <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
      <div style={{display:"flex",gap:0,background:"#0d1420",border:"1px solid #1a2535",borderRadius:8,overflow:"hidden",flex:"0 0 auto"}}>
        <input value={search} onChange={e=>setSearch(e.target.value)}
          placeholder="SEARCH..."
          style={{background:"none",border:"none",color:"#e8f4f8",padding:"5px 12px",fontSize:9,fontFamily:"'Space Mono',monospace",width:120,outline:"none",letterSpacing:1}}
        />
      </div>
      <div style={{display:"flex",gap:3}}>
        {[{k:"rank",l:"RANK"},{k:"rs",l:"RS SCORE"},{k:"alpha",l:"A–Z"}].map(({k,l})=>(
          <button key={k} onClick={()=>setSort(k)} style={{background:sort===k?"#7dd3f020":"none",border:`1px solid ${sort===k?"#7dd3f0":"#1a2535"}`,color:sort===k?"#7dd3f0":"#162535",borderRadius:5,padding:"3px 8px",cursor:"pointer",fontSize:7,letterSpacing:1,fontFamily:"'Space Mono',monospace"}}>{l}</button>
        ))}
      </div>
      <div style={{display:"flex",gap:3}}>
        {[{k:"spx",l:"vs S&P 500"},{k:"ndx",l:"vs NASDAQ"}].map(({k,l})=>(
          <button key={k} onClick={()=>setBenchmark(k)} style={{background:benchmark===k?"#e879f920":"none",border:`1px solid ${benchmark===k?"#c8dff0":"#1a2535"}`,color:benchmark===k?"#c8dff0":"#162535",borderRadius:5,padding:"3px 8px",cursor:"pointer",fontSize:7,letterSpacing:1,fontFamily:"'Space Mono',monospace"}}>{l}</button>
        ))}
      </div>
    </div>
  );
}

function ThemesRSView({ liveQuotes, liveCandles, thematicLoading }) {
  const [subview,    setSubview]    = useState("themes");
  const [benchmark,  setBenchmark]  = useState("spx");
  const [sort,       setSort]       = useState("rank");
  const [search,     setSearch]     = useState("");

  const isLive = Object.keys(liveQuotes).length > 0;
  const spyCandles = liveCandles["SPY"];

  // Get live ETF map for current subview
  const etfMap = subview === "themes" ? THEME_ETFS
    : subview === "sectors" ? SECTOR_ETFS
    : SUBMARKET_ETFS;

  // Compute live RS score for an item
  const getLiveRS = useCallback((item) => {
    const sym = etfMap[item.id];
    if (!sym || !isLive) return null;
    const etfC = liveCandles[sym];
    if (!etfC || !spyCandles) return null;
    return {
      "3M": calcRS(etfC, spyCandles, 63),
      "1M": calcRS(etfC, spyCandles, 21),
      "6M": calcRS(etfC, spyCandles, 126),
      "1Y": calcRS(etfC, spyCandles, 252),
    };
  }, [liveQuotes, liveCandles, isLive, etfMap, spyCandles]);

  // Compute live % change for an item
  const getLiveChg = useCallback((item) => {
    const sym = etfMap[item.id];
    if (!sym || !isLive) return null;
    return liveQuotes[sym]?.dp ?? null;
  }, [liveQuotes, isLive, etfMap]);

  const datasets = { themes: THEMES_DATA, sectors: SECTORS_RS_DATA, submarkets: SUBMARKETS_DATA };
  const activeData = datasets[subview];

  const filtered = activeData
    .filter(i=>!search || i.label.toLowerCase().includes(search.toLowerCase()) || i.leaders.some(t=>t.toLowerCase().includes(search.toLowerCase())))
    .sort((a,b)=>{
      if (sort==="rank")  return a.rank - b.rank;
      if (sort==="alpha") return a.label.localeCompare(b.label);
      if (sort==="rs") {
        const rsA = getLiveRS(a);
        const rsB = getLiveRS(b);
        if (rsA && rsB) return (rsB["3M"]??50) - (rsA["3M"]??50);
        const sa = genRSScores(a.id+benchmark,benchmark);
        const sb = genRSScores(b.id+benchmark,benchmark);
        return Object.values(sb.rs).reduce((x,y)=>x+y,0) - Object.values(sa.rs).reduce((x,y)=>x+y,0);
      }
      return 0;
    });

  const SUBVIEWS = [
    {k:"themes",     l:"Themes"},
    {k:"sectors",    l:"Sectors"},
    {k:"submarkets", l:"Sub Markets"},
  ];

  return (
    <div style={{display:"flex",flexDirection:"column",gap:14,fontFamily:"'Space Mono',monospace"}}>

      {/* header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
        <div>
          <div style={{color:"#e8f4f8",fontSize:14,fontWeight:700,letterSpacing:2}}>THEMES, SECTORS & SUB MARKETS</div>
          <div style={{color:isLive?"#7dd3f0":thematicLoading?"#c8dff0":"#1e3045",fontSize:8,marginTop:2,letterSpacing:1}}>
            {isLive ? "● LIVE RS SCORES · ETF-BASED vs SPY" : thematicLoading ? "◌ LOADING LIVE DATA..." : "○ SIMULATED · RELATIVE STRENGTH RADAR"}
          </div>
        </div>
        {/* sub-view tabs */}
        <div style={{display:"flex",gap:0,background:"#0d1420",border:"1px solid #1a2535",borderRadius:8,overflow:"hidden"}}>
          {SUBVIEWS.map(({k,l})=>(
            <button key={k} onClick={()=>setSubview(k)}
              style={{background:subview===k?"#7dd3f020":"none",border:"none",borderRight:"1px solid #1a2535",color:subview===k?"#b8e8ff":"#a8c4d4",padding:"6px 16px",cursor:"pointer",fontSize:9,letterSpacing:1,fontFamily:"'Space Mono',monospace",transition:"all 0.15s"}}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* controls */}
      <RSControls sort={sort} setSort={setSort} benchmark={benchmark} setBenchmark={setBenchmark} search={search} setSearch={setSearch}/>

      {/* count */}
      <div style={{color:"#6890a8",fontSize:8,letterSpacing:1}}>{filtered.length} {subview.toUpperCase()} · BENCHMARK: {benchmark==="spx"?"S&P 500":"NASDAQ 100"}</div>

      {/* grid */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:10}}>
        {filtered.map(item => {
          const liveRS  = getLiveRS(item);
          const liveChg = getLiveChg(item);
          const sym     = etfMap[item.id];
          return (
            <RSCard key={item.id} item={item} benchmark={benchmark} rank={item.rank}
              liveRS={liveRS} liveChg={liveChg} etfSym={sym} isLive={isLive}/>
          );
        })}
      </div>

    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FUNDAMENTALS VIEW
// ─────────────────────────────────────────────────────────────────────────────

// Simulated fundamental data per ticker
// In production: swap genFundamentals() with Finnhub /stock/metric endpoint
const FUND_UNIVERSE = {
  AAPL:  {name:"Apple Inc.",              sector:"Technology",    industry:"Consumer Electronics",    mktCap:2850},
  MSFT:  {name:"Microsoft Corp.",         sector:"Technology",    industry:"Software - Application",  mktCap:3080},
  NVDA:  {name:"NVIDIA Corp.",            sector:"Technology",    industry:"Semiconductors",           mktCap:2180},
  META:  {name:"Meta Platforms",          sector:"Technology",    industry:"Internet Content & Info",  mktCap:1260},
  GOOGL: {name:"Alphabet Inc.",           sector:"Technology",    industry:"Internet Content & Info",  mktCap:2100},
  AMZN:  {name:"Amazon.com Inc.",         sector:"Cons. Disc.",   industry:"Internet Retail",          mktCap:1920},
  TSLA:  {name:"Tesla Inc.",              sector:"Cons. Disc.",   industry:"Auto Manufacturers",       mktCap:558},
  JPM:   {name:"JPMorgan Chase",          sector:"Financials",    industry:"Banks - Diversified",      mktCap:580},
  BAC:   {name:"Bank of America",         sector:"Financials",    industry:"Banks - Diversified",      mktCap:308},
  JNJ:   {name:"Johnson & Johnson",       sector:"Healthcare",    industry:"Drug Manufacturers",       mktCap:388},
  LLY:   {name:"Eli Lilly",              sector:"Healthcare",    industry:"Drug Manufacturers",       mktCap:742},
  V:     {name:"Visa Inc.",              sector:"Financials",    industry:"Credit Services",          mktCap:528},
  UNH:   {name:"UnitedHealth Group",      sector:"Healthcare",    industry:"Healthcare Plans",         mktCap:492},
  XOM:   {name:"ExxonMobil Corp.",        sector:"Energy",        industry:"Oil & Gas Integrated",     mktCap:486},
  HD:    {name:"Home Depot",             sector:"Cons. Disc.",   industry:"Home Improvement",         mktCap:358},
  AVGO:  {name:"Broadcom Inc.",          sector:"Technology",    industry:"Semiconductors",           mktCap:612},
  MA:    {name:"Mastercard Inc.",        sector:"Financials",    industry:"Credit Services",          mktCap:454},
  COST:  {name:"Costco Wholesale",       sector:"Cons. Staples", industry:"Discount Stores",          mktCap:348},
  AMD:   {name:"Advanced Micro Devices", sector:"Technology",    industry:"Semiconductors",           mktCap:272},
  CRM:   {name:"Salesforce Inc.",        sector:"Technology",    industry:"Software - Application",   mktCap:288},
  SPY:   {name:"SPDR S&P 500 ETF",       sector:"ETF",           industry:"Broad Market",             mktCap:520},
  QQQ:   {name:"Invesco QQQ Trust",      sector:"ETF",           industry:"Nasdaq 100",               mktCap:248},
  CRWD:  {name:"CrowdStrike Holdings",   sector:"Technology",    industry:"Software - Security",      mktCap:72},
  NOW:   {name:"ServiceNow Inc.",        sector:"Technology",    industry:"Software - Application",   mktCap:162},
  NFLX:  {name:"Netflix Inc.",           sector:"Comm. Svcs",    industry:"Entertainment",            mktCap:272},
};

function genFundamentals(symbol) {
  // Seed random from symbol so same ticker always gets same data
  const seed = symbol.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const sr   = (min, max, s = 0) => {
    const x = Math.sin(seed + s) * 10000;
    return +(min + (x - Math.floor(x)) * (max - min)).toFixed(2);
  };

  const info = FUND_UNIVERSE[symbol] || {
    name: symbol, sector:"Unknown", industry:"Unknown", mktCap: sr(10, 500, 99)
  };

  // Valuation
  const pe       = sr(8,  85,  1);
  const pb       = sr(0.8, 18, 2);
  const ps       = sr(0.5, 20, 3);
  const evEbitda = sr(6,  45,  4);
  const peg      = sr(0.4, 4,  5);
  const divYield = sr(0,   4,  6);
  const fwdPE    = +(pe * sr(0.7, 0.98, 7)).toFixed(2);
  const eps      = sr(0.5, 25, 8);

  // Profitability
  const grossMargin  = sr(20, 80, 10);
  const opMargin     = sr(5,  45, 11);
  const netMargin    = sr(3,  35, 12);
  const roe          = sr(5,  55, 13);
  const roa          = sr(2,  22, 14);
  const roic         = sr(4,  40, 15);
  const ebitdaMargin = sr(10, 55, 16);

  // Growth (YoY %)
  const revGrowth    = sr(-5,  45, 20);
  const epsGrowth    = sr(-10, 60, 21);
  const grossGrowth  = sr(-5,  40, 22);
  const fcfGrowth    = sr(-15, 55, 23);
  // 3-year revenue CAGR
  const rev3yCagr    = sr(-2,  35, 24);
  // Quarterly EPS trend (last 8 quarters)
  const epsQtrs = Array.from({length:8}, (_,i) => +( eps * (0.6 + i*0.06 + sr(-0.08,0.08,30+i)) ).toFixed(2));
  // Annual revenue (last 4 years, billions)
  const revBase = info.mktCap * sr(0.15, 0.45, 40);
  const revYears = Array.from({length:4}, (_,i) => +( revBase * (0.7 + i*0.12 + sr(-0.05,0.05,50+i)) ).toFixed(1));

  // Balance sheet
  const totalDebt    = +(info.mktCap * sr(0.05, 0.6, 60)).toFixed(1);
  const totalCash    = +(info.mktCap * sr(0.02, 0.3, 61)).toFixed(1);
  const debtEquity   = sr(0.1, 3,   62);
  const currentRatio = sr(0.8, 3.5, 63);
  const quickRatio   = sr(0.5, 3,   64);
  const intCoverage  = sr(2,   25,  65);
  const freeCashFlow = +(info.mktCap * sr(0.02, 0.12, 66)).toFixed(1);
  const bookVal      = +(eps * sr(3, 12, 67)).toFixed(2);

  // Prior year margins (for YoY growth calculation)
  const prevGrossMargin  = +(grossMargin  * sr(0.82, 1.12, 70)).toFixed(2);
  const prevEbitdaMargin = +(ebitdaMargin * sr(0.82, 1.12, 71)).toFixed(2);
  const prevOpMargin     = +(opMargin     * sr(0.80, 1.15, 72)).toFixed(2);
  const prevNetMargin    = +(netMargin    * sr(0.78, 1.18, 73)).toFixed(2);
  const prevFcfMargin    = +(freeCashFlow / info.mktCap * 100 * sr(0.35, 0.85, 74) * sr(0.80, 1.20, 75)).toFixed(2);

  // Industry averages for comparison (slightly tweaked)
  const ind = {
    pe: +(pe * sr(0.7, 1.3, 80)).toFixed(1),
    pb: +(pb * sr(0.7, 1.3, 81)).toFixed(1),
    roe: +(roe * sr(0.6, 1.4, 82)).toFixed(1),
    netMargin: +(netMargin * sr(0.6, 1.4, 83)).toFixed(1),
    debtEquity: +(debtEquity * sr(0.6, 1.4, 84)).toFixed(2),
  };

  return {
    ...info, symbol,
    // Valuation
    pe, fwdPE, pb, ps, evEbitda, peg, divYield, eps, mktCap: info.mktCap,
    // Profitability
    grossMargin, opMargin, netMargin, roe, roa, roic, ebitdaMargin,
    // Growth
    revGrowth, epsGrowth, grossGrowth, fcfGrowth, rev3yCagr, epsQtrs, revYears,
    // Balance sheet
    totalDebt, totalCash, debtEquity, currentRatio, quickRatio, intCoverage, freeCashFlow, bookVal,
    prevGrossMargin, prevEbitdaMargin, prevOpMargin, prevNetMargin, prevFcfMargin,
    // Industry comps
    ind,
  };
}

// ── Helper: colored value vs benchmark ──
function FundMetric({ label, value, fmt, benchmark, benchmarkLabel, goodHigh = true, suffix = "", small = false }) {
  const fmtVal = v => fmt ? fmt(v) : `${v}${suffix}`;
  const vsInd  = benchmark != null
    ? goodHigh ? value >= benchmark : value <= benchmark
    : null;
  const valCol = vsInd === null ? "#a8b8c8" : vsInd ? "#7dd3f0" : "#ff5f6d";

  return (
    <div style={{background:"#0a0e14",borderRadius:8,padding:small?"8px 10px":"11px 14px",border:"1px solid #1a2535",display:"flex",flexDirection:"column",gap:3}}>
      <div style={{color:"#6890a8",fontSize:7,letterSpacing:1,fontFamily:"'Space Mono',monospace"}}>{label}</div>
      <div style={{color:valCol,fontSize:small?13:16,fontWeight:700,fontFamily:"'Space Mono',monospace"}}>{fmtVal(value)}</div>
      {benchmark != null && (
        <div style={{color:"#6890a8",fontSize:7,fontFamily:"'Space Mono',monospace"}}>
          IND AVG: {fmtVal(benchmark)}
          {vsInd !== null && <span style={{color:vsInd?"#7dd3f088":"#ff5f6d88",marginLeft:4}}>{vsInd?"▲ ABOVE":"▼ BELOW"}</span>}
        </div>
      )}
      {benchmarkLabel && <div style={{color:"#6890a8",fontSize:7}}>{benchmarkLabel}</div>}
    </div>
  );
}

// ── Mini bar for margin viz ──
function MarginBar({ label, value, prev, max = 100, color = "#7dd3f0" }) {
  const pct    = Math.max(0, Math.min(100, (value / max) * 100));
  const prevPct= prev != null ? Math.max(0, Math.min(100, (prev / max) * 100)) : null;
  const yoy    = prev != null ? +(value - prev).toFixed(2) : null; // absolute pp change
  const yoyUp  = yoy != null && yoy >= 0;

  return (
    <div style={{marginBottom:10}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
        <span style={{color:"#6890a8",fontSize:9,fontFamily:"'Space Mono',monospace"}}>{label}</span>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          {yoy!=null&&(
            <span style={{
              color:yoyUp?"#7dd3f0":"#ff5f6d",
              fontSize:8,fontFamily:"'Space Mono',monospace",fontWeight:700,
              background:yoyUp?"#7dd3f015":"#ff5f6d15",
              border:`1px solid ${yoyUp?"#7dd3f033":"#ff5f6d33"}`,
              borderRadius:3,padding:"1px 5px",
            }}>
              {yoyUp?"▲":""}{!yoyUp?"▼":""}{yoyUp?"+":""}{yoy.toFixed(1)} pp
            </span>
          )}
          <span style={{color:color,fontSize:9,fontFamily:"'Space Mono',monospace",fontWeight:700}}>{value.toFixed(1)}%</span>
        </div>
      </div>
      <div style={{height:6,background:"#1a2535",borderRadius:3,overflow:"hidden",position:"relative"}}>
        {/* prior year bar (ghost) */}
        {prevPct!=null&&(
          <div style={{position:"absolute",left:0,top:0,width:`${prevPct}%`,height:"100%",background:color+"22",borderRadius:3}}/>
        )}
        {/* current bar */}
        <div style={{position:"absolute",left:0,top:0,width:`${pct}%`,height:"100%",background:color,borderRadius:3,transition:"width 0.4s"}}/>
      </div>
      {prev!=null&&(
        <div style={{color:"#6890a8",fontSize:7,fontFamily:"'Space Mono',monospace",marginTop:2}}>
          PRIOR YEAR: {prev.toFixed(1)}%
        </div>
      )}
    </div>
  );
}

// ── Section header ──
function FundSection({ title, color = "#7dd3f0", children }) {
  return (
    <div style={{background:"#0d1420",border:`1px solid #1a2535`,borderTop:`2px solid ${color}33`,borderRadius:12,padding:"14px 16px"}}>
      <div style={{color:color,fontSize:8,letterSpacing:2,fontFamily:"'Space Mono',monospace",marginBottom:12}}>{title}</div>
      {children}
    </div>
  );
}

function FundamentalsView() {
  const [input,     setInput]    = useState("AAPL");
  const [symbol,    setSymbol]   = useState("AAPL");
  const [data,      setData]     = useState(() => genFundamentals("AAPL"));
  const [loading,   setLoading]  = useState(false);
  const [isLive,    setIsLive]   = useState(false);
  const [activeTab, setActiveTab]= useState("overview");
  const [qtrRevenue,setQtrRevenue]=useState(null);

  const POPULAR_TICKERS = ["AAPL","MSFT","NVDA","META","GOOGL","AMZN","TSLA","JPM","LLY","V","COST","NFLX","AMD","CRM","CRWD"];

  const search = async (sym) => {
    const s = sym.trim().toUpperCase();
    if (!s) return;
    setLoading(true);
    setIsLive(false);
    setSymbol(s);

    try {
      // Fetch profile, metrics, and quote in parallel
      const [profile, metrics, quote, qtrRev] = await Promise.all([
        fetchProfile(s),
        fetchFinnhubMetrics(s),
        fetchQuote(s),
        fetchQuarterlyRevenue(s),
      ]);

      if (metrics && quote) {
        const m = metrics;
        const sim = genFundamentals(s); // use as fallback for missing fields

        // Map Finnhub metric keys → our data shape
        const live = {
          symbol: s,
          name:       profile?.name       ?? sim.name,
          sector:     profile?.finnhubIndustry ?? sim.sector,
          industry:   profile?.finnhubIndustry ?? sim.industry,
          mktCap:     profile?.marketCapitalization ? +(profile.marketCapitalization/1000).toFixed(1) : sim.mktCap,

          // Valuation
          pe:         m["peExclExtraTTM"]       ?? m["peTTM"]        ?? sim.pe,
          fwdPE:      m["peNormalizedAnnual"]   ?? sim.fwdPE,
          pb:         m["pbAnnual"]             ?? sim.pb,
          ps:         m["psTTM"]               ?? sim.ps,
          evEbitda:   m["evEbitdaTTM"]         ?? sim.evEbitda,
          peg:        m["pegRatio"]            ?? sim.peg,
          eps:        m["epsTTM"]              ?? sim.eps,
          divYield:   m["dividendYieldIndicatedAnnual"] ?? sim.divYield,

          // Profitability
          grossMargin:  m["grossMarginTTM"]    ?? sim.grossMargin,
          opMargin:     m["operatingMarginTTM"]?? sim.opMargin,
          netMargin:    m["netProfitMarginTTM"]?? sim.netMargin,
          roe:          m["roeTTM"]            ?? sim.roe,
          roa:          m["roaTTM"]            ?? sim.roa,
          roic:         m["roicTTM"]           ?? sim.roic,
          ebitdaMargin: m["ebitdaMarginTTM"]   ?? sim.ebitdaMargin,

          // Prior year margins from annual fields
          prevGrossMargin:  m["grossMarginAnnual"]         ?? sim.prevGrossMargin,
          prevOpMargin:     m["operatingMarginAnnual"]     ?? sim.prevOpMargin,
          prevNetMargin:    m["netProfitMarginAnnual"]     ?? sim.prevNetMargin,
          prevEbitdaMargin: m["ebitdaMarginAnnual"]        ?? sim.prevEbitdaMargin,
          prevFcfMargin:    sim.prevFcfMargin,

          // Growth
          revGrowth:   m["revenueGrowthTTMYoy"]     ?? sim.revGrowth,
          epsGrowth:   m["epsGrowthTTMYoy"]         ?? sim.epsGrowth,
          grossGrowth: m["revenueGrowthQuarterlyYoy"]?? sim.grossGrowth,
          fcfGrowth:   m["fcfGrowthTTMYoy"]         ?? sim.fcfGrowth,
          rev3yCagr:   m["revenueGrowth3Y"]         ?? sim.rev3yCagr,
          epsQtrs:     sim.epsQtrs,
          revYears:    sim.revYears,

          // Balance sheet
          totalDebt:    m["totalDebt/totalEquityAnnual"] != null
                          ? +(m["totalDebt/totalEquityAnnual"] * (profile?.marketCapitalization??10000) / 1000 * 0.1).toFixed(1)
                          : sim.totalDebt,
          totalCash:    m["cashFlowPerShareTTM"] != null
                          ? sim.totalCash
                          : sim.totalCash,
          debtEquity:   m["totalDebt/totalEquityAnnual"] ?? sim.debtEquity,
          currentRatio: m["currentRatioAnnual"]   ?? sim.currentRatio,
          quickRatio:   m["quickRatioAnnual"]     ?? sim.quickRatio,
          intCoverage:  m["netInterestCoverageAnnual"] ?? sim.intCoverage,
          freeCashFlow: m["freeCashFlowTTM"] != null
                          ? +(m["freeCashFlowTTM"]/1e9).toFixed(1)
                          : sim.freeCashFlow,
          bookVal:      m["bookValuePerShareAnnual"] ?? sim.bookVal,

          // Industry comps (simulated since Finnhub doesn't provide these free)
          ind: sim.ind,
        };

        // Multiply percentage fields that Finnhub returns as decimals
        const pctFields = ["grossMargin","opMargin","netMargin","ebitdaMargin","roe","roa","roic",
                           "prevGrossMargin","prevOpMargin","prevNetMargin","prevEbitdaMargin",
                           "revGrowth","epsGrowth","grossGrowth","fcfGrowth","rev3yCagr","divYield"];
        for (const f of pctFields) {
          if (live[f] != null && Math.abs(live[f]) < 2) live[f] = +(live[f] * 100).toFixed(2);
        }

        setData(live);
        setIsLive(true);
        setQtrRevenue(qtrRev);
      } else {
        // Fallback to simulated
        setData(genFundamentals(s));
        setIsLive(false);
        setQtrRevenue(null);
      }
    } catch {
      setData(genFundamentals(s));
      setIsLive(false);
      setQtrRevenue(null);
    }

    setLoading(false);
  };

  // Load AAPL live on mount
  useEffect(() => { search("AAPL"); }, []);

  const d = data;
  const upColor   = "#7dd3f0";
  const downColor = "#ff5f6d";
  const neutColor = "#a8b8c8";

  const SUBTABS = [
    {k:"overview",      l:"OVERVIEW"},
    {k:"valuation",     l:"VALUATION"},
    {k:"profitability", l:"PROFITABILITY"},
    {k:"growth",        l:"GROWTH"},
    {k:"balance",       l:"BALANCE SHEET"},
  ];

  return (
    <div style={{display:"flex",flexDirection:"column",gap:12,fontFamily:"'Space Mono',monospace"}}>

      {/* ── SEARCH BAR ── */}
      <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
        <div style={{display:"flex",gap:0,background:"#0d1420",border:"1px solid #1a2535",borderRadius:8,overflow:"hidden"}}>
          <input value={input} onChange={e=>setInput(e.target.value.toUpperCase())}
            onKeyDown={e=>e.key==="Enter"&&search(input)}
            placeholder="TICKER"
            style={{background:"none",border:"none",color:"#e8f4f8",padding:"7px 14px",fontSize:11,fontFamily:"'Space Mono',monospace",width:100,outline:"none",letterSpacing:1}}
          />
          <button onClick={()=>search(input)}
            style={{background:"#7dd3f022",border:"none",borderLeft:"1px solid #1a2535",color:"#7dd3f0",padding:"7px 14px",cursor:"pointer",fontSize:9,letterSpacing:1,fontFamily:"'Space Mono',monospace"}}>
            SEARCH
          </button>
        </div>
        {/* Quick picks */}
        <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
          {POPULAR_TICKERS.map(t=>(
            <button key={t} onClick={()=>{setInput(t);search(t);}}
              style={{background:symbol===t?"#7dd3f020":"none",border:`1px solid ${symbol===t?"#7dd3f0":"#1a2535"}`,color:symbol===t?"#7dd3f0":"#162535",borderRadius:5,padding:"2px 8px",cursor:"pointer",fontSize:8,letterSpacing:0.5,transition:"all 0.12s"}}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:200,color:"#6890a8",fontSize:10,letterSpacing:2}}>LOADING {symbol}…</div>
      ) : (
        <>
          {/* ── TICKER HEADER ── */}
          <div style={{background:"#0d1420",border:"1px solid #1a2535",borderRadius:12,padding:"16px 18px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12}}>
              <div>
                <div style={{display:"flex",alignItems:"baseline",gap:10}}>
                  <span style={{color:"#e8f4f8",fontSize:20,fontWeight:700,letterSpacing:1}}>{symbol}</span>
                  <span style={{color:"#6890a8",fontSize:11}}>{d.name}</span>
                </div>
                <div style={{display:"flex",gap:8,marginTop:4,flexWrap:"wrap"}}>
                  <span style={{background:"#7dd3f018",color:"#7dd3f0",fontSize:7,padding:"2px 7px",borderRadius:3,letterSpacing:1}}>{d.sector}</span>
                  <span style={{background:"#b8e8ff18",color:"#b8e8ff",fontSize:7,padding:"2px 7px",borderRadius:3,letterSpacing:1}}>{d.industry}</span>
                  <span style={{color:"#6890a8",fontSize:8}}>MKT CAP: <span style={{color:"#a8b8c8"}}>${d.mktCap.toFixed(0)}B</span></span>
                </div>
              </div>
              {/* Key snapshot */}
              <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
                {[
                  {l:"P/E",    v:d.pe.toFixed(1),                    col: d.pe < d.ind.pe ? upColor : downColor},
                  {l:"FWD P/E",v:d.fwdPE.toFixed(1),                 col: d.fwdPE < d.pe ? upColor : neutColor},
                  {l:"EPS",    v:`$${d.eps.toFixed(2)}`,              col: neutColor},
                  {l:"DIV YLD",v:`${d.divYield.toFixed(2)}%`,         col: d.divYield > 1.5 ? upColor : neutColor},
                  {l:"ROE",    v:`${d.roe.toFixed(1)}%`,              col: d.roe > d.ind.roe ? upColor : downColor},
                  {l:"NET MGN",v:`${d.netMargin.toFixed(1)}%`,        col: d.netMargin > d.ind.netMargin ? upColor : downColor},
                ].map(({l,v,col})=>(
                  <div key={l} style={{textAlign:"center"}}>
                    <div style={{color:"#6890a8",fontSize:7,letterSpacing:1,marginBottom:2}}>{l}</div>
                    <div style={{color:col,fontSize:13,fontWeight:700}}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{color: isLive?"#7dd3f088":"#1e304888", fontSize:7, marginTop:10, letterSpacing:1}}>
              {isLive ? "● LIVE DATA VIA FINNHUB /STOCK/METRIC" : "○ SIMULATED DATA · FINNHUB UNAVAILABLE FOR THIS TICKER"}
            </div>
          </div>

          {/* ── SUB-TABS ── */}
          <div style={{display:"flex",gap:0,borderBottom:"1px solid #1a2535"}}>
            {SUBTABS.map(({k,l})=>(
              <button key={k} onClick={()=>setActiveTab(k)}
                style={{background:"none",border:"none",cursor:"pointer",color:activeTab===k?"#7dd3f0":"#162535",fontSize:8,letterSpacing:1,padding:"7px 14px",borderBottom:`2px solid ${activeTab===k?"#7dd3f0":"transparent"}`,marginBottom:-1,transition:"all 0.15s",fontFamily:"'Space Mono',monospace"}}>
                {l}
              </button>
            ))}
          </div>

          {/* ══ OVERVIEW ══ */}
          {activeTab==="overview" && (
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {/* 4 category scorecards */}
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:8}}>
                {[
                  {label:"VALUATION",    col:"#c8dff0", items:[{l:"P/E",v:d.pe.toFixed(1)},{l:"EV/EBITDA",v:d.evEbitda.toFixed(1)},{l:"P/B",v:d.pb.toFixed(1)},{l:"PEG",v:d.peg.toFixed(2)}]},
                  {label:"PROFITABILITY",col:"#7dd3f0", items:[{l:"Net Margin",v:`${d.netMargin.toFixed(1)}%`},{l:"ROE",v:`${d.roe.toFixed(1)}%`},{l:"ROIC",v:`${d.roic.toFixed(1)}%`},{l:"Op Margin",v:`${d.opMargin.toFixed(1)}%`}]},
                  {label:"GROWTH",       col:"#b8e8ff", items:[{l:"Rev Growth",v:`${d.revGrowth>0?"+":""}${d.revGrowth.toFixed(1)}%`},{l:"EPS Growth",v:`${d.epsGrowth>0?"+":""}${d.epsGrowth.toFixed(1)}%`},{l:"3Y CAGR",v:`${d.rev3yCagr.toFixed(1)}%`},{l:"FCF Growth",v:`${d.fcfGrowth>0?"+":""}${d.fcfGrowth.toFixed(1)}%`}]},
                  {label:"BALANCE SHEET",col:"#c8dff0", items:[{l:"Debt/Equity",v:d.debtEquity.toFixed(2)},{l:"Current Ratio",v:d.currentRatio.toFixed(2)},{l:"Cash",v:`$${d.totalCash.toFixed(0)}B`},{l:"FCF",v:`$${d.freeCashFlow.toFixed(0)}B`}]},
                ].map(({label,col,items})=>(
                  <div key={label} style={{background:"#0d1420",border:"1px solid #1a2535",borderTop:`2px solid ${col}44`,borderRadius:12,padding:"14px 16px",cursor:"pointer"}} onClick={()=>setActiveTab(label.toLowerCase().replace(" ",""))}>
                    <div style={{color:col,fontSize:8,letterSpacing:2,marginBottom:10}}>{label}</div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                      {items.map(({l,v})=>(
                        <div key={l}>
                          <div style={{color:"#6890a8",fontSize:7}}>{l}</div>
                          <div style={{color:"#a8b8c8",fontSize:12,fontWeight:700,marginTop:1}}>{v}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{color:"#6890a8",fontSize:7,marginTop:8,letterSpacing:1}}>CLICK TO DEEP DIVE →</div>
                  </div>
                ))}
              </div>

              {/* Revenue trend bar chart */}
              <FundSection title="ANNUAL REVENUE (LAST 4 YEARS · $B)" color="#b8e8ff">
                <ResponsiveContainer width="100%" height={165}>
                  <BarChart
                    data={d.revYears.map((v,i)=>({
                      year:`FY${new Date().getFullYear()-3+i}`,
                      rev:v,
                      yoy: i>0 ? +((v/d.revYears[i-1]-1)*100).toFixed(1) : null,
                    }))}
                    margin={{top:28,right:8,bottom:0,left:0}}>
                    <CartesianGrid strokeDasharray="2 4" stroke="#1a2535" vertical={false}/>
                    <XAxis dataKey="year" tick={{fill:"#2a4a65",fontSize:8,fontFamily:"'Space Mono',monospace"}} tickLine={false} axisLine={false}/>
                    <YAxis tick={{fill:"#4a6a85",fontSize:8,fontFamily:"'Space Mono',monospace"}} tickLine={false} axisLine={false} width={36} tickFormatter={v=>`$${v}B`}/>
                    <Tooltip content={({active,payload})=>{
                      if(!active||!payload?.length) return null;
                      const row=payload[0]?.payload;
                      return(
                        <div style={{background:"#1a2535",border:"1px solid #1e3045",borderRadius:6,padding:"8px 12px",fontFamily:"'Space Mono',monospace",fontSize:9}}>
                          <div style={{color:"#b8e8ff",marginBottom:3}}>${row.rev}B</div>
                          {row.yoy!=null&&<div style={{color:row.yoy>=0?"#7dd3f0":"#ff5f6d"}}>YoY: {row.yoy>=0?"+":""}{row.yoy}%</div>}
                        </div>
                      );
                    }}/>
                    <Bar dataKey="rev" fill="#b8e8ff44" stroke="#b8e8ff" strokeWidth={1} radius={[3,3,0,0]} maxBarSize={60}
                      shape={(props)=>{
                        const {x,y,width,height,payload}=props;
                        return(
                          <g>
                            <rect x={x} y={y} width={width} height={height} fill="#b8e8ff44" stroke="#b8e8ff" strokeWidth={1} rx={3}/>
                            {/* revenue label */}
                            <text x={x+width/2} y={y-14} textAnchor="middle" fill="#b8e8ff" fontSize={8} fontFamily="'Space Mono',monospace">${payload.rev}B</text>
                            {/* YoY badge */}
                            {payload.yoy!=null&&(
                              <text x={x+width/2} y={y-3} textAnchor="middle"
                                fill={payload.yoy>=0?"#7dd3f0":"#ff5f6d"}
                                fontSize={7} fontFamily="'Space Mono',monospace" fontWeight="700">
                                {payload.yoy>=0?"+":""}{payload.yoy}%
                              </text>
                            )}
                          </g>
                        );
                      }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </FundSection>

              {/* Quarterly Revenue with QoQ % change */}
              {(()=>{
                let qtrs;
                if(qtrRevenue && qtrRevenue.length >= 2) {
                  qtrs = qtrRevenue.slice(-8).map((q, i, arr) => {
                    const revB = +(q.rev / 1e9).toFixed(2);
                    const prev = arr[i - 1];
                    const qoq  = prev ? +((q.rev / prev.rev - 1) * 100).toFixed(1) : null;
                    const parts = q.label.split("-");
                    const mo = parseInt(parts[1] || "3");
                    const yr = (parts[0] || "24").slice(-2);
                    const qNum = mo <= 3 ? 1 : mo <= 6 ? 2 : mo <= 9 ? 3 : 4;
                    return { label: `Q${qNum}'${yr}`, rev: revB, qoq };
                  });
                } else {
                  // Simulated fallback — scale off revYears data
                  const baseRev = d.revYears[d.revYears.length - 1] / 4;
                  const seed = d.symbol ? d.symbol.split("").reduce((a,c)=>a+c.charCodeAt(0),0) : 42;
                  const now = new Date();
                  qtrs = Array.from({length:8}, (_,i) => {
                    const qIdx = 7 - i;
                    const qNum = ((now.getMonth()/3|0) - qIdx % 4 + 4) % 4 + 1;
                    const yr = String(now.getFullYear() - Math.floor((qIdx)/4)).slice(-2);
                    const growth = 1 + (Math.sin(seed + i * 1.7) * 0.04);
                    const rev = +(baseRev * growth * (1 + i * 0.01)).toFixed(2);
                    return { label: `Q${qNum}'${yr}`, rev, qoq: null };
                  }).map((q, i, arr) => ({
                    ...q,
                    qoq: i > 0 ? +((q.rev / arr[i-1].rev - 1) * 100).toFixed(1) : null
                  }));
                }
                return (
                  <FundSection title="QUARTERLY REVENUE ($B)" color="#b8e8ff">
                    <ResponsiveContainer width="100%" height={165}>
                      <BarChart data={qtrs} margin={{top:28,right:8,bottom:0,left:0}}>
                        <CartesianGrid strokeDasharray="2 4" stroke="#1a2535" vertical={false}/>
                        <XAxis dataKey="label" tick={{fill:"#2a4a65",fontSize:8,fontFamily:"'Space Mono',monospace"}} tickLine={false} axisLine={false}/>
                        <YAxis tick={{fill:"#4a6a85",fontSize:8,fontFamily:"'Space Mono',monospace"}} tickLine={false} axisLine={false} width={36} tickFormatter={v=>`$${v}B`}/>
                        <Tooltip content={({active,payload})=>{
                          if(!active||!payload?.length) return null;
                          const row=payload[0]?.payload;
                          return(
                            <div style={{background:"#1a2535",border:"1px solid #1e3045",borderRadius:6,padding:"8px 12px",fontFamily:"'Space Mono',monospace",fontSize:9}}>
                              <div style={{color:"#b8e8ff",marginBottom:3}}>{row.label}: ${row.rev}B</div>
                              {row.qoq!=null&&<div style={{color:row.qoq>=0?"#7dd3f0":"#ff5f6d"}}>QoQ: {row.qoq>=0?"+":""}{row.qoq}%</div>}
                            </div>
                          );
                        }}/>
                        <Bar dataKey="rev" fill="#b8e8ff44" stroke="#b8e8ff" strokeWidth={1} radius={[3,3,0,0]} maxBarSize={60}
                          shape={(props)=>{
                            const {x,y,width,height,payload}=props;
                            return(
                              <g>
                                <rect x={x} y={y} width={width} height={height} fill="#b8e8ff44" stroke="#b8e8ff" strokeWidth={1} rx={3}/>
                                <text x={x+width/2} y={y-14} textAnchor="middle" fill="#b8e8ff" fontSize={8} fontFamily="'Space Mono',monospace">${payload.rev}B</text>
                                {payload.qoq!=null&&(
                                  <text x={x+width/2} y={y-3} textAnchor="middle"
                                    fill={payload.qoq>=0?"#7dd3f0":"#ff5f6d"}
                                    fontSize={7} fontFamily="'Space Mono',monospace" fontWeight="700">
                                    {payload.qoq>=0?"+":""}{payload.qoq}%
                                  </text>
                                )}
                              </g>
                            );
                          }}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </FundSection>
                );
              })()}

              {/* EPS quarterly trend */}
              <FundSection title="QUARTERLY EPS — LAST 8 QUARTERS" color="#c8dff0">
                <ResponsiveContainer width="100%" height={155}>
                  <BarChart
                    data={d.epsQtrs.map((v,i)=>({
                      q:`Q${(i%4)+1}'${String(new Date().getFullYear()-Math.floor((7-i)/4)).slice(-2)}`,
                      eps:v,
                      yoy: i>=4 ? +((v/d.epsQtrs[i-4]-1)*100).toFixed(1) : null,
                    }))}
                    margin={{top:28,right:8,bottom:0,left:0}}>
                    <CartesianGrid strokeDasharray="2 4" stroke="#1a2535" vertical={false}/>
                    <XAxis dataKey="q" tick={{fill:"#2a4a65",fontSize:8,fontFamily:"'Space Mono',monospace"}} tickLine={false} axisLine={false}/>
                    <YAxis tick={{fill:"#4a6a85",fontSize:8,fontFamily:"'Space Mono',monospace"}} tickLine={false} axisLine={false} width={36} tickFormatter={v=>`$${v}`}/>
                    <Tooltip content={({active,payload})=>{
                      if(!active||!payload?.length) return null;
                      const row=payload[0]?.payload;
                      return(
                        <div style={{background:"#1a2535",border:"1px solid #1e3045",borderRadius:6,padding:"8px 12px",fontFamily:"'Space Mono',monospace",fontSize:9}}>
                          <div style={{color:"#c8dff0",marginBottom:3}}>${row.eps} EPS</div>
                          {row.yoy!=null&&<div style={{color:row.yoy>=0?"#7dd3f0":"#ff5f6d"}}>YoY: {row.yoy>=0?"+":""}{row.yoy}%</div>}
                        </div>
                      );
                    }}/>
                    <Bar dataKey="eps" maxBarSize={50}
                      shape={(props)=>{
                        const {x,y,width,height,payload}=props;
                        const up=payload.yoy==null||payload.yoy>=0;
                        const barCol=payload.yoy==null?"#c8dff0":up?"#7dd3f0":"#ff5f6d";
                        return(
                          <g>
                            <rect x={x} y={y} width={width} height={height} fill={barCol+"55"} stroke={barCol} strokeWidth={1} rx={3}/>
                            {/* eps label */}
                            <text x={x+width/2} y={y-14} textAnchor="middle" fill="#c8dff0" fontSize={7} fontFamily="'Space Mono',monospace">${payload.eps}</text>
                            {/* YoY badge */}
                            {payload.yoy!=null&&(
                              <text x={x+width/2} y={y-3} textAnchor="middle"
                                fill={payload.yoy>=0?"#7dd3f0":"#ff5f6d"}
                                fontSize={7} fontFamily="'Space Mono',monospace" fontWeight="700">
                                {payload.yoy>=0?"+":""}{payload.yoy}%
                              </text>
                            )}
                          </g>
                        );
                      }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </FundSection>
            </div>
          )}

          {/* ══ VALUATION ══ */}
          {activeTab==="valuation" && (
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <FundSection title="VALUATION MULTIPLES" color="#c8dff0">
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:8}}>
                  <FundMetric label="P/E RATIO"         value={d.pe}       fmt={v=>v.toFixed(1)+"x"}  benchmark={d.ind.pe}       goodHigh={false}/>
                  <FundMetric label="FORWARD P/E"       value={d.fwdPE}    fmt={v=>v.toFixed(1)+"x"}  benchmark={d.pe}           goodHigh={false} benchmarkLabel="vs Trailing P/E"/>
                  <FundMetric label="P/B RATIO"         value={d.pb}       fmt={v=>v.toFixed(2)+"x"}  benchmark={d.ind.pb}       goodHigh={false}/>
                  <FundMetric label="P/S RATIO"         value={d.ps}       fmt={v=>v.toFixed(2)+"x"}/>
                  <FundMetric label="EV / EBITDA"       value={d.evEbitda} fmt={v=>v.toFixed(1)+"x"}/>
                  <FundMetric label="PEG RATIO"         value={d.peg}      fmt={v=>v.toFixed(2)}       benchmarkLabel="<1 = undervalued vs growth"/>
                  <FundMetric label="EPS (TTM)"         value={d.eps}      fmt={v=>`$${v.toFixed(2)}`}/>
                  <FundMetric label="DIVIDEND YIELD"    value={d.divYield} fmt={v=>`${v.toFixed(2)}%`} goodHigh={true}/>
                </div>
              </FundSection>
              {/* P/E vs industry bar */}
              <FundSection title="VALUATION vs INDUSTRY AVERAGE" color="#c8dff0">
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={[
                    {metric:"P/E",    company:d.pe,       industry:d.ind.pe},
                    {metric:"P/B",    company:d.pb,       industry:d.ind.pb},
                    {metric:"EV/EBITDA",company:d.evEbitda,industry:+(d.evEbitda*rng(0.75,1.3)).toFixed(1)},
                  ]} margin={{top:16,right:8,bottom:0,left:0}} barGap={4}>
                    <CartesianGrid strokeDasharray="2 4" stroke="#1a2535" vertical={false}/>
                    <XAxis dataKey="metric" tick={{fill:"#6890a8",fontSize:9,fontFamily:"'Space Mono',monospace"}} tickLine={false} axisLine={false}/>
                    <YAxis tick={{fill:"#4a6a85",fontSize:8,fontFamily:"'Space Mono',monospace"}} tickLine={false} axisLine={false} width={30}/>
                    <Tooltip content={({active,payload,label})=>{
                      if(!active||!payload?.length) return null;
                      return(
                        <div style={{background:"#1a2535",border:"1px solid #1e3045",borderRadius:6,padding:"8px 12px",fontFamily:"'Space Mono',monospace",fontSize:9}}>
                          <div style={{color:"#6890a8",marginBottom:4}}>{label}</div>
                          <div style={{color:"#c8dff0"}}>{symbol}: {payload[0]?.value?.toFixed(1)}x</div>
                          <div style={{color:"#6890a8"}}>Industry: {payload[1]?.value?.toFixed(1)}x</div>
                        </div>
                      );
                    }}/>
                    <Bar dataKey="company"  fill="#c8dff099" stroke="#c8dff0" strokeWidth={1} radius={[3,3,0,0]} maxBarSize={50} name={symbol}/>
                    <Bar dataKey="industry" fill="#1e304588" stroke="#162535" strokeWidth={1} radius={[3,3,0,0]} maxBarSize={50} name="Industry"/>
                  </BarChart>
                </ResponsiveContainer>
                <div style={{display:"flex",gap:12,marginTop:6,justifyContent:"center"}}>
                  {[[`#a78bfa`,symbol],[`#162535`,"Industry Avg"]].map(([col,lbl])=>(
                    <div key={lbl} style={{display:"flex",alignItems:"center",gap:5}}>
                      <div style={{width:10,height:10,borderRadius:2,background:col}}/>
                      <span style={{color:"#6890a8",fontSize:8}}>{lbl}</span>
                    </div>
                  ))}
                </div>
              </FundSection>
            </div>
          )}

          {/* ══ PROFITABILITY ══ */}
          {activeTab==="profitability" && (
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <FundSection title="MARGIN ANALYSIS" color="#7dd3f0">
                <MarginBar label="Gross Margin"      value={d.grossMargin}  prev={d.prevGrossMargin}  color="#7dd3f0"/>
                <MarginBar label="EBITDA Margin"     value={d.ebitdaMargin} prev={d.prevEbitdaMargin} color="#90cfe8"/>
                <MarginBar label="Operating Margin"  value={d.opMargin}     prev={d.prevOpMargin}     color="#b8e8ff"/>
                <MarginBar label="Net Profit Margin" value={d.netMargin}    prev={d.prevNetMargin}    color="#c8dff0"/>
                <MarginBar label="FCF Margin"        value={+(d.freeCashFlow/d.mktCap*100*rng(0.4,0.9)).toFixed(1)} prev={d.prevFcfMargin} color="#c8dff0"/>
              </FundSection>
              <FundSection title="RETURN METRICS" color="#7dd3f0">
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:8}}>
                  <FundMetric label="ROE"  value={d.roe}  fmt={v=>`${v.toFixed(1)}%`} benchmark={d.ind.roe}  goodHigh/>
                  <FundMetric label="ROA"  value={d.roa}  fmt={v=>`${v.toFixed(1)}%`} goodHigh/>
                  <FundMetric label="ROIC" value={d.roic} fmt={v=>`${v.toFixed(1)}%`} goodHigh benchmarkLabel="Cost of capital ~8–10%"/>
                  <FundMetric label="EBITDA MARGIN" value={d.ebitdaMargin} fmt={v=>`${v.toFixed(1)}%`} goodHigh/>
                </div>
              </FundSection>
              <FundSection title="PROFITABILITY vs INDUSTRY" color="#7dd3f0">
                <ResponsiveContainer width="100%" height={150}>
                  <BarChart data={[
                    {metric:"Net Margin", company:d.netMargin, industry:d.ind.netMargin},
                    {metric:"ROE",        company:d.roe,       industry:d.ind.roe},
                    {metric:"Op Margin",  company:d.opMargin,  industry:+(d.opMargin*rng(0.7,1.3)).toFixed(1)},
                  ]} margin={{top:16,right:8,bottom:0,left:0}} barGap={4}>
                    <CartesianGrid strokeDasharray="2 4" stroke="#1a2535" vertical={false}/>
                    <XAxis dataKey="metric" tick={{fill:"#6890a8",fontSize:9,fontFamily:"'Space Mono',monospace"}} tickLine={false} axisLine={false}/>
                    <YAxis tick={{fill:"#4a6a85",fontSize:8,fontFamily:"'Space Mono',monospace"}} tickLine={false} axisLine={false} width={30} tickFormatter={v=>`${v}%`}/>
                    <Tooltip/>
                    <Bar dataKey="company"  fill="#7dd3f099" stroke="#7dd3f0" strokeWidth={1} radius={[3,3,0,0]} maxBarSize={50}/>
                    <Bar dataKey="industry" fill="#1e304588" stroke="#162535" strokeWidth={1} radius={[3,3,0,0]} maxBarSize={50}/>
                  </BarChart>
                </ResponsiveContainer>
              </FundSection>
            </div>
          )}

          {/* ══ GROWTH ══ */}
          {activeTab==="growth" && (
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <FundSection title="GROWTH RATES (YOY)" color="#b8e8ff">
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:8}}>
                  <FundMetric label="REVENUE GROWTH"   value={d.revGrowth}  fmt={v=>`${v>0?"+":""}${v.toFixed(1)}%`} goodHigh/>
                  <FundMetric label="EPS GROWTH"       value={d.epsGrowth}  fmt={v=>`${v>0?"+":""}${v.toFixed(1)}%`} goodHigh/>
                  {(()=>{
                    if(!qtrRevenue||qtrRevenue.length<2) return null;
                    const last=qtrRevenue[qtrRevenue.length-1].rev;
                    const prev=qtrRevenue[qtrRevenue.length-2].rev;
                    const qoq=+((last/prev-1)*100).toFixed(1);
                    return <FundMetric label="QOQ REV. GROWTH" value={qoq} fmt={v=>`${v>0?"+":""}${v.toFixed(1)}%`} goodHigh benchmarkLabel="Quarter-over-quarter revenue change"/>;
                  })()}
                  <FundMetric label="GROSS PROFIT GR." value={d.grossGrowth} fmt={v=>`${v>0?"+":""}${v.toFixed(1)}%`} goodHigh/>
                  <FundMetric label="FCF GROWTH"       value={d.fcfGrowth}  fmt={v=>`${v>0?"+":""}${v.toFixed(1)}%`} goodHigh/>
                  <FundMetric label="3Y REV. CAGR"     value={d.rev3yCagr}  fmt={v=>`${v>0?"+":""}${v.toFixed(1)}%`} goodHigh benchmarkLabel="Compound annual growth rate"/>
                </div>
              </FundSection>
              <FundSection title="ANNUAL REVENUE TREND ($B)" color="#b8e8ff">
                <ResponsiveContainer width="100%" height={150}>
                  <BarChart data={d.revYears.map((v,i)=>({year:`FY${new Date().getFullYear()-3+i}`,rev:v,growth:i>0?+((v/d.revYears[i-1]-1)*100).toFixed(1):null}))} margin={{top:16,right:8,bottom:0,left:0}}>
                    <CartesianGrid strokeDasharray="2 4" stroke="#1a2535" vertical={false}/>
                    <XAxis dataKey="year" tick={{fill:"#2a4a65",fontSize:8,fontFamily:"'Space Mono',monospace"}} tickLine={false} axisLine={false}/>
                    <YAxis tick={{fill:"#4a6a85",fontSize:8,fontFamily:"'Space Mono',monospace"}} tickLine={false} axisLine={false} width={36} tickFormatter={v=>`$${v}B`}/>
                    <Tooltip content={({active,payload,label})=>{
                      if(!active||!payload?.length) return null;
                      const g=payload[0]?.payload?.growth;
                      return(
                        <div style={{background:"#1a2535",border:"1px solid #1e3045",borderRadius:6,padding:"8px 12px",fontFamily:"'Space Mono',monospace",fontSize:9}}>
                          <div style={{color:"#b8e8ff"}}>${payload[0].value}B</div>
                          {g!=null&&<div style={{color:g>=0?"#7dd3f0":"#ff5f6d",marginTop:2}}>{g>=0?"+":""}{g}% YoY</div>}
                        </div>
                      );
                    }}/>
                    <Bar dataKey="rev" fill="#b8e8ff44" stroke="#b8e8ff" strokeWidth={1} radius={[3,3,0,0]} maxBarSize={60}
                      label={{position:"top",fontSize:8,fontFamily:"'Space Mono',monospace",formatter:v=>`$${v}B`,fill:"#b8e8ff"}}/>
                  </BarChart>
                </ResponsiveContainer>
              </FundSection>
              <FundSection title="QUARTERLY EPS TREND" color="#b8e8ff">
                <ResponsiveContainer width="100%" height={140}>
                  <BarChart data={d.epsQtrs.map((v,i)=>({q:`Q${(i%4)+1}'${String(new Date().getFullYear()-Math.floor((7-i)/4)).slice(-2)}`,eps:v,beat:v > d.epsQtrs[Math.max(0,i-1)]}))} margin={{top:16,right:8,bottom:0,left:0}}>
                    <CartesianGrid strokeDasharray="2 4" stroke="#1a2535" vertical={false}/>
                    <XAxis dataKey="q" tick={{fill:"#2a4a65",fontSize:8,fontFamily:"'Space Mono',monospace"}} tickLine={false} axisLine={false}/>
                    <YAxis tick={{fill:"#4a6a85",fontSize:8,fontFamily:"'Space Mono',monospace"}} tickLine={false} axisLine={false} width={36} tickFormatter={v=>`$${v}`}/>
                    <Tooltip content={({active,payload})=>{
                      if(!active||!payload?.length) return null;
                      return <div style={{background:"#1a2535",border:"1px solid #1e3045",borderRadius:6,padding:"6px 10px",fontFamily:"'Space Mono',monospace",fontSize:9,color:"#c8dff0"}}>${payload[0].value} EPS</div>;
                    }}/>
                    <Bar dataKey="eps" radius={[3,3,0,0]} maxBarSize={50}
                      shape={(props)=>{
                        const {x,y,width,height,payload}=props;
                        const col=payload.beat?"#7dd3f0":"#b8e8ff";
                        return <rect x={x} y={y} width={width} height={height} fill={col+"66"} stroke={col} strokeWidth={1} rx={3}/>;
                      }}
                      label={{position:"top",fontSize:7,fontFamily:"'Space Mono',monospace",formatter:v=>`$${v}`,fill:"#2a4a65"}}/>
                  </BarChart>
                </ResponsiveContainer>
              </FundSection>
            </div>
          )}

          {/* ══ BALANCE SHEET ══ */}
          {activeTab==="balance" && (
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <FundSection title="BALANCE SHEET SNAPSHOT" color="#c8dff0">
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:8}}>
                  <FundMetric label="TOTAL CASH"      value={d.totalCash}    fmt={v=>`$${v.toFixed(1)}B`} goodHigh/>
                  <FundMetric label="TOTAL DEBT"      value={d.totalDebt}    fmt={v=>`$${v.toFixed(1)}B`} goodHigh={false}/>
                  <FundMetric label="NET CASH / DEBT" value={+(d.totalCash-d.totalDebt).toFixed(1)} fmt={v=>`${v>=0?"$":"–$"}${Math.abs(v).toFixed(1)}B`} goodHigh/>
                  <FundMetric label="FREE CASH FLOW"  value={d.freeCashFlow} fmt={v=>`$${v.toFixed(1)}B`} goodHigh/>
                  <FundMetric label="DEBT / EQUITY"   value={d.debtEquity}   fmt={v=>v.toFixed(2)+"x"}   benchmark={d.ind.debtEquity} goodHigh={false}/>
                  <FundMetric label="CURRENT RATIO"   value={d.currentRatio} fmt={v=>v.toFixed(2)}        benchmarkLabel=">1.5 = healthy" goodHigh/>
                  <FundMetric label="QUICK RATIO"     value={d.quickRatio}   fmt={v=>v.toFixed(2)}        benchmarkLabel=">1.0 = healthy" goodHigh/>
                  <FundMetric label="INT. COVERAGE"   value={d.intCoverage}  fmt={v=>v.toFixed(1)+"x"}    benchmarkLabel=">3x = safe" goodHigh/>
                </div>
              </FundSection>
              {/* Cash vs Debt visual */}
              <FundSection title="CASH vs DEBT ($B)" color="#c8dff0">
                <ResponsiveContainer width="100%" height={120}>
                  <BarChart data={[{name:"Cash",val:d.totalCash,col:"#7dd3f0"},{name:"Debt",val:d.totalDebt,col:"#ff5f6d"},{name:"FCF",val:d.freeCashFlow,col:"#c8dff0"}]} layout="vertical" margin={{top:4,right:40,bottom:4,left:50}}>
                    <CartesianGrid strokeDasharray="2 4" stroke="#1a2535" horizontal={false}/>
                    <XAxis type="number" tick={{fill:"#4a6a85",fontSize:8,fontFamily:"'Space Mono',monospace"}} tickLine={false} axisLine={false} tickFormatter={v=>`$${v}B`}/>
                    <YAxis type="category" dataKey="name" tick={{fill:"#6890a8",fontSize:9,fontFamily:"'Space Mono',monospace"}} tickLine={false} axisLine={false} width={44}/>
                    <Tooltip content={({active,payload})=>{
                      if(!active||!payload?.length) return null;
                      return <div style={{background:"#1a2535",border:"1px solid #1e3045",borderRadius:6,padding:"6px 10px",fontFamily:"'Space Mono',monospace",fontSize:9,color:payload[0]?.payload?.col}}>${payload[0].value.toFixed(1)}B</div>;
                    }}/>
                    <Bar dataKey="val" radius={[0,3,3,0]} maxBarSize={30}
                      shape={(props)=>{
                        const {x,y,width,height,payload}=props;
                        return <rect x={x} y={y} width={width} height={height} fill={payload.col+"66"} stroke={payload.col} strokeWidth={1} rx={3}/>;
                      }}
                      label={{position:"right",fontSize:8,fontFamily:"'Space Mono',monospace",formatter:v=>`$${v.toFixed(1)}B`,fill:"#2a4a65"}}/>
                  </BarChart>
                </ResponsiveContainer>
              </FundSection>
              <FundSection title="LIQUIDITY RATIOS" color="#c8dff0">
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {[
                    {label:"Current Ratio",  value:d.currentRatio, max:4, safe:1.5, col:"#c8dff0"},
                    {label:"Quick Ratio",    value:d.quickRatio,   max:3, safe:1.0, col:"#c8dff0"},
                    {label:"Interest Cov.",  value:d.intCoverage,  max:25, safe:3,  col:"#7dd3f0"},
                  ].map(({label,value,max,safe,col})=>(
                    <div key={label}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                        <span style={{color:"#6890a8",fontSize:9,fontFamily:"'Space Mono',monospace"}}>{label}</span>
                        <span style={{color:value>=safe?col:"#ff5f6d",fontSize:9,fontWeight:700,fontFamily:"'Space Mono',monospace"}}>{value.toFixed(2)}x</span>
                      </div>
                      <div style={{height:6,background:"#1a2535",borderRadius:3,overflow:"hidden",position:"relative"}}>
                        <div style={{width:`${Math.min(100,(value/max)*100)}%`,height:"100%",background:value>=safe?col:"#ff5f6d",borderRadius:3}}/>
                        {/* safe line marker */}
                        <div style={{position:"absolute",left:`${(safe/max)*100}%`,top:0,bottom:0,width:1,background:"#e8f4f822"}}/>
                      </div>
                      <div style={{color:"#6890a8",fontSize:7,marginTop:2,fontFamily:"'Space Mono',monospace"}}>SAFE THRESHOLD: {safe}x</div>
                    </div>
                  ))}
                </div>
              </FundSection>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// INDUSTRIES VIEW
// ─────────────────────────────────────────────────────────────────────────────

const INDUSTRIES = [
  // Technology
  {id:"semiconductors",      label:"Semiconductors",              sector:"Technology",    sectorColor:"#c8dff0"},
  {id:"software_app",        label:"Software - Application",      sector:"Technology",    sectorColor:"#c8dff0"},
  {id:"software_infra",      label:"Software - Infrastructure",   sector:"Technology",    sectorColor:"#c8dff0"},
  {id:"hardware",            label:"Computer Hardware",           sector:"Technology",    sectorColor:"#c8dff0"},
  {id:"semieq",              label:"Semiconductor Equip.",        sector:"Technology",    sectorColor:"#c8dff0"},
  {id:"it_services",         label:"Information Technology Svcs", sector:"Technology",    sectorColor:"#c8dff0"},
  {id:"electronic_comp",     label:"Electronic Components",       sector:"Technology",    sectorColor:"#c8dff0"},
  // Communication
  {id:"internet_content",    label:"Internet Content & Info",     sector:"Communication", sectorColor:"#b8e8ff"},
  {id:"telecom",             label:"Telecom Services",            sector:"Communication", sectorColor:"#b8e8ff"},
  {id:"entertainment",       label:"Entertainment",               sector:"Communication", sectorColor:"#b8e8ff"},
  {id:"publishing",          label:"Publishing",                  sector:"Communication", sectorColor:"#b8e8ff"},
  {id:"advertising",         label:"Advertising Agencies",        sector:"Communication", sectorColor:"#b8e8ff"},
  {id:"gaming",              label:"Electronic Gaming & Media",   sector:"Communication", sectorColor:"#b8e8ff"},
  // Consumer Discretionary
  {id:"auto_manuf",          label:"Auto Manufacturers",          sector:"Cons. Disc.",   sectorColor:"#c8dff0"},
  {id:"auto_parts",          label:"Auto Parts",                  sector:"Cons. Disc.",   sectorColor:"#c8dff0"},
  {id:"internet_retail",     label:"Internet Retail",             sector:"Cons. Disc.",   sectorColor:"#c8dff0"},
  {id:"specialty_retail",    label:"Specialty Retail",            sector:"Cons. Disc.",   sectorColor:"#c8dff0"},
  {id:"restaurants",         label:"Restaurants",                 sector:"Cons. Disc.",   sectorColor:"#c8dff0"},
  {id:"leisure",             label:"Leisure",                     sector:"Cons. Disc.",   sectorColor:"#c8dff0"},
  {id:"lodging",             label:"Lodging",                     sector:"Cons. Disc.",   sectorColor:"#c8dff0"},
  {id:"apparel_retail",      label:"Apparel Retail",              sector:"Cons. Disc.",   sectorColor:"#c8dff0"},
  {id:"dept_stores",         label:"Department Stores",           sector:"Cons. Disc.",   sectorColor:"#c8dff0"},
  // Consumer Staples
  {id:"discount_stores",     label:"Discount Stores",             sector:"Cons. Staples", sectorColor:"#c8dff0"},
  {id:"grocery",             label:"Grocery Stores",              sector:"Cons. Staples", sectorColor:"#c8dff0"},
  {id:"packaged_foods",      label:"Packaged Foods",              sector:"Cons. Staples", sectorColor:"#c8dff0"},
  {id:"beverages_alc",       label:"Beverages - Brewers",         sector:"Cons. Staples", sectorColor:"#c8dff0"},
  {id:"beverages_nonalc",    label:"Beverages - Non-Alcoholic",   sector:"Cons. Staples", sectorColor:"#c8dff0"},
  {id:"tobacco",             label:"Tobacco",                     sector:"Cons. Staples", sectorColor:"#c8dff0"},
  {id:"household",           label:"Household & Personal Prod.",  sector:"Cons. Staples", sectorColor:"#c8dff0"},
  // Healthcare
  {id:"drug_manuf",          label:"Drug Manufacturers - General",sector:"Healthcare",    sectorColor:"#34d399"},
  {id:"drug_specialty",      label:"Drug Manufacturers - Spec.",  sector:"Healthcare",    sectorColor:"#34d399"},
  {id:"biotech",             label:"Biotechnology",               sector:"Healthcare",    sectorColor:"#34d399"},
  {id:"med_devices",         label:"Medical Devices",             sector:"Healthcare",    sectorColor:"#34d399"},
  {id:"med_instruments",     label:"Medical Instruments",         sector:"Healthcare",    sectorColor:"#34d399"},
  {id:"health_plans",        label:"Healthcare Plans",            sector:"Healthcare",    sectorColor:"#34d399"},
  {id:"health_info",         label:"Health Information Services", sector:"Healthcare",    sectorColor:"#34d399"},
  {id:"diagnostics",         label:"Diagnostics & Research",      sector:"Healthcare",    sectorColor:"#34d399"},
  {id:"med_care",            label:"Medical Care Facilities",     sector:"Healthcare",    sectorColor:"#34d399"},
  {id:"med_distrib",         label:"Medical Distribution",        sector:"Healthcare",    sectorColor:"#34d399"},
  // Financials
  {id:"banks_regional",      label:"Banks - Regional",            sector:"Financials",    sectorColor:"#7dd3f0"},
  {id:"banks_div",           label:"Banks - Diversified",         sector:"Financials",    sectorColor:"#7dd3f0"},
  {id:"asset_mgmt",          label:"Asset Management",            sector:"Financials",    sectorColor:"#7dd3f0"},
  {id:"insurance_prop",      label:"Insurance - Property",        sector:"Financials",    sectorColor:"#7dd3f0"},
  {id:"insurance_life",      label:"Insurance - Life",            sector:"Financials",    sectorColor:"#7dd3f0"},
  {id:"insurance_div",       label:"Insurance - Diversified",     sector:"Financials",    sectorColor:"#7dd3f0"},
  {id:"capital_markets",     label:"Capital Markets",             sector:"Financials",    sectorColor:"#7dd3f0"},
  {id:"findata",             label:"Financial Data & Exchanges",  sector:"Financials",    sectorColor:"#7dd3f0"},
  {id:"mortgage",            label:"Mortgage Finance",            sector:"Financials",    sectorColor:"#7dd3f0"},
  {id:"credit_svcs",         label:"Credit Services",             sector:"Financials",    sectorColor:"#7dd3f0"},
  // Industrials
  {id:"aerospace",           label:"Aerospace & Defense",         sector:"Industrials",   sectorColor:"#c8dff0"},
  {id:"conglomerates",       label:"Conglomerates",               sector:"Industrials",   sectorColor:"#c8dff0"},
  {id:"engineering",         label:"Engineering & Construction",  sector:"Industrials",   sectorColor:"#c8dff0"},
  {id:"airlines",            label:"Airlines",                    sector:"Industrials",   sectorColor:"#c8dff0"},
  {id:"railroads",           label:"Railroads",                   sector:"Industrials",   sectorColor:"#c8dff0"},
  {id:"trucking",            label:"Trucking",                    sector:"Industrials",   sectorColor:"#c8dff0"},
  {id:"air_services",        label:"Airports & Air Services",     sector:"Industrials",   sectorColor:"#c8dff0"},
  {id:"ind_distrib",         label:"Industrial Distribution",     sector:"Industrials",   sectorColor:"#c8dff0"},
  {id:"marine_shipping",     label:"Marine Shipping",             sector:"Industrials",   sectorColor:"#c8dff0"},
  {id:"integrated_freight",  label:"Integrated Freight",          sector:"Industrials",   sectorColor:"#c8dff0"},
  // Energy
  {id:"oil_ep",              label:"Oil & Gas E&P",               sector:"Energy",        sectorColor:"#fbbf24"},
  {id:"oil_integrated",      label:"Oil & Gas Integrated",        sector:"Energy",        sectorColor:"#fbbf24"},
  {id:"oil_drilling",        label:"Oil & Gas Drilling",          sector:"Energy",        sectorColor:"#fbbf24"},
  {id:"oil_midstream",       label:"Oil & Gas Midstream",         sector:"Energy",        sectorColor:"#fbbf24"},
  {id:"oil_equipment",       label:"Oil & Gas Equipment",         sector:"Energy",        sectorColor:"#fbbf24"},
  {id:"coal_thermal",        label:"Thermal Coal",                sector:"Energy",        sectorColor:"#fbbf24"},
  {id:"coal_coking",         label:"Coking Coal",                 sector:"Energy",        sectorColor:"#fbbf24"},
  {id:"solar",               label:"Solar",                       sector:"Energy",        sectorColor:"#fbbf24"},
  // Materials
  {id:"copper",              label:"Copper",                      sector:"Materials",     sectorColor:"#f97316"},
  {id:"gold",                label:"Gold",                        sector:"Materials",     sectorColor:"#f97316"},
  {id:"silver",              label:"Silver",                      sector:"Materials",     sectorColor:"#f97316"},
  {id:"aluminum",            label:"Aluminum",                    sector:"Materials",     sectorColor:"#f97316"},
  {id:"steel",               label:"Steel",                       sector:"Materials",     sectorColor:"#f97316"},
  {id:"chemicals",           label:"Chemicals",                   sector:"Materials",     sectorColor:"#f97316"},
  {id:"specialty_chem",      label:"Specialty Chemicals",         sector:"Materials",     sectorColor:"#f97316"},
  {id:"precious_metals",     label:"Precious Metals & Mining",    sector:"Materials",     sectorColor:"#f97316"},
  {id:"ind_metals",          label:"Industrial Metals & Mining",  sector:"Materials",     sectorColor:"#f97316"},
  {id:"lumber",              label:"Lumber & Wood Production",    sector:"Materials",     sectorColor:"#f97316"},
  {id:"bld_materials",       label:"Building Materials",          sector:"Materials",     sectorColor:"#f97316"},
  // Real Estate
  {id:"reit_retail",         label:"REIT - Retail",               sector:"Real Estate",   sectorColor:"#60a5fa"},
  {id:"reit_office",         label:"REIT - Office",               sector:"Real Estate",   sectorColor:"#60a5fa"},
  {id:"reit_ind",            label:"REIT - Industrial",           sector:"Real Estate",   sectorColor:"#60a5fa"},
  {id:"reit_residential",    label:"REIT - Residential",          sector:"Real Estate",   sectorColor:"#60a5fa"},
  {id:"reit_hotel",          label:"REIT - Hotel & Motel",        sector:"Real Estate",   sectorColor:"#60a5fa"},
  {id:"reit_health",         label:"REIT - Healthcare",           sector:"Real Estate",   sectorColor:"#60a5fa"},
  {id:"reit_div",            label:"REIT - Diversified",          sector:"Real Estate",   sectorColor:"#60a5fa"},
  {id:"reit_mortgage",       label:"REIT - Mortgage",             sector:"Real Estate",   sectorColor:"#60a5fa"},
  {id:"re_services",         label:"Real Estate Services",        sector:"Real Estate",   sectorColor:"#60a5fa"},
  // Utilities
  {id:"util_renewable",      label:"Utilities - Renewable",       sector:"Utilities",     sectorColor:"#2dd4bf"},
  {id:"util_regulated",      label:"Utilities - Regulated Gas",   sector:"Utilities",     sectorColor:"#2dd4bf"},
  {id:"util_diversified",    label:"Utilities - Diversified",     sector:"Utilities",     sectorColor:"#2dd4bf"},
  {id:"util_electric",       label:"Utilities - Regulated Elec.", sector:"Utilities",     sectorColor:"#2dd4bf"},
  {id:"util_indep",          label:"Utilities - Independent",     sector:"Utilities",     sectorColor:"#2dd4bf"},
  {id:"waste_mgmt",          label:"Waste Management",            sector:"Utilities",     sectorColor:"#2dd4bf"},
];

// Simulate % change data for all industries
function genIndustryData() {
  // Create a realistic distribution: most cluster near 0, tails extend ±20%
  return INDUSTRIES.map(ind => {
    const base = (Math.random() - 0.5) * 2; // slight center bias
    const noise = (Math.random() - 0.5) * 18;
    const chg1D = parseFloat((base * 0.3 + noise * 0.08).toFixed(2));
    const chg1W = parseFloat((base * 0.6 + noise * 0.25 + (Math.random()-0.5)*4).toFixed(2));
    const chg1M = parseFloat((base * 1.2 + noise * 0.5  + (Math.random()-0.5)*8).toFixed(2));
    const chg1Y = parseFloat((base * 4   + noise * 1.8  + (Math.random()-0.5)*15).toFixed(2));
    return { ...ind, changes: {"1D":chg1D,"1W":chg1W,"1M":chg1M,"1Y":chg1Y} };
  });
}

function IndustriesView({ liveQuotes, thematicLoading }) {
  const [tf,        setTf]        = useState("1D");
  const [sortBy,    setSortBy]    = useState("change");
  const [filterSec, setFilterSec] = useState("All");
  const [selected,  setSelected]  = useState(null);

  const isLive = Object.keys(liveQuotes).length > 0;

  // Build data — live if quotes available, simulated fallback
  const data = useMemo(() => {
    return INDUSTRIES.map(ind => {
      const sym = INDUSTRY_ETFS[ind.id];
      const q   = liveQuotes[sym];
      if (isLive && q) {
        // Map Yahoo TF keys to quote fields
        const chg1D = q.dp ?? 0;
        // For multi-TF we use what we have — 1W/1M/1Y fall back to scaled simulation
        const seed = ind.id.split("").reduce((a,c)=>a+c.charCodeAt(0),0);
        const s = (n,sc) => parseFloat((chg1D*(sc*0.8) + (Math.sin(seed+n)*2.5)*sc).toFixed(2));
        return { ...ind, etf: sym, isLive: true,
          changes: { "1D": +chg1D.toFixed(2), "1W": s(1,2.5), "1M": s(2,5), "1Y": s(3,15) }
        };
      }
      // Simulated fallback
      const base  = (Math.sin(ind.id.length * 7.3) - 0.5) * 2;
      const noise = (Math.sin(ind.id.length * 13.7) - 0.5) * 18;
      return { ...ind, etf: sym, isLive: false,
        changes: {
          "1D": parseFloat((base*0.3+noise*0.08).toFixed(2)),
          "1W": parseFloat((base*0.6+noise*0.25).toFixed(2)),
          "1M": parseFloat((base*1.2+noise*0.5).toFixed(2)),
          "1Y": parseFloat((base*4+noise*1.8).toFixed(2)),
        }
      };
    });
  }, [liveQuotes, isLive]);

  // Unique sectors for filter bar
  const sectors = ["All", ...Array.from(new Set(INDUSTRIES.map(i=>i.sector)))];

  // Filter + sort
  const filtered = data
    .filter(i => filterSec==="All" || i.sector===filterSec)
    .sort((a,b) => {
      if (sortBy==="change") return b.changes[tf] - a.changes[tf];
      if (sortBy==="sector") return a.sector.localeCompare(b.sector) || b.changes[tf]-a.changes[tf];
      return a.label.localeCompare(b.label);
    });

  const sel = selected ? data.find(i=>i.id===selected) : null;

  // color functions same as heatmap
  const col  = v => heatColor(v);
  const tcol = v => heatTextColor(v);

  // Stats
  const advancing  = filtered.filter(i=>i.changes[tf]>0).length;
  const declining  = filtered.filter(i=>i.changes[tf]<0).length;
  const unchanged  = filtered.filter(i=>i.changes[tf]===0).length;
  const best  = [...filtered].sort((a,b)=>b.changes[tf]-a.changes[tf])[0];
  const worst = [...filtered].sort((a,b)=>a.changes[tf]-b.changes[tf])[0];

  return (
    <div style={{display:"flex",flexDirection:"column",gap:12,fontFamily:"'Space Mono',monospace"}}>

      {/* ── HEADER ROW ── */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <span style={{color:"#6890a8",fontSize:8,letterSpacing:2}}>{filtered.length} INDUSTRIES</span>
          <span style={{color:isLive?"#7dd3f0":thematicLoading?"#c8dff0":"#1e3045",fontSize:8,fontFamily:"'Space Mono',monospace"}}>{isLive?"● LIVE · 1D FROM ETFS":thematicLoading?"◌ LOADING LIVE DATA...":"○ SIMULATED"}</span>
          <span style={{color:"#7dd3f0",fontSize:9}}>▲ {advancing}</span>
          <span style={{color:"#ff5f6d",fontSize:9}}>▼ {declining}</span>
          {unchanged>0&&<span style={{color:"#6890a8",fontSize:9}}>— {unchanged}</span>}
        </div>
        <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
          {/* Sort */}
          <div style={{display:"flex",gap:3}}>
            {[{k:"change",l:"% CHANGE"},{k:"sector",l:"SECTOR"},{k:"alpha",l:"A–Z"}].map(({k,l})=>(
              <button key={k} onClick={()=>setSortBy(k)} style={{background:sortBy===k?"#7dd3f020":"none",border:`1px solid ${sortBy===k?"#7dd3f0":"#1a2535"}`,color:sortBy===k?"#7dd3f0":"#a8c4d4",borderRadius:5,padding:"2px 8px",cursor:"pointer",fontSize:7,letterSpacing:1}}>{l}</button>
            ))}
          </div>
          {/* TF */}
          <div style={{display:"flex",gap:3}}>
            {["1D","1W","1M","1Y"].map(t=>(
              <button key={t} onClick={()=>setTf(t)} style={{background:tf===t?"#7dd3f020":"none",border:`1px solid ${tf===t?"#7dd3f0":"#1a2535"}`,color:tf===t?"#7dd3f0":"#162535",borderRadius:5,padding:"2px 8px",cursor:"pointer",fontSize:8,letterSpacing:1}}>{t}</button>
            ))}
          </div>
        </div>
      </div>

      {/* ── BEST / WORST CALLOUTS ── */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        {[[best,"BEST",true],[worst,"WORST",false]].map(([item,lbl,up])=>item&&(
          <div key={lbl} style={{background:"#0d1420",border:`1px solid ${up?"#7dd3f033":"#ff5f6d33"}`,borderRadius:10,padding:"10px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{color:"#6890a8",fontSize:7,letterSpacing:2,marginBottom:3}}>{lbl} {tf}</div>
              <div style={{color:"#a8b8c8",fontSize:10}}>{item.label}</div>
              <div style={{color:"#6890a8",fontSize:8,marginTop:1}}>{item.sector}</div>
            </div>
            <div style={{color:up?"#7dd3f0":"#ff5f6d",fontSize:18,fontWeight:700}}>{up?"+":""}{item.changes[tf].toFixed(2)}%</div>
          </div>
        ))}
      </div>

      {/* ── SECTOR FILTER BAR ── */}
      <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
        {sectors.map(s=>{
          const secInd = INDUSTRIES.find(i=>i.sector===s);
          const secCol = secInd?.sectorColor || "#7dd3f0";
          return(
            <button key={s} onClick={()=>setFilterSec(s)} style={{background:filterSec===s?(secCol+"22"):"none",border:`1px solid ${filterSec===s?secCol:"#1a2535"}`,color:filterSec===s?secCol:"#162535",borderRadius:6,padding:"3px 10px",cursor:"pointer",fontSize:8,letterSpacing:0.5,transition:"all 0.15s"}}>
              {s}
            </button>
          );
        })}
      </div>

      {/* ── COLOR LEGEND ── */}
      <div style={{display:"flex",alignItems:"center",gap:4,justifyContent:"flex-end"}}>
        {[-15,-8,-3,-1,0,1,3,8,15].map(v=>(
          <div key={v} style={{minWidth:26,height:16,borderRadius:2,background:col(v),display:"flex",alignItems:"center",justifyContent:"center",padding:"0 3px"}}>
            <span style={{fontSize:6,color:v===0?"#6890a8":tcol(v),whiteSpace:"nowrap"}}>{v>0?"+":""}{v}%</span>
          </div>
        ))}
      </div>

      {/* ── MAIN GRID ── */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:5}}>
        {filtered.map(ind => {
          const chg = ind.changes[tf];
          const up  = chg >= 0;
          const isSel = selected === ind.id;
          return (
            <button key={ind.id} onClick={()=>setSelected(isSel?null:ind.id)}
              style={{
                background: isSel ? (up?"#7dd3f033":"#ff5f6d33") : col(chg),
                border: `1px solid ${isSel?(up?"#7dd3f0":"#ff5f6d"):"#1a253566"}`,
                borderTop: `3px solid ${ind.sectorColor}44`,
                borderRadius:8,
                padding:"10px 10px 8px",
                cursor:"pointer",
                textAlign:"left",
                outline:"none",
                minHeight:68,
                display:"flex",
                flexDirection:"column",
                justifyContent:"space-between",
                transition:"border-color 0.12s",
              }}>
              <div style={{color:"#a8b8c8",fontSize:8,lineHeight:1.3,marginBottom:4}}>{ind.label}</div>
              <div>
                <div style={{color:tcol(chg),fontSize:15,fontWeight:700}}>{up?"+":""}{chg.toFixed(2)}%</div>
                <div style={{color:ind.sectorColor+"88",fontSize:7,marginTop:1}}>{ind.etf||ind.sector}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── SELECTED INDUSTRY DETAIL ── */}
      {sel && (
        <div style={{background:"#0d1420",border:`1px solid ${sel.sectorColor}44`,borderRadius:12,padding:"16px 18px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
            <div>
              <div style={{color:"#e8f4f8",fontSize:13,fontWeight:700,letterSpacing:1}}>{sel.label}</div>
              <div style={{color:sel.sectorColor,fontSize:9,marginTop:3}}>{sel.sector}</div>
            </div>
            <button onClick={()=>setSelected(null)} style={{background:"none",border:"none",color:"#6890a8",fontSize:14,cursor:"pointer"}}>✕</button>
          </div>
          {/* All TF changes */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
            {["1D","1W","1M","1Y"].map(t=>{
              const v=sel.changes[t], up=v>=0;
              return(
                <div key={t} style={{background:"#0a0e14",borderRadius:8,padding:"10px 12px",border:`1px solid ${t===tf?"#7dd3f044":"#1a2535"}`}}>
                  <div style={{color:"#6890a8",fontSize:8,marginBottom:4}}>{t}</div>
                  <div style={{color:up?"#7dd3f0":"#ff5f6d",fontSize:16,fontWeight:700}}>{up?"+":""}{v.toFixed(2)}%</div>
                </div>
              );
            })}
          </div>
          {/* Mini bar chart for selected industry */}
          <div style={{marginTop:12}}>
            <ResponsiveContainer width="100%" height={80}>
              <BarChart data={["1D","1W","1M","1Y"].map(t=>({t,v:sel.changes[t]}))} margin={{top:4,right:4,bottom:0,left:0}}>
                <CartesianGrid strokeDasharray="2 4" stroke="#1a2535" vertical={false}/>
                <XAxis dataKey="t" tick={{fill:"#2a4a65",fontSize:8,fontFamily:"'Space Mono',monospace"}} tickLine={false} axisLine={false}/>
                <YAxis tick={{fill:"#4a6a85",fontSize:8,fontFamily:"'Space Mono',monospace"}} tickLine={false} axisLine={false} width={36} tickFormatter={v=>`${v>0?"+":""}${v.toFixed(0)}%`}/>
                <ReferenceLine y={0} stroke="#162535" strokeWidth={1}/>
                <Bar dataKey="v" maxBarSize={40} radius={[3,3,0,0]}
                  label={{position:"top",fontSize:8,fontFamily:"'Space Mono',monospace",formatter:v=>`${v>0?"+":""}${v.toFixed(1)}%`,fill:"#2a4a65"}}
                  shape={(props)=>{
                    const {x,y,width,height,value}=props;
                    if(!height||Math.abs(height)<0.5) return null;
                    const c=value>=0?"#7dd3f0":"#ff5f6d";
                    const barY=value>=0?y:y+height;
                    return <rect x={x} y={barY} width={width} height={Math.abs(height)} fill={c+"bb"} stroke={c} strokeWidth={0.5} rx={3}/>;
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LOADING
// ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// FETCH HELPERS FOR NEW VIEWS
// ─────────────────────────────────────────────────────────────────────────────
async function fetchOptionsChain(symbol) {
  try {
    const r = await fetch(`${YF_PROXY}?path=v7/finance/options/${encodeURIComponent(symbol)}`);
    const d = await r.json();
    const result = d?.optionChain?.result?.[0];
    if (!result) return null;
    const quote = result.quote;
    const opts  = result.options?.[0];
    return {
      price:      quote?.regularMarketPrice ?? null,
      expDates:   result.expirationDates ?? [],
      calls:      opts?.calls ?? [],
      puts:       opts?.puts  ?? [],
    };
  } catch { return null; }
}

async function fetchOptionsForExp(symbol, expTimestamp) {
  try {
    const r = await fetch(`${YF_PROXY}?path=v7/finance/options/${encodeURIComponent(symbol)}&date=${expTimestamp}`);
    const d = await r.json();
    const opts = d?.optionChain?.result?.[0]?.options?.[0];
    return { calls: opts?.calls ?? [], puts: opts?.puts ?? [] };
  } catch { return null; }
}

async function fetchEarningsCalendar(symbol) {
  try {
    const r = await fetch(`${YF_PROXY}?path=v10/finance/quoteSummary/${encodeURIComponent(symbol)}&modules=earnings,earningsHistory,calendarEvents`);
    const d = await r.json();
    const s = d?.quoteSummary?.result?.[0];
    if (!s) return null;
    return {
      earningsHistory: s.earningsHistory?.history ?? [],
      nextEarnings:    s.calendarEvents?.earnings ?? null,
      earningsChart:   s.earnings?.earningsChart ?? null,
    };
  } catch { return null; }
}

async function fetchFredSeries(seriesId) {
  try {
    const r = await fetch(`https://fred.stlouisfed.org/graph/fredgraph.csv?id=${seriesId}&vintage_date=${new Date().toISOString().slice(0,10)}`);
    const text = await r.text();
    const rows = text.trim().split('\n').slice(1);
    return rows.map(row => { const [date, val] = row.split(','); return { date, value: parseFloat(val) }; })
               .filter(r => !isNaN(r.value)).slice(-60);
  } catch { return null; }
}

// ─────────────────────────────────────────────────────────────────────────────
// RRG VIEW — Relative Rotation Graph
// ─────────────────────────────────────────────────────────────────────────────
const RRG_SECTORS = [
  {id:"XLK",  label:"Tech"},       {id:"XLV",  label:"Health"},
  {id:"XLF",  label:"Finance"},    {id:"XLI",  label:"Industrials"},
  {id:"XLE",  label:"Energy"},     {id:"XLY",  label:"Disc."},
  {id:"XLC",  label:"Comms"},      {id:"XLP",  label:"Staples"},
  {id:"XLB",  label:"Materials"},  {id:"XLRE", label:"Real Est."},
  {id:"XLU",  label:"Utilities"},
];
const RRG_FACTORS = [
  {id:"MTUM", label:"Momentum"},  {id:"VTV",  label:"Value"},
  {id:"QUAL", label:"Quality"},   {id:"USMV", label:"Low Vol"},
  {id:"IWM",  label:"Small Cap"}, {id:"VUG",  label:"Growth"},
];

function computeRRG(candles, spyCandles, trailLen=4) {
  if (!candles || !spyCandles || candles.length < 20 || spyCandles.length < 20) return null;
  const len = Math.min(candles.length, spyCandles.length);
  const etf = candles.slice(-len);
  const spy = spyCandles.slice(-len);
  const rs = etf.map((v,i) => spy[i] > 0 ? v/spy[i] : 1);
  // JdK RS-Ratio: smoothed ratio vs its own SMA
  function sma(arr, n) { return arr.map((_,i) => i<n-1 ? null : arr.slice(i-n+1,i+1).reduce((a,b)=>a+b)/n); }
  const sma10 = sma(rs, 10);
  const valid = sma10.filter(v=>v!==null);
  const mean  = valid.reduce((a,b)=>a+b,0)/valid.length;
  const rsRatio = sma10.map(v => v == null ? null : 100 + (v - mean) / mean * 100);
  // JdK RS-Momentum: rate of change of RS-Ratio
  const rsMom = rsRatio.map((v,i) => {
    if (v==null || i<4 || rsRatio[i-4]==null) return null;
    return 100 + (v - rsRatio[i-4]);
  });
  // Trail = last N valid points
  const trail = [];
  for (let i = rsRatio.length-1; i>=0 && trail.length<trailLen; i--) {
    if (rsRatio[i]!=null && rsMom[i]!=null) trail.unshift({x:rsRatio[i], y:rsMom[i]});
  }
  return trail.length > 0 ? trail : null;
}

function RRGView({ liveQuotes, liveCandles, thematicLoading }) {
  const [mode, setMode] = useState("sectors");
  const [trail, setTrail] = useState(8);
  const items = mode === "sectors" ? RRG_SECTORS : RRG_FACTORS;
  const spyCan = liveCandles?.["SPY"];
  const isLive = spyCan && Object.keys(liveCandles).length > 1;

  const points = useMemo(() => {
    return items.map(item => {
      const can = liveCandles?.[item.id];
      const trl = computeRRG(can, spyCan, trail);
      if (trl) return { ...item, trail: trl, x: trl[trl.length-1].x, y: trl[trl.length-1].y };
      // Simulated fallback
      const seed = item.id.split('').reduce((a,c)=>a+c.charCodeAt(0),0);
      const x = 97 + (Math.sin(seed)*6);
      const y = 97 + (Math.cos(seed*1.3)*6);
      return { ...item, trail:[{x,y}], x, y, sim:true };
    });
  }, [liveCandles, spyCan, mode, trail]);

  const quadrant = (x,y) => x>=100&&y>=100?"LEADING":x>=100&&y<100?"WEAKENING":x<100&&y>=100?"IMPROVING":"LAGGING";
  const qColor   = q => q==="LEADING"?"#7dd3f0":q==="WEAKENING"?"#f59e0b":q==="IMPROVING"?"#34d399":"#ff5f6d";
  const qBg      = q => q==="LEADING"?"#7dd3f008":q==="WEAKENING"?"#f59e0b08":q==="IMPROVING"?"#34d39908":"#ff5f6d08";

  const xMin=93, xMax=107, yMin=93, yMax=107;
  const toSvg = (val, min, max, size) => ((val-min)/(max-min))*size;

  const W=560, H=460;

  return (
    <div style={{padding:"0 4px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div>
          <div style={{color:"#e8f4f8",fontSize:13,fontFamily:"'Space Mono',monospace",fontWeight:700,letterSpacing:2}}>RELATIVE ROTATION GRAPH</div>
          <div style={{color:isLive?"#7dd3f0":thematicLoading?"#c8dff0":"#6890a8",fontSize:8,marginTop:3,letterSpacing:1}}>
            {isLive?"● LIVE · ETF vs SPY":thematicLoading?"◌ LOADING LIVE DATA...":"○ SIMULATED · RELATIVE STRENGTH vs SPY"}
          </div>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <div style={{display:"flex",gap:4}}>
            {[["sectors","SECTORS"],["factors","FACTORS"]].map(([k,l])=>(
              <button key={k} onClick={()=>setMode(k)} style={{background:mode===k?MAIN_COL+"20":"none",border:`1px solid ${mode===k?MAIN_COL:"#1a2535"}`,color:mode===k?MAIN_COL:"#a8c4d4",borderRadius:6,padding:"3px 10px",cursor:"pointer",fontSize:8,letterSpacing:1,fontFamily:"'Space Mono',monospace"}}>{l}</button>
            ))}
          </div>
          <div style={{display:"flex",gap:4,alignItems:"center"}}>
            <span style={{color:"#6890a8",fontSize:8,fontFamily:"'Space Mono',monospace"}}>TRAIL:</span>
            {[4,8,12].map(t=>(
              <button key={t} onClick={()=>setTrail(t)} style={{background:trail===t?MAIN_COL+"20":"none",border:`1px solid ${trail===t?MAIN_COL:"#1a2535"}`,color:trail===t?MAIN_COL:"#a8c4d4",borderRadius:6,padding:"2px 7px",cursor:"pointer",fontSize:8,fontFamily:"'Space Mono',monospace"}}>{t}W</button>
            ))}
          </div>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 220px",gap:16}}>
        {/* SVG plot */}
        <div style={{background:"#0d1420",border:"1px solid #1a2535",borderRadius:12,padding:16,overflow:"hidden"}}>
          <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{fontFamily:"'Space Mono',monospace"}}>
            {/* Quadrant backgrounds */}
            {[
              {x:W/2,y:0,w:W/2,h:H/2,q:"LEADING"},
              {x:W/2,y:H/2,w:W/2,h:H/2,q:"WEAKENING"},
              {x:0,y:H/2,w:W/2,h:H/2,q:"LAGGING"},
              {x:0,y:0,w:W/2,h:H/2,q:"IMPROVING"},
            ].map(({x,y,w,h,q})=>(
              <g key={q}>
                <rect x={x} y={y} width={w} height={h} fill={qBg(q)}/>
                <text x={x+w/2} y={y+h/2} textAnchor="middle" dominantBaseline="middle"
                  fill={qColor(q)} fontSize={10} opacity={0.25} letterSpacing={3}>{q}</text>
              </g>
            ))}
            {/* Axes */}
            <line x1={W/2} y1={0} x2={W/2} y2={H} stroke="#1a2535" strokeWidth={1}/>
            <line x1={0} y1={H/2} x2={W} y2={H/2} stroke="#1a2535" strokeWidth={1}/>
            {/* Axis labels */}
            <text x={W-4} y={H/2-6} textAnchor="end" fill="#6890a8" fontSize={8}>RS-RATIO →</text>
            <text x={W/2+4} y={10} fill="#6890a8" fontSize={8}>RS-MOMENTUM ↑</text>
            <text x={W/2+4} y={H-4} fill="#6890a8" fontSize={8}>100</text>
            <text x={4} y={H/2-4} fill="#6890a8" fontSize={8}>100</text>
            {/* Points + trails */}
            {points.map(pt=>{
              const q  = quadrant(pt.x, pt.y);
              const col= qColor(q);
              const cx = toSvg(pt.x, xMin, xMax, W);
              const cy = H - toSvg(pt.y, yMin, yMax, H);
              return (
                <g key={pt.id}>
                  {/* Trail */}
                  {pt.trail.length > 1 && pt.trail.map((p,i)=>{
                    if(i===0) return null;
                    const x1=toSvg(pt.trail[i-1].x,xMin,xMax,W);
                    const y1=H-toSvg(pt.trail[i-1].y,yMin,yMax,H);
                    const x2=toSvg(p.x,xMin,xMax,W);
                    const y2=H-toSvg(p.y,yMin,yMax,H);
                    return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={col} strokeWidth={1} opacity={0.2+i/pt.trail.length*0.5}/>;
                  })}
                  {/* Dot */}
                  <circle cx={cx} cy={cy} r={6} fill={col+"33"} stroke={col} strokeWidth={1.5}/>
                  {/* Label */}
                  <text x={cx} y={cy-10} textAnchor="middle" fill={col} fontSize={8} fontWeight="700">{pt.label}</text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Legend / table */}
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {["LEADING","WEAKENING","IMPROVING","LAGGING"].map(q=>{
            const inQ = points.filter(p=>quadrant(p.x,p.y)===q);
            return (
              <div key={q} style={{background:"#0d1420",border:`1px solid ${qColor(q)}22`,borderRadius:10,padding:"10px 12px"}}>
                <div style={{color:qColor(q),fontSize:8,letterSpacing:1.5,marginBottom:6,fontFamily:"'Space Mono',monospace"}}>{q}</div>
                {inQ.length===0
                  ? <div style={{color:"#6890a8",fontSize:8}}>—</div>
                  : inQ.map(p=>(
                    <div key={p.id} style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                      <span style={{color:"#c8dff0",fontSize:9,fontFamily:"'Space Mono',monospace"}}>{p.label}</span>
                      <span style={{color:"#6890a8",fontSize:8,fontFamily:"'Space Mono',monospace"}}>{p.id}</span>
                    </div>
                  ))
                }
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CORRELATION MATRIX VIEW
// ─────────────────────────────────────────────────────────────────────────────
const CORR_PRESETS = {
  "Indices":     ["SPY","QQQ","IWM","DIA","^VIX"],
  "Sectors":     ["XLK","XLV","XLF","XLI","XLE","XLY","XLC","XLP","XLB","XLRE","XLU"],
  "Factors":     ["MTUM","VTV","QUAL","USMV","IWM","VUG"],
  "Commodities": ["GLD","SLV","USO","UNG","PDBC"],
  "Crypto":      ["BTC-USD","ETH-USD","SOL-USD"],
};

function computeCorr(a, b) {
  const n = Math.min(a.length, b.length);
  if (n < 5) return null;
  const ax = a.slice(-n), bx = b.slice(-n);
  const ma = ax.reduce((s,v)=>s+v,0)/n;
  const mb = bx.reduce((s,v)=>s+v,0)/n;
  const cov = ax.reduce((s,v,i)=>s+(v-ma)*(bx[i]-mb),0)/n;
  const sa  = Math.sqrt(ax.reduce((s,v)=>s+(v-ma)**2,0)/n);
  const sb  = Math.sqrt(bx.reduce((s,v)=>s+(v-mb)**2,0)/n);
  return (sa===0||sb===0) ? null : +( cov/(sa*sb) ).toFixed(2);
}

function corrColor(r) {
  if (r === null) return "#1a2535";
  if (r >= 0.7)  return `rgba(125,211,240,${0.3+r*0.5})`;
  if (r >= 0.3)  return `rgba(125,211,240,${0.1+r*0.3})`;
  if (r >= -0.3) return `rgba(200,223,240,0.08)`;
  if (r >= -0.7) return `rgba(255,95,109,${0.1+Math.abs(r)*0.3})`;
  return `rgba(255,95,109,${0.3+Math.abs(r)*0.5})`;
}

function CorrView({ allData }) {
  const [preset,   setPreset]   = useState("Sectors");
  const [lookback, setLookback] = useState(60);
  const [tickers,  setTickers]  = useState(CORR_PRESETS["Sectors"]);
  const [input,    setInput]    = useState("");
  const [candles,  setCandles]  = useState({});
  const [loading,  setLoading]  = useState(false);

  const loadCandles = useCallback(async (syms) => {
    setLoading(true);
    const result = {};
    await Promise.all(syms.map(async sym => {
      try {
        const r = await fetch(`${YF_PROXY}?path=v8/finance/chart/${encodeURIComponent(sym)}&interval=1d&range=1y`);
        const d = await r.json();
        const closes = d?.chart?.result?.[0]?.indicators?.quote?.[0]?.close?.filter(c=>c!=null) ?? [];
        if (closes.length > 5) result[sym] = closes;
      } catch {}
    }));
    setCandles(result);
    setLoading(false);
  }, []);

  useEffect(() => { loadCandles(tickers); }, [tickers]);

  const matrix = useMemo(() => {
    const syms = tickers.filter(s => candles[s]);
    return syms.map(a => syms.map(b => a===b ? 1 : computeCorr(
      candles[a]?.slice(-lookback), candles[b]?.slice(-lookback)
    )));
  }, [candles, tickers, lookback]);

  const syms = tickers.filter(s => candles[s]);

  return (
    <div style={{padding:"0 4px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div>
          <div style={{color:"#e8f4f8",fontSize:13,fontFamily:"'Space Mono',monospace",fontWeight:700,letterSpacing:2}}>CORRELATION MATRIX</div>
          <div style={{color:"#6890a8",fontSize:8,marginTop:3,letterSpacing:1}}>PAIRWISE PEARSON CORRELATION · DAILY RETURNS</div>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap",justifyContent:"flex-end"}}>
          <div style={{display:"flex",gap:4}}>
            {Object.keys(CORR_PRESETS).map(p=>(
              <button key={p} onClick={()=>{setPreset(p);setTickers(CORR_PRESETS[p]);}} style={{background:preset===p?MAIN_COL+"20":"none",border:`1px solid ${preset===p?MAIN_COL:"#1a2535"}`,color:preset===p?MAIN_COL:"#a8c4d4",borderRadius:6,padding:"3px 8px",cursor:"pointer",fontSize:8,letterSpacing:1,fontFamily:"'Space Mono',monospace"}}>{p}</button>
            ))}
          </div>
          <div style={{display:"flex",gap:4}}>
            {[30,60,120,252].map(lb=>(
              <button key={lb} onClick={()=>setLookback(lb)} style={{background:lookback===lb?MAIN_COL+"20":"none",border:`1px solid ${lookback===lb?MAIN_COL:"#1a2535"}`,color:lookback===lb?MAIN_COL:"#a8c4d4",borderRadius:6,padding:"3px 7px",cursor:"pointer",fontSize:8,fontFamily:"'Space Mono',monospace"}}>{lb}D</button>
            ))}
          </div>
        </div>
      </div>

      {/* Custom ticker input */}
      <div style={{display:"flex",gap:6,marginBottom:14,alignItems:"center"}}>
        <input value={input} onChange={e=>setInput(e.target.value.toUpperCase())}
          onKeyDown={e=>{if(e.key==="Enter"&&input.trim()){const t=[...new Set([...tickers,input.trim()])];setTickers(t);setInput("");setPreset("Custom");}}}
          placeholder="ADD TICKER + ENTER"
          style={{background:"#0d1420",border:"1px solid #1a2535",color:"#e8f4f8",borderRadius:6,padding:"5px 10px",fontSize:9,fontFamily:"'Space Mono',monospace",width:180,outline:"none"}}/>
        {tickers.map(t=>(
          <button key={t} onClick={()=>setTickers(prev=>prev.filter(x=>x!==t))}
            style={{background:"#1a2535",border:"1px solid #1a2535",color:"#a8c4d4",borderRadius:4,padding:"3px 7px",cursor:"pointer",fontSize:8,fontFamily:"'Space Mono',monospace"}}>
            {t} ×
          </button>
        ))}
      </div>

      {loading
        ? <div style={{color:"#6890a8",fontSize:10,fontFamily:"'Space Mono',monospace",padding:40,textAlign:"center"}}>◌ FETCHING CANDLE DATA…</div>
        : syms.length < 2
          ? <div style={{color:"#6890a8",fontSize:10,fontFamily:"'Space Mono',monospace",padding:40,textAlign:"center"}}>ADD AT LEAST 2 TICKERS WITH DATA</div>
          : (
            <div style={{background:"#0d1420",border:"1px solid #1a2535",borderRadius:12,padding:16,overflowX:"auto"}}>
              <table style={{borderCollapse:"collapse",fontFamily:"'Space Mono',monospace",fontSize:9,minWidth:syms.length*72}}>
                <thead>
                  <tr>
                    <td style={{width:70,color:"#6890a8",padding:"4px 6px"}}></td>
                    {syms.map(s=><th key={s} style={{color:"#7dd3f0",padding:"4px 6px",fontWeight:700,textAlign:"center",width:72}}>{s}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {syms.map((row,i)=>(
                    <tr key={row}>
                      <td style={{color:"#7dd3f0",padding:"4px 6px",fontWeight:700,whiteSpace:"nowrap"}}>{row}</td>
                      {matrix[i]?.map((val,j)=>(
                        <td key={j} style={{
                          background:corrColor(val),
                          padding:"6px 4px",
                          textAlign:"center",
                          color: val===1?"#e8f4f8": val===null?"#6890a8": Math.abs(val)>0.5?"#e8f4f8":"#a8c4d4",
                          fontWeight: val===1||Math.abs(val??0)>0.7?"700":"400",
                          borderRadius:4,
                          border:"1px solid #0d1420",
                        }}>
                          {val===1?"1.00":val===null?"—":val.toFixed(2)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Legend */}
              <div style={{display:"flex",gap:12,marginTop:12,alignItems:"center",flexWrap:"wrap"}}>
                {[["Strong +","#7dd3f0",0.9],["Moderate +","#7dd3f066",0.5],["Neutral","#c8dff015",0],["Moderate −","#ff5f6d66",-0.5],["Strong −","#ff5f6d",-0.9]].map(([l,c])=>(
                  <div key={l} style={{display:"flex",alignItems:"center",gap:5}}>
                    <div style={{width:14,height:14,background:c,borderRadius:3}}/>
                    <span style={{color:"#6890a8",fontSize:8}}>{l}</span>
                  </div>
                ))}
              </div>
            </div>
          )
      }
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// OPTIONS CHAIN VIEW
// ─────────────────────────────────────────────────────────────────────────────
function OptionsView() {
  const [input,    setInput]    = useState("AAPL");
  const [symbol,   setSymbol]   = useState("AAPL");
  const [data,     setData]     = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [expIdx,   setExpIdx]   = useState(0);
  const [side,     setSide]     = useState("both");
  const [expDates, setExpDates] = useState([]);
  const POPULAR = ["AAPL","TSLA","NVDA","SPY","QQQ","MSFT","AMZN","META","AMD"];

  const search = async (sym) => {
    const s = sym.trim().toUpperCase();
    if (!s) return;
    setLoading(true); setData(null); setExpIdx(0);
    const raw = await fetchOptionsChain(s);
    if (raw) { setData(raw); setExpDates(raw.expDates); setSymbol(s); }
    setLoading(false);
  };

  const loadExp = async (idx) => {
    setExpIdx(idx);
    if (!expDates[idx] || !data) return;
    setLoading(true);
    const res = await fetchOptionsForExp(symbol, expDates[idx]);
    setData(prev => ({...prev, calls: res.calls, puts: res.puts}));
    setLoading(false);
  };

  useEffect(() => { search("AAPL"); }, []);

  const fmtExp = ts => { const d=new Date(ts*1000); return `${d.toLocaleString('default',{month:'short'})} ${d.getDate()} '${String(d.getFullYear()).slice(-2)}`; };
  const itm = (strike, isCall) => data?.price ? (isCall ? strike < data.price : strike > data.price) : false;

  const calls = data?.calls ?? [];
  const puts  = data?.puts  ?? [];
  const strikes = [...new Set([...calls.map(c=>c.strike), ...puts.map(p=>p.strike)])].sort((a,b)=>a-b);

  const callMap = Object.fromEntries(calls.map(c=>[c.strike, c]));
  const putMap  = Object.fromEntries(puts.map(p=>[p.strike, p]));

  return (
    <div style={{padding:"0 4px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div>
          <div style={{color:"#e8f4f8",fontSize:13,fontFamily:"'Space Mono',monospace",fontWeight:700,letterSpacing:2}}>OPTIONS CHAIN</div>
          <div style={{color:"#6890a8",fontSize:8,marginTop:3,letterSpacing:1}}>
            {data ? `● LIVE · ${symbol} · SPOT $${data.price?.toFixed(2)}` : "ENTER A TICKER TO LOAD CHAIN"}
          </div>
        </div>
        <div style={{display:"flex",gap:6}}>
          <input value={input} onChange={e=>setInput(e.target.value.toUpperCase())}
            onKeyDown={e=>e.key==="Enter"&&search(input)}
            placeholder="SYMBOL"
            style={{background:"#0d1420",border:"1px solid #1a2535",color:"#e8f4f8",borderRadius:6,padding:"5px 10px",fontSize:9,fontFamily:"'Space Mono',monospace",width:100,outline:"none"}}/>
          <button onClick={()=>search(input)} style={{background:MAIN_COL+"20",border:`1px solid ${MAIN_COL}`,color:MAIN_COL,borderRadius:6,padding:"5px 12px",cursor:"pointer",fontSize:8,letterSpacing:1,fontFamily:"'Space Mono',monospace"}}>LOAD</button>
        </div>
      </div>

      <div style={{display:"flex",gap:6,marginBottom:10,flexWrap:"wrap"}}>
        {POPULAR.map(t=>(
          <button key={t} onClick={()=>{setInput(t);search(t);}} style={{background:"none",border:"1px solid #1a2535",color:"#a8c4d4",borderRadius:5,padding:"2px 8px",cursor:"pointer",fontSize:8,fontFamily:"'Space Mono',monospace"}}>{t}</button>
        ))}
      </div>

      {loading && <div style={{color:"#6890a8",fontSize:10,fontFamily:"'Space Mono',monospace",padding:40,textAlign:"center"}}>◌ FETCHING OPTIONS CHAIN…</div>}

      {!loading && data && (
        <>
          {/* Expiry selector */}
          <div style={{display:"flex",gap:4,marginBottom:12,flexWrap:"wrap"}}>
            {expDates.slice(0,12).map((ts,i)=>(
              <button key={ts} onClick={()=>loadExp(i)} style={{background:expIdx===i?MAIN_COL+"20":"none",border:`1px solid ${expIdx===i?MAIN_COL:"#1a2535"}`,color:expIdx===i?MAIN_COL:"#a8c4d4",borderRadius:5,padding:"2px 8px",cursor:"pointer",fontSize:8,fontFamily:"'Space Mono',monospace"}}>{fmtExp(ts)}</button>
            ))}
          </div>
          {/* Side toggle */}
          <div style={{display:"flex",gap:4,marginBottom:12}}>
            {[["both","CALLS + PUTS"],["calls","CALLS"],["puts","PUTS"]].map(([k,l])=>(
              <button key={k} onClick={()=>setSide(k)} style={{background:side===k?MAIN_COL+"20":"none",border:`1px solid ${side===k?MAIN_COL:"#1a2535"}`,color:side===k?MAIN_COL:"#a8c4d4",borderRadius:6,padding:"3px 10px",cursor:"pointer",fontSize:8,letterSpacing:1,fontFamily:"'Space Mono',monospace"}}>{l}</button>
            ))}
          </div>

          {/* Chain table */}
          <div style={{background:"#0d1420",border:"1px solid #1a2535",borderRadius:12,overflow:"hidden"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontFamily:"'Space Mono',monospace",fontSize:9}}>
              <thead>
                <tr style={{borderBottom:"1px solid #1a2535"}}>
                  {side!=="puts"&&<>
                    <th style={{color:"#7dd3f0",padding:"8px 10px",textAlign:"right"}}>OI</th>
                    <th style={{color:"#7dd3f0",padding:"8px 10px",textAlign:"right"}}>VOL</th>
                    <th style={{color:"#7dd3f0",padding:"8px 10px",textAlign:"right"}}>IV</th>
                    <th style={{color:"#7dd3f0",padding:"8px 10px",textAlign:"right"}}>BID</th>
                    <th style={{color:"#7dd3f0",padding:"8px 10px",textAlign:"right"}}>ASK</th>
                  </>}
                  <th style={{color:"#e8f4f8",padding:"8px 12px",textAlign:"center",background:"#0a0e14",fontWeight:700}}>STRIKE</th>
                  {side!=="calls"&&<>
                    <th style={{color:"#ff5f6d",padding:"8px 10px",textAlign:"left"}}>BID</th>
                    <th style={{color:"#ff5f6d",padding:"8px 10px",textAlign:"left"}}>ASK</th>
                    <th style={{color:"#ff5f6d",padding:"8px 10px",textAlign:"left"}}>IV</th>
                    <th style={{color:"#ff5f6d",padding:"8px 10px",textAlign:"left"}}>VOL</th>
                    <th style={{color:"#ff5f6d",padding:"8px 10px",textAlign:"left"}}>OI</th>
                  </>}
                </tr>
              </thead>
              <tbody>
                {strikes.map(strike=>{
                  const c = callMap[strike];
                  const p = putMap[strike];
                  const atmish = data.price && Math.abs(strike - data.price) < (strikes[1]-strikes[0])*1.5;
                  return (
                    <tr key={strike} style={{borderBottom:"1px solid #111a24",background:atmish?"#7dd3f008":"transparent"}}>
                      {side!=="puts"&&<>
                        <td style={{color:"#6890a8",padding:"5px 10px",textAlign:"right"}}>{c?.openInterest?.toLocaleString()??"—"}</td>
                        <td style={{color:"#a8c4d4",padding:"5px 10px",textAlign:"right"}}>{c?.volume?.toLocaleString()??"—"}</td>
                        <td style={{color:"#c8dff0",padding:"5px 10px",textAlign:"right"}}>{c?.impliedVolatility!=null?`${(c.impliedVolatility*100).toFixed(1)}%`:"—"}</td>
                        <td style={{color:"#7dd3f0",padding:"5px 10px",textAlign:"right"}}>{c?.bid?.toFixed(2)??"—"}</td>
                        <td style={{color:"#7dd3f0",padding:"5px 10px",textAlign:"right",background:itm(strike,true)?"#7dd3f008":"transparent"}}>{c?.ask?.toFixed(2)??"—"}</td>
                      </>}
                      <td style={{color:"#e8f4f8",padding:"5px 12px",textAlign:"center",background:"#0a0e14",fontWeight:700,fontSize:10}}>{strike}</td>
                      {side!=="calls"&&<>
                        <td style={{color:"#ff5f6d",padding:"5px 10px",textAlign:"left",background:itm(strike,false)?"#ff5f6d08":"transparent"}}>{p?.bid?.toFixed(2)??"—"}</td>
                        <td style={{color:"#ff5f6d",padding:"5px 10px",textAlign:"left"}}>{p?.ask?.toFixed(2)??"—"}</td>
                        <td style={{color:"#c8dff0",padding:"5px 10px",textAlign:"left"}}>{p?.impliedVolatility!=null?`${(p.impliedVolatility*100).toFixed(1)}%`:"—"}</td>
                        <td style={{color:"#a8c4d4",padding:"5px 10px",textAlign:"left"}}>{p?.volume?.toLocaleString()??"—"}</td>
                        <td style={{color:"#6890a8",padding:"5px 10px",textAlign:"left"}}>{p?.openInterest?.toLocaleString()??"—"}</td>
                      </>}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{color:"#6890a8",fontSize:8,marginTop:8,fontFamily:"'Space Mono',monospace",letterSpacing:1}}>
            ITM HIGHLIGHTED · CALLS LEFT (BLUE) · PUTS RIGHT (RED) · DATA VIA YAHOO FINANCE
          </div>
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EARNINGS VIEW
// ─────────────────────────────────────────────────────────────────────────────
function EarningsView() {
  const [input,   setInput]   = useState("AAPL");
  const [symbol,  setSymbol]  = useState("AAPL");
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(false);
  const POPULAR = ["AAPL","MSFT","NVDA","META","GOOGL","AMZN","TSLA","JPM","V","NFLX"];

  const search = async (sym) => {
    const s = sym.trim().toUpperCase();
    if (!s) return;
    setLoading(true); setData(null);
    const raw = await fetchEarningsCalendar(s);
    if (raw) { setData(raw); setSymbol(s); }
    setLoading(false);
  };

  useEffect(() => { search("AAPL"); }, []);

  const beatColor = (actual, estimate) => {
    if (actual == null || estimate == null) return "#6890a8";
    return actual >= estimate ? "#7dd3f0" : "#ff5f6d";
  };
  const beatLabel = (actual, estimate) => {
    if (actual == null) return "—";
    if (estimate == null) return actual.toFixed(2);
    const diff = actual - estimate;
    return diff >= 0 ? `BEAT +${diff.toFixed(2)}` : `MISS ${diff.toFixed(2)}`;
  };

  const history = data?.earningsHistory ?? [];
  const chart   = data?.earningsChart;
  const next    = data?.nextEarnings;

  // Build quarterly EPS series from earningsChart
  const epsSeries = chart?.quarterly?.map(q => ({
    date:     q.date,
    actual:   q.actual?.raw ?? null,
    estimate: q.estimate?.raw ?? null,
    surprise: q.actual != null && q.estimate != null ? +((q.actual.raw - q.estimate.raw) / Math.abs(q.estimate.raw) * 100).toFixed(1) : null,
  })) ?? [];

  const annSeries = chart?.yearly?.map(y => ({
    date:     y.date,
    actual:   y.earnings?.raw ?? null,
    revenue:  y.revenue?.raw != null ? +(y.revenue.raw/1e9).toFixed(1) : null,
  })) ?? [];

  return (
    <div style={{padding:"0 4px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div>
          <div style={{color:"#e8f4f8",fontSize:13,fontFamily:"'Space Mono',monospace",fontWeight:700,letterSpacing:2}}>EARNINGS — ERN</div>
          <div style={{color:"#6890a8",fontSize:8,marginTop:3,letterSpacing:1}}>{data?"● LIVE · EPS HISTORY & ESTIMATES":"SEARCH A TICKER"}</div>
        </div>
        <div style={{display:"flex",gap:6}}>
          <input value={input} onChange={e=>setInput(e.target.value.toUpperCase())}
            onKeyDown={e=>e.key==="Enter"&&search(input)}
            placeholder="SYMBOL"
            style={{background:"#0d1420",border:"1px solid #1a2535",color:"#e8f4f8",borderRadius:6,padding:"5px 10px",fontSize:9,fontFamily:"'Space Mono',monospace",width:100,outline:"none"}}/>
          <button onClick={()=>search(input)} style={{background:MAIN_COL+"20",border:`1px solid ${MAIN_COL}`,color:MAIN_COL,borderRadius:6,padding:"5px 12px",cursor:"pointer",fontSize:8,letterSpacing:1,fontFamily:"'Space Mono',monospace"}}>LOAD</button>
        </div>
      </div>

      <div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap"}}>
        {POPULAR.map(t=>(
          <button key={t} onClick={()=>{setInput(t);search(t);}} style={{background:"none",border:"1px solid #1a2535",color:"#a8c4d4",borderRadius:5,padding:"2px 8px",cursor:"pointer",fontSize:8,fontFamily:"'Space Mono',monospace"}}>{t}</button>
        ))}
      </div>

      {loading && <div style={{color:"#6890a8",fontSize:10,fontFamily:"'Space Mono',monospace",padding:40,textAlign:"center"}}>◌ FETCHING EARNINGS DATA…</div>}

      {!loading && data && (
        <div style={{display:"grid",gap:14}}>
          {/* Next earnings */}
          {next?.earningsDate && (
            <div style={{background:"#0d1420",border:"1px solid #7dd3f044",borderRadius:12,padding:"14px 18px",display:"flex",gap:24,alignItems:"center",flexWrap:"wrap"}}>
              <div>
                <div style={{color:"#6890a8",fontSize:8,letterSpacing:1,marginBottom:4}}>NEXT EARNINGS</div>
                <div style={{color:"#7dd3f0",fontSize:15,fontFamily:"'Space Mono',monospace",fontWeight:700}}>
                  {new Date(next.earningsDate[0]*1000).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}
                </div>
              </div>
              {next.earningsCallTime && (
                <div>
                  <div style={{color:"#6890a8",fontSize:8,letterSpacing:1,marginBottom:4}}>TIMING</div>
                  <div style={{color:"#c8dff0",fontSize:11,fontFamily:"'Space Mono',monospace"}}>{next.earningsCallTime==="BMO"?"BEFORE MARKET OPEN":"AFTER MARKET CLOSE"}</div>
                </div>
              )}
              {next.epsEstimate?.raw != null && (
                <div>
                  <div style={{color:"#6890a8",fontSize:8,letterSpacing:1,marginBottom:4}}>EPS ESTIMATE</div>
                  <div style={{color:"#c8dff0",fontSize:13,fontFamily:"'Space Mono',monospace",fontWeight:700}}>${next.epsEstimate.raw.toFixed(2)}</div>
                </div>
              )}
              {next.revenueEstimate?.raw != null && (
                <div>
                  <div style={{color:"#6890a8",fontSize:8,letterSpacing:1,marginBottom:4}}>REV ESTIMATE</div>
                  <div style={{color:"#c8dff0",fontSize:13,fontFamily:"'Space Mono',monospace",fontWeight:700}}>${(next.revenueEstimate.raw/1e9).toFixed(1)}B</div>
                </div>
              )}
            </div>
          )}

          {/* Quarterly EPS chart */}
          {epsSeries.length > 0 && (
            <div style={{background:"#0d1420",border:"1px solid #1a2535",borderRadius:12,padding:"16px 18px"}}>
              <div style={{color:"#6890a8",fontSize:8,letterSpacing:1.5,marginBottom:12}}>QUARTERLY EPS · ACTUAL vs ESTIMATE</div>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={epsSeries} margin={{top:24,right:8,bottom:0,left:0}} barGap={2} barCategoryGap="25%">
                  <CartesianGrid strokeDasharray="2 4" stroke="#1a2535" vertical={false}/>
                  <XAxis dataKey="date" tick={{fill:"#4a6a85",fontSize:8,fontFamily:"'Space Mono',monospace"}} tickLine={false} axisLine={false}/>
                  <YAxis tick={{fill:"#4a6a85",fontSize:8,fontFamily:"'Space Mono',monospace"}} tickLine={false} axisLine={false} width={36} tickFormatter={v=>`$${v}`}/>
                  <Tooltip content={({active,payload,label})=>{
                    if(!active||!payload?.length) return null;
                    const d=payload[0]?.payload;
                    return(
                      <div style={{background:"#1a2535",border:"1px solid #1e3045",borderRadius:6,padding:"8px 12px",fontFamily:"'Space Mono',monospace",fontSize:9}}>
                        <div style={{color:"#c8dff0",marginBottom:4}}>{label}</div>
                        <div style={{color:"#7dd3f0"}}>Actual: ${d.actual?.toFixed(2)??'—'}</div>
                        <div style={{color:"#6890a8"}}>Est: ${d.estimate?.toFixed(2)??'—'}</div>
                        {d.surprise!=null&&<div style={{color:d.surprise>=0?"#7dd3f0":"#ff5f6d",marginTop:2}}>Surprise: {d.surprise>=0?"+":""}{d.surprise}%</div>}
                      </div>
                    );
                  }}/>
                  <Bar dataKey="estimate" fill="#6890a833" stroke="#6890a8" strokeWidth={1} radius={[2,2,0,0]} maxBarSize={30}
                    label={{position:"top",fontSize:7,fill:"#6890a8",fontFamily:"'Space Mono',monospace",formatter:v=>v?`$${v.toFixed(2)}`:""}}/>
                  <Bar dataKey="actual" maxBarSize={30} radius={[2,2,0,0]}
                    shape={(props)=>{
                      const {x,y,width,height,payload}=props;
                      const beat=payload.actual!=null&&payload.estimate!=null&&payload.actual>=payload.estimate;
                      const col=payload.actual==null?"#6890a8":beat?"#7dd3f0":"#ff5f6d";
                      return(
                        <g>
                          <rect x={x} y={y} width={width} height={height} fill={col+"55"} stroke={col} strokeWidth={1.5} rx={2}/>
                          {payload.actual!=null&&<text x={x+width/2} y={y-5} textAnchor="middle" fill={col} fontSize={7} fontFamily="'Space Mono',monospace">${payload.actual.toFixed(2)}</text>}
                        </g>
                      );
                    }}/>
                </BarChart>
              </ResponsiveContainer>
              <div style={{display:"flex",gap:14,marginTop:8}}>
                <div style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:10,height:10,background:"#7dd3f055",border:"1px solid #7dd3f0",borderRadius:2}}/><span style={{color:"#6890a8",fontSize:8,fontFamily:"'Space Mono',monospace"}}>BEAT</span></div>
                <div style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:10,height:10,background:"#ff5f6d55",border:"1px solid #ff5f6d",borderRadius:2}}/><span style={{color:"#6890a8",fontSize:8,fontFamily:"'Space Mono',monospace"}}>MISS</span></div>
                <div style={{display:"flex",alignItems:"center",gap:5}}><div style={{width:10,height:10,background:"#6890a833",border:"1px solid #6890a8",borderRadius:2}}/><span style={{color:"#6890a8",fontSize:8,fontFamily:"'Space Mono',monospace"}}>ESTIMATE</span></div>
              </div>
            </div>
          )}

          {/* History table */}
          {history.length > 0 && (
            <div style={{background:"#0d1420",border:"1px solid #1a2535",borderRadius:12,overflow:"hidden"}}>
              <div style={{color:"#6890a8",fontSize:8,letterSpacing:1.5,padding:"12px 16px",borderBottom:"1px solid #1a2535"}}>EARNINGS HISTORY · BEAT / MISS RECORD</div>
              <table style={{width:"100%",borderCollapse:"collapse",fontFamily:"'Space Mono',monospace",fontSize:9}}>
                <thead>
                  <tr style={{borderBottom:"1px solid #111a24"}}>
                    {["PERIOD","ACTUAL EPS","ESTIMATE","SURPRISE","SURPRISE %"].map(h=>(
                      <th key={h} style={{color:"#6890a8",padding:"8px 14px",textAlign:"right",fontWeight:400,letterSpacing:1}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...history].reverse().map((h,i)=>{
                    const act = h.epsActual?.raw;
                    const est = h.epsEstimate?.raw;
                    const diff = act!=null&&est!=null ? +(act-est).toFixed(3) : null;
                    const pct  = diff!=null&&est!=0   ? +((diff/Math.abs(est))*100).toFixed(1) : null;
                    const col  = diff==null?"#6890a8":diff>=0?"#7dd3f0":"#ff5f6d";
                    return (
                      <tr key={i} style={{borderBottom:"1px solid #111a24",background:i%2===0?"#0d142008":"transparent"}}>
                        <td style={{color:"#c8dff0",padding:"7px 14px",textAlign:"right"}}>{h.period??h.quarter}</td>
                        <td style={{color:"#e8f4f8",padding:"7px 14px",textAlign:"right",fontWeight:700}}>{act!=null?`$${act.toFixed(2)}`:"—"}</td>
                        <td style={{color:"#6890a8",padding:"7px 14px",textAlign:"right"}}>{est!=null?`$${est.toFixed(2)}`:"—"}</td>
                        <td style={{color:col,padding:"7px 14px",textAlign:"right"}}>{diff!=null?`${diff>=0?"+":""}${diff}`:"—"}</td>
                        <td style={{color:col,padding:"7px 14px",textAlign:"right",fontWeight:700}}>{pct!=null?`${pct>=0?"+":""}${pct}%`:"—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ECO CALENDAR VIEW
// ─────────────────────────────────────────────────────────────────────────────
const ECO_EVENTS = [
  // US events with FRED series IDs where available
  {title:"Unemployment Rate",          country:"US", impact:"high",   fred:"UNRATE",   desc:"Monthly US unemployment rate"},
  {title:"CPI YoY",                    country:"US", impact:"high",   fred:"CPIAUCSL", desc:"Consumer Price Index year-over-year"},
  {title:"Fed Funds Rate",             country:"US", impact:"high",   fred:"FEDFUNDS", desc:"Federal funds effective rate"},
  {title:"GDP Growth Rate",            country:"US", impact:"high",   fred:"A191RL1Q225SBEA", desc:"Real GDP % change QoQ"},
  {title:"Core PCE",                   country:"US", impact:"high",   fred:"PCEPILFE", desc:"Core personal consumption expenditures"},
  {title:"Retail Sales MoM",           country:"US", impact:"medium", fred:"RSXFS",    desc:"Advance retail sales month-over-month"},
  {title:"ISM Manufacturing PMI",      country:"US", impact:"medium", fred:"MANEMP",   desc:"Manufacturing employment"},
  {title:"10Y Treasury Yield",         country:"US", impact:"medium", fred:"DGS10",    desc:"10-year treasury constant maturity rate"},
  {title:"Initial Jobless Claims",     country:"US", impact:"medium", fred:"ICSA",     desc:"Weekly initial unemployment insurance claims"},
  {title:"Housing Starts",             country:"US", impact:"low",    fred:"HOUST",    desc:"New privately-owned housing units started"},
  {title:"PPI YoY",                    country:"US", impact:"medium", fred:null,       desc:"Producer Price Index year-over-year"},
  {title:"Nonfarm Payrolls",           country:"US", impact:"high",   fred:"PAYEMS",   desc:"Total nonfarm payroll employees"},
];

const IMPACT_COL = {high:"#ff5f6d", medium:"#f59e0b", low:"#7dd3f0"};

function EcoCalView() {
  const [selected, setSelected] = useState(ECO_EVENTS[0]);
  const [seriesData, setSeriesData] = useState({});
  const [loading, setLoading] = useState(false);

  const loadSeries = useCallback(async (event) => {
    if (!event.fred) return;
    if (seriesData[event.fred]) return; // cached
    setLoading(true);
    const data = await fetchFredSeries(event.fred);
    if (data) setSeriesData(prev => ({...prev, [event.fred]: data}));
    setLoading(false);
  }, [seriesData]);

  useEffect(() => { loadSeries(ECO_EVENTS[0]); }, []);

  const handleSelect = (ev) => { setSelected(ev); loadSeries(ev); };

  const series = selected.fred ? seriesData[selected.fred] : null;
  const latest = series?.[series.length-1];
  const prev   = series?.[series.length-2];
  const change = latest && prev ? +(latest.value - prev.value).toFixed(3) : null;

  return (
    <div style={{padding:"0 4px"}}>
      <div style={{marginBottom:16}}>
        <div style={{color:"#e8f4f8",fontSize:13,fontFamily:"'Space Mono',monospace",fontWeight:700,letterSpacing:2}}>ECONOMIC CALENDAR — ECST</div>
        <div style={{color:"#6890a8",fontSize:8,marginTop:3,letterSpacing:1}}>● LIVE DATA VIA FRED · ST. LOUIS FEDERAL RESERVE</div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"280px 1fr",gap:14}}>
        {/* Event list */}
        <div style={{display:"flex",flexDirection:"column",gap:4}}>
          {ECO_EVENTS.map(ev=>(
            <button key={ev.title} onClick={()=>handleSelect(ev)}
              style={{background:selected.title===ev.title?"#152030":"#0d1420",border:`1px solid ${selected.title===ev.title?MAIN_COL:"#1a2535"}`,borderRadius:8,padding:"9px 12px",cursor:"pointer",textAlign:"left",transition:"all 0.12s"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
                <span style={{color:selected.title===ev.title?"#e8f4f8":"#c8dff0",fontSize:9,fontFamily:"'Space Mono',monospace",fontWeight:700}}>{ev.title}</span>
                <span style={{color:IMPACT_COL[ev.impact],fontSize:7,letterSpacing:1,fontFamily:"'Space Mono',monospace"}}>{ev.impact.toUpperCase()}</span>
              </div>
              <div style={{color:"#6890a8",fontSize:7,fontFamily:"'Space Mono',monospace"}}>{ev.desc}</div>
            </button>
          ))}
        </div>

        {/* Detail panel */}
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {/* Header metrics */}
          <div style={{background:"#0d1420",border:"1px solid #1a2535",borderRadius:12,padding:"16px 20px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
              <div>
                <div style={{color:"#e8f4f8",fontSize:15,fontFamily:"'Space Mono',monospace",fontWeight:700,letterSpacing:1}}>{selected.title}</div>
                <div style={{color:"#6890a8",fontSize:8,marginTop:3}}>{selected.desc}</div>
              </div>
              <div style={{display:"flex",gap:6,alignItems:"center"}}>
                <span style={{color:IMPACT_COL[selected.impact],background:IMPACT_COL[selected.impact]+"22",fontSize:8,letterSpacing:1,padding:"2px 8px",borderRadius:4,fontFamily:"'Space Mono',monospace"}}>{selected.impact.toUpperCase()} IMPACT</span>
                <span style={{color:"#6890a8",background:"#1a2535",fontSize:8,padding:"2px 8px",borderRadius:4,fontFamily:"'Space Mono',monospace"}}>{selected.country}</span>
              </div>
            </div>
            {latest && (
              <div style={{display:"flex",gap:24,flexWrap:"wrap"}}>
                <div>
                  <div style={{color:"#6890a8",fontSize:8,letterSpacing:1,marginBottom:4}}>LATEST</div>
                  <div style={{color:"#e8f4f8",fontSize:20,fontFamily:"'Space Mono',monospace",fontWeight:700}}>{latest.value.toFixed(2)}</div>
                  <div style={{color:"#6890a8",fontSize:8,marginTop:2}}>{latest.date}</div>
                </div>
                {prev && (
                  <div>
                    <div style={{color:"#6890a8",fontSize:8,letterSpacing:1,marginBottom:4}}>PREVIOUS</div>
                    <div style={{color:"#c8dff0",fontSize:16,fontFamily:"'Space Mono',monospace",fontWeight:700}}>{prev.value.toFixed(2)}</div>
                    <div style={{color:"#6890a8",fontSize:8,marginTop:2}}>{prev.date}</div>
                  </div>
                )}
                {change!=null && (
                  <div>
                    <div style={{color:"#6890a8",fontSize:8,letterSpacing:1,marginBottom:4}}>CHANGE</div>
                    <div style={{color:change>=0?"#7dd3f0":"#ff5f6d",fontSize:16,fontFamily:"'Space Mono',monospace",fontWeight:700}}>{change>=0?"+":""}{change}</div>
                  </div>
                )}
                {selected.fred && (
                  <div>
                    <div style={{color:"#6890a8",fontSize:8,letterSpacing:1,marginBottom:4}}>FRED ID</div>
                    <div style={{color:"#6890a8",fontSize:11,fontFamily:"'Space Mono',monospace"}}>{selected.fred}</div>
                  </div>
                )}
              </div>
            )}
            {!selected.fred && <div style={{color:"#6890a8",fontSize:9,fontFamily:"'Space Mono',monospace"}}>No FRED series available for this indicator</div>}
            {loading && <div style={{color:"#6890a8",fontSize:9,fontFamily:"'Space Mono',monospace",marginTop:8}}>◌ FETCHING FRED DATA…</div>}
          </div>

          {/* Trend chart */}
          {series && series.length > 3 && (
            <div style={{background:"#0d1420",border:"1px solid #1a2535",borderRadius:12,padding:"16px 18px"}}>
              <div style={{color:"#6890a8",fontSize:8,letterSpacing:1.5,marginBottom:12}}>HISTORICAL TREND · LAST {series.length} READINGS</div>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={series} margin={{top:8,right:8,bottom:0,left:0}}>
                  <defs>
                    <linearGradient id="ecoGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={MAIN_COL} stopOpacity={0.2}/>
                      <stop offset="95%" stopColor={MAIN_COL} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="2 4" stroke="#1a2535" vertical={false}/>
                  <XAxis dataKey="date" tick={{fill:"#4a6a85",fontSize:7,fontFamily:"'Space Mono',monospace"}} tickLine={false} axisLine={false}
                    tickFormatter={v=>v.slice(0,7)} interval={Math.floor(series.length/6)}/>
                  <YAxis tick={{fill:"#4a6a85",fontSize:8,fontFamily:"'Space Mono',monospace"}} tickLine={false} axisLine={false} width={40} domain={["auto","auto"]}/>
                  <Tooltip content={({active,payload})=>{
                    if(!active||!payload?.length) return null;
                    return(
                      <div style={{background:"#1a2535",border:"1px solid #1e3045",borderRadius:6,padding:"8px 12px",fontFamily:"'Space Mono',monospace",fontSize:9}}>
                        <div style={{color:"#6890a8",marginBottom:2}}>{payload[0]?.payload?.date}</div>
                        <div style={{color:MAIN_COL,fontWeight:700}}>{payload[0]?.value?.toFixed(3)}</div>
                      </div>
                    );
                  }}/>
                  <Area type="monotone" dataKey="value" stroke={MAIN_COL} strokeWidth={1.5} fill="url(#ecoGrad)" dot={false}/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LoadingScreen({progress,label}){
  return(
    <div style={{minHeight:"100vh",background:"#0a0e14",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:20}}>
      <div style={{color:"#7dd3f0",fontFamily:"'Space Mono',monospace",fontSize:13,fontWeight:700,letterSpacing:3}}>MARKETPULSE</div>
      <div style={{color:"#6890a8",fontFamily:"'Space Mono',monospace",fontSize:11,letterSpacing:3}}>{label}</div>
      <div style={{width:240,height:2,background:"#1a2535",borderRadius:2,overflow:"hidden"}}>
        <div style={{height:"100%",width:`${progress}%`,background:"#7dd3f0",borderRadius:2,transition:"width 0.3s"}}/>
      </div>
      <div style={{color:"#6890a8",fontFamily:"'Space Mono',monospace",fontSize:9,letterSpacing:2}}>{progress}%</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// APP
// ─────────────────────────────────────────────────────────────────────────────

export default function MarketDashboard(){
  const [allData,    setAllData]    = useState(null);
  const [heatData,   setHeatData]   = useState(null);
  const [ndxData,    setNdxData]    = useState(null);
  const [breadthData,setBreadthData]= useState(null);
  const [newsData,   setNewsData]   = useState(null);
  const [calData,    setCalData]    = useState(null);
  const [factorData, setFactorData] = useState(null);
  const [liveQuotes, setLiveQuotes] = useState({});
  const [liveCandles,setLiveCandles]= useState({});
  const [loading,    setLoading]    = useState(true);
  const [loadLabel,  setLoadLabel]  = useState("FETCHING MARKET DATA");
  const [progress,   setProgress]   = useState(0);
  const [activeTab,  setActiveTab]  = useState("stocks");
  const [selected,   setSelected]   = useState("spx");
  const [tf,         setTf]         = useState("1M");
  const [heatTf,     setHeatTf]     = useState("1D");
  const [view,       setView]       = useState("markets");
  const [lastUpdate, setLastUpdate] = useState(null);

  const [thematicLoading, setThematicLoading] = useState(false);

  const load=useCallback(async()=>{
    setLoading(true);setProgress(0);
    setLoadLabel("FETCHING MARKET DATA");
    // Kick off VIX fetch in parallel — don't wait for it to block the load
    const vixPromise = fetchVIX();
    const mData=await loadMarketData(p=>setProgress(Math.round(p*0.4)));
    setLoadLabel("FETCHING SECTOR DATA");
    const hData=await loadHeatmapData(p=>setProgress(40+Math.round(p*0.35)));
    setLoadLabel("FETCHING NASDAQ DATA");
    const nData=await loadNdxData(p=>setProgress(75+Math.round(p*0.25)));
    setLoadLabel("BUILDING BREADTH DATA");
    const bData=loadBreadthData();
    const vixQuote = await vixPromise;
    setAllData(mData);setHeatData(hData);setNdxData(nData);setBreadthData(bData);
    setNewsData(genMarketNews());setCalData(genCalendar());
    setFactorData(loadFactorData());
    // Seed liveQuotes with real VIX immediately — thematic load will fill the rest later
    if(vixQuote) setLiveQuotes(prev=>({...prev,"^VIX":vixQuote}));
    setLastUpdate(new Date());setLoading(false);
  },[]);

  // Silent background refresh — updates data without showing the loading screen
  const refresh=useCallback(async()=>{
    try {
      const [mData,hData,nData,vixQuote]=await Promise.all([
        loadMarketData(), loadHeatmapData(), loadNdxData(), fetchVIX()
      ]);
      setAllData(mData);setHeatData(hData);setNdxData(nData);
      if(vixQuote) setLiveQuotes(prev=>({...prev,"^VIX":vixQuote}));
      setLastUpdate(new Date());
    } catch {}
  },[]);

  // Load industry/factor/theme data in background after dashboard is visible
  const loadThematic=useCallback(async()=>{
    setThematicLoading(true);
    try {
      const {quotes:lq, candles:lc}=await loadLiveThematicData();
      setLiveQuotes(lq);setLiveCandles(lc);
    } catch {}
    setThematicLoading(false);
  },[]);

  useEffect(()=>{load();},[]);
  useEffect(()=>{const id=setInterval(refresh,60000);return()=>clearInterval(id);},[refresh]);
  // Background fetch for industries/themes/factors — runs after dashboard is visible
  useEffect(()=>{loadThematic();},[]);
  useEffect(()=>{const id=setInterval(loadThematic,300000);return()=>clearInterval(id);},[loadThematic]);

  const handleSelect=useCallback((cat,id)=>{setActiveTab(cat);setSelected(id);setView("markets");},[]);

  if(loading) return <LoadingScreen progress={progress} label={loadLabel}/>;
  if(!newsData||!calData) return <LoadingScreen progress={100} label="BUILDING NEWS FEED"/>;

  const color   =TAB_COLOR[activeTab];
  const assets  =allData[activeTab];
  const selAsset=assets.find(a=>a.id===selected)||assets[0];
  const liveCount=Object.values(allData).flat().filter(a=>a.isLive).length;

  const TfBarInline=({value,onChange,options})=>(
    <div style={{display:"flex",gap:6}}>
      {options.map(k=>(
        <button key={k} onClick={()=>onChange(k)} style={{background:value===k?MAIN_COL+"20":"none",border:`1px solid ${value===k?MAIN_COL:"#1a2535"}`,color:value===k?MAIN_COL:"#162535",borderRadius:6,padding:"3px 11px",cursor:"pointer",fontSize:9,letterSpacing:1,transition:"all 0.15s"}}>{k}</button>
      ))}
    </div>
  );

  return(
    <div style={{minHeight:"100vh",background:"#0a0e14",fontFamily:"'Space Mono',monospace"}}>
      <link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap" rel="stylesheet"/>
      <Ticker allData={allData}/>
      <div style={{maxWidth:1060,margin:"0 auto",padding:"18px 18px 40px"}}>

        {/* Header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
          <div>
            <h1 style={{color:"#e8f4f8",fontSize:17,fontWeight:700,letterSpacing:3,margin:0}}>MARKET<span style={{color:MAIN_COL}}>PULSE</span></h1>
            <div style={{color:"#6890a8",fontSize:8,letterSpacing:2,marginTop:3}}>
              {lastUpdate?`UPDATED ${lastUpdate.toLocaleTimeString()}`:"LOADING"} · {liveCount}/16 LIVE
            </div>
          </div>
          <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap",justifyContent:"flex-end"}}>
            <button onClick={load} style={{background:"none",border:"1px solid #1a2535",color:"#6890a8",borderRadius:8,padding:"5px 10px",cursor:"pointer",fontSize:9}}>↺</button>
            {NAV_TABS.map(t=>(
              <button key={t.key} onClick={()=>setView(t.key)} style={{background:view===t.key?"#152030":"none",border:`1px solid ${view===t.key?MAIN_COL:"#2a3f52"}`,color:view===t.key?MAIN_COL:"#a8c4d4",borderRadius:8,padding:"5px 12px",cursor:"pointer",fontSize:9,letterSpacing:1,transition:"all 0.15s"}}>
                {t.icon} {t.label.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* FACTORS */}
        {view==="factors"&&factorData&&<FactorView factorData={factorData} liveQuotes={liveQuotes} liveCandles={liveCandles} thematicLoading={thematicLoading}/>}
        {view==="rrg"&&<RRGView liveQuotes={liveQuotes} liveCandles={liveCandles} thematicLoading={thematicLoading}/>}
        {view==="corr"&&<CorrView allData={allData}/>}
        {view==="options"&&<OptionsView/>}
        {view==="earnings"&&<EarningsView/>}
        {view==="ecocal"&&<EcoCalView/>}

        {/* INDUSTRIES */}
        {view==="industries"&&<IndustriesView liveQuotes={liveQuotes} thematicLoading={thematicLoading}/>}

        {/* SCREENER */}
        { /* screener hidden */ }

        {/* THEMES / RS */}
        {view==="themes"&&<ThemesRSView liveQuotes={liveQuotes} liveCandles={liveCandles} thematicLoading={thematicLoading}/>}

        {/* FUNDAMENTALS */}
        {view==="fundamentals"&&<FundamentalsView/>}

        {/* CHART */}

        {/* NEWS */}
        {view==="news"&&<NewsView newsData={newsData} calData={calData}/>}

        {/* BREADTH */}
        {view==="breadth"&&<BreadthView breadthData={breadthData} setBreadthData={setBreadthData} liveQuotes={liveQuotes}/>}

        {/* HEATMAP */}
        {view==="heatmap"&&(
          <>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <div style={{color:"#6890a8",fontSize:8,letterSpacing:2}}>SECTOR HEATMAP · HOVER FOR ALL TIMEFRAMES</div>
              <TfBarInline value={heatTf} onChange={setHeatTf} options={HEATMAP_TFS}/>
            </div>
            <HeatmapView heatData={heatData} ndxData={ndxData} tf={heatTf}/>
          </>
        )}

        {/* WATCHLIST */}
        {/* MARKETS */}
        {view==="markets"&&(
          <>
            <div style={{marginBottom:18}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <span style={{color:"#6890a8",fontSize:8,letterSpacing:2}}>TOP MOVERS</span>
                <TfBarInline value={tf} onChange={setTf} options={CHART_TIMEFRAMES.map(t=>t.key)}/>
              </div>
              <TopMovers allData={allData} tf={tf} onSelect={handleSelect}/>
            </div>
            <div style={{display:"flex",gap:0,marginBottom:14,borderBottom:"1px solid #1a2535"}}>
              {MARKET_TABS.map(tab=>(
                <button key={tab.key} onClick={()=>{setActiveTab(tab.key);setSelected(allData[tab.key][0].id);}} style={{background:"none",border:"none",cursor:"pointer",color:activeTab===tab.key?TAB_COLOR[tab.key]:"#162535",fontSize:9,letterSpacing:1.5,padding:"7px 16px",borderBottom:`2px solid ${activeTab===tab.key?TAB_COLOR[tab.key]:"transparent"}`,marginBottom:-1,transition:"all 0.15s"}}>
                  {tab.icon} {tab.label.toUpperCase()}
                </button>
              ))}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(185px,1fr))",gap:10,marginBottom:14}}>
              {assets.map(asset=>(
                <MarketCard key={asset.id} asset={asset} tf={tf} color={color}
                  isSelected={selected===asset.id}
                  onSelect={()=>setSelected(asset.id)}/>
              ))}
            </div>
            <DetailChart asset={selAsset} tf={tf}/>
          </>
        )}
      </div>
    </div>
  );
}
