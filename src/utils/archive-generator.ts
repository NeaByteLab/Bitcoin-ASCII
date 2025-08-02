import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'
import { PriceApiService } from '@/services/price-api.js'
import { ChartRenderer } from '@/utils/chart-renderer.js'
import type { Candlestick } from '@/types/price.js'
import { ArchiveError, DataProcessingError } from '@/types/errors.js'

/**
 * Archive generator for creating historical Bitcoin data files
 */
export class ArchiveGenerator {
  private readonly priceApi = new PriceApiService()
  private readonly chartRenderer = new ChartRenderer()

  /**
   * Generate archive file for a specific date
   * @param date - Date to generate archive for (default: today)
   * @returns Promise with archive file path
   * @throws ArchiveError if archive generation fails
   */
  async generateArchive(date: Date = new Date()): Promise<string> {
    try {
      if (!(date instanceof Date) || isNaN(date.getTime())) {
        throw new ArchiveError('Invalid date provided for archive generation', date.toISOString())
      }
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const archiveDate = new Date(date)
      archiveDate.setHours(0, 0, 0, 0)
      if (archiveDate >= today) {
        throw new ArchiveError(
          'Cannot generate archive for current day or future dates. Please use a date at least 1 day in the past.',
          date.toISOString()
        )
      }
      console.log(`Generating archive for ${date.toDateString()}...`)
      const candlesticks = await this.priceApi.getHistoricalData(date)
      if (!Array.isArray(candlesticks) || candlesticks.length === 0) {
        throw new ArchiveError('No candlestick data available for archive generation', date.toISOString())
      }
      const chart = this.chartRenderer.generateCleanChart(candlesticks, 48)
      const archiveData = this.calculateArchiveStats(candlesticks)
      const archiveContent = this.generateArchiveContent(date, chart, archiveData)
      const archivePath = this.getArchivePath(date)
      this.ensureArchiveDirectory(archivePath)
      writeFileSync(archivePath, archiveContent, 'utf8')
      console.log(`✓ Archive generated: ${archivePath}`)
      return archivePath
    } catch (error) {
      if (error instanceof ArchiveError) {
        throw error
      }
      throw new ArchiveError(`Failed to generate archive: ${error}`, date.toISOString())
    }
  }

  /**
   * Generate archive for a date range
   * @param startDate - Start date
   * @param endDate - End date
   * @returns Promise with array of archive file paths
   */
  async generateArchiveRange(startDate: Date, endDate: Date): Promise<string[]> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const rangeEndDate = new Date(endDate)
    rangeEndDate.setHours(0, 0, 0, 0)
    if (rangeEndDate >= today) {
      throw new ArchiveError(
        'Cannot generate archives for current day or future dates. Please use an end date at least 1 day in the past.',
        endDate.toISOString()
      )
    }
    const archives: string[] = []
    const currentDate = new Date(startDate)
    while (currentDate <= endDate) {
      try {
        const archivePath = await this.generateArchive(currentDate)
        archives.push(archivePath)
      } catch (error) {
        console.error(`Failed to generate archive for ${currentDate.toDateString()}: ${error}`)
      }
      currentDate.setDate(currentDate.getDate() + 1)
    }
    return archives
  }

  /**
   * Calculate archive statistics from candlestick data
   * @param candlesticks - Array of candlestick data
   * @returns Archive statistics
   * @throws DataProcessingError if statistics calculation fails
   */
  private calculateArchiveStats(candlesticks: Candlestick[]): {
    high: number
    low: number
    open: number
    close: number
    change: number
    changePercent: number
    volume: number
    avgPrice: number
  } {
    try {
      if (!Array.isArray(candlesticks) || candlesticks.length === 0) {
        throw new DataProcessingError('No candlestick data available for statistics calculation', 'candlesticks')
      }
      const prices = candlesticks.map(c => c.close)
      const volumes = candlesticks.map(c => c.volume || 0)
      if (prices.some(price => isNaN(price) || price < 0)) {
        throw new DataProcessingError('Invalid price data in candlesticks', 'prices')
      }
      const high = Math.max(...candlesticks.map(c => c.high))
      const low = Math.min(...candlesticks.map(c => c.low))
      const { open } = candlesticks[0]
      const { close } = candlesticks[candlesticks.length - 1]
      if (isNaN(open) || isNaN(close) || open <= 0) {
        throw new DataProcessingError('Invalid open/close prices for change calculation', 'prices')
      }
      const change = close - open
      const changePercent = (change / open) * 100
      const volume = volumes.reduce((sum, vol) => sum + vol, 0)
      const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length
      return {
        high,
        low,
        open,
        close,
        change,
        changePercent,
        volume,
        avgPrice
      }
    } catch (error) {
      if (error instanceof DataProcessingError) {
        throw error
      }
      throw new DataProcessingError(`Failed to calculate archive statistics: ${error}`, 'statistics')
    }
  }

  /**
   * Generate archive content with chart and statistics
   * @param date - Archive date
   * @param chart - ASCII chart
   * @param stats - Archive statistics
   * @returns Archive content string
   */
  private generateArchiveContent(date: Date, chart: string, stats: {
    high: number
    low: number
    open: number
    close: number
    change: number
    changePercent: number
    volume: number
    avgPrice: number
  }): string {
    const changeEmoji = stats.changePercent >= 0 ? '🟢' : '🔴'
    const changeSign = stats.changePercent >= 0 ? '+' : ''
    return `# Bitcoin Archive - ${date.toDateString()} 📊

## 📈 24-Hour Bitcoin Chart (30m intervals)

\`\`\`
${chart}
\`\`\`

## 📊 Daily Statistics

| Metric | Value |
|--------|-------|
| Date | ${date.toDateString()} |
| Open | $${stats.open.toLocaleString()} |
| Close | $${stats.close.toLocaleString()} |
| High | $${stats.high.toLocaleString()} |
| Low | $${stats.low.toLocaleString()} |
| Change | ${changeEmoji} ${changeSign}$${stats.change.toFixed(2)} |
| Change % | ${changeEmoji} ${changeSign}${stats.changePercent.toFixed(2)}% |
| Volume | $${(stats.volume / 1e6).toFixed(2)}M |
| Avg Price | $${stats.avgPrice.toLocaleString()} |

## 📅 Trading Session

- **Period:** 24 hours (48 x 30-minute intervals)
- **Data Source:** Binance Futures API

---
*Generated by Bitcoin-ASCII Archive System*
`
  }

  /**
   * Get archive file path for a specific date
   * @param date - Date for archive
   * @returns Archive file path
   */
  private getArchivePath(date: Date): string {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const filename = `${day}.md`
    return join(process.cwd(), 'archive', String(year), String(month), filename)
  }

  /**
   * Ensure archive directory exists
   * @param archivePath - Archive file path
   */
  private ensureArchiveDirectory(archivePath: string): void {
    const dir = join(archivePath, '..')
    mkdirSync(dir, { recursive: true })
  }
} 