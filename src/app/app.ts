import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './layout/header/header';
import { Footer } from './layout/footer/footer';
import { CartDrawer } from './shared/ui/cart-drawer/cart-drawer';
import { FondoAurora } from './shared/ui/fondo-aurora/fondo-aurora';

@Component({
  imports: [RouterOutlet, Header, Footer, CartDrawer, FondoAurora],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {}
