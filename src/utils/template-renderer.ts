/**
 * Template renderer for generating HTML templates
 */
export class TemplateRenderer {
  /**
   * Generate markdown table for Bitcoin data
   * @param data - Formatted price data
   * @returns Markdown table string
   */
  generateDataTable(data: {
    currentPrice: string
    change: string
    volume: string
    marketCap: string
    timestamp: string
  }): string {
    const changeEmoji = data.change.includes('-') ? '🔴 ' : '🟢 '
    return `| Metric | Value |
|--------|-------|
| Symbol | BTC/USDT |
| Price | ${data.currentPrice} |
| 24h Change | ${changeEmoji}${data.change} |
| Volume | $${data.volume} |
| Market Cap | $${data.marketCap} |
| Last Updated | ${data.timestamp} |`
  }

  /**
   * Generate complete README template
   * @param chart - ASCII chart string
   * @param dataTable - Markdown data table
   * @returns Complete README content
   */
  generateReadmeTemplate(chart: string, dataTable: string): string {
    return `# Bitcoin-ASCII ₿

Real-time Bitcoin price ASCII candlestick charts with markdown support in TypeScript.

---

## 📈 Live Bitcoin Chart

\`\`\`
${chart}
\`\`\`

## 💰 Live Bitcoin Data

${dataTable}

---

## 📄 License

MIT`
  }
}
