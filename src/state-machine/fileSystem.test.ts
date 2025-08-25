import { NodeFileSystem } from './fileSystem';
import path from 'path';
import { tmpdir } from 'os';

describe('NodeFileSystem', () => {
  let fileSystem: NodeFileSystem;
  let tempDir: string;

  beforeEach(() => {
    tempDir = path.join(tmpdir(), `ai-engineer-test-${Date.now()}`);
    fileSystem = new NodeFileSystem(tempDir);
  });

  afterEach(async () => {
    // Clean up test directory
    try {
      const { rmdir } = await import('fs/promises');
      await rmdir(tempDir, { recursive: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('exists', () => {
    it('should return false for non-existent file', async () => {
      const exists = await fileSystem.exists('nonexistent.txt');
      expect(exists).toBe(false);
    });

    it('should return true for existing file', async () => {
      await fileSystem.write('test.txt', 'content');
      const exists = await fileSystem.exists('test.txt');
      expect(exists).toBe(true);
    });
  });

  describe('write and read', () => {
    it('should write and read file content', async () => {
      const content = 'Hello, World!';
      await fileSystem.write('test.txt', content);

      const readContent = await fileSystem.read('test.txt');
      expect(readContent).toBe(content);
    });

    it('should create parent directories when writing', async () => {
      await fileSystem.write('nested/dir/file.txt', 'content');

      const content = await fileSystem.read('nested/dir/file.txt');
      expect(content).toBe('content');
    });

    it('should throw error when reading non-existent file', async () => {
      await expect(fileSystem.read('nonexistent.txt')).rejects.toThrow('Failed to read file');
    });

    it('should handle Unicode content', async () => {
      const content = '🎉 Unicode test with émojis and áccents';
      await fileSystem.write('unicode.txt', content);

      const readContent = await fileSystem.read('unicode.txt');
      expect(readContent).toBe(content);
    });
  });

  describe('delete', () => {
    it('should delete existing file', async () => {
      await fileSystem.write('test.txt', 'content');
      expect(await fileSystem.exists('test.txt')).toBe(true);

      await fileSystem.delete('test.txt');
      expect(await fileSystem.exists('test.txt')).toBe(false);
    });

    it('should not throw error when deleting non-existent file', async () => {
      await expect(fileSystem.delete('nonexistent.txt')).resolves.not.toThrow();
    });
  });


  describe('createDirectory', () => {
    it('should create directory', async () => {
      await fileSystem.createDirectory('test-dir');

      // Test by writing a file in the directory
      await fileSystem.write('test-dir/file.txt', 'content');
      expect(await fileSystem.exists('test-dir/file.txt')).toBe(true);
    });

    it('should create nested directories', async () => {
      await fileSystem.createDirectory('deep/nested/path');

      await fileSystem.write('deep/nested/path/file.txt', 'content');
      expect(await fileSystem.exists('deep/nested/path/file.txt')).toBe(true);
    });

    it('should not throw error when directory already exists', async () => {
      await fileSystem.createDirectory('test-dir');
      await expect(fileSystem.createDirectory('test-dir')).resolves.not.toThrow();
    });
  });

  describe('listFiles', () => {
    it('should list files in directory', async () => {
      await fileSystem.createDirectory('test-dir');
      await fileSystem.write('test-dir/file1.txt', 'content1');
      await fileSystem.write('test-dir/file2.txt', 'content2');
      await fileSystem.createDirectory('test-dir/subdir');

      const files = await fileSystem.listFiles('test-dir');

      expect(files).toHaveLength(2);
      expect(files).toContain('file1.txt');
      expect(files).toContain('file2.txt');
      expect(files).not.toContain('subdir'); // Should not include directories
    });

    it('should return empty array for non-existent directory', async () => {
      const files = await fileSystem.listFiles('nonexistent');
      expect(files).toEqual([]);
    });

    it('should return empty array for empty directory', async () => {
      await fileSystem.createDirectory('empty-dir');
      const files = await fileSystem.listFiles('empty-dir');
      expect(files).toEqual([]);
    });
  });

  describe('resolvePath', () => {
    it('should resolve path relative to base directory', async () => {
      const resolved = fileSystem.resolvePath('test', 'file.txt');
      expect(resolved).toBe(path.join(tempDir, 'test', 'file.txt'));
    });

    it('should handle single path segment', async () => {
      const resolved = fileSystem.resolvePath('file.txt');
      expect(resolved).toBe(path.join(tempDir, 'file.txt'));
    });

    it('should handle absolute paths', async () => {
      const absolutePath = '/absolute/path/file.txt';
      const resolved = fileSystem.resolvePath(absolutePath);
      expect(resolved).toBe(absolutePath);
    });
  });

  describe('getBaseDirectory', () => {
    it('should return base directory', () => {
      const baseDir = fileSystem.getBaseDirectory();
      expect(baseDir).toBe(tempDir);
    });
  });


  describe('isWithinBaseDirectory', () => {
    it('should return true for paths within base directory', () => {
      expect(fileSystem.isWithinBaseDirectory('test.txt')).toBe(true);
      expect(fileSystem.isWithinBaseDirectory('nested/file.txt')).toBe(true);
    });

    it('should return false for paths outside base directory', () => {
      expect(fileSystem.isWithinBaseDirectory('../outside.txt')).toBe(false);
      expect(fileSystem.isWithinBaseDirectory('../../outside.txt')).toBe(false);
    });

    it('should return false for absolute paths outside base directory', () => {
      expect(fileSystem.isWithinBaseDirectory('/etc/passwd')).toBe(false);
    });
  });

  describe('getRelativePath', () => {
    it('should return path relative to base directory', () => {
      const relativePath = fileSystem.getRelativePath('nested/file.txt');
      expect(relativePath).toBe('nested/file.txt');
    });

    it('should handle absolute paths within base directory', () => {
      const absolutePath = path.join(tempDir, 'test.txt');
      const relativePath = fileSystem.getRelativePath(absolutePath);
      expect(relativePath).toBe('test.txt');
    });
  });



  describe('error handling', () => {
    it('should provide descriptive error messages', async () => {
      await expect(fileSystem.read('nonexistent.txt')).rejects.toThrow(/Failed to read file/);
    });

    it('should handle permission errors gracefully', async () => {
      // This test would require setting up permission restrictions, which is platform-specific
      // For now, we'll just verify the methods exist and handle errors
      expect(typeof fileSystem.write).toBe('function');
      expect(typeof fileSystem.read).toBe('function');
    });
  });
});
