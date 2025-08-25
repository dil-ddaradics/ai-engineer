import { FileSystem } from '../types';
import { TEMPLATES } from '../constants/templates';

/**
 * Template types for creating workflow files
 */
export type TemplateType =
  | 'plan'
  | 'task'
  | 'task_results'
  | 'context'
  | 'comments'
  | 'review_task'
  | 'review_task_results'
  | 'plan_guide'
  | 'task_guide'
  | 'system_explanation';

/**
 * Utility functions for handling template operations
 */
export class TemplateUtils {
  constructor(private readonly fileSystem: FileSystem) {}

  /**
   * Create a file from a template
   */
  async writeTemplate(filePath: string, templateType: TemplateType): Promise<void> {
    const template = TEMPLATES[templateType];
    if (!template) {
      throw new Error(`Template '${templateType}' not found`);
    }

    await this.fileSystem.write(filePath, template);
  }

}
