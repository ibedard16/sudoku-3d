import { SudokuCell3d } from "./SudokuCell3d";
import { SudokuGrid3d } from "./SudokuGrid3d";
import { PareClues } from "./PareClues";

export interface IGenerationStep {
    grid: SudokuGrid3d;
    populatedCell: SudokuCell3d;
    populatedValue: number;
}

export function DoGenerationStep(gridForPreviousStep: SudokuGrid3d, cellToPopulate?: SudokuCell3d): IGenerationStep {
    const grid = gridForPreviousStep.clone();

    if (cellToPopulate == null) {
        const allCells = grid.getAllCells();
        const allCellsSorted = allCells.sort((a, b) => b.possibleValues.size - a.possibleValues.size);
        console.log('vaguest cell has ' + allCellsSorted[0].possibleValues.size + ' possible values');

        const mostVagueCells = allCellsSorted.filter(cell => cell.possibleValues.size >= allCellsSorted[0].possibleValues.size);
        const randomCell = mostVagueCells[Math.floor(Math.random() * mostVagueCells.length)];

        // const undefinedCells = allCells.filter(cell => cell.value == null);
        // const randomCell = undefinedCells[Math.floor(Math.random() * undefinedCells.length)];
        console.log('cell being populated has ' + randomCell.possibleValues.size + ' possible values');
        cellToPopulate = randomCell;
    }

    const possibleValues = Array.from(cellToPopulate.possibleValues);
    const randomValue = possibleValues[0];

    cellToPopulate.value = randomValue;
    cellToPopulate.possibleValues.clear();
    grid.removeClueFromNeighbors(cellToPopulate, randomValue);

    // PareClues(grid);

    return {
        grid: grid,
        populatedCell: cellToPopulate,
        populatedValue: randomValue
    }
}
