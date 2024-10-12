import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SudokuCell3d } from '../services/SudokuCell3d';
import { SudokuCellComponent } from '../sudoku-cell/sudoku-cell.component';

@Component({
  selector: 's3d-sudoku-plane',
  standalone: true,
  imports: [
    CommonModule,
    SudokuCellComponent,
  ],
  templateUrl: './sudoku-plane.component.html',
  styleUrl: './sudoku-plane.component.css',
})
export class SudokuPlaneComponent {
  @Input() plane: SudokuCell3d[][] | null = null;
}
