export interface ArchiveStats {
  highPrice: number
  lowPrice: number
  openPrice: number
  closePrice: number
  priceChange: number
  changePercent: number
  totalVolume: number
  avgPrice: number
}

export interface CandlestickData {
  openPrice: number
  highPrice: number
  lowPrice: number
  closePrice: number
  openTime: number
  tradeVolume?: number
}

export interface ChartConfig {
  maxPrice: number
  minPrice: number
  priceRange: number
  gridHeight: number
  gridWidth: number
  leftOffset: number
  scaleRatio: number
  minScaled: number
  maxScaled: number
  totalRows: number
}

export type KlineParams = Record<string, string | number>

export type RawKline = (string | number)[]
