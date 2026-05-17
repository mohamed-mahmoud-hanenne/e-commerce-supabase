import { Component, inject, signal } from '@angular/core';
import { SupabaseService } from '../../services/supabase-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-auth',
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.html',
  styleUrl: './auth.scss',
})
export class Auth {
  private supabaseService = inject(SupabaseService);

  email = '';
  password = '';
  isLoginMode = signal<boolean>(true); // Mode alternable : Connexion ou Inscription
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  loading = signal<boolean>(false);

  toggleMode() {
    this.isLoginMode.set(!this.isLoginMode());
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }

  async onSubmit() {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    try {
      if (this.isLoginMode()) {
        await this.supabaseService.signIn(this.email, this.password);
        this.successMessage.set('Connexion réussie !');
        
        // Simuler un clic sur le bouton de fermeture pour fermer la modale après succès
        setTimeout(() => {
          document.getElementById('closeAuthModal')?.click();
        }, 800);
        
      } else {
        await this.supabaseService.signUp(this.email, this.password);
        this.successMessage.set('Inscription réussie ! Vérifiez votre boîte email.');
      }
      this.email = '';
      this.password = '';
    } catch (error: any) {
      this.errorMessage.set(error.message || 'Une erreur est survenue.');
    } finally {
      this.loading.set(false);
    }
  }
}
