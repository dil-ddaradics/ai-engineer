import { TemplateUtils } from './templateUtils';
import { NodeFileSystem } from '../fileSystem';
import path from 'path';
import { tmpdir } from 'os';

describe('TemplateUtils', () => {
  let fileSystem: NodeFileSystem;
  let tempDir: string;
  let templateUtils: TemplateUtils;

  beforeEach(() => {
    tempDir = path.join(tmpdir(), `ai-engineer-test-${Date.now()}`);
    fileSystem = new NodeFileSystem(tempDir);
    templateUtils = new TemplateUtils(fileSystem);
  });

  afterEach(async () => {
    try {
      const { rmdir } = await import('fs/promises');
      await rmdir(tempDir, { recursive: true });
    } catch {
      // Ignore cleanup errors
    }
  });

  describe('writeTemplate', () => {
    it('should write a template to a file', async () => {
      await templateUtils.writeTemplate('plan');

      const exists = await fileSystem.exists('.ai/task/plan.md');
      expect(exists).toBe(true);

      const content = await fileSystem.read('.ai/task/plan.md');
      expect(content).toContain('# Project Plan');
      expect(content).toContain('## Acceptance Criteria');
    });

    it('should throw error for non-existent template', async () => {
      await expect(templateUtils.writeTemplate('nonexistent' as any)).rejects.toThrow(
        "Template 'nonexistent' not found"
      );
    });
  });
});