import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CheckAnswerResponse, SpellingExercise } from '../models/spelling.models';
import { SpellingService } from '../services/spelling.service';
import { ProfileService } from '../../../core/services/profile.service';

@Component({
  selector: 'app-spelling-page',
  standalone: true,
  templateUrl: './spelling-page.html',
  styleUrl: './spelling-page.scss'
})
export class SpellingPage implements OnInit {
  private service = inject(SpellingService);
  private route = inject(ActivatedRoute);
  private profile = inject(ProfileService);   // guarda las estrellas en el navegador
  private counted = false;                     // evita sumar estrellas dos veces

  group = this.route.snapshot.queryParamMap.get('group') === 'teenagers'
    ? 'teenagers'
    : 'children';

  exercises = signal<SpellingExercise[]>([]);
  results = signal<Record<number, CheckAnswerResponse>>({});
  error = signal(false);
  loading = signal(true);

  answered = computed(() => Object.keys(this.results()).length);

  score = computed(() =>
    Object.values(this.results()).filter(r => r.isCorrect).length
  );

  progress = computed(() =>
    this.exercises().length
      ? (this.answered() / this.exercises().length) * 100
      : 0
  );

  finished = computed(() =>
    this.exercises().length > 0 && this.answered() === this.exercises().length
  );

  ngOnInit(): void {
    this.service.getExercises(this.group).subscribe({
      next: data => {
        this.exercises.set(data);
        this.loading.set(false);
      },
      error: err => {
        console.error('Error al cargar ortografía:', err);
        this.error.set(true);
        this.loading.set(false);
      }
    });
  }

  answer(ex: SpellingExercise, option: string): void {
    if (this.results()[ex.id]) return;

    this.service.check(ex.id, option).subscribe({
      next: result => {
        this.results.update(current => ({
          ...current,
          [ex.id]: result
        }));

        if (!this.counted && this.finished()) {
          this.counted = true;
          this.profile.addProgress(this.starsFor(this.score(), this.exercises().length));
        }
      },
      error: err => console.error('Error al comprobar respuesta:', err)
    });
  }

  restart(): void {
    this.results.set({});
    this.counted = false;   
  }

  starsFor(score: number, total: number): number {
    const p = total ? score / total : 0;
    return p === 1 ? 3 : p >= 0.6 ? 2 : 1;
  }

  feedback(isCorrect: boolean): string {
    if (this.group === 'teenagers') {
      return isCorrect ? 'Correcto. Sigue así.' : 'No es esa. Revisa la explicación.';
    }
    return isCorrect ? '¡Muy bien! 🎉' : '¡Casi! Fíjate en la explicación 💡';
  }
}