import {
  LEVEL_GROUP_SCHEMA_VERSION,
  type LevelGroupDefinition,
  type LevelGroupUnlockRule,
} from './levelGroupTypes';
import type { LevelDefinition } from './levelTypes';

export type LevelGroupValidationIssue = Readonly<{
  path: string;
  message: string;
}>;

export class LevelGroupValidationError extends Error {
  readonly issues: readonly LevelGroupValidationIssue[];

  constructor(issues: readonly LevelGroupValidationIssue[]) {
    super([
      'Level group validation failed:',
      ...issues.map((issue) => `- ${issue.path}: ${issue.message}`),
    ].join('\n'));
    this.name = 'LevelGroupValidationError';
    this.issues = [...issues];
  }
}

const GROUP_KEYS = new Set([
  'schemaVersion',
  'id',
  'title',
  'description',
  'levelIds',
  'unlock',
]);
const ALWAYS_UNLOCK_KEYS = new Set(['type']);
const GROUP_UNLOCK_KEYS = new Set(['type', 'groupId', 'count']);

export function validateLevelGroups(
  value: unknown,
  levels: readonly LevelDefinition[],
): LevelGroupDefinition[] {
  const issues: LevelGroupValidationIssue[] = [];
  if (!Array.isArray(value)) {
    throw new LevelGroupValidationError([
      { path: 'levelGroups', message: 'must be a non-empty array' },
    ]);
  }
  if (value.length === 0) {
    issues.push({ path: 'levelGroups', message: 'must contain at least one group' });
  }

  const levelIds = new Set(levels.map((level) => level.id));
  const assignedLevelIds = new Set<number>();
  const seenGroupIds = new Set<string>();
  const groups: LevelGroupDefinition[] = [];

  value.forEach((rawGroup, index) => {
    const path = `levelGroups[${index}]`;
    if (!isRecord(rawGroup)) {
      issues.push({ path, message: 'must be an object' });
      return;
    }
    reportUnexpectedKeys(rawGroup, GROUP_KEYS, path, issues);

    const schemaVersion = readExactInteger(
      rawGroup.schemaVersion,
      LEVEL_GROUP_SCHEMA_VERSION,
      `${path}.schemaVersion`,
      issues,
    );
    const id = readNonEmptyString(rawGroup.id, `${path}.id`, issues);
    const title = readNonEmptyString(rawGroup.title, `${path}.title`, issues);
    const description = readNonEmptyString(
      rawGroup.description,
      `${path}.description`,
      issues,
    );
    const groupLevelIds = readLevelIds(
      rawGroup.levelIds,
      path,
      levelIds,
      assignedLevelIds,
      issues,
    );
    const unlock = readUnlockRule(
      rawGroup.unlock,
      path,
      groups,
      issues,
    );

    if (id !== null) {
      if (seenGroupIds.has(id)) {
        issues.push({ path: `${path}.id`, message: `duplicate group id "${id}"` });
      } else {
        seenGroupIds.add(id);
      }
    }

    if (
      schemaVersion !== null
      && id !== null
      && title !== null
      && description !== null
      && groupLevelIds !== null
      && unlock !== null
    ) {
      groups.push({
        schemaVersion,
        id,
        title,
        description,
        levelIds: groupLevelIds,
        unlock,
      });
    }
  });

  for (const level of levels) {
    if (!assignedLevelIds.has(level.id)) {
      issues.push({
        path: 'levelGroups',
        message: `level ${level.id} is not assigned to any progression group`,
      });
    }
  }

  if (issues.length > 0) throw new LevelGroupValidationError(issues);
  return groups;
}

