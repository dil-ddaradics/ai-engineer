import { TaskUtils } from './taskUtils';
import { FileSystem, FILE_PATHS } from '../types';

// Mock FileSystem
const mockFileSystem: jest.Mocked<FileSystem> = {
  exists: jest.fn(),
  read: jest.fn(),
  write: jest.fn(),
  delete: jest.fn(),
  createDirectory: jest.fn(),
  listFiles: jest.fn(),
  getBaseDirectory: jest.fn(),
  getRelativePath: jest.fn(),
  isWithinBaseDirectory: jest.fn(),
  resolvePath: jest.fn(),
};

// Mock FileUtils
const mockFileUtils = {
  extractTaskName: jest.fn(),
  archiveTaskFiles: jest.fn(),
  createBaseDirectories: jest.fn(),
  readFileSafe: jest.fn(),
  validateFilePath: jest.fn(),
} as any;

describe('TaskUtils', () => {
  let taskUtils: TaskUtils;

  beforeEach(() => {
    jest.clearAllMocks();
    taskUtils = new TaskUtils(mockFileSystem, mockFileUtils);
    
    // Mock Date for consistent timestamps
    jest.spyOn(Date.prototype, 'toISOString').mockReturnValue('2025-01-15T14:30:45.123Z');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('archiveTask', () => {
    it('should archive both task.md and task-results.md when both exist', async () => {
      // Arrange
      mockFileUtils.extractTaskName.mockResolvedValue('user-authentication');
      mockFileSystem.exists.mockResolvedValue(true);
      mockFileSystem.read
        .mockResolvedValueOnce('# Task content')
        .mockResolvedValueOnce('# Task results content');

      // Act
      const result = await taskUtils.archiveTask();

      // Assert
      expect(result).toBe('.ai/task/tasks/task-user-authentication-2025-01-15-143045');
      expect(mockFileSystem.createDirectory).toHaveBeenCalledWith('.ai/task/tasks/task-user-authentication-2025-01-15-143045');
      expect(mockFileSystem.write).toHaveBeenCalledWith('.ai/task/tasks/task-user-authentication-2025-01-15-143045/task.md', '# Task content');
      expect(mockFileSystem.write).toHaveBeenCalledWith('.ai/task/tasks/task-user-authentication-2025-01-15-143045/task-results.md', '# Task results content');
      expect(mockFileSystem.delete).toHaveBeenCalledWith(FILE_PATHS.TASK_FILE);
      expect(mockFileSystem.delete).toHaveBeenCalledWith(FILE_PATHS.TASK_RESULTS_FILE);
    });

    it('should gracefully handle missing task-results.md (incomplete tasks)', async () => {
      // Arrange
      mockFileUtils.extractTaskName.mockResolvedValue('incomplete-task');
      mockFileSystem.exists
        .mockImplementation((path) => Promise.resolve(path === FILE_PATHS.TASK_FILE));
      mockFileSystem.read.mockResolvedValue('# Task content');

      // Act
      const result = await taskUtils.archiveTask();

      // Assert
      expect(result).toBe('.ai/task/tasks/task-incomplete-task-2025-01-15-143045');
      expect(mockFileSystem.write).toHaveBeenCalledTimes(1);
      expect(mockFileSystem.write).toHaveBeenCalledWith('.ai/task/tasks/task-incomplete-task-2025-01-15-143045/task.md', '# Task content');
      expect(mockFileSystem.delete).toHaveBeenCalledTimes(1);
      expect(mockFileSystem.delete).toHaveBeenCalledWith(FILE_PATHS.TASK_FILE);
    });

    it('should use extracted task name from frontmatter', async () => {
      // Arrange
      mockFileUtils.extractTaskName.mockResolvedValue('custom-task-name');
      mockFileSystem.exists.mockResolvedValue(true);
      mockFileSystem.read.mockResolvedValue('# Content');

      // Act
      await taskUtils.archiveTask();

      // Assert
      expect(mockFileUtils.extractTaskName).toHaveBeenCalledWith(FILE_PATHS.TASK_FILE);
      expect(mockFileSystem.createDirectory).toHaveBeenCalledWith('.ai/task/tasks/task-custom-task-name-2025-01-15-143045');
    });

    it('should handle file system errors gracefully', async () => {
      // Arrange
      mockFileUtils.extractTaskName.mockResolvedValue('error-task');
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
      expect(mockFileSystem.createDirectory).toHaveBeenCalledWith('pr-reviews/pr-review-2025-01-15-143045');
      expect(mockFileSystem.write).toHaveBeenCalledWith('pr-reviews/pr-review-2025-01-15-143045/comments.md', '# Comments content');
      expect(mockFileSystem.write).toHaveBeenCalledWith('pr-reviews/pr-review-2025-01-15-143045/review-task.md', '# Review task content');
      expect(mockFileSystem.write).toHaveBeenCalledWith('pr-reviews/pr-review-2025-01-15-143045/review-task-results.md', '# Review results content');
      expect(mockFileSystem.delete).toHaveBeenCalledTimes(3);
    });

    it('should handle missing review files gracefully', async () => {
      // Arrange
      mockFileSystem.exists
        .mockImplementation((path) => Promise.resolve(path === FILE_PATHS.COMMENTS_FILE));
      mockFileSystem.read.mockResolvedValue('# Comments content');

      // Act
      const result = await taskUtils.archiveReviewTask();

      // Assert
      expect(result).toBe('pr-reviews/pr-review-2025-01-15-143045');
      expect(mockFileSystem.write).toHaveBeenCalledTimes(1);
      expect(mockFileSystem.write).toHaveBeenCalledWith('pr-reviews/pr-review-2025-01-15-143045/comments.md', '# Comments content');
      expect(mockFileSystem.delete).toHaveBeenCalledTimes(1);
    });

    it('should use correct date-based naming format', async () => {
      // Arrange
      mockFileSystem.exists.mockResolvedValue(false);

      // Act
      const result = await taskUtils.archiveReviewTask();

      // Assert
      expect(result).toBe('pr-reviews/pr-review-2025-01-15-143045');
      expect(mockFileSystem.createDirectory).toHaveBeenCalledWith('pr-reviews/pr-review-2025-01-15-143045');
    });
  });

  describe('createArchiveDirectories', () => {
    it('should create both task and review archive directories', async () => {
      // Act
      await taskUtils.createArchiveDirectories();

      // Assert
      expect(mockFileSystem.createDirectory).toHaveBeenCalledWith('.ai/task/tasks');
      expect(mockFileSystem.createDirectory).toHaveBeenCalledWith('pr-reviews');
      expect(mockFileSystem.createDirectory).toHaveBeenCalledTimes(2);
    });
  });

  describe('timestamp formatting', () => {
    it('should format timestamps consistently', async () => {
      // Test multiple calls to ensure consistent formatting
      mockFileUtils.extractTaskName.mockResolvedValue('test-task');
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
      mockFileUtils.extractTaskName.mockRejectedValue(new Error('Cannot extract task name'));
      mockFileSystem.exists.mockResolvedValue(false);

      // Act & Assert - should not throw
      await expect(taskUtils.archiveTask()).rejects.toThrow('Cannot extract task name');
    });

    it('should handle directory creation errors', async () => {
      // Arrange
      mockFileUtils.extractTaskName.mockResolvedValue('test-task');
      mockFileSystem.createDirectory.mockRejectedValue(new Error('Cannot create directory'));

      // Act & Assert
      await expect(taskUtils.archiveTask()).rejects.toThrow('Cannot create directory');
    });

    it('should silently ignore file read/write/delete errors in tryArchiveFile', async () => {
      // Arrange
      mockFileUtils.extractTaskName.mockResolvedValue('test-task');
      mockFileSystem.createDirectory.mockResolvedValue(undefined); // Directory creation succeeds
      mockFileSystem.exists.mockResolvedValue(true);
      mockFileSystem.read.mockRejectedValue(new Error('Cannot read file'));

      // Act & Assert - should not throw
      const result = await taskUtils.archiveTask();
      expect(result).toBe('.ai/task/tasks/task-test-task-2025-01-15-143045');
    });
  });
});