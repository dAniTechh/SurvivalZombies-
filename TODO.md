# TODO - Arreglo "No aparece mapa ni zombies al entrar"

- [ ] Diagnosticar causa raíz en frontend: comprobar que se renderiza el canvas y que el juego recibe `gameState` real desde websocket.
- [ ] Revisar `renderer.ts` y `game-canvas.ts` para validar que `render()` maneja estados vacíos y que `canvas` tiene tamaño/estilos visibles.
- [ ] Revisar backend STOMP: confirmar que `/topic/gamestate` envía estado y que el join inicia la primera ronda.
- [ ] Aplicar fix: si el mapa no aparece por estado vacío, forzar inicialización al hacer join (mensaje/endpoint correcto) o corregir suscripción/prefijos.
- [ ] Aplicar fix: corregir ruta de STOMP `/user/queue/init` (envío/recepción) y asegurar que el cliente se conecta con el token correcto (y que el backend acepta con CORS).
- [ ] Validar con pruebas locales: abrir consola del navegador y verificar logs de `[ANGULAR-SOCKET]`, confirmación de `Connected`, y recepción de `/topic/gamestate`.

