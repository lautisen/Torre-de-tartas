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
    //   BACKGROUND MUSIC (SECUENCIADOR RETRO 140 BPM)
    // ==========================================
    bgmActive: false,
    bgmInterval: null,
    currentStep: 0,
    bgmLevel: 0,

    startBgm() {
        if (!this.ctx) this.init();
        if (this.bgmActive) return;
        this.bgmActive = true;
        this.currentStep = 0;
        this.bgmLevel = 0;

        // 140 BPM, compás de 4/4
        // 1 minuto = 60000 ms. 1 negra = 60000 / 140 = 428.57 ms
        // 1 semicorchea (paso del secuenciador) = 428.57 / 4 = ~107 ms
        this.bgmInterval = setInterval(() => this._bgmTick(), 107);
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
        const measure = Math.floor(this.currentStep / 16);

        // --- CAPA 1: Latido de Construcción (Kick y Hi-hat) ---
        // Kick marcado en cada negra (Pulsos 0, 4, 8, 12)
        if (step % 4 === 0) {
            // Frecuencia baja simulando el bombo profundo (latido)
            this.play(50, 'sine', 0.2, 0.3);
            // "Click" del bombo para que marque bien el tempo
            this.play(120, 'triangle', 0.05, 0.1);
        }

        // Hi-Hat en las corcheas a contratiempo para empujar el ritmo
        if (step % 4 === 2) {
            // Onda cuadrada agudísima simula platillo retro
            this.play(8000, 'square', 0.02, 0.03);
            if (this.bgmLevel >= 1) { // Más brillante en el aire
                this.play(10000, 'square', 0.03, 0.02);
            }
        }

        // --- CAPA 2: Melodía de Sintetizador Retro que sube de tono ---
        // Patrón con sensación de andamiaje y escalada (Synthwave)
        const melodyRhythm = [1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 1, 0, 0, 1, 1, 0];

        // Escala pentatónica menor (escala épica retro)
        const scale = [130.81, 155.56, 174.61, 196.00, 233.08, 261.63, 311.13, 349.23, 392.00, 466.16, 523.25, 622.25, 698.46, 783.99, 932.33, 1046.50];

        if (melodyRhythm[step] === 1) {
            // La progresión de "acordes/tónica" sube cada 2 compases
            const progressionSteps = [0, 2, 4, 5];
            const baseIndex = progressionSteps[Math.floor(measure / 2) % progressionSteps.length];

            // Sube dentro del compás
            const noteIndex = (baseIndex + Math.floor(step / 2)) % scale.length;

            // Si el nivel aumenta (cielo, espacio), transponemos toda la escala
            const freq = scale[noteIndex] * Math.pow(2, this.bgmLevel);

            const synthType = (this.bgmLevel >= 2) ? 'sawtooth' : 'square';
            this.play(freq, synthType, 0.1, 0.04);
        }

        // --- CAPA 3: Bajo secuenciado octavado ---
        // Toca en semicorcheas alternando tónica grave y su octava aguda (estilo retro bass)
        if (step % 2 === 0) {
            const isDownbeat = (step % 4 === 0);
            const bassProgression = [65.41, 73.42, 82.41, 87.31]; // C2, D2, E2, F2
            let baseFreq = bassProgression[Math.floor(measure / 2) % bassProgression.length];

            // Arriba y abajo
            if (!isDownbeat) baseFreq *= 2;

            this.play(baseFreq, 'sawtooth', 0.15, 0.07);
        }

        // --- CAPA 4: Detalles que evocan la altura ---
        if (this.bgmLevel >= 2 && step === 14) {
            // Ecos estelares cuando subes muy alto
            this.play(2000 + Math.random() * 1000, 'sine', 0.1, 0.02);
            setTimeout(() => { if (this.bgmActive) this.play(2500 + Math.random() * 1000, 'sine', 0.1, 0.015); }, 50);
        }

        this.currentStep++;
    },

    // ==========================================
    //   AMBIENT SOUND EFFECTS (DISABLED)
    // ==========================================

    playBird() { },
    _playFilteredNoise() { },
    playPlane() { },
    playThunder() { },
    playSatellite() { },
    playAsteroid() { },
    playShootingStar() { }
};
