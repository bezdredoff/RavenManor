import {
  BOARD_SIZE,
  LEVEL_SCHEMA_VERSION,
  type ClearObstacleObjectiveDefinition,
  type CollectObjectiveDefinition,
  type LevelBoardDefinition,
  type LevelDefinition,
  type LevelDifficulty,
  type LevelObjectiveDefinition,
  type LevelObstacleDefinition,
  type StarThresholds,
} from './levelTypes';
import type { ObstacleKind } from '../engine/ObstacleTypes';

export type LevelValidationIssue = Readonly<{ path: string; message: string }>;
export type LevelValidationOptions = Readonly<{ tileTypeCount: number }>;

export class LevelValidationError extends Error {
  readonly issues: readonly LevelValidationIssue[];
  constructor(issues: readonly LevelValidationIssue[]) {
    super(['Level catalog validation failed:', ...issues.map((issue) => `- ${issue.path}: ${issue.message}`)].join('\n'));
    this.name = 'LevelValidationError';
    this.issues = [...issues];
  }
}

const LEVEL_KEYS = new Set(['schemaVersion','id','title','difficulty','moves','starThresholds','board','objectives']);
const STAR_KEYS = new Set(['twoStarsMovesLeft','threeStarsMovesLeft']);
const BOARD_KEYS = new Set(['mask','obstacles']);
const OBSTACLE_KEYS = new Set(['row','col','kind','layers']);
const COLLECT_KEYS = new Set(['id','type','tileType','target']);
const CLEAR_KEYS = new Set(['id','type','obstacleKind','target']);
const DIFFICULTIES = new Set<LevelDifficulty>(['easy','normal','hard','finale']);
const OBSTACLE_KINDS = new Set<ObstacleKind>(['chain','rubble','fog']);

export function validateLevelCatalog(value: unknown, options: LevelValidationOptions): LevelDefinition[] {
  if (!Number.isInteger(options.tileTypeCount) || options.tileTypeCount < 1) {
    throw new Error('tileTypeCount must be a positive integer');
  }
  if (!Array.isArray(value) || value.length === 0) {
    throw new LevelValidationError([{ path: 'levels', message: 'must be a non-empty array' }]);
  }

  const issues: LevelValidationIssue[] = [];
  const ids = new Set<number>();
  const levels: LevelDefinition[] = [];

  value.forEach((raw, index) => {
    const path = `levels[${index}]`;
    if (!isRecord(raw)) {
      issues.push({ path, message: 'must be an object' });
      return;
    }
    unexpected(raw, LEVEL_KEYS, path, issues);
    const schemaVersion = exactInteger(raw.schemaVersion, LEVEL_SCHEMA_VERSION, `${path}.schemaVersion`, issues);
    const id = integer(raw.id, 1, `${path}.id`, issues);
    const title = nonEmpty(raw.title, `${path}.title`, issues);
    const difficulty = readDifficulty(raw.difficulty, `${path}.difficulty`, issues);
    const moves = integer(raw.moves, 1, `${path}.moves`, issues);
    const starThresholds = readStars(raw.starThresholds, path, moves, issues);
    const board = readBoard(raw.board, path, issues);
    const objectives = readObjectives(raw.objectives, path, options.tileTypeCount, board, issues);

    if (id !== null) {
      if (ids.has(id)) issues.push({ path: `${path}.id`, message: `duplicate level id ${id}` });
      ids.add(id);
    }
    if (schemaVersion !== null && id !== null && title !== null && difficulty !== null && moves !== null && starThresholds && board && objectives) {
      levels.push({ schemaVersion, id, title, difficulty, moves, starThresholds, board, objectives });
    }
  });

  if (issues.length > 0) throw new LevelValidationError(issues);
  return levels;
}

function readStars(value: unknown, levelPath: string, moves: number | null, issues: LevelValidationIssue[]): StarThresholds | null {
  const path = `${levelPath}.starThresholds`;
  if (!isRecord(value)) { issues.push({ path, message: 'must be an object' }); return null; }
  unexpected(value, STAR_KEYS, path, issues);
  const two = integer(value.twoStarsMovesLeft, 0, `${path}.twoStarsMovesLeft`, issues);
  const three = integer(value.threeStarsMovesLeft, 0, `${path}.threeStarsMovesLeft`, issues);
  if (two === null || three === null) return null;
  if (three <= two) issues.push({ path: `${path}.threeStarsMovesLeft`, message: 'must be greater than twoStarsMovesLeft' });
  if (moves !== null && three >= moves) issues.push({ path: `${path}.threeStarsMovesLeft`, message: `must be less than the level move limit ${moves}` });
  return three > two && (moves === null || three < moves) ? { twoStarsMovesLeft: two, threeStarsMovesLeft: three } : null;
}

