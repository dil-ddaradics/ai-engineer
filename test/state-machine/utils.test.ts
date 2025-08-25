import { ResponseUtils } from '../../src/state-machine/responseUtils.js';
import { TemplateUtils } from '../../src/state-machine/templateUtils.js';
import { PlanUtils } from '../../src/state-machine/planUtils.js';
import { FileUtils } from '../../src/state-machine/fileUtils.js';
import { NodeFileSystem } from '../../src/state-machine/fileSystem.js';
import { StateName } from '../../src/state-machine/types.js';
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

    describe('getResponseType', () => {
      it('should identify blocked responses', () => {
        const type = ResponseUtils.getResponseType('gather_blocked_R');
        expect(type).toBe('blocked');
      });

      it('should identify transition responses', () => {
        const type = ResponseUtils.getResponseType('gather_transitions_G1');
        expect(type).toBe('transition');
      });

      it('should identify noop responses', () => {
        const type = ResponseUtils.getResponseType('gather_noop_L');
        expect(type).toBe('noop');
      });
    });

    describe('isSpellAvailable', () => {
      it('should return true for available spells', () => {
        expect(ResponseUtils.isSpellAvailable('GATHER_NO_PLAN', 'Accio')).toBe(true);
        expect(ResponseUtils.isSpellAvailable('GATHER_NO_PLAN', 'Lumos')).toBe(true);
      });

      it('should return false for unavailable spells', () => {
        expect(ResponseUtils.isSpellAvailable('GATHER_NO_PLAN', 'Reparo')).toBe(false);
        expect(ResponseUtils.isSpellAvailable('GATHER_NO_PLAN', 'Reverto')).toBe(false);
      });

      it('should handle all states', () => {
        const states: StateName[] = [
          'GATHER_NO_PLAN',
          'GATHER_PLAN_DRAFT',
          'ACHIEVE_TASK_DRAFT',
          'ACHIEVE_TASK_EXECUTED',
          'PR_COMMENTS_PLAN',
          'ERROR_NO_PLAN',
        ];

        states.forEach(state => {
          expect(typeof ResponseUtils.isSpellAvailable(state, 'Lumos')).toBe('boolean');
        });
      });
    });

    describe('getStateDescription', () => {
      it('should return description for valid states', () => {
        const description = ResponseUtils.getStateDescription('GATHER_NO_PLAN');
        expect(description).toBe('Initial state - no plan created yet');
      });

      it('should handle unknown states', () => {
        const description = ResponseUtils.getStateDescription('INVALID_STATE' as StateName);
        expect(description).toContain('Unknown state');
      });
    });
  });

  describe('TemplateUtils', () => {
    let templateUtils: TemplateUtils;

    beforeEach(() => {
      templateUtils = new TemplateUtils(fileSystem);
    });

    describe('getTemplate', () => {
      it('should return template content', () => {
        const template = templateUtils.getTemplate('plan');
        expect(template).toContain('# Project Plan');
        expect(template).toContain('## Acceptance Criteria');
      });

      it('should return empty string for non-existent template', () => {
        const template = templateUtils.getTemplate('nonexistent');
        expect(template).toBe('');
      });
    });

    describe('hasTemplate', () => {
      it('should return true for existing templates', () => {
        expect(templateUtils.hasTemplate('plan')).toBe(true);
        expect(templateUtils.hasTemplate('task')).toBe(true);
      });

      it('should return false for non-existent templates', () => {
        expect(templateUtils.hasTemplate('nonexistent')).toBe(false);
      });
    });

    describe('createFileFromTemplate', () => {
      it('should create file from template', async () => {
        await templateUtils.createFileFromTemplate('test-plan.md', 'plan');

        const content = await fileSystem.read('test-plan.md');
        expect(content).toContain('# Project Plan');
      });

      it('should replace placeholders', async () => {
        const replacements = { SUMMARY: 'Test Summary' };
        await templateUtils.createFileFromTemplate('test-plan.md', 'plan', replacements);

        const content = await fileSystem.read('test-plan.md');
        expect(content).toContain('Test Summary');
      });

      it('should throw error for non-existent template', async () => {
        await expect(
          templateUtils.createFileFromTemplate('test.md', 'nonexistent')
        ).rejects.toThrow("Template 'nonexistent' not found");
      });
    });

    describe('getTemplatePlaceholders', () => {
      it('should extract placeholders from template', () => {
        const placeholders = templateUtils.getTemplatePlaceholders('plan');
        expect(Array.isArray(placeholders)).toBe(true);
      });
    });

    describe('specialized file creation methods', () => {
      it('should create plan file', async () => {
        await templateUtils.createPlanFile('plan.md', 'Test Summary', [
          'Criterion 1',
          'Criterion 2',
        ]);

        const content = await fileSystem.read('plan.md');
        expect(content).toContain('Test Summary');
        expect(content).toContain('- [ ] Criterion 1');
        expect(content).toContain('- [ ] Criterion 2');
      });

      it('should create context file', async () => {
        await templateUtils.createContextFile('context.md');

        expect(await fileSystem.exists('context.md')).toBe(true);
      });

      it('should create guide files', async () => {
        await templateUtils.createGuideFiles('guides');

        expect(await fileSystem.exists('guides/plan-guide.md')).toBe(true);
        expect(await fileSystem.exists('guides/task-guide.md')).toBe(true);
      });
    });
  });

  describe('PlanUtils', () => {
    let planUtils: PlanUtils;

    beforeEach(() => {
      planUtils = new PlanUtils(fileSystem);
    });

    beforeEach(async () => {
      // Create a sample plan file for testing
      const planContent = `# Project Plan

## Summary
Test project summary

## Acceptance Criteria
- [ ] First criterion
- [x] Completed criterion  
- [ ] Second criterion

## Technical Approach
Some technical details
`;
      await fileSystem.write('plan.md', planContent);
    });

    describe('parseAcceptanceCriteria', () => {
      it('should parse completed and pending criteria', async () => {
        const criteria = await planUtils.parseAcceptanceCriteria('plan.md');

        expect(criteria.completed).toContain('Completed criterion');
        expect(criteria.pending).toContain('First criterion');
        expect(criteria.pending).toContain('Second criterion');
      });
    });

    describe('areAllAcceptanceCriteriaCompleted', () => {
      it('should return false when pending criteria exist', async () => {
        const allCompleted = await planUtils.areAllAcceptanceCriteriaCompleted('plan.md');
        expect(allCompleted).toBe(false);
      });

      it('should return true when all criteria are completed', async () => {
        const allCompletedPlan = `# Plan
## Acceptance Criteria
- [x] Only criterion
`;
        await fileSystem.write('completed-plan.md', allCompletedPlan);

        const allCompleted = await planUtils.areAllAcceptanceCriteriaCompleted('completed-plan.md');
        expect(allCompleted).toBe(true);
      });
    });

    describe('getNextPendingCriterion', () => {
      it('should return first pending criterion', async () => {
        const next = await planUtils.getNextPendingCriterion('plan.md');
        expect(next).toBe('First criterion');
      });

      it('should return null when no pending criteria', async () => {
        const noPendingPlan = `# Plan
## Acceptance Criteria
- [x] Only criterion
`;
        await fileSystem.write('no-pending.md', noPendingPlan);

        const next = await planUtils.getNextPendingCriterion('no-pending.md');
        expect(next).toBeNull();
      });
    });

    describe('markCriterionAsCompleted', () => {
      it('should mark criterion as completed', async () => {
        await planUtils.markCriterionAsCompleted('plan.md', 'First criterion');

        const criteria = await planUtils.parseAcceptanceCriteria('plan.md');
        expect(criteria.completed).toContain('First criterion');
        expect(criteria.pending).not.toContain('First criterion');
      });
    });

    describe('extractAtlassianUrls', () => {
      it('should extract Atlassian URLs from content', async () => {
        const contentWithUrls = `# Plan
Check https://mycompany.atlassian.net/wiki/page/123
Also see https://mycompany.atlassian.net/browse/PROJ-123
`;
        await fileSystem.write('urls.md', contentWithUrls);

        const urls = await planUtils.extractAtlassianUrls('urls.md');
        expect(urls).toHaveLength(2);
        expect(urls[0]).toContain('atlassian.net');
        expect(urls[1]).toContain('atlassian.net');
      });

      it('should return empty array when no URLs found', async () => {
        const urls = await planUtils.extractAtlassianUrls('plan.md');
        expect(urls).toEqual([]);
      });
    });

    describe('getAcceptanceCriteriaStats', () => {
      it('should return correct statistics', async () => {
        const stats = await planUtils.getAcceptanceCriteriaStats('plan.md');

        expect(stats.total).toBe(3);
        expect(stats.completed).toBe(1);
        expect(stats.pending).toBe(2);
        expect(stats.completionRate).toBeCloseTo(1 / 3);
      });
    });

    describe('validatePlanStructure', () => {
      it('should validate complete plan structure', async () => {
        const validation = await planUtils.validatePlanStructure('plan.md');
        expect(validation.isValid).toBe(true);
        expect(validation.missingElements).toEqual([]);
      });

      it('should identify missing elements', async () => {
        const incompletePlan = `# Plan
Just a title
`;
        await fileSystem.write('incomplete.md', incompletePlan);

        const validation = await planUtils.validatePlanStructure('incomplete.md');
        expect(validation.isValid).toBe(false);
        expect(validation.missingElements.length).toBeGreaterThan(0);
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

        expect(await fileSystem.exists('.ai/task')).toBe(true);
        expect(await fileSystem.exists('.ai/archive')).toBe(true);
      });
    });

    describe('archiveFile', () => {
      it('should archive file with timestamp', async () => {
        await fileSystem.write('test.md', 'content');

        const archivePath = await fileUtils.archiveFile('test.md', 'backup');

        expect(archivePath).toContain('.ai/archive/');
        expect(archivePath).toContain('backup');
        expect(await fileSystem.exists(archivePath)).toBe(true);
        expect(await fileSystem.exists('test.md')).toBe(false);
      });
    });

    describe('readFileSafe', () => {
      it('should read existing file', async () => {
        await fileSystem.write('test.txt', 'content');

        const content = await fileUtils.readFileSafe('test.txt');
        expect(content).toBe('content');
      });

      it('should return empty string for non-existent file', async () => {
        const content = await fileUtils.readFileSafe('nonexistent.txt');
        expect(content).toBe('');
      });
    });

    describe('isFileEmpty', () => {
      it('should return false for file with content', async () => {
        await fileSystem.write('content.txt', 'some content');

        const isEmpty = await fileUtils.isFileEmpty('content.txt');
        expect(isEmpty).toBe(false);
      });

      it('should return true for empty file', async () => {
        await fileSystem.write('empty.txt', '');

        const isEmpty = await fileUtils.isFileEmpty('empty.txt');
        expect(isEmpty).toBe(true);
      });

      it('should return true for non-existent file', async () => {
        const isEmpty = await fileUtils.isFileEmpty('nonexistent.txt');
        expect(isEmpty).toBe(true);
      });
    });

    describe('getWorkflowFilePaths', () => {
      it('should return all workflow file paths', () => {
        const paths = fileUtils.getWorkflowFilePaths();

        expect(paths).toHaveProperty('plan');
        expect(paths).toHaveProperty('task');
        expect(paths).toHaveProperty('taskResults');
        expect(paths).toHaveProperty('comments');
        expect(paths).toHaveProperty('context');
        expect(Object.keys(paths).length).toBeGreaterThan(5);
      });
    });

    describe('checkWorkflowFiles', () => {
      it('should identify missing and existing files', async () => {
        await fileUtils.createBaseDirectories();
        await fileSystem.write('.ai/task/plan.md', 'plan content');

        const check = await fileUtils.checkWorkflowFiles();

        expect(check.existing).toContain('.ai/task/plan.md');
        expect(check.missing.length).toBeGreaterThan(0);
      });
    });

    describe('getWorkflowStats', () => {
      it('should return statistics for all workflow files', async () => {
        await fileUtils.createBaseDirectories();
        await fileSystem.write('.ai/task/plan.md', 'plan content');

        const stats = await fileUtils.getWorkflowStats();

        expect(stats).toHaveProperty('plan');
        expect(stats.plan.exists).toBe(true);
        expect(stats.plan.size).toBeGreaterThan(0);
      });
    });

    describe('Atlassian URL tracking', () => {
      it('should track processed URLs', async () => {
        const urls = ['https://example.atlassian.net/page1', 'https://example.atlassian.net/page2'];

        await fileUtils.addProcessedAtlassianUrls(urls);

        const processedUrls = await fileUtils.getProcessedAtlassianUrls();
        expect(processedUrls).toEqual(urls);

        for (const url of urls) {
          expect(await fileUtils.isAtlassianUrlProcessed(url)).toBe(true);
        }
      });

      it('should not duplicate URLs', async () => {
        const urls = ['https://example.atlassian.net/page1'];

        await fileUtils.addProcessedAtlassianUrls(urls);
        await fileUtils.addProcessedAtlassianUrls(urls); // Add again

        const processedUrls = await fileUtils.getProcessedAtlassianUrls();
        expect(processedUrls).toEqual(urls); // Should not be duplicated
      });
    });
  });
});
