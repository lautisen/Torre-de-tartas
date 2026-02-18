const ui = {
    gameActive: false,
    score: 0,
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
        
        document.getElementById('user-screen').classList.add('hidden');
        document.getElementById('ui').classList.remove('hidden');
        document.getElementById('game-world').classList.remove('hidden');
        document.getElementById('crane-system').classList.remove('hidden');

        this.gameActive = true;
        gameMain.start();
    },

    showGameOver(finalScore) {
        this.gameActive = false;
        document.getElementById('final-score').innerText = finalScore;
        document.getElementById('game-over-screen').classList.remove('hidden');
        this.saveScore(finalScore);
    },

    saveScore(score) {
        if (score <= 0) return;
        database.ref('leaderboard').push({
            name: this.currentUser,
            score: score,
            timestamp: Date.now()
        });
    },

    listenToLeaderboard() {
        const board = document.getElementById('high-score-board');
        if (!board) return;

        // Referencia a la tabla de puntuaciones
        const boardRef = database.ref('leaderboard').orderByChild('score').limitToLast(10);

        boardRef.on('value', (snapshot) => {
            if (!snapshot.exists()) {
                board.innerHTML = "<h3>🏆 Top Mundial</h3><p>¡Sé el primero en el ranking!</p>";
                return;
            }

            const data = snapshot.val();
            const scores = [];
            for (let id in data) {
                scores.push(data[id]);
            }

            // Ordenar de mayor a menor
            scores.sort((a, b) => b.score - a.score);

            board.innerHTML = "<h3>🏆 Top Mundial</h3>" + 
                scores.map((s, i) => `
                    <div style="display:flex; justify-content:space-between; margin-bottom:5px; border-bottom:1px solid #eee;">
                        <span>${i+1}. <strong>${s.name}</strong></span>
                        <span>${s.score} pts</span>
                    </div>
                `).join('');
        }, (error) => {
            console.error("Error cargando el ranking:", error);
            board.innerHTML = "<p>Error al cargar el ranking.</p>";
        });
    }
};
window.onload = () => ui.init();
