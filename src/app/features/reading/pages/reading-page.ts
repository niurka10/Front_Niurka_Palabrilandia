
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CheckAnswerResponse } from '../../spelling/models/spelling.models';
import { ReadingText, ReadingQuestion } from '../models/reading.models';
import { ReadingService } from '../services/reading.service';
import { ProfileService } from '../../../core/services/profile.service';

@Component({
  selector: 'app-reading-page',
  standalone: true,
  templateUrl: './reading-page.html',
  styleUrl: './reading-page.scss'
})
export class ReadingPage implements OnInit {
  private service = inject(ReadingService);
  private route = inject(ActivatedRoute);
  private profile = inject(ProfileService);

  private counted = false;

  group = this.route.snapshot.queryParamMap.get('group') === 'teenagers'
    ? 'teenagers'
    : 'children';

  texts = signal<ReadingText[]>([]);
  results = signal<Record<number, CheckAnswerResponse>>({});
  error = signal(false);
  loading = signal(true);

  total = computed(() =>
    this.texts().reduce((sum, t) => sum + t.questions.length, 0)
  );

  answered = computed(() => Object.keys(this.results()).length);

  score = computed(() =>
    Object.values(this.results()).filter(r => r.isCorrect).length
  );

  progress = computed(() =>
    this.total() ? (this.answered() / this.total()) * 100 : 0
  );

  finished = computed(() =>
    this.total() > 0 && this.answered() === this.total()
  );

  ngOnInit(): void {
    this.service.getTexts(this.group).subscribe({
      next: data => {
        this.texts.set(data);
        this.loading.set(false);
      },
      error: err => {
        console.error('Error al cargar lectura:', err);
        this.error.set(true);
        this.loading.set(false);
      }
    });
  }

  answer(q: ReadingQuestion, option: string): void {
    if (this.results()[q.id]) return;

    this.service.check(q.id, option).subscribe({
      next: r => {
        this.results.update(cur => ({
          ...cur,
          [q.id]: r
        }));

        // Guarda las estrellas al terminar todas las preguntas
        if (!this.counted && this.finished()) {
          this.counted = true;
          this.profile.addProgress(
            this.starsFor(this.score(), this.total())
          );
        }
      },
      error: err => console.error('Error al comprobar respuesta:', err)
    });
  }

  restart(): void {
    this.results.set({});
    this.counted = false;
  }

  // 3 estrellas si acierta todo, 2 si acierta al menos 60%, 1 en otro caso
  starsFor(score: number, total: number): number {
    const p = total ? score / total : 0;
    return p === 1 ? 3 : p >= 0.6 ? 2 : 1;
  }

  // Mensaje de feedback según la etapa
  feedback(isCorrect: boolean): string {
    if (this.group === 'teenagers') {
      return isCorrect
        ? 'Correcto. Sigue así.'
        : 'No es esa. Revisa la explicación.';
    }

    return isCorrect
      ? '¡Muy bien! 🎉'
      : '¡Casi! Fíjate en la explicación 💡';
  }
}
