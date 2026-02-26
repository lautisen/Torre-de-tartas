const gameMain = {
    speed: 0.02, angle: 0, width: 160, cameraY: 0, balance: 0, comboCount: 0, isInitialized: false,

    start() {
        this.width = 160; this.cameraY = 0; this.balance = 0; this.comboCount = 0; this.speed = 0.02; ui.score = 0;
        this.lastOffset = 0;
        this.lastWidth = 200; // Ancho de la base
        document.getElementById('tower').innerHTML = "";

        const baseContainer = document.getElementById('base-container');
        baseContainer.style.transition = 'none'; // reset transition for instant snap back
        baseContainer.style.transform = `translateX(-50%) rotate(0deg)`;

        const gameWorld = document.getElementById('game-world');
        const cameraSystem = document.getElementById('camera-system');
        cameraSystem.style.transition = 'none'; // reset transition for instant snap back
        cameraSystem.style.transform = `translateY(0px)`;

        // Remove any old falling cakes that act as orphans
        document.querySelectorAll('body > .cake').forEach(c => c.remove());

        // Remove old crumbs
        document.querySelectorAll('body > .crumb').forEach(c => c.remove());

        this.spawnCake();
        atmosphere.reset();
        if (!this.isInitialized) {
            this.setupControls();
            this.loop();
            this.isInitialized = true;
        }

        // Small timeout to re-enable transitions after the native snap back occurs
        setTimeout(() => {
            baseContainer.style.transition = 'transform 0.2s ease-out';
            cameraSystem.style.transition = 'transform 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)';
        }, 50);
    },

    setupControls() {
        const trigger = (e) => {
            if (ui.gameActive) {
                if (e.type === 'keydown' && e.code !== 'Space') return;
                e.preventDefault();
                this.drop();
            }
        };
        window.addEventListener('mousedown', trigger);
        window.addEventListener('touchstart', trigger, { passive: false });
        window.addEventListener('keydown', trigger);
    },

    spawnCake() {
        const container = document.getElementById('active-cake-container');
        this.width = Math.max(60, this.width * 0.98);
        container.style.width = this.width + "px";
        container.innerHTML = `<div class="cake f-${Math.floor(Math.random() * 3) + 1}" style="width:100%"></div>`;
    },

    loop() {
        if (ui.gameActive) {
            this.angle += this.speed;
            const oscillation = Math.sin(this.angle) * 35;
            document.getElementById('crane').style.transform = `translateX(-50%) rotate(${oscillation}deg)`;
        }
        requestAnimationFrame(() => this.loop());
    },

    drop() {
        const cake = document.querySelector('#active-cake-container .cake');
        if (!cake) return;
        const rect = cake.getBoundingClientRect();
        const color = window.getComputedStyle(cake).backgroundColor;
        cake.remove();

        const falling = document.createElement('div');
        falling.className = "cake";
        Object.assign(falling.style, { position: 'fixed', left: rect.left + 'px', top: rect.top + 'px', width: this.width + 'px', backgroundColor: color, zIndex: '1000' });
        document.body.appendChild(falling);

        let pY = rect.top;
        const targetY = (window.innerHeight - 80) - (ui.score * 40) + this.cameraY;

        const fall = () => {
            pY += 10;
            falling.style.top = pY + 'px';
            if (pY < targetY) requestAnimationFrame(fall);
            else this.land(falling, rect.left, color);
        };
        fall();
    },

    land(falling, x, color) {
        const offset = physics.calculateOffset(x, this.width, ui.score, this.balance);
        const relativeToPrevious = ui.score === 0 ? offset : (offset - this.lastOffset);
        const absRelative = Math.abs(relativeToPrevious);

        // Umbral de colisión: la suma de los medios anchos (margen del 10% para que se vea que tocan)
        const overlapThreshold = ((this.width + this.lastWidth) / 2) * 0.9;
        const isPerfect = absRelative < 10;

        if (absRelative < overlapThreshold) {
            this.lastOffset = offset;
            this.lastWidth = this.width;
            falling.remove();

            // SONIDO DE ÉXITO
            gameAudio.success();

            // SQUASH & SHAKE JUICE 
            const gameWorld = document.getElementById('game-world');
            gameWorld.classList.remove('shake-perfect', 'shake-heavy');
            void gameWorld.offsetWidth; // trigger reflow to reset animation

            if (isPerfect) {
                this.comboCount++;
                this.showText(x + (this.width / 2), `PERFECTO x${this.comboCount}`);
                gameWorld.classList.add('shake-perfect');
            } else {
                this.comboCount = 0;
                gameWorld.classList.add('shake-heavy');
            }

            this.createCrumbs(x + (this.width / 2), color);

            // BALANCEO REALISTA
            this.balance += (offset / 12);
            document.getElementById('base-container').style.transform = `translateX(-50%) rotate(${this.balance}deg)`;

            const stacked = document.createElement('div');
            stacked.className = "cake squash" + (isPerfect ? " perfect" : "");
            Object.assign(stacked.style, { position: 'relative', width: this.width + 'px', left: offset + 'px', margin: '0 auto', backgroundColor: color });
            document.getElementById('tower').appendChild(stacked);

            ui.score++;
            document.getElementById('score').innerText = ui.score;
            atmosphere.update(ui.score);

            if (Math.abs(this.balance) > 15) { this.gameOverFall(); return; }
            if (ui.score > 4) {
                const cameraSystem = document.getElementById('camera-system');
                this.cameraY = (ui.score - 4) * 40;
                cameraSystem.style.transform = `translateY(${this.cameraY}px)`;
            }
            this.speed += 0.001;
            this.spawnCake();

            // Clear squash class after animation
            setTimeout(() => stacked.classList.remove('squash'), 300);
        } else {
            this.gameOverFall();
        }
    },

    createCrumbs(x, color) {
        for (let i = 0; i < 8; i++) {
            const crumb = document.createElement('div');
            crumb.className = "crumb";
            crumb.style.backgroundColor = color;
            crumb.style.left = x + 'px';
            crumb.style.top = (window.innerHeight - 100) + 'px';
            crumb.style.setProperty('--dx', `${(Math.random() - 0.5) * 100}px`);
            document.body.appendChild(crumb);
            setTimeout(() => crumb.remove(), 1000);
        }
    },

    showText(x, txt) {
        const el = document.createElement('div');
        el.className = "perfect-text";
        el.innerText = txt;
        el.style.left = x + 'px';
        el.style.top = '50%';
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 800);
    },

    gameOverFall() {
        ui.gameActive = false;
        // SONIDO DERROTA
        gameAudio.gameOver();
        const base = document.getElementById('base-container');
        base.style.transition = "transform 1s ease-in";
        base.style.transform = `translateX(-50%) rotate(${this.balance > 0 ? 90 : -90}deg) translateY(800px)`;
        setTimeout(() => ui.showGameOver(ui.score), 1000);
    }
};
