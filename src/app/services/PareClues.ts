import { SudokuCell3d } from "./SudokuCell3d";
import { SudokuGrid3d } from "./SudokuGrid3d";

export function PareClues(grid: SudokuGrid3d): void {
    let pareLoops = 0;
    while (doSinglePareRun(grid)) { ++pareLoops; }

    console.log('Looped ' + pareLoops + ' times to pare all clues');
}

function doSinglePareRun(grid: SudokuGrid3d): boolean {
    let cluesPared = false;

    cluesPared ||= pareRows(grid);
    cluesPared ||= pareColumns(grid);
    cluesPared ||= pareTowers(grid);
    cluesPared ||= pareCubes(grid);

    return cluesPared;
}

function pareRows(grid: SudokuGrid3d): boolean {
    let anyCluesPared = false;

    grid.getAllRows().forEach(row => {
        anyCluesPared ||= pareLineOfCells(grid, row);
    });

    return anyCluesPared;
}

function pareColumns(grid: SudokuGrid3d): boolean {
    let anyCluesPared = false;

    grid.getAllColumns().forEach(column => {
        anyCluesPared ||= pareLineOfCells(grid, column);
    });

    return anyCluesPared;
}

function pareTowers(grid: SudokuGrid3d): boolean {
    let anyCluesPared = false;

    grid.getAllTowers().forEach(tower => {
        anyCluesPared ||= pareLineOfCells(grid, tower);
    });

    return anyCluesPared;
}

function pareCubes(grid: SudokuGrid3d): boolean {
    let anyCluesPared = false;

    grid.getAllCubes().forEach(cube => {
        const remainingUnknowns = getRemainingUnknowns(cube);

        remainingUnknowns.forEach(remainingUnknown => {
            const possibleCells = cube.filter(cell => cell.possibleValues.has(remainingUnknown));

            // only one possible cell in this cube can have the value
            if (possibleCells.length === 1) {
                const cell = possibleCells[0];

                cell.possibleValues.clear();
                cell.value = remainingUnknown;
                grid.removeClueFromNeighbors(cell, remainingUnknown);

                anyCluesPared = true;
                return;
            }

            if (possibleCells.length === 2) {
                const cellsAreInSameRow =
                    possibleCells[0].columnIndex === possibleCells[1].columnIndex &&
                    possibleCells[0].towerIndex === possibleCells[1].towerIndex;
                if (cellsAreInSameRow) {
                    // value can only be within this cube in this row, so clear other cells in row
                    const row = grid.getRow(possibleCells[0].columnIndex, possibleCells[0].towerIndex);
                    const neighborsInRow = row.filter(cell => possibleCells.indexOf(cell) === -1);
                    neighborsInRow.forEach(neighbor => {
                        if (neighbor.possibleValues.has(remainingUnknown)) {
                            anyCluesPared = true;
                        }
                        neighbor.possibleValues.delete(remainingUnknown);
                    });
                }

                const cellsAreInSameColumn =
                    possibleCells[0].rowIndex === possibleCells[1].rowIndex &&
                    possibleCells[0].towerIndex === possibleCells[1].towerIndex;
                if (cellsAreInSameColumn) {
                    // value can only be within this cube in this column, so clear other cells in column
                    const column = grid.getColumn(possibleCells[0].rowIndex, possibleCells[0].towerIndex);
                    const neighborsInColumn = column.filter(cell => possibleCells.indexOf(cell) === -1);
                    neighborsInColumn.forEach(neighbor => {
                        if (neighbor.possibleValues.has(remainingUnknown)) {
                            anyCluesPared = true;
                        }
                        neighbor.possibleValues.delete(remainingUnknown);
                    });
                }

                const cellsAreInSameTower =
                    possibleCells[0].rowIndex === possibleCells[1].rowIndex &&
                    possibleCells[0].columnIndex === possibleCells[1].columnIndex;
                if (cellsAreInSameTower) {
                    // value can only be within this cube in this column, so clear other cells in column
                    const tower = grid.getTower(possibleCells[0].rowIndex, possibleCells[0].columnIndex);
                    const neighborsInTower = tower.filter(cell => possibleCells.indexOf(cell) === -1);
                    neighborsInTower.forEach(neighbor => {
                        if (neighbor.possibleValues.has(remainingUnknown)) {
                            anyCluesPared = true;
                        }
                        neighbor.possibleValues.delete(remainingUnknown);
                    });
                }
            }
        });

        anyCluesPared ||= pareCellsBasedOnAppearanceCount(cube);
        anyCluesPared ||= pareCellsWithDuplicateClues(cube);
    });

    return anyCluesPared;
}

