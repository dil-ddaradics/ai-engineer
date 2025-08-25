import { FileSystem, FILE_PATHS } from './types.js';

/**
 * Utility functions for common file operations in the AI Engineer workflow
 */
export class FileUtils {
  constructor(private readonly fileSystem: FileSystem) {}

  /**
   * Check if all required workflow files exist
   */
  async checkWorkflowFiles(): Promise<{ missing: string[]; existing: string[] }> {
    const requiredFiles = [
      FILE_PATHS.PLAN_FILE,
      FILE_PATHS.TASK_FILE,
      FILE_PATHS.TASK_RESULTS_FILE,
      FILE_PATHS.COMMENTS_FILE,
      FILE_PATHS.REVIEW_TASK_FILE,
      FILE_PATHS.REVIEW_TASK_RESULTS_FILE,
      FILE_PATHS.CONTEXT_FILE,
    ];

    const missing: string[] = [];
    const existing: string[] = [];

    for (const filePath of requiredFiles) {
      if (await this.fileSystem.exists(filePath)) {
        existing.push(filePath);
      } else {
        missing.push(filePath);
      }
    }

    return { missing, existing };
  }

  /**
   * Archive a file with timestamp
   */
  async archiveFile(sourcePath: string, reason?: string): Promise<string> {
    const timestamp = new Date();
    const archiveFileName = this.fileSystem.generateArchiveFilename(sourcePath, timestamp);
    const reasonSuffix = reason ? `-${reason.replace(/[^a-zA-Z0-9]/g, '-')}` : '';
    const finalArchiveFileName = archiveFileName.replace('.md', `${reasonSuffix}.md`);
    const archivePath = `${FILE_PATHS.ARCHIVE_BASE_DIR}/${finalArchiveFileName}`;

    await this.fileSystem.archive(sourcePath, archivePath);
    return archivePath;
  }

  /**
   * Archive multiple files at once
   */
  async archiveFiles(filePaths: string[], reason?: string): Promise<string[]> {
    const archivedPaths: string[] = [];

    for (const filePath of filePaths) {
      if (await this.fileSystem.exists(filePath)) {
        const archivePath = await this.archiveFile(filePath, reason);
        archivedPaths.push(archivePath);
      }
    }

    return archivedPaths;
  }

  /**
   * Clean up temporary and intermediate files
   */
  async cleanupTempFiles(): Promise<void> {
    const tempFiles = [
      `${FILE_PATHS.TASK_BASE_DIR}/.tmp`,
      `${FILE_PATHS.TASK_BASE_DIR}/.backup`,
      `${FILE_PATHS.TASK_BASE_DIR}/.processing`,
    ];

    for (const tempFile of tempFiles) {
      if (await this.fileSystem.exists(tempFile)) {
        await this.fileSystem.delete(tempFile);
      }
    }
  }

  /**
   * Create the base directory structure
   */
  async createBaseDirectories(): Promise<void> {
    const directories = [FILE_PATHS.TASK_BASE_DIR, FILE_PATHS.ARCHIVE_BASE_DIR];

    for (const directory of directories) {
      await this.fileSystem.createDirectory(directory);
    }
  }

  /**
   * Get file content safely (returns empty string if file doesn't exist)
   */
  async readFileSafe(filePath: string): Promise<string> {
    return this.fileSystem.readSafe(filePath, '');
  }

  /**
   * Check if a file is empty or contains only whitespace
   */
  async isFileEmpty(filePath: string): Promise<boolean> {
    try {
      const content = await this.fileSystem.read(filePath);
      return content.trim().length === 0;
    } catch {
      return true; // File doesn't exist or can't be read
    }
  }

  /**
   * Get file modification time (if available)
   */
  async getFileModificationTime(filePath: string): Promise<Date | null> {
    try {
      const fullPath = this.fileSystem.resolvePath(filePath);
      const fs = await import('fs');
      const stats = await fs.promises.stat(fullPath);
      return stats.mtime;
    } catch {
      return null;
    }
  }

  /**
   * List all archived files
   */
  async listArchivedFiles(): Promise<string[]> {
    try {
      return await this.fileSystem.listFiles(FILE_PATHS.ARCHIVE_BASE_DIR);
    } catch {
      return [];
    }
  }

  /**
   * Find the most recent archived file matching a pattern
   */
  async findMostRecentArchive(pattern: string): Promise<string | null> {
    const archivedFiles = await this.listArchivedFiles();
    const matchingFiles = archivedFiles.filter(file => file.includes(pattern));

    if (matchingFiles.length === 0) {
      return null;
    }

    // Sort by filename (which includes timestamp)
    matchingFiles.sort().reverse();
    return `${FILE_PATHS.ARCHIVE_BASE_DIR}/${matchingFiles[0]}`;
  }

  /**
   * Restore a file from archive
   */
  async restoreFromArchive(archivePath: string, targetPath: string): Promise<void> {
    if (!(await this.fileSystem.exists(archivePath))) {
      throw new Error(`Archive file does not exist: ${archivePath}`);
    }

    const content = await this.fileSystem.read(archivePath);
    await this.fileSystem.write(targetPath, content);
  }

