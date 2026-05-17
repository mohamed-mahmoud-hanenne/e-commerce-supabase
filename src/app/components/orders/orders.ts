import { Component, inject, OnInit, signal } from '@angular/core';
import { SupabaseService } from '../../services/supabase-service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-orders',
  imports: [CommonModule],
  templateUrl: './orders.html',
  styleUrl: './orders.scss',
})
export class Orders implements OnInit {
  private supabaseService = inject(SupabaseService);
  
  // Signal pour stocker la liste des commandes
  orders = signal<any[]>([]);
  loading = signal<boolean>(true);

  async ngOnInit() {
    await this.loadOrders();
  }

  async loadOrders() {
    try {
      const user = this.supabaseService.currentUser();
      if (!user) return;

      // On récupère les commandes de l'utilisateur avec le détail des items
      const { data, error } = await this.supabaseService.getOrdersByUser(user.id);
      
      if (error) throw error;
      this.orders.set(data || []);
    } catch (error: any) {
      console.error("Erreur chargement commandes:", error.message);
    } finally {
      this.loading.set(false);
    }
  }
}
