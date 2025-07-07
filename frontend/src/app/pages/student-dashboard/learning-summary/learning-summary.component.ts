import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudentLearningSummary } from '../../../Services/student.service';

@Component({
  selector: 'app-learning-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './learning-summary.component.html',
})
export class LearningSummaryComponent {
  @Input() summary: StudentLearningSummary | null = null;
}
