import axios from 'axios'

/**
 * Bitcoin difficulty adjustment data from mempool.space
 */
export interface DifficultyAdjustment {
  progressPercent: number
  difficultyChange: number
  estimatedRetargetDate: number
  remainingBlocks: number
  remainingTime: number
  previousRetarget: number
  previousTime: number
  nextRetargetHeight: number
  timeAvg: number
  adjustedTimeAvg: number
  timeOffset: number
  expectedBlocks: number
}

/**
 * Fetch current Bitcoin difficulty adjustment data from mempool.space
 * @returns DifficultyAdjustment object
 */
export const fetchDifficultyAdjustment = async (): Promise<DifficultyAdjustment> => {
  const { data } = await axios.get('https://mempool.space/api/v1/difficulty-adjustment')
  return data
}

/**
 * Generate an ASCII progress bar for difficulty adjustment
 * @param progress - Progress percent (0-100)
 * @param width - Bar width (default 40)
 * @returns ASCII bar string
 */
export const difficultyAsciiBar = (progress: number, width = 40): string => {
  const filled = Math.round((progress / 100) * width)
  return `[ ${'░'.repeat(filled)}${' '.repeat(width - filled)} ] ${progress.toFixed(2)}%`
}