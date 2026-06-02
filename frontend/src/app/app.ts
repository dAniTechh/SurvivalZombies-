import { Component } from '@angular/core';
import { LoginComponent } from './components/login/login';
import { GameCanvasComponent } from './components/game-canvas/game-canvas';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [LoginComponent, GameCanvasComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  public partidaIniciada = false;
  public nombreJugador = '';
  public skinSeleccionada = 'jugador.png';

  public iniciarJuego(datos: { nombre: string; skin: string }): void {
    this.nombreJugador = datos.nombre;
    this.skinSeleccionada = datos.skin;
    this.partidaIniciada = true;
  }
}
