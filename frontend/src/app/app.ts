import { Component } from '@angular/core';
import { LoginComponent } from './components/login/login';
import { GameCanvasComponent } from './components/game-canvas/game-canvas';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [LoginComponent, GameCanvasComponent], // Importamos los subcomponentes
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
// ── MODIFICADO: Cambiamos 'AppComponent' por 'App' para coincidir con tus archivos de arranque main.ts ──
export class App { 
    public partidaIniciada = false;
    public nombreJugador = '';
    public skinSeleccionada = 'jugador.png';

    public iniciarJuego(datos: { nombre: string, skin: string }): void {
        this.nombreJugador = datos.nombre;
        this.skinSeleccionada = datos.skin;
        this.partidaIniciada = true; // Cambia la vista de forma reactiva al Canvas
    }
}