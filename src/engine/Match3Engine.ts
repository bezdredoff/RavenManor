export type Position = { row: number; col: number };

export class Match3Engine {
  private static readonly MAX_RESHUFFLE_ATTEMPTS = 2_000;

  readonly size: number;
  readonly tileTypeCount: number;
  board: number[][];

  constructor(size = 8, tileTypeCount = 6) {
    this.size = size;
    this.tileTypeCount = tileTypeCount;
    this.board = [];
    this.generateBoard();
  }

  generateBoard(): void {
    this.board = Array.from({ length: this.size }, () => Array(this.size).fill(0));

    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        let tile: number;
        do {
          tile = this.randomTile();
        } while (
          (col >= 2 && this.board[row][col - 1] === tile && this.board[row][col - 2] === tile) ||
          (row >= 2 && this.board[row - 1][col] === tile && this.board[row - 2][col] === tile)
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

  findMatches(): Position[] {
    const matches = new Set<string>();

    for (let row = 0; row < this.size; row++) {
      let run = 1;
      for (let col = 1; col <= this.size; col++) {
        if (col < this.size && this.board[row][col] === this.board[row][col - 1]) {
          run++;
        } else {
          if (run >= 3) {
            for (let offset = 0; offset < run; offset++) {
              matches.add(`${row},${col - 1 - offset}`);
            }
          }
          run = 1;
        }
      }
    }

    for (let col = 0; col < this.size; col++) {
      let run = 1;
      for (let row = 1; row <= this.size; row++) {
        if (row < this.size && this.board[row][col] === this.board[row - 1][col]) {
          run++;
        } else {
          if (run >= 3) {
            for (let offset = 0; offset < run; offset++) {
              matches.add(`${row - 1 - offset},${col}`);
            }
          }
          run = 1;
        }
      }
    }

    return [...matches].map((key) => {
      const [row, col] = key.split(',').map(Number);
      return { row, col };
    });
  }

  clearMatches(matches: Position[]): number[] {
    const removed: number[] = [];
    for (const position of matches) {
      removed.push(this.board[position.row][position.col]);
      this.board[position.row][position.col] = -1;
    }
    return removed;
  }

  collapse(): void {
    for (let col = 0; col < this.size; col++) {
      const remaining: number[] = [];
      for (let row = this.size - 1; row >= 0; row--) {
        if (this.board[row][col] !== -1) remaining.push(this.board[row][col]);
      }

      for (let row = this.size - 1, index = 0; row >= 0; row--, index++) {
        this.board[row][col] = index < remaining.length ? remaining[index] : this.randomTile();
      }
    }
  }

  findPossibleMove(): [Position, Position] | null {
    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        for (const [dRow, dCol] of [[1, 0], [0, 1]]) {
          const nextRow = row + dRow;
          const nextCol = col + dCol;
          if (nextRow >= this.size || nextCol >= this.size) continue;

          const a = { row, col };
          const b = { row: nextRow, col: nextCol };
          this.swap(a, b);
          const hasMatch = this.findMatches().length > 0;
          this.swap(a, b);

          if (hasMatch) return [a, b];
        }
      }
    }

    return null;
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
      tiles.length !== this.size * this.size ||
      tiles.some((tile) => tile < 0 || tile >= this.tileTypeCount)
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
