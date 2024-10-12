import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, fromEvent, combineLatest, interval } from 'rxjs';
import { map, distinct } from 'rxjs/operators';

import { SudokuCell3d } from './services/SudokuCell3d';

import { SudokuCubeComponent } from './sudoku-cube/sudoku-cube.component';

@Component({
  selector: 's3d-root',
  standalone: true,
  imports: [
    CommonModule,
    SudokuCubeComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  puzzle$?: Observable<SudokuCell3d[][][]>;

  ngOnInit() {
    const sudokuGeneratorWorker = new Worker(new URL('./services/main', import.meta.url));

    this.puzzle$ = combineLatest([
      fromEvent(sudokuGeneratorWorker, 'message'),
      interval(250),
    ]).pipe(
      distinct(([event, interval]) => interval),
      map(([event]) => {
        return (event as unknown as { data: SudokuCell3d[][][] }).data;
      }),
    );
  }
}
