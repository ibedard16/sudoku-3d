import { SudokuGrid3d } from './SudokuGrid3d';

export function IsValidGrid(grid: SudokuGrid3d): boolean {
    const allCells = grid.getAllCells();
    
    const gridHasUnsolvableCells = allCells.some(cell => cell.value == null && cell.possibleValues.size === 0);
    if (gridHasUnsolvableCells) {
        return false;
    }
    
    const gridHasRowWithUnsolvableValues = grid.getAllRows().some(row => {
        const values = row.map(cell => cell.value);
        const possibleValues = row.flatMap(cell => [...cell.possibleValues]);
        const uniqueValues = new Set([...values, ...possibleValues].filter(x => x != null));
        return uniqueValues.size !== 8;
    });
    if (gridHasRowWithUnsolvableValues) {
        return false;
    }
    
    const gridHasColumnWithUnsolvableValues = grid.getAllColumns().some(column => {
        const values = column.map(cell => cell.value);
        const possibleValues = column.flatMap(cell => [...cell.possibleValues]);
        const uniqueValues = new Set([...values, ...possibleValues].filter(x => x != null));
        return uniqueValues.size !== 8;
    });
    if (gridHasColumnWithUnsolvableValues) {
        return false;
    }
    
    const gridHasTowerWithUnsolvableValues = grid.getAllTowers().some(tower => {
        const values = tower.map(cell => cell.value);
        const possibleValues = tower.flatMap(cell => [...cell.possibleValues]);
        const uniqueValues = new Set([...values, ...possibleValues].filter(x => x != null));
        return uniqueValues.size !== 8;
    });
    if (gridHasTowerWithUnsolvableValues) {
        return false;
    }
    
    const gridHasCubeWithUnsolvableValues = grid.getAllCubes().some(cube => {
        const values = cube.map(cell => cell.value);
        const possibleValues = cube.flatMap(cell => [...cell.possibleValues]);
        const uniqueValues = new Set([...values, ...possibleValues].filter(x => x != null));
        return uniqueValues.size !== 8;
    });
    if (gridHasCubeWithUnsolvableValues) {
        return false;
    }
    
    return true;
}