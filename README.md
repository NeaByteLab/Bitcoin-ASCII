# Bitcoin-ASCII ₿

Generate daily Bitcoin ASCII chart archives with automatic commits

## How It Works

`Pipeline.run(lookbackDays)` walks back `lookbackDays` from yesterday to today.

For each day it:

1. Fetches 30-minute candlesticks from the Binance Futures API using native `fetch`.
2. Renders an ASCII candlestick chart and daily OHLC statistics.
3. Writes the archive to `archive/YYYY/MM/DD.md`.
4. Stages and commits the file, backdated to that day. Unchanged days are skipped.

## Usage

```ts
import pipeline from '@neabyte/bitcoin-ascii'

await pipeline.run(30) // archive the last 30 days
```

## License

This project is licensed under the MIT license. See the [LICENSE](LICENSE) file for details.
