import { Transition } from '../types';

// Context/Gather Phase Transitions
import { contextGatheringTransitions } from './contextGather/contextGatheringTransitions';
import { contextGatheringBlocked } from './contextGather/contextGatheringBlocked';
import { contextGatheringNoop } from './contextGather/contextGatheringNoop';
import { gatherAcceptanceCriteriaTransitions } from './contextGather/gatherAcceptanceCriteriaTransitions';
import { gatherAcceptanceCriteriaBlocked } from './contextGather/gatherAcceptanceCriteriaBlocked';
import { gatherAcceptanceCriteriaNoop } from './contextGather/gatherAcceptanceCriteriaNoop';

// Achieve Phase Transitions  
import { achieveAcceptanceCriteriaTransitions } from './achieve/achieveAcceptanceCriteriaTransitions';
import { achieveAcceptanceCriteriaBlocked } from './achieve/achieveAcceptanceCriteriaBlocked';

// PR Review Transitions
import { prReviewTransitions } from './prReview/prReviewTransitions';
import { startingPrReviewTransitions } from './prReview/startingPrReviewTransitions';
import { prReviewConfirmationTransitions } from './prReview/prReviewConfirmationTransitions';
import { prReviewBlocked } from './prReview/prReviewBlocked';

// Error State Transitions
import { errorStateRecoveryTransitions } from './errorState/errorStateRecoveryTransitions';
import { errorStateOtherTransitions } from './errorState/errorStateOtherTransitions';

// Universal Transitions
import { finiteTransitions } from './universal/finiteTransitions';
import { finiteBlocked } from './universal/finiteBlocked';
import { revertoTransitions } from './universal/revertoTransitions';
import { lumosTransitions } from './universal/lumosTransitions';
import { expectoTransitions } from './universal/expectoTransitions';

/**
 * Default transitions for the AI Engineer state machine
 * Combines all 19 transition categories into a single array
 * Each array corresponds to a specific transition table in state-machine.md
 */
export const DEFAULT_TRANSITIONS: Transition[] = [
  // Context/Gather Phase Transitions
  ...contextGatheringTransitions,
  ...contextGatheringBlocked,
  ...contextGatheringNoop,
  ...gatherAcceptanceCriteriaTransitions,
  ...gatherAcceptanceCriteriaBlocked,
  ...gatherAcceptanceCriteriaNoop,
  
  // Achieve Phase Transitions
  ...achieveAcceptanceCriteriaTransitions,
  ...achieveAcceptanceCriteriaBlocked,
  
  // PR Review Transitions
  ...prReviewTransitions,
  ...startingPrReviewTransitions,
  ...prReviewConfirmationTransitions,
  ...prReviewBlocked,
  
  // Error State Transitions
  ...errorStateRecoveryTransitions,
  ...errorStateOtherTransitions,
  
  // Universal Transitions
  ...finiteTransitions,
  ...finiteBlocked,
  ...revertoTransitions,
  ...lumosTransitions,
  ...expectoTransitions,
];

// Re-export individual transition arrays for testing and modularity
export {
  // Context/Gather Phase Transitions
  contextGatheringTransitions,
  contextGatheringBlocked,
  contextGatheringNoop,
  gatherAcceptanceCriteriaTransitions,
  gatherAcceptanceCriteriaBlocked,
  gatherAcceptanceCriteriaNoop,
  
  // Achieve Phase Transitions
  achieveAcceptanceCriteriaTransitions,
  achieveAcceptanceCriteriaBlocked,
  
  // PR Review Transitions
  prReviewTransitions,
  startingPrReviewTransitions,
  prReviewConfirmationTransitions,
  prReviewBlocked,
  
  // Error State Transitions
  errorStateRecoveryTransitions,
  errorStateOtherTransitions,
  
  // Universal Transitions
  finiteTransitions,
  finiteBlocked,
  revertoTransitions,
  lumosTransitions,
  expectoTransitions,
};
