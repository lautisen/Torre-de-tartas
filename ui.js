/**
 * ui.js - Gestión de Interfaz y Conexión con Firebase
 */

const ui = {
    gameActive: false,
    score: 0,
    currentUser: "",

    /**
     * Inicializa los eventos de la interfaz
     */
    init() {
        const btn = document.getElementById('start-btn');
        if (btn) btn.onclick = () => this.startGame();
        
        // Verificamos si la base de datos está disponible antes de intentar leer
        if (typeof database !== 'undefined') {
            console.log("Firebase detectado correctamente.");
            this.listenToLeaderboard();
        } else {
            console.error("Error: 'database' no está definida. Revisa el orden de los scripts en index.html.");
            const board = document.getElementById('high-score-board');
            if (board) board.innerHTML = "<p style='color:red'>Error de conexión con la base de datos</p>";
        }
    },

    /**
     * Valida el nombre y arranca el motor del juego
     */
    startGame() {
        const nameInput = document.getElementById('username');
        const name = nameInput.value.trim();

        if (!name) {
            return alert("¡Dime tu nombre, repostero!");
        }

        this.currentUser = name;
        document.getElementById('user-display').innerText = name;
        document.getElementById('score').innerText = "0";

        // Gestión de pantallas
        document.getElementById('user-screen').classList.add('hidden');
        document.getElementById('game-over-screen').classList.add('hidden');
        document.getElementById('ui').classList.remove('hidden');
        document.getElementById('game-world').classList.remove('hidden');
        document.getElementById('crane-system').classList.remove('hidden');

        this.gameActive = true;
        
        // Llamada al motor principal en main.js
        if (typeof gameMain !== 'undefined') {
            gameMain.start();
        }
    },

    /**
     * Muestra la pantalla de Game Over integrada
     */
    showGameOver(finalScore) {
        this.gameActive = false;
        document.getElementById('final-score').innerText = finalScore;
        document.getElementById('game-over-screen').classList.remove('hidden');
        
        // Guardar puntuación en Firebase
        this.saveScore(finalScore);
    },

    /**
     * Envía los datos a Firebase Realtime Database
     */
    saveScore(score) {
        if (score <= 0) return;

        database.ref('leaderboard').push({
            name:
