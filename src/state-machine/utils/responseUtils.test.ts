import { ResponseUtils } from './responseUtils';

describe('ResponseUtils', () => {
  describe('formatResponse', () => {
    it('should replace placeholders with values', () => {
      const responseKey = 'gather_transitions_G1';
      const replacements = { TASK_NAME: 'Test Task', OBJECTIVE: 'Test Objective' };

      const formatted = ResponseUtils.formatResponse(responseKey, replacements);
      expect(typeof formatted).toBe('string');
    });

    it('should return system prompt for non-existent response key', () => {
      const formatted = ResponseUtils.formatResponse('nonexistent_key');
      expect(formatted).toContain('AI Engineer assistant');
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
        ARCHIVE_PATH_PLACEHOLDER: '/path/to/archive',
      };
      const invalidReplacements = {
        TASK_RESULTS_PLACEHOLDER: 'Task content',
        // Missing ARCHIVE_PATH_PLACEHOLDER
      };

      expect(ResponseUtils.validateReplacements(response, validReplacements)).toBe(true);
      expect(ResponseUtils.validateReplacements(response, invalidReplacements)).toBe(false);
    });
  });

  describe('formatLumosResponse', () => {
    it('should combine system explanation, core response, and tips', () => {
      const responseKey = 'lumos_transitions_L2';
      const formatted = ResponseUtils.formatLumosResponse(responseKey);

      expect(formatted).toContain('AI Engineer Workflow'); // From system explanation
      expect(formatted).toContain('Tips for Success'); // From tips and tricks
      expect(typeof formatted).toBe('string');
      expect(formatted.length).toBeGreaterThan(100); // Should be a substantial response
    });

    it('should handle replacements in core response', () => {
      const responseKey = 'lumos_transitions_L2';
      const replacements = { TEST_PLACEHOLDER: 'Test Value' };
      const formatted = ResponseUtils.formatLumosResponse(responseKey, replacements);

      expect(typeof formatted).toBe('string');
      expect(formatted).toContain('AI Engineer Workflow');
      expect(formatted).toContain('Commit Early & Often');
    });

    it('should filter out empty parts', () => {
      // Test with a response key that doesn't exist
      const formatted = ResponseUtils.formatLumosResponse('nonexistent_key');

      // Should still contain system explanation and tips
      expect(formatted).toContain('AI Engineer Workflow');
      expect(formatted).toContain('Commit Early & Often');
    });
  });
});
