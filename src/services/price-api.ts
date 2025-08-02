import axios from 'axios'
import type { PriceData, Candlestick } from '../types/price.js'

/**
 * Service for fetching Bitcoin price data from Binance Futures API
 */
export class PriceApiService {
  private readonly baseUrl = 'https://fapi.binance.com/fapi/v1'

  /**
   * Fetch current Bitcoin price and market data
   * @returns Promise with current price data
   */
  async getCurrentPrice(): Promise<PriceData> {
    try {
      const tickerResponse = await axios.get(`${this.baseUrl}/ticker/24hr`, {
        params: {
          symbol: 'BTCUSDT'
        }
      })
      const ticker = tickerResponse.data
      const klineResponse = await axios.get(`${this.baseUrl}/klines`, {
        params: {
          symbol: 'BTCUSDT',
          interval: '1m',
          limit: 1
        }
      })
      const latestKline = klineResponse.data[0]
      const currentPrice = parseFloat(latestKline[4])
      return {
        symbol: 'BTC',
        price: currentPrice,
        change24h: parseFloat(ticker.priceChange),
        changePercent24h: parseFloat(ticker.priceChangePercent),
        volume24h: parseFloat(ticker.quoteVolume),
        marketCap: parseFloat(ticker.quoteVolume),
        lastUpdated: Date.now()
      }
    } catch (error) {
      throw new Error(`Failed to fetch Bitcoin price from Binance: ${error}`)
    }
  }

  /**
   * Fetch candlestick data for specified timeframe
   * @param days - Number of days to fetch
   * @returns Promise with candlestick data
   */
  async getCandlesticks(days: number = 7): Promise<Candlestick[]> {
    try {
      const limit = Math.min(days * 1440, 500)
      const response = await axios.get(`${this.baseUrl}/klines`, {
        params: {
          symbol: 'BTCUSDT',
          interval: '30m',
          limit
        }
      })
      return response.data.map((kline: (string | number)[]) => ({
        open: parseFloat(kline[1] as string),
        high: parseFloat(kline[2] as string),
        low: parseFloat(kline[3] as string),
        close: parseFloat(kline[4] as string),
        timestamp: kline[0] as number,
        volume: parseFloat(kline[5] as string)
      }))
    } catch (error) {
      throw new Error(`Failed to fetch candlestick data from Binance: ${error}`)
    }
  }

  /**
   * Get candlestick data with custom interval
   * @param interval - Kline interval (1m, 3m, 5m, 15m, 30m, 1h, 2h, 4h, 6h, 8h, 12h, 1d, 3d, 1w, 1M)
   * @param limit - Number of klines to fetch (max 1500)
   * @returns Promise with candlestick data
   */
  async getCandlesticksWithInterval(interval: string = '1h', limit: number = 168): Promise<Candlestick[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/klines`, {
        params: {
          symbol: 'BTCUSDT',
          interval,
          limit: Math.min(limit, 1500)
        }
      })
      return response.data.map((kline: (string | number)[]) => ({
        open: parseFloat(kline[1] as string),
        high: parseFloat(kline[2] as string),
        low: parseFloat(kline[3] as string),
        close: parseFloat(kline[4] as string),
        timestamp: kline[0] as number,
        volume: parseFloat(kline[5] as string)
      }))
    } catch (error) {
      throw new Error(`Failed to fetch candlestick data from Binance: ${error}`)
    }
  }
}
