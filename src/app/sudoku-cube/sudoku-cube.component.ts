import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Input } from '@angular/core';
import { SudokuGrid3d } from '../services/SudokuGrid3d';
import { SudokuCell3d } from '../services/SudokuCell3d';
import { SudokuPlaneComponent } from '../sudoku-plane/sudoku-plane.component';

@Component({
  selector: 's3d-sudoku-cube',
  standalone: true,
  imports: [
    CommonModule,
    SudokuPlaneComponent,
  ],
  templateUrl: './sudoku-cube.component.html',
  styleUrl: './sudoku-cube.component.css',
})
export class SudokuCubeComponent {
  @Input() cube: SudokuCell3d[][][] | null = null;
  upperTowers?: SudokuCell3d[][][];
  lowerTowers?: SudokuCell3d[][][];

  ngOnChanges() {
    this.upperTowers = this.cube?.filter((_, i) => i % 2 === 0);
    this.lowerTowers = this.cube?.filter((_, i) => i % 2 === 1);
  }
}
