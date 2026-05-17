import { Routes } from '@angular/router';
import { ProductList } from './components/product-list/product-list';
import { Seller } from './components/seller/seller';
import { Admin } from './components/admin/admin';
import { Profile } from './components/profile/profile';
import { Orders } from './components/orders/orders';

export const routes: Routes = [
  { path: '', component: ProductList },
  { path: 'vendre', component: Seller },
  { path: 'admin', component: Admin },
  { path: 'profil', component: Profile },
  { path: 'commandes', component: Orders },
  { path: '**', redirectTo: '' }, // Redirige vers l'accueil si l'URL n'existe pas
];