  /**
   * Create a backup of a file before modifying it
   */
  async createBackup(filePath: string): Promise<string> {
    if (!(await this.fileSystem.exists(filePath))) {
      throw new Error(`File does not exist: ${filePath}`);
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = `${filePath}.backup.${timestamp}`;

    const content = await this.fileSystem.read(filePath);
    await this.fileSystem.write(backupPath, content);

    return backupPath;
  }

  /**
   * Validate file paths are within the allowed directory structure
   */
  validateFilePath(filePath: string): boolean {
    return this.fileSystem.isWithinBaseDirectory(filePath);
  }

  /**
   * Get relative paths for all workflow files
   */
  getWorkflowFilePaths(): Record<string, string> {
    return {
      plan: this.fileSystem.getRelativePath(FILE_PATHS.PLAN_FILE),
      task: this.fileSystem.getRelativePath(FILE_PATHS.TASK_FILE),
      taskResults: this.fileSystem.getRelativePath(FILE_PATHS.TASK_RESULTS_FILE),
      comments: this.fileSystem.getRelativePath(FILE_PATHS.COMMENTS_FILE),
      reviewTask: this.fileSystem.getRelativePath(FILE_PATHS.REVIEW_TASK_FILE),
      reviewTaskResults: this.fileSystem.getRelativePath(FILE_PATHS.REVIEW_TASK_RESULTS_FILE),
      context: this.fileSystem.getRelativePath(FILE_PATHS.CONTEXT_FILE),
      planGuide: this.fileSystem.getRelativePath(FILE_PATHS.PLAN_GUIDE_FILE),
      taskGuide: this.fileSystem.getRelativePath(FILE_PATHS.TASK_GUIDE_FILE),
      atlassianRefs: this.fileSystem.getRelativePath(FILE_PATHS.ATLASSIAN_REFS_FILE),
    };
  }

  /**
   * Check if the Atlassian references file exists and get processed URLs
   */
  async getProcessedAtlassianUrls(): Promise<string[]> {
    try {
      const content = await this.fileSystem.read(FILE_PATHS.ATLASSIAN_REFS_FILE);
      return content.split('\n').filter(line => line.trim().length > 0);
    } catch {
      return [];
    }
  }

  /**
   * Add URLs to the Atlassian references file
   */
  async addProcessedAtlassianUrls(urls: string[]): Promise<void> {
    const existingUrls = await this.getProcessedAtlassianUrls();
    const newUrls = urls.filter(url => !existingUrls.includes(url));

    if (newUrls.length > 0) {
      const allUrls = [...existingUrls, ...newUrls];
      await this.fileSystem.write(FILE_PATHS.ATLASSIAN_REFS_FILE, allUrls.join('\n'));
    }
  }

  /**
   * Check if a URL has been processed by the Atlassian integration
   */
  async isAtlassianUrlProcessed(url: string): Promise<boolean> {
    const processedUrls = await this.getProcessedAtlassianUrls();
    return processedUrls.includes(url);
  }

  /**
   * Get file size in bytes
   */
  async getFileSize(filePath: string): Promise<number> {
    try {
      const content = await this.fileSystem.read(filePath);
      return Buffer.byteLength(content, 'utf8');
    } catch {
      return 0;
    }
  }

  /**
   * Count lines in a file
   */
  async countLines(filePath: string): Promise<number> {
    try {
      const content = await this.fileSystem.read(filePath);
      return content.split('\n').length;
    } catch {
      return 0;
    }
  }

  /**
   * Get workflow file statistics
   */
  async getWorkflowStats(): Promise<
    Record<string, { exists: boolean; size: number; lines: number; lastModified: Date | null }>
  > {
    const filePaths = this.getWorkflowFilePaths();
    const stats: Record<
      string,
      { exists: boolean; size: number; lines: number; lastModified: Date | null }
    > = {};

    for (const [key, filePath] of Object.entries(filePaths)) {
      const fullPath = this.fileSystem.resolvePath(filePath);
      const exists = await this.fileSystem.exists(fullPath);

      stats[key] = {
        exists,
        size: exists ? await this.getFileSize(fullPath) : 0,
        lines: exists ? await this.countLines(fullPath) : 0,
        lastModified: exists ? await this.getFileModificationTime(fullPath) : null,
      };
    }

    return stats;
  }

  /**
   * Ensure all base directories exist
   */
  async ensureBaseDirectories(): Promise<void> {
    await this.createBaseDirectories();
  }

  /**
   * Create a manifest file with current workflow state
   */
  async createWorkflowManifest(): Promise<void> {
    const stats = await this.getWorkflowStats();
    const manifest = {
      timestamp: new Date().toISOString(),
      files: stats,
      version: '1.0.0',
    };

    const manifestPath = `${FILE_PATHS.TASK_BASE_DIR}/manifest.json`;
    await this.fileSystem.write(manifestPath, JSON.stringify(manifest, null, 2));
  }
}
