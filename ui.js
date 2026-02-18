/**
 * ui.js - Controlador de Interfaz, Temporizador y Récords
 */

const ui = {
    gameActive: false,
    score: 0,
    startTime: 0,
    timerInterval: null,
    currentUser: "",
    currentTopScore: 0, // Almacena el récord actual del ranking

    /**
     * Inicializa los eventos de la pantalla de inicio
     */
    init() {
        const btn = document.getElementById('start-btn');
        if (btn) btn.onclick = () => this.startGame();
        
        // Cargar el ranking mundial desde Firebase
        if (typeof database !== 'undefined') {
            this.listenToLeaderboard();
        }
    },

    /**
     * Inicia la partida y el cronómetro
     */
    startGame() {
        const nameInput = document.getElementById('username');
        const name = nameInput.value.trim();

        if (!name) {
            return alert("¡Dime tu nombre, repostero!");
        }

        // Inicializar el sistema de audio (requiere interacción del usuario)
        if (typeof gameAudio !== 'undefined') gameAudio.init();

        this.currentUser = name;
        document.getElementById('user-display').innerText = name;
        
        // Cambiar de pantallas
        document.getElementById('user-screen').classList.add('hidden');
        document.getElementById('ui').classList.remove('hidden');
        document.getElementById('game-world').classList.remove('hidden');
        document.getElementById('crane-system').classList.remove('hidden');

        // Reset de puntuación y tiempo
        this.score = 0;
        document.getElementById('score').innerText = "0";
        this.startTime = Date.now();
        this.startTimer();

        this.gameActive = true;
        if (typeof gameMain !== 'undefined') gameMain.start();
    },

    /**
     * Gestiona el reloj digital del HUD
     */
    startTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => {
            const diff = Math.floor((Date.now() - this.startTime) / 1000);
            const mins = Math.floor(diff / 60).toString().padStart(2, '0');
            const secs = (diff % 60).toString().padStart(2, '0');
            const timerEl = document.getElementById('timer');
            if (timerEl) timerEl.innerText = `${mins}:${secs}`;
        }, 1000);
    },

    /**
     * Finaliza la partida y calcula la puntuación final
     */
    showGameOver(finalPisos) {
        this.gameActive = false;
        clearInterval(this.timerInterval);
        
        const totalSeconds = Math.floor((Date.now() - this.startTime) / 1000);
        
        // FÓRMULA DE PUNTUACIÓN: (Pisos * 100) - (Segundos * 5)
        const finalCalculatedScore = Math.max(0, (finalPisos * 100) - (totalSeconds * 5));

        const scoreDisplay = document.getElementById('final-score');
        if (scoreDisplay) {
            scoreDisplay.innerText = `${finalPisos} pisos (${finalCalculatedScore} pts)`;
        }
        
        document.getElementById('game-over-screen').classList.remove('hidden');
        
        this.saveScore(finalPisos, totalSeconds, finalCalculatedScore);
    },

    /**
     * Guarda en Firebase y comprueba si es récord
     */
    saveScore(pisos, tiempo, totalScore) {
        if (pisos <= 0 || typeof database === 'undefined') return;

        // ¿Es Récord Mundial? (Supera al Top 1 actual)
        if (totalScore > this.currentTopScore && this.currentTopScore !== 0) {
            this.showRecordMessage();
            if (typeof gameAudio !== 'undefined') gameAudio.worldRecord();
        }

        database.ref('leaderboard').push({
            name: this.currentUser,
            pisos: pisos,
            tiempo: tiempo,
            score: totalScore,
            timestamp: Date.now()
        });
    },

    /**
     * Muestra el cartel visual de nuevo récord
     */
    showRecordMessage() {
        const msg = document.createElement('div');
        msg.className = "record-message";
        msg.innerHTML = `🏆 ¡NUEVO RÉCORD! 🏆<br><span style="font-size: 0.5em;">${this.currentUser} ha superado a todos</span>`;
        document.body.appendChild(msg);
        
        // Se auto-elimina después de la animación de 3 segundos
        setTimeout(() => msg.remove(), 3000);
    },

    /**
     * Escucha cambios en Firebase para actualizar el Top 10
     */
    listenToLeaderboard() {
        const board = document.getElementById('high-score-board');
        const ref = database.ref('leaderboard').orderByChild('score').limitToLast(10);

        ref.on('value', (snap) => {
            if (!snap.exists()) {
                this.currentTopScore = 0;
                board.innerHTML = "<h3>🏆 Top Mundial</h3><p>¡Sé el primero!</p>";
                return;
            }

            const data = [];
            snap.forEach(child => { data.push(child.val()); });
            
            // Ordenamos de mayor a menor puntuación
            data.sort((a, b) => b.score - a.score);

            // Guardamos el récord actual para comparar en la siguiente partida
            this.currentTopScore = data[0].score;

            board.innerHTML = "<h3>🏆 Top 10 Mundial</h3>" + 
                data.map((s, i) => `
                    <div style="font-size: 0.85em; border-bottom: 1px solid #eee; padding: 5px; background: rgba(255,255,255,0.5);">
                        ${i+1}. <b>${s.name}</b> - ${s.score} pts 
                        <br><small>Pisos: ${s.pisos || 0} | Tiempo: ${s.tiempo || 0}s</small>
                    </div>
                `).join('');
        });
    }
};

// Cierre correcto del archivo e inicialización
window.onload = () => ui.init();
