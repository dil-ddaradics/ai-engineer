import { FileSystem, FILE_PATHS } from '../types';

/**
 * Utility functions for handling plan operations and acceptance criteria
 */
export class PlanUtils {
  constructor(private readonly fileSystem: FileSystem) {}

  /**
   * Parse a plan file and extract acceptance criteria
   */
  async parseAcceptanceCriteria(
    planFilePath: string
  ): Promise<{ completed: string[]; pending: string[] }> {
    try {
      const content = await this.fileSystem.read(planFilePath);
      const lines = content.split('\n');

      const completed: string[] = [];
      const pending: string[] = [];

      lines.forEach(line => {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('- [x]') || trimmedLine.startsWith('- [X]')) {
          completed.push(trimmedLine.substring(5).trim());
        } else if (trimmedLine.startsWith('- [ ]')) {
          pending.push(trimmedLine.substring(5).trim());
        }
      });

      return { completed, pending };
    } catch (error) {
      throw new Error(
        `Failed to parse acceptance criteria from ${planFilePath}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Check if all acceptance criteria are completed
   */
  async areAllAcceptanceCriteriaCompleted(planFilePath: string): Promise<boolean> {
    const { completed, pending } = await this.parseAcceptanceCriteria(planFilePath);
    return pending.length === 0 && completed.length > 0;
  }

  /**
   * Extract Atlassian URLs from a plan or context file
   */
  async extractAtlassianUrls(filePath: string): Promise<string[]> {
    try {
      const content = await this.fileSystem.read(filePath);
      const atlassianUrlPattern = /https?:\/\/[^\s]*\.atlassian\.net\/[^\s]*/gi;
      const matches = content.match(atlassianUrlPattern);
      return matches ? [...new Set(matches)] : []; // Remove duplicates
    } catch (error) {
      throw new Error(
        `Failed to extract Atlassian URLs: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Check if a file contains Atlassian URLs
   */
  async hasAtlassianUrls(filePath: string): Promise<boolean> {
    try {
      const urls = await this.extractAtlassianUrls(filePath);
      return urls.length > 0;
    } catch (error) {
      // Only catch file not found errors, let other errors (parsing, etc.) propagate
      if (error instanceof Error && error.message.includes('File not found')) {
        return false;
      }
      throw error;
    }
  }

  /**
   * Check if plan has at least one acceptance criterion
   */
  async hasAcceptanceCriteria(planFilePath: string): Promise<boolean> {
    try {
      const { completed, pending } = await this.parseAcceptanceCriteria(planFilePath);
      return completed.length > 0 || pending.length > 0;
    } catch {
      return false;
    }
  }

  /**
   * Get processed URLs from the .atlassian-refs file
   */
  async getProcessedUrls(): Promise<string[]> {
    try {
      if (!(await this.fileSystem.exists(FILE_PATHS.ATLASSIAN_REFS_FILE))) {
        return [];
      }
      const content = await this.fileSystem.readSafe(FILE_PATHS.ATLASSIAN_REFS_FILE);
      return content.split('\n').filter(line => line.trim().length > 0);
    } catch (error) {
      throw new Error(
        `Failed to read processed URLs: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Get unprocessed URLs from a file (URLs not in .atlassian-refs)
   */
  async getUnprocessedUrls(filePath: string): Promise<string[]> {
    try {
      const allUrls = await this.extractAtlassianUrls(filePath);
      const processedUrls = await this.getProcessedUrls();
      return allUrls.filter(url => !processedUrls.includes(url));
    } catch (error) {
      throw new Error(
        `Failed to get unprocessed URLs: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Update the .atlassian-refs file with new URLs
   */
  async updateProcessedUrls(newUrls: string[]): Promise<void> {
    try {
      const existingUrls = await this.getProcessedUrls();
      const allUrls = [...existingUrls, ...newUrls];
      await this.fileSystem.write(FILE_PATHS.ATLASSIAN_REFS_FILE, allUrls.join('\n'));
    } catch (error) {
      throw new Error(
        `Failed to update processed URLs: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}
