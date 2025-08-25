import { FileSystem, FILE_PATHS } from '../types';

/**
 * Utility functions for common file operations in the AI Engineer workflow
 */
export class FileUtils {
  constructor(private readonly fileSystem: FileSystem) {}

  /**
   * Archive task files to .ai/task/tasks/ directory
   */
  async archiveTaskFiles(taskName: string): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const time = new Date().toISOString().replace(/[:.]/g, '-').split('T')[1].substring(0, 8);
    const archiveDirName = `task-${taskName}-${timestamp}-${time}`;
    const archiveDir = `.ai/task/tasks/${archiveDirName}`;
    
    // Create archive directory
    await this.fileSystem.createDirectory(archiveDir);
    
    // Archive task.md and task-results.md if they exist
    const filesToArchive = [FILE_PATHS.TASK_FILE, FILE_PATHS.TASK_RESULTS_FILE];
    
    for (const sourcePath of filesToArchive) {
      if (await this.fileSystem.exists(sourcePath)) {
        const fileName = sourcePath.split('/').pop();
        const destPath = `${archiveDir}/${fileName}`;
        // Copy the file
        const content = await this.fileSystem.read(sourcePath);
        await this.fileSystem.write(destPath, content);
        // Delete the original
        await this.fileSystem.delete(sourcePath);
      }
    }
    
    return archiveDir;
  }

  /**
   * Create the base directory structure including tasks archive
   */
  async createBaseDirectories(): Promise<void> {
    const directories = [FILE_PATHS.TASK_BASE_DIR, '.ai/task/tasks'];

    for (const directory of directories) {
      await this.fileSystem.createDirectory(directory);
    }
  }

  /**
   * Get file content safely (returns empty string if file doesn't exist)
   */
  async readFileSafe(filePath: string): Promise<string> {
    try {
      return await this.fileSystem.read(filePath);
    } catch {
      return '';
    }
  }

  /**
   * Validate file paths are within the allowed directory structure
   */
  validateFilePath(filePath: string): boolean {
    return this.fileSystem.isWithinBaseDirectory(filePath);
  }

  /**
   * Extract task name from task.md frontmatter
   */
  async extractTaskName(taskFilePath: string): Promise<string> {
    try {
      const content = await this.fileSystem.read(taskFilePath);
      const frontmatterMatch = content.match(/^---\n.*?task_name: '(.+?)'.*?\n---/s);
      return frontmatterMatch ? frontmatterMatch[1] : 'unknown-task';
    } catch {
      return 'unknown-task';
    }
  }
}