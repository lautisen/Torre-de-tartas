const gameAudio = {
    ctx: null,

    init() {
        // Inicializa el contexto de audio tras la primera interacción (requisito del navegador)
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
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

    // Sonido cuando la tarta cae bien
    success() {
        this.play(523.25, 'sine', 0.2); // Nota Do
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
    }
};
