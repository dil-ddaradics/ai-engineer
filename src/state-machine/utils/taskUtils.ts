import { FileSystem, FILE_PATHS } from '../types';
import { FileUtils } from './fileUtils';

/**
 * Utility class for task and review archiving operations
 * Handles archiving of task files and PR review files according to state machine specifications
 */
export class TaskUtils {
  constructor(
    private readonly fileSystem: FileSystem,
    private readonly fileUtils: FileUtils
  ) {}

  /**
   * Archive task files (both regular and incomplete tasks)
   * Gracefully handles missing task-results.md for incomplete tasks
   * 
   * @returns Promise<string> - The archive directory path
   */
  async archiveTask(): Promise<string> {
    const taskName = await this.fileUtils.extractTaskName(FILE_PATHS.TASK_FILE);
    const timestamp = this.formatTimestamp();
    const archiveDirName = `task-${taskName}-${timestamp}`;
    const archiveDir = `.ai/task/tasks/${archiveDirName}`;
    
    // Create archive directory
    await this.fileSystem.createDirectory(archiveDir);
    
    // Archive task files that exist
    const filesToArchive = [
      { source: FILE_PATHS.TASK_FILE, name: 'task.md' },
      { source: FILE_PATHS.TASK_RESULTS_FILE, name: 'task-results.md' }
    ];
    
    for (const file of filesToArchive) {
      await this.tryArchiveFile(file.source, `${archiveDir}/${file.name}`);
    }
    
    return archiveDir;
  }

  /**
   * Archive PR review files 
   * 
   * @returns Promise<string> - The archive directory path
   */
  async archiveReviewTask(): Promise<string> {
    const timestamp = this.formatTimestamp();
    const archiveDirName = `pr-review-${timestamp}`;
    const archiveDir = `pr-reviews/${archiveDirName}`;
    
    // Create archive directory
    await this.fileSystem.createDirectory(archiveDir);
    
    // Archive review files that exist
    const filesToArchive = [
      { source: FILE_PATHS.COMMENTS_FILE, name: 'comments.md' },
      { source: FILE_PATHS.REVIEW_TASK_FILE, name: 'review-task.md' },
      { source: FILE_PATHS.REVIEW_TASK_RESULTS_FILE, name: 'review-task-results.md' }
    ];
    
    for (const file of filesToArchive) {
      await this.tryArchiveFile(file.source, `${archiveDir}/${file.name}`);
    }
    
    return archiveDir;
  }

  /**
   * Try to archive a file, gracefully handling missing files
   * 
   * @param sourcePath - Path to the source file
   * @param destPath - Path to the destination file
   */
  private async tryArchiveFile(sourcePath: string, destPath: string): Promise<void> {
    try {
      if (await this.fileSystem.exists(sourcePath)) {
        const content = await this.fileSystem.read(sourcePath);
        await this.fileSystem.write(destPath, content);
        await this.fileSystem.delete(sourcePath);
      }
    } catch (error) {
      // Silently ignore errors - file might not exist or be inaccessible
      // This is expected behavior for incomplete tasks missing results files
    }
  }

  /**
   * Format timestamp for archive directory names
   * Format: YYYY-MM-DD-HHMMSS
   */
  private formatTimestamp(): string {
    const now = new Date();
    const date = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const time = now.toISOString().split('T')[1].replace(/[:.]/g, '').substring(0, 6); // HHMMSS
    return `${date}-${time}`;
  }

  /**
   * Create base directories for archiving
   */
  async createArchiveDirectories(): Promise<void> {
    const directories = ['.ai/task/tasks', 'pr-reviews'];
    
    for (const directory of directories) {
      await this.fileSystem.createDirectory(directory);
    }
  }
}