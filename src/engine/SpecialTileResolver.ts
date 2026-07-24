import { Match3Engine, type MatchShape, type Move, type Position } from './Match3Engine';
import { normalizeObjectivePriority, type ObjectivePriority, type ObjectivePriorityInput } from './ObjectivePriority';
import {
  getSpecialLabel,
  getSpecialPower,
  isRocket,
  type DirectSpecialCombo,
  type SpecialTile,
} from './SpecialTileTypes';

export type SpecialCreation = Readonly<{
  position: Position;
  special: SpecialTile;
}>;

export type SpecialActivation = Readonly<{
  position: Position;
  special: SpecialTile;
}>;

export type SpecialResolutionPlan = Readonly<{
  clearPositions: Position[];
  creations: SpecialCreation[];
  activations: SpecialActivation[];
  directCombo: DirectSpecialCombo | null;
  message: string;
  specialPower: number;
}>;

export function planMatchedResolution(
  engine: Match3Engine,
  move: Move | null,
  objectivePriority: ObjectivePriorityInput,
  allowCreation: boolean,
): SpecialResolutionPlan {
  const groups = engine.findMatchGroups();
  const shapes = engine.findMatchShapes();
  const creations = allowCreation && move
    ? planSpecialCreations(engine, groups, shapes, move)
    : [];
  const protectedKeys = new Set(creations.map(({ position }) => key(position)));
  const clear = new Map<string, Position>();
  for (const group of groups) {
    for (const position of group) {
      if (!protectedKeys.has(key(position))) clear.set(key(position), position);
    }
  }

  const activations = expandTriggeredSpecials(
    engine,
    clear,
    normalizeObjectivePriority(objectivePriority),
    new Set(),
  );
  for (const protectedKey of protectedKeys) clear.delete(protectedKey);

  return {
    clearPositions: sortPositions([...clear.values()]),
    creations,
    activations,
    directCombo: null,
    message: buildResolutionMessage(creations, activations, null),
    specialPower: creations.reduce((sum, creation) => sum + getSpecialPower(creation.special), 0)
      + activations.reduce((sum, activation) => sum + getSpecialPower(activation.special), 0),
  };
}

export function planDirectSpecialResolution(
  engine: Match3Engine,
  first: Position,
  second: Position,
  combo: DirectSpecialCombo,
  objectivePriority: ObjectivePriorityInput,
): SpecialResolutionPlan {
  const clear = new Map<string, Position>();
  const activations: SpecialActivation[] = [];
  const preActivated = new Set<string>();
  const firstSpecial = engine.getSpecial(first);
  const secondSpecial = engine.getSpecial(second);

  const recordParticipant = (position: Position, special: SpecialTile | null): void => {
    if (!special) return;
    activations.push({ position, special });
    preActivated.add(key(position));
    add(clear, engine, position);
  };

  recordParticipant(first, firstSpecial);
  recordParticipant(second, secondSpecial);

  if (combo === 'prism-normal') {
    const prismPosition = firstSpecial?.kind === 'prism' ? first : second;
    const normalPosition = firstSpecial?.kind === 'prism' ? second : first;
    const targetType = engine.board[normalPosition.row][normalPosition.col];
    add(clear, engine, prismPosition);
    forEachPosition(engine, (position) => {
      if (engine.board[position.row][position.col] === targetType) add(clear, engine, position);
    });
  } else if (combo === 'rocket-rocket') {
    addRow(clear, engine, second.row);
    addColumn(clear, engine, second.col);
  } else if (combo === 'rocket-bomb') {
    const bombPosition = firstSpecial?.kind === 'bomb' ? first : second;
    for (let offset = -1; offset <= 1; offset++) {
      addRow(clear, engine, bombPosition.row + offset);
      addColumn(clear, engine, bombPosition.col + offset);
    }
  } else if (combo === 'bomb-bomb') {
    const center = second;
    addArea(clear, engine, center, 2);
  }

  const chained = expandTriggeredSpecials(engine, clear, normalizeObjectivePriority(objectivePriority), preActivated);
  activations.push(...chained);

  return {
    clearPositions: sortPositions([...clear.values()]),
    creations: [],
    activations,
    directCombo: combo,
    message: buildResolutionMessage([], activations, combo),
    specialPower: comboPower(combo)
      + chained.reduce((sum, activation) => sum + getSpecialPower(activation.special), 0),
  };
}

export function applySpecialCreations(
  engine: Match3Engine,
  creations: readonly SpecialCreation[],
): void {
  for (const creation of creations) engine.setSpecial(creation.position, creation.special);
}

