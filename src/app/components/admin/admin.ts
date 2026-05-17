import { Component, inject, signal } from '@angular/core';
import { SupabaseService } from '../../services/supabase-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin',
  imports: [CommonModule, FormsModule], 
  templateUrl: './admin.html',
  styleUrl: './admin.scss',
})
export class Admin {
  private supabaseService = inject(SupabaseService);
  orders = signal<any[]>([]);
  statuses = ['En attente', 'Expédié', 'Livré', 'Annulé'];

  async ngOnInit() {
    this.loadOrders();
  }

  async loadOrders() {
    const data = await this.supabaseService.getAllOrders();
    this.orders.set(data);
  }

  async changeStatus(orderId: string, event: any) {
    const newStatus = event.target.value;
    try {
      await this.supabaseService.updateOrderStatus(orderId, newStatus);
      alert("Statut mis à jour !");
    } catch (error: any) {
      alert(error.message);
    }
  }
}
