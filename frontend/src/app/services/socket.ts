import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import SockJS from 'sockjs-client';

// Import dinámico para evitar que SSR/prerender intente incluir la variante node de stompjs
const loadStompJs = async () => {
  const mod: any = await import('stompjs/lib/stomp.js');
  return mod;
};

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private stompClient: any = null;
  private mySessionId: string | null = null;

  private gameStateSource = new BehaviorSubject<any>({});
  public gameState$: Observable<any> = this.gameStateSource.asObservable();

  private roundEventSource = new Subject<any>();
  public roundEvent$: Observable<any> = this.roundEventSource.asObservable();

  private hitEventSource = new Subject<any>();
  public hitEvent$: Observable<any> = this.hitEventSource.asObservable();

  constructor() {}

  public connect(nombre: string, skin: string): void {
    // 1. Apuntamos a localhost para que el navegador de Windows lo encuentre
    const socketUrl = 'http://localhost:8080/nexus-zombies';
    const socket: any = new SockJS(socketUrl, undefined, {} as any);

    loadStompJs()
      .then((mod: any) => {
        const overFn: any = mod?.over || mod?.Stomp?.over || mod?.default?.over || mod?.default?.Stomp?.over;
        if (typeof overFn !== 'function') {
          console.error('[ANGULAR-SOCKET] ❌ No se encontró Stomp.over en stompjs. mod keys=', Object.keys(mod || {}), 'mod=', mod);
          return;
        }

        // 2. Inicializamos el cliente STOMP
        this.stompClient = overFn(socket);

        const token = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('jwtToken') : null;
        const headers = { Authorization: 'Bearer ' + token };

        this.stompClient.connect(
          headers,
          () => {
            console.log('[ANGULAR-SOCKET] ✅ Conectado con éxito');

            this.stompClient.subscribe('/user/queue/init', (msg: any) => {
              const payload = JSON.parse(msg.body);
              this.mySessionId = payload.sessionId || null;
            });

            this.stompClient.subscribe('/topic/gamestate', (msg: any) => {
              const state = JSON.parse(msg.body);
              this.gameStateSource.next(state);
            });

            this.stompClient.subscribe('/topic/ronda', (msg: any) => {
              const event = JSON.parse(msg.body);
              this.roundEventSource.next(event);
            });

            this.stompClient.subscribe('/topic/hits', (msg: any) => {
              this.hitEventSource.next(JSON.parse(msg.body));
            });

            this.stompClient.send('/app/join', {}, JSON.stringify({ nombre, skin }));
          },
          (error: any) => {
            console.error('[ANGULAR-SOCKET] ❌ Error de conexión:', error);
          }
        );
      })
      .catch((err) => {
        console.error('[ANGULAR-SOCKET] ❌ No se pudo cargar stompjs:', err);
      });
  }

  public enviarInput(keys: any): void {
    if (this.stompClient?.connected) {
      this.stompClient.send('/app/input', {}, JSON.stringify(keys));
    }
  }

  public enviarSprint(sprint: boolean): void {
    if (this.stompClient?.connected) {
      this.stompClient.send('/app/sprint', {}, JSON.stringify({ activo: sprint }));
    }
  }

  public enviarDisparo(zombieId: string, headshot: boolean): void {
    if (this.stompClient?.connected) {
      this.stompClient.send('/app/shoot', {}, JSON.stringify({ zombieId, headshot }));
    }
  }

  public enviarInteraccion(): void {
    if (this.stompClient?.connected) {
      this.stompClient.send('/app/interact', {}, JSON.stringify({}));
    }
  }

  public enviarCambioArma(): void {
    if (this.stompClient?.connected) {
      this.stompClient.send('/app/switchWeapon', {}, JSON.stringify({}));
    }
  }

  public enviarReinicio(): void {
    if (this.stompClient?.connected) {
      this.stompClient.send('/app/restart', {}, JSON.stringify({}));
    }
  }

  public isConnected(): boolean {
    return this.stompClient?.connected || false;
  }
}