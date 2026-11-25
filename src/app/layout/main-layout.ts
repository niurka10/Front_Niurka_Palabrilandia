import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AssistantBubble } from '../shared/components/assistant-bubble';
import { ProfileService } from '../core/services/profile.service';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, AssistantBubble],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss'
})
export class MainLayout {
  profile = inject(ProfileService);
  private router = inject(Router);

  // Lee la etapa de la URL para pintar el menú del color correcto
  get group(): string {
    const g = this.router.parseUrl(this.router.url).queryParams['group'];
    return g === 'teenagers' ? 'teenagers' : 'children';
  }

  // Inicial del apodo para el círculo
  get initial(): string {
    return (this.profile.nickname() || '?').charAt(0).toUpperCase();
  }
}