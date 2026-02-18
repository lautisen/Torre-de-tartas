const ui = {
    gameActive: false,
    score: 0,
    currentUser: "",

    init() {
        const btn = document.getElementById('start-btn');
        if(btn) btn.onclick = () => this.startGame();
        this.showBoard();
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

    saveScore(score) {
        let scores = JSON.parse(localStorage.getItem('cakeScores') || '[]');
        scores.push({ name: this.currentUser, score: score });
        scores.sort((a,b) => b.score - a.score);
        localStorage.setItem('cakeScores', JSON.stringify(scores.slice(0, 5)));
    },

    showBoard() {
        const scores = JSON.parse(localStorage.getItem('cakeScores') || '[]');
        const board = document.getElementById('high-score-board');
        if (board && scores.length > 0) {
            board.innerHTML = "<h3>🏆 Récords</h3>" + scores.map(s => `<div>${s.name}: ${s.score}</div>`).join('');
        }
    }
};
window.addEventListener('load', () => ui.init());
