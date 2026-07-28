import type * as Types from '@app/types.ts'

export default class Chart {
  private static readonly chartSymbols = ['┼', '┤', '╶', '╴', '─', '└', '┌', '┐', '┘', '│']

  static generateCleanChart(
    candlesticks: Types.CandlestickData[],
    dataPoints: number = 60
  ): string {
    if (candlesticks.length === 0) {
      return 'No data available'
    }
    if (dataPoints <= 0) {
      throw new Error('Invalid dataPoints parameter')
    }
    const prices = candlesticks.slice(-dataPoints).map((c) => c.closePrice)
    if (prices.some((price) => isNaN(price) || price < 0)) {
      throw new Error('Invalid price data in candlesticks')
    }
    const config = Chart.buildConfig(prices)
    const result = Chart.createGrid(config)
    Chart.drawAxis(result, config)
    Chart.plotLine(result, prices, config)
    return Chart.renderString(result, config)
  }

  private static buildConfig(prices: number[]): Types.ChartConfig {
    const maxPrice = Math.max(...prices)
    const minPrice = Math.min(...prices)
    const priceRange = maxPrice - minPrice
    const gridHeight = 12
    const gridWidth = prices.length
    const leftOffset = 8
    const scaleRatio = priceRange !== 0 ? gridHeight / priceRange : 1
    const minScaled = Math.round(minPrice * scaleRatio)
    const maxScaled = Math.round(maxPrice * scaleRatio)
    const totalRows = Math.abs(maxScaled - minScaled)
    return {
      maxPrice,
      minPrice,
      priceRange,
      gridHeight,
      gridWidth,
      leftOffset,
      scaleRatio,
      minScaled,
      maxScaled,
      totalRows
    }
  }

  private static createGrid(config: Types.ChartConfig): string[][] {
    const result: string[][] = []
    for (let i = 0; i <= config.totalRows; i++) {
      result[i] = new Array(config.gridWidth + config.leftOffset).fill(' ')
    }
    return result
  }

  private static drawAxis(result: string[][], config: Types.ChartConfig): void {
    for (let y = config.minScaled; y <= config.maxScaled; ++y) {
      const label = (
        config.totalRows > 0
          ? config.maxPrice - ((y - config.minScaled) * config.priceRange) / config.totalRows
          : y
      ).toFixed(0)
      const paddedLabel = `        $${label}`.slice(-8)
      const row = result[y - config.minScaled]!
      row[Math.max(config.leftOffset - paddedLabel.length, 0)] = paddedLabel
      row[config.leftOffset - 1] = y === 0 ? Chart.chartSymbols[0]! : Chart.chartSymbols[1]!
    }
  }

  private static drawVertical(
    result: string[][],
    x: number,
    y0: number,
    y1: number,
    config: Types.ChartConfig
  ): void {
    result[config.totalRows - y1]![x + config.leftOffset] = y0 > y1
      ? Chart.chartSymbols[5]!
      : Chart.chartSymbols[6]!
    result[config.totalRows - y0]![x + config.leftOffset] = y0 > y1
      ? Chart.chartSymbols[7]!
      : Chart.chartSymbols[8]!
    const from = Math.min(y0, y1)
    const to = Math.max(y0, y1)
    for (let y = from + 1; y < to; y++) {
      result[config.totalRows - y]![x + config.leftOffset] = Chart.chartSymbols[9]!
    }
  }

  private static plotLine(result: string[][], prices: number[], config: Types.ChartConfig): void {
    let y0 = Math.round(prices[0]! * config.scaleRatio) - config.minScaled
    result[config.totalRows - y0]![config.leftOffset - 1] = Chart.chartSymbols[0]!
    for (let x = 0; x < prices.length - 1; x++) {
      y0 = Math.round(prices[x]! * config.scaleRatio) - config.minScaled
      const y1 = Math.round(prices[x + 1]! * config.scaleRatio) - config.minScaled
      if (y0 === y1) {
        result[config.totalRows - y0]![x + config.leftOffset] = Chart.chartSymbols[4]!
      } else {
        Chart.drawVertical(result, x, y0, y1, config)
      }
    }
  }

  private static renderString(result: string[][], config: Types.ChartConfig): string {
    const chartLines = result.map((row) => row.join(''))
    const timeAxis = `${' '.repeat(config.leftOffset) + '─'.repeat(config.gridWidth)}→`
    const timeLabel = `${' '.repeat(config.leftOffset)}Time`
    return `${chartLines.join('\n')}\n${timeAxis}\n${timeLabel}`
  }
}
