# ZombiesFrontend (Frontend)

Frontend del juego **Zombies** construido con **Angular (Standalone)**. La lógica principal del juego corre en un *canvas* 2D y el estado del juego llega en tiempo real mediante **WebSockets/STOMP**.

---

## Índice

- [Stack Tecnológico](#stack-tecnológico)
- [Requisitos](#requisitos)
- [Cómo ejecutar (local)](#cómo-ejecutar-local)
- [Cómo compilar para producción](#cómo-compilar-para-producción)
- [Tests](#tests)
- [Docker / Nginx](#docker--nginx)
- [Arquitectura (componentes y flujo)](#arquitectura-componentes-y-flujo)
- [Autenticación (JWT)](#autenticación-jwt)
- [Comunicación en tiempo real (STOMP)](#comunicación-en-tiempo-real-stomp)
- [Controles del jugador](#controles-del-jugador)
- [Recursos estáticos](#recursos-estáticos)


---

## Stack Tecnológico

- **Angular** `21.2.x`
- **RxJS** `~7.8`
- **sockjs-client** `^1.6.1`
- **stompjs** `^2.3.3`
- **Angular SSR (Node/Express)** (config presente para SSR; el juego realmente se ejecuta en el navegador)
- **animejs** (cargado vía CDN en `index.html` para animaciones tipo HUD/floating-score)

---

## Requisitos

- Node.js compatible con el proyecto (según package.json/Angular CLI): **Node 20+** suele funcionar correctamente.
- Un navegador moderno.
- Backend del juego corriendo y accesible.

> Importante: el frontend asume el backend en `http://localhost:8080` (ver secciones de [Autenticación JWT] y [STOMP]).

---

## Cómo ejecutar (local)

En la carpeta `frontend/`:

```bash
npm install
npm run start
```

O equivalente con Angular CLI:

```bash
ng serve
```

Luego abre:

- **http://localhost:4200/**

El juego se conecta al backend cuando el usuario entra al mapa.

---

## Cómo compilar para producción

```bash
ng build
```

La salida queda en `dist/`.

---

## Tests

```bash
ng test
```

(El proyecto incluye configuración para Vitest en devDependencies; el comando usa el builder definido por Angular CLI.)

---

## Docker / Nginx

El frontend incluye un `Dockerfile` de dos etapas:

1. Build de Angular con `node:20-alpine`.
2. Servir el build estático con **Nginx**.

Archivo:

- `frontend/Dockerfile`
- `frontend/nginx.conf`

El contenedor expone:

- **80**

Se usa `try_files` para *SPA routing* (si existe una ruta, si no, cae a `index.html`).

---

## Arquitectura (componentes y flujo)

El árbol principal (componente raíz):

- `src/app/app.ts`
- `src/app/app.html`

El `App` controla si ya comenzó la partida:

- Antes de iniciar: se muestra `LoginComponent`.
- Después de iniciar: se muestra `GameCanvasComponent`.

### 1) Login

- `src/app/components/login/login.ts`
- `src/app/components/login/login.html`

Responsabilidades:

- Mostrar formulario de usuario (nombre y contraseña).
- Permitir registro y login contra el backend.
- Cargar ranking (top 3).
- Selección de skin (`jugador.png`, `jugador2.png`, `jugador3.png`, `jugador4.png`).
- Al hacer clic en **ENTRAR AL MAPA**, emite `{ nombre, skin }` hacia `App`.

### 2) Canvas del juego

- `src/app/components/game-canvas/game-canvas.ts`
- `src/app/components/game-canvas/game-canvas.html`
- `src/app/components/game-canvas/renderer.ts`

Responsabilidades:

- Crear la conexión STOMP via `SocketService`.
- Suscribirse al estado del juego (`gameState$`) para renderizar.
- Capturar inputs de teclado y ratón y enviarlos al backend.
- Renderizar el mundo y overlays en `renderer.ts` usando `CanvasRenderingContext2D`.

---

## Autenticación (JWT)

El login/registro se maneja con `fetch` desde `LoginComponent`.

Rutas usadas (backend):

- `POST http://localhost:8080/api/usuarios/registro`
- `POST http://localhost:8080/api/usuarios/login`
- `GET  http://localhost:8080/api/usuarios/ranking`

Al hacer login exitoso:

- Se guarda el token en `sessionStorage` bajo la clave: `jwtToken`.
- El nombre actual se guarda como: `jugadorActual`.

---

## Comunicación en tiempo real (STOMP)

La conexión WebSocket/STOMP está encapsulada en:

- `src/app/services/socket.ts`

### URL de conexión

```ts
const socketUrl = 'http://localhost:8080/nexus-zombies';
```

Se crea un cliente:

- `SockJS(socketUrl)`
- STOMP via `stompjs` (carga dinámica para evitar issues SSR)

### Autorización

Al conectar, se envía header:

- `Authorization: Bearer <jwtToken>`

Token leído desde:

- `sessionStorage.getItem('jwtToken')`

### Suscripciones

- `/user/queue/init`
  - Se espera un payload JSON con `sessionId`
- `/topic/gamestate`
  - Se recibe el estado completo del juego y se publica en `gameState$`
- `/topic/ronda`
  - Eventos de ronda a `roundEvent$`
- `/topic/hits`
  - Eventos de impactos a `hitEvent$`

### Publicaciones (envío de acciones)

El frontend hace `send` a destinos `app/*`:

- `/app/join` con `{ nombre, skin }`
- `/app/input` con las teclas presionadas (objeto `keys`)
- `/app/sprint` con `{ activo: boolean }`
- `/app/shoot` con `{ zombieId, headshot }`
- `/app/interact` (acción F)
- `/app/switchWeapon` (acción Q)
- `/app/restart` (reinicio)

---

## Controles del jugador

En `GameCanvasComponent` se usan `@HostListener` para capturar eventos del navegador.

### Teclado

- Movimiento: `W A S D`
- Sprint: `Shift`
- Interacción: `F`
- Cambiar arma: `Q`

Se envían cambios al backend con caché para no saturar:

- Se envía `/app/input` solo si cambió el estado de teclas.
- Se envía `/app/sprint` cuando cambia el `Shift`.

### Ratón

- `mousedown` (clic): dispara.
- Se calcula la posición “world” en el mapa según la cámara del jugador (basado en `miJugador.x/y`).
- Detecta *headshot* si el click cae cerca del zombie (umbral usado en el código).
- También llama a una función del renderer para visualizar trazadores/bala.

---

## Recursos estáticos

Imágenes y assets están en:

- `frontend/public/assets/`

Algunas skins y sprites relevantes:

- `jugador.png`, `jugador2.png`, `jugador3.png`, `jugador4.png`
- `zombie_normal.png`, `zombie_corredor.png`

En el renderer, las rutas se cargan con prefijo `/assets/...`.

---


## Estructura de archivos (referencia rápida)

- `src/app/app.ts` / `src/app/app.html`: decide login vs juego
- `src/app/components/login/*`: UI de acceso
- `src/app/components/game-canvas/*`: lógica del juego en canvas
- `src/app/components/game-canvas/renderer.ts`: motor gráfico (render 2D)
- `src/app/services/socket.ts`: cliente STOMP
- `public/assets/*`: imágenes del juego

---


