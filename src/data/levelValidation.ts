import {
  LEVEL_SCHEMA_VERSION,
  type CollectObjectiveDefinition,
  type LevelDefinition,
} from './levelTypes';

export type LevelValidationIssue = Readonly<{
  path: string;
  message: string;
}>;

export type LevelValidationOptions = Readonly<{
  tileTypeCount: number;
}>;

export class LevelValidationError extends Error {
  readonly issues: readonly LevelValidationIssue[];

  constructor(issues: readonly LevelValidationIssue[]) {
    super([
      'Level catalog validation failed:',
      ...issues.map((issue) => `- ${issue.path}: ${issue.message}`),
    ].join('\n'));

    this.name = 'LevelValidationError';
    this.issues = [...issues];
  }
}

const LEVEL_KEYS = new Set([
  'schemaVersion',
  'id',
  'title',
  'moves',
  'requiredStars',
  'objectives',
]);

const COLLECT_OBJECTIVE_KEYS = new Set([
  'id',
  'type',
  'tileType',
  'target',
]);

/**
 * Validates untrusted JSON before it crosses into gameplay code.
 *
 * The returned definitions are fresh objects, so application code does not
 * keep references to the imported JSON module's mutable values.
 */
export function validateLevelCatalog(
  value: unknown,
  options: LevelValidationOptions,
): LevelDefinition[] {
  assertTileTypeCount(options.tileTypeCount);

  const issues: LevelValidationIssue[] = [];

  if (!Array.isArray(value)) {
    throw new LevelValidationError([
      { path: 'levels', message: 'must be a non-empty array' },
    ]);
  }

  if (value.length === 0) {
    issues.push({ path: 'levels', message: 'must contain at least one level' });
  }

  const seenLevelIds = new Set<number>();
  const validatedLevels: LevelDefinition[] = [];

  value.forEach((rawLevel, levelIndex) => {
    const path = `levels[${levelIndex}]`;

    if (!isRecord(rawLevel)) {
      issues.push({ path, message: 'must be an object' });
      return;
    }

    reportUnexpectedKeys(rawLevel, LEVEL_KEYS, path, issues);

    const schemaVersion = readExactInteger(
      rawLevel.schemaVersion,
      LEVEL_SCHEMA_VERSION,
      `${path}.schemaVersion`,
      issues,
    );
    const id = readInteger(rawLevel.id, 1, `${path}.id`, issues);
    const title = readNonEmptyString(rawLevel.title, `${path}.title`, issues);
    const moves = readInteger(rawLevel.moves, 1, `${path}.moves`, issues);
    const requiredStars = readInteger(
      rawLevel.requiredStars,
      0,
      `${path}.requiredStars`,
      issues,
    );
    const objectives = validateObjectives(
      rawLevel.objectives,
      path,
      options.tileTypeCount,
      issues,
    );

    if (id !== null) {
      if (seenLevelIds.has(id)) {
        issues.push({ path: `${path}.id`, message: `duplicate level id ${id}` });
      } else {
        seenLevelIds.add(id);
      }
    }

    if (
      schemaVersion !== null
      && id !== null
      && title !== null
      && moves !== null
      && requiredStars !== null
      && objectives !== null
    ) {
      validatedLevels.push({
        schemaVersion,
        id,
        title,
        moves,
        requiredStars,
        objectives,
      });
    }
  });

  if (issues.length > 0) {
    throw new LevelValidationError(issues);
  }

  return validatedLevels;
}

function validateObjectives(
  value: unknown,
  levelPath: string,
  tileTypeCount: number,
  issues: LevelValidationIssue[],
): CollectObjectiveDefinition[] | null {
  const path = `${levelPath}.objectives`;

  if (!Array.isArray(value)) {
    issues.push({ path, message: 'must be a non-empty array' });
    return null;
  }

  if (value.length === 0) {
    issues.push({ path, message: 'must contain at least one objective' });
    return null;
  }

  const seenObjectiveIds = new Set<string>();
  const objectives: CollectObjectiveDefinition[] = [];

  value.forEach((rawObjective, objectiveIndex) => {
    const objectivePath = `${path}[${objectiveIndex}]`;

    if (!isRecord(rawObjective)) {
      issues.push({ path: objectivePath, message: 'must be an object' });
      return;
    }

    reportUnexpectedKeys(
      rawObjective,
      COLLECT_OBJECTIVE_KEYS,
      objectivePath,
      issues,
    );

    const id = readNonEmptyString(
      rawObjective.id,
      `${objectivePath}.id`,
      issues,
    );

    if (id !== null) {
      if (seenObjectiveIds.has(id)) {
        issues.push({
          path: `${objectivePath}.id`,
          message: `duplicate objective id "${id}" within level`,
        });
      } else {
        seenObjectiveIds.add(id);
      }
    }

    if (rawObjective.type !== 'collect') {
      issues.push({
        path: `${objectivePath}.type`,
        message: 'must be the supported objective type "collect"',
      });
      return;
    }

    const tileType = readInteger(
      rawObjective.tileType,
      0,
      `${objectivePath}.tileType`,
      issues,
      tileTypeCount - 1,
    );
    const target = readInteger(
      rawObjective.target,
      1,
      `${objectivePath}.target`,
      issues,
    );

    if (id !== null && tileType !== null && target !== null) {
      objectives.push({
        id,
        type: 'collect',
        tileType,
        target,
      });
    }
  });

  return objectives;
}

function readExactInteger<T extends number>(
  value: unknown,
  expected: T,
  path: string,
  issues: LevelValidationIssue[],
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
  issues: LevelValidationIssue[],
  maximum?: number,
): number | null {
  if (typeof value !== 'number' || !Number.isInteger(value)) {
    issues.push({ path, message: 'must be an integer' });
    return null;
  }

  const integer = value as number;

  if (integer < minimum) {
    issues.push({ path, message: `must be greater than or equal to ${minimum}` });
    return null;
  }

  if (maximum !== undefined && integer > maximum) {
    issues.push({
      path,
      message: `must be between ${minimum} and ${maximum}`,
    });
    return null;
  }

  return integer;
}

function readNonEmptyString(
  value: unknown,
  path: string,
  issues: LevelValidationIssue[],
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
  issues: LevelValidationIssue[],
): void {
  for (const key of Object.keys(record)) {
    if (!allowedKeys.has(key)) {
      issues.push({
        path: `${path}.${key}`,
        message: 'is not allowed by the current schema',
      });
    }
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function assertTileTypeCount(tileTypeCount: number): void {
  if (!Number.isInteger(tileTypeCount) || tileTypeCount < 1) {
    throw new Error('tileTypeCount must be a positive integer');
  }
}
