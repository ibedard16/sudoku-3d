import { SudokuCell3d } from "./SudokuCell3d";
import { SudokuGrid3d } from "./SudokuGrid3d";

export function GeneratePuzzleFromAnswerKey(answerKey: SudokuGrid3d): SudokuGrid3d {
  const puzzle = answerKey.clone();

  let redundantCells: SudokuCell3d[] = [];

  do {
    PopulateCluesForGrid(puzzle);
    redundantCells = puzzle.getAllCells().filter(x => x.value != null && x.possibleValues.size === 1);

    const cellIndexToClear = Math.floor(Math.random() * redundantCells.length);
    const cellToClear = redundantCells[cellIndexToClear];
    if (cellToClear != null) {
      cellToClear.value = undefined;
    }

  } while (redundantCells.length > 0);

  return puzzle;
}

function PopulateCluesForGrid(grid: SudokuGrid3d) {
  const allCells = grid.getAllCells();

  allCells.forEach(cell => PopulateCluesForCell(grid, cell));
}

function PopulateCluesForCell(grid: SudokuGrid3d, cell: SudokuCell3d) {
  const allValues = [1, 2, 3, 4, 5, 6, 7, 8];
  const possibleValuesForCell = new Set(allValues);

  const row = [...grid.getRow(cell.columnIndex, cell.towerIndex)];
  const column = [...grid.getColumn(cell.rowIndex, cell.towerIndex)];
  const tower = [...grid.getTower(cell.rowIndex, cell.columnIndex)];
  const cube = [...grid.getCubeContainingCell(cell.rowIndex, cell.columnIndex, cell.towerIndex)];

  const rowIndex = row.findIndex(x => x == cell);
  const columnIndex = column.findIndex(x => x == cell);
  const towerIndex = tower.findIndex(x => x == cell);
  const cubeIndex = cube.findIndex(x => x == cell);

  row.splice(rowIndex, 1);
  column.splice(columnIndex, 1);
  tower.splice(towerIndex, 1);
  cube.splice(cubeIndex, 1);

  const rowValues = row.map(x => x.value).filter(x => x != null);
  const columnValues = column.map(x => x.value).filter(x => x != null);
  const towerValues = tower.map(x => x.value).filter(x => x != null);
  const cubeValues = cube.map(x => x.value).filter(x => x != null);

  const allNeighborValues = new Set([...rowValues, ...columnValues, ...towerValues, ...cubeValues].flat());
  allNeighborValues.forEach(x => possibleValuesForCell.delete(x));

  cell.possibleValues = possibleValuesForCell;
}
