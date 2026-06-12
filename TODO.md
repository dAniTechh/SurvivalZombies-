# TODO - Limpieza de static legacy en backend

## Paso 1: Confirmación
- [x] Determinar que el frontend se usa en `:4200` (según feedback del usuario).

## Paso 2: Plan de cambios (sin ejecutar aún)
- [ ] Mover/renombrar `backend/src/main/resources/static/**` legacy a una carpeta `static/legacy/**` (para no romper carga de assets si alguien accede al backend).
- [ ] Dejar un `backend/src/main/resources/static/index.html` mínimo que apunte a Angular `:4200`.


## Paso 3: Implementación
- [ ] Realizar cambios en archivos del backend con edición controlada.

## Paso 4: Validación
- [ ] Probar que el juego sigue funcionando en `localhost:4200`.
- [ ] Probar que el backend no rompe endpoints/WS.

