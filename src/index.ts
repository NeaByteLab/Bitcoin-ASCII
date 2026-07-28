import NodeChildProcess from 'node:child_process'
import Archive from '@app/archive.ts'

export default class Pipeline {
  private static readonly botEmojis = [
    '📊',
    '📈',
    '💰',
    '📉',
    '🎯',
    '🚀',
    '📋',
    '📅',
    '🔥',
    '⚡',
    '💎'
  ]

  static async run(lookbackDays: number): Promise<void> {
    if (!Number.isInteger(lookbackDays) || lookbackDays <= 0) {
      throw new Error('lookbackDays must be a positive integer')
    }
    Pipeline.configureGit()
    const endDate = new Date()
    endDate.setHours(0, 0, 0, 0)
    endDate.setDate(endDate.getDate() - 1)
    const startDate = new Date(endDate)
    startDate.setDate(startDate.getDate() - (lookbackDays - 1))
    console.log(
      `🚀 Generating archives from ${startDate.toDateString()} to ${endDate.toDateString()}...`
    )
    let count = 0
    for (const date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      const archivePath = await Archive.generateArchive(new Date(date))
      Pipeline.commit(archivePath, new Date(date))
      count++
    }
    console.log(`🎉 Done. Generated and committed ${count} archives.`)
  }

  private static commit(archivePath: string, date: Date): void {
    NodeChildProcess.execSync(`git add '${archivePath}'`, { stdio: 'inherit' })
    if (!Pipeline.hasStagedChanges()) {
      console.log(`- Skipped unchanged archive ${archivePath}`)
      return
    }
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const dateStr = `${year}-${month}-${day}`
    const emoji = Pipeline.botEmojis[Math.floor(Math.random() * Pipeline.botEmojis.length)]
    NodeChildProcess.execSync(
      `git commit -m 'bot(archive): add Bitcoin archive for ${dateStr} ${emoji}' --date='${date.toISOString()}'`,
      { stdio: 'inherit' }
    )
    console.log(`✓ Committed: ${archivePath}`)
  }

  private static configureGit(): void {
    NodeChildProcess.execSync(
      "git config user.email '209737579+NeaByteLab@users.noreply.github.com'",
      { stdio: 'inherit' }
    )
    NodeChildProcess.execSync("git config user.name 'NeaByteLab'", { stdio: 'inherit' })
  }

  private static hasStagedChanges(): boolean {
    const status = NodeChildProcess.execSync('git diff --cached --name-only').toString()
    return status.trim().length > 0
  }
}
