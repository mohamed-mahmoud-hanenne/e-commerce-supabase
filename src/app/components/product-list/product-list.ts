import { Component, OnInit, signal } from '@angular/core';
import { SupabaseService } from '../../services/supabase-service';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart-service';

@Component({
  selector: 'app-product-list',
  imports: [CommonModule],
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss',
})
export class ProductList implements OnInit {
  // Signal pour stocker les produits
  products = signal<any[]>([]);
  loading = signal<boolean>(true);

  constructor(
    private supabaseService: SupabaseService,
    private cartService: CartService
  ) 
    {}

  async ngOnInit() {
    try {
      const data = await this.supabaseService.getProducts();
      this.products.set(data || []);
    } catch (error) {
      console.error('Erreur de chargement:', error);
    } finally {
      this.loading.set(false);
    }
  }

  // 3. Créer la méthode d'action pour le template
  addToCart(product: any) {
    this.cartService.addToCart(product);
  }
}
