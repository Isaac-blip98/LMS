import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudentQuickStats } from '../../../Services/student.service';

@Component({
  selector: 'app-quick-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quick-stats.component.html',
})
export class QuickStatsComponent {
  @Input() stats: StudentQuickStats | null = null;
}
