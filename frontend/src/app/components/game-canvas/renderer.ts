// ── VARIABLES DE MÓDULO (Se inicializarán solo en el navegador) ──
let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;
let gameState: any;
let mySessionId: string | null;

// Elementos del DOM (Declarados como nulos al inicio)
let rondaTallyEl: HTMLElement | null = null;
let puntosTextoEl: HTMLElement | null = null;
let zombiesTextoEl: HTMLElement | null = null;
let floatingLayerEl: HTMLElement | null = null;
let bloodOverlayEl: HTMLElement | null = null;
let perkEls: Element[] = [];

// Imágenes de juego
let imgJugador!: HTMLImageElement;
let imgZombieNormal!: HTMLImageElement;
let imgZombieCorredor!: HTMLImageElement;

let skinAssets: Record<string, HTMLImageElement> = {};


// Canvas de Viñeta
let vignetteCanvas!: HTMLCanvasElement;
let vCtx!: CanvasRenderingContext2D;


// ══════════════════════════════════════════════════════════════════════════════
//  CONSTANTES DEL MUNDO
// ══════════════════════════════════════════════════════════════════════════════
const MUNDO_W = 2400;
const MUNDO_H = 1800;
let CAM_HALF_W = 400;   
let CAM_HALF_H = 300;   

const ZONAS = [
    { id:0, x:0,    y:0,    w:800,  h:600,  suelo:'#1a1c23', pared:'#2a2d38', techo:'#0d0f14', nombre:'Laboratorio'  },
    { id:1, x:800,  y:0,    w:800,  h:600,  suelo:'#22201c', pared:'#33302a', techo:'#111009', nombre:'Pasillos'     },
    { id:2, x:1600, y:0,    w:800,  h:600,  suelo:'#1c1f18', pared:'#2c3025', techo:'#0e1009', nombre:'Armería'      },
    { id:3, x:0,    y:600,  w:800,  h:600,  suelo:'#1a2218', pared:'#263323', techo:'#0c110d', nombre:'Enfermería'   },
    { id:4, x:800,  y:600,  w:800,  h:600,  suelo:'#201c1a', pared:'#312b28', techo:'#100d0b', nombre:'Patio Central'},
    { id:5, x:1600, y:600,  w:800,  h:600,  suelo:'#1c1a22', pared:'#2c2a33', techo:'#0e0c12', nombre:'Búnker'       },
    { id:6, x:800,  y:1200, w:800,  h:600,  suelo:'#22181a', pared:'#332527', techo:'#110b0d', nombre:'Generadores'  },
];

const OBSTACULOS = [
    {x:796,  y:0,   w:8, h:220}, {x:796,  y:380, w:8, h:220},
    {x:0,    y:596, w:250,h:8},  {x:450,  y:596, w:350,h:8},
    {x:1596, y:0,   w:8, h:150}, {x:1596, y:350, w:8, h:250},
    {x:800,  y:596, w:150,h:8},  {x:1250, y:596, w:350,h:8},
    {x:1600, y:596, w:800,h:8},
    {x:796,  y:600, w:8, h:150}, {x:796,  y:950, w:8, h:250},
    {x:1596, y:600, w:8, h:50},  {x:1596, y:900, w:8, h:300},
    {x:800,  y:1196,w:150,h:8},  {x:1250, y:1196,w:350,h:8},
    {x:796,  y:1196,w:8, h:608}, {x:1596, y:1196,w:8, h:608},
    {x:800,  y:1796,w:800,h:8},
    {x:150,y:150,w:90, h:45 }, {x:560,y:150,w:90, h:45 }, {x:330,y:320,w:140,h:60 },
    {x:80, y:420,w:60, h:120}, {x:650,y:420,w:60, h:120},
    {x:870, y:80, w:60,h:180}, {x:1470,y:80, w:60,h:180}, {x:1100,y:200,w:200,h:40},
    {x:870, y:400,w:60,h:180}, {x:1470,y:400,w:60,h:180},
    {x:1670,y:80, w:80,h:80 }, {x:2230,y:80, w:80,h:80 }, {x:1850,y:180,w:320,h:30},
    {x:1680,y:350,w:60,h:200}, {x:2260,y:350,w:60,h:200},
    {x:80,  y:680,w:200,h:50}, {x:80,  y:770,w:200,h:50}, {x:80,  y:860,w:200,h:50},
    {x:500, y:700,w:80, h:200},{x:350, y:1000,w:200,h:60},
    {x:950, y:680,w:100,h:100},{x:1340,y:680,w:100,h:100},
    {x:950, y:1000,w:100,h:100},{x:1340,y:1000,w:100,h:100},{x:1150,y:820,w:100,h:100},
    {x:1680,y:650,w:300,h:40},{x:1680,y:1100,w:300,h:40},{x:2100,y:750,w:60,h:300},{x:1700,y:800,w:80,h:80},
    {x:870,y:1280,w:80,h:200},{x:1060,y:1280,w:80,h:200},{x:1250,y:1280,w:80,h:200},
    {x:1440,y:1280,w:80,h:200},{x:950,y:1550,w:500,h:60},
];

