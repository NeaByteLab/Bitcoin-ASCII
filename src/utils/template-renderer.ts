/**
 * Template renderer for generating HTML templates
 */
export class TemplateRenderer {
  /**
   * Generate HTML table for Bitcoin data
   * @param data - Formatted price data
   * @returns HTML table string
   */
  generateDataTable(data: {
    currentPrice: string
    change: string
    volume: string
    marketCap: string
    timestamp: string
  }): string {
    const changeColor = data.change.includes('-') ? '#FF6B6B' : '#00FF00'
    const changeEmoji = data.change.includes('-') ? '🔴 ' : '🟢 '

    return `<table style="width: 100%; border-collapse: collapse; border-radius: 10px; overflow: hidden;">
  <thead>
    <tr style="background: #517c8c;">
      <th style="padding: 15px; text-align: left; color: #1a1a2e; font-weight: bold; font-size: 16px;">Metric</th>
      <th style="padding: 15px; text-align: right; color: #1a1a2e; font-weight: bold; font-size: 16px;">Value</th>
    </tr>
  </thead>
  <tbody>
    <tr style="border-bottom: 1px solid #2a2a3e;">
      <td style="padding: 12px 15px; font-weight: 500;">Symbol</td>
      <td style="padding: 12px 15px; text-align: right; font-weight: bold;">BTC/USDT</td>
    </tr>
    <tr style="border-bottom: 1px solid #2a2a3e;">
      <td style="padding: 12px 15px; font-weight: 500;">Price</td>
      <td style="padding: 12px 15px; text-align: right; font-weight: bold;">${data.currentPrice}</td>
    </tr>
    <tr style="border-bottom: 1px solid #2a2a3e;">
      <td style="padding: 12px 15px; font-weight: 500;">24h Change</td>
      <td style="padding: 12px 15px; text-align: right; color: ${changeColor}; font-weight: bold;">${changeEmoji}${data.change}</td>
    </tr>
    <tr style="border-bottom: 1px solid #2a2a3e;">
      <td style="padding: 12px 15px; font-weight: 500;">Volume</td>
      <td style="padding: 12px 15px; text-align: right; font-weight: bold;">$${data.volume}</td>
    </tr>
    <tr style="border-bottom: 1px solid #2a2a3e;">
      <td style="padding: 12px 15px; font-weight: 500;">Market Cap</td>
      <td style="padding: 12px 15px; text-align: right; font-weight: bold;">$${data.marketCap}</td>
    </tr>
    <tr>
      <td style="padding: 12px 15px; font-weight: 500;">Last Updated</td>
      <td style="padding: 12px 15px; text-align: right; font-weight: bold;">${data.timestamp}</td>
    </tr>
  </tbody>
</table>`
  }

  /**
   * Generate complete README template
   * @param chart - ASCII chart string
   * @param dataTable - HTML data table
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