export function findCreatedSpecialPositions(
  engine: Match3Engine,
  creations: readonly SpecialCreation[],
): Position[] {
  return creations
    .map(({ special }) => engine.findSpecialPosition(special))
    .filter((position): position is Position => position !== null);
}

function planSpecialCreations(
  engine: Match3Engine,
  groups: readonly Position[][],
  shapes: readonly MatchShape[],
  move: Move,
): SpecialCreation[] {
  const creations: SpecialCreation[] = [];

  for (const group of groups) {
    if (group.some((position) => engine.getSpecial(position))) continue;
    const groupKeys = new Set(group.map(key));
    const groupShapes = shapes.filter((shape) => (
      shape.positions.every((position) => groupKeys.has(key(position)))
    ));
    const lines = groupShapes.filter((shape) => shape.kind === 'line');
    const horizontal = lines.filter((shape) => shape.orientation === 'row');
    const vertical = lines.filter((shape) => shape.orientation === 'column');
    const longLine = lines.find((shape) => shape.positions.length >= 5);
    const square = groupShapes.find((shape) => shape.kind === 'square');
    const fourLine = lines.find((shape) => shape.positions.length >= 4);

    let special: SpecialTile | null = null;
    let preferredShape: MatchShape | null = null;
    let forcedPosition: Position | null = null;

    if (longLine) {
      preferredShape = longLine;
      const position = chooseCreationPosition(engine, longLine.positions, move);
      if (!position) continue;
      special = { kind: 'prism', baseTile: engine.board[position.row][position.col] };
    } else if (horizontal.length > 0 && vertical.length > 0) {
      const intersection = findIntersection(horizontal, vertical);
      forcedPosition = intersection;
      const position = intersection && engine.canHostSpecial(intersection)
        ? intersection
        : chooseCreationPosition(engine, group, move);
      if (!position) continue;
      special = { kind: 'bomb', baseTile: engine.board[position.row][position.col] };
    } else if (square) {
      preferredShape = square;
      const position = chooseCreationPosition(engine, square.positions, move);
      if (!position) continue;
      special = { kind: 'raven', baseTile: engine.board[position.row][position.col] };
    } else if (fourLine) {
      preferredShape = fourLine;
      const position = chooseCreationPosition(engine, fourLine.positions, move);
      if (!position) continue;
      special = {
        kind: 'rocket',
        direction: fourLine.orientation === 'column' ? 'column' : 'row',
        baseTile: engine.board[position.row][position.col],
      };
    }

    if (!special) continue;
    const position = forcedPosition && engine.canHostSpecial(forcedPosition)
      ? forcedPosition
      : chooseCreationPosition(engine, preferredShape?.positions ?? group, move);
    if (position) creations.push({ position, special });
  }

  return creations;
}

function expandTriggeredSpecials(
  engine: Match3Engine,
  clear: Map<string, Position>,
  objectivePriority: ObjectivePriority,
  preActivated: Set<string>,
): SpecialActivation[] {
  const activations: SpecialActivation[] = [];
  const queue: Position[] = [];
  for (const position of clear.values()) {
    if (engine.getSpecial(position) && !preActivated.has(key(position))) queue.push(position);
  }

  while (queue.length > 0) {
    const position = queue.shift()!;
    const positionKey = key(position);
    if (preActivated.has(positionKey)) continue;
    const special = engine.getSpecial(position);
    if (!special) continue;
    preActivated.add(positionKey);
    activations.push({ position, special });

    const before = new Set(clear.keys());
    if (special.kind === 'rocket') {
      if (special.direction === 'row') addRow(clear, engine, position.row);
      else addColumn(clear, engine, position.col);
    } else if (special.kind === 'bomb') {
      addArea(clear, engine, position, 1);
    } else if (special.kind === 'raven') {
      add(clear, engine, position);
      add(clear, engine, { row: position.row - 1, col: position.col });
      add(clear, engine, { row: position.row + 1, col: position.col });
      add(clear, engine, { row: position.row, col: position.col - 1 });
      add(clear, engine, { row: position.row, col: position.col + 1 });
      const target = chooseRavenTarget(engine, clear, objectivePriority);
      if (target) add(clear, engine, target);
    } else if (special.kind === 'prism') {
      forEachPosition(engine, (candidate) => {
        if (engine.board[candidate.row][candidate.col] === special.baseTile) {
          add(clear, engine, candidate);
        }
      });
    }

    for (const [candidateKey, candidate] of clear) {
      if (before.has(candidateKey) || preActivated.has(candidateKey)) continue;
      if (engine.getSpecial(candidate)) queue.push(candidate);
    }
  }

  return activations;
}

