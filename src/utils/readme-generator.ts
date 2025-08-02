import { PriceApiService } from '@/services/price-api.js'
import { ChartRenderer } from '@/utils/chart-renderer.js'
import { DataProcessor } from '@/utils/data-processor.js'
import { TemplateRenderer } from '@/utils/template-renderer.js'

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
      const [priceData, candlesticks] = await Promise.all([
        this.priceApi.getCurrentPrice(),
        this.priceApi.getCandlesticks(60)
      ])
      const formattedData = this.dataProcessor.formatPriceData(priceData)
      const chart = this.chartRenderer.generateCleanChart(candlesticks)
      const dataTable = this.templateRenderer.generateDataTable(formattedData)
      return this.templateRenderer.generateReadmeTemplate(chart, dataTable)
    } catch (error) {
      console.error('Error generating README:', error)
      return this.templateRenderer.generateReadmeTemplate('No data available', 'No data available')
    }
  }
}
