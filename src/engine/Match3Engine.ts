import {
  getDirectSpecialCombo,
  type DirectSpecialCombo,
  type SpecialTile,
} from './SpecialTileTypes';
import {
  type Obstacle,
  type ObstacleKind,
  type ObstaclePlacement,
} from './ObstacleTypes';

export type Position = { row: number; col: number };
export type Move = readonly [Position, Position];

export type MatchShape = Readonly<{
  kind: 'line' | 'square';
  orientation?: 'row' | 'column';
  positions: Position[];
}>;

export type Match3BoardSetup = Readonly<{
  mask?: readonly string[];
  obstacles?: readonly ObstaclePlacement[];
}>;

export type ObstacleDamage = Readonly<{
  position: Position;
  kind: ObstacleKind;
  remainingLayers: number;
  cleared: boolean;
}>;

export type ClearResult = Readonly<{
  removedTileTypes: number[];
  obstacleDamage: ObstacleDamage[];
  clearedObstacleKinds: ObstacleKind[];
}>;

type Cell = Readonly<{ tile: number; special: SpecialTile | null }>;

export class Match3Engine {
  private static readonly MAX_RESHUFFLE_ATTEMPTS = 2_000;
  private static readonly MAX_GENERATION_ATTEMPTS = 400;

  readonly size: number;
  readonly tileTypeCount: number;
  board: number[][];
  specials: (SpecialTile | null)[][];
  activeMask: boolean[][];
  obstacles: (Obstacle | null)[][];

  constructor(
    size = 8,
    tileTypeCount = 6,
    generateInitialBoard = true,
    setup: Match3BoardSetup = {},
  ) {
    this.size = setup.mask?.length ?? size;
    this.tileTypeCount = tileTypeCount;
    this.activeMask = this.createMask(setup.mask);
    this.board = this.createEmptyBoard();
    this.specials = this.createSpecialGrid();
    this.obstacles = this.createObstacleGrid(setup.obstacles ?? []);
    if (generateInitialBoard) this.generateBoard();
  }

  static fromBoard(
    board: readonly (readonly number[])[],
    tileTypeCount: number,
    specials?: readonly (readonly (SpecialTile | null)[])[],
    activeMask?: readonly (readonly boolean[])[],
    obstacles?: readonly (readonly (Obstacle | null)[])[],
  ): Match3Engine {
    const size = board.length;
    if (size === 0 || board.some((row) => row.length !== size)) {
      throw new Error('Match3Engine board must be a non-empty square matrix.');
    }
    if (specials && (specials.length !== size || specials.some((row) => row.length !== size))) {
      throw new Error('Match3Engine specials must match the board dimensions.');
    }
    if (activeMask && (activeMask.length !== size || activeMask.some((row) => row.length !== size))) {
      throw new Error('Match3Engine active mask must match the board dimensions.');
    }
    if (obstacles && (obstacles.length !== size || obstacles.some((row) => row.length !== size))) {
      throw new Error('Match3Engine obstacles must match the board dimensions.');
    }

    const mask = activeMask
      ? activeMask.map((row) => row.map((active) => active ? '1' : '0').join(''))
      : undefined;
    const engine = new Match3Engine(size, tileTypeCount, false, { mask });
    engine.board = board.map((row, rowIndex) => row.map((tile, colIndex) => (
      engine.activeMask[rowIndex][colIndex] ? tile : -2
    )));
    engine.specials = specials
      ? specials.map((row) => row.map((special) => special ? { ...special } : null))
      : engine.createSpecialGrid();
    engine.obstacles = obstacles
      ? obstacles.map((row) => row.map((obstacle) => obstacle ? { ...obstacle } : null))
      : engine.createObstacleGrid([]);
    return engine;
  }

  static fromSetup(setup: Match3BoardSetup, tileTypeCount = 6): Match3Engine {
    return new Match3Engine(setup.mask?.length ?? 8, tileTypeCount, true, setup);
  }

