import {
  ab1Transition,
  ab2Transition,
  ab2bTransition,
  ab2cTransition,
  ab3Transition,
  ab3bTransition,
  ab3cTransition,
  achieveAcceptanceCriteriaBlocked,
} from './achieveAcceptanceCriteriaBlocked';
import { MockFileSystem } from '../../testUtils';
import { StateContext } from '../../types';
import { ResponseUtils } from '../../utils/responseUtils';

describe('Achieve Acceptance Criteria Blocked Transitions', () => {
  let mockFileSystem: MockFileSystem;
  let mockContext: StateContext;

  beforeEach(() => {
    mockFileSystem = new MockFileSystem();
    mockContext = { currentState: 'ACHIEVE_TASK_DRAFTING' };
  });

  describe('AB1 - ACHIEVE_TASK_EXECUTED + Finite -> [BLOCKED]', () => {
    it('should be defined with correct properties', () => {
      expect(ab1Transition).toBeDefined();
      expect(ab1Transition.fromState).toBe('ACHIEVE_TASK_EXECUTED');
      expect(ab1Transition.spell).toBe('Finite');
      expect(ab1Transition.toState).toBe('ACHIEVE_TASK_EXECUTED');
      expect(ab1Transition.condition).toBeUndefined();
      expect(ab1Transition.execute).toBeDefined();
    });

    it('should have no condition property (blocked transitions are always truthy)', () => {
      expect(ab1Transition.condition).toBeUndefined();
    });

    it('should execute and return blocked response', async () => {
      const result = await ab1Transition.execute(mockContext, mockFileSystem);

      expect(result.message).toBe(ResponseUtils.formatResponse('achieve_blocked_AB1'));
    });

    it('should not perform any file operations during execution', async () => {
      const initialFileCount = (await mockFileSystem.listFiles('')).length;

      await ab1Transition.execute(mockContext, mockFileSystem);

      const finalFileCount = (await mockFileSystem.listFiles('')).length;
      expect(finalFileCount).toBe(initialFileCount);
    });
  });

  describe('AB2 - ACHIEVE_TASK_DRAFTING + Reverto -> [BLOCKED]', () => {
    it('should be defined with correct properties', () => {
      expect(ab2Transition).toBeDefined();
      expect(ab2Transition.fromState).toBe('ACHIEVE_TASK_DRAFTING');
      expect(ab2Transition.spell).toBe('Reverto');
      expect(ab2Transition.toState).toBe('ACHIEVE_TASK_DRAFTING');
      expect(ab2Transition.condition).toBeUndefined();
      expect(ab2Transition.execute).toBeDefined();
    });

    it('should have no condition property (blocked transitions are always truthy)', () => {
      expect(ab2Transition.condition).toBeUndefined();
    });

    it('should execute and return blocked response', async () => {
      const result = await ab2Transition.execute(mockContext, mockFileSystem);

      expect(result.message).toBe(ResponseUtils.formatResponse('achieve_blocked_AB2'));
    });
  });

  describe('AB2b - ACHIEVE_TASK_EXECUTED + Reverto -> [BLOCKED]', () => {
    it('should be defined with correct properties', () => {
      expect(ab2bTransition).toBeDefined();
      expect(ab2bTransition.fromState).toBe('ACHIEVE_TASK_EXECUTED');
      expect(ab2bTransition.spell).toBe('Reverto');
      expect(ab2bTransition.toState).toBe('ACHIEVE_TASK_EXECUTED');
    });

    it('should execute and return blocked response', async () => {
      const result = await ab2bTransition.execute(mockContext, mockFileSystem);

      expect(result.message).toBe(ResponseUtils.formatResponse('achieve_blocked_AB2'));
    });
  });

  describe('AB2c - ACHIEVE_COMPLETE + Reverto -> [BLOCKED]', () => {
    it('should be defined with correct properties', () => {
      expect(ab2cTransition).toBeDefined();
      expect(ab2cTransition.fromState).toBe('ACHIEVE_COMPLETE');
      expect(ab2cTransition.spell).toBe('Reverto');
      expect(ab2cTransition.toState).toBe('ACHIEVE_COMPLETE');
    });

    it('should execute and return blocked response', async () => {
      const result = await ab2cTransition.execute(mockContext, mockFileSystem);

      expect(result.message).toBe(ResponseUtils.formatResponse('achieve_blocked_AB2'));
    });
  });

  describe('AB3 - ACHIEVE_TASK_DRAFTING + Expecto -> [BLOCKED]', () => {
    it('should be defined with correct properties', () => {
      expect(ab3Transition).toBeDefined();
      expect(ab3Transition.fromState).toBe('ACHIEVE_TASK_DRAFTING');
      expect(ab3Transition.spell).toBe('Expecto');
      expect(ab3Transition.toState).toBe('ACHIEVE_TASK_DRAFTING');
    });

    it('should execute and return blocked response', async () => {
      const result = await ab3Transition.execute(mockContext, mockFileSystem);

      expect(result.message).toBe(ResponseUtils.formatResponse('achieve_blocked_AB3'));
    });
  });

  describe('AB3b - ACHIEVE_TASK_EXECUTED + Expecto -> [BLOCKED]', () => {
    it('should be defined with correct properties', () => {
      expect(ab3bTransition).toBeDefined();
      expect(ab3bTransition.fromState).toBe('ACHIEVE_TASK_EXECUTED');
      expect(ab3bTransition.spell).toBe('Expecto');
      expect(ab3bTransition.toState).toBe('ACHIEVE_TASK_EXECUTED');
    });

    it('should execute and return blocked response', async () => {
      const result = await ab3bTransition.execute(mockContext, mockFileSystem);

      expect(result.message).toBe(ResponseUtils.formatResponse('achieve_blocked_AB3'));
    });
  });

  describe('AB3c - ACHIEVE_COMPLETE + Expecto -> [BLOCKED]', () => {
    it('should be defined with correct properties', () => {
      expect(ab3cTransition).toBeDefined();
      expect(ab3cTransition.fromState).toBe('ACHIEVE_COMPLETE');
      expect(ab3cTransition.spell).toBe('Expecto');
      expect(ab3cTransition.toState).toBe('ACHIEVE_COMPLETE');
    });

    it('should execute and return blocked response', async () => {
      const result = await ab3cTransition.execute(mockContext, mockFileSystem);

      expect(result.message).toBe(ResponseUtils.formatResponse('achieve_blocked_AB3'));
    });
  });

  it('should have all transitions defined in array', () => {
    expect(achieveAcceptanceCriteriaBlocked).toBeDefined();
    expect(achieveAcceptanceCriteriaBlocked.length).toBe(7);
    expect(achieveAcceptanceCriteriaBlocked).toContain(ab1Transition);
    expect(achieveAcceptanceCriteriaBlocked).toContain(ab2Transition);
    expect(achieveAcceptanceCriteriaBlocked).toContain(ab2bTransition);
    expect(achieveAcceptanceCriteriaBlocked).toContain(ab2cTransition);
    expect(achieveAcceptanceCriteriaBlocked).toContain(ab3Transition);
    expect(achieveAcceptanceCriteriaBlocked).toContain(ab3bTransition);
    expect(achieveAcceptanceCriteriaBlocked).toContain(ab3cTransition);
  });
});
