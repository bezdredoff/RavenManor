import {
  getDirectSpecialCombo,
  type DirectSpecialCombo,
  type SpecialTile,
} from './SpecialTileTypes';

export type Position = { row: number; col: number };
export type Move = readonly [Position, Position];

export type MatchShape = Readonly<{
  kind: 'line' | 'square';
  orientation?: 'row' | 'column';
  positions: Position[];
}>;

type Cell = Readonly<{ tile: number; special: SpecialTile | null }>;

export class Match3Engine {
  private static readonly MAX_RESHUFFLE_ATTEMPTS = 2_000;

  readonly size: number;
  readonly tileTypeCount: number;
  board: number[][];
  specials: (SpecialTile | null)[][];

  constructor(size = 8, tileTypeCount = 6, generateInitialBoard = true) {
    this.size = size;
    this.tileTypeCount = tileTypeCount;
    this.board = Array.from({ length: size }, () => Array(size).fill(-1));
    this.specials = Array.from({ length: size }, () => Array<SpecialTile | null>(size).fill(null));
    if (generateInitialBoard) this.generateBoard();
  }

  static fromBoard(
    board: readonly (readonly number[])[],
    tileTypeCount: number,
    specials?: readonly (readonly (SpecialTile | null)[])[],
  ): Match3Engine {
    const size = board.length;
    if (size === 0 || board.some((row) => row.length !== size)) {
      throw new Error('Match3Engine board must be a non-empty square matrix.');
    }
    if (specials && (specials.length !== size || specials.some((row) => row.length !== size))) {
      throw new Error('Match3Engine specials must match the board dimensions.');
    }

    const engine = new Match3Engine(size, tileTypeCount, false);
    engine.board = board.map((row) => [...row]);
    engine.specials = specials
      ? specials.map((row) => row.map((special) => special ? { ...special } : null))
      : Array.from({ length: size }, () => Array<SpecialTile | null>(size).fill(null));
    return engine;
  }

  generateBoard(): void {
    this.board = Array.from({ length: this.size }, () => Array(this.size).fill(0));
    this.specials = Array.from({ length: this.size }, () => Array<SpecialTile | null>(this.size).fill(null));

    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        let tile: number;
        do {
          tile = this.randomTile();
        } while (
          (col >= 2 && this.board[row][col - 1] === tile && this.board[row][col - 2] === tile)
          || (row >= 2 && this.board[row - 1][col] === tile && this.board[row - 2][col] === tile)
          || (
            row >= 1
            && col >= 1
            && this.board[row - 1][col] === tile
            && this.board[row][col - 1] === tile
            && this.board[row - 1][col - 1] === tile
          )
        );
        this.board[row][col] = tile;
      }
    }

    if (!this.findPossibleMove()) this.generateBoard();
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

  getSpecial(position: Position): SpecialTile | null {
    return this.specials[position.row]?.[position.col] ?? null;
  }

  setSpecial(position: Position, special: SpecialTile | null): void {
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

  /**
   * Returns merged match groups. A group may contain lines, a square, or an
   * overlap such as a T/L shape. Every tile appears at most once per group.
   */
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

  clearMatches(matches: Position[]): number[] {
    const removed: number[] = [];
    const unique = new Map(matches.map((position) => [this.positionKey(position), position]));
    for (const position of unique.values()) {
      const tile = this.board[position.row][position.col];
      if (tile < 0) continue;
      const special = this.specials[position.row][position.col];
      // A prism is colourless after creation and therefore does not count as
      // one extra tile of the colour that originally created it.
      if (special?.kind !== 'prism') removed.push(tile);
      this.board[position.row][position.col] = -1;
      this.specials[position.row][position.col] = null;
    }
    return removed;
  }

  collapse(refill = true): void {
    for (let col = 0; col < this.size; col++) {
      const remaining: Cell[] = [];
      for (let row = this.size - 1; row >= 0; row--) {
        if (this.board[row][col] !== -1) {
          remaining.push({
            tile: this.board[row][col],
            special: this.specials[row][col],
          });
        }
      }

      for (let row = this.size - 1, index = 0; row >= 0; row--, index++) {
        if (index < remaining.length) {
          this.board[row][col] = remaining[index].tile;
          this.specials[row][col] = remaining[index].special;
        } else {
          this.board[row][col] = refill ? this.randomTile() : -1;
          this.specials[row][col] = null;
        }
      }
    }
  }

  findPossibleMoves(): Move[] {
    const moves: Move[] = [];

    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        for (const [dRow, dCol] of [[1, 0], [0, 1]] as const) {
          const nextRow = row + dRow;
          const nextCol = col + dCol;
          if (nextRow >= this.size || nextCol >= this.size) continue;
          if (this.board[row][col] < 0 || this.board[nextRow][nextCol] < 0) continue;

          const a = { row, col };
          const b = { row: nextRow, col: nextCol };
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
    const cells: Cell[] = [];
    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        cells.push({ tile: this.board[row][col], special: this.specials[row][col] });
      }
    }

    if (
      cells.length !== this.size * this.size
      || cells.some(({ tile }) => tile < 0 || tile >= this.tileTypeCount)
    ) return false;

    for (let attempt = 0; attempt < Match3Engine.MAX_RESHUFFLE_ATTEMPTS; attempt++) {
      this.assignCells(this.shuffleCopy(cells));
      if (this.findMatches().length === 0 && this.findPossibleMove()) return true;
    }

    this.board = originalBoard.map((row) => [...row]);
    this.specials = originalSpecials.map((row) => [...row]);
    const positions = Array.from({ length: this.size * this.size }, (_, index) => ({
      row: Math.floor(index / this.size),
      col: index % this.size,
    }));

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

  private getMatchableTile(row: number, col: number): number {
    const tile = this.board[row]?.[col] ?? -1;
    if (tile < 0) return -1;
    return this.specials[row][col]?.kind === 'prism' ? -1 : tile;
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

  private assignCells(cells: readonly Cell[]): void {
    this.board = Array.from({ length: this.size }, () => Array(this.size).fill(-1));
    this.specials = Array.from({ length: this.size }, () => Array<SpecialTile | null>(this.size).fill(null));
    cells.forEach((cell, index) => {
      const row = Math.floor(index / this.size);
      const col = index % this.size;
      this.board[row][col] = cell.tile;
      this.specials[row][col] = cell.special;
    });
  }

  private randomTile(): number {
    return Math.floor(Math.random() * this.tileTypeCount);
  }
}