function chooseRavenTarget(
  engine: Match3Engine,
  clear: ReadonlyMap<string, Position>,
  objectivePriority: ObjectivePriority,
): Position | null {
  const candidates: Position[] = [];
  forEachPosition(engine, (position) => {
    if (clear.has(key(position))) return;
    if (engine.board[position.row][position.col] < 0 && !engine.getObstacle(position)) return;
    candidates.push(position);
  });
  candidates.sort((first, second) => {
    const score = (position: Position): number => {
      const obstacle = engine.getObstacle(position);
      const obstacleScore = obstacle && objectivePriority.obstacles.some((target) => (
        target.remaining > 0 && target.kind === obstacle.kind
      )) ? 100 : obstacle ? 30 : 0;
      const tile = engine.board[position.row][position.col];
      const collectScore = objectivePriority.collects.some((target) => (
        target.remaining > 0 && target.tileType === tile
      )) ? 60 : 0;
      return obstacleScore + collectScore + Number(Boolean(engine.getSpecial(position))) * 12;
    };
    return score(second) - score(first)
      || first.row - second.row
      || first.col - second.col;
  });
  return candidates[0] ?? null;
}

function chooseCreationPosition(
  engine: Match3Engine,
  positions: readonly Position[],
  move: Move,
): Position | null {
  const eligible = positions.filter((position) => engine.canHostSpecial(position));
  const keys = new Set(eligible.map(key));
  if (keys.has(key(move[1]))) return move[1];
  if (keys.has(key(move[0]))) return move[0];
  return eligible[Math.floor((eligible.length - 1) / 2)] ?? null;
}

function findIntersection(
  horizontal: readonly MatchShape[],
  vertical: readonly MatchShape[],
): Position | null {
  const verticalKeys = new Set(vertical.flatMap((shape) => shape.positions.map(key)));
  return horizontal.flatMap((shape) => shape.positions).find((position) => verticalKeys.has(key(position))) ?? null;
}

function add(
  positions: Map<string, Position>,
  engine: Match3Engine,
  position: Position,
): void {
  if (
    position.row < 0
    || position.col < 0
    || position.row >= engine.size
    || position.col >= engine.size
    || !engine.isActive(position)
  ) return;
  positions.set(key(position), position);
}

function addRow(positions: Map<string, Position>, engine: Match3Engine, row: number): void {
  if (row < 0 || row >= engine.size) return;
  for (let col = 0; col < engine.size; col++) add(positions, engine, { row, col });
}

function addColumn(positions: Map<string, Position>, engine: Match3Engine, col: number): void {
  if (col < 0 || col >= engine.size) return;
  for (let row = 0; row < engine.size; row++) add(positions, engine, { row, col });
}

function addArea(
  positions: Map<string, Position>,
  engine: Match3Engine,
  center: Position,
  radius: number,
): void {
  for (let row = center.row - radius; row <= center.row + radius; row++) {
    for (let col = center.col - radius; col <= center.col + radius; col++) {
      add(positions, engine, { row, col });
    }
  }
}

function forEachPosition(engine: Match3Engine, callback: (position: Position) => void): void {
  for (let row = 0; row < engine.size; row++) {
    for (let col = 0; col < engine.size; col++) callback({ row, col });
  }
}

function buildResolutionMessage(
  creations: readonly SpecialCreation[],
  activations: readonly SpecialActivation[],
  combo: DirectSpecialCombo | null,
): string {
  if (combo === 'rocket-rocket') return 'Двойная ракета · крестовой залп!';
  if (combo === 'rocket-bomb') return 'Ракета + руна · широкий залп!';
  if (combo === 'bomb-bomb') return 'Две руны · большой взрыв!';
  if (combo === 'prism-normal') return 'Лунная призма очищает цвет!';
  if (activations.some(({ special }) => special.kind === 'prism')) return 'Лунная призма!';
  if (activations.some(({ special }) => special.kind === 'bomb')) return 'Взрывная руна!';
  if (activations.some(({ special }) => special.kind === 'rocket')) return 'Ракета очищает линию!';
  if (activations.some(({ special }) => special.kind === 'raven')) return 'Ворон находит цель!';
  if (creations.length > 0) return `Создана: ${getSpecialLabel(creations[0].special)}`;
  return '';
}

function comboPower(combo: DirectSpecialCombo): number {
  switch (combo) {
    case 'prism-normal': return 8;
    case 'rocket-rocket': return 7;
    case 'rocket-bomb': return 10;
    case 'bomb-bomb': return 12;
  }
}

function key(position: Position): string {
  return `${position.row},${position.col}`;
}

function sortPositions(positions: Position[]): Position[] {
  return positions.sort((first, second) => first.row - second.row || first.col - second.col);
}
