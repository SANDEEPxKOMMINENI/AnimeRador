const LOG_LEVELS = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
  } as const;
  
  type LogLevel = keyof typeof LOG_LEVELS;
  
  class Logger {
    private level: LogLevel = 'info';
  
    setLevel(level: LogLevel) {
      this.level = level;
    }
  
    private shouldLog(level: LogLevel): boolean {
      return LOG_LEVELS[level] <= LOG_LEVELS[this.level];
    }
  
    private formatMessage(level: LogLevel, message: string, meta?: any): string {
      const timestamp = new Date().toISOString();
      let formattedMessage = `[${timestamp}] ${level.toUpperCase()}: ${message}`;
      
      if (meta) {
        try {
          const metaString = JSON.stringify(meta, this.serializer);
          formattedMessage += `\n${metaString}`;
        } catch (error) {
          formattedMessage += '\n[Error serializing metadata]';
        }
      }
  
      return formattedMessage;
    }
  
    private serializer(key: string, value: any): any {
      if (value instanceof Error) {
        return {
          message: value.message,
          name: value.name,
          stack: value.stack,
        };
      }
      if (typeof value === 'symbol') {
        return value.toString();
      }
      if (value instanceof Set) {
        return Array.from(value);
      }
      if (value instanceof Map) {
        return Object.fromEntries(value);
      }
      return value;
    }
  
    error(message: string, meta?: any) {
      if (this.shouldLog('error')) {
        console.error(this.formatMessage('error', message, meta));
      }
    }
  
    warn(message: string, meta?: any) {
      if (this.shouldLog('warn')) {
        console.warn(this.formatMessage('warn', message, meta));
      }
    }
  
    info(message: string, meta?: any) {
      if (this.shouldLog('info')) {
        console.info(this.formatMessage('info', message, meta));
      }
    }
  
    debug(message: string, meta?: any) {
      if (this.shouldLog('debug')) {
        console.debug(this.formatMessage('debug', message, meta));
      }
    }
  }
  
  export const logger = new Logger();
  
  // Set log level based on environment
  if (process.env.NODE_ENV === 'development') {
    logger.setLevel('debug');
  } else {
    logger.setLevel('info');
  }