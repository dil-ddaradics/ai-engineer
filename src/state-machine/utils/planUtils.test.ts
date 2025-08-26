import { PlanUtils } from './planUtils';
import { NodeFileSystem } from '../fileSystem';
import path from 'path';
import { tmpdir } from 'os';

describe('PlanUtils', () => {
  let fileSystem: NodeFileSystem;
  let tempDir: string;
  let planUtils: PlanUtils;

  beforeEach(() => {
    tempDir = path.join(tmpdir(), `ai-engineer-test-${Date.now()}`);
    fileSystem = new NodeFileSystem(tempDir);
    planUtils = new PlanUtils(fileSystem);
  });

  afterEach(async () => {
    try {
      const { rmdir } = await import('fs/promises');
      await rmdir(tempDir, { recursive: true });
    } catch {
      // Ignore cleanup errors
    }
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