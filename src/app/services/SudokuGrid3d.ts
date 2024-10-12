import { SudokuCell3d } from "./SudokuCell3d";

export class SudokuGrid3d {
    private cells: SudokuCell3d[][][];

    constructor() {
        this.cells = new Array<Array<Array<SudokuCell3d>>>(8);

        for (let towerIndex = 0; towerIndex < 8; ++towerIndex) {
            this.cells[towerIndex] = new Array<Array<SudokuCell3d>>(8);

            for (let columnIndex = 0; columnIndex < 8; ++columnIndex) {
                this.cells[towerIndex][columnIndex] = new Array<SudokuCell3d>(8)
                    .fill(null as unknown as SudokuCell3d)
                    .map((_, rowIndex) => new SudokuCell3d(rowIndex, columnIndex, towerIndex));
            }
        }
    }

    toString(): string {
        return this.cells.map(tower => tower.map(column => column.map(x => (x as any).toString()).join(" ")).join("\n")).join("\n===============\n");
    }

    toCsv(): string {
        return this.cells.map(tower => tower.map(column => column.map(x => (x as any).value).join(",")).join("\n")).join("\n\n");
    }

    clone(): SudokuGrid3d {
        const clone = new SudokuGrid3d();
        clone.cells = this.cells.map(tower => tower.map(column => column.map(cell => cell.clone())));
        return clone;
    }

    apply(gridToApply: SudokuGrid3d) {
      this.cells.forEach((tower, towerIndex) => {
        tower.forEach((column, columnIndex) => {
          column.forEach((cell, rowIndex) => {
            const cellToApply = gridToApply.getCell(rowIndex, columnIndex, towerIndex);
            cell.value = cellToApply.value;
            cell.possibleValues = new Set([...cellToApply.possibleValues]);
          });
        });
      });
    }

    get(): SudokuCell3d[][][] {
      return this.cells;
    }

    getAllCells(): SudokuCell3d[] {
        return this.cells.flat().flat();
    }

    getAllRows(): SudokuCell3d[][] {
        const rows: SudokuCell3d[][] = [];
        for (let towerIndex = 0; towerIndex < 8; ++towerIndex) {
            for (let columnIndex = 0; columnIndex < 8; ++columnIndex) {
                rows.push(this.getRow(columnIndex, towerIndex));
            }
        }
        return rows;
    }

    getAllColumns(): SudokuCell3d[][] {
        const columns: SudokuCell3d[][] = [];
        for (let towerIndex = 0; towerIndex < 8; ++towerIndex) {
            for (let rowIndex = 0; rowIndex < 8; ++rowIndex) {
                columns.push(this.getColumn(rowIndex, towerIndex));
            }
        }
        return columns;
    }

    getAllTowers(): SudokuCell3d[][] {
        const towers: SudokuCell3d[][] = [];
        for (let columnIndex = 0; columnIndex < 8; ++columnIndex) {
            for (let rowIndex = 0; rowIndex < 8; ++rowIndex) {
                towers.push(this.getTower(rowIndex, columnIndex));
            }
        }
        return towers;
    }

    getAllCubes(): SudokuCell3d[][] {
        const cubes: SudokuCell3d[][] = [];
        for (let cubeTowerIndex = 0; cubeTowerIndex < 4; ++cubeTowerIndex) {
            for (let cubeColumnIndex = 0; cubeColumnIndex < 4; ++cubeColumnIndex) {
                for (let cubeRowIndex = 0; cubeRowIndex < 4; ++cubeRowIndex) {
                    cubes.push(this.getCube(cubeRowIndex, cubeColumnIndex, cubeTowerIndex));
                }
            }
        }
        return cubes;
    }

    getCell(rowIndex: number, columnIndex: number, towerIndex: number): SudokuCell3d {
        return this.cells[towerIndex][columnIndex][rowIndex];
    }

    setCell(rowIndex: number, columnIndex: number, towerIndex: number, value: SudokuCell3d): void {
        this.cells[towerIndex][columnIndex][rowIndex] = value;
    }

    getRow(columnIndex: number, towerIndex: number): SudokuCell3d[] {
        return this.cells[towerIndex][columnIndex];
    }

    getColumn(rowIndex: number, towerIndex: number): SudokuCell3d[] {
        return this.cells[towerIndex].map(column => column[rowIndex]);
    }

    getTower(rowIndex: number, columnIndex: number): SudokuCell3d[] {
        return this.cells.map(tower => tower[columnIndex][rowIndex]);
    }

    getCube(cubeRowIndex: number, cubeColumnIndex: number, cubeTowerIndex: number): SudokuCell3d[] {
        const cubeRowStartIndex = cubeRowIndex * 2;
        const cubeColumnStartIndex = cubeColumnIndex * 2;
        const cubeTowerStartIndex = cubeTowerIndex * 2;

        return this.cells.slice(cubeTowerStartIndex, cubeTowerStartIndex + 2)
            .flatMap(tower => tower.slice(cubeColumnStartIndex, cubeColumnStartIndex + 2))
            .flatMap(column => column.slice(cubeRowStartIndex, cubeRowStartIndex + 2));
    }

