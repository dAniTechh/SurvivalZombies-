import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent implements OnInit {

    public username = '';
    public password = '';
    public selectedSkin = 'jugador.png';
    public loginExitoso = false;
    public rankingList: any[] = [];

    @Output() onStartGame = new EventEmitter<{ nombre: string, skin: string }>();

    public skinOptions = [
        { img: 'assets/jugador.png',  file: 'jugador.png'  },
        { img: 'assets/jugador2.png', file: 'jugador2.png' },
        { img: 'assets/jugador3.png', file: 'jugador3.png' },
        { img: 'assets/jugador4.png', file: 'jugador4.png' }
    ];

    constructor() {}

    // Normaliza payload para backend: backend usa Usuario.nombre y Usuario.password
    private buildLoginPayload() {
        return { nombre: this.username, password: this.password };
    }


    ngOnInit(): void {
        this.cargarRanking();
    }

    public selectSkin(skinFile: string): void {
        this.selectedSkin = skinFile;
    }

    public async registrar(): Promise<void> {
        const datos = this.buildLoginPayload();

        try {
            // ── CORREGIDO: Apunta al puerto 8080 de Spring Boot ──
            const respuesta = await fetch('http://localhost:8080/api/usuarios/registro', {
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
            alert("No se pudo conectar con el servidor Backend.");
        }
    }

    public async login(): Promise<void> {
        const datos = this.buildLoginPayload();

        try {
            // ── CORREGIDO: Apunta al puerto 8080 de Spring Boot ──
            const respuesta = await fetch('http://localhost:8080/api/usuarios/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });

            if (respuesta.ok) {
                const data = await respuesta.json();
                sessionStorage.setItem('jwtToken', data.token);
                sessionStorage.setItem('jugadorActual', this.username);
                
                alert("¡Bienvenido, " + this.username + "!");
                this.loginExitoso = true; 
            } else {
                alert("Credenciales incorrectas.");
            }
        } catch (error) {
            console.error("Error de login:", error);
            alert("No se pudo conectar con el servidor Backend.");
        }
    }

    public entrarAlMapa(): void {
        if (!this.username) {
            alert('¡Escribe tu nombre antes de empezar!');
            return;
        }
        this.onStartGame.emit({ nombre: this.username, skin: this.selectedSkin });
    }

    private async cargarRanking(): Promise<void> {
        try {
            // ── CORREGIDO: Apunta al puerto 8080 de Spring Boot ──
            const respuesta = await fetch('http://localhost:8080/api/usuarios/ranking');
            if (respuesta.ok) {
                this.rankingList = await respuesta.json();
            }
        } catch (error) {
            console.error("No se pudo obtener el ranking:", error);
        }
    }
}