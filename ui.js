const ui = {
    gameActive: false,
    score: 0,
    startTime: 0,
    timerInterval: null,
    currentUser: "",
    currentTopScore: 0,

    init() {
        const btn = document.getElementById('start-btn');
        if (btn) btn.onclick = () => this.startGame();

        const shareBtn = document.getElementById('share-btn');
        if (shareBtn) shareBtn.onclick = () => this.shareScoreImage();

        this.listenToLeaderboard();
        this._initTutorial();
    },

    _initTutorial() {
        const overlay = document.getElementById('tutorial-overlay');
        const nextBtn = document.getElementById('tutorial-next-btn');
        if (!overlay || !nextBtn) return;

        const steps = overlay.querySelectorAll('.tutorial-step');
        const dots = overlay.querySelectorAll('.dot');
        let current = 0;
        const total = steps.length;

        this._tutorialNext = () => {
            if (typeof gameAudio !== 'undefined') gameAudio.uiClick();
            steps[current].classList.remove('active');
            dots[current].classList.remove('active');
            current++;
            if (current < total) {
                steps[current].classList.add('active');
                dots[current].classList.add('active');
                if (current === total - 1) nextBtn.textContent = '¡Jugar! 🎂';
            } else {
                // Last step -> close tutorial and start game
                overlay.classList.add('hidden');
                this._doStartGame();
            }
        };

        nextBtn.onclick = () => this._tutorialNext();
    },

    startGame(e) {
        if (e) e.preventDefault();
        const nameInput = document.getElementById('username');
        const name = nameInput.value.trim();

        // Only require name if we haven't registered yet
        if (!this.currentUser) {
            if (!name) return alert('¡Dime tu nombre!');
            this.currentUser = name;
            document.getElementById('user-display').innerText = name;
        }

        if (typeof gameAudio !== 'undefined') {
            gameAudio.init();
            gameAudio.uiClick();
            gameAudio.startBgm();
        }

        document.getElementById('user-screen').classList.add('hidden');
        document.getElementById('game-over-screen').classList.add('hidden');

        // Check if we should show the tutorial (first play only)
        const plays = parseInt(localStorage.getItem('tdt_plays') || '0', 10);
        if (plays < 1) {
            localStorage.setItem('tdt_plays', plays + 1);
            // Reset tutorial to step 0 in case it was opened before
            const overlay = document.getElementById('tutorial-overlay');
            const steps = overlay.querySelectorAll('.tutorial-step');
            const dots = overlay.querySelectorAll('.dot');
            const nextBtn = document.getElementById('tutorial-next-btn');
            steps.forEach(s => s.classList.remove('active'));
            dots.forEach(d => d.classList.remove('active'));
            steps[0].classList.add('active');
            dots[0].classList.add('active');
            if (nextBtn) nextBtn.textContent = 'Siguiente →';
            overlay.classList.remove('hidden');
            // _doStartGame() will be called when tutorial completes
        } else {
            this._doStartGame();
        }
    },

    _doStartGame() {

        // El HUD principal (score y timer)
        document.getElementById('ui').classList.remove('hidden');
        document.getElementById('game-world').classList.remove('hidden');
        document.getElementById('crane-system').classList.remove('hidden');

        this.score = 0;
        document.getElementById('score').innerText = this.score;
        this.startTime = Date.now();
        this.startTimer();

        this.gameActive = true;
        gameMain.start();
    },

    startTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => {
            const diff = Math.floor((Date.now() - this.startTime) / 1000);
            const mins = Math.floor(diff / 60).toString().padStart(2, '0');
            const secs = (diff % 60).toString().padStart(2, '0');
            document.getElementById('timer').innerText = `${mins}:${secs}`;
        }, 1000);
    },

    showGameOver(finalPisos) {
        this.gameActive = false;
        clearInterval(this.timerInterval);
        if (typeof gameAudio !== 'undefined') gameAudio.stopBgm();

        const totalSeconds = Math.floor((Date.now() - this.startTime) / 1000);
        const finalCalculatedScore = Math.max(0, (finalPisos * 100) - (totalSeconds * 5));
        const timeStr = document.getElementById('timer').innerText;

        // Actualizar UI de Game Over
        document.getElementById('final-score').innerText = `${finalPisos} pisos (${finalCalculatedScore} pts)`;
        document.getElementById('game-over-screen').classList.remove('hidden');

        // Preparar plantilla de compartir
        document.getElementById('res-pts').innerText = finalCalculatedScore;
        document.getElementById('res-time').innerText = timeStr;

        this.saveScore(finalPisos, totalSeconds, finalCalculatedScore);
    },

    shareScoreImage() {
        if (typeof gameAudio !== 'undefined') gameAudio.uiClick();
        const template = document.getElementById('share-template');

        html2canvas(template).then(canvas => {
            const link = document.createElement('a');
            link.download = `record_${this.currentUser}.png`;
            link.href = canvas.toDataURL("image/png");
            link.click();
        });
    },

    saveScore(pisos, tiempo, totalScore) {
        if (pisos <= 0) return;

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

    showRecordMessage() {
        const msg = document.createElement('div');
        msg.className = 'record-message';
        msg.innerHTML = `
            <p class="record-title">¡NUEVO RÉCORD!</p>
            <p class="record-sub">Eres el mejor del mundo</p>
        `;
        document.body.appendChild(msg);
        setTimeout(() => msg.remove(), 3200);
    },

    listenToLeaderboard() {
        const board = document.getElementById('high-score-board');
        const ref = database.ref('leaderboard').orderByChild('score').limitToLast(10);

        ref.on('value', (snap) => {
            if (!snap.exists()) {
                this.currentTopScore = 0;
                return;
            }
            const data = [];
            snap.forEach(child => { data.push(child.val()); });
            data.sort((a, b) => b.score - a.score);
            this.currentTopScore = data[0].score;

            board.innerHTML = "<h3>🏆 Top Mundial</h3>" +
                data.map((s, i) => `
                    <div style="font-size: 0.8em; border-bottom: 1px solid #eee; padding: 3px;">
                        ${i + 1}. <b>${s.name}</b> - ${s.score} pts
                    </div>
                `).join('');
        });
    }
};

window.onload = () => ui.init();
