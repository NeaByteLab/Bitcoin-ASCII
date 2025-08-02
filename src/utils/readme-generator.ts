import { PriceApiService } from '@/services/price-api.js'
import { ChartRenderer } from '@/utils/chart-renderer.js'
import { DataProcessor } from '@/utils/data-processor.js'
import { TemplateRenderer } from '@/utils/template-renderer.js'
import { fetchDifficultyAdjustment, difficultyAsciiBar } from '@/utils/network-stats.js'

/**
 * README generator with live Bitcoin data
 */
export class ReadmeGenerator {
  private readonly priceApi = new PriceApiService()
  private readonly chartRenderer = new ChartRenderer()
  private readonly dataProcessor = new DataProcessor()
  private readonly templateRenderer = new TemplateRenderer()

  /**
   * Generate README content with live Bitcoin data
   * @returns Generated README content
   */
  async generateReadme(): Promise<string> {
    try {
      const [priceData, candlesticks, difficulty] = await Promise.all([
        this.priceApi.getCurrentPrice(),
        this.priceApi.getCandlesticks(60),
        fetchDifficultyAdjustment()
      ])
      const formattedData = this.dataProcessor.formatPriceData(priceData)
      const chart = this.chartRenderer.generateCleanChart(candlesticks)
      const dataTable = this.templateRenderer.generateDataTable(formattedData)
      const progress = typeof difficulty.progressPercent === 'number' && !isNaN(difficulty.progressPercent) ? difficulty.progressPercent : 0
      const expectedBlocks = typeof difficulty.expectedBlocks === 'number' && !isNaN(difficulty.expectedBlocks) ? difficulty.expectedBlocks : 0
      const remainingBlocks = typeof difficulty.remainingBlocks === 'number' && !isNaN(difficulty.remainingBlocks) ? difficulty.remainingBlocks : 0
      const blocksMined = expectedBlocks && remainingBlocks !== undefined ? Math.round(expectedBlocks - remainingBlocks) : 'N/A'
      const totalBlocks = expectedBlocks ? Math.round(expectedBlocks) : 'N/A'
      const diffChange = typeof difficulty.difficultyChange === 'number' && !isNaN(difficulty.difficultyChange) ? `${difficulty.difficultyChange.toFixed(2)}%` : 'N/A'
      const difficultyBar = `\n\n## ⚡ Bitcoin Difficulty Adjustment\n${difficultyAsciiBar(progress)}\n\n• Blocks Mined: ${blocksMined} / ${totalBlocks}\n• Estimated Adjustment: ${diffChange}`
      return this.templateRenderer.generateReadmeTemplate(chart + difficultyBar, dataTable)
    } catch (error) {
      console.error('Error generating README:', error)
      return this.templateRenderer.generateReadmeTemplate('No data available', 'No data available')
    }
  }
}
