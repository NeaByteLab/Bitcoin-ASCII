import type { Candlestick } from '../types/price.js'

/**
 * Chart renderer for generating ASCII charts
 */
export class ChartRenderer {
  /**
   * Generate clean candlestick chart without color codes using asciichart techniques
   * @param candlesticks - Array of candlestick data
   * @param dataPoints - Number of data points to show (default: 60)
   * @returns Clean ASCII chart
   */
  generateCleanChart(candlesticks: Candlestick[], dataPoints: number = 60): string {
    if (candlesticks.length === 0) {
      return 'No data available'
    }
    const recentCandlesticks = candlesticks.slice(-dataPoints)
    const prices = recentCandlesticks.map(c => c.close)
    const chartConfig = this.calculateChartConfig(prices)
    const result = this.createChartGrid(chartConfig)
    this.drawAxisAndLabels(result, chartConfig)
    this.plotPriceLine(result, prices, chartConfig)
    return this.convertToString(result, chartConfig)
  }

  /**
   * Calculate chart configuration parameters for ASCII rendering
   * @param prices - Array of price values
   * @returns Chart configuration object with dimensions and scaling
   */
  private calculateChartConfig(prices: number[]): {
    maxPrice: number
    minPrice: number
    range: number
    height: number
    width: number
    offset: number
    ratio: number
    min2: number
    max2: number
    rows: number
  } {
    const maxPrice = Math.max(...prices)
    const minPrice = Math.min(...prices)
    const range = maxPrice - minPrice
    const height = 12
    const width = prices.length
    const offset = 8
    const ratio = range !== 0 ? height / range : 1
    const min2 = Math.round(minPrice * ratio)
    const max2 = Math.round(maxPrice * ratio)
    const rows = Math.abs(max2 - min2)
    return {
      maxPrice,
      minPrice,
      range,
      height,
      width,
      offset,
      ratio,
      min2,
      max2,
      rows
    }
  }

  /**
   * Create 2D grid for chart rendering
   * @param config - Chart configuration object
   * @returns 2D string array representing chart grid
   */
  private createChartGrid(config: ReturnType<typeof this.calculateChartConfig>): string[][] {
    const result: string[][] = []
    for (let i = 0; i <= config.rows; i++) {
      result[i] = new Array(config.width + config.offset).fill(' ')
    }
    return result
  }

  /**
   * Draw Y-axis and price labels on the chart
   * @param result - 2D string array representing chart grid
   * @param config - Chart configuration object
   */
  private drawAxisAndLabels(result: string[][], config: ReturnType<typeof this.calculateChartConfig>): void {
    const padding = '        '
    const symbols = ['┼', '┤', '╶', '╴', '─', '└', '┌', '┐', '┘', '│']

    for (let y = config.min2; y <= config.max2; ++y) {
      const label = (config.rows > 0 ? config.maxPrice - ((y - config.min2) * config.range) / config.rows : y).toFixed(0)
      const paddedLabel = `${padding}$${label}`.slice(-padding.length)
      result[y - config.min2][Math.max(config.offset - paddedLabel.length, 0)] = paddedLabel
      result[y - config.min2][config.offset - 1] = y === 0 ? symbols[0] : symbols[1]
    }
  }

  /**
   * Plot price line on the chart grid
   * @param result - 2D string array representing chart grid
   * @param prices - Array of price values
   * @param config - Chart configuration object
   */
  private plotPriceLine(result: string[][], prices: number[], config: ReturnType<typeof this.calculateChartConfig>): void {
    const symbols = ['┼', '┤', '╶', '╴', '─', '└', '┌', '┐', '┘', '│']
    
    let y0 = Math.round(prices[0] * config.ratio) - config.min2
    result[config.rows - y0][config.offset - 1] = symbols[0]

    for (let x = 0; x < prices.length - 1; x++) {
      y0 = Math.round(prices[x] * config.ratio) - config.min2
      const y1 = Math.round(prices[x + 1] * config.ratio) - config.min2

      if (y0 === y1) {
        result[config.rows - y0][x + config.offset] = symbols[4]
      } else {
        this.drawVerticalLine(result, x, y0, y1, config, symbols)
      }
    }
  }

  /**
   * Draw vertical line segment between two points
   * @param result - 2D string array representing chart grid
   * @param x - X coordinate position
   * @param y0 - Starting Y coordinate
   * @param y1 - Ending Y coordinate
   * @param config - Chart configuration object
   * @param symbols - Array of ASCII symbols for drawing
   */
  private drawVerticalLine(
    result: string[][], 
    x: number, 
    y0: number, 
    y1: number, 
    config: ReturnType<typeof this.calculateChartConfig>,
    symbols: string[]
  ): void {
    result[config.rows - y1][x + config.offset] = y0 > y1 ? symbols[5] : symbols[6]
    result[config.rows - y0][x + config.offset] = y0 > y1 ? symbols[7] : symbols[8]

    const from = Math.min(y0, y1)
    const to = Math.max(y0, y1)
    for (let y = from + 1; y < to; y++) {
      result[config.rows - y][x + config.offset] = symbols[9]
    }
  }

  /**
   * Convert chart grid to final ASCII string representation
   * @param result - 2D string array representing chart grid
   * @param config - Chart configuration object
   * @returns Complete ASCII chart string with time axis
   */
  private convertToString(result: string[][], config: ReturnType<typeof this.calculateChartConfig>): string {
    const chartLines = result.map(row => row.join(''))
    const timeAxis = `${' '.repeat(config.offset) + '─'.repeat(config.width)}→`
    const timeLabel = `${' '.repeat(config.offset)}Time`

    return `${chartLines.join('\n')}\n${timeAxis}\n${timeLabel}`
  }
}