function pareLineOfCells(grid: SudokuGrid3d, line: SudokuCell3d[]): boolean {
    let anyCluesPared = false;

    const remainingUnknowns = getRemainingUnknowns(line);
    remainingUnknowns.forEach(remainingUnknown => {
        const possibleCells = line.filter(cell => cell.possibleValues.has(remainingUnknown));

        // only one possible cell in this row can have the value
        if (possibleCells.length === 1) {
            const cell = possibleCells[0];

            cell.possibleValues.clear();
            cell.value = remainingUnknown;
            grid.removeClueFromNeighbors(cell, remainingUnknown);

            anyCluesPared = true;
            return;
        }

        // only possible cells in this row are in the same cube, so remove this possible value from the other cells in the cube
        const cubeIndexesOfPossibleCells = possibleCells.map(cell => Math.floor(cell.rowIndex / 2));
        if (cubeIndexesOfPossibleCells.length === 2 && cubeIndexesOfPossibleCells[0] === cubeIndexesOfPossibleCells[1]) {
            const cube = grid.getCubeContainingCell(possibleCells[0].rowIndex, possibleCells[0].columnIndex, possibleCells[0].towerIndex);
            const neighborsInCube = cube.filter(cell => possibleCells.indexOf(cell) === -1);

            neighborsInCube.forEach(neighbor => {
                if (neighbor.possibleValues.has(remainingUnknown)) {
                    anyCluesPared = true;
                }
                neighbor.possibleValues.delete(remainingUnknown);
            });
            return;
        }
    });

    anyCluesPared ||= pareCellsBasedOnAppearanceCount(line);
    anyCluesPared ||= pareCellsWithDuplicateClues(line);

    return anyCluesPared;
}

