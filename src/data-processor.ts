import type { PriceData } from '@/types/price.js'

/**
 * Data processor for formatting Bitcoin price data
 */
export class DataProcessor {
  /**
   * Format price data for display
   * @param priceData - Raw price data
   * @returns Formatted price data
   */
  formatPriceData(priceData: PriceData | null): {
    currentPrice: string
    change: string
    volume: string
    marketCap: string
    timestamp: string
  } {
    return {
      currentPrice: priceData ? `$${priceData.price.toLocaleString()}` : 'N/A',
      change: priceData
        ? `${priceData.changePercent24h > 0 ? '+' : ''}${priceData.changePercent24h.toFixed(2)}%`
        : 'N/A',
      volume: priceData ? `${(priceData.volume24h / 1e6).toFixed(2)}M` : 'N/A',
      marketCap: priceData ? `${(priceData.marketCap / 1e9).toFixed(2)}B` : 'N/A',
      timestamp: new Date().toISOString().replace('T', ' ').replace('Z', ' UTC')
    }
  }

  /**
   * Get change color based on price movement
   * @param change - Price change percentage
   * @returns Color hex code
   */
  getChangeColor(change: string): string {
    return change.includes('-') ? '#FF6B6B' : '#00FF00'
  }

  /**
   * Get change emoji based on price movement
   * @param change - Price change percentage
   * @returns Emoji string
   */
  getChangeEmoji(change: string): string {
    return change.includes('-') ? '🔴 ' : '🟢 '
  }
}