  generateBoard(): void {
    for (let attempt = 0; attempt < Match3Engine.MAX_GENERATION_ATTEMPTS; attempt++) {
      this.board = this.createEmptyBoard();
      this.specials = this.createSpecialGrid();

      for (let row = 0; row < this.size; row++) {
        for (let col = 0; col < this.size; col++) {
          if (!this.activeMask[row][col]) continue;
          const obstacle = this.obstacles[row][col];
          if (obstacle?.kind === 'rubble') {
            this.board[row][col] = -1;
            continue;
          }

          let tile: number;
          let guard = 0;
          do {
            tile = this.randomTile();
            guard++;
          } while (guard < 80 && this.wouldCreateImmediateMatch(row, col, tile));
          this.board[row][col] = tile;
        }
      }

      if (this.findMatches().length === 0 && this.findPossibleMove()) return;
    }

    throw new Error('Unable to generate a playable board for the configured mask and obstacles.');
  }

  swap(a: Position, b: Position): void {
    const temp = this.board[a.row][a.col];
    this.board[a.row][a.col] = this.board[b.row][b.col];
    this.board[b.row][b.col] = temp;

    const special = this.specials[a.row][a.col];
    this.specials[a.row][a.col] = this.specials[b.row][b.col];
    this.specials[b.row][b.col] = special;
  }

  areAdjacent(a: Position, b: Position): boolean {
    return Math.abs(a.row - b.row) + Math.abs(a.col - b.col) === 1;
  }

  isActive(position: Position): boolean {
    return Boolean(this.activeMask[position.row]?.[position.col]);
  }

  getObstacle(position: Position): Obstacle | null {
    return this.obstacles[position.row]?.[position.col] ?? null;
  }

  hasObstacle(position: Position): boolean {
    return Boolean(this.getObstacle(position));
  }

  canSwap(position: Position): boolean {
    return this.isActive(position)
      && this.board[position.row][position.col] >= 0
      && !this.hasObstacle(position);
  }

  canHostSpecial(position: Position): boolean {
    return this.canSwap(position) && this.getSpecial(position) === null;
  }

  getSpecial(position: Position): SpecialTile | null {
    return this.specials[position.row]?.[position.col] ?? null;
  }

  setSpecial(position: Position, special: SpecialTile | null): void {
    if (!this.isActive(position) || this.hasObstacle(position) || this.board[position.row][position.col] < 0) {
      return;
    }
    this.specials[position.row][position.col] = special;
  }

