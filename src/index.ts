#!/usr/bin/env node

import { writeFileSync } from 'fs'
import { join } from 'path'
import { ReadmeGenerator } from './utils/readme-generator.js'

/**
 * README generator instance for creating live Bitcoin data README
 */
const readmeGenerator = new ReadmeGenerator()

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

updateReadme() 