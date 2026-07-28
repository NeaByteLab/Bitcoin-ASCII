import type * as Types from '@app/types.ts'

export default class Price {
  private static readonly baseUrl = 'https://fapi.binance.com/fapi/v1'
  private static readonly symbol = 'BTCUSDT'
  private static readonly interval = '30m'
  private static readonly dailyLimit = 48

  static getHistoricalData(date: Date): Promise<Types.CandlestickData[]> {
    const startTime = new Date(date)
    startTime.setHours(0, 0, 0, 0)
    const endTime = new Date(date)
    endTime.setHours(23, 59, 59, 999)
    return Price.fetchKlines({
      symbol: Price.symbol,
      interval: Price.interval,
      startTime: startTime.getTime(),
      endTime: endTime.getTime(),
      limit: Price.dailyLimit
    })
  }

  private static async fetchKlines(params: Types.KlineParams): Promise<Types.CandlestickData[]> {
    const query = new URLSearchParams(
      Object.entries(params).map(([key, value]) => [key, String(value)])
    )
    const response = await fetch(`${Price.baseUrl}/klines?${query}`)
    if (!response.ok) {
      throw new Error(`Binance API request failed with status ${response.status}`)
    }
    const data = await response.json()
    if (!Array.isArray(data)) {
      throw new Error('Binance API returned an invalid response format')
    }
    return data.map((kline: Types.RawKline) => Price.mapKline(kline))
  }

  private static mapKline(kline: Types.RawKline): Types.CandlestickData {
    if (!Array.isArray(kline) || kline.length < 6) {
      throw new Error('Kline data structure is invalid')
    }
    const openPrice = parseFloat(kline[1] as string)
    const highPrice = parseFloat(kline[2] as string)
    const lowPrice = parseFloat(kline[3] as string)
    const closePrice = parseFloat(kline[4] as string)
    const openTime = kline[0] as number
    const tradeVolume = parseFloat(kline[5] as string)
    if (
      [openPrice, highPrice, lowPrice, closePrice, openTime, tradeVolume].some((value) =>
        isNaN(value)
      )
    ) {
      throw new Error('Kline data contains invalid numeric values')
    }
    return { openPrice, highPrice, lowPrice, closePrice, openTime, tradeVolume }
  }
}