let tiempoAnim = 0;
const manchasSangre: any[] = [];
let trazadoresBalas: any[] = [];

// ── PROTECCIÓN DE ENTRADA AL DOM (Para evitar errores en Node.js) ──
function inicializarElementosDOM() {
    if (typeof document !== 'undefined') {
        if (!rondaTallyEl)   rondaTallyEl   = document.getElementById('ronda-tally');
        if (!puntosTextoEl)  puntosTextoEl  = document.getElementById('puntos-texto');
        if (!zombiesTextoEl) zombiesTextoEl = document.getElementById('zombies-texto');
        if (!floatingLayerEl)floatingLayerEl = document.getElementById('floating-layer');
        if (!bloodOverlayEl) bloodOverlayEl = document.getElementById('blood-overlay');
        if (perkEls.length === 0) {
            perkEls = [...document.querySelectorAll('.perk[data-perk]')];
        }
    }
}

function inicializarImagenes() {
    if (typeof window !== 'undefined' && typeof Image !== 'undefined' && Object.keys(skinAssets).length === 0) {
        imgJugador.src = 'assets/jugador.png';
        imgZombieNormal.src = 'assets/zombie_normal.png';
        imgZombieCorredor.src = 'assets/zombie_corredor.png';

        skinAssets = {
            'jugador.png': new Image(),
            'jugador2.png': new Image(),
            'jugador3.png': new Image(),
            'jugador4.png': new Image()
        };

        Object.keys(skinAssets).forEach(key => {
            skinAssets[key].src = `assets/${key}`;
        });
    }
}

function inicializarVignette() {
    if (typeof document === 'undefined') return;
    if (!vignetteCanvas) {
        vignetteCanvas = document.createElement('canvas');
        vignetteCanvas.width  = 800;
        vignetteCanvas.height = 600;
        const tempCtx = vignetteCanvas.getContext('2d')!;

        const vGrad = tempCtx.createRadialGradient(400,300,160,400,300,520);
        vGrad.addColorStop(0, 'rgba(0,0,0,0)');
        vGrad.addColorStop(1, 'rgba(0,0,0,0.92)');
        tempCtx.fillStyle = vGrad;
        tempCtx.fillRect(0,0,800,600);
    }
}

export function agregarTrazadorBala(startX: number, startY: number, endX: number, endY: number) {
    trazadoresBalas.push({
        startX: startX,
        startY: startY,
        endX: endX,
        endY: endY,
        alpha: 1.0
    });
}

// ── EVENTOS HUD ──
if (typeof window !== 'undefined') {
    window.addEventListener('hud:kill', (ev: any) => {
        spawnFloatingScore(ev.detail || {});
        const mj  = gameState.jugadores?.find((j: any) => j.id === mySessionId);
        if (mj) {
            for (let i = 0; i < 4; i++) manchasSangre.push({
                x: mj.x + (Math.random()*120 - 60),
                y: mj.y + (Math.random()*120 - 60),
                r: Math.random()*14 + 4,
                a: Math.random()*0.45 + 0.1
            });
            if (manchasSangre.length > 300) manchasSangre.shift();
        }
    });
    window.addEventListener('hud:hits', (ev: any) => updateBloodOverlay(ev.detail || {}));
}

