import { Component, ElementRef, NgZone, OnDestroy, inject, signal, viewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProfileService } from '../../../core/services/profile.service';

@Component({
  selector: 'app-ar-page',
  standalone: true,
  templateUrl: './ar-page.html',
  styleUrl: './ar-page.scss'
})
export class ArPage implements OnDestroy {
  private zone = inject(NgZone);
  private route = inject(ActivatedRoute);
  private profile = inject(ProfileService);
  private host = viewChild.required<ElementRef<HTMLElement>>('host');

  group = this.route.snapshot.queryParamMap.get('group') === 'teenagers' ? 'teenagers' : 'children';

  title = this.group === 'teenagers' ? 'La biblioteca del pueblo en AR' : 'El gato de Lucía cobra vida';
  lead = this.group === 'teenagers'
    ? 'Después de leer «La biblioteca del pueblo», descubre sus libros con la cámara y responde sobre el texto.'
    : 'Encuentra al gato con la cámara y responde sus preguntas sobre el cuento.';
  icon = this.group === 'teenagers' ? '📚' : '🐱';

  state = signal<'intro' | 'loading' | 'running' | 'error'>('intro');
  found = signal(false);   

  index = signal(0);
  chosen = signal<string | null>(null);
  score = signal(0);
  finished = signal(false);
  private counted = false;   

  get questions(): ArQuestion[] {
    return QUESTIONS[this.group];
  }

  get current(): ArQuestion {
    return this.questions[this.index()];
  }

  feedback(ok: boolean): string {
    if (this.group === 'teenagers') return ok ? 'Correcto.' : 'No es esa.';
    return ok ? '¡Muy bien! 🎉' : '¡Casi! 💡';
  }

  async start(): Promise<void> {
    this.state.set('loading');
    try {
      await loadScript(AFRAME);
      await loadScript(ARJS);
    } catch {
      this.state.set('error');
      return;
    }

    const el = this.host().nativeElement;
    el.innerHTML = buildScene(this.group);  

    const marker = el.querySelector('a-marker');
    marker?.addEventListener('markerFound', () => this.zone.run(() => this.found.set(true)));
    marker?.addEventListener('markerLost', () => this.zone.run(() => this.found.set(false)));

    this.state.set('running');
  }

  pick(option: string): void {
    if (this.chosen()) return;
    this.chosen.set(option);
    if (option === this.current.answer) this.score.update(s => s + 1);
  }

  next(): void {
    if (this.index() + 1 < this.questions.length) {
      this.index.update(i => i + 1);
      this.chosen.set(null);
      return;
    }
    this.finished.set(true);
    if (!this.counted) {
      this.counted = true;
      const p = this.score() / this.questions.length;
      this.profile.addProgress(p === 1 ? 3 : p >= 0.5 ? 2 : 1);
    }
  }

  exit(): void {
    this.stop();
    window.location.href = `/ar?group=${this.group}`;
  }

  private stop(): void {
    const v = document.getElementById('arjs-video') as HTMLVideoElement | null;
    (v?.srcObject as MediaStream | null)?.getTracks().forEach(t => t.stop());
    document.querySelectorAll('#arjs-video, .a-canvas').forEach(n => n.remove());
    this.host().nativeElement.innerHTML = '';
  }

  ngOnDestroy(): void {
    this.stop();
  }
}

const AFRAME = '/aframe.min.js';
const ARJS = '/aframe-ar.js';

// Carga un script una sola vez
function loadScript(src: string): Promise<void> {
  return new Promise((ok, fail) => {
    if (document.querySelector(`script[src="${src}"]`)) { ok(); return; }
    const s = document.createElement('script');
    s.src = src;
    s.onload = () => ok();
    s.onerror = () => fail();
    document.head.appendChild(s);
  });
}

const CAT = `
<a-entity scale="0.6 0.6 0.6" animation="property: position; from: 0 0 0; to: 0 0.08 0; dir: alternate; dur: 700; loop: true">
  <a-sphere radius="0.32" scale="1.3 0.9 1" position="0 0.3 0" color="#f29a38"></a-sphere>
  <a-sphere radius="0.24" position="0 0.62 0.38" color="#f29a38"></a-sphere>
  <a-cone radius-bottom="0.09" radius-top="0" height="0.2" position="-0.14 0.86 0.38" color="#f29a38"></a-cone>
  <a-cone radius-bottom="0.09" radius-top="0" height="0.2" position="0.14 0.86 0.38" color="#f29a38"></a-cone>
  <a-sphere radius="0.04" position="-0.09 0.67 0.6" color="#222"></a-sphere>
  <a-sphere radius="0.04" position="0.09 0.67 0.6" color="#222"></a-sphere>
  <a-text value="Miau!" position="0 1.25 0.38" align="center" width="2.5" color="#fff"></a-text>
</a-entity>`;

const BOOKS = `
<a-entity scale="0.7 0.7 0.7" animation="property: rotation; from: 0 0 0; to: 0 360 0; dur: 9000; loop: true; easing: linear">
  <a-box width="1" height="0.2" depth="0.7" position="0 0.1 0" color="#087eaa"></a-box>
  <a-box width="0.9" height="0.18" depth="0.65" position="0.05 0.29 0" rotation="0 12 0" color="#e6a928"></a-box>
  <a-box width="0.8" height="0.16" depth="0.6" position="-0.04 0.46 0" rotation="0 -10 0" color="#d6457a"></a-box>
  <a-box width="0.7" height="0.14" depth="0.5" position="0 0.61 0" rotation="0 6 0" color="#2e9e6b"></a-box>
  <a-text value="Biblioteca" position="0 1.0 0" align="center" width="3" color="#fff"></a-text>
</a-entity>`;

function buildScene(group: string): string {
  return `
<a-scene vr-mode-ui="enabled: false" arjs="sourceType: webcam; debugUIEnabled: false;">
  <a-marker preset="hiro">${group === 'teenagers' ? BOOKS : CAT}</a-marker>
  <a-entity camera></a-entity>
</a-scene>`;
}


interface ArQuestion {
  text: string;
  options: string[];
  answer: string;
  explanation: string;
}

const QUESTIONS: Record<string, ArQuestion[]> = {
  // niños
  children: [
    {
      text: '¿Dónde encontró Lucía al gato?',
      options: ['Bajo la lluvia', 'En el jardín', 'En la escuela'],
      answer: 'Bajo la lluvia',
      explanation: 'Lucía lo encontró bajo la lluvia, mojado y temblando.'
    },
    {
      text: '¿Cómo ayudó Lucía al gato?',
      options: ['Lo secó y le dio leche', 'Lo dejó en la calle', 'Lo llevó a la escuela'],
      answer: 'Lo secó y le dio leche',
      explanation: 'Lo secó con una toalla y le dio un poco de leche.'
    }
  ],
  // Adolescente
  teenagers: [
    {
      text: '¿Por qué Mateo se atrevió a entrar aunque el cartel decía «Cerrada»?',
      options: ['Vio una luz encendida al fondo', 'Alguien lo invitó a pasar', 'La puerta estaba abierta del todo'],
      answer: 'Vio una luz encendida al fondo',
      explanation: 'Dudó por el cartel, pero la luz le indicó que había alguien dentro.'
    },
    {
      text: '¿Qué revela la frase «Llegas justo a tiempo»?',
      options: ['Que la bibliotecaria lo esperaba', 'Que la biblioteca iba a cerrar', 'Que Mateo llegaba tarde'],
      answer: 'Que la bibliotecaria lo esperaba',
      explanation: 'Añade que la abuela le avisó de su visita: lo esperaban.'
    }
  ]
};