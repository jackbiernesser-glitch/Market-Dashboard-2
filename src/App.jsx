import { useState, useEffect, useCallback, useRef } from "react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  ReferenceLine, ComposedChart
} from "recharts";

const API_KEY = "d6lqm0pr01quej914cm0d6lqm0pr01quej914cmg";

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────
const ASSET_META = {
  stocks: [
    { id:"spx",    label:"S&P 500",    symbol:"^GSPC",            unit:"",  sector:"Index",  base:5210   },
    { id:"ndx",    label:"Nasdaq 100", symbol:"^NDX",             unit:"",  sector:"Index",  base:18240  },
    { id:"dji",    label:"Dow Jones",  symbol:"^DJI",             unit:"",  sector:"Index",  base:39500  },
    { id:"rut",    label:"Russell 2K", symbol:"^RUT",             unit:"",  sector:"Index",  base:2085   },
  ],
  crypto: [
    { id:"btc",    label:"Bitcoin",    symbol:"BINANCE:BTCUSDT",  unit:"$", sector:"L1",     base:67500  },
    { id:"eth",    label:"Ethereum",   symbol:"BINANCE:ETHUSDT",  unit:"$", sector:"L1",     base:3520   },
    { id:"sol",    label:"Solana",     symbol:"BINANCE:SOLUSDT",  unit:"$", sector:"L1",     base:158    },
    { id:"bnb",    label:"BNB",        symbol:"BINANCE:BNBUSDT",  unit:"$", sector:"L1",     base:572    },
  ],
  commodities: [
    { id:"gold",   label:"Gold",       symbol:null,               unit:"$", sector:"Metal",  base:2325   },
    { id:"silver", label:"Silver",     symbol:null,               unit:"$", sector:"Metal",  base:27.6   },
    { id:"oil",    label:"Crude Oil",  symbol:null,               unit:"$", sector:"Energy", base:82.4   },
    { id:"natgas", label:"Nat. Gas",   symbol:null,               unit:"$", sector:"Energy", base:2.12   },
  ],
  forex: [
    { id:"eurusd", label:"EUR/USD",    symbol:"OANDA:EUR_USD",    unit:"",  sector:"Major",  base:1.0852 },
    { id:"gbpusd", label:"GBP/USD",    symbol:"OANDA:GBP_USD",    unit:"",  sector:"Major",  base:1.2648 },
    { id:"usdjpy", label:"USD/JPY",    symbol:"OANDA:USD_JPY",    unit:"",  sector:"Major",  base:151.82 },
    { id:"usdchf", label:"USD/CHF",    symbol:"OANDA:USD_CHF",    unit:"",  sector:"Major",  base:0.9052 },
  ],
};

const SECTORS = [
  { id:"tech",       label:"Technology",   weight:29, stocks:[
    {id:"aapl",label:"Apple",    symbol:"AAPL", base:185},{id:"msft",label:"Microsoft",symbol:"MSFT",base:415},
    {id:"nvda",label:"NVIDIA",   symbol:"NVDA", base:875},{id:"meta",label:"Meta",      symbol:"META",base:505},
    {id:"googl",label:"Alphabet",symbol:"GOOGL",base:170}]},
  { id:"health",     label:"Healthcare",   weight:13, stocks:[
    {id:"jnj",label:"J&J",         symbol:"JNJ", base:155},{id:"unh",label:"UnitedHealth",symbol:"UNH",base:520},
    {id:"abbv",label:"AbbVie",     symbol:"ABBV",base:170},{id:"pfe",label:"Pfizer",       symbol:"PFE",base:27},
    {id:"mrk",label:"Merck",       symbol:"MRK", base:128}]},
  { id:"finance",    label:"Financials",   weight:13, stocks:[
    {id:"jpm",label:"JPMorgan",   symbol:"JPM",base:198},{id:"bac",label:"Bank of Am",symbol:"BAC",base:38},
    {id:"wfc",label:"Wells Fargo",symbol:"WFC",base:58}, {id:"gs", label:"Goldman",   symbol:"GS", base:455},

     