function readLevelIds(
  value: unknown,
  groupPath: string,
  knownLevelIds: ReadonlySet<number>,
  assignedLevelIds: Set<number>,
  issues: LevelGroupValidationIssue[],
): number[] | null {
  const path = `${groupPath}.levelIds`;
  if (!Array.isArray(value) || value.length === 0) {
    issues.push({ path, message: 'must be a non-empty array' });
    return null;
  }

  const result: number[] = [];
  const localIds = new Set<number>();
  value.forEach((rawId, index) => {
    const itemPath = `${path}[${index}]`;
    if (typeof rawId !== 'number' || !Number.isInteger(rawId) || rawId < 1) {
      issues.push({ path: itemPath, message: 'must be a positive integer' });
      return;
    }
    if (!knownLevelIds.has(rawId)) {
      issues.push({ path: itemPath, message: `references unknown level ${rawId}` });
      return;
    }
    if (localIds.has(rawId)) {
      issues.push({ path: itemPath, message: `duplicate level id ${rawId} within group` });
      return;
    }
    if (assignedLevelIds.has(rawId)) {
      issues.push({ path: itemPath, message: `level ${rawId} is assigned to more than one group` });
      return;
    }
    localIds.add(rawId);
    assignedLevelIds.add(rawId);
    result.push(rawId);
  });
  return result;
}

function readUnlockRule(
  value: unknown,
  groupPath: string,
  validatedGroups: readonly LevelGroupDefinition[],
  issues: LevelGroupValidationIssue[],
): LevelGroupUnlockRule | null {
  const path = `${groupPath}.unlock`;
  if (!isRecord(value)) {
    issues.push({ path, message: 'must be an object' });
    return null;
  }

  if (value.type === 'always') {
    reportUnexpectedKeys(value, ALWAYS_UNLOCK_KEYS, path, issues);
    return { type: 'always' };
  }

  if (value.type !== 'complete-in-group') {
    issues.push({ path: `${path}.type`, message: 'must be "always" or "complete-in-group"' });
    return null;
  }

  reportUnexpectedKeys(value, GROUP_UNLOCK_KEYS, path, issues);
  const groupId = readNonEmptyString(value.groupId, `${path}.groupId`, issues);
  const count = readInteger(value.count, 1, `${path}.count`, issues);
  if (groupId === null || count === null) return null;

  const sourceGroup = validatedGroups.find((group) => group.id === groupId);
  if (!sourceGroup) {
    issues.push({
      path: `${path}.groupId`,
      message: `must reference an earlier group, received "${groupId}"`,
    });
    return null;
  }
  if (count > sourceGroup.levelIds.length) {
    issues.push({
      path: `${path}.count`,
      message: `cannot exceed source group size ${sourceGroup.levelIds.length}`,
    });
    return null;
  }
  return { type: 'complete-in-group', groupId, count };
}

function readExactInteger<T extends number>(
  value: unknown,
  expected: T,
  path: string,
  issues: LevelGroupValidationIssue[],
): T | null {
  if (typeof value !== 'number' || !Number.isInteger(value) || value !== expected) {
    issues.push({ path, message: `must equal ${expected}` });
    return null;
  }
  return expected;
}

function readInteger(
  value: unknown,
  minimum: number,
  path: string,
  issues: LevelGroupValidationIssue[],
): number | null {
  if (typeof value !== 'number' || !Number.isInteger(value)) {
    issues.push({ path, message: 'must be an integer' });
    return null;
  }
  if (value < minimum) {
    issues.push({ path, message: `must be greater than or equal to ${minimum}` });
    return null;
  }
  return value;
}

function readNonEmptyString(
  value: unknown,
  path: string,
  issues: LevelGroupValidationIssue[],
): string | null {
  if (typeof value !== 'string' || value.trim().length === 0) {
    issues.push({ path, message: 'must be a non-empty string' });
    return null;
  }
  return value;
}

function reportUnexpectedKeys(
  record: Record<string, unknown>,
  allowedKeys: ReadonlySet<string>,
  path: string,
  issues: LevelGroupValidationIssue[],
): void {
  for (const key of Object.keys(record)) {
    if (!allowedKeys.has(key)) {
      issues.push({ path: `${path}.${key}`, message: 'is not allowed by the current schema' });
    }
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
