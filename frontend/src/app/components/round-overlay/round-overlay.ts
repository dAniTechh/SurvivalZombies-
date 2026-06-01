import { Component, OnInit, OnDestroy } from '@angular/core';
import { SocketService } from '../../services/socket';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-round-overlay',
  standalone: true, // Arquitectura Standalone
  templateUrl: './round-overlay.html', // Corregido: sin .component
  styleUrls: ['./round-overlay.css']
})
export class RoundOverlayComponent implements OnInit, OnDestroy {

    public visible = false;
    public countdown = 0;
    public modoGameOver = false;

    private roundSubscription!: Subscription;
    private countdownInterval: any = null;

    constructor(private socketService: SocketService) {}

    ngOnInit(): void {
        // ── REACTIVIDAD PURA: Nos suscribimos al flujo de eventos del socket (Pilar 2) ──
        this.roundSubscription = this.socketService.roundEvent$.subscribe(event => {
            this.procesarEventoRonda(event);
        });
    }

    private procesarEventoRonda(event: any): void {
        const { evento, restante } = event;

        if (evento === 'CUENTA_ATRAS') {
            this.modoGameOver = false;
            this.visible = true;
            this.startCountdown(restante || 10);
            return;
        }

        if (evento === 'RONDA_COMPLETADA') {
            this.modoGameOver = false;
            this.visible = true;
            this.startCountdown(10);
            return;
        }

        if (evento === 'GAME_OVER') {
            this.modoGameOver = true;
            this.visible = true;
            this.stopCountdown();
            return;
        }

        if (evento === 'REINICIO' || evento === 'RONDA_INICIO') {
            this.modoGameOver = false;
            this.visible = false;
            this.stopCountdown();
            return;
        }
    }

    private startCountdown(segundos: number): void {
        this.countdown = segundos;
        this.stopCountdown();

        // Cuenta atrás a nivel de variables de TypeScript
        this.countdownInterval = setInterval(() => {
            if (this.countdown > 0) {
                this.countdown--;
            } else {
                this.stopCountdown();
                this.visible = false;
            }
        }, 1000);
    }

    private stopCountdown(): void {
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
            this.countdownInterval = null;
        }
    }

    // Botón de reiniciar: llama directamente al servicio
    public reiniciarPartida(): void {
        this.socketService.enviarReinicio();
    }

    ngOnDestroy(): void {
        this.stopCountdown();
        if (this.roundSubscription) {
            this.roundSubscription.unsubscribe();
        }
    }
}