  findSpecialPosition(target: SpecialTile): Position | null {
    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        if (this.specials[row][col] === target) return { row, col };
      }
    }
    return null;
  }

  getDirectSpecialCombo(a: Position, b: Position): DirectSpecialCombo | null {
    if (!this.canSwap(a) || !this.canSwap(b)) return null;
    return getDirectSpecialCombo(this.getSpecial(a), this.getSpecial(b));
  }

  findMatchShapes(): MatchShape[] {
    const shapes: MatchShape[] = [];

    for (let row = 0; row < this.size; row++) {
      let run = 1;
      for (let col = 1; col <= this.size; col++) {
        const previousTile = this.getMatchableTile(row, col - 1);
        if (
          col < this.size
          && previousTile >= 0
          && this.getMatchableTile(row, col) === previousTile
        ) {
          run++;
        } else {
          if (run >= 3 && previousTile >= 0) {
            shapes.push({
              kind: 'line',
              orientation: 'row',
              positions: Array.from({ length: run }, (_, offset) => ({
                row,
                col: col - run + offset,
              })),
            });
          }
          run = 1;
        }
      }
    }

    for (let col = 0; col < this.size; col++) {
      let run = 1;
      for (let row = 1; row <= this.size; row++) {
        const previousTile = this.getMatchableTile(row - 1, col);
        if (
          row < this.size
          && previousTile >= 0
          && this.getMatchableTile(row, col) === previousTile
        ) {
          run++;
        } else {
          if (run >= 3 && previousTile >= 0) {
            shapes.push({
              kind: 'line',
              orientation: 'column',
              positions: Array.from({ length: run }, (_, offset) => ({
                row: row - run + offset,
                col,
              })),
            });
          }
          run = 1;
        }
      }
    }

    for (let row = 0; row < this.size - 1; row++) {
      for (let col = 0; col < this.size - 1; col++) {
        const tile = this.getMatchableTile(row, col);
        if (
          tile >= 0
          && this.getMatchableTile(row, col + 1) === tile
          && this.getMatchableTile(row + 1, col) === tile
          && this.getMatchableTile(row + 1, col + 1) === tile
        ) {
          shapes.push({
            kind: 'square',
            positions: [
              { row, col },
              { row, col: col + 1 },
              { row: row + 1, col },
              { row: row + 1, col: col + 1 },
            ],
          });
        }
      }
    }

    return shapes;
  }

  findMatchGroups(): Position[][] {
    return this.mergeOverlappingGroups(
      this.findMatchShapes().map((shape) => shape.positions),
    );
  }

  findMatches(): Position[] {
    const matches = new Map<string, Position>();
    for (const group of this.findMatchGroups()) {
      for (const position of group) matches.set(this.positionKey(position), position);
    }
    return [...matches.values()].sort((a, b) => a.row - b.row || a.col - b.col);
  }

  resolveClear(matches: readonly Position[]): ClearResult {
    const removedTileTypes: number[] = [];
    const targetPositions = new Map<string, Position>();
    const obstacleHits = new Map<string, Position>();

    for (const position of matches) {
      if (!this.isActive(position)) continue;
      targetPositions.set(this.positionKey(position), position);
      if (this.getObstacle(position)) obstacleHits.set(this.positionKey(position), position);
      for (const neighbor of this.getOrthogonalNeighbors(position)) {
        const obstacle = this.getObstacle(neighbor);
        if (obstacle?.kind === 'rubble' || obstacle?.kind === 'fog') {
          obstacleHits.set(this.positionKey(neighbor), neighbor);
        }
      }
    }

    const obstacleDamage: ObstacleDamage[] = [];
    const protectedCells = new Set(obstacleHits.keys());
    for (const [positionKey, position] of obstacleHits) {
      const obstacle = this.getObstacle(position);
      if (!obstacle) continue;
      const remainingLayers = obstacle.layers - 1;
      const cleared = remainingLayers <= 0;
      this.obstacles[position.row][position.col] = cleared
        ? null
        : { kind: obstacle.kind, layers: remainingLayers as 1 };
      obstacleDamage.push({
        position,
        kind: obstacle.kind,
        remainingLayers: Math.max(0, remainingLayers),
        cleared,
      });
      if (obstacle.kind === 'rubble') {
        this.board[position.row][position.col] = -1;
        this.specials[position.row][position.col] = null;
      }
    }

    for (const [positionKey, position] of targetPositions) {
      if (protectedCells.has(positionKey)) continue;
      const tile = this.board[position.row][position.col];
      if (tile < 0) continue;
      const special = this.specials[position.row][position.col];
      if (special?.kind !== 'prism') removedTileTypes.push(tile);
      this.board[position.row][position.col] = -1;
      this.specials[position.row][position.col] = null;
    }

    return {
      removedTileTypes,
      obstacleDamage: obstacleDamage.sort((a, b) => (
        a.position.row - b.position.row || a.position.col - b.position.col
      )),
      clearedObstacleKinds: obstacleDamage
        .filter((damage) => damage.cleared)
        .map((damage) => damage.kind),
    };
  }

  clearMatches(matches: Position[]): number[] {
    return this.resolveClear(matches).removedTileTypes;
  }

  canHammer(position: Position): boolean {
    return this.isActive(position)
      && (this.board[position.row][position.col] >= 0 || this.hasObstacle(position));
  }

  hitCell(position: Position): ClearResult {
    if (!this.canHammer(position)) {
      return { removedTileTypes: [], obstacleDamage: [], clearedObstacleKinds: [] };
    }

    const obstacle = this.getObstacle(position);
    if (obstacle) {
      const remainingLayers = obstacle.layers - 1;
      const cleared = remainingLayers <= 0;
      this.obstacles[position.row][position.col] = cleared
        ? null
        : { kind: obstacle.kind, layers: remainingLayers as 1 };
      if (cleared && obstacle.kind === 'rubble') {
        this.board[position.row][position.col] = -1;
        this.specials[position.row][position.col] = null;
      }
      const damage: ObstacleDamage = {
        position,
        kind: obstacle.kind,
        remainingLayers: Math.max(0, remainingLayers),
        cleared,
      };
      return {
        removedTileTypes: [],
        obstacleDamage: [damage],
        clearedObstacleKinds: cleared ? [obstacle.kind] : [],
      };
    }

    const tile = this.board[position.row][position.col];
    const special = this.getSpecial(position);
    this.board[position.row][position.col] = -1;
    this.specials[position.row][position.col] = null;
    return {
      removedTileTypes: tile >= 0 && special?.kind !== 'prism' ? [tile] : [],
      obstacleDamage: [],
      clearedObstacleKinds: [],
    };
  }

  collapse(refill = true): void {
    for (let col = 0; col < this.size; col++) {
      let segment: number[] = [];
      const flushSegment = (): void => {
        if (segment.length === 0) return;
        const remaining: Cell[] = [];
        for (let index = segment.length - 1; index >= 0; index--) {
          const row = segment[index];
          if (this.board[row][col] >= 0) {
            remaining.push({
              tile: this.board[row][col],
              special: this.specials[row][col],
            });
          }
        }
        for (let index = segment.length - 1, cellIndex = 0; index >= 0; index--, cellIndex++) {
          const row = segment[index];
          if (cellIndex < remaining.length) {
            this.board[row][col] = remaining[cellIndex].tile;
            this.specials[row][col] = remaining[cellIndex].special;
          } else {
            this.board[row][col] = refill ? this.randomTile() : -1;
            this.specials[row][col] = null;
          }
        }
        segment = [];
      };

      for (let row = 0; row < this.size; row++) {
        if (!this.activeMask[row][col]) continue;
        if (this.isGravityBarrier({ row, col })) {
          flushSegment();
          continue;
        }
        segment.push(row);
      }
      flushSegment();
    }
  }

  findPossibleMoves(): Move[] {
    const moves: Move[] = [];

    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        const a = { row, col };
        if (!this.canSwap(a)) continue;
        for (const [dRow, dCol] of [[1, 0], [0, 1]] as const) {
          const b = { row: row + dRow, col: col + dCol };
          if (!this.canSwap(b)) continue;
          const directCombo = this.getDirectSpecialCombo(a, b);
          if (directCombo) {
            moves.push([a, b]);
            continue;
          }

          this.swap(a, b);
          const hasMatch = this.findMatches().length > 0;
          this.swap(a, b);
          if (hasMatch) moves.push([a, b]);
        }
      }
    }

    return moves;
  }

  findPossibleMove(): Move | null {
    return this.findPossibleMoves()[0] ?? null;
  }

  reshuffle(): boolean {
    const originalBoard = this.board.map((row) => [...row]);
    const originalSpecials = this.specials.map((row) => [...row]);
    const positions: Position[] = [];
    const cells: Cell[] = [];

    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        const position = { row, col };
        if (!this.isActive(position)) continue;
        if (!this.hasObstacle(position) && this.board[row][col] < 0) return false;
        if (!this.canSwap(position)) continue;
        positions.push(position);
        cells.push({ tile: this.board[row][col], special: this.specials[row][col] });
      }
    }

    if (cells.length < 2 || cells.some(({ tile }) => tile < 0 || tile >= this.tileTypeCount)) {
      return false;
    }

    for (let attempt = 0; attempt < Match3Engine.MAX_RESHUFFLE_ATTEMPTS; attempt++) {
      this.assignMovableCells(positions, this.shuffleCopy(cells));
      if (this.findMatches().length === 0 && this.findPossibleMove()) return true;
    }

    this.board = originalBoard.map((row) => [...row]);
    this.specials = originalSpecials.map((row) => [...row]);
    for (let firstIndex = 0; firstIndex < positions.length - 1; firstIndex++) {
      for (let secondIndex = firstIndex + 1; secondIndex < positions.length; secondIndex++) {
        const first = positions[firstIndex];
        const second = positions[secondIndex];
        const sameTile = this.board[first.row][first.col] === this.board[second.row][second.col];
        const sameSpecial = JSON.stringify(this.getSpecial(first)) === JSON.stringify(this.getSpecial(second));
        if (sameTile && sameSpecial) continue;
        this.swap(first, second);
        if (this.findMatches().length === 0 && this.findPossibleMove()) return true;
        this.swap(first, second);
      }
    }

    this.board = originalBoard;
    this.specials = originalSpecials;
    return false;
  }

  countObstacles(kind?: ObstacleKind): number {
    return this.obstacles.flat().filter((obstacle) => (
      obstacle && (!kind || obstacle.kind === kind)
    )).length;
  }

  private getMatchableTile(row: number, col: number): number {
    if (!this.activeMask[row]?.[col]) return -1;
    const tile = this.board[row]?.[col] ?? -1;
    if (tile < 0) return -1;
    if (this.obstacles[row][col]?.kind === 'fog') return -1;
    return this.specials[row][col]?.kind === 'prism' ? -1 : tile;
  }

  private wouldCreateImmediateMatch(row: number, col: number, tile: number): boolean {
    const read = (targetRow: number, targetCol: number): number => {
      if (!this.activeMask[targetRow]?.[targetCol]) return -1;
      if (this.obstacles[targetRow][targetCol]?.kind === 'fog') return -1;
      return this.board[targetRow][targetCol] ?? -1;
    };
    const horizontalLine = read(row, col - 1) === tile && read(row, col - 2) === tile;
    const verticalLine = read(row - 1, col) === tile && read(row - 2, col) === tile;
    const square = read(row - 1, col) === tile
      && read(row, col - 1) === tile
      && read(row - 1, col - 1) === tile;
    return horizontalLine || verticalLine || square;
  }

  private isGravityBarrier(position: Position): boolean {
    return Boolean(this.getObstacle(position));
  }

  private getOrthogonalNeighbors(position: Position): Position[] {
    return [
      { row: position.row - 1, col: position.col },
      { row: position.row + 1, col: position.col },
      { row: position.row, col: position.col - 1 },
      { row: position.row, col: position.col + 1 },
    ].filter((candidate) => this.isActive(candidate));
  }

  private mergeOverlappingGroups(groups: readonly Position[][]): Position[][] {
    const mergedGroups: Set<string>[] = [];

    for (const group of groups) {
      const merged = new Set(group.map((position) => this.positionKey(position)));
      for (let index = mergedGroups.length - 1; index >= 0; index--) {
        const existing = mergedGroups[index];
        if (![...merged].some((key) => existing.has(key))) continue;
        for (const key of existing) merged.add(key);
        mergedGroups.splice(index, 1);
      }
      mergedGroups.push(merged);
    }

    return mergedGroups
      .map((group) => [...group]
        .map((key) => {
          const [row, col] = key.split(',').map(Number);
          return { row, col };
        })
        .sort((a, b) => a.row - b.row || a.col - b.col))
      .sort((a, b) => a[0].row - b[0].row || a[0].col - b[0].col);
  }

  private positionKey(position: Position): string {
    return `${position.row},${position.col}`;
  }

  private shuffleCopy<T>(items: readonly T[]): T[] {
    const shuffled = [...items];
    for (let index = shuffled.length - 1; index > 0; index--) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
    }
    return shuffled;
  }

  private assignMovableCells(positions: readonly Position[], cells: readonly Cell[]): void {
    positions.forEach((position, index) => {
      this.board[position.row][position.col] = cells[index].tile;
      this.specials[position.row][position.col] = cells[index].special;
    });
  }

  private createMask(mask?: readonly string[]): boolean[][] {
    if (!mask) {
      return Array.from({ length: this.size }, () => Array(this.size).fill(true));
    }
    if (mask.length === 0 || mask.some((row) => row.length !== mask.length || /[^01]/.test(row))) {
      throw new Error('Match3Engine mask must be a non-empty square matrix of 0 and 1 characters.');
    }
    return mask.map((row) => [...row].map((cell) => cell === '1'));
  }

  private createEmptyBoard(): number[][] {
    return this.activeMask.map((row) => row.map((active) => active ? -1 : -2));
  }

  private createSpecialGrid(): (SpecialTile | null)[][] {
    return Array.from({ length: this.size }, () => Array<SpecialTile | null>(this.size).fill(null));
  }

  private createObstacleGrid(placements: readonly ObstaclePlacement[]): (Obstacle | null)[][] {
    const grid = Array.from({ length: this.size }, () => Array<Obstacle | null>(this.size).fill(null));
    for (const placement of placements) {
      if (!this.activeMask[placement.row]?.[placement.col]) {
        throw new Error(`Obstacle at ${placement.row},${placement.col} must be on an active cell.`);
      }
      if (grid[placement.row][placement.col]) {
        throw new Error(`Only one obstacle may occupy ${placement.row},${placement.col}.`);
      }
      grid[placement.row][placement.col] = {
        kind: placement.kind,
        layers: placement.layers,
      };
    }
    return grid;
  }

  private randomTile(): number {
    return Math.floor(Math.random() * this.tileTypeCount);
  }
}
