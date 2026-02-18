const ui = {
    gameActive: false,
    score: 0,
    currentUser: "",

    init() {
        document.getElementById('start-btn').onclick = () => this.startGame();
        this.listenToLeaderboard();
    },

    startGame() {
        const name = document.getElementById('username').value.trim();
        if (!name) return alert("¡Escribe tu nombre!");

        this.currentUser = name;
        document.getElementById('user-display').innerText = name;
        
        document.getElementById('user-screen').classList.add('hidden');
        document.getElementById('game-over-screen').classList.add('hidden');
        document.getElementById('ui').classList.remove('hidden');
        document.getElementById('game-world').classList.remove('hidden');
        document.getElementById('crane-system').classList.remove('hidden');

        this.gameActive = true;
        gameMain.start(); // LLAMADA AL MOTOR
    },

    showGameOver(finalScore) {
        this.gameActive = false;
        document.getElementById('final-score').innerText = finalScore;
        document.getElementById('game-over-screen').classList.remove('hidden');
        this.saveScore(finalScore);
    },

    saveScore(score) {
        if (score > 0) database.ref('leaderboard').push({ name: this.currentUser, score: score });
    },

    listenToLeaderboard() {
        database.ref('leaderboard').orderByChild('score').limitToLast(5).on('value', (snap) => {
            const data = snap.val();
            let html = "<h3>🏆 Ranking</h3>";
            for (let id in data) html += `<div>${data[id].name}: ${data[id].score}</div>`;
            document.getElementById('high-score-board').innerHTML = html;
        });
    }
};
window.addEventListener('load', () => ui.init());
