import { Component, ElementRef, OnInit, ViewChild, NgZone, OnDestroy, HostListener, Input } from '@angular/core'; 
import { SocketService } from '../../services/socket'; 
import { Subscription } from 'rxjs';
import { RoundOverlayComponent } from '../round-overlay/round-overlay';

// @ts-ignore - Salta el chequeo estricto de tipos para el motor gráfico de JS
import { render, agregarTrazadorBala } from './renderer'; 

@Component({
  selector: 'app-game-canvas',
  standalone: true,
  providers: [],
  imports: [RoundOverlayComponent], // Importamos el overlay cinematográfico
  templateUrl: './game-canvas.html',
  styleUrls: ['./game-canvas.css']
})
export class GameCanvasComponent implements OnInit, OnDestroy {

    @ViewChild('gameCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
    private ctx!: CanvasRenderingContext2D;
    private gameSubscription!: Subscription;
    public gameState: any = {};

    // ── Objeto de Teclado con Firma de Índice ──
    public keys: { [key: string]: boolean } = { 
        w: false, 
        a: false, 
        s: false, 
        d: false, 
        shift: false 
    };

    // Cache para evitar saturar el canal de WebSockets
    private ultimoEstadoTeclas: string | null = null;
    private ultimoSprintCache: string | null = null;

    // ── NUEVO: Variables Reactivas para la Caja Mágica (Prompt 8) ──
    public cajaNotifTexto = '';
    public cajaNotifColor = '#fff';
    public cajaNotifVisible = false;
    private cajaTimeout: any = null;

    // Recibimos los datos de la skin y nombre desde el componente padre (Login)
    @Input() public nombre = 'Jugador';
    @Input() public skin = 'jugador.png';

    constructor(
        private socketService: SocketService,
        private ngZone: NgZone
    ) {}

    ngOnInit(): void {
        this.ctx = this.canvasRef.nativeElement.getContext('2d')!;
        
        const jugador = sessionStorage.getItem('jugadorActual') || 'Jugador';
        this.socketService.connect(jugador, 'skin1');

        this.gameSubscription = this.socketService.gameState$.subscribe(state => {
            this.gameState = state;
             console.log("ESTADO DEL JUEGO:", state);
        });

        this.ngZone.runOutsideAngular(() => {
            this.gameLoop();
        });
    }

    private gameLoop(): void {
        if (!this.socketService.isConnected()) {
            requestAnimationFrame(() => this.gameLoop());
            return;
        }

        this.enviarInputsSiCambian();

        this.render();

        requestAnimationFrame(() => this.gameLoop());
    }

    private render(): void {
        const canvasEl = this.canvasRef.nativeElement;
        const miId = this.socketService.isConnected() ? 'mio' : ''; 
        render(canvasEl, this.ctx, this.gameState, miId);
    }

    // ── NUEVO: Escuchador del Evento de la Caja Mágica (de tu cajaMagica.js) ──
    @HostListener('window:caja:evento', ['$event'])
    onCajaEvento(e: any): void {
        const p = e.detail;

        if (p.evento === 'ABRIENDO') {
            this.mostrarCajaNotificacion(`🎰 ${p.jugador} está abriendo la caja...`, '#f0c040', 3200);
            return;
        }

        if (p.evento === 'RESULTADO') {
            const NOMBRES_ARMA: { [key: string]: string } = {
                PISTOLA:      'Pistola 9mm',
                ESCOPETA:     'Escopeta de Corredera',
                FUSIL_ASALTO: 'Fusil de Asalto M4',
                SNIPER:       'Rifle de Francotirador',
                THUNDER:      '⚡ Cañón Thunder',
            };
            const nombre = NOMBRES_ARMA[p.arma] ?? p.arma;
            const esMalo  = p.arma === 'PISTOLA';

            this.mostrarCajaNotificacion(
                esMalo ? `😤 Pistola... qué mala suerte` : `🎁 ¡${nombre}!`,
                esMalo ? '#e24b4a' : '#1d9e75',
                3500
            );

            if (!p.activa) {
                setTimeout(() => {
                    this.mostrarCajaNotificacion('📦 La caja se ha movido a otro lugar...', '#888', 2500);
                }, 3600);
            }
        }
    }

    // Método reactivo para gestionar el temporizador de la notificación
    private mostrarCajaNotificacion(texto: string, color: string, duracion: number): void {
        this.cajaNotifTexto = texto;
        this.cajaNotifColor = color;
        this.cajaNotifVisible = true;

        if (this.cajaTimeout) {
            clearTimeout(this.cajaTimeout);
        }

        this.cajaTimeout = setTimeout(() => {
            this.cajaNotifVisible = false;
        }, duracion);
    }

    // ── Gestión de Teclado Nativa de Angular (@HostListener) ──
    @HostListener('window:keydown', ['$event'])
    onKeyDown(e: KeyboardEvent): void {
        if (!this.socketService.isConnected()) return;

        const key = e.key.toLowerCase();

        if (key === 'f') {
            this.socketService.enviarInteraccion();
            return;
        }

        if (key === 'q') {
            this.socketService.enviarCambioArma();
            return;
        }

        if (key === 'shift') {
            this.keys['shift'] = true;
        } else if (key in this.keys) {
            this.keys[key] = true;
        }
    }

    @HostListener('window:keyup', ['$event'])
    onKeyUp(e: KeyboardEvent): void {
        const key = e.key.toLowerCase();

        if (key === 'shift') {
            this.keys['shift'] = false;
        } else if (key in this.keys) {
            this.keys[key] = false;
        }
    }

    private enviarInputsSiCambian(): void {
        const payload = JSON.stringify(this.keys);
        if (payload !== this.ultimoEstadoTeclas) {
            this.ultimoEstadoTeclas = payload;
            this.socketService.enviarInput(this.keys);
        }

        const sprintPayload = JSON.stringify({ activo: !!this.keys['shift'] });
        if (sprintPayload !== this.ultimoSprintCache) {
            this.ultimoSprintCache = sprintPayload;
            this.socketService.enviarSprint(this.keys['shift']);
        }
    }

    // ── Lógica de Disparos con Clic del Ratón ──
    @HostListener('window:mousedown', ['$event'])
    onMouseDown(e: MouseEvent): void {
        if (!this.socketService.isConnected() || !this.gameState.jugadores) return;

        const canvasEl = this.canvasRef.nativeElement;
        const rect   = canvasEl.getBoundingClientRect();
        const scaleX = canvasEl.width  / rect.width;
        const scaleY = canvasEl.height / rect.height;

        const screenX = (e.clientX - rect.left) * scaleX;
        const screenY = (e.clientY - rect.top)  * scaleY;

        const miJugadorId = 'mio'; 
        const miJugador   = this.gameState.jugadores?.find((j: any) => j.id === miJugadorId) || this.gameState.jugadores[0];

        const MAP_W = 2400, MAP_H = 1800;
        const halfW = canvasEl.width / 2, halfH = canvasEl.height / 2;

        let camX = miJugador ? miJugador.x : halfW;
        let camY = miJugador ? miJugador.y : halfH;
        camX = Math.max(halfW, Math.min(camX, MAP_W - halfW));
        camY = Math.max(halfH, Math.min(camY, MAP_H - halfH));

        const worldX = screenX - halfW + camX;
        const worldY = screenY - halfH + camY;

        const origenX = miJugador?.x ?? camX;
        const origenY = miJugador?.y ?? camY;
        agregarTrazadorBala(origenX, origenY, worldX, worldY);

        if (this.gameState.zombies) {
            const target = this.gameState.zombies.find((z: any) =>
                Math.hypot(z.x - worldX, z.y - worldY) < 35
            );

            if (target) {
                const esHeadshot = Math.hypot(target.x - worldX, target.y - worldY) < 12;
                this.socketService.enviarDisparo(target.id, esHeadshot);
            }
        }
    }

    ngOnDestroy(): void {
        if (this.gameSubscription) {
            this.gameSubscription.unsubscribe();
        }
        if (this.cajaTimeout) {
            clearTimeout(this.cajaTimeout);
        }
    }
}