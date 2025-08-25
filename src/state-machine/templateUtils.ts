import { FileSystem } from './types.js';
import { TEMPLATES } from './templates.js';

/**
 * Utility functions for handling template operations
 */
export class TemplateUtils {
  constructor(private readonly fileSystem: FileSystem) {}

  /**
   * Get template content by name
   */
  getTemplate(templateName: string): string {
    return TEMPLATES[templateName] || '';
  }

  /**
   * Get all available template names
   */
  getTemplateNames(): string[] {
    return Object.keys(TEMPLATES);
  }

  /**
   * Check if a template exists
   */
  hasTemplate(templateName: string): boolean {
    return templateName in TEMPLATES;
  }

  /**
   * Create a file from a template
   */
  async createFileFromTemplate(
    filePath: string,
    templateName: string,
    replacements: Record<string, string> = {}
  ): Promise<void> {
    const template = this.getTemplate(templateName);
    if (!template) {
      throw new Error(`Template '${templateName}' not found`);
    }

    let content = template;

    // Replace placeholders in template
    Object.entries(replacements).forEach(([placeholder, value]) => {
      const placeholderPattern = new RegExp(`\\[${placeholder}\\]`, 'g');
      content = content.replace(placeholderPattern, value);
    });

    await this.fileSystem.write(filePath, content);
  }

  /**
   * Create multiple files from templates
   */
  async createFilesFromTemplates(
    fileTemplateMap: Record<string, { template: string; replacements?: Record<string, string> }>
  ): Promise<void> {
    const promises = Object.entries(fileTemplateMap).map(([filePath, config]) =>
      this.createFileFromTemplate(filePath, config.template, config.replacements || {})
    );

    await Promise.all(promises);
  }

  /**
   * Get template with dynamic replacements
   */
  getTemplateWithReplacements(
    templateName: string,
    replacements: Record<string, string> = {}
  ): string {
    let template = this.getTemplate(templateName);

    Object.entries(replacements).forEach(([placeholder, value]) => {
      const placeholderPattern = new RegExp(`\\[${placeholder}\\]`, 'g');
      template = template.replace(placeholderPattern, value);
    });

    return template;
  }

  /**
   * Extract placeholders from a template
   */
  getTemplatePlaceholders(templateName: string): string[] {
    const template = this.getTemplate(templateName);
    const matches = template.match(/\[([A-Z_]+)\]/g);
    return matches ? matches.map(match => match.slice(1, -1)) : [];
  }

  /**
   * Validate that all placeholders in a template have values
   */
  validateTemplateReplacements(
    templateName: string,
    replacements: Record<string, string>
  ): { isValid: boolean; missingPlaceholders: string[] } {
    const placeholders = this.getTemplatePlaceholders(templateName);
    const missingPlaceholders = placeholders.filter(placeholder => !(placeholder in replacements));

    return {
      isValid: missingPlaceholders.length === 0,
      missingPlaceholders,
    };
  }

  /**
   * Get template metadata (if embedded in template)
   */
  getTemplateMetadata(templateName: string): Record<string, string> {
    const template = this.getTemplate(templateName);
    const metadata: Record<string, string> = {};

    // Extract metadata from markdown-style comments
    const metadataMatches = template.match(/\[\/\/\]: # '(.+)'/g);
    if (metadataMatches) {
      metadataMatches.forEach((match, index) => {
        const content = match.match(/\[\/\/\]: # '(.+)'/)?.[1];
        if (content) {
          metadata[`comment_${index}`] = content;
        }
      });
    }

    return metadata;
  }

  /**
   * Create a plan file with appropriate template
   */
  async createPlanFile(
    filePath: string,
    summary?: string,
    acceptanceCriteria?: string[]
  ): Promise<void> {
    const replacements: Record<string, string> = {};

    if (summary) {
      replacements['SUMMARY'] = summary;
    }

    if (acceptanceCriteria && acceptanceCriteria.length > 0) {
      replacements['ACCEPTANCE_CRITERIA'] = acceptanceCriteria.map(ac => `- [ ] ${ac}`).join('\n');
    }

    await this.createFileFromTemplate(filePath, 'plan', replacements);
  }

  /**
   * Create a task file with appropriate template
   */
  async createTaskFile(
    filePath: string,
    taskName?: string,
    objective?: string,
    acceptanceCriterion?: string
  ): Promise<void> {
    const replacements: Record<string, string> = {};

    if (taskName) {
      replacements['TASK_NAME'] = taskName;
    }

    if (objective) {
      replacements['OBJECTIVE'] = objective;
    }

    if (acceptanceCriterion) {
      replacements['ACCEPTANCE_CRITERION'] = acceptanceCriterion;
    }

    await this.createFileFromTemplate(filePath, 'task', replacements);
  }

  /**
   * Create a context file with appropriate template
   */
  async createContextFile(filePath: string): Promise<void> {
    await this.createFileFromTemplate(filePath, 'context');
  }

  /**
   * Create a comments file with appropriate template
   */
  async createCommentsFile(filePath: string): Promise<void> {
    await this.createFileFromTemplate(filePath, 'comments');
  }

  /**
   * Create a review task file with appropriate template
   */
  async createReviewTaskFile(filePath: string): Promise<void> {
    await this.createFileFromTemplate(filePath, 'review_task');
  }

  /**
   * Create task results file with appropriate template
   */
  async createTaskResultsFile(filePath: string): Promise<void> {
    await this.createFileFromTemplate(filePath, 'task_results');
  }

  /**
   * Create review task results file with appropriate template
   */
  async createReviewTaskResultsFile(filePath: string): Promise<void> {
    await this.createFileFromTemplate(filePath, 'review_task_results');
  }

  /**
   * Create guide files (plan-guide.md and task-guide.md)
   */
  async createGuideFiles(basePath: string): Promise<void> {
    await Promise.all([
      this.createFileFromTemplate(`${basePath}/plan-guide.md`, 'plan_guide'),
      this.createFileFromTemplate(`${basePath}/task-guide.md`, 'task_guide'),
    ]);
  }

  /**
   * Check if a file appears to be created from a template
   */
  async isTemplateBasedFile(filePath: string, templateName: string): Promise<boolean> {
    try {
      const content = await this.fileSystem.read(filePath);
      const template = this.getTemplate(templateName);

      // Check if the file structure matches the template structure
      const templateLines = template.split('\n').filter(line => line.trim() && !line.includes('['));
      const contentLines = content.split('\n').filter(line => line.trim());

      // Simple heuristic: if most template structure lines are present
      const matchingLines = templateLines.filter(templateLine =>
        contentLines.some(contentLine => contentLine.includes(templateLine.trim()))
      );

      return matchingLines.length / templateLines.length > 0.5;
    } catch {
      return false;
    }
  }
}
