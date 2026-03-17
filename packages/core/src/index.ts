// Types
export type * from './types/index.js';

// Validation
export { validateIR, isValidIR } from './validation/index.js';
export type { ValidationResult, ValidationIssue, Severity } from './validation/index.js';

// Tree utilities
export {
  getChildren,
  isContainer,
  walkTree,
  walkDocument,
  findById,
  findByType,
  findByComponent,
  countNodes,
  maxDepth,
  mapTree,
  filterTree,
  collapseWrappers,
  removeEmptyContainers,
  serializeIR,
  parseIR,
  createDocument,
} from './tree/index.js';

// Token resolver
export {
  resolveToken,
  resolveAllTokens,
  generateCssTokens,
  generateSwiftTokens,
  generateComposeTokens,
  isKnownToken,
  getAllTokenRefs,
} from './resolver/index.js';
