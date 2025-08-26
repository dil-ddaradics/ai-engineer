import { promises as fs } from 'fs';
import { dirname } from 'path';

export enum LogLevel {
  INFO = 'INFO',
  ERROR = 'ERROR',
}

export class Logger {
  private static instance: Logger;
  private readonly logFile: string;

  private constructor() {
    this.logFile = '.ai/task/logs/app.log';
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private async ensureLogDirectory(): Promise<void> {
    const logDir = dirname(this.logFile);
    try {
      await fs.mkdir(logDir, { recursive: true });
    } catch {
      // Directory might already exist, ignore error
    }
  }

  private formatMessage(level: LogLevel, message: string): string {
    const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
    return `[${timestamp}] [${level}] ${message}\n`;
  }

  private async writeLog(level: LogLevel, message: string): Promise<void> {
    try {
      await this.ensureLogDirectory();
      const formattedMessage = this.formatMessage(level, message);
      await fs.appendFile(this.logFile, formattedMessage, 'utf8');
    } catch (error) {
      // Fallback to console if file writing fails
      console.error(`Failed to write to log file: ${error}`);
      console.error(`Original message: ${message}`);
    }
  }

  async info(message: string): Promise<void> {
    await this.writeLog(LogLevel.INFO, message);
  }

  async error(message: string): Promise<void> {
    await this.writeLog(LogLevel.ERROR, message);
  }
}

// Export singleton instance
export const logger = Logger.getInstance();
