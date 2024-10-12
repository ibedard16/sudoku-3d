import { IsValidGrid } from "./IsValidGrid";
import { SudokuCell3d } from "./SudokuCell3d";
import { SudokuGrid3d } from "./SudokuGrid3d";


interface IGenerationStep {
  cachedGrid: SudokuGrid3d;
  cubeIndex: number;
  valueIndex: number;
  cellPopulated: SudokuCell3d;
}

export function GenerateAnswerKey(): SudokuGrid3d {
  const generationHistory: IGenerationStep[] = [];

  const answerKey = new SudokuGrid3d();
  const allCubes = answerKey.getAllCubes();
  const valuesToPopulate = [1, 2, 3, 4, 5, 6, 7, 8]
    .sort(() => Math.random() - 0.5).sort(() => Math.random() - 0.5).sort(() => Math.random() - 0.5);

  for (let valueIndexToPopulate = 0; valueIndexToPopulate < 8; ++valueIndexToPopulate) {
    let valueToPopulate = valuesToPopulate[valueIndexToPopulate];

    for (let cubeToPopulateIndex = 0; cubeToPopulateIndex < allCubes.length; ++cubeToPopulateIndex) {
      const cubeToPopulate = allCubes[cubeToPopulateIndex];
      const cellsValueCanBePlacedIn = cubeToPopulate
        .filter(cell => cell.value == null && cell.possibleValues.has(valueToPopulate));

      if (cellsValueCanBePlacedIn.length === 0 || IsValidGrid(answerKey) === false) {
        // rewind to last generation step
        const lastGenerationStep = generationHistory.pop();
        if (lastGenerationStep == null) {
          throw new Error('No more generation steps to rewind to (God I hope this never happens)');
        }

        answerKey.apply(lastGenerationStep.cachedGrid);
        valueToPopulate = valuesToPopulate[lastGenerationStep.valueIndex];
        cubeToPopulateIndex = lastGenerationStep.cubeIndex - 1;

        const cellChosen = answerKey.getCell(lastGenerationStep.cellPopulated.rowIndex, lastGenerationStep.cellPopulated.columnIndex, lastGenerationStep.cellPopulated.towerIndex);
        cellChosen.possibleValues.delete(valueToPopulate);

        continue;
      }

      // Choose the first cell that can be populated (Used to be a random selection, but that was causing the generator to deadlock/hang)
      const cellToPopulate = cellsValueCanBePlacedIn[0];

      const generationStep: IGenerationStep = {
        cachedGrid: answerKey.clone(),
        valueIndex: valueIndexToPopulate,
        cubeIndex: cubeToPopulateIndex,
        cellPopulated: cellToPopulate,
      };
      generationHistory.push(generationStep);

      cellToPopulate.value = valueToPopulate;
      cellToPopulate.possibleValues.delete(valueToPopulate);
      answerKey.removeClueFromNeighbors(cellToPopulate, valueToPopulate);
    }
  }

  return answerKey;
}
