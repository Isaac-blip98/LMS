import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../core/layout/header/header.component';

@Component({
  selector: 'app-instructor-layout',
  standalone: true,
  imports: [RouterModule, HeaderComponent],
  templateUrl: './instructor-layout.component.html',
  styleUrls: ['./instructor-layout.component.css']
})
export class InstructorLayoutComponent {} 