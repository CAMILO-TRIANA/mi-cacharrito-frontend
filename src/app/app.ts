import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navegacion } from './navegacion/navegacion';
import { Toasts } from './shared/toasts';
import { Confirmar } from './shared/confirmar';

@Component({
  imports: [RouterOutlet, Navegacion, Toasts, Confirmar],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {}