function pareCellsBasedOnAppearanceCount(cells: SudokuCell3d[]): boolean {
    interface PossibleClueAppearances {
        possibleValue: number;
        indexesOfAppearances: number[];
    }

    let anyCluesPared = false;

    const clueFrequencies: PossibleClueAppearances[] = [1,2,3,4,5,6,7,8].map(possibleValue => {
        return {
            possibleValue: possibleValue,
            indexesOfAppearances: cells
                .map((value, index) => ({value, index}))
                .filter(arrayElement => arrayElement.value.possibleValues.has(possibleValue))
                .map(arrayElement => arrayElement.index)
        };
    });

    const cluesAppearingTwice = clueFrequencies.filter(frequency => frequency.indexesOfAppearances.length === 2);
    cluesAppearingTwice.forEach(aClue => {
        cluesAppearingTwice.forEach(bClue => {
            if (aClue === bClue) {
                return;
            }

            if (setsAreEqual(new Set(aClue.indexesOfAppearances), new Set(bClue.indexesOfAppearances))) {
                const cellsCluesAppearIn = aClue.indexesOfAppearances.map(index => cells[index]);
                cellsCluesAppearIn.forEach(cell => {
                    if (cell.possibleValues.size > 2) {
                        anyCluesPared = true;
                        cell.possibleValues = new Set([aClue.possibleValue, bClue.possibleValue]);
                    }
                });
            }
        });
    });

    const cluesAppearingThreeTimes = clueFrequencies.filter(frequency => frequency.indexesOfAppearances.length === 3);
    cluesAppearingThreeTimes.forEach(aClue => {
        cluesAppearingThreeTimes.forEach(bClue => {
            if (aClue === bClue) {
                return;
            }

            if (setsAreEqual(new Set(aClue.indexesOfAppearances), new Set(bClue.indexesOfAppearances))) {
                cluesAppearingThreeTimes.forEach(cClue => {
                    if (aClue === cClue || bClue === cClue) {
                        return;
                    }

                    if (setsAreEqual(new Set(aClue.indexesOfAppearances), new Set(cClue.indexesOfAppearances))) {
                        const cellsCluesAppearIn = aClue.indexesOfAppearances.map(index => cells[index]);
                        cellsCluesAppearIn.forEach(cell => {
                            if (cell.possibleValues.size > 3) {
                                anyCluesPared = true;
                                cell.possibleValues = new Set([aClue.possibleValue, bClue.possibleValue, cClue.possibleValue]);
                            }
                        });
                    }
                });
            }
        });
    });

    const cluesAppearingFourTimes = clueFrequencies.filter(frequency => frequency.indexesOfAppearances.length === 4);
    cluesAppearingFourTimes.forEach(aClue => {
        cluesAppearingFourTimes.forEach(bClue => {
            if (aClue === bClue) {
                return;
            }

            if (setsAreEqual(new Set(aClue.indexesOfAppearances), new Set(bClue.indexesOfAppearances))) {
                cluesAppearingFourTimes.forEach(cClue => {
                    if (aClue === cClue || bClue === cClue) {
                        return;
                    }

                    if (setsAreEqual(new Set(aClue.indexesOfAppearances), new Set(cClue.indexesOfAppearances))) {
                        cluesAppearingFourTimes.forEach(dClue => {
                            if (aClue === dClue || bClue === dClue || cClue === dClue) {
                                return;
                            }

                            if (setsAreEqual(new Set(aClue.indexesOfAppearances), new Set(dClue.indexesOfAppearances))) {
                                const cellsCluesAppearIn = aClue.indexesOfAppearances.map(index => cells[index]);
                                cellsCluesAppearIn.forEach(cell => {
                                    if (cell.possibleValues.size > 4) {
                                        anyCluesPared = true;
                                        cell.possibleValues = new Set([aClue.possibleValue, bClue.possibleValue, cClue.possibleValue, dClue.possibleValue]);
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    });

    return anyCluesPared;
}

function pareCellsWithDuplicateClues(cells: SudokuCell3d[]): boolean {
    let anyCluesPared = false;

    const cellsWithTwoClues = cells.filter(cell => cell.possibleValues.size === 2);
    cellsWithTwoClues.forEach(aCell => {
        cellsWithTwoClues.forEach(bCell => {
            if (aCell === bCell) {
                return;
            }

            if (setsAreEqual(aCell.possibleValues, bCell.possibleValues)) {
                [...aCell.possibleValues].forEach(value => {
                    cells.filter(cell => cell.possibleValues.has(value))
                        .filter(cell => cell !== aCell && cell !== bCell)
                        .forEach(cell => {
                            cell.possibleValues.delete(value);
                            anyCluesPared = true;
                        });
                });
            }
        });
    });

    const cellsWithThreeClues = cells.filter(cell => cell.possibleValues.size === 3);
    if (cellsWithThreeClues.length >= 3) {
        cellsWithThreeClues.forEach(aCell => {
            cellsWithThreeClues.forEach(bCell => {
                if (aCell === bCell) {
                    return;
                }

                if (setsAreEqual(aCell.possibleValues, bCell.possibleValues)) {
                    cellsWithThreeClues.forEach(cCell => {
                        if (aCell === cCell || bCell === cCell) {
                            return;
                        }

                        if (setsAreEqual(aCell.possibleValues, cCell.possibleValues)) {
                            [...aCell.possibleValues].forEach(value => {
                                cells.filter(cell => cell.possibleValues.has(value))
                                    .filter(cell => cell !== aCell && cell !== bCell && cell !== cCell)
                                    .forEach(cell => {
                                        cell.possibleValues.delete(value);
                                        anyCluesPared = true;
                                    });
                            });
                        }
                    });
                }
            });
        });
    }

    const cellsWithFourClues = cells.filter(cell => cell.possibleValues.size === 4);
    if (cellsWithFourClues.length >= 4) {
        cellsWithFourClues.forEach(aCell => {
            cellsWithFourClues.forEach(bCell => {
                if (aCell === bCell) {
                    return;
                }

                if (setsAreEqual(aCell.possibleValues, bCell.possibleValues)) {
                    cellsWithFourClues.forEach(cCell => {
                        if (aCell === cCell || bCell === cCell) {
                            return;
                        }

                        if (setsAreEqual(aCell.possibleValues, cCell.possibleValues)) {
                            cellsWithFourClues.forEach(dCell => {
                                if (aCell === dCell || bCell === dCell || cCell === dCell) {
                                    return;
                                }

                                if (setsAreEqual(aCell.possibleValues, dCell.possibleValues)) {
                                    [...aCell.possibleValues].forEach(value => {
                                        cells.filter(cell => cell.possibleValues.has(value))
                                            .filter(cell => cell !== aCell && cell !== bCell && cell !== cCell && cell !== dCell)
                                            .forEach(cell => {
                                                cell.possibleValues.delete(value);
                                                anyCluesPared = true;
                                            });
                                    });
                                }
                            });
                        }
                    });
                }
            });
        });
    }

    return anyCluesPared;
}

function getRemainingUnknowns(cells: SudokuCell3d[]): Set<number> {
    const knownValues = new Set(cells.map(cell => cell.value).filter(value => value != null));

    const deducedCells = cells.filter(cell => cell.possibleValues.size === 1);
    deducedCells.forEach(cell => {
        const value = Array.from(cell.possibleValues)[0];
        knownValues.add(value);
    });

    const remainingUnknowns = new Set([1,2,3,4,5,6,7,8].filter(value => !knownValues.has(value)));
    return remainingUnknowns;
}

function setsAreEqual(a: Set<unknown>, b: Set<unknown>) {
    if (a.size !== b.size) {
        return false;
    }

    for (const aValue of a) {
        if (!b.has(aValue)) {
            return false;
        }
    }

    return true;
}
