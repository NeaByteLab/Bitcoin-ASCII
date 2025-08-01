#!/usr/bin/env node

import { writeFileSync } from 'fs'
import { join } from 'path'
import { ReadmeGenerator } from './utils/readme-generator.js'
import { ArchiveGenerator } from './utils/archive-generator.js'

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
 */
async function generateArchive(date?: Date): Promise<void> {
  try {
    const archivePath = await archiveGenerator.generateArchive(date)
    console.log(`✓ Archive generated: ${archivePath}`)
  } catch (error) {
    console.error(`Error generating archive: ${error}`)
    process.exit(1)
  }
}

/**
 * Generate archives for a date range
 * @param startDate - Start date
 * @param endDate - End date
 */
async function generateArchiveRange(startDate: Date, endDate: Date): Promise<void> {
  try {
    const archives = await archiveGenerator.generateArchiveRange(startDate, endDate)
    console.log(`✓ Generated ${archives.length} archives`)
  } catch (error) {
    console.error(`Error generating archive range: ${error}`)
    process.exit(1)
  }
}

// Parse command line arguments
const args = process.argv.slice(2)
const command = args[0]

switch (command) {
  case 'archive':
    const dateArg = args[1]
    if (dateArg) {
      const date = new Date(dateArg)
      if (isNaN(date.getTime())) {
        console.error('Invalid date format. Use YYYY-MM-DD')
        process.exit(1)
      }
      generateArchive(date)
    } else {
      generateArchive() // Today's archive
    }
    break
    
  case 'archive-range':
    const startDateArg = args[1]
    const endDateArg = args[2]
    if (!startDateArg || !endDateArg) {
      console.error('Usage: npm run archive-range <start-date> <end-date>')
      console.error('Example: npm run archive-range 2025-08-01 2025-08-07')
      process.exit(1)
    }
    const startDate = new Date(startDateArg)
    const endDate = new Date(endDateArg)
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      console.error('Invalid date format. Use YYYY-MM-DD')
      process.exit(1)
    }
    generateArchiveRange(startDate, endDate)
    break
    
  default:
    updateReadme() // Default behavior
    break
} 