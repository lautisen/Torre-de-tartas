const ui = {
    gameActive: false,
    score: 0,
    currentUser: "",

    init() {
        const btn = document.getElementById('start-btn');
        if (btn) btn.onclick = () => this.startGame();
        
        if (typeof database !== 'undefined') {
            this.listenToLeaderboard();
        } else {
            const board = document.getElementById('high-score-board');
            if (board) board.innerHTML = "<p>Error: config.js no cargado</p>";
        }
    },

    startGame() {
        const nameInput = document.getElementById('username');
        const name = nameInput ? nameInput.value.trim() : "";

        if (!name) return alert("¡Dime tu nombre, repostero!");

        this.currentUser = name;
        document.getElementById('user-display').innerText = name;
        document.getElementById('score').innerText = "0";

        document.getElementById('user-screen').classList.add('hidden');
        document.getElementById('game-over-screen').classList.add('hidden');
        document.getElementById('ui').classList.remove('hidden');
        document.getElementById('game-world').classList.remove('hidden');
        document.getElementById('crane-system').classList.remove('hidden');

        this.gameActive = true;
        if (typeof gameMain !== 'undefined') gameMain.start();
    },

    showGameOver(finalScore) {
        this.gameActive = false;
        const scoreEl = document.getElementById('final-score');
        if (scoreEl) scoreEl.innerText = finalScore;
        document.getElementById('game-over-screen').classList.remove('hidden');
        this.saveScore(finalScore);
    },

    saveScore(score) {
        if (score <= 0 || typeof database === 'undefined') return;
        database.ref('leaderboard').push({
            name: this.currentUser,
            score: score,
            timestamp: Date.now()
        });
    },

    listenToLeaderboard() {
        const board = document.getElementById('high-score-board');
        if (!board) return;

        const leaderboardRef = database.ref('leaderboard').orderByChild('score').limitToLast(10);

        leaderboardRef.on('value', (snapshot) => {
            if (!snapshot.exists()) {
                board.innerHTML = "<h3>🏆 Ranking</h3><p>¡Sé el primero!</p>";
                return;
            }

            const scores = [];
            snapshot.forEach((child) => { scores.push(child.val()); });
            scores.sort((a, b) => b.score - a.score);

            board.innerHTML = "<h3>🏆 Top 10</h3>" + 
                scores.map((s, i) => `
                    <div style="display:flex; justify-content:space-between; border-bottom:1px solid #eee;">
                        <span>${i + 1}. ${s.name}</span>
                        <span>${s.score}</span>
                    </div>
                `).join('');
        });
    }
};

// Cierre correcto del archivo
window.onload = () => ui.init();