// ── DIBUJO DEL MUNDO ──
function dibujarMundo() {
    ZONAS.forEach(z => {
        ctx.fillStyle = z.suelo;
        ctx.fillRect(z.x, z.y, z.w, z.h);
    });

    ZONAS.forEach(z => {
        ctx.save();
        ctx.strokeStyle = 'rgba(255,255,255,0.03)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let tx = z.x; tx <= z.x + z.w; tx += 60) {
            ctx.moveTo(tx, z.y); ctx.lineTo(tx, z.y + z.h);
        }
        for (let ty = z.y; ty <= z.y + z.h; ty += 60) {
            ctx.moveTo(z.x, ty); ctx.lineTo(z.x + z.w, ty);
        }
        ctx.stroke();
        ctx.restore();
    });

    dibujarParedZona(800,  0,    4, 600);   
    dibujarParedZona(1600, 0,    4, 600);   
    dibujarParedZona(0,    600,  800, 4);   
    dibujarParedZona(800,  600,  800, 4);   
    dibujarParedZona(1600, 600,  800, 4);   
    dibujarParedZona(800,  600,  4,  600);  
    dibujarParedZona(1600, 600,  4,  600);  
    dibujarParedZona(800,  1200, 800, 4);   
    dibujarParedZona(800,  1200, 4,  600);  
    dibujarParedZona(1600, 1200, 4,  600);  
    dibujarParedZona(800,  1800, 800, 4);   

    ctx.strokeStyle = '#444';
    ctx.lineWidth = 6;
    ctx.strokeRect(3, 3, MUNDO_W - 6, MUNDO_H - 6);

    ZONAS.forEach(z => {
        ctx.save();
        ctx.globalAlpha = 0.08;
        ctx.fillStyle = '#fff';
        ctx.font = `bold ${Math.min(z.w, z.h) * 0.18}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(z.nombre.toUpperCase(), z.x + z.w / 2, z.y + z.h / 2);
        ctx.restore();
    });
}

function dibujarParedZona(x: number, y: number, w: number, h: number) {
    const grad = w > h
        ? ctx.createLinearGradient(x, y, x, y + Math.max(h, 16))
        : ctx.createLinearGradient(x, y, x + Math.max(w, 16), y);
    grad.addColorStop(0, 'rgba(0,0,0,0.7)');
    grad.addColorStop(0.5, 'rgba(30,30,30,0.5)');
    grad.addColorStop(1, 'rgba(0,0,0,0.1)');
    ctx.fillStyle = grad;
    ctx.fillRect(x, y, Math.max(w, 16), Math.max(h, 16));
}

function dibujarManchasSangre() {
    manchasSangre.forEach(m => {
        ctx.save();
        ctx.globalAlpha = m.a;
        ctx.fillStyle = '#5a0000';
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    });
}

function dibujarObstaculos() {
    const ALTURA_3D = 18;  
    const t = tiempoAnim;

    OBSTACULOS.forEach(o => {
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.fillRect(o.x + 6, o.y + ALTURA_3D + 4, o.w, 10);

        ctx.fillStyle = '#111';
        ctx.beginPath();
        ctx.moveTo(o.x,       o.y + o.h);
        ctx.lineTo(o.x + o.w, o.y + o.h);
        ctx.lineTo(o.x + o.w, o.y + o.h + ALTURA_3D);
        ctx.lineTo(o.x,       o.y + o.h + ALTURA_3D);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#0a0a0a';
        ctx.beginPath();
        ctx.moveTo(o.x + o.w, o.y);
        ctx.lineTo(o.x + o.w + ALTURA_3D * 0.5, o.y + ALTURA_3D * 0.5);
        ctx.lineTo(o.x + o.w + ALTURA_3D * 0.5, o.y + o.h + ALTURA_3D * 0.5);
        ctx.lineTo(o.x + o.w, o.y + o.h);
        ctx.closePath();
        ctx.fill();

        const glow = 8 + Math.sin(t * 0.04 + o.x * 0.01) * 5;
        ctx.fillStyle = '#0f0f0f';
        ctx.fillRect(o.x, o.y, o.w, o.h);

        ctx.strokeStyle = `rgba(255, 0, 220, ${0.5 + Math.sin(t * 0.04) * 0.2})`;
        ctx.shadowBlur   = glow;
        ctx.shadowColor  = '#ff00cc';
        ctx.lineWidth    = 2;
        ctx.strokeRect(o.x, o.y, o.w, o.h);
        ctx.restore();
    });
}

function dibujarCajaMagica(miJugador: any) {
    const c = gameState?.caja;
    if (!c || !c.activa) return;

    const size = 34; 
    ctx.save();
    
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.beginPath();
    ctx.ellipse(c.x + size/2, c.y + size/2, size, size/2, 0, 0, Math.PI * 2);
    ctx.fill();

    if (c.animando) {
        const pulse = 0.6 + Math.sin(tiempoAnim * 0.2) * 0.4;
        ctx.shadowBlur = 20;
        ctx.shadowColor = `rgba(255, 210, 60, ${pulse})`;
        ctx.strokeStyle = '#fff'; 
    } else {
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#ffaa00'; 
    }

    ctx.fillStyle = '#3e2723';
    ctx.lineWidth = 2;
    ctx.fillRect(c.x, c.y, size, size*0.6);
    ctx.strokeRect(c.x, c.y, size, size*0.6);

    if (miJugador && !c.animando) {
        const dist = Math.hypot(miJugador.x - (c.x + size/2), miJugador.y - (c.y + size/2));
        if (dist <= 85) {
            ctx.shadowBlur = 0; 
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 12px Courier New';
            ctx.textAlign = 'center';
            ctx.fillText(`[F] Caja $${c.coste}`, c.x + size/2, c.y - 8);
        }
    }
    ctx.restore();
}

function dibujarPuertas(miJugador: any) {
    if (!gameState.puertas) return null;
    let puertaCercana = null;

    gameState.puertas.forEach((p: any) => {
        if (p.abierta) {
            ctx.save();
            ctx.strokeStyle = 'rgba(0,255,100,0.25)';
            ctx.lineWidth = 2;
            ctx.setLineDash([6, 4]);
            ctx.strokeRect(p.x, p.y, p.w, p.h);
            ctx.restore();
            return;
        }

        ctx.save();
        ctx.shadowColor   = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur    = 12;
        ctx.shadowOffsetY = 8;
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(p.x, p.y, p.w, p.h);
        ctx.shadowColor = 'transparent';

        ctx.beginPath();
        ctx.rect(p.x, p.y, p.w, p.h);
        ctx.clip();
        ctx.lineWidth   = 14;
        ctx.strokeStyle = 'rgba(255, 200, 0, 0.6)';
        const step = 28;
        for (let i = -p.h; i < p.w + p.h; i += step) {
            ctx.beginPath();
            ctx.moveTo(p.x + i,        p.y);
            ctx.lineTo(p.x + i + p.h,  p.y + p.h);
            ctx.stroke();
        }

        ctx.strokeStyle = '#555';
        ctx.lineWidth   = 3;
        ctx.strokeRect(p.x, p.y, p.w, p.h);
        ctx.restore();

        ctx.save();
        ctx.fillStyle   = 'rgba(0,0,0,0.7)';
        ctx.font        = 'bold 13px monospace';
        ctx.textAlign   = 'center';
        ctx.fillText(`$${p.coste}`, p.x + p.w / 2, p.y - 5);
        ctx.fillStyle = '#ffd700';
        ctx.fillText(`$${p.coste}`, p.x + p.w / 2 + 0.5, p.y - 5.5);
        ctx.restore();

        if (miJugador) {
            const cx   = p.x + p.w / 2;
            const cy   = p.y + p.h / 2;
            const dist = Math.hypot(miJugador.x - cx, miJugador.y - cy);
            if (dist <= 90) puertaCercana = p;
        }
    });

    return puertaCercana;
}

function dibujarJugador(p: any) {
    ctx.save();
    ctx.translate(p.x, p.y);

    ctx.save();
    ctx.globalAlpha = 0.4;
    ctx.fillStyle   = 'rgba(0,0,0,0.6)';
    ctx.scale(1, 0.4);
    ctx.beginPath();
    ctx.arc(3, 30, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    if (p.derribado) {
        ctx.globalAlpha = 0.7;
        ctx.fillStyle   = '#6b0000';
        ctx.beginPath(); ctx.ellipse(0, 4, 16, 9, 0, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#3a0000';
        ctx.beginPath(); ctx.arc(0, 0, 9, 0, Math.PI*2); ctx.fill();
    } else {
        const skinImage = skinAssets[p.skin as keyof typeof skinAssets] || skinAssets['jugador.png'];
        ctx.drawImage(skinImage, -20, -20, 40, 40);
    }

    ctx.shadowColor = 'transparent';
    ctx.textAlign = 'center';

    ctx.font      = '12px monospace';
    ctx.fillStyle = '#000';
    ctx.fillText(p.nombre, 1, -29);
    ctx.fillStyle = '#eee';
    ctx.fillText(p.nombre, 0, -30);

    if (p.derribado) {
        ctx.fillStyle = '#ff4444';
        ctx.font = 'bold 11px monospace';
        ctx.fillText('⚠ REVIVE', 0, -20);
    } else {
        const pct = Math.max(0, p.salud / (p.saludMax || 100));
        const barW = 40, barH = 5;
        ctx.fillStyle = '#2a0000';
        ctx.fillRect(-barW/2, -23, barW, barH);
        const color = pct > 0.6 ? '#00e676' : pct > 0.3 ? '#ffb300' : '#f44336';
        ctx.fillStyle = color;
        ctx.fillRect(-barW/2, -23, barW * pct, barH);
        ctx.strokeStyle = '#000'; ctx.lineWidth = 1;
        ctx.strokeRect(-barW/2, -23, barW, barH);
    }

    ctx.restore();
}

function dibujarZombie(z: any) {

    ctx.save();
    ctx.translate(z.x, z.y);

    const esCorredor = z.tipo === 'CORREDOR';

    ctx.save();
    ctx.globalAlpha = 0.35;
    ctx.fillStyle   = 'rgba(0,0,0,0.7)';
    ctx.scale(1, 0.4);
    ctx.beginPath();
    ctx.arc(2, 28, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    const avatarZombie = esCorredor ? imgZombieCorredor : imgZombieNormal;
    ctx.drawImage(avatarZombie, -17, -17, 34, 34);

    const pct = Math.max(0, z.salud / z.max);
    ctx.fillStyle = '#1a0000';
    ctx.fillRect(-14, -24, 28, 4);
    ctx.fillStyle = pct > 0.5 ? '#ff3300' : '#ff8800';
    ctx.fillRect(-14, -24, 28 * pct, 4);

    ctx.restore();
}

const renderState = {
    jugadores: new Map(),
    zombies:   new Map(),
};
function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }
const LERP_T = 0.20;

const DROP_CONFIG: { [key: string]: any } = {
    DOUBLE_POINTS: {
        label: 'DOBLE PUNTOS', color: '#FFD700', glow: '#FFD700',
        bg: '#1a1200',
        draw(ctx: any, cx: any, cy: any, r: any, t: any) {
            ctx.font = `bold ${r * 0.9}px monospace`;
            ctx.fillStyle = '#FFD700';
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText('2×', cx, cy + 1);
        }
    },
    NUKE: {
        label: 'NUKE', color: '#FF5500', glow: '#FF3300',
        bg: '#1a0500',
        draw(ctx: any, cx: any, cy: any, r: any, t: any) {
            ctx.strokeStyle = '#FF5500'; ctx.lineWidth = 1.5;
            for (let i = 0; i < 3; i++) {
                ctx.save();
                ctx.translate(cx, cy);
                ctx.rotate(t * 0.04 + (i * Math.PI / 3));
                ctx.beginPath();
                ctx.ellipse(0, 0, r * 0.75, r * 0.28, 0, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
            }
            ctx.beginPath(); ctx.arc(cx, cy, r * 0.22, 0, Math.PI * 2);
            ctx.fillStyle = '#FF5500'; ctx.fill();
        }
    },
    INSTA_KILL: {
        label: 'INSTA-KILL', color: '#CC00FF', glow: '#9900CC',
        bg: '#0d0015',
        draw(ctx: any, cx: any, cy: any, r: any, t: any) {
            ctx.fillStyle = '#CC00FF';
            ctx.beginPath();
            ctx.arc(cx, cy - r * 0.05, r * 0.52, Math.PI, 0, false);
            ctx.quadraticCurveTo(cx + r * 0.52, cy + r * 0.35, cx + r * 0.28, cy + r * 0.45);
            ctx.lineTo(cx - r * 0.28, cy + r * 0.45);
            ctx.quadraticCurveTo(cx - r * 0.52, cy + r * 0.35, cx, cy - r * 0.05);
            ctx.fill();
            ctx.fillStyle = '#0d0015';
            ctx.beginPath(); ctx.arc(cx - r * 0.18, cy + r * 0.05, r * 0.12, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(cx + r * 0.18, cy + r * 0.05, r * 0.12, 0, Math.PI * 2); ctx.fill();
        }
    },
    MAX_AMMO: {
        label: 'MAX AMMO', color: '#00FF88', glow: '#00CC66',
        bg: '#001a0d',
        draw(ctx: any, cx: any, cy: any, r: any, t: any) {
            ctx.font = `bold ${r * 0.7}px monospace`;
            ctx.fillStyle = '#00FF88';
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText('MAX', cx, cy - r * 0.12);
            ctx.font = `bold ${r * 0.5}px monospace`;
            ctx.fillText('AMMO', cx, cy + r * 0.35);
        }
    },
    CARPENTER: {
        label: 'CARPENTER', color: '#FF9900', glow: '#CC7700',
        bg: '#1a0d00',
        draw(ctx: any, cx: any, cy: any, r: any, t: any) {
            ctx.strokeStyle = '#FF9900'; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(cx, cy - r * 0.55); ctx.lineTo(cx, cy + r * 0.55);
            ctx.moveTo(cx - r * 0.55, cy); ctx.lineTo(cx + r * 0.55, cy);
            ctx.stroke();
            ctx.fillStyle = '#FF9900';
            ctx.font = `${r * 0.6}px serif`;
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText('♥', cx, cy + 2);
        }
    },
    FIRE_SALE: {
        label: 'FIRE SALE', color: '#FF6600', glow: '#FF3300',
        bg: '#1a0800',
        draw(ctx: any, cx: any, cy: any, r: any, t: any) {
            const flicker = 0.85 + 0.15 * Math.sin(t * 0.3);
            ctx.fillStyle = '#FF6600';
            ctx.font = `${r * 1.1 * flicker}px serif`;
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText('🔥', cx, cy + 2);
        }
    },
    DEATH_MACHINE: {
        label: 'DEATH MACHINE', color: '#FF0044', glow: '#CC0033',
        bg: '#1a0005',
        draw(ctx: any, cx: any, cy: any, r: any, t: any) {
            ctx.fillStyle = '#FF0044';
            ctx.font = `bold ${r * 1.0}px serif`;
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText('⚡', cx, cy + 2);
        }
    },
};

const dropParticulas = new Map(); 

function actualizarParticulasDrop(dropId: any, cx: any, cy: any, color: any) {
    if (!dropParticulas.has(dropId)) dropParticulas.set(dropId, []);
    const ps = dropParticulas.get(dropId);

    if (Math.random() < 0.4) {
        const ang = Math.random() * Math.PI * 2;
        const spd = 0.4 + Math.random() * 0.8;
        ps.push({ x: cx, y: cy, vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd - 0.5,
                  life: 1.0, maxLife: 1.0, r: 2 + Math.random() * 3 });
    }

    for (let i = ps.length - 1; i >= 0; i--) {
        const p = ps[i];
        p.x += p.vx; p.y += p.vy; p.vy -= 0.02;
        p.life -= 0.025;
        if (p.life <= 0) { ps.splice(i, 1); continue; }
        const a = p.life / p.maxLife;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * a, 0, Math.PI * 2);
        ctx.globalAlpha = a * 0.7;
        ctx.fillStyle = color;
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

function dibujarDrops() {
    const drops = gameState.drops || [];
    const t = tiempoAnim;

    const dropIds = new Set(drops.map((d: any) => d.id));
    for (const k of dropParticulas.keys()) {
        if (!dropIds.has(k)) dropParticulas.delete(k);
    }

    drops.forEach((d: any) => {
        const cfg = DROP_CONFIG[d.tipo] || DROP_CONFIG['MAX_AMMO'];

        const VIDA_TOTAL_MS = 30_000;
        const vidaFrac  = Math.min(1, (d.msRestantes ?? VIDA_TOTAL_MS) / VIDA_TOTAL_MS);
        const urgente   = (d.msRestantes ?? VIDA_TOTAL_MS) < 7_000;

        const bob  = Math.sin(t * 0.06 + d.x * 0.01) * 6;
        const cx   = d.x;
        const cy   = d.y + bob;
        const r    = 26;

        const pulso = urgente
            ? 1 + 0.25 * Math.abs(Math.sin(t * 0.25))
            : 1 + 0.08 * Math.sin(t * 0.07);

        ctx.save();

        const haloR = r * 3.2 * pulso;
        const grad  = ctx.createRadialGradient(cx, cy, r * 0.4, cx, cy, haloR);
        const alpha = urgente ? 0.55 + 0.3 * Math.abs(Math.sin(t * 0.25)) : 0.35;
        grad.addColorStop(0, hexAlpha(cfg.glow, alpha));
        grad.addColorStop(1, hexAlpha(cfg.glow, 0));
        ctx.fillStyle = grad;
        ctx.beginPath(); ctx.arc(cx, cy, haloR, 0, Math.PI * 2); ctx.fill();

        const rotVel = urgente ? 0.08 : 0.025;
        for (let i = 0; i < 16; i++) {
            const ang = (t * rotVel) + (i / 16) * Math.PI * 2;
            const tickLen = i % 4 === 0 ? 6 : 3;
            const ro = r + 7, ri = ro - tickLen;
            ctx.strokeStyle = hexAlpha(cfg.color, i % 4 === 0 ? 1 : 0.45);
            ctx.lineWidth   = i % 4 === 0 ? 2 : 1;
            ctx.beginPath();
            ctx.moveTo(cx + Math.cos(ang) * ri, cy + Math.sin(ang) * ri);
            ctx.lineTo(cx + Math.cos(ang) * ro, cy + Math.sin(ang) * ro);
            ctx.stroke();
        }

        const startAng = -Math.PI / 2;
        const endAng   = startAng + vidaFrac * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(cx, cy, r + 5, startAng, endAng);
        ctx.strokeStyle = cfg.color;
        ctx.lineWidth   = 3;
        ctx.shadowColor = cfg.color; ctx.shadowBlur = 8;
        ctx.stroke(); ctx.shadowBlur = 0;

        ctx.beginPath();
        ctx.arc(cx, cy, r + 5, endAng, startAng + Math.PI * 2);
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.lineWidth   = 3;
        ctx.stroke();

        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = cfg.bg;
        ctx.fill();
        ctx.strokeStyle = cfg.color; ctx.lineWidth = 2;
        ctx.shadowColor = cfg.color; ctx.shadowBlur = 12;
        ctx.stroke(); ctx.shadowBlur = 0;

        ctx.save();
        ctx.shadowColor = cfg.color; ctx.shadowBlur = urgente ? 18 : 8;
        cfg.draw(ctx, cx, cy, r * 0.75, t);
        ctx.restore();

        actualizarParticulasDrop(d.id, cx, cy, cfg.color);

        const labelY = cy + r + 17;
        ctx.font      = 'bold 8px monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = hexAlpha(cfg.color, 0.95);
        ctx.shadowColor = '#000'; ctx.shadowBlur = 4;
        ctx.fillText(cfg.label, cx, labelY);

        if (d.msRestantes !== undefined) {
            const segs = Math.ceil(d.msRestantes / 1000);
            ctx.font = urgente ? 'bold 9px monospace' : '8px monospace';
            ctx.fillStyle = urgente ? '#FF4444' : 'rgba(255,255,255,0.6)';
            ctx.fillText(`${segs}s`, cx, labelY + 11);
        }

        ctx.restore();
    });
}

function hexAlpha(hex: string, a: number) {
    if (!hex || hex[0] !== '#') return `rgba(255,255,255,${a})`;
    const n = parseInt(hex.slice(1), 16);
    const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    return `rgba(${r},${g},${b},${a})`;
}

export function render(
    currentCanvas: HTMLCanvasElement, 
    currentCtx: CanvasRenderingContext2D, 
    currentGameState: any, 
    currentSessionId: string | null
) {
    canvas = currentCanvas;
    ctx = currentCtx;
    gameState = currentGameState;
    mySessionId = currentSessionId;

    CAM_HALF_W = canvas.width  / 2;
    CAM_HALF_H = canvas.height / 2;

    tiempoAnim++;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!gameState || !gameState.jugadores) return;

    // ── PROTECCIÓN DE INICIALIZACIÓN DE IMÁGENES EN EL ENTORNO DE NAVEGADOR ──
    inicializarImagenes();
    inicializarVignette();
    inicializarElementosDOM();

    const miJugador = gameState.jugadores.find((j: any) => j.id === mySessionId)
        || (gameState.jugadores.length === 1 ? gameState.jugadores[0] : null);

    gameState.jugadores.forEach((p: any) => {
        if (p.espectador) return;
        const e = renderState.jugadores.get(p.id) || { x: p.x, y: p.y };
        e.x = lerp(e.x, p.x, LERP_T);
        e.y = lerp(e.y, p.y, LERP_T);
        renderState.jugadores.set(p.id, e);
    });

    const zombiesList = gameState.zombies || [];
    zombiesList.forEach((z: any) => {
        const e = renderState.zombies.get(z.id) || { x: z.x, y: z.y };
        e.x = lerp(e.x, z.x, LERP_T);
        e.y = lerp(e.y, z.y, LERP_T);
        renderState.zombies.set(z.id, e);
    });

    const camEntry = miJugador ? renderState.jugadores.get(miJugador.id) : null;
    let camX = camEntry ? camEntry.x : 400;
    let camY = camEntry ? camEntry.y : 300;

    camX = Math.max(CAM_HALF_W,  Math.min(MUNDO_W - CAM_HALF_W,  camX));
    camY = Math.max(CAM_HALF_H,  Math.min(MUNDO_H - CAM_HALF_H,  camY));

    ctx.save();
    ctx.translate(CAM_HALF_W - camX, CAM_HALF_H - camY);

    dibujarMundo();
    dibujarManchasSangre();
    dibujarObstaculos();
    dibujarCajaMagica(miJugador);
    const puertaCercana = dibujarPuertas(miJugador);

    dibujarDrops();
    gameState.jugadores.forEach((p: any) => {
        if (p.espectador) return;
        const e = renderState.jugadores.get(p.id);
        dibujarJugador({ ...p, x: e ? e.x : p.x, y: e ? e.y : p.y });
    });

    zombiesList.forEach((z: any) => {
        const e = renderState.zombies.get(z.id);
        dibujarZombie({ ...z, x: e ? e.x : z.x, y: e ? e.y : z.y });
    });

    trazadoresBalas.forEach((bala, index) => {
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = `rgba(255, 230, 0, ${bala.alpha})`; 
        ctx.lineWidth = 3; 
        ctx.lineCap = "round";
        
        ctx.moveTo(bala.startX, bala.startY);
        ctx.lineTo(bala.endX, bala.endY);
        ctx.stroke();
        ctx.restore();

        bala.alpha -= 0.15; 

        if (bala.alpha <= 0) {
            trazadoresBalas.splice(index, 1);
        }
    });

    ctx.restore();

    if (vignetteCanvas) {
        ctx.drawImage(vignetteCanvas, 0, 0);
    }

    actualizarHUDDOM(miJugador);
    dibujarHUDCanvas(miJugador, puertaCercana);
}

function actualizarHUDDOM(mj: any) {
    if (rondaTallyEl)   rondaTallyEl.textContent   = rondaToTally(gameState.ronda);
    if (zombiesTextoEl) zombiesTextoEl.textContent  = `ZOMBIES: ${gameState.restantes || 0}`;
    if (puntosTextoEl && mj && !mj.espectador)
        puntosTextoEl.textContent = `$ ${mj.puntos}`;
    updatePerksForPlayer(mj);
}

function dibujarHUDCanvas(mj: any, puertaCercana: any) {
    if (puertaCercana && mj && !mj.espectador && !mj.derribado) {
        const tienePuntos = mj.puntos >= puertaCercana.coste;
        const bx = canvas.width / 2, by = canvas.height - 100;

        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.85)';
        ctx.beginPath();
        // @ts-ignore
        ctx.roundRect(bx - 160, by - 20, 320, 60, 8);
        ctx.fill();

        ctx.font = '13px Courier New'; ctx.textAlign = 'center';
        ctx.fillStyle = '#ccc';
        ctx.fillText(`[F] Abrir → ${puertaCercana.zona}`, bx, by + 2);
        ctx.font = 'bold 16px Courier New';
        ctx.fillStyle = tienePuntos ? '#00ff88' : '#ff4444';
        ctx.fillText(`$ ${puertaCercana.coste}${tienePuntos ? ' ✓' : ' ✗'}`, bx, by + 24);
        ctx.restore();
    }

    if (mj && mj.espectador) {
        ctx.fillStyle = 'rgba(80,0,0,0.82)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.textAlign = 'center';
        ctx.fillStyle = '#fff';
        ctx.font = '64px "Permanent Marker", sans-serif';
        ctx.fillText('HAS CAÍDO', canvas.width/2, canvas.height/2 - 30);
        ctx.font = '22px monospace';
        ctx.fillText('Esperando siguiente ronda...', canvas.width/2, canvas.height/2 + 20);
    }

    if (mj && !mj.espectador) {
        const wpX = canvas.width - 200;
        const wpY = canvas.height - 70;

        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.85)';
        ctx.beginPath(); 
        // @ts-ignore
        ctx.roundRect(wpX, wpY, 180, 55, 6); 
        ctx.fill();

        ctx.textAlign = 'left';

        ctx.fillStyle = '#00ff88';
        ctx.font = 'bold 15px Courier New';
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#00ff88';
        ctx.fillText(`▶ ${mj.arma}`, wpX + 12, wpY + 22);
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#888';
        ctx.font = '13px Courier New';
        const sec = (mj.armaSecundaria && mj.armaSecundaria !== 'DESARMADO') ? mj.armaSecundaria : '[Vacío]';
        ctx.fillText(`  ${sec}`, wpX + 12, wpY + 42);

        ctx.fillStyle = '#aaa';
        ctx.font = 'bold 10px sans-serif';
        ctx.fillText('[Q] Cambiar', wpX + 105, wpY + 42);
        
        ctx.restore();
    }

    dibujarMinimap(mj);
}

function dibujarMinimap(mj: any) {
    const MM_W = 140, MM_H = 105;
    const MM_X = canvas.width - MM_W - 12;
    const MM_Y = 12;
    const scX  = MM_W / MUNDO_W;
    const scY  = MM_H / MUNDO_H;

    ctx.save();

    ctx.fillStyle = 'rgba(0,0,0,0.75)';
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 1;
    ctx.beginPath();
    // @ts-ignore
    ctx.roundRect(MM_X, MM_Y, MM_W, MM_H, 4);
    ctx.fill(); ctx.stroke();

    ctx.beginPath();
    // @ts-ignore
    ctx.roundRect(MM_X, MM_Y, MM_W, MM_H, 4);
    ctx.clip();

    ZONAS.forEach(z => {
        ctx.fillStyle = z.pared;
        ctx.fillRect(MM_X + z.x * scX, MM_Y + z.y * scY, z.w * scX, z.h * scY);
    });

    (gameState.puertas || []).forEach((p: any) => {
        ctx.fillStyle = p.abierta ? 'rgba(0,255,100,0.6)' : 'rgba(255,200,0,0.7)';
        ctx.fillRect(MM_X + p.x * scX, MM_Y + p.y * scY,
                     Math.max(p.w * scX, 3), Math.max(p.h * scY, 3));
    });

    ctx.fillStyle = '#ff2200';
    (gameState.zombies || []).forEach((z: any) => {
        ctx.beginPath();
        ctx.arc(MM_X + z.x * scX, MM_Y + z.y * scY, 2, 0, Math.PI*2);
        ctx.fill();
    });

    (gameState.jugadores || []).forEach((p: any) => {
        if (p.espectador) return;
        const isMe = p.id === mySessionId;
        ctx.fillStyle = isMe ? '#ff9900' : '#ffffff';
        ctx.beginPath();
        ctx.arc(MM_X + p.x * scX, MM_Y + p.y * scY, isMe ? 3 : 2, 0, Math.PI*2);
        ctx.fill();
    });

    ctx.restore();
}

function rondaToTally(ronda: any) {
    const r = Math.max(1, Number(ronda) || 1);
    return 'I'.repeat(Math.min(r, 10));
}

function spawnFloatingScore({ puntos = 0, headshot = false }: any) {
    if (!floatingLayerEl) return;
    const el = document.createElement('div');
    el.className  = 'floating-score';
    el.textContent = `${headshot ? '💥 +' : '+'}${puntos}`;
    el.style.left  = `400px`;
    el.style.top   = `300px`;
    floatingLayerEl.appendChild(el);
    // @ts-ignore
    if (typeof anime !== 'undefined') {
        // @ts-ignore
        anime({ targets: el, translateX: -380, translateY: 240,
                opacity: [1, 0], easing: 'easeOutQuad', duration: 900,
                complete: () => el.remove() });
    } else {
        setTimeout(() => el.remove(), 900);
    }
}

function updatePerksForPlayer(mj: any) {
    const perks = mj?.perks ? new Set(mj.perks) : new Set();
    perkEls.forEach((el: any) => {
        perks.has(el.dataset.perk)
            ? el.classList.add('owned')
            : el.classList.remove('owned');
    });
}

function updateBloodOverlay({ saludRestante }: any = {}) {
    if (!bloodOverlayEl) return;
    const strength = typeof saludRestante === 'number'
        ? 0.15 + Math.max(0, Math.min(1, (100 - saludRestante) / 100)) * 0.95
        : 0.65;
    bloodOverlayEl.style.opacity = `${strength}`;
    bloodOverlayEl.classList.add('danger');
    setTimeout(() => {
        if (!bloodOverlayEl) return;
        bloodOverlayEl.classList.remove('danger');
        bloodOverlayEl.style.opacity = '0';
    }, 220);
}