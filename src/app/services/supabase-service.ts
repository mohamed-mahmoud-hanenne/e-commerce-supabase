import { Injectable, signal } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  public supabase: SupabaseClient;

  // Signal global pour suivre l'utilisateur connecté dans toute l'application
  currentUser = signal<User | null>(null);
  userProfile = signal<any>(null);

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);

    // Écouter les changements d'état d'authentification (connexion/déconnexion)
    this.supabase.auth.onAuthStateChange((event, session) => {
      this.currentUser.set(session?.user ?? null);
      if (session?.user) {
        this.getProfile(); // Charger le profil dès qu'on se connecte
      } else {
        this.userProfile.set(null);
      }
    });
  }

  async getProfile() {
    const user = this.currentUser();
    if (!user) return;

    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!error && data) {
      this.userProfile.set(data);
    }
  }

  // Mettre à jour la méthode existante pour qu'elle actualise le Signal
  async updateProfile(profile: any) {
    const user = this.currentUser();
    const { error } = await this.supabase
      .from('profiles')
      .upsert({ id: user?.id, ...profile, updated_at: new Date() });

    if (error) throw error;

    // On rafraîchit le signal local après modification
    this.userProfile.set(profile);
  }

  // Inscription
  async signUp(email: string, stylePassword: string) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password: stylePassword,
    });
    if (error) throw error;
    return data;
  }

  // Connexion
  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  }

  // Déconnexion
  async signOut() {
    const { error } = await this.supabase.auth.signOut();

    if (error) throw error;
  }

  // Récupérer les produits (méthode précédente gardée)
  async getProducts() {
    const { data, error } = await this.supabase
      .from('products')
      .select(`id, name, price, description, image_url, categories ( name )`);
    if (error) throw error;
    return data;
  }

  async createOrder(totalAmount: number, items: any[]) {
    // Récupérer la session actuelle de manière synchrone pour être sûr d'avoir l'ID
    const {
      data: { session },
    } = await this.supabase.auth.getSession();
    const user = session?.user;

    if (!user) {
      throw new Error('Session utilisateur introuvable. Veuillez vous reconnecter.');
    }

    // 1. Insérer la commande principale
    const { data: orderData, error: orderError } = await this.supabase
      .from('orders')
      .insert({
        user_id: user.id, // On utilise l'ID récupéré directement de la session
        total_amount: totalAmount,
        status: 'pending',
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // 2. Préparer les lignes de détails
    const orderItemsToInsert = items.map((item) => ({
      order_id: orderData.id,
      product_id: item.id,
      quantity: item.quantity,
      unit_price: item.price,
    }));

    // 3. Insérer dans order_items
    const { error: itemsError } = await this.supabase
      .from('order_items')
      .insert(orderItemsToInsert);

    if (itemsError) throw itemsError;

    return orderData;
  }

  // requête pour récupérer les commandes d'un utilisateur avec les détails des items et produits associés
  async getOrdersByUser(userId: string) {
    return await this.supabase
      .from('orders')
      .select(
        `
      id,
      created_at,
      total_amount,
      status,
      order_items (
        quantity,
        unit_price,
        products ( name )
      )
    `,
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
  }

  // Ajouter cette méthode dans la classe
  async uploadAvatar(filePath: string, file: File) {
    const { data, error } = await this.supabase.storage
      .from('avatars') // Nom du bucket à créer dans l'interface Supabase
      .upload(filePath, file, { upsert: true });

    if (error) throw error;

    // Récupérer l'URL publique de l'image
    const { data: urlData } = this.supabase.storage.from('avatars').getPublicUrl(filePath);
    return urlData.publicUrl;
  }

  async becomeSeller() {
    const user = this.currentUser();
    if (!user) return;

    const { error } = await this.supabase
      .from('profiles')
      .update({ is_seller: true })
      .eq('id', user.id);

    if (error) throw error;

    // Mettre à jour le signal local pour que l'interface réagisse
    const currentProfile = this.userProfile();
    this.userProfile.set({ ...currentProfile, is_seller: true });
  }

  async addProduct(product: any) {
    const user = this.currentUser();
    const { data, error } = await this.supabase
      .from('products')
      .insert([{ ...product, seller_id: user?.id }])
      .select();

    if (error) throw error;
    return data;
  }

  // get categories pour le formulaire d'ajout de produit
  async getCategories() {
    const { data, error } = await this.supabase.from('categories').select('id, name').order('name');

    if (error) throw error;
    return data;
  }

  // Récupérer les produits d'un vendeur spécifique
  async getSellerProducts() {
    const user = this.currentUser();
    const { data, error } = await this.supabase
      .from('products')
      .select('*')
      .eq('seller_id', user?.id);
    if (error) throw error;
    return data;
  }

  // Supprimer un produit par son ID
  async deleteProduct(productId: string) {
    const { error } = await this.supabase.from('products').delete().eq('id', productId);
    if (error) throw error;
  }

  // Récupérer tous les profils (pour voir qui est vendeur/admin)
  async getAllProfiles() {
    const { data, error } = await this.supabase.from('profiles').select('*');
    if (error) throw error;
    return data;
  }

  // Récupérer toutes les commandes de la plateforme
  async getAllOrders() {
    const { data, error } = await this.supabase
      .from('orders')
      .select('*, profiles(full_name)') // Jointure pour avoir le nom du client
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  
  // uploader une image de produit et retourner son URL publique
  async uploadProductImage(file: File): Promise<string> {
    const fileName = `${Date.now()}_${file.name}`; // Nom unique
    const { data, error } = await this.supabase.storage.from('products').upload(fileName, file);

    if (error) throw error;

    // Récupérer l'URL publique
    const { data: urlData } = this.supabase.storage.from('products').getPublicUrl(fileName);

    return urlData.publicUrl;
  }

  // Mettre à jour le statut d'une commande
async updateOrderStatus(orderId: string, newStatus: string) {
  const { error } = await this.supabase
    .from('orders')
    .update({ status: newStatus })
    .eq('id', orderId);
  
  if (error) throw error;
}
}