    getCubeContainingCell(rowIndex: number, columnIndex: number, towerIndex: number): SudokuCell3d[] {
        const cubeRowIndex = Math.floor(rowIndex / 2);
        const cubeColumnIndex = Math.floor(columnIndex / 2);
        const cubeTowerIndex = Math.floor(towerIndex / 2);

        return this.getCube(cubeRowIndex, cubeColumnIndex, cubeTowerIndex);
    }

    removeClueFromNeighbors(cell: SudokuCell3d, value: number) {
      const cellsInRow = this.getAllCells().filter(c => c.columnIndex === cell.columnIndex && c.towerIndex === cell.towerIndex);
      const cellsInColumn = this.getAllCells().filter(c => c.rowIndex === cell.rowIndex && c.towerIndex === cell.towerIndex);
      const cellsInTower = this.getAllCells().filter(c => c.rowIndex === cell.rowIndex && c.columnIndex === cell.columnIndex);
      const cellsInCube = this.getCubeContainingCell(cell.rowIndex, cell.columnIndex, cell.towerIndex);

      const allNeighbors = [...cellsInRow, ...cellsInColumn, ...cellsInTower, ...cellsInCube];
      allNeighbors.forEach(c => c.possibleValues.delete(value));
    }

    addClueToNeighbors(cell: SudokuCell3d, value: number) {
      const cellsInRow = this.getAllCells().filter(c => c.columnIndex === cell.columnIndex && c.towerIndex === cell.towerIndex);
      const cellsInColumn = this.getAllCells().filter(c => c.rowIndex === cell.rowIndex && c.towerIndex === cell.towerIndex);
      const cellsInTower = this.getAllCells().filter(c => c.rowIndex === cell.rowIndex && c.columnIndex === cell.columnIndex);
      const cellsInCube = this.getCubeContainingCell(cell.rowIndex, cell.columnIndex, cell.towerIndex);

      const allNeighbors = [...cellsInRow, ...cellsInColumn, ...cellsInTower, ...cellsInCube];
      allNeighbors.forEach(c => c.possibleValues.add(value));
    }

    swapCells(x: SudokuCell3d, y: SudokuCell3d) {
      const tempValue = x.value;
      const tempPossibleValues = new Set([...x.possibleValues]);

      x.value = y.value;
      x.possibleValues = new Set([...y.possibleValues]);

      y.value = tempValue;
      y.possibleValues = tempPossibleValues;
    }

    swapRowPlane(rowPlane1: number, rowPlane2: number) {
      for (let towerIndex = 0; towerIndex < 8; ++towerIndex) {
        for (let columnIndex = 0; columnIndex < 8; ++columnIndex) {
          this.swapCells(
            this.cells[towerIndex][columnIndex][rowPlane1],
            this.cells[towerIndex][columnIndex][rowPlane2]
          );
        }
      }
    }

    swapColumnPlane(columnPlane1: number, columnPlane2: number) {
      for (let towerIndex = 0; towerIndex < 8; ++towerIndex) {
        for (let rowIndex = 0; rowIndex < 8; ++rowIndex) {
          this.swapCells(
            this.cells[towerIndex][columnPlane1][rowIndex],
            this.cells[towerIndex][columnPlane2][rowIndex]
          );
        }
      }
    }

    swapTowerPlane(towerPlane1: number, towerPlane2: number) {
      for (let columnIndex = 0; columnIndex < 8; ++columnIndex) {
        for (let rowIndex = 0; rowIndex < 8; ++rowIndex) {
          this.swapCells(
            this.cells[towerPlane1][columnIndex][rowIndex],
            this.cells[towerPlane2][columnIndex][rowIndex]
          );
        }
      }
    }

    shuffle() {
      const axis = Math.floor(Math.random() * 3);
      const index1 = Math.floor(Math.random() * 4);
      const index2 = Math.floor(Math.random() * 4);

      if (axis === 0) {
        this.swapRowPlane(index1 * 2, (index2 * 2) + 1);

        if (index1 !== index2) {
          this.swapRowPlane((index1 * 2) + 1, (index2 * 2));
        }
      } else if (axis === 1) {
        this.swapColumnPlane(index1 * 2, (index2 * 2) + 1);

        if (index1 !== index2) {
          this.swapColumnPlane((index1 * 2) + 1, (index2 * 2));
        }
      } else if (axis === 2) {
        this.swapTowerPlane(index1 * 2, (index2 * 2) + 1);

        if (index1 !== index2) {
          this.swapTowerPlane((index1 * 2) + 1, (index2 * 2));
        }
      }
    }
}
