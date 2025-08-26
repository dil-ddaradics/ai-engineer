import { FileSystem } from '../types';

/**
 * Mock file system implementation for testing
 * Provides in-memory simulation of file operations
 */
export class MockFileSystem implements FileSystem {
  private files: Map<string, string> = new Map();
  private directories: Set<string> = new Set();

  async exists(path: string): Promise<boolean> {
    return this.files.has(path);
  }

  async read(path: string): Promise<string> {
    const content = this.files.get(path);
    if (content === undefined) {
      throw new Error(`File not found: ${path}`);
    }
    return content;
  }

  async readSafe(path: string): Promise<string> {
    return this.files.get(path) || '';
  }

  async write(path: string, content: string): Promise<void> {
    this.files.set(path, content);
  }

  async delete(path: string): Promise<void> {
    this.files.delete(path);
  }

  async createDirectory(path: string): Promise<void> {
    this.directories.add(path);
  }

  async listFiles(directory: string): Promise<string[]> {
    return Array.from(this.files.keys()).filter(path => path.startsWith(directory));
  }

  getBaseDirectory(): string {
    return '/test';
  }

  getRelativePath(_path: string): string {
    return _path;
  }

  isWithinBaseDirectory(_path: string): boolean {
    return true;
  }

  validateFilePath(_path: string): boolean {
    return true;
  }

  resolvePath(...segments: string[]): string {
    return segments.join('/');
  }

  /**
   * Test utility methods
   */
  clear(): void {
    this.files.clear();
    this.directories.clear();
  }

  getFiles(): Map<string, string> {
    return new Map(this.files);
  }

  getDirectories(): Set<string> {
    return new Set(this.directories);
  }
}
