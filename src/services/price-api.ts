import axios from 'axios'
import type { PriceData, Candlestick } from '@/types/price.js'
import { BinanceApiError, DataProcessingError } from '@/types/errors.js'

/**
 * Service for fetching Bitcoin price data from Binance Futures API
 */
export class PriceApiService {
  private readonly baseUrl = 'https://fapi.binance.com/fapi/v1'
  private static readonly BINANCE_MAX_LIMIT = 1500
  private static readonly BTC_SYMBOL = 'BTC'
  private static readonly CURRENT_PRICE_FIELD = 'currentPrice'
  private static readonly DAILY_LIMIT = 48
  private static readonly DEFAULT_DAYS = 7
  private static readonly DEFAULT_INTERVAL = '30m'
  private static readonly DEFAULT_LIMIT = 168
  private static readonly DEFAULT_SYMBOL = 'BTCUSDT'
  private static readonly FAILED_FETCH_KLINE_MESSAGE = 'Failed to fetch kline data from Binance'
  private static readonly FAILED_FETCH_PRICE_MESSAGE = 'Failed to fetch Bitcoin price'
  private static readonly FAILED_PROCESS_KLINE_MESSAGE = 'Failed to process kline data'
  private static readonly FROM_BINANCE_MESSAGE = 'from Binance'
  private static readonly HOUR_INTERVAL = '1h'
  private static readonly INVALID_KLINE_STRUCTURE_MESSAGE = 'Invalid kline data structure'
  private static readonly INVALID_NUMERIC_MESSAGE = 'Invalid numeric values in kline data'
  private static readonly INVALID_PRICE_MESSAGE = 'Invalid price data from API'
  private static readonly INVALID_RESPONSE_MESSAGE = 'Invalid response format from Binance API'
  private static readonly INVALID_TICKER_RESPONSE_MESSAGE = 'Invalid ticker response format'
  private static readonly KLINE_FIELD = 'kline'
  private static readonly KLINES_ENDPOINT = '/klines'
  private static readonly MAX_LIMIT = 500
  private static readonly MINUTE_INTERVAL = '1m'
  private static readonly MINUTES_PER_DAY = 1440
  private static readonly SINGLE_LIMIT = 1
  private static readonly TICKER_ENDPOINT = '/ticker/24hr'

  /**
   * Map Binance kline data to Candlestick format
   * @param kline - Raw kline data from Binance API
   * @returns Formatted candlestick data
   * @throws DataProcessingError if kline data is invalid
   */
  private mapKlineToCandlestick(kline: (string | number)[]): Candlestick {
    try {
      if (!Array.isArray(kline) || kline.length < 6) {
        throw new DataProcessingError(PriceApiService.INVALID_KLINE_STRUCTURE_MESSAGE, PriceApiService.KLINE_FIELD)
      }

      const open = parseFloat(kline[1] as string)
      const high = parseFloat(kline[2] as string)
      const low = parseFloat(kline[3] as string)
      const close = parseFloat(kline[4] as string)
      const timestamp = kline[0] as number
      const volume = parseFloat(kline[5] as string)

      const numericValues = [open, high, low, close, timestamp, volume]
      if (numericValues.some(value => isNaN(value))) {
        throw new DataProcessingError(PriceApiService.INVALID_NUMERIC_MESSAGE, PriceApiService.KLINE_FIELD)
      }

      return {
        open,
        high,
        low,
        close,
        timestamp,
        volume
      }
    } catch (error) {
      if (error instanceof DataProcessingError) {
        throw error
      }
      throw new DataProcessingError(`${PriceApiService.FAILED_PROCESS_KLINE_MESSAGE}: ${error}`, PriceApiService.KLINE_FIELD)
    }
  }

