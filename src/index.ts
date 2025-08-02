#!/usr/bin/env node

import { writeFileSync } from 'fs'
import { join } from 'path'
import { ReadmeGenerator } from '@/utils/readme-generator.js'
import { ArchiveGenerator } from '@/utils/archive-generator.js'
import { ArchiveError } from '@/types/errors.js'

const INVALID_DATE_FORMAT_MESSAGE = '❌ Invalid date format. Use YYYY-MM-DD'

/**
 * README generator instance for creating live Bitcoin data README
 */
const readmeGenerator = new ReadmeGenerator()

/**
 * Archive generator instance for creating historical data files
 */
const archiveGenerator = new ArchiveGenerator()

/**
 * Generate and update README with live data
 * @returns Promise that resolves when README is updated
 * @throws Error if README generation or file writing fails
 */
async function updateReadme(): Promise<void> {
  try {
    console.log('Generating README with live Bitcoin data...')
    const readmeContent = await readmeGenerator.generateReadme()
    const readmePath = join(process.cwd(), 'README.md')
    writeFileSync(readmePath, readmeContent, 'utf8')
    console.log('✓ README.md updated successfully with live Bitcoin data')
    console.log(`Updated: ${new Date().toLocaleString()}`)
  } catch (error) {
    console.error(`Error updating README: ${error}`)
    process.exit(1)
  }
}

/**
 * Generate archive for a specific date
 * @param date - Date to generate archive for
 * @returns Promise that resolves when archive is generated
 * @throws ArchiveError if archive generation fails
 */
async function generateArchive(date?: Date): Promise<void> {
  try {
    const archivePath = await archiveGenerator.generateArchive(date)
    console.log(`✓ Archive generated: ${archivePath}`)
  } catch (error) {
    if (error instanceof ArchiveError) {
      console.error(`❌ Archive Error: ${error.message}`)
      if (error.date) {
        console.error(`   Date: ${error.date}`)
      }
    } else {
      console.error(`❌ Unexpected Error: ${error}`)
    }
    process.exit(1)
  }
}

/**
 * Generate archives for a date range
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Promise that resolves when all archives are generated
 * @throws ArchiveError if archive generation fails
 */
async function generateArchiveRange(startDate: Date, endDate: Date): Promise<void> {
  try {
    const archives = await archiveGenerator.generateArchiveRange(startDate, endDate)
    console.log(`✓ Generated ${archives.length} archives`)
  } catch (error) {
    if (error instanceof ArchiveError) {
      console.error(`❌ Archive Range Error: ${error.message}`)
      if (error.date) {
        console.error(`   Date: ${error.date}`)
      }
    } else {
      console.error(`❌ Unexpected Error: ${error}`)
    }
    process.exit(1)
  }
}

/**
 * Generate historic archives with automatic Git commits
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Promise that resolves when all historic archives are generated and committed
 * @throws ArchiveError if archive generation fails or Git operations fail
 */
async function generateHistoricArchives(startDate: Date, endDate: Date): Promise<void> {
  try {
    console.log(`🚀 Generating historic archives from ${startDate.toDateString()} to ${endDate.toDateString()}...`)
    const { execSync } = await import('child_process')
    execSync('git config user.email \'209737579+NeaByteLab@users.noreply.github.com\'', { stdio: 'inherit' })
    execSync('git config user.name \'NeaByteLab\'', { stdio: 'inherit' })
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const rangeEndDate = new Date(endDate)
    rangeEndDate.setHours(0, 0, 0, 0)
    if (rangeEndDate >= today) {
      console.error('❌ Cannot generate historic archives for current day or future dates.')
      console.error('   Please use an end date at least 1 day in the past.')
      process.exit(1)
    }
    const archives: string[] = []
    const currentDate = new Date(startDate)
    let successCount = 0
    let errorCount = 0
    while (currentDate <= endDate) {
      try {
        const archivePath = await archiveGenerator.generateArchive(currentDate)
        archives.push(archivePath)
        successCount++
        const dateStr = currentDate.toISOString().split('T')[0]
        const BOT_EMOJIS = ['📊', '📈', '💰', '📉', '🎯', '🚀', '📋', '📅', '🔥', '⚡', '💎', '🎪', '🎨', '🎭', '🎯', '🎲', '🎮', '🎸', '🎹', '🎺', '🎻', '🎼', '🎵', '🎶', '🎷', '🎸', '🎹', '🎺', '🎻']
        const randomEmoji = BOT_EMOJIS[Math.floor(Math.random() * BOT_EMOJIS.length)]
        execSync(`git add '${archivePath}'`, { stdio: 'inherit' })
        execSync(`git commit -m 'bot(archive): add Bitcoin archive for ${dateStr} ${randomEmoji}' --date='${currentDate.toISOString()}'`, { stdio: 'inherit' })
        console.log(`✓ Generated and committed: ${archivePath}`)
      } catch (error) {
        console.error(`❌ Failed to generate archive for ${currentDate.toDateString()}: ${error}`)
        errorCount++
      }
      currentDate.setDate(currentDate.getDate() + 1)
    }
    console.log('\n🎉 Historic archive generation complete!')
    console.log(`✅ Successfully generated: ${successCount} archives`)
    if (errorCount > 0) {
      console.log(`❌ Failed: ${errorCount} archives`)
    }
    console.log(`📁 Total archives: ${archives.length}`)
  } catch (error) {
    console.error(`❌ Historic Archive Error: ${error}`)
    process.exit(1)
  }
}

// Parse command line arguments
const args = process.argv.slice(2)
const command = args[0]
switch (command) {
  case 'archive': {
    const dateArg = args[1]
    if (dateArg) {
      const date = new Date(dateArg)
      if (isNaN(date.getTime())) {
        console.error(INVALID_DATE_FORMAT_MESSAGE)
        process.exit(1)
      }
      generateArchive(date)
    } else {
      generateArchive()
    }
    break
  }
  case 'archive-range': {
    const startDateArg = args[1]
    const endDateArg = args[2]
    if (!startDateArg || !endDateArg) {
      console.error('❌ Usage: npm run archive-range <start-date> <end-date>')
      console.error('❌ Example: npm run archive-range 2025-08-01 2025-08-07')
      process.exit(1)
    }
    const startDate = new Date(startDateArg)
    const endDate = new Date(endDateArg)
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      console.error(INVALID_DATE_FORMAT_MESSAGE)
      process.exit(1)
    }
    generateArchiveRange(startDate, endDate)
    break
  }
  case 'archive-historic': {
    const startDateArg = args[1]
    const endDateArg = args[2]
    if (!startDateArg || !endDateArg) {
      console.error('❌ Usage: npm run archive:historic <start-date> <end-date>')
      console.error('❌ Example: npm run archive:historic 2020-01-01 2024-12-31')
      process.exit(1)
    }
    const startDate = new Date(startDateArg)
    const endDate = new Date(endDateArg)
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      console.error(INVALID_DATE_FORMAT_MESSAGE)
      process.exit(1)
    }
    generateHistoricArchives(startDate, endDate)
    break
  }
  default:
    updateReadme()
    break
}