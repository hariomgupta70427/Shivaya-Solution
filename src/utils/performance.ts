/**
 * Performance monitoring utilities
 */

export class PerformanceMonitor {
  private static timers: Map<string, number> = new Map();
  
  static startTimer(label: string): void {
    this.timers.set(label, performance.now());
  }
  
  static endTimer(label: string): number {
    const startTime = this.timers.get(label);
    if (!startTime) {
      console.warn(`Timer '${label}' was not started`);
      return 0;
    }
    
    const duration = performance.now() - startTime;
    console.log(`⏱️ ${label}: ${duration.toFixed(2)}ms`);
    this.timers.delete(label);
    return duration;
  }
  
  static async measureAsync<T>(
    label: string,
    asyncFn: () => Promise<T>
  ): Promise<T> {
    this.startTimer(label);
    try {
      const result = await asyncFn();
      this.endTimer(label);
      return result;
    } catch (error) {
      this.endTimer(label);
      throw error;
    }
  }
  
  static measure<T>(
    label: string,
    fn: () => T
  ): T {
    this.startTimer(label);
    try {
      const result = fn();
      this.endTimer(label);
      return result;
    } catch (error) {
      this.endTimer(label);
      throw error;
    }
  }
  
  static logMemoryUsage(): void {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      console.log('🧠 Memory Usage:', {
        used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
        total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
        limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`
      });
    }
  }
}

export default PerformanceMonitor;