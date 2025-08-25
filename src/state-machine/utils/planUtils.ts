import { FileSystem } from '../types';

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
    const urls = await this.extractAtlassianUrls(filePath);
    return urls.length > 0;
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


}
