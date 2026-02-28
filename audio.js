const gameAudio = {
    ctx: null,

    init() {
        // Inicializa el contexto de audio tras la primera interacción (requisito estricto de iOS/Safari)
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    },

    play(freq, type = 'sine', duration = 0.1, volume = 0.1) {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(volume, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    },

    // Sonido de UI (click en botones)
    uiClick() {
        // Ensure iOS/Safari forcefully resumes context exactly here during a direct DOM click event
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
        this.play(800, 'sine', 0.05, 0.05);
        setTimeout(() => this.play(1200, 'sine', 0.05, 0.05), 50);
    },

    // Sonido al subir de zona
    zoneFanfare() {
        const notes = [440, 554.37, 659.25, 880]; // La Mayor arpegio
        notes.forEach((f, i) => {
            setTimeout(() => this.play(f, 'square', 0.2, 0.05), i * 100);
        });
    },

    // Sonido cuando la tarta cae bien
    success(quality) {
        if (quality === 'perfect') {
            // Brillo espacial
            this.play(523.25 * 2, 'sine', 0.3, 0.1);
            setTimeout(() => this.play(659.25 * 2, 'sine', 0.3, 0.08), 80);
            setTimeout(() => this.play(783.99 * 2, 'sine', 0.4, 0.05), 160);
        } else if (quality === 'good') {
            // Thud normal y satisfactorio
            this.play(261.63, 'triangle', 0.15, 0.15); // Do grave
            this.play(130.81, 'sine', 0.2, 0.2);       // Golpe grave
        } else {
            // Bad/Splat, sonido apagado
            this.play(150, 'sawtooth', 0.15, 0.1);
            setTimeout(() => this.play(100, 'square', 0.2, 0.1), 50);
        }
    },

    // Sonido de derrota (escala descendente)
    gameOver() {
        this.play(392, 'sawtooth', 0.5, 0.05); // Sol
        setTimeout(() => this.play(329.63, 'sawtooth', 0.5, 0.05), 150); // Mi
        setTimeout(() => this.play(261.63, 'sawtooth', 0.8, 0.05), 300); // Do grave
    },

    // Sonido de Récord Mundial (Fanfarria)
    worldRecord() {
        const notes = [523, 659, 783, 1046]; // Arpegio Do mayor
        notes.forEach((f, i) => {
            setTimeout(() => this.play(f, 'square', 0.4, 0.05), i * 150);
        });
    },

    // ==========================================
    //   BACKGROUND MUSIC (SECUENCIADOR EVOLUTIVO)
    // ==========================================
    bgmActive: false,
    bgmInterval: null,
    currentStep: 0,
    bgmLevel: 0,

    // Secuencia base (C - E - G - E - C - A - G - A)
    seqBase: [
        261.63, null, 329.63, null, 392.00, null, 329.63, null,
        261.63, null, 220.00, null, 196.00, null, 220.00, null
    ],

    startBgm() {
        if (!this.ctx) this.init();
        if (this.bgmActive) return;
        this.bgmActive = true;
        this.currentStep = 0;
        this.bgmLevel = 0;
        this.bgmInterval = setInterval(() => this._bgmTick(), 150); // ~100 BPM semicorcheas
    },

    stopBgm() {
        this.bgmActive = false;
        clearInterval(this.bgmInterval);
    },

    updateBgmState(score) {
        if (score < 5) this.bgmLevel = 0;       // Tierra
        else if (score < 22) this.bgmLevel = 1; // Nubes y Cielo
        else if (score < 48) this.bgmLevel = 2; // Espacio
        else this.bgmLevel = 3;                 // Galaxia
    },

    _bgmTick() {
        if (!this.ctx || this.ctx.state === 'suspended') return;

        const step = this.currentStep % 16;

        // --- CAPA 1: Modulable (Tierra) base ---
        const baseNote = this.seqBase[step];
        if (baseNote) {
            let volume = 0.05;
            let type = 'triangle';
            if (this.bgmLevel >= 2) {
                // En el espacio, la base se vuelve más suave y de tipo 'sine'
                type = 'sine';
                volume = 0.03;
            }
            this.play(baseNote, type, 0.2, volume);
        }

        // --- CAPA 2: Arpegios de Cielo (Nubes y superior) ---
        if (this.bgmLevel >= 1) {
            if (step % 2 === 0) { // corcheas
                const arpNotes = [523.25, 659.25, 783.99, 1046.50]; // Do mayor agudo
                const note = arpNotes[(step / 2) % 4];
                this.play(note, 'sine', 0.1, 0.02);
            }
        }

        // --- CAPA 3: Bajo Espacial (Espacio y superior) ---
        if (this.bgmLevel >= 2) {
            if (step % 8 === 0) { // blancas
                const bassNotes = [65.41, 65.41, 55.00, 55.00]; // Do1, Do1, La0, La0
                const bass = bassNotes[Math.floor((this.currentStep % 32) / 8)];
                this.play(bass, 'square', 1.0, 0.03); // Onda cuadrada larga
            }
        }

        // --- CAPA 4: Brillitos Aleatorios (Galaxia) ---
        if (this.bgmLevel >= 3) {
            if (Math.random() < 0.2) { // 20% probabilidad de nota aleatoria súper aguda
                this.play(1046.50 + Math.random() * 500, 'sine', 0.05, 0.01);
            }
        }

        this.currentStep++;
    },

    // ==========================================
    //   AMBIENT SOUND EFFECTS (GENERATIVE)
    // ==========================================

    // Pájaro: Píos muy agudos y cortos
    playBird() {
        if (!this.ctx || !ui.gameActive) return;
        const freqs = [3500, 4200, 3800];
        freqs.forEach((f, i) => {
            setTimeout(() => this.play(f, 'sine', 0.05, 0.02), i * 100);
        });
    },

    // Avión: Motor zumbando muy grave y continuo
    playPlane() {
        if (!this.ctx || !ui.gameActive) return;
        this.play(60, 'sawtooth', 3.0, 0.08);
        this.play(65, 'square', 3.0, 0.04);
    },

    // Nube/Tormenta: Trueno sordo o viento grave
    playThunder() {
        if (!this.ctx || !ui.gameActive) return;
        this.play(30, 'sawtooth', 2.0, 0.15);
        setTimeout(() => this.play(35, 'square', 1.5, 0.1), 300);
        setTimeout(() => this.play(25, 'sawtooth', 2.0, 0.15), 500);
    },

    // Satélite: Bips telemétricos morse
    playSatellite() {
        if (!this.ctx || !ui.gameActive) return;
        const pattern = [0, 150, 300, 800, 950, 1100];
        pattern.forEach((t) => {
            setTimeout(() => this.play(2500, 'square', 0.06, 0.02), t);
        });
    },

    // Meteorito/Asteroide: Roce rocoso grave
    playAsteroid() {
        if (!this.ctx || !ui.gameActive) return;
        this.play(40, 'sawtooth', 1.5, 0.2);
        this.play(32, 'square', 2.0, 0.15);
    },

    // Estrella Fugaz: Frecuencia de barrido sci-fi 
    playShootingStar() {
        if (!this.ctx || !ui.gameActive) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(3000, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.8); // Fiuuum!

        gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.8);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.8);
    }
};
