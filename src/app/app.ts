import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ProductList } from "./components/product-list/product-list";
import { Navbar } from "./components/navbar/navbar";
import { Auth } from './components/auth/auth';
import { Orders } from './components/orders/orders';
import { Profile } from './components/profile/profile';
import { Seller } from './components/seller/seller';
import { Footer } from './components/footer/footer';

@Component({
  selector: 'app-root',
  imports: [Navbar, RouterOutlet, Auth, Footer],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('e-commerce-supabase');

  currentView = signal<string>('shop'); // Par défaut on affiche la boutique

  changeView(viewName: string) {
    this.currentView.set(viewName);
  }
}
