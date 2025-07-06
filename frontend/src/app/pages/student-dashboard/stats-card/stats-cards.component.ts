import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudentDashboardStats } from '../../../Services/student.service';

@Component({
  selector: 'app-stats-cards',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stats-cards.component.html',
})
export class StatsCardsComponent {
  @Input() stats: StudentDashboardStats | null = null;
}
