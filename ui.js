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

        const adReviveBtn = document.getElementById('ad-revive-btn');
        if (adReviveBtn) adReviveBtn.onclick = () => this.reviveWithAd();

        const adDoubleBtn = document.getElementById('ad-double-coins-btn');
        if (adDoubleBtn) adDoubleBtn.onclick = () => this.doubleCoinsWithAd();

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
                // Determine if user has an alias
                firebase.database().ref('users/' + user.uid + '/alias').once('value').then((snapshot) => {
                    if (snapshot.exists()) {
                        // User has an alias, complete login
                        this.finalizeLogin(user.uid, snapshot.val());
                    } else {
                        // Needs alias
                        this.showAliasPrompt(user);
                    }
                }).catch(e => {
                    console.error("Error fetching alias:", e);
                    // Critical error: show something to the user
                    alert("Error al conectar con la base de datos. Por favor, recarga la página.");
                });
            } else {
                this.currentUid = null;
                document.getElementById('auth-section').classList.remove('hidden');
                document.getElementById('user-info-section').classList.add('hidden');
            }
        });
    },

    finalizeLogin(uid, alias) {
        this.currentUser = alias;
        this.currentUid = uid;

        const authSec = document.getElementById('auth-section');
        const userInfoSec = document.getElementById('user-info-section');
        if (authSec) authSec.classList.add('hidden');
        if (userInfoSec) userInfoSec.classList.remove('hidden');

        const loggedInName = document.getElementById('logged-in-name');
        if (loggedInName) loggedInName.innerText = this.currentUser;

        if (typeof shop !== 'undefined') shop.loadData(this.currentUid);

        // If from Game Over screen
        const gameOverScreen = document.getElementById('game-over-screen');
        if (this.gameActive === false && gameOverScreen && !gameOverScreen.classList.contains('hidden') && this.floors > 0) {
            this.saveScore(this.floors, Math.floor((Date.now() - this.startTime) / 1000), this.score);
            const prompt = document.getElementById('guest-save-prompt');
            if (prompt) prompt.classList.add('hidden');
        }
    },

    showAliasPrompt(user) {
        const modal = document.getElementById('alias-modal');
        const input = document.getElementById('alias-input');
        const error = document.getElementById('alias-error');
        const btn = document.getElementById('btn-save-alias');

        if (!modal) return;

        modal.classList.remove('hidden');
        error.innerText = '';

        // Suggest default name (first name only, clean up spaces, make it alphanumeric max 12)
        let suggest = (user.displayName ? user.displayName.split(' ')[0] : user.email.split('@')[0]);
        suggest = suggest.replace(/[^a-zA-Z0-9]/g, '').substring(0, 12);
        input.value = suggest;

        btn.onclick = () => {
            const desiredAlias = input.value.trim();
            if (desiredAlias.length < 3) {
                error.innerText = "Mínimo 3 caracteres.";
                return;
            }

            // Check if exists
            btn.disabled = true;
            btn.innerText = 'Verificando...';
            error.innerText = '';

            const aliasKey = desiredAlias.toLowerCase();
            firebase.database().ref('aliases/' + aliasKey).once('value').then(snap => {
                if (snap.exists() && snap.val() !== user.uid) {
                    error.innerText = "❌ Este alias ya está en uso.";
                    btn.disabled = false;
                    btn.innerText = 'Guardar Alias';
                } else {
                    // Valid, save it
                    const updates = {};
                    updates['/users/' + user.uid + '/alias'] = desiredAlias;
                    updates['/aliases/' + aliasKey] = user.uid;

                    firebase.database().ref().update(updates).then(() => {
                        modal.classList.add('hidden');
                        this.finalizeLogin(user.uid, desiredAlias);
                    }).catch(err => {
                        error.innerText = "Error al guardar. Intenta de nuevo.";
                        btn.disabled = false;
                        btn.innerText = 'Guardar Alias';
                        console.error(err);
                    });
                }
            }).catch(e => {
                error.innerText = "❌ Error al verificar disponibilidad. Revisa tu conexión.";
                btn.disabled = false;
                btn.innerText = 'Guardar Alias';
                console.error(e);
            });
        };
    },


    loginWithGoogle(fromGameOver = false) {
        // Just trigger popup; the onAuthStateChanged listener handles the rest
        firebase.auth().signInWithPopup(provider).catch((error) => {
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

        // Rewarded ad buttons: reset for this game over
        this._adReviveUsed = false;
        this._adDoubleUsed = false;
        const reviveBtn = document.getElementById('ad-revive-btn');
        const doubleBtn = document.getElementById('ad-double-coins-btn');
        if (reviveBtn) { reviveBtn.classList.remove('hidden'); reviveBtn.disabled = false; reviveBtn.innerHTML = '🧴 Segunda Vida (Ver anuncio)'; }
        if (doubleBtn) { doubleBtn.classList.remove('hidden'); doubleBtn.disabled = false; doubleBtn.innerHTML = '🪙 x2 Monedas (Ver anuncio)'; }

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

    reviveWithAd() {
        if (this._adReviveUsed) return;
        this._adReviveUsed = true;

        const btn = document.getElementById('ad-revive-btn');
        if (btn) { btn.disabled = true; btn.innerHTML = '⏳ Cargando anuncio...'; }

        rewardedAds.showRewarded('revive', () => {
            // REWARD: Revive the player
            if (btn) btn.classList.add('hidden');

            // Hide game over, show game UI
            document.getElementById('game-over-screen').classList.add('hidden');
            document.getElementById('ui').classList.remove('hidden');
            document.getElementById('game-world').classList.remove('hidden');
            document.getElementById('crane-system').classList.remove('hidden');

            // Grant extra life booster and resume
            this.activeBoosters.extraLife = true;
            this.updateBoostersHUD();
            this.showBoosterActivation('¡🧴 Pegamento Extra Activado!');

            // Reset balance and resume game
            this.gameActive = true;
            gameMain.balance = 0;
            const container = document.getElementById('base-container');
            container.style.transition = 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)';
            container.style.transform = 'translateX(-50%) rotate(0deg)';
            setTimeout(() => { container.style.transition = 'transform 0.2s ease-out'; }, 500);

            // Give a wide block to help them recover
            gameMain.lastWidth = gameMain.baseW;
            gameMain.speed = Math.max(0.02, gameMain.speed * 0.8);
            gameMain.spawnCake();

            this.startTimer();
            if (typeof gameAudio !== 'undefined') {
                gameAudio.startBgm();
                gameAudio.success('perfect');
            }
        }, () => {
            // Dismissed - re-enable button
            if (btn) { btn.disabled = false; btn.innerHTML = '🧴 Segunda Vida (Ver anuncio)'; }
            this._adReviveUsed = false;
        });
    },

    doubleCoinsWithAd() {
        if (this._adDoubleUsed) return;
        this._adDoubleUsed = true;

        const btn = document.getElementById('ad-double-coins-btn');
        if (btn) { btn.disabled = true; btn.innerHTML = '⏳ Cargando anuncio...'; }

        rewardedAds.showRewarded('double-coins', () => {
            // REWARD: Double the session coins
            const bonusCoins = this.sessionCoins;
            if (typeof shop !== 'undefined' && bonusCoins > 0) {
                shop.addCoins(bonusCoins);
            }
            this.sessionCoins *= 2;
            document.getElementById('final-coins').innerText = `+${this.sessionCoins} 🪙 (x2!)`;

            if (btn) {
                btn.disabled = true;
                btn.innerHTML = '✅ ¡Monedas duplicadas!';
                btn.style.opacity = '0.6';
            }
            if (typeof gameAudio !== 'undefined') gameAudio.success('perfect');
        }, () => {
            // Dismissed - re-enable
            if (btn) { btn.disabled = false; btn.innerHTML = '🪙 x2 Monedas (Ver anuncio)'; }
            this._adDoubleUsed = false;
        });
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
        const text = `🏗️🎂 Torre de tartas:\n${pisos} Pisos\n${score} Puntos del día\n\n¡Intenta superarme! 👉 https://cake-game.online/`;

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
