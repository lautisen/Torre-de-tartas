/**
 * main.js - Motor principal del juego
 * Gestiona el movimiento, colisiones, cámara y efectos visuales.
 */

const gameMain = {
    speed: 0.02,
    angle: 0,
    width: 160,
    cameraY: 0,
    balance: 0,
    comboCount: 0,
    isInitialized: false,

    /**
     * Inicializa o reinicia el estado del juego
     */
    start() {
        // Reset de variables
        this.width = 160;
        this.angle = 0;
        this.cameraY = 0;
        this.balance = 0;
        this.comboCount = 0;

        // Limpiar la torre visualmente
        const tower = document.getElementById('tower');
        if (tower) tower.innerHTML = "";

        // Reset visual de la base
        const base = document.getElementById('base-container');
        if (base) {
            base.style.transform = `translateX(-50%) rotate(0deg)`;
            base.style.transition = "transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
        }

        // Reset de cámara
        const world = document.getElementById('game-world');
        if (world) world.style.transform = `translateY(0px)`;

        this.spawnCake();

        if (!this.isInitialized) {
            this.setupControls();
            this.loop();
            this.isInitialized = true;
        }
    },

    /**
     * Configura los controles para PC (Espacio/Click) y Móvil (Tap)
     */
    setupControls() {
        const triggerDrop = (e) => {
            if (ui.gameActive) {
                if (e && e.type === 'keydown' && e.code !== 'Space') return;
                if (e) e.preventDefault();
                this.drop();
            }
        };

        window.addEventListener('mousedown', triggerDrop);
        window.addEventListener('touchstart', triggerDrop, { passive: false });
        window.addEventListener('keydown', triggerDrop);
    },

    /**
     * Crea una nueva tarta en la grúa
     */
    spawnCake() {
        const container = document.getElementById('active-cake-container');
        // El ancho se reduce ligeramente cada vez para aumentar la dificultad
        this.width = Math.max(60, this.width * 0.98);
        
        if (container) {
            container.style.
