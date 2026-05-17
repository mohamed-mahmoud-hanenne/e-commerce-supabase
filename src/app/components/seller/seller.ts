import { Component, inject, signal } from '@angular/core';
import { SupabaseService } from '../../services/supabase-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-seller',
  imports: [CommonModule, FormsModule],
  templateUrl: './seller.html',
  styleUrl: './seller.scss',
})
export class Seller {
  public supabaseService = inject(SupabaseService);
  myProducts = signal<any[]>([]); // Liste des produits du vendeur
  loading = signal(false);
  categories = signal<any[]>([]); // Pour stocker les catégories de la base
  selectedFile: File | null = null;

    newProduct = { 
    name: '', 
    price: 0, 
    description: '', 
    image_url: '', 
    category_id: '' };

  onFileSelected(event: any) {
  this.selectedFile = event.target.files[0];
  }

    async ngOnInit() {
    try {
      const data = await this.supabaseService.getCategories();
      this.categories.set(data);
      
      // On sélectionne la première catégorie par défaut
      if (data.length > 0) {
        this.newProduct.category_id = data[0].id;
      }
    } catch (error) {
      console.error("Erreur catégories:", error);
    }
    await this.loadMyProducts();
  }

  async handleBecomeSeller() {
    this.loading.set(true);
    await this.supabaseService.becomeSeller();
    this.loading.set(false);
  }

  async onSubmit() {
  try {
    this.loading.set(true);
    let imageUrl = this.newProduct.image_url;

    // 1. Upload de l'image si elle existe
    if (this.selectedFile) {
      imageUrl = await this.supabaseService.uploadProductImage(this.selectedFile);
    }

    // 2. Création du produit dans la base
    await this.supabaseService.addProduct({ 
      ...this.newProduct, 
      image_url: imageUrl 
    });

    // 3. FERMETURE DU MODAL BOOTSTRAP
    // On récupère l'instance du modal par son ID HTML
    const modalElement = document.getElementById('addProductModal');
    if (modalElement) {
      const modalInstance = (window as any).bootstrap.Modal.getInstance(modalElement);
      modalInstance?.hide();
    }

    // 4. Rafraîchir la liste et nettoyer
    await this.loadMyProducts(); // Recharge la table HTML
    this.selectedFile = null;
    this.newProduct = { name: '', price: 0, description: '', image_url: '', category_id: '' };
    
    alert("Produit publié avec succès !");
    
  } catch (error: any) {
    alert("Erreur : " + error.message);
  } finally {
    this.loading.set(false);
  }
}

async loadMyProducts() {
    const user = this.supabaseService.currentUser();
    const { data } = await this.supabaseService.supabase
      .from('products')
      .select('*')
      .eq('seller_id', user?.id);
    this.myProducts.set(data || []);
  }

  async onDeleteProduct(id: string) {
    if (confirm('Supprimer ce produit ?')) {
      const { error } = await this.supabaseService.supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (!error) {
        // Mise à jour de la liste locale
        this.myProducts.set(this.myProducts().filter(p => p.id !== id));
      }
    }
  }
}
