import { FileSystem, FILE_PATHS } from '../types';
import { TEMPLATES } from '../constants';

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
  private static readonly TEMPLATE_PATHS: Record<TemplateType, string> = {
    plan: FILE_PATHS.PLAN_FILE,
    task: FILE_PATHS.TASK_FILE,
    task_results: FILE_PATHS.TASK_RESULTS_FILE,
    context: FILE_PATHS.CONTEXT_FILE,
    comments: FILE_PATHS.COMMENTS_FILE,
    review_task: FILE_PATHS.REVIEW_TASK_FILE,
    review_task_results: FILE_PATHS.REVIEW_TASK_RESULTS_FILE,
    plan_guide: FILE_PATHS.PLAN_GUIDE_FILE,
    task_guide: FILE_PATHS.TASK_GUIDE_FILE,
    system_explanation: FILE_PATHS.SYSTEM_EXPLANATION_FILE,
  };

  constructor(private readonly fileSystem: FileSystem) {}

  /**
   * Create a file from a template
   * The file path is automatically determined based on the template type
   */
  async writeTemplate(templateType: TemplateType): Promise<void> {
    const template = TEMPLATES[templateType];
    if (!template) {
      throw new Error(`Template '${templateType}' not found`);
    }

    const filePath = TemplateUtils.TEMPLATE_PATHS[templateType];
    if (!filePath) {
      throw new Error(`No file path mapping found for template type '${templateType}'`);
    }

    await this.fileSystem.write(filePath, template);
  }
}
