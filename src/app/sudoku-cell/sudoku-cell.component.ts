import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SudokuCell3d } from '../services/SudokuCell3d';

@Component({
  selector: 's3d-sudoku-cell',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './sudoku-cell.component.html',
  styleUrl: './sudoku-cell.component.css',
})
export class SudokuCellComponent {
  @Input() cell?: SudokuCell3d;
}
