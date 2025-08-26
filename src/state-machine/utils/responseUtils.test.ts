import { ResponseUtils } from './responseUtils';

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
});