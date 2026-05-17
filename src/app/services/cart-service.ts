import { Injectable, signal, computed } from '@angular/core';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image_url: string;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  // Signal privé contenant la liste brute des articles du panier
  private cartItems = signal<CartItem[]>([]);

  // Exposer les articles en lecture seule pour protéger l'état
  items = this.cartItems.asReadonly();

  // Signal calculé automatiquement pour le nombre total d'articles
  totalItems = computed(() => 
    this.cartItems().reduce((total, item) => total + item.quantity, 0)
  );

  // Signal calculé automatiquement pour le prix total du panier
  totalPrice = computed(() => 
    this.cartItems().reduce((total, item) => total + (item.price * item.quantity), 0)
  );

  // Méthode pour ajouter un produit au panier
  addToCart(product: any) {
    const items = this.cartItems();
    const existingItem = items.find(item => item.id === product.id);

    if (existingItem) {
      // Si le produit existe déjà, on incrémente sa quantité
      this.cartItems.set(
        items.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      );
    } else {
      // Sinon, on ajoute le nouveau produit avec une quantité initiale de 1
      this.cartItems.set([
        ...items, 
        { 
          id: product.id, 
          name: product.name, 
          price: product.price, 
          image_url: product.image_url, 
          quantity: 1 
        }
      ]);
    }
  }

  // Diminuer la quantité ou retirer l'article si elle tombe à 0
  decrementQuantity(productId: string) {
    const items = this.cartItems();
    const existingItem = items.find(item => item.id === productId);

    if (existingItem) {
      if (existingItem.quantity > 1) {
        this.cartItems.set(
          items.map(item => 
            item.id === productId ? { ...item, quantity: item.quantity - 1 } : item
          )
        );
      } else {
        this.removeFromCart(productId);
      }
    }
  }

  // Supprimer définitivement un article du panier
  removeFromCart(productId: string) {
    this.cartItems.set(this.cartItems().filter(item => item.id !== productId));
  }

  clearCart() {
    this.cartItems.set([]);
  }
}