  /**
   * Fetch klines from Binance API with error handling
   * @param params - API parameters
   * @returns Promise with kline data
   * @throws BinanceApiError if API request fails
   */
  private async fetchKlines(params: Record<string, string | number>): Promise<Candlestick[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/klines`, { params })
      
      if (!Array.isArray(response.data)) {
        throw new BinanceApiError(PriceApiService.INVALID_RESPONSE_MESSAGE, response.status, PriceApiService.KLINES_ENDPOINT)
      }

      return response.data.map((kline: (string | number)[]) => this.mapKlineToCandlestick(kline))
    } catch (error) {
      if (error instanceof BinanceApiError || error instanceof DataProcessingError) {
        throw error
      }

      if (axios.isAxiosError(error)) {
        const statusCode = error.response?.status
        const message = error.response?.data?.msg || error.message
        throw new BinanceApiError(
          `Binance API request failed: ${message}`,
          statusCode,
          '/klines'
        )
      }

      throw new BinanceApiError(`${PriceApiService.FAILED_FETCH_KLINE_MESSAGE}: ${error}`, undefined, PriceApiService.KLINES_ENDPOINT)
    }
  }

  /**
   * Fetch current Bitcoin price and market data
   * @returns Promise with current price data
   * @throws BinanceApiError if API request fails
   */
  async getCurrentPrice(): Promise<PriceData> {
    try {
      const tickerResponse = await axios.get(`${this.baseUrl}/ticker/24hr`, {
        params: {
          symbol: PriceApiService.DEFAULT_SYMBOL
        }
      })

      if (!tickerResponse.data || typeof tickerResponse.data !== 'object') {
        throw new BinanceApiError(PriceApiService.INVALID_TICKER_RESPONSE_MESSAGE, tickerResponse.status, PriceApiService.TICKER_ENDPOINT)
      }

      const ticker = tickerResponse.data
      const klineResponse = await axios.get(`${this.baseUrl}/klines`, {
        params: {
          symbol: PriceApiService.DEFAULT_SYMBOL,
          interval: PriceApiService.MINUTE_INTERVAL,
          limit: PriceApiService.SINGLE_LIMIT
        }
      })

      if (!Array.isArray(klineResponse.data) || klineResponse.data.length === 0) {
        throw new BinanceApiError(PriceApiService.INVALID_RESPONSE_MESSAGE, klineResponse.status, PriceApiService.KLINES_ENDPOINT)
      }

      const latestKline = klineResponse.data[0]
      const currentPrice = parseFloat(latestKline[4] as string)

      if (isNaN(currentPrice)) {
        throw new DataProcessingError(PriceApiService.INVALID_PRICE_MESSAGE, PriceApiService.CURRENT_PRICE_FIELD)
      }

      return {
        symbol: PriceApiService.BTC_SYMBOL,
        price: currentPrice,
        change24h: parseFloat(ticker.priceChange),
        changePercent24h: parseFloat(ticker.priceChangePercent),
        volume24h: parseFloat(ticker.quoteVolume),
        marketCap: parseFloat(ticker.quoteVolume),
        lastUpdated: Date.now()
      }
    } catch (error) {
      if (error instanceof BinanceApiError || error instanceof DataProcessingError) {
        throw error
      }

      if (axios.isAxiosError(error)) {
        const statusCode = error.response?.status
        const message = error.response?.data?.msg || error.message
        throw new BinanceApiError(
          `${PriceApiService.FAILED_FETCH_PRICE_MESSAGE}: ${message}`,
          statusCode,
          PriceApiService.TICKER_ENDPOINT
        )
      }

      throw new BinanceApiError(`${PriceApiService.FAILED_FETCH_PRICE_MESSAGE} ${PriceApiService.FROM_BINANCE_MESSAGE}: ${error}`, undefined, PriceApiService.TICKER_ENDPOINT)
    }
  }

  /**
   * Fetch candlestick data for specified timeframe
   * @param days - Number of days to fetch
   * @returns Promise with candlestick data
   */
  async getCandlesticks(days: number = PriceApiService.DEFAULT_DAYS): Promise<Candlestick[]> {
    const limit = Math.min(days * PriceApiService.MINUTES_PER_DAY, PriceApiService.MAX_LIMIT)
    return this.fetchKlines({
      symbol: PriceApiService.DEFAULT_SYMBOL,
      interval: PriceApiService.DEFAULT_INTERVAL,
      limit
    })
  }

  /**
   * Get candlestick data with custom interval
   * @param interval - Kline interval (1m, 3m, 5m, 15m, 30m, 1h, 2h, 4h, 6h, 8h, 12h, 1d, 3d, 1w, 1M)
   * @param limit - Number of klines to fetch (max 1500)
   * @returns Promise with candlestick data
   */
  async getCandlesticksWithInterval(interval: string = PriceApiService.HOUR_INTERVAL, limit: number = PriceApiService.DEFAULT_LIMIT): Promise<Candlestick[]> {
    return this.fetchKlines({
      symbol: PriceApiService.DEFAULT_SYMBOL,
      interval,
      limit: Math.min(limit, PriceApiService.BINANCE_MAX_LIMIT)
    })
  }

  /**
   * Fetch historical data for a specific date (24 hours of 30m intervals)
   * @param date - Date to fetch data for (default: today)
   * @returns Promise with candlestick data for the specified date
   */
  async getHistoricalData(date: Date = new Date()): Promise<Candlestick[]> {
    const startTime = new Date(date)
    startTime.setHours(0, 0, 0, 0)
    const endTime = new Date(date)
    endTime.setHours(23, 59, 59, 999)
    return this.fetchKlines({
      symbol: PriceApiService.DEFAULT_SYMBOL,
      interval: PriceApiService.DEFAULT_INTERVAL,
      startTime: startTime.getTime(),
      endTime: endTime.getTime(),
      limit: PriceApiService.DAILY_LIMIT
    })
  }

  /**
   * Fetch historical data for a specific date range
   * @param startDate - Start date
   * @param endDate - End date
   * @returns Promise with candlestick data for the date range
   */
  async getHistoricalDataRange(startDate: Date, endDate: Date): Promise<Candlestick[]> {
    return this.fetchKlines({
      symbol: PriceApiService.DEFAULT_SYMBOL,
      interval: PriceApiService.DEFAULT_INTERVAL,
      startTime: startDate.getTime(),
      endTime: endDate.getTime(),
      limit: PriceApiService.BINANCE_MAX_LIMIT
    })
  }
}
