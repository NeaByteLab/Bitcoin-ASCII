/**
 * Custom error classes for Bitcoin-ASCII application
 */

/**
 * Base error class for Bitcoin-ASCII application
 */
export class BitcoinAsciiError extends Error {
  constructor(message: string, public code?: string) {
    super(message)
    this.name = 'BitcoinAsciiError'
  }
}

/**
 * API-related errors
 */
export class ApiError extends BitcoinAsciiError {
  constructor(
    message: string,
    public statusCode?: number,
    public endpoint?: string
  ) {
    super(message, 'API_ERROR')
    this.name = 'ApiError'
  }
}

/**
 * Binance API specific errors
 */
export class BinanceApiError extends ApiError {
  constructor(
    message: string,
    statusCode?: number,
    endpoint?: string
  ) {
    super(message, statusCode, endpoint)
    this.name = 'BinanceApiError'
  }
}

/**
 * Data processing errors
 */
export class DataProcessingError extends BitcoinAsciiError {
  constructor(message: string, public dataType?: string) {
    super(message, 'DATA_PROCESSING_ERROR')
    this.name = 'DataProcessingError'
  }
}

/**
 * Chart rendering errors
 */
export class ChartRenderingError extends BitcoinAsciiError {
  constructor(message: string, public chartType?: string) {
    super(message, 'CHART_RENDERING_ERROR')
    this.name = 'ChartRenderingError'
  }
}

/**
 * Archive generation errors
 */
export class ArchiveError extends BitcoinAsciiError {
  constructor(message: string, public date?: string) {
    super(message, 'ARCHIVE_ERROR')
    this.name = 'ArchiveError'
  }
}

/**
 * Validation errors
 */
export class ValidationError extends BitcoinAsciiError {
  constructor(message: string, public field?: string) {
    super(message, 'VALIDATION_ERROR')
    this.name = 'ValidationError'
  }
} 