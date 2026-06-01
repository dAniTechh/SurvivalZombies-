import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule], // Habilita binding [(ngModel)] y directivas
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent implements OnInit {

    // Variables de enlace (Two-way data binding)
    public username = '';
    public password = '';
    public selectedSkin = 'jugador.png';
    public loginExitoso = false;

    // Lista de récords (MySQL)
    public rankingList: any[] = [];

    // Evento para avisar al componente principal que empiece el juego
    @Output() onStartGame = new EventEmitter<{ nombre: string, skin: string }>();

    public skinOptions = [
        { img: 'assets/jugador.png',  file: 'jugador.png'  },
        { img: 'assets/jugador2.png', file: 'jugador2.png' },
        { img: 'assets/jugador3.png', file: 'jugador3.png' },
        { img: 'assets/jugador4.png', file: 'jugador4.png' }
    ];

    constructor() {}

    ngOnInit(): void {
        this.cargarRanking();
    }

    public selectSkin(skinFile: string): void {
        this.selectedSkin = skinFile;
    }

    public async registrar(): Promise<void> {
        const datos = { nombre: this.username, password: this.password };
        try {
            const respuesta = await fetch('/api/usuarios/registro', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });

            if (respuesta.ok) {
                alert("¡Usuario registrado con éxito! Ahora puedes iniciar sesión.");
            } else {
                const errorMsg = await respuesta.text();
                alert(errorMsg);
            }
        } catch (error) {
            console.error("Error de red:", error);
        }
    }

    public async login(): Promise<void> {
        const datos = { nombre: this.username, password: this.password };
        try {
            const respuesta = await fetch('/api/usuarios/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });

            if (respuesta.ok) {
                const data = await respuesta.json();
                sessionStorage.setItem('jwtToken', data.token);
                sessionStorage.setItem('jugadorActual', this.username);
                
                alert("¡Bienvenido, " + this.username + "!");
                this.loginExitoso = true; // Habilita el botón "Entrar al mapa"
            } else {
                alert("Credenciales incorrectas.");
            }
        } catch (error) {
            console.error("Error de login:", error);
        }
    }

    public entrarAlMapa(): void {
        if (!this.username) {
            alert('¡Escribe tu nombre antes de empezar!');
            return;
        }
        // Emitimos el evento hacia el AppComponent principal para arrancar el Canvas
        this.onStartGame.emit({ nombre: this.username, skin: this.selectedSkin });
    }

    private async cargarRanking(): Promise<void> {
        try {
            const respuesta = await fetch('/api/usuarios/ranking');
            if (respuesta.ok) {
                this.rankingList = await respuesta.json();
            }
        } catch (error) {
            console.error("No se pudo obtener el ranking:", error);
        }
    }
}