export type Position = { row: number; col: number };
export type Move = readonly [Position, Position];

export class Match3Engine {
  private static readonly MAX_RESHUFFLE_ATTEMPTS = 2_000;

  readonly size: number;
  readonly tileTypeCount: number;
  board: number[][];

  constructor(size = 8, tileTypeCount = 6, generateInitialBoard = true) {
    this.size = size;
    this.tileTypeCount = tileTypeCount;
    this.board = Array.from({ length: size }, () => Array(size).fill(-1));
    if (generateInitialBoard) this.generateBoard();
  }

  static fromBoard(board: readonly (readonly number[])[], tileTypeCount: number): Match3Engine {
    const size = board.length;
    if (size === 0 || board.some((row) => row.length !== size)) {
      throw new Error('Match3Engine board must be a non-empty square matrix.');
    }

    const engine = new Match3Engine(size, tileTypeCount, false);
    engine.board = board.map((row) => [...row]);
    return engine;
  }

  generateBoard(): void {
    this.board = Array.from({ length: this.size }, () => Array(this.size).fill(0));

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
  }

  areAdjacent(a: Position, b: Position): boolean {
    return Math.abs(a.row - b.row) + Math.abs(a.col - b.col) === 1;
  }

  /**
   * Returns merged match groups. A group may be:
   * - a horizontal line of three or more;
   * - a vertical line of three or more;
   * - a 2×2 square of four identical tiles.
   *
   * Overlapping shapes are merged so every tile is removed and counted once.
   */
  findMatchGroups(): Position[][] {
    const rawGroups: Position[][] = [];

    for (let row = 0; row < this.size; row++) {
      let run = 1;
      for (let col = 1; col <= this.size; col++) {
        const previousTile = this.board[row][col - 1];
        if (
          col < this.size
          && previousTile >= 0
          && this.board[row][col] === previousTile
        ) {
          run++;
        } else {
          if (run >= 3 && previousTile >= 0) {
            rawGroups.push(Array.from({ length: run }, (_, offset) => ({
              row,
              col: col - 1 - offset,
            })));
          }
          run = 1;
        }
      }
    }

    for (let col = 0; col < this.size; col++) {
      let run = 1;
      for (let row = 1; row <= this.size; row++) {
        const previousTile = this.board[row - 1][col];
        if (
          row < this.size
          && previousTile >= 0
          && this.board[row][col] === previousTile
        ) {
          run++;
        } else {
          if (run >= 3 && previousTile >= 0) {
            rawGroups.push(Array.from({ length: run }, (_, offset) => ({
              row: row - 1 - offset,
              col,
            })));
          }
          run = 1;
        }
      }
    }

    for (let row = 0; row < this.size - 1; row++) {
      for (let col = 0; col < this.size - 1; col++) {
        const tile = this.board[row][col];
        if (
          tile >= 0
          && this.board[row][col + 1] === tile
          && this.board[row + 1][col] === tile
          && this.board[row + 1][col + 1] === tile
        ) {
          rawGroups.push([
            { row, col },
            { row, col: col + 1 },
            { row: row + 1, col },
            { row: row + 1, col: col + 1 },
          ]);
        }
      }
    }

    return this.mergeOverlappingGroups(rawGroups);
  }

  findMatches(): Position[] {
    const matches = new Map<string, Position>();
    for (const group of this.findMatchGroups()) {
      for (const position of group) {
        matches.set(this.positionKey(position), position);
      }
    }

    return [...matches.values()].sort((a, b) => a.row - b.row || a.col - b.col);
  }

  clearMatches(matches: Position[]): number[] {
    const removed: number[] = [];
    for (const position of matches) {
      const tile = this.board[position.row][position.col];
      if (tile < 0) continue;
      removed.push(tile);
      this.board[position.row][position.col] = -1;
    }
    return removed;
  }

  /**
   * Collapses surviving tiles. Normal gameplay refills empty cells randomly.
   * Hint simulation can pass false to analyse only guaranteed cascades created
   * by tiles that are already visible on the board.
   */
  collapse(refill = true): void {
    for (let col = 0; col < this.size; col++) {
      const remaining: number[] = [];
      for (let row = this.size - 1; row >= 0; row--) {
        if (this.board[row][col] !== -1) remaining.push(this.board[row][col]);
      }

      for (let row = this.size - 1, index = 0; row >= 0; row--, index++) {
        this.board[row][col] = index < remaining.length
          ? remaining[index]
          : refill
            ? this.randomTile()
            : -1;
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

  /**
   * Rearranges the current tiles without changing how many tiles of each type
   * are present. A successful result has no immediate matches and contains at
   * least one legal move.
   *
   * Returns false only when no valid arrangement was found within the bounded
   * search. In that case the original board is restored unchanged.
   */
  reshuffle(): boolean {
    const originalBoard = this.board.map((row) => [...row]);
    const tiles = originalBoard.flat();

    if (
      tiles.length !== this.size * this.size
      || tiles.some((tile) => tile < 0 || tile >= this.tileTypeCount)
    ) {
      return false;
    }

    for (let attempt = 0; attempt < Match3Engine.MAX_RESHUFFLE_ATTEMPTS; attempt++) {
      this.board = this.toBoard(this.shuffleCopy(tiles));

      if (this.findMatches().length === 0 && this.findPossibleMove()) {
        return true;
      }
    }

    // A deterministic fallback is useful for structured dead boards where a
    // single transposition can make the layout playable.
    this.board = originalBoard.map((row) => [...row]);
    const positions = Array.from({ length: this.size * this.size }, (_, index) => ({
      row: Math.floor(index / this.size),
      col: index % this.size,
    }));

    for (let firstIndex = 0; firstIndex < positions.length - 1; firstIndex++) {
      for (let secondIndex = firstIndex + 1; secondIndex < positions.length; secondIndex++) {
        const first = positions[firstIndex];
        const second = positions[secondIndex];

        if (this.board[first.row][first.col] === this.board[second.row][second.col]) {
          continue;
        }

        this.swap(first, second);

        if (this.findMatches().length === 0 && this.findPossibleMove()) {
          return true;
        }

        this.swap(first, second);
      }
    }

    this.board = originalBoard;
    return false;
  }

  private mergeOverlappingGroups(groups: readonly Position[][]): Position[][] {
    const mergedGroups: Set<string>[] = [];

    for (const group of groups) {
      const merged = new Set(group.map((position) => this.positionKey(position)));

      for (let index = mergedGroups.length - 1; index >= 0; index--) {
        const existing = mergedGroups[index];
        const overlaps = [...merged].some((key) => existing.has(key));
        if (!overlaps) continue;

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
      .sort((a, b) => {
        const firstA = a[0];
        const firstB = b[0];
        return firstA.row - firstB.row || firstA.col - firstB.col;
      });
  }

  private positionKey(position: Position): string {
    return `${position.row},${position.col}`;
  }

  private shuffleCopy(tiles: number[]): number[] {
    const shuffled = [...tiles];

    for (let index = shuffled.length - 1; index > 0; index--) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
    }

    return shuffled;
  }

  private toBoard(tiles: number[]): number[][] {
    return Array.from({ length: this.size }, (_, row) =>
      tiles.slice(row * this.size, (row + 1) * this.size),
    );
  }

  private randomTile(): number {
    return Math.floor(Math.random() * this.tileTypeCount);
  }
}
