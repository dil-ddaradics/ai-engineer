import { promises as fs } from 'fs';
import path from 'path';
import { FileSystem } from './types.js';

/**
 * Node.js file system implementation
 * Provides file operations with proper error handling and directory creation
 */
export class NodeFileSystem implements FileSystem {
  constructor(private readonly baseDirectory: string = process.cwd()) {}

  async exists(filePath: string): Promise<boolean> {
    try {
      const fullPath = this.resolvePath(filePath);
      await fs.access(fullPath);
      return true;
    } catch {
      return false;
    }
  }

  async read(filePath: string): Promise<string> {
    try {
      const fullPath = this.resolvePath(filePath);
      return await fs.readFile(fullPath, 'utf-8');
    } catch (error) {
      throw new Error(
        `Failed to read file '${filePath}': ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async write(filePath: string, content: string): Promise<void> {
    try {
      const fullPath = this.resolvePath(filePath);

      // Ensure parent directory exists
      const parentDir = path.dirname(fullPath);
      await this.createDirectory(parentDir);

      await fs.writeFile(fullPath, content, 'utf-8');
    } catch (error) {
      throw new Error(
        `Failed to write file '${filePath}': ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async delete(filePath: string): Promise<void> {
    try {
      const fullPath = this.resolvePath(filePath);

      if (await this.exists(filePath)) {
        await fs.unlink(fullPath);
      }
    } catch (error) {
      throw new Error(
        `Failed to delete file '${filePath}': ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async archive(sourcePath: string, destinationPath: string): Promise<void> {
    try {
      const fullSourcePath = this.resolvePath(sourcePath);
      const fullDestPath = this.resolvePath(destinationPath);

      if (!(await this.exists(sourcePath))) {
        throw new Error(`Source file '${sourcePath}' does not exist`);
      }

      // Ensure destination directory exists
      const destDir = path.dirname(fullDestPath);
      await this.createDirectory(destDir);

      // Copy the file
      await fs.copyFile(fullSourcePath, fullDestPath);

      // Delete the original
      await fs.unlink(fullSourcePath);
    } catch (error) {
      throw new Error(
        `Failed to archive file from '${sourcePath}' to '${destinationPath}': ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async createDirectory(dirPath: string): Promise<void> {
    try {
      const fullPath = this.resolvePath(dirPath);
      await fs.mkdir(fullPath, { recursive: true });
    } catch (error) {
      throw new Error(
        `Failed to create directory '${dirPath}': ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async listFiles(directory: string): Promise<string[]> {
    try {
      const fullPath = this.resolvePath(directory);

      if (!(await this.exists(directory))) {
        return [];
      }

      const entries = await fs.readdir(fullPath, { withFileTypes: true });
      return entries.filter(entry => entry.isFile()).map(entry => entry.name);
    } catch (error) {
      throw new Error(
        `Failed to list files in directory '${directory}': ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  resolvePath(...segments: string[]): string {
    return path.resolve(this.baseDirectory, ...segments);
  }

  /**
   * Get the base directory for this file system
   */
  getBaseDirectory(): string {
    return this.baseDirectory;
  }

  /**
   * Generate a unique archive filename with timestamp
   */
  generateArchiveFilename(originalPath: string, timestamp?: Date): string {
    const now = timestamp || new Date();
    const dateStr = now.toISOString().replace(/[:.]/g, '-').split('T')[0];
    const timeStr = now.toISOString().replace(/[:.]/g, '-').split('T')[1].split('.')[0];

    const parsedPath = path.parse(originalPath);
    const baseName = parsedPath.name;
    const extension = parsedPath.ext;

    return `${baseName}-${dateStr}-${timeStr}${extension}`;
  }

  /**
   * Check if a path is relative to the base directory
   */
  isWithinBaseDirectory(filePath: string): boolean {
    const fullPath = this.resolvePath(filePath);
    const relativePath = path.relative(this.baseDirectory, fullPath);
    return !relativePath.startsWith('..') && !path.isAbsolute(relativePath);
  }

  /**
   * Get relative path from base directory
   */
  getRelativePath(filePath: string): string {
    const fullPath = this.resolvePath(filePath);
    return path.relative(this.baseDirectory, fullPath);
  }

  /**
   * Safely read a file with fallback to empty string
   */
  async readSafe(filePath: string, fallback: string = ''): Promise<string> {
    try {
      return await this.read(filePath);
    } catch {
      return fallback;
    }
  }

  /**
   * Write file atomically (write to temp file first, then rename)
   */
  async writeAtomic(filePath: string, content: string): Promise<void> {
    const fullPath = this.resolvePath(filePath);
    const tempPath = `${fullPath}.tmp`;

    try {
      // Ensure parent directory exists
      const parentDir = path.dirname(fullPath);
      await this.createDirectory(parentDir);

      // Write to temporary file
      await fs.writeFile(tempPath, content, 'utf-8');

      // Atomically rename to final file
      await fs.rename(tempPath, fullPath);
    } catch (error) {
      // Clean up temp file if it exists
      try {
        await fs.unlink(tempPath);
      } catch {
        // Ignore cleanup errors
      }

      throw new Error(
        `Failed to write file atomically '${filePath}': ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
}
