import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SupabaseService } from '../services/supabase-service';

export const authGuard: CanActivateFn = () => {
  const supabase = inject(SupabaseService);
  const router = inject(Router);

  if (supabase.currentUser()) {
    return true; // Connecté -> Accès autorisé
  } else {
    // Non connecté -> On ouvre le modal de connexion et on reste sur l'accueil
    router.navigate(['/']);
    // Optionnel : déclencher l'ouverture du modal ici si possible
    return false; 
  }
};