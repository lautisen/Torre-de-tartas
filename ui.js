const ui = {
    gameActive: false,
    score: 0,
    startTime: 0,
    timerInterval: null,
    currentUser: "",

    init() {
        const btn = document.getElementById('start-btn');
        if (btn) btn.onclick = () => this.startGame();
        this.listenToLeaderboard();
    },

    startGame() {
        const nameInput = document.getElementById('username');
        const name = nameInput.value.trim();
        if (!name) return alert("¡Dime tu nombre, repostero!");

        this.currentUser = name;
        document.getElementById('user-display').innerText = name;
        
        // Reset de interfaz
        document.getElementById('user-screen').classList.add('hidden');
        document.getElementById('ui').classList.remove('hidden');
        document.getElementById('game-world').classList.remove('hidden');
        document.getElementById('crane-system').classList.remove('hidden');

        // Iniciar cronómetro
        this.score = 0;
        this.startTime = Date.now();
        this.startTimer();

        this.gameActive = true;
        gameMain.start();
    },

    startTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => {
            const now = Date.now();
            const diff = Math.floor((now - this.startTime) / 1000);
            const mins = Math.floor(diff / 60).toString().padStart(2, '0');
            const secs = (diff % 60).toString().padStart(2, '0');
            document.getElementById('timer').innerText = `${mins}:${secs}`;
        }, 1000);
    },

    showGameOver(finalPisos) {
        this.gameActive = false;
        clearInterval(this.timerInterval);
        
        const totalSeconds = Math.floor((Date.now() - this.startTime) / 1000);
        
        // CÁLCULO: 100 puntos por piso, -5 por cada segundo.
        const finalCalculatedScore = Math.max(0, (finalPisos * 100) - (totalSeconds * 5));

        document.getElementById('final-score').innerText = `${finalPisos} pisos (${finalCalculatedScore} pts)`;
        document.getElementById('game-over-screen').classList.remove('hidden');
        
        this.saveScore(finalPisos, totalSeconds, finalCalculatedScore);
    },

    saveScore(pisos, tiempo, totalScore) {
        if (pisos <= 0) return;
        database.ref('leaderboard').push({
            name: this.currentUser,
            pisos: pisos,
            tiempo: tiempo,
            score: totalScore,
            timestamp: Date.now()
        });
    },

    listenToLeaderboard() {
        const board = document.getElementById('high-score-board');
        const ref = database.ref('leaderboard').orderByChild('score').limitToLast(10);

        ref.on('value', (snap) => {
            if (!snap.exists()) return;
            const data = [];
            snap.forEach(child => { data.push(child.val()); });
            data.sort((a, b) => b.score - a.score);

            board.innerHTML = "<h3>🏆 Top Mundial</h3>" + 
                data.map((s, i) => `
                    <div style="font-size: 0.85em; border-bottom: 1px solid #eee; margin-bottom: 4px; padding: 2px;">
                        ${i+1}. <b>${s.name}</b> - ${s.score} pts 
                        <br><small>Pisos: ${s.pisos} | Tiempo: ${s.tiempo}s</small>
                    </div>
                `).join('');
        });
    }
};
window.onload = () => ui.init();
