import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ChatMessage } from '../../features/assistant/models/assistant.models';
import { AssistantService } from '../../features/assistant/services/assistant.service';

@Component({
  selector: 'app-assistant-bubble',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './assistant-bubble.html',
  styleUrl: './assistant-bubble.scss',
  host: { '[class.teens]': "group === 'teenagers'" }
})
export class AssistantBubble {
  private service = inject(AssistantService);
  private router = inject(Router);
  private body = viewChild<ElementRef<HTMLElement>>('body');

  open = signal(false);
  sending = signal(false);
  finished = signal(false);
  messages = signal<ChatMessage[]>([]);
  question = '';

  suggestions = ['¿Cuándo se usa la tilde?', '¿Por qué y porque?', '¿Qué es una oración?', '¿Cuándo uso mayúscula?'];

  constructor() {
    this.reset();
  }

  // Lee la etapa de la URL actual (?group=...)
  get group(): string {
    const g = this.router.parseUrl(this.router.url).queryParams['group'];
    return g === 'teenagers' ? 'teenagers' : 'children';
  }

  toggle(): void {
    this.open.update(v => !v);
    this.scrollDown();
  }

  reset(): void {
    const hello = this.group === 'teenagers'
      ? '¡Hola! Soy Lengi, tu asistente de Lengua y Literatura. ¿Qué duda tienes?'
      : '¡Hola! 👋 Soy Lengi. ¡Pregúntame lo que quieras sobre palabras y cuentos!';
    this.messages.set([{ from: 'bot', text: hello }]);
    this.question = '';
    this.finished.set(false);
  }

  send(text?: string): void {
    if (this.finished()) return;
    const q = (text ?? this.question).trim();
    if (!q || this.sending()) return;

    this.messages.update(m => [...m, { from: 'user', text: q }]);
    this.question = '';
    this.sending.set(true);
    this.scrollDown();

    this.service.ask(q, this.group).subscribe({
      next: r => {
        this.messages.update(m => [...m, { from: 'bot', text: r.answer }]);
        this.sending.set(false);
        const bye = ['fin', 'adiós', 'adios', 'chao', 'gracias'];
        if (bye.some(w => q.toLowerCase().split(/\s+/).includes(w))) this.finished.set(true);
        this.scrollDown();
      },
      error: () => {
        this.messages.update(m => [...m, { from: 'bot', text: 'No pude conectarme con el servidor 😕' }]);
        this.sending.set(false);
      }
    });
  }

  endChat(): void {
    this.messages.update(m => [...m, {
      from: 'bot',
      text: this.group === 'teenagers'
        ? '¡Hasta pronto! Sigue practicando.'
        : '¡Chao! 🌟 Lo hiciste muy bien. ¡Vuelve pronto!'
    }]);
    this.finished.set(true);
    this.scrollDown();
  }

  private scrollDown(): void {
    setTimeout(() => {
      const el = this.body()?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    });
  }
}