function readBoard(value: unknown, levelPath: string, issues: LevelValidationIssue[]): LevelBoardDefinition | null {
  const path = `${levelPath}.board`;
  if (!isRecord(value)) { issues.push({ path, message: 'must be an object' }); return null; }
  unexpected(value, BOARD_KEYS, path, issues);
  const mask = value.mask;
  if (!Array.isArray(mask) || mask.length !== BOARD_SIZE || mask.some((row) => typeof row !== 'string' || row.length !== BOARD_SIZE || /[^01]/.test(row))) {
    issues.push({ path: `${path}.mask`, message: `must contain ${BOARD_SIZE} strings of ${BOARD_SIZE} zero/one characters` });
    return null;
  }
  if (mask.every((row) => !row.includes('1'))) issues.push({ path: `${path}.mask`, message: 'must contain at least one active cell' });

  if (!Array.isArray(value.obstacles)) { issues.push({ path: `${path}.obstacles`, message: 'must be an array' }); return null; }
  const occupied = new Set<string>();
  const obstacles: LevelObstacleDefinition[] = [];
  value.obstacles.forEach((raw, index) => {
    const obstaclePath = `${path}.obstacles[${index}]`;
    if (!isRecord(raw)) { issues.push({ path: obstaclePath, message: 'must be an object' }); return; }
    unexpected(raw, OBSTACLE_KEYS, obstaclePath, issues);
    const row = integer(raw.row, 0, `${obstaclePath}.row`, issues, BOARD_SIZE - 1);
    const col = integer(raw.col, 0, `${obstaclePath}.col`, issues, BOARD_SIZE - 1);
    const kind = obstacleKind(raw.kind, `${obstaclePath}.kind`, issues);
    const layers = integer(raw.layers, 1, `${obstaclePath}.layers`, issues, 2);
    if (row === null || col === null || kind === null || layers === null) return;
    const key = `${row},${col}`;
    if (mask[row][col] !== '1') issues.push({ path: obstaclePath, message: 'must be placed on an active mask cell' });
    if (occupied.has(key)) issues.push({ path: obstaclePath, message: `duplicates obstacle position ${key}` });
    occupied.add(key);
    obstacles.push({ row, col, kind, layers: layers as 1 | 2 });
  });
  return { mask: [...mask], obstacles };
}

function readObjectives(value: unknown, levelPath: string, tileTypeCount: number, board: LevelBoardDefinition | null, issues: LevelValidationIssue[]): LevelObjectiveDefinition[] | null {
  const path = `${levelPath}.objectives`;
  if (!Array.isArray(value) || value.length === 0) { issues.push({ path, message: 'must be a non-empty array' }); return null; }
  const ids = new Set<string>();
  const objectives: LevelObjectiveDefinition[] = [];
  value.forEach((raw, index) => {
    const objectivePath = `${path}[${index}]`;
    if (!isRecord(raw)) { issues.push({ path: objectivePath, message: 'must be an object' }); return; }
    const id = nonEmpty(raw.id, `${objectivePath}.id`, issues);
    if (id && ids.has(id)) issues.push({ path: `${objectivePath}.id`, message: `duplicate objective id "${id}" within level` });
    if (id) ids.add(id);
    const target = integer(raw.target, 1, `${objectivePath}.target`, issues);
    if (raw.type === 'collect') {
      unexpected(raw, COLLECT_KEYS, objectivePath, issues);
      const tileType = integer(raw.tileType, 0, `${objectivePath}.tileType`, issues, tileTypeCount - 1);
      if (id && target !== null && tileType !== null) objectives.push({ id, type: 'collect', tileType, target } satisfies CollectObjectiveDefinition);
      return;
    }
    if (raw.type === 'clear-obstacle') {
      unexpected(raw, CLEAR_KEYS, objectivePath, issues);
      const kind = obstacleKind(raw.obstacleKind, `${objectivePath}.obstacleKind`, issues);
      const available = kind && board
        ? board.obstacles.filter((obstacle) => obstacle.kind === kind).length
        : 0;
      if (kind && board && available === 0) {
        issues.push({ path: `${objectivePath}.obstacleKind`, message: `requires at least one ${kind} obstacle on the board` });
      }
      if (kind && target !== null && board && target > available) {
        issues.push({ path: `${objectivePath}.target`, message: `cannot exceed ${available} ${kind} obstacles on the board` });
      }
      if (id && target !== null && kind) objectives.push({ id, type: 'clear-obstacle', obstacleKind: kind, target } satisfies ClearObstacleObjectiveDefinition);
      return;
    }
    issues.push({ path: `${objectivePath}.type`, message: 'must be "collect" or "clear-obstacle"' });
  });
  return objectives;
}

function readDifficulty(value: unknown, path: string, issues: LevelValidationIssue[]): LevelDifficulty | null {
  if (typeof value !== 'string' || !DIFFICULTIES.has(value as LevelDifficulty)) { issues.push({ path, message: 'must be "easy", "normal", "hard", or "finale"' }); return null; }
  return value as LevelDifficulty;
}
function obstacleKind(value: unknown, path: string, issues: LevelValidationIssue[]): ObstacleKind | null {
  if (typeof value !== 'string' || !OBSTACLE_KINDS.has(value as ObstacleKind)) { issues.push({ path, message: 'must be "chain", "rubble", or "fog"' }); return null; }
  return value as ObstacleKind;
}
function exactInteger<T extends number>(value: unknown, expected: T, path: string, issues: LevelValidationIssue[]): T | null {
  if (value !== expected) { issues.push({ path, message: `must equal ${expected}` }); return null; }
  return expected;
}
function integer(value: unknown, minimum: number, path: string, issues: LevelValidationIssue[], maximum?: number): number | null {
  if (typeof value !== 'number' || !Number.isInteger(value)) { issues.push({ path, message: 'must be an integer' }); return null; }
  if (value < minimum) { issues.push({ path, message: `must be greater than or equal to ${minimum}` }); return null; }
  if (maximum !== undefined && value > maximum) { issues.push({ path, message: `must be between ${minimum} and ${maximum}` }); return null; }
  return value;
}
function nonEmpty(value: unknown, path: string, issues: LevelValidationIssue[]): string | null {
  if (typeof value !== 'string' || value.trim().length === 0) { issues.push({ path, message: 'must be a non-empty string' }); return null; }
  return value;
}
function unexpected(record: Record<string, unknown>, allowed: ReadonlySet<string>, path: string, issues: LevelValidationIssue[]): void {
  Object.keys(record).filter((key) => !allowed.has(key)).forEach((key) => issues.push({ path: `${path}.${key}`, message: 'is not allowed by the current schema' }));
}
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
