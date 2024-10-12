
export class SudokuCell3d {
    rowIndex: number;
    columnIndex: number;
    towerIndex: number;
    value?: number;
    possibleValues: Set<number>;

    constructor(row: number, column: number, tower: number) {
        this.rowIndex = row;
        this.columnIndex = column;
        this.towerIndex = tower;
        this.possibleValues = new Set([1,2,3,4,5,6,7,8]);
    }

    toString(): string {
        return this.value == null ? " " : this.value.toString();
    }

    clone(): SudokuCell3d {
        const clone = new SudokuCell3d(this.rowIndex, this.columnIndex, this.towerIndex);
        clone.value = this.value;
        clone.possibleValues = new Set([...this.possibleValues]);
        return clone;
    }
}
