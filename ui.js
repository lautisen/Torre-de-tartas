const ui = {
    gameActive: false, score: 0, currentUser: "",

    init() {
        document.getElementById('start-btn').onclick = () => this.startGame();
        this.listenToLeaderboard();
    },

    startGame() {
        const name = document.getElementById('username').value.trim();
        if (!name) return alert("¡Dime tu nombre!");
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
        if (score > 0) database.ref('leaderboard').push({ name: this.currentUser, score: score, timestamp: Date.now() });
    },

    listenToLeaderboard() {
        database.ref('leaderboard').orderByChild('score').limitToLast(5).on('value', (snap) => {
            const data = snap.val();
            const scores = [];
            for (let id in data) scores.push(data[id]);
            scores.sort((a, b) => b.score - a.score);
            document.getElementById('high-score-board').innerHTML = "<h3>🏆 Top 5</h3>" + scores.map(s => `<div>${s.name}: ${s.score}</div>`).join('');
        });
    }
};
window.onload = () => ui.init();
