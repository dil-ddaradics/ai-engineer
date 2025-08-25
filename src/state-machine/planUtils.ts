import { FileSystem } from './types.js';

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
   * Get the next pending acceptance criterion
   */
  async getNextPendingCriterion(planFilePath: string): Promise<string | null> {
    const { pending } = await this.parseAcceptanceCriteria(planFilePath);
    return pending.length > 0 ? pending[0] : null;
  }

  /**
   * Mark an acceptance criterion as completed
   */
  async markCriterionAsCompleted(planFilePath: string, criterion: string): Promise<void> {
    try {
      const content = await this.fileSystem.read(planFilePath);
      const lines = content.split('\n');

      const updatedLines = lines.map(line => {
        const trimmedLine = line.trim();
        if (trimmedLine === `- [ ] ${criterion}`) {
          return line.replace('- [ ]', '- [x]');
        }
        return line;
      });

      await this.fileSystem.write(planFilePath, updatedLines.join('\n'));
    } catch (error) {
      throw new Error(
        `Failed to mark criterion as completed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Mark multiple acceptance criteria as completed
   */
  async markCriteriaAsCompleted(planFilePath: string, criteria: string[]): Promise<void> {
    try {
      const content = await this.fileSystem.read(planFilePath);
      const lines = content.split('\n');

      const updatedLines = lines.map(line => {
        const trimmedLine = line.trim();
        for (const criterion of criteria) {
          if (trimmedLine === `- [ ] ${criterion}`) {
            return line.replace('- [ ]', '- [x]');
          }
        }
        return line;
      });

      await this.fileSystem.write(planFilePath, updatedLines.join('\n'));
    } catch (error) {
      throw new Error(
        `Failed to mark criteria as completed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Add a new acceptance criterion to the plan
   */
  async addAcceptanceCriterion(planFilePath: string, criterion: string): Promise<void> {
    try {
      const content = await this.fileSystem.read(planFilePath);
      const lines = content.split('\n');

      // Find the acceptance criteria section
      const criteriaIndex = lines.findIndex(line =>
        line.trim().toLowerCase().includes('acceptance criteria')
      );

      if (criteriaIndex === -1) {
        throw new Error('Acceptance Criteria section not found in plan file');
      }

      // Find the end of the acceptance criteria section
      let insertIndex = criteriaIndex + 1;
      while (
        insertIndex < lines.length &&
        (lines[insertIndex].trim().startsWith('- [') || lines[insertIndex].trim() === '')
      ) {
        insertIndex++;
      }

      // Insert the new criterion
      lines.splice(insertIndex, 0, `- [ ] ${criterion}`);

      await this.fileSystem.write(planFilePath, lines.join('\n'));
    } catch (error) {
      throw new Error(
        `Failed to add acceptance criterion: ${error instanceof Error ? error.message : String(error)}`
      );
    }
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
   * Update plan with summary information
   */
  async updatePlanSummary(planFilePath: string, summary: string): Promise<void> {
    try {
      const content = await this.fileSystem.read(planFilePath);
      const lines = content.split('\n');

      // Find the summary section
      const summaryIndex = lines.findIndex(line =>
        line.trim().toLowerCase().includes('## summary')
      );

      if (summaryIndex === -1) {
        throw new Error('Summary section not found in plan file');
      }

      // Find the next section after summary
      let endIndex = summaryIndex + 1;
      while (endIndex < lines.length && !lines[endIndex].trim().startsWith('##')) {
        endIndex++;
      }

      // Replace the summary content
      const beforeSummary = lines.slice(0, summaryIndex + 1);
      const afterSummary = lines.slice(endIndex);
      const newLines = [...beforeSummary, '', summary, '', ...afterSummary];

      await this.fileSystem.write(planFilePath, newLines.join('\n'));
    } catch (error) {
      throw new Error(
        `Failed to update plan summary: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Add a section to the plan file
   */
  async addPlanSection(planFilePath: string, sectionTitle: string, content: string): Promise<void> {
    try {
      const existingContent = await this.fileSystem.read(planFilePath);
      const newSection = `\n## ${sectionTitle}\n\n${content}\n`;
      await this.fileSystem.write(planFilePath, existingContent + newSection);
    } catch (error) {
      throw new Error(
        `Failed to add plan section: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Get plan sections and their content
   */
  async getPlanSections(planFilePath: string): Promise<Record<string, string>> {
    try {
      const content = await this.fileSystem.read(planFilePath);
      const lines = content.split('\n');
      const sections: Record<string, string> = {};

      let currentSection = '';
      let currentContent: string[] = [];

      lines.forEach(line => {
        if (line.trim().startsWith('# ') || line.trim().startsWith('## ')) {
          // Save previous section
          if (currentSection) {
            sections[currentSection] = currentContent.join('\n').trim();
          }

          // Start new section
          currentSection = line.trim().replace(/^#+\s*/, '');
          currentContent = [];
        } else {
          currentContent.push(line);
        }
      });

      // Save last section
      if (currentSection) {
        sections[currentSection] = currentContent.join('\n').trim();
      }

      return sections;
    } catch (error) {
      throw new Error(
        `Failed to get plan sections: ${error instanceof Error ? error.message : String(error)}`
      );
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
   * Get acceptance criteria statistics
   */
  async getAcceptanceCriteriaStats(
    planFilePath: string
  ): Promise<{ total: number; completed: number; pending: number; completionRate: number }> {
    const { completed, pending } = await this.parseAcceptanceCriteria(planFilePath);
    const total = completed.length + pending.length;
    const completionRate = total > 0 ? completed.length / total : 0;

    return {
      total,
      completed: completed.length,
      pending: pending.length,
      completionRate,
    };
  }

  /**
   * Validate plan file structure
   */
  async validatePlanStructure(
    planFilePath: string
  ): Promise<{ isValid: boolean; missingElements: string[] }> {
    try {
      const sections = await this.getPlanSections(planFilePath);
      const requiredSections = ['Summary', 'Acceptance Criteria', 'Technical Approach'];
      const missingElements: string[] = [];

      requiredSections.forEach(section => {
        if (
          !(section in sections) &&
          !Object.keys(sections).some(key => key.toLowerCase().includes(section.toLowerCase()))
        ) {
          missingElements.push(section);
        }
      });

      // Check if has at least one acceptance criterion
      if (!(await this.hasAcceptanceCriteria(planFilePath))) {
        missingElements.push('At least one acceptance criterion');
      }

      return {
        isValid: missingElements.length === 0,
        missingElements,
      };
    } catch (error) {
      return {
        isValid: false,
        missingElements: [
          `Failed to validate plan: ${error instanceof Error ? error.message : String(error)}`,
        ],
      };
    }
  }
}
