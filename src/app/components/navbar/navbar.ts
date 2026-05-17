import { CommonModule } from '@angular/common';
import { Component, inject, computed, output } from '@angular/core';
import { CartService } from '../../services/cart-service';
import { SupabaseService } from '../../services/supabase-service'; // Import du service Supabase
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  // Injection des services
  cartService = inject(CartService);
  public supabaseService = inject(SupabaseService);

  private router = inject(Router); // Injecte le service Router

  // Liaisons directes avec les Signals du panier
  cartCount = this.cartService.totalItems;
  cartItems = this.cartService.items; // Liste des articles
  totalPrice = this.cartService.totalPrice; // Prix total global

  // Liaisons réactives avec l'authentification Supabase (attendues par votre HTML)
  isLoggedIn = computed(() => this.supabaseService.currentUser() !== null);
  userEmail = computed(() => this.supabaseService.currentUser()?.email ?? '');
  isAdmin = computed(() => this.supabaseService.userProfile()?.is_admin === true);

  // Méthodes de gestion de quantité à appeler depuis le HTML
  increment(item: any) {
    this.cartService.addToCart(item);
  }

  decrement(productId: string) {
    this.cartService.decrementQuantity(productId);
  }

  remove(productId: string) {
    this.cartService.removeFromCart(productId);
  }

  // pour afficher la page du vendeur, on vérifie d'abord si l'utilisateur est connecté
  showSeller() {
  if (this.isLoggedIn()) {
    this.viewChange.emit('seller');
  } else {
    // Si pas connecté, on ouvre le modal de connexion au lieu de changer de page
    const modalBtn = document.querySelector('[data-bs-target="#authModal"]') as HTMLElement;
    modalBtn?.click();
  }
}

  // async logout() {
  //   try {
  //     // 1. On déconnecte l'utilisateur de Supabase
  //     await this.supabaseService.signOut();

  //     // 2. On réinitialise la vue vers la boutique
  //     // Cela envoie 'shop' au composant parent (AppComponent)
  //     this.showShop();

  //     // Optionnel : Tu peux ajouter une petite alerte ou un message de succès
  //     console.log('Déconnexion réussie');
  //   } catch (error: any) {
  //     alert('Erreur lors de la déconnexion : ' + error.message);
  //   }
  // }

  async checkout() {
    try {
      // Éviter de lancer si le panier est vide
      if (this.cartItems().length === 0) return;

      // Appeler le service Supabase pour enregistrer en base de données
      await this.supabaseService.createOrder(this.totalPrice(), this.cartItems());

      // Alerte de succès (Tu pourras intégrer SweetAlert ici plus tard !)
      alert('Commande enregistrée avec succès !');

      // Vider le panier après l'achat
      this.cartService.clearCart();

      // Fermer le volet coulissant du panier graphiquement via son bouton de fermeture
      document
        .querySelector('.btn-close[data-bs-dismiss="offcanvas"]')
        ?.dispatchEvent(new Event('click'));
    } catch (error: any) {
      alert('Erreur lors de la commande : ' + error.message);
    }
  }

  // On crée un output pour dire au composant parent (App) quelle vue afficher
  viewChange = output<string>();

  showShop() {
    this.viewChange.emit('shop'); // On prévient qu'on veut revenir à la boutique
  }
  
    // Les fonctions de redirection
  showProfile() {
    this.router.navigate(['/profil']);
  }

  showOrders() {
    this.router.navigate(['/commandes']);
  }

  async logout() {
    await this.supabaseService.signOut();
    this.router.navigate(['/']); // Retour à l'accueil après déconnexion
  }

}
