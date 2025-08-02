/**
 * Candlestick data structure for price charting
 */
export interface Candlestick {
  /** Opening price of the candlestick */
  open: number
  /** Highest price during the candlestick period */
  high: number
  /** Lowest price during the candlestick period */
  low: number
  /** Closing price of the candlestick */
  close: number
  /** Timestamp in milliseconds */
  timestamp: number
  /** Trading volume (optional) */
  volume?: number
}

/**
 * Current Bitcoin price and market data
 */
export interface PriceData {
  /** Cryptocurrency symbol */
  symbol: string
  /** Current price in USDT */
  price: number
  /** 24-hour price change in USDT */
  change24h: number
  /** 24-hour price change percentage */
  changePercent24h: number
  /** 24-hour trading volume in USDT */
  volume24h: number
  /** Market capitalization in USDT */
  marketCap: number
  /** Last updated timestamp in milliseconds */
  lastUpdated: number
}
