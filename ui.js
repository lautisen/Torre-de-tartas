// Configuración oficial de Firebase para Torre de Tartas
const firebaseConfig = {
    apiKey: "AIzaSyBJIa7dDZ3PUWiUWRO23gXZj4peEsMmUEE",
    authDomain: "torre-de-tartas.firebaseapp.com",
    databaseURL: "https://torre-de-tartas-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "torre-de-tartas",
    storageBucket: "torre-de-tartas.firebasestorage.app",
    messagingSenderId: "119201007028",
    appId: "1:119201007028:web:fd25b313bc58656cc15ee1",
    measurementId: "G-6DWPVCHZR4"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

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
        document.getElementById('score').innerText = "0";

        document.getElementById('user-screen').classList.add('hidden');
        document.getElementById('ui').classList.remove('hidden');
        document.getElementById('game-world').classList.remove('hidden');
        document.getElementById('crane-system').classList.remove('hidden');

        this.gameActive = true;
        gameMain.start();
    },

    // Envía el puntaje al Top Mundial
    saveScore(score) {
        if (score <= 0) return;
        database.ref('leaderboard').push({
            name: this.currentUser,
            score: score,
            timestamp: Date.now()
        });
    },

    // Escucha cambios globales en el ranking
    listenToLeaderboard() {
        const boardRef = database.ref('leaderboard').orderByChild('score').limitToLast(10);
        boardRef.on('value', (snapshot) => {
            const data = snapshot.val();
            const scores = [];
            for (let id in data) scores.push(data[id]);
            
            // Ordenar descendente
            scores.sort((a, b) => b.score - a.score);
            
            const board = document.getElementById('high-score-board');
            if (board) {
                board.innerHTML = "<h3>🏆 Top Mundial</h3>" + 
                    scores.map((s, i) => `<div>${i+1}. <strong>${s.name}</strong>: ${s.score}</div>`).join('');
            }
        });
    }
};

window.addEventListener('load', () => ui.init());
