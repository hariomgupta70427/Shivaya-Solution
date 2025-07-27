/**
 * Centralized error handling utilities
 */

export interface AppError {
  message: string;
  code?: string;
  details?: any;
}

export class ErrorHandler {
  static handleError(error: any, context?: string): AppError {
    console.error(`Error in ${context || 'unknown context'}:`, error);
    
    if (error instanceof Error) {
      return {
        message: error.message,
        code: error.name,
        details: error.stack
      };
    }
    
    if (typeof error === 'string') {
      return {
        message: error,
        code: 'STRING_ERROR'
      };
    }
    
    return {
      message: 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
      details: error
    };
  }
  
  static async safeAsync<T>(
    asyncFn: () => Promise<T>,
    fallback: T,
    context?: string
  ): Promise<T> {
    try {
      return await asyncFn();
    } catch (error) {
      this.handleError(error, context);
      return fallback;
    }
  }
  
  static safe<T>(
    fn: () => T,
    fallback: T,
    context?: string
  ): T {
    try {
      return fn();
    } catch (error) {
      this.handleError(error, context);
      return fallback;
    }
  }
}

export default ErrorHandler;