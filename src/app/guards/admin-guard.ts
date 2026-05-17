import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SupabaseService } from '../services/supabase-service';

export const adminGuard: CanActivateFn = () => {
  const supabase = inject(SupabaseService);
  const router = inject(Router);

  // On récupère le profil chargé dans le service
  const profile = supabase.userProfile();

  if (profile && profile.is_admin === true) {
    return true; // C'est un admin, on laisse passer
  } else {
    // Ce n'est pas un admin, on le renvoie à l'accueil
    console.warn("Accès refusé : Réservé aux administrateurs");
    router.navigate(['/']);
    return false;
  }
};