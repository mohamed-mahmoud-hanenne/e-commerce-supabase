import { Routes } from '@angular/router';
import { ProductList } from './components/product-list/product-list';
import { Seller } from './components/seller/seller';
import { Admin } from './components/admin/admin';
import { Profile } from './components/profile/profile';
import { Orders } from './components/orders/orders';
import { authGuard } from './guards/auth-guard';
import { adminGuard } from './guards/admin-guard';

export const routes: Routes = [
  { path: '', component: ProductList },
  { 
    path: 'vendre', 
    component: Seller, 
    canActivate: [authGuard] // Protection connexion
  },
    { 
    path: 'commandes', 
    component: Orders, 
    canActivate: [authGuard] // Protection connexion
  },
  { 
    path: 'admin', 
    component: Admin, 
    canActivate: [authGuard, adminGuard] // Protection connexion + admin
  },
  { path: 'profil', component: Profile, canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];
