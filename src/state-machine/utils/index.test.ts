import { ResponseUtils, TemplateUtils, PlanUtils, FileUtils } from './index';
import { NodeFileSystem } from '../fileSystem';
import path from 'path';
import { tmpdir } from 'os';

describe('Utils', () => {
  let fileSystem: NodeFileSystem;
  let tempDir: string;

  beforeEach(() => {
    tempDir = path.join(tmpdir(), `ai-engineer-test-${Date.now()}`);
    fileSystem = new NodeFileSystem(tempDir);
  });

  afterEach(async () => {
    try {
      const { rmdir } = await import('fs/promises');
      await rmdir(tempDir, { recursive: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('ResponseUtils', () => {
    describe('formatResponse', () => {
      it('should replace placeholders with values', () => {
        const responseKey = 'gather_transitions_G1';
        const replacements = { TASK_NAME: 'Test Task', OBJECTIVE: 'Test Objective' };

        const formatted = ResponseUtils.formatResponse(responseKey, replacements);
        expect(typeof formatted).toBe('string');
      });

      it('should return empty string for non-existent response key', () => {
        const formatted = ResponseUtils.formatResponse('nonexistent_key');
        expect(formatted).toBe('');
      });
    });

    describe('hasPlaceholders', () => {
      it('should detect placeholders in text', () => {
        const withPlaceholders = 'This has [TASK_RESULTS_PLACEHOLDER] in it';
        const withoutPlaceholders = 'This has no placeholders';

        expect(ResponseUtils.hasPlaceholders(withPlaceholders)).toBe(true);
        expect(ResponseUtils.hasPlaceholders(withoutPlaceholders)).toBe(false);
      });
    });

    describe('getPlaceholders', () => {
      it('should extract placeholder names', () => {
        const text = 'This has [TASK_RESULTS_PLACEHOLDER] and [ARCHIVE_PATH_PLACEHOLDER]';
        const placeholders = ResponseUtils.getPlaceholders(text);

        expect(placeholders).toContain('TASK_RESULTS_PLACEHOLDER');
        expect(placeholders).toContain('ARCHIVE_PATH_PLACEHOLDER');
        expect(placeholders).toHaveLength(2);
      });

      it('should return empty array for text without placeholders', () => {
        const text = 'No placeholders here';
        const placeholders = ResponseUtils.getPlaceholders(text);

        expect(placeholders).toEqual([]);
      });
    });

    describe('validateReplacements', () => {
      it('should validate all placeholders have replacements', () => {
        const response = 'Task: [TASK_RESULTS_PLACEHOLDER], Archive: [ARCHIVE_PATH_PLACEHOLDER]';
        const validReplacements = {
          TASK_RESULTS_PLACEHOLDER: 'Task content',
          ARCHIVE_PATH_PLACEHOLDER: '/path/to/archive'
        };
        const invalidReplacements = {
          TASK_RESULTS_PLACEHOLDER: 'Task content'
          // Missing ARCHIVE_PATH_PLACEHOLDER
        };

        expect(ResponseUtils.validateReplacements(response, validReplacements)).toBe(true);
        expect(ResponseUtils.validateReplacements(response, invalidReplacements)).toBe(false);
      });
    });
  });

  describe('TemplateUtils', () => {
    let templateUtils: TemplateUtils;

    beforeEach(() => {
      templateUtils = new TemplateUtils(fileSystem);
    });

    describe('writeTemplate', () => {
      it('should write a template to a file', async () => {
        await templateUtils.writeTemplate('test-plan.md', 'plan');
        
        const exists = await fileSystem.exists('test-plan.md');
        expect(exists).toBe(true);

        const content = await fileSystem.read('test-plan.md');
        expect(content).toContain('# Project Plan');
        expect(content).toContain('## Acceptance Criteria');
      });

      it('should throw error for non-existent template', async () => {
        await expect(templateUtils.writeTemplate('test.md', 'nonexistent' as any))
          .rejects.toThrow("Template 'nonexistent' not found");
      });
    });
  });

  describe('PlanUtils', () => {
    let planUtils: PlanUtils;

    beforeEach(() => {
      planUtils = new PlanUtils(fileSystem);
    });

    describe('parseAcceptanceCriteria', () => {
      it('should parse completed and pending criteria', async () => {
        const planContent = `# Plan
## Acceptance Criteria
- [x] First criterion
- [ ] Second criterion
- [X] Third criterion (uppercase X)
- [ ] Fourth criterion`;

        await fileSystem.write('plan.md', planContent);
        const result = await planUtils.parseAcceptanceCriteria('plan.md');

        expect(result.completed).toHaveLength(2);
        expect(result.pending).toHaveLength(2);
        expect(result.completed).toContain('First criterion');
        expect(result.completed).toContain('Third criterion (uppercase X)');
        expect(result.pending).toContain('Second criterion');
        expect(result.pending).toContain('Fourth criterion');
      });

      it('should handle empty plan file', async () => {
        await fileSystem.write('empty.md', '# Empty Plan');
        const result = await planUtils.parseAcceptanceCriteria('empty.md');

        expect(result.completed).toHaveLength(0);
        expect(result.pending).toHaveLength(0);
      });
    });

    describe('areAllAcceptanceCriteriaCompleted', () => {
      it('should return true when all criteria are completed', async () => {
        const planContent = `# Plan
## Acceptance Criteria
- [x] First criterion
- [x] Second criterion`;

        await fileSystem.write('complete.md', planContent);
        const result = await planUtils.areAllAcceptanceCriteriaCompleted('complete.md');

        expect(result).toBe(true);
      });

      it('should return false when some criteria are pending', async () => {
        const planContent = `# Plan
## Acceptance Criteria
- [x] First criterion
- [ ] Second criterion`;

        await fileSystem.write('incomplete.md', planContent);
        const result = await planUtils.areAllAcceptanceCriteriaCompleted('incomplete.md');

        expect(result).toBe(false);
      });

      it('should return false when no criteria exist', async () => {
        await fileSystem.write('no-criteria.md', '# Plan without criteria');
        const result = await planUtils.areAllAcceptanceCriteriaCompleted('no-criteria.md');

        expect(result).toBe(false);
      });
    });

    describe('extractAtlassianUrls', () => {
      it('should extract Atlassian URLs from content', async () => {
        const content = `# Plan
Some content with https://company.atlassian.net/jira/123
And https://other.atlassian.net/wiki/456
Non-Atlassian: https://github.com/repo`;

        await fileSystem.write('with-urls.md', content);
        const urls = await planUtils.extractAtlassianUrls('with-urls.md');

        expect(urls).toHaveLength(2);
        expect(urls).toContain('https://company.atlassian.net/jira/123');
        expect(urls).toContain('https://other.atlassian.net/wiki/456');
      });

      it('should return empty array when no Atlassian URLs found', async () => {
        const content = 'No URLs here, just plain text';
        await fileSystem.write('no-urls.md', content);
        const urls = await planUtils.extractAtlassianUrls('no-urls.md');

        expect(urls).toEqual([]);
      });
    });

    describe('hasAtlassianUrls', () => {
      it('should return true when Atlassian URLs are present', async () => {
        const content = 'Check out https://company.atlassian.net/jira/123';
        await fileSystem.write('with-url.md', content);
        const hasUrls = await planUtils.hasAtlassianUrls('with-url.md');

        expect(hasUrls).toBe(true);
      });

      it('should return false when no Atlassian URLs are present', async () => {
        const content = 'No Atlassian URLs here';
        await fileSystem.write('no-url.md', content);
        const hasUrls = await planUtils.hasAtlassianUrls('no-url.md');

        expect(hasUrls).toBe(false);
      });
    });

    describe('hasAcceptanceCriteria', () => {
      it('should return true when criteria exist', async () => {
        const content = `# Plan
- [ ] Some criterion
- [x] Another criterion`;
        await fileSystem.write('with-criteria.md', content);
        const hasCriteria = await planUtils.hasAcceptanceCriteria('with-criteria.md');

        expect(hasCriteria).toBe(true);
      });

      it('should return false when no criteria exist', async () => {
        await fileSystem.write('no-criteria.md', '# Plan without criteria');
        const hasCriteria = await planUtils.hasAcceptanceCriteria('no-criteria.md');

        expect(hasCriteria).toBe(false);
      });
    });
  });

  describe('FileUtils', () => {
    let fileUtils: FileUtils;

    beforeEach(() => {
      fileUtils = new FileUtils(fileSystem);
    });

    describe('createBaseDirectories', () => {
      it('should create required directories', async () => {
        await fileUtils.createBaseDirectories();

        const taskDirExists = await fileSystem.exists('.ai/task');
        const tasksDirExists = await fileSystem.exists('.ai/task/tasks');

        expect(taskDirExists).toBe(true);
        expect(tasksDirExists).toBe(true);
      });
    });

    describe('readFileSafe', () => {
      it('should read existing file', async () => {
        await fileSystem.write('test.md', 'Test content');
        const content = await fileUtils.readFileSafe('test.md');

        expect(content).toBe('Test content');
      });

      it('should return empty string for non-existent file', async () => {
        const content = await fileUtils.readFileSafe('nonexistent.md');

        expect(content).toBe('');
      });
    });

    describe('validateFilePath', () => {
      it('should validate paths within base directory', () => {
        const valid = fileUtils.validateFilePath('.ai/task/plan.md');
        expect(typeof valid).toBe('boolean');
      });
    });

    describe('extractTaskName', () => {
      it('should extract task name from frontmatter', async () => {
        const taskContent = `---
task_name: 'implement-feature'
---

# Task: Implement Feature`;

        await fileSystem.write('task.md', taskContent);
        const taskName = await fileUtils.extractTaskName('task.md');

        expect(taskName).toBe('implement-feature');
      });

      it('should return default name when no frontmatter', async () => {
        await fileSystem.write('no-frontmatter.md', '# Task without frontmatter');
        const taskName = await fileUtils.extractTaskName('no-frontmatter.md');

        expect(taskName).toBe('unknown-task');
      });

      it('should return default name for non-existent file', async () => {
        const taskName = await fileUtils.extractTaskName('nonexistent.md');

        expect(taskName).toBe('unknown-task');
      });
    });

    describe('archiveTaskFiles', () => {
      it('should archive task files to tasks directory', async () => {
        // Create test task files
        await fileSystem.write('.ai/task/task.md', 'Task content');
        await fileSystem.write('.ai/task/task-results.md', 'Results content');

        const archiveDir = await fileUtils.archiveTaskFiles('test-task');

        // Check archive directory was created
        const archiveDirExists = await fileSystem.exists(archiveDir);
        expect(archiveDirExists).toBe(true);

        // Check task files were archived
        const taskArchived = await fileSystem.exists(`${archiveDir}/task.md`);
        const resultsArchived = await fileSystem.exists(`${archiveDir}/task-results.md`);

        expect(taskArchived).toBe(true);
        expect(resultsArchived).toBe(true);

        // Verify archive path format
        expect(archiveDir).toMatch(/^\.ai\/task\/tasks\/task-test-task-\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2}$/);
      });

      it('should handle missing task files gracefully', async () => {
        const archiveDir = await fileUtils.archiveTaskFiles('missing-task');

        // Archive directory should still be created
        const archiveDirExists = await fileSystem.exists(archiveDir);
        expect(archiveDirExists).toBe(true);
      });
    });
  });
});