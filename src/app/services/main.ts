import { SudokuGrid3d } from "./SudokuGrid3d";
import { SudokuCell3d } from "./SudokuCell3d";
import { IsValidGrid } from "./IsValidGrid";

interface IGenerationStep {
  cachedGrid: SudokuGrid3d;
  cubeIndex: number;
  valueIndex: number;
  cellPopulated: SudokuCell3d;
}

const generationHistory: IGenerationStep[] = [];

const grid = new SudokuGrid3d();
const allCubes = grid.getAllCubes();
const valuesToPopulate = [1, 2, 3, 4, 5, 6, 7, 8]
  .sort(() => Math.random() - 0.5).sort(() => Math.random() - 0.5).sort(() => Math.random() - 0.5);

for (let valueIndexToPopulate = 0; valueIndexToPopulate < 8; ++valueIndexToPopulate) {
  let valueToPopulate = valuesToPopulate[valueIndexToPopulate];

  for (let cubeToPopulateIndex = 0; cubeToPopulateIndex < allCubes.length; ++cubeToPopulateIndex) {
    const cubeToPopulate = allCubes[cubeToPopulateIndex];
    const cellsValueCanBePlacedIn = cubeToPopulate
      .filter(cell => cell.value == null && cell.possibleValues.has(valueToPopulate));

    if (cellsValueCanBePlacedIn.length === 0 || IsValidGrid(grid) === false) {
      // rewind to last generation step
      const lastGenerationStep = generationHistory.pop();
      if (lastGenerationStep == null) {
        throw new Error('No more generation steps to rewind to (God I hope this never happens)');
      }

      grid.apply(lastGenerationStep.cachedGrid);
      valueToPopulate = valuesToPopulate[lastGenerationStep.valueIndex];
      cubeToPopulateIndex = lastGenerationStep.cubeIndex - 1;

      const cellChosen = grid.getCell(lastGenerationStep.cellPopulated.rowIndex, lastGenerationStep.cellPopulated.columnIndex, lastGenerationStep.cellPopulated.towerIndex);
      cellChosen.possibleValues.delete(valueToPopulate);

      continue;
    }

    // Choose the first cell that can be populated (Used to be a random selection, but that was causing the generator to deadlock/hang)
    const cellToPopulate = cellsValueCanBePlacedIn[0];

    const generationStep: IGenerationStep = {
      cachedGrid: grid.clone(),
      valueIndex: valueIndexToPopulate,
      cubeIndex: cubeToPopulateIndex,
      cellPopulated: cellToPopulate,
    };
    generationHistory.push(generationStep);

    cellToPopulate.value = valueToPopulate;
    cellToPopulate.possibleValues.delete(valueToPopulate);
    grid.removeClueFromNeighbors(cellToPopulate, valueToPopulate);

    postMessage(grid.clone().get());
  }
}

for (let shuffleStep = 0; shuffleStep < 100; ++shuffleStep) {
  grid.shuffle();
}

grid.swapColumnPlane(0, 1);
setTimeout(() => postMessage(grid.clone().get()), 1000);

console.log(IsValidGrid(grid));
