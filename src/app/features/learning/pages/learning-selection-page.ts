import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProfileService } from '../../../core/services/profile.service';

@Component({
  selector: 'app-learning-selection-page',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './learning-selection-page.html',
  styleUrl: './learning-selection-page.scss'
})
export class LearningSelectionPage {
  private router = inject(Router);
  private profile = inject(ProfileService);

  // Paso actual: primero el nombre, luego la etapa
  step = signal<'name' | 'stage'>('name');
  name = '';

  // Guarda el apodo (solo en el navegador) y pasa a elegir etapa
  next(): void {
    this.profile.save(this.name);
    this.step.set('stage');
  }

  // Sin apodo: borra el anterior y avanza
  skip(): void {
    this.name = '';
    this.profile.clear();
    this.step.set('stage');
  }

  back(): void {
    this.step.set('name');
  }

  // Entra al panel con la etapa elegida
  selectAgeGroup(group: string): void {
    this.router.navigate(['/dashboard'], { queryParams: { group } });
  }

  get nickname(): string {
    return this.profile.nickname();
  }
}