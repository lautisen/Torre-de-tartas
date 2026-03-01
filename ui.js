const ui = {
    gameActive: false,
    score: 0,
    floors: 0,
    sessionCoins: 0,
    startTime: 0,
    timerInterval: null,
    currentUser: "",
    currentUid: null,
    currentTopScore: 0,
    activeBoosters: {},

    init() {
        const btn = document.getElementById('start-btn');
        if (btn) btn.onclick = () => this.startGame();

        const shareBtn = document.getElementById('share-btn');
        if (shareBtn) shareBtn.onclick = () => this.shareScoreImage();

        const googleLoginBtn = document.getElementById('google-login-btn');
        if (googleLoginBtn) googleLoginBtn.onclick = () => this.loginWithGoogle();

        const googleLoginBtnGO = document.getElementById('google-login-btn-go');
        if (googleLoginBtnGO) googleLoginBtnGO.onclick = () => this.loginWithGoogle(true);

        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) logoutBtn.onclick = () => this.logout();

        const emailLinkBtn = document.getElementById('email-link-btn');
        if (emailLinkBtn) emailLinkBtn.onclick = () => this.sendEmailLink();

        this.listenToAuth();
        this.completeEmailLinkSignIn();

        this.updateMotivationalText();
        this.listenToLeaderboard();
        this._initTutorial();
    },

    updateMotivationalText() {
        const phrases = [
            "Eres mejor que tus colegas, demuéstraselo 😎",
            "La física no miente, pero tu pulso sí 🏗️",
            "Nadie en tu grupo de amigos de WhatsApp llega a la Galaxia 🌌",
            "Concéntrate. Respira. Y no la cagues en el piso 4 🍰",
            "Menos deslizar en TikTok y más calcular la caída ⏱️",
            "Esa tarta no se va a apilar sola. ¡A trabajar! 🔥",
            "Hoy es un buen día para romper un récord mundial 🏆",
            "Dicen que pasarlo a la primera es un mito... ¿O no? 🤔",
            "Si llegas a las Nubes, te ganas mi respeto absoluto ☁️",
            "¿Otra partidita? Venga, que esta es la buena 🚀"
        ];
        const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
        const textEl = document.getElementById('motivational-text');
        if (textEl) textEl.innerText = randomPhrase;
    },

    listenToAuth() {
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                this.currentUser = user.displayName || user.email.split('@')[0];
                this.currentUid = user.uid;

                document.getElementById('auth-section').classList.add('hidden');
                document.getElementById('user-info-section').classList.remove('hidden');
                document.getElementById('logged-in-name').innerText = this.currentUser;

                if (typeof shop !== 'undefined') shop.loadData(this.currentUid);
            } else {
                this.currentUid = null;
                document.getElementById('auth-section').classList.remove('hidden');
                document.getElementById('user-info-section').classList.add('hidden');
            }
        });
    },

    loginWithGoogle(fromGameOver = false) {
        firebase.auth().signInWithPopup(provider).then((result) => {
            console.log("Logged in:", result.user.displayName);
            if (fromGameOver && this.gameActive === false && !document.getElementById('game-over-screen').classList.contains('hidden')) {
                this.saveScore(this.floors, Math.floor((Date.now() - this.startTime) / 1000), this.score);
                document.getElementById('guest-save-prompt').classList.add('hidden');
            }
        }).catch((error) => {
            console.error(error);
            alert("Error al iniciar sesión: " + error.message);
        });
    },

    sendEmailLink() {
        const emailInput = document.getElementById('email-link-input');
        const email = emailInput ? emailInput.value.trim() : '';
        if (!email) return alert('Introduce tu correo electrónico.');

        const actionCodeSettings = {
            url: window.location.href.split('?')[0],
            handleCodeInApp: true
        };

        firebase.auth().sendSignInLinkToEmail(email, actionCodeSettings)
            .then(() => {
                window.localStorage.setItem('emailForSignIn', email);
                document.getElementById('email-link-section').classList.add('hidden');
                document.getElementById('email-link-sent').classList.remove('hidden');
            })
            .catch((error) => {
                console.error(error);
                alert('Error al enviar el enlace: ' + error.message);
            });
    },

    completeEmailLinkSignIn() {
        if (!firebase.auth().isSignInWithEmailLink(window.location.href)) return;

        let email = window.localStorage.getItem('emailForSignIn');
        if (!email) {
            email = window.prompt('Por favor, introduce tu email para confirmar el inicio de sesión:');
        }
        if (!email) return;

        firebase.auth().signInWithEmailLink(email, window.location.href)
            .then((result) => {
                window.localStorage.removeItem('emailForSignIn');
                // Clean the URL from the sign-in link parameters
                window.history.replaceState(null, '', window.location.pathname);
                console.log('Email link sign-in successful:', result.user.email);
            })
            .catch((error) => {
                console.error(error);
                alert('Error al completar el inicio de sesión: ' + error.message);
            });
    },

    logout() {
        firebase.auth().signOut().then(() => {
            this.currentUser = "";
            this.currentUid = null;
            if (typeof shop !== 'undefined') {
                const nameInput = document.getElementById('username');
                if (nameInput && nameInput.value.trim()) {
                    shop.loadData(nameInput.value.trim());
                } else {
                    shop.coins = 0;
                    document.getElementById('shop-coins-display').innerText = 0;
                }
            }
        });
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

        if (!this.currentUid) {
            const nameInput = document.getElementById('username');
            const name = nameInput.value.trim();
            if (!this.currentUser && !name) {
                return alert('¡Dime tu nombre para jugar o inicia sesión con Google!');
            }
            if (name) {
                this.currentUser = name;
                document.getElementById('user-display').innerText = name;
                if (typeof shop !== 'undefined') shop.loadData(name);
            }
        } else {
            document.getElementById('user-display').innerText = this.currentUser;
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
        this.floors = 0;
        this.sessionCoins = 0;
        document.getElementById('score').innerText = this.score;
        document.getElementById('floors-display').innerText = this.floors;
        const badge = document.getElementById('multiplier-badge');
        if (badge) {
            badge.style.opacity = '0.3';
            badge.innerText = 'x1 🔥';
        }
        this.startTime = Date.now();
        this.startTimer();

        // Load consumed boosters for this run if player selected them
        this.activeBoosters = {
            slowMotion: false,
            magnet: false,
            extraLife: false
        };

        // Auto-consume 'slowMotion' if they have it
        if (typeof shop !== 'undefined' && shop.consumeBooster('slowMotion')) {
            this.activeBoosters.slowMotion = true;
            this.showBoosterActivation('🐢 Cuerda Lenta Activada');
        }

        // Auto-consume 'extraLife' if they have it
        if (typeof shop !== 'undefined' && shop.consumeBooster('extraLife')) {
            this.activeBoosters.extraLife = true;
            setTimeout(() => this.showBoosterActivation('🧴 Pegamento Extra Activado'), 1500);
        }

        this.updateBoostersHUD();

        this.gameActive = true;
        gameMain.start();
    },

    updateBoostersHUD() {
        const hud = document.getElementById('active-boosters-hud');
        if (!hud) return;
        hud.innerHTML = '';
        if (this.activeBoosters.slowMotion) {
            hud.innerHTML += `<div class="booster-icon slow-motion">🐢</div>`;
        }
        if (this.activeBoosters.extraLife) {
            hud.innerHTML += `<div class="booster-icon extra-life">🧴</div>`;
        }
    },

    showBoosterActivation(msg) {
        const el = document.createElement('div');
        el.className = 'perfect-text'; // Reusing this class for the floating text
        el.innerText = msg;
        el.style.left = '50%';
        el.style.top = '30%';
        el.style.fontSize = '24px';
        el.style.color = '#cddc39';
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 2500);
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
        const finalCalculatedScore = ui.score; // Usar el score real del jugador con combos
        const timeStr = document.getElementById('timer').innerText;

        // Actualizar UI de Game Over mostrando el diálogo
        document.getElementById('final-floors').innerText = `${finalPisos} Pisos (⏱️ ${timeStr})`;
        document.getElementById('final-coins').innerText = `+${ui.sessionCoins} 🪙`;

        if (typeof shop !== 'undefined' && ui.sessionCoins > 0) {
            shop.addCoins(ui.sessionCoins);
        }

        this.updateGameOverText();
        document.getElementById('game-over-screen').classList.remove('hidden');

        // Animación de conteo del puntaje final
        const scoreEl = document.getElementById('final-score');
        scoreEl.innerText = "0";
        const duration = 1200; // 1.2 segundos
        const startAnimTime = Date.now();

        const countUp = () => {
            const now = Date.now();
            const progress = Math.min((now - startAnimTime) / duration, 1);
            // Ease-out expo curve for a dramatic slowdown at the end
            const easeOut = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            const currentVal = Math.floor(easeOut * finalCalculatedScore);
            scoreEl.innerText = currentVal.toLocaleString();

            if (progress < 1) requestAnimationFrame(countUp);
            else scoreEl.innerText = finalCalculatedScore.toLocaleString();
        };
        requestAnimationFrame(countUp);

        // Preparar variables de compatir ocultas en el DOM (si hicieran falta para fallback)
        const resPts = document.getElementById('res-pts');
        const resTime = document.getElementById('res-time');
        if (resPts) resPts.innerText = finalCalculatedScore;
        if (resTime) resTime.innerText = timeStr;

        if (!this.currentUid && finalPisos > 0) {
            document.getElementById('guest-save-prompt').classList.remove('hidden');
        } else {
            document.getElementById('guest-save-prompt').classList.add('hidden');
        }

        this.saveScore(finalPisos, totalSeconds, finalCalculatedScore);
    },

    updateGameOverText() {
        const gameoverPhrases = [
            "¿Eso fue todo? ¡Mis abuelos encajan mejor que eso! 👴",
            "La gravedad ha ganado hoy, pero tú puedes ganarle mañana 🍎",
            "Buena técnica, pésima ejecución. ¡Prueba otra vez! 🔨",
            "Esa tarta se ha estampado con estilo, hay que admitirlo ✨",
            "Oops. Creo que te saltaste la clase de física cuántica 📐",
            "¿Tu dedo resbaló por la mantequilla o qué pasó? 🧈",
            "Nadie dijo que hacer tartas en la estratosfera fuera fácil 🚀",
            "Casi, casi... Pero el 'casi' no rompe récords mundiales 🏆",
            "La torre de pisa empezó así y mira, es famosa 🇮🇹",
            "Se te olvidó soplar las velas antes de tirarla 🎂",
            "Madre mía qué desastre... Menuda limpieza nos toca hacer 🧹",
            "¡Amasando la tragedia a proporciones bíblicas! 🌊",
            "¿Era una torre o estabas intentando hacer una escalera torcida? 📏",
            "Eso no ha sido un error, ha sido 'deconstrucción culinaria' 👨‍🍳",
            "Hasta la grúa está decepcionada con ese ángulo 🏗️",
            "Juega otra, nadie ha visto esa caída estrepitosa 👀",
            "Has hecho feliz a las hormigas del suelo con tanto pastel 🐜",
            "Eso duele más que morder una galleta y que sea pasa 🍪",
            "¡Puf! Una víctima más de la Ley de la Gravedad Universal 🌍",
            "Si el objetivo era manchar el suelo, felicidades... 🏅"
        ];
        const randomPhrase = gameoverPhrases[Math.floor(Math.random() * gameoverPhrases.length)];
        const textEl = document.getElementById('game-over-phrase');
        if (textEl) textEl.innerText = randomPhrase;
    },

    showRankings() {
        if (typeof gameAudio !== 'undefined') gameAudio.uiClick();
        document.getElementById('game-over-screen').classList.add('hidden');
        document.getElementById('user-screen').classList.remove('hidden');
        // Hide the active game HUD in background to look cleaner
        document.getElementById('ui').classList.add('hidden');

        // Auto-fill the existing user's name if they've already played
        if (this.currentUser) {
            const nameInput = document.getElementById('username');
            if (nameInput) nameInput.value = this.currentUser;
        }

        // Rotar la frase cuando vuelven desde game-over
        this.updateMotivationalText();
    },

    async shareScoreImage() {
        if (typeof gameAudio !== 'undefined') gameAudio.uiClick();

        const btn = document.getElementById('share-btn');
        const originalText = btn.innerHTML;
        btn.innerHTML = '⏳ Compartiendo...';
        btn.disabled = true;

        const score = ui.score; // Asumiendo que el score final está aquí
        const pisos = ui.floors;
        const text = `🏗️🎂 Torre de tartas:\n${pisos} Pisos\n${score} Puntos del día\n\n¡Intenta superarme! 👉 https://lautisen.github.io/Torre-de-tartas/`;

        if (navigator.share) {
            try {
                await navigator.share({ text: text });
                btn.innerHTML = '¡Compartido! ✅';
            } catch (shareErr) {
                console.log('Error o cancelado', shareErr);
                btn.innerHTML = originalText;
            }
        } else {
            // Fallback: Copy to clipboard if Web Share API is not supported (e.g. some desktop browsers)
            try {
                if (navigator.clipboard && window.isSecureContext) {
                    await navigator.clipboard.writeText(text);
                    btn.innerHTML = '¡Copiado al portapapeles! 📋';
                } else {
                    alert('Tu dispositivo no soporta compartir automáticamente.\n\nCopia y pega esto:\n' + text);
                    btn.innerHTML = originalText;
                }
            } catch (err) {
                console.error('Error al copiar: ', err);
                btn.innerHTML = originalText;
            }
        }

        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }, 2000);
    },

    saveScore(pisos, tiempo, totalScore) {
        if (pisos <= 0) return;

        if (totalScore > this.currentTopScore && this.currentTopScore !== 0) {
            this.showRecordMessage();
            if (typeof gameAudio !== 'undefined') gameAudio.worldRecord();
        }

        if (this.currentUid) {
            database.ref('leaderboard').push({
                uid: this.currentUid,
                name: this.currentUser,
                pisos: pisos,
                tiempo: tiempo,
                score: totalScore,
                timestamp: Date.now()
            });
        }
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
                    <div class="lb-row">
                        <span class="lb-pos">${i + 1}.</span>
                        <span class="lb-name">${s.name}</span>
                        <span class="lb-score">${s.score} pts</span>
                    </div>
                `).join('');
        });
    }
};

window.onload = () => ui.init();
