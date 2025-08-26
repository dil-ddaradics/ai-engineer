import { promises as fs } from 'fs';
import path from 'path';
import { FileSystem } from './types';

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
   * Safe read that returns empty string if file doesn't exist
   */
  async readSafe(filePath: string): Promise<string> {
    try {
      return await this.read(filePath);
    } catch {
      return '';
    }
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
   * Alias for isWithinBaseDirectory for clarity
   */
  validateFilePath(filePath: string): boolean {
    return this.isWithinBaseDirectory(filePath);
  }

  /**
   * Get relative path from base directory
   */
  getRelativePath(filePath: string): string {
    const fullPath = this.resolvePath(filePath);
    return path.relative(this.baseDirectory, fullPath);
  }
}
