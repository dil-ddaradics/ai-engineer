/* eslint-env jest */
import { TaskUtils } from './taskUtils';
import { FileSystem, FILE_PATHS } from '../types';

// Mock FileSystem
const mockFileSystem: jest.Mocked<FileSystem> = {
  exists: jest.fn(),
  read: jest.fn(),
  readSafe: jest.fn(),
  write: jest.fn(),
  delete: jest.fn(),
  createDirectory: jest.fn(),
  listFiles: jest.fn(),
  getBaseDirectory: jest.fn(),
  getRelativePath: jest.fn(),
  isWithinBaseDirectory: jest.fn(),
  validateFilePath: jest.fn(),
  resolvePath: jest.fn(),
};

describe('TaskUtils', () => {
  let taskUtils: TaskUtils;

  beforeEach(() => {
    jest.clearAllMocks();
    taskUtils = new TaskUtils(mockFileSystem);

    // Mock Date for consistent timestamps
    jest.spyOn(Date.prototype, 'toISOString').mockReturnValue('2025-01-15T14:30:45.123Z');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('archiveTask', () => {
    it('should archive both task.md and task-results.md when both exist', async () => {
      // Arrange
      mockFileSystem.exists.mockResolvedValue(true);
      const taskContent = "---\ntask_name: 'user-authentication'\n---\n# Task content";
      const resultsContent = '# Task results content';

      mockFileSystem.read
        .mockResolvedValueOnce(taskContent) // for extractTaskName
        .mockResolvedValueOnce(taskContent) // for archiving task.md
        .mockResolvedValueOnce(resultsContent); // for archiving task-results.md

      // Act
      const result = await taskUtils.archiveTask();

      // Assert
      expect(result).toBe('.ai/task/tasks/task-user-authentication-2025-01-15-143045');
      expect(mockFileSystem.createDirectory).toHaveBeenCalledWith(
        '.ai/task/tasks/task-user-authentication-2025-01-15-143045'
      );
      expect(mockFileSystem.write).toHaveBeenCalledWith(
        '.ai/task/tasks/task-user-authentication-2025-01-15-143045/task.md',
        taskContent
      );
      expect(mockFileSystem.write).toHaveBeenCalledWith(
        '.ai/task/tasks/task-user-authentication-2025-01-15-143045/task-results.md',
        resultsContent
      );
      expect(mockFileSystem.delete).toHaveBeenCalledWith(FILE_PATHS.TASK_FILE);
      expect(mockFileSystem.delete).toHaveBeenCalledWith(FILE_PATHS.TASK_RESULTS_FILE);
    });

    it('should gracefully handle missing task-results.md (incomplete tasks)', async () => {
      // Arrange
      const taskContent = "---\ntask_name: 'incomplete-task'\n---\n# Task content";

      mockFileSystem.exists.mockImplementation(path =>
        Promise.resolve(path === FILE_PATHS.TASK_FILE)
      );
      mockFileSystem.read
        .mockResolvedValueOnce(taskContent) // for extractTaskName
        .mockResolvedValueOnce(taskContent); // for archiving task.md

      // Act
      const result = await taskUtils.archiveTask();

      // Assert
      expect(result).toBe('.ai/task/tasks/task-incomplete-task-2025-01-15-143045');
      expect(mockFileSystem.write).toHaveBeenCalledTimes(1);
      expect(mockFileSystem.write).toHaveBeenCalledWith(
        '.ai/task/tasks/task-incomplete-task-2025-01-15-143045/task.md',
        taskContent
      );
      expect(mockFileSystem.delete).toHaveBeenCalledTimes(1);
      expect(mockFileSystem.delete).toHaveBeenCalledWith(FILE_PATHS.TASK_FILE);
    });

    it('should use extracted task name from frontmatter', async () => {
      // Arrange
      mockFileSystem.exists.mockResolvedValue(true);
      mockFileSystem.read
        .mockResolvedValueOnce("---\ntask_name: 'custom-task-name'\n---\n# Content") // for extractTaskName
        .mockResolvedValueOnce("---\ntask_name: 'custom-task-name'\n---\n# Content") // for archiving task.md
        .mockResolvedValueOnce('# Content'); // for archiving task-results.md

      // Act
      await taskUtils.archiveTask();

      // Assert
      expect(mockFileSystem.createDirectory).toHaveBeenCalledWith(
        '.ai/task/tasks/task-custom-task-name-2025-01-15-143045'
      );
    });

    it('should handle file system errors gracefully', async () => {
      // Arrange
      mockFileSystem.read.mockResolvedValueOnce("---\ntask_name: 'error-task'\n---\n# Content"); // for extractTaskName
      mockFileSystem.exists.mockRejectedValue(new Error('File system error'));

      // Act & Assert - should not throw
      const result = await taskUtils.archiveTask();
      expect(result).toBe('.ai/task/tasks/task-error-task-2025-01-15-143045');
    });
  });

  describe('archiveReviewTask', () => {
    it('should archive all review files when they exist', async () => {
      // Arrange
      mockFileSystem.exists.mockResolvedValue(true);
      mockFileSystem.read
        .mockResolvedValueOnce('# Comments content')
        .mockResolvedValueOnce('# Review task content')
        .mockResolvedValueOnce('# Review results content');

      // Act
      const result = await taskUtils.archiveReviewTask();

      // Assert
      expect(result).toBe('pr-reviews/pr-review-2025-01-15-143045');
      expect(mockFileSystem.createDirectory).toHaveBeenCalledWith(
        'pr-reviews/pr-review-2025-01-15-143045'
      );
      expect(mockFileSystem.write).toHaveBeenCalledWith(
        'pr-reviews/pr-review-2025-01-15-143045/comments.md',
        '# Comments content'
      );
      expect(mockFileSystem.write).toHaveBeenCalledWith(
        'pr-reviews/pr-review-2025-01-15-143045/review-task.md',
        '# Review task content'
      );
      expect(mockFileSystem.write).toHaveBeenCalledWith(
        'pr-reviews/pr-review-2025-01-15-143045/review-task-results.md',
        '# Review results content'
      );
      expect(mockFileSystem.delete).toHaveBeenCalledTimes(3);
    });

    it('should handle missing review files gracefully', async () => {
      // Arrange
      mockFileSystem.exists.mockImplementation(path =>
        Promise.resolve(path === FILE_PATHS.COMMENTS_FILE)
      );
      mockFileSystem.read.mockResolvedValue('# Comments content');

      // Act
      const result = await taskUtils.archiveReviewTask();

      // Assert
      expect(result).toBe('pr-reviews/pr-review-2025-01-15-143045');
      expect(mockFileSystem.write).toHaveBeenCalledTimes(1);
      expect(mockFileSystem.write).toHaveBeenCalledWith(
        'pr-reviews/pr-review-2025-01-15-143045/comments.md',
        '# Comments content'
      );
      expect(mockFileSystem.delete).toHaveBeenCalledTimes(1);
    });

    it('should use correct date-based naming format', async () => {
      // Arrange
      mockFileSystem.exists.mockResolvedValue(false);

      // Act
      const result = await taskUtils.archiveReviewTask();

      // Assert
      expect(result).toBe('pr-reviews/pr-review-2025-01-15-143045');
      expect(mockFileSystem.createDirectory).toHaveBeenCalledWith(
        'pr-reviews/pr-review-2025-01-15-143045'
      );
    });
  });

  describe('createBaseDirectories', () => {
    it('should create all base directories for AI Engineer workflow', async () => {
      // Act
      await taskUtils.createBaseDirectories();

      // Assert
      expect(mockFileSystem.createDirectory).toHaveBeenCalledWith(FILE_PATHS.TASK_BASE_DIR);
      expect(mockFileSystem.createDirectory).toHaveBeenCalledWith('.ai/task/tasks');
      expect(mockFileSystem.createDirectory).toHaveBeenCalledWith('pr-reviews');
      expect(mockFileSystem.createDirectory).toHaveBeenCalledTimes(3);
    });
  });

  describe('timestamp formatting', () => {
    it('should format timestamps consistently', async () => {
      // Test multiple calls to ensure consistent formatting
      mockFileSystem.read.mockResolvedValue("---\ntask_name: 'test-task'\n---\n# Content");
      mockFileSystem.exists.mockResolvedValue(false);

      const result1 = await taskUtils.archiveTask();
      const result2 = await taskUtils.archiveReviewTask();

      expect(result1).toContain('2025-01-15-143045');
      expect(result2).toContain('2025-01-15-143045');
    });
  });

  describe('error handling', () => {
    it('should handle extractTaskName errors gracefully', async () => {
      // Arrange
      mockFileSystem.read.mockRejectedValue(new Error('Cannot extract task name'));
      mockFileSystem.exists.mockResolvedValue(false);

      // Act
      const result = await taskUtils.archiveTask();

      // Assert - should use 'unknown-task' fallback and not throw
      expect(result).toBe('.ai/task/tasks/task-unknown-task-2025-01-15-143045');
    });

    it('should handle directory creation errors', async () => {
      // Arrange
      mockFileSystem.read.mockResolvedValue("---\ntask_name: 'test-task'\n---\n# Content");
      mockFileSystem.createDirectory.mockRejectedValue(new Error('Cannot create directory'));

      // Act & Assert
      await expect(taskUtils.archiveTask()).rejects.toThrow('Cannot create directory');
    });

    it('should silently ignore file read/write/delete errors in tryArchiveFile', async () => {
      // Arrange
      mockFileSystem.createDirectory.mockResolvedValue(undefined); // Directory creation succeeds
      mockFileSystem.exists.mockResolvedValue(true);
      mockFileSystem.read
        .mockResolvedValueOnce("---\ntask_name: 'test-task'\n---\n# Content") // for extractTaskName
        .mockRejectedValue(new Error('Cannot read file')); // for archiving files

      // Act & Assert - should not throw
      const result = await taskUtils.archiveTask();
      expect(result).toBe('.ai/task/tasks/task-test-task-2025-01-15-143045');
    });
  });

  describe('extractTaskName', () => {
    it('should extract task name from frontmatter', async () => {
      // Arrange
      const taskContent = `---
task_name: 'implement-feature'
---

# Task: Implement Feature`;
      mockFileSystem.read.mockResolvedValue(taskContent);

      // Act
      const taskName = await taskUtils.extractTaskName('task.md');

      // Assert
      expect(taskName).toBe('implement-feature');
    });

    it('should return default name when no frontmatter', async () => {
      // Arrange
      mockFileSystem.read.mockResolvedValue('# Task without frontmatter');

      // Act
      const taskName = await taskUtils.extractTaskName('no-frontmatter.md');

      // Assert
      expect(taskName).toBe('unknown-task');
    });

    it('should return default name for non-existent file', async () => {
      // Arrange
      mockFileSystem.read.mockRejectedValue(new Error('File not found'));

      // Act
      const taskName = await taskUtils.extractTaskName('nonexistent.md');

      // Assert
      expect(taskName).toBe('unknown-task');
    });
  });
});
