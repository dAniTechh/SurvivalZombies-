
# Nexus Zombies - Servidor Autoritativo (Backend)

![Java](https://img.shields.io/badge/Java-17+-ED8B00?style=for-the-badge&logo=java&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.2.x-6DB33F?style=for-the-badge&logo=spring&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-7.0-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![WebSocket](https://img.shields.io/badge/WebSocket-STOMP-000000?style=for-the-badge)

Este repositorio alberga la infraestructura del **servidor autoritativo** para *Nexus Zombies*, un videojuego multijugador cooperativo de supervivencia en tiempo real con perspectiva cenital (2D Top-Down Shooter). 

A diferencia de las arquitecturas web tradicionales basadas exclusivamente en el modelo petición-respuesta (REST), este sistema implementa un **Game Loop asíncrono autoritativo** corriendo en hilos dedicados a ~60 Ticks por Segundo (TPS). El servidor valida, calcula y distribuye de manera absoluta la física de las entidades, la lógica de colisiones, la inteligencia artificial de los enemigos y el flujo de rondas, mitigando por completo la posibilidad de inyección de trampas (*hacks*) en los clientes.

---

##  Índice General

1. [Visión General de la Arquitectura](#-visión-general-de-la-arquitectura)
2. [Estructura Completa del Proyecto](#-estructura-completa-del-proyecto)
3. [El Núcleo del Servidor: Motores de Juego (Game Loop)](#-el-núcleo-del-servidor-motores-de-juego-game-loop)
4. [Estrategia de Datos Políglota (MySQL + MongoDB)](#-estrategia-de-datos-políglota-mysql--mongodb)
5. [Seguridad y Autenticación Stateless (JWT + Spring Security)](#-seguridad-y-autenticación-stateless-jwt--spring-security)
6. [Protocolo de Red en Tiempo Real (WebSockets + STOMP)](#-protocolo-de-red-en-tiempo-real-websockets--stomp)
7. [Endpoints de la API REST](#-endpoints-de-la-api-rest)
8. [Orquestación de Contenedores y DevOps (Docker Compose)](#-orquestación-de-contenedores-y-devops-docker-compose)
9. [Guía de Ejecución y Despliegue](#-guía-de-ejecución-y-despliegue)

---

##  Visión General de la Arquitectura

El diseño arquitectónico del backend se rige bajo principios de desacoplamiento absoluto, alta concurrencia y tolerancia a fallos:

* **Modelo de Servidor Autoritativo:** El cliente (Angular) actúa exclusivamente como un intérprete gráfico "tonto" que envía las pulsaciones de teclado y coordenadas del puntero del ratón, y renderiza el estado devuelto por el servidor. Toda la lógica de simulación física y toma de decisiones se procesa en el backend.
* **Concurrencia Desacoplada:** El procesamiento intensivo de hilos asíncronos y cíclicos se gestiona mediante un pool de tareas programadas (`ThreadPoolTaskScheduler`), evitando que la carga de cálculo del bucle del juego colapse el despachador de peticiones HTTP de Tomcat o las conexiones activas de WebSockets.
* **Persistencia Políglota:** Se utiliza una base de datos relacional para operaciones transaccionales críticas y una NoSQL orientada a documentos para telemetría masiva de datos no estructurados, optimizando los tiempos de escritura y lectura de acuerdo al contexto del sistema.

---

##  Estructura Completa del Proyecto

El código fuente está organizado de forma modular siguiendo las directrices de Clean Architecture y patrones orientados al dominio:

```text
src/main/java/com/example/demo/
│
├── config/                  # Configuraciones estructurales de la infraestructura
│   ├── SchedulerConfig.java # Pool de hilos dedicado al Game Loop asíncrono
│   └── WebSocketConfig.java # Configuración del Message Broker, CORS y endpoints STOMP
│
├── controller/              # Interfaces de entrada de datos (REST y WebSockets)
│   ├── AnalyticsController.java # Endpoints HTTP para telemetría y Big Data de partidas
│   ├── GameController.java      # Enrutamiento de eventos inbound de STOMP (Inputs de jugadores)
│   └── UsuarioController.java   # Endpoints HTTP para el ciclo de autenticación (Login/Registro)
│
├── engine/                  # EL NÚCLEO AUTORITATIVO (Simulación física e IA)
│   ├── DamageEngine.java    # Procesamiento balístico, hitboxes complejas y multiplicadores
│   ├── GameEngine.java      # Orquestador del bucle principal y sincronización a 60 TPS
│   ├── GameManager.java     # Reglas del juego, oleadas, economía interna y estado del mapa
│   ├── MensajeBroker.java   # Serializador y distribuidor masivo del estado del mundo (Broadcast)
│   └── ZombieEngine.java    # Inteligencia artificial, pathfinding dinámico y colisiones AABB
│
├── model/                   # Modelos de dominio, entidades JPA y documentos NoSQL
│   ├── CajaMagica.java      # POJO - Control de aleatoriedad en el cofre de armas
│   ├── Drop.java            # POJO - Multiplicadores y modificadores del juego (Insta-Kill, Max-Ammo)
│   ├── PartidaCompletada.java # Documento NoSQL mapeado para MongoDB Analytics
│   ├── Player.java          # POJO - Estado dinámico del jugador en memoria de alta velocidad
│   ├── Position.java        # Clase de utilidad matemática para vectores en 2D
│   ├── Puerta.java          # POJO - Delimitador de zonas bloqueadas en el mapa
│   ├── Usuario.java         # Entidad relacional mapeada para MySQL
│   └── Zombie.java          # POJO - Atributos cinemáticos y de combate de los enemigos
│
├── repository/              # Capa de abstracción de acceso a datos (DAOs)
│   ├── PartidaRepository.java # Operaciones sobre MongoDB
│   ├── RankingProjection.java # Proyección JPA para consultas de agregación optimizadas
│   └── UsuarioRepository.java # Operaciones relacionales sobre MySQL (Búsquedas por username)
│
├── security/                # Infraestructura perimetral y criptografía
│   ├── AuditService.java    # Trazabilidad de accesos e incidencias de seguridad
│   ├── JwtAuthenticationFilter.java # Filtro interceptor HTTP Stateless
│   ├── JwtService.java      # Extractor, validador y generador de tokens criptográficos
│   └── SecurityConfig.java  # Configuración de políticas de acceso, encriptación y filtros
│
└── service/                 # Lógica de negocio tradicional
    ├── AnalyticService.java # Agregaciones y guardado asíncrono de partidas
    └── UsuarioService.java  # Operaciones de verificación, registro y hashing de credenciales

```

---

##  El Núcleo del Servidor: Motores de Juego (Game Loop)

El subsistema localizado en `com.example.demo.engine` representa la innovación técnica central del TFM. Funciona de manera asíncrona desacoplada del ciclo web tradicional:

### 1. `GameEngine.java`

Gestiona el latido central de la partida. Utilizando la anotación `@Scheduled(fixedRate = 16)` garantiza una ejecución constante cada **16.67 milisegundos (~60 ticks por segundo)**. En cada iteración:

* Recoge la cola de variables cinemáticas enviadas por los clientes.
* Invoca de forma secuencial a los motores de físicas, IA y daño.
* Instancia a `MensajeBroker` para empaquetar una "fotografía completa del mundo" y realizar un broadcast masivo inmediato a todos los terminales.

### 2. `ZombieEngine.java`

Controla el comportamiento y movimiento de las hordas enemigas en tiempo real:

* **Pathfinding Dinámico:** Calcula vectores de aproximación óptimos analizando las coordenadas relativas del jugador vivo más cercano.
* **Físicas de Colisiones (AABB):** Implementa el algoritmo de *Axis-Aligned Bounding Boxes* (Cajas Delimitadoras Alineadas con los Ejes) para evitar el solapamiento entre zombis, delimitar los muros físicos de las 7 zonas del mapa y validar si un enemigo ha alcanzado el radio de contacto del jugador para infligirle daño.

### 3. `DamageEngine.java`

Procesa las interacciones balísticas calculadas por coordenadas vectoriales:

* Analiza los eventos de disparo transmitidos por los clientes (`/app/shoot`).
* Verifica la trayectoria de los proyectiles contra las coordenadas tridimensionales de las hitboxes de los zombis activos.
* **Cálculo de Multiplicadores:** Determina de forma precisa si el impacto se localizó en el epicentro de la entidad (bonificación por *headshot*) o en el radio exterior, deduciendo la salud correspondiente del enemigo y asignando de forma automática los puntos económicos al jugador.

### 4. `GameManager.java`

Controla el estado macroscópico del juego y la economía interna de la partida:

* **Escalado Matemático de Dificultad:** Aplica ecuaciones exponenciales en cada transición de oleada, incrementando la salud base (`Salud = Base * (1.15^Ronda)`), el volumen de zombis concurrentes y su velocidad lineal.
* **Gestión del Entorno:** Controla de forma segura el inventario de armas de la Caja Mágica, la expiración de los suministros soltados por los enemigos (*drops* como munición máxima o bajas instantáneas) y la validación de transacciones financieras cuando un usuario interactúa con una puerta bloqueada.

---

##  Estrategia de Datos Políglota (MySQL + MongoDB)

El backend optimiza el rendimiento del almacenamiento de datos implementando dos paradigmas diferenciados según el tipo de información tratada:

```
                               ┌───────────────┐
                               │  SPRING BOOT  │
                               └───────┬───────┘
                                       │
                ┌──────────────────────┴──────────────────────┐
                ▼                                             ▼
       📂 Paradigma Relacional                       📂 Paradigma NoSQL
       ┌──────────────────────┐                      ┌──────────────────────┐
       │      MySQL 8.0       │                      │     MongoDB 7.0      │
       ├──────────────────────┤                      ├──────────────────────┤
       │ - Cuentas de Usuario │                      │ - Big Data Analytics │
       │ - Sesiones JWT       │                      │ - Historial de Armas │
       │ - Highscores Global  │                      │ - Métricas Partida   │
       └──────────────────────┘                      └──────────────────────┘

```

### MySQL 8.0 — Persistencia Transaccional y Relacional

* **Base de datos:** `zombies_db`
* **Uso:** Almacena datos rígidos que requieren consistencia e integridad absoluta: tablas de credenciales de usuario, contraseñas y el récord absoluto de supervivencia (*Highscore*).
* **Optimización:** La tabla de usuarios implementa índices en la columna de búsqueda principal (`nombre`) y utiliza proyecciones personalizadas (`RankingProjection`) en el repositorio JPA para acelerar el renderizado del *Leaderboard* web mediante consultas que extraen exclusivamente el nombre y la puntuación máxima, minimizando la transferencia de datos en red.

### MongoDB 7.0 — Almacenamiento Analítico Orientado a Documentos

* **Base de datos:** `zombies_analytics`
* **Uso:** Actúa como el sumidero de *Big Data* del videojuego. Al producirse un *Game Over*, la partida completa es serializada en un documento BSON complejo de estructura flexible.
* **Estructura del Documento (`PartidaCompletada`):** Almacena registros anidados que incluyen la duración exacta en segundos, rondas superadas, mapas jugados, y desgloses pormenorizados por jugador (Kills totales, precisión de disparo, headshots realizados y porcentaje de uso de cada arma). Al no estar estructurado rígidamente, permite añadir variables de telemetría en el futuro sin realizar costosas migraciones de esquemas en bases de datos relacionales en producción.

---

##  Seguridad y Autenticación Stateless (JWT + Spring Security)

La robustez del perímetro de seguridad del backend se apoya en una configuración restrictiva basada en filtros interceptores sin estado:

1. **Criptografía y Hashing Asimétrico:** El sistema utiliza la implementación de **BCrypt** dentro de un bean `PasswordEncoder` con un factor de coste de 10. Las contraseñas en texto claro jamás tocan la base de datos ni los logs del sistema, transformándose en hashes asimétricos irreversibles.
2. **Autenticación mediante JWT (JSON Web Tokens):** Se prescinde totalmente del almacenamiento tradicional de sesiones HTTP en el servidor (*Session Fixation Mitigation*). El proceso de login genera un token JWT firmado criptográficamente mediante algoritmo HMAC SHA-256 usando una clave secreta codificada en Base64. El token contiene la identidad del usuario y sus tiempos de expiración (*claims*).
3. **Filtro Interceptor Personalizado (`JwtAuthenticationFilter.java`):** Extiende de `OncePerRequestFilter`. Captura cada petición entrante en el ecosistema HTTP, extrae el encabezado `Authorization: Bearer <token>`, valida la integridad de la firma criptográfica mediante el `JwtService` y, si el token es legítimo, inyecta el contexto de seguridad en la instancia de `SecurityContextHolder`.
4. **Políticas CORS Restrictivas:** Configurado meticulosamente para admitir el intercambio de recursos de forma segura desde los orígenes del frontend (`http://localhost:4200`), permitiendo el transporte explícito de cabeceras de autorización y previniendo ataques de tipo *Cross-Site Request Forgery (CSRF)*.

---

## 🔌 Protocolo de Red en Tiempo Real (WebSockets + STOMP)

El intercambio dinámico de paquetes de red se realiza bajo la especificación del protocolo STOMP sobre WebSockets de baja latencia en el endpoint mapeado `/nexus-zombies`.

### Arquitectura de Canales (Trazabilidad Inbound/Outbound)

```
  CLIENTE (Angular)                                        SERVER (Spring Boot)
          │                                                         │
          │ ─── [STOMP Send] ──> /app/input (Coordenadas) ────────> │ Process Frame
          │ ─── [STOMP Send] ──> /app/shoot (Vector Balístico) ───> │ (Game Loop)
          │                                                         │
          │ <── [STOMP Broadcast] ── /topic/gamestate (60 TPS) ──── │ Broadcast state
          │ <── [STOMP Broadcast] ── /topic/ronda (Oleada Info) ─── │ Broadcast events

```

### 📡 Canales de Recepción (Suscripciones del Cliente Angular)

* **`/topic/gamestate`**: El canal de transmisión más crítico. Distribuye en ráfagas de alta frecuencia el mapa de memoria con las coordenadas de todos los jugadores conectados, las posiciones exactas de la IA de los zombis, los proyectiles activos en pantalla y el estado cinemático general.
* **`/topic/ronda`**: Comunica eventos estructurales discretos, tales como el inicio de una cuenta atrás, cambio de oleada, animación de transición de zona o la alerta global de fin de partida (*Game Over*).
* **`/topic/hits`**: Emite eventos específicos de confirmación de impacto para que los clientes ejecuten de manera reactiva respuestas sonoras o efectos visuales en el lienzo del Canvas HTML5 (parpadeos de daño, partículas de sangre, etc.).
* **`/user/queue/init`**: Cola privada punto a punto (`Point-to-Point`) utilizada durante el handshake inicial para entregar de forma segura el identificador de sesión exclusivo (`sessionId`) al cliente asignado.

### 📥 Canales de Envío (Mensajes Inbound hacia Spring Boot)

* **`/app/join`**: Solicitud de inserción de un personaje en el bucle del juego. Transporta el nombre validado y el archivo de textura (*skin*) seleccionado por el usuario.
* **`/app/input`**: Canal síncrono que transmite continuamente un mapa binario con el estado de las teclas físicas de dirección (WASD) accionadas por el cliente.
* **`/app/shoot`**: Comunica la ejecución de un disparo. Envía las coordenadas bidimensionales hacia donde apuntaba el vector del ratón para que el `DamageEngine` verifique el impacto.
* **Eventos Secundarios (`/app/sprint`, `/app/interact`, `/app/switchWeapon`, `/app/restart`)**: Acciones que modifican variables específicas del personaje en memoria (activación del multiplicador de velocidad, compra de armas de pared o reinicio del bucle del mapa).

---

## 🚀 Endpoints de la API REST

Aunque el núcleo de la jugabilidad reside en los sockets, la gestión de la plataforma se apoya en controladores HTTP tradicionales estructurados de forma semántica bajo la raíz `/api`:

### Módulo de Usuarios y Sesiones (`UsuarioController`)

* **`POST /api/usuarios/registro`**
* *Descripción:* Procesa el alta de nuevos usuarios. Valida que el nombre no contenga duplicados en MySQL, procesa el encriptado BCrypt y almacena las credenciales.
* *Código de respuesta:* `200 OK` en éxito; `400 Bad Request` si el usuario ya existe o incumple las restricciones.


* **`POST /api/usuarios/login`**
* *Descripción:* Endpoint de autenticación. Verifica las credenciales introducidas contra el hash almacenado en base de datos. Si se supera la validación, devuelve un objeto JSON conteniendo el token JWT firmado.
* *Código de respuesta:* `200 OK` con payload JWT; `401 Unauthorized` si falla la validación.


* **`GET /api/usuarios/ranking`**
* *Descripción:* Recupera el listado competitivo ordenado de forma descendente por la columna de ronda máxima. Expone los datos de forma optimizada utilizando la interfaz `RankingProjection`.



### Módulo de Telemetría e Inteligencia de Negocio (`AnalyticsController`)

* **`GET /api/analytics/partidas`**
* *Descripción:* Extrae la colección completa de históricos de partidas guardados en MongoDB. Protegido explícitamente mediante anotaciones de seguridad; requiere que la petición incorpore un JWT válido en las cabeceras.


* **`GET /api/analytics/partidas/top-armas`**
* *Descripción:* Ejecuta un pipeline de agregación dinámico en MongoDB para analizar estadísticamente el rendimiento de las armas, determinando cuáles presentan un mayor volumen de uso global y efectividad de bajas en el ecosistema.



---

## 🐳 Orquestación de Contenedores y DevOps (Docker Compose)

El despliegue íntegro del sistema está estandarizado mediante contenedores aislados y redes virtuales para erradicar por completo los problemas de configuración de dependencias locales ("funciona en mi máquina").

El ecosistema se define en un archivo estructural `docker-compose.yml` que orquesta los siguientes servicios autónomos:

1. **`mysql-zombies`**: Contenedor basado en la imagen oficial `mysql:8.0`. Expone de manera interna el puerto tradicional `3306` para el backend, pero mapea externamente el puerto `3307` hacia el host de desarrollo, posibilitando inspecciones externas sin generar colisiones con otras instancias de bases de datos del sistema. Mantiene persistencia mediante volúmenes independientes.
2. **`mongo-zombies`**: Contenedor basado en `mongo:7.0`. Levanta el motor NoSQL en su puerto nativo `27017` y guarda la telemetría en el volumen administrado de datos `mongo_data`.
3. **`zombies-app` (Este Backend)**: Utiliza un `Dockerfile` multietapa de optimización (*Multi-Stage Build*). La primera etapa compila el código fuente compilando la aplicación con Maven; la segunda etapa extrae el artefacto ejecutable `.jar` ligero y lo corre sobre una imagen base limpia de `openjdk:17-slim`. Configura las variables de entorno de inyección dinámicas para enlazar automáticamente los datasources hacia los nombres de los contenedores de las bases de datos en lugar de cadenas estáticas IP.
4. **`frontend-zombies`**: Ejecuta el cliente Angular compilado y servido de forma óptima a través de un servidor inverso de **Nginx** en el puerto de salida `4200`.

---

## 🛠 Guía de Ejecución y Despliegue

### Requisitos Técnicos Previos

* Docker Engine y Docker Compose instalados de manera global en el sistema.
* Disponibilidad absoluta de los puertos de red: `8080` (Backend API), `4200` (Frontend), `3307` (Inspección MySQL) y `27017` (MongoDB).

### Instrucciones de Arranque

Para compilar los fuentes por primera vez, levantar las imágenes de Docker, configurar las interfaces de red interna e inicializar todo el ecosistema de zombis con un único comando, ejecuta en tu terminal de comandos:

```bash
# Acceder al directorio raíz donde reside el archivo de orquestación
cd backend

# Lanza Docker Compose forzando la compilación limpia en segundo plano (Detached Mode)
docker compose up --build -d

```

### Comandos Útiles de Administración y Mantenimiento

* **Auditoría de Logs en Tiempo Real:** Para monitorizar el arranque de Spring Boot, la conexión a los esquemas de bases de datos y la inicialización de los hilos del Game Loop asíncrono, lanza:
```bash
docker logs -f app_zombies

```


* **Inspección de Datos desde la Terminal:** Si necesitas verificar de forma directa las tablas de usuarios o los registros de los hashes en el contenedor de MySQL sin usar herramientas de interfaz gráfica externas:
```bash
# Conectarse al contenedor interactivo de la base de datos
docker exec -it db_zombies mysql -u zombie_user -p

# Escribir la contraseña establecida y ejecutar comandos SQL:
USE zombies_db;
SELECT nombre, ronda_maxima FROM usuarios;

```


* **Apagado Seguro del Entorno:** Para detener la simulación del videojuego, desconectar de forma segura a los clientes de los WebSockets y desmontar las instancias de bases de datos impidiendo cualquier tipo de corrupción física de los ficheros de datos internos, utiliza:
```bash
docker compose down


> **Proyecto Fin de Máster — Bootcamp FullStack Developer**


