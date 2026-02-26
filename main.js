const gameMain = {
    speed: 0.02, angle: 0, width: 160, cameraY: 0, balance: 0, comboCount: 0, isInitialized: false,

    start() {
        this.width = 160; this.cameraY = 0; this.balance = 0; this.comboCount = 0; this.speed = 0.02; ui.score = 0; ui.floors = 0;
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
        container.innerHTML = `<div class="cake f-${Math.floor(Math.random() * 5) + 1}" style="width:100%"></div>`;
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
        const targetY = (window.innerHeight - 80) - (ui.floors * 40) + this.cameraY;

        const fall = () => {
            pY += 10;
            falling.style.top = pY + 'px';
            if (pY < targetY) requestAnimationFrame(fall);
            else this.land(falling, rect.left, color);
        };
        fall();
    },

    createSparks(x) {
        for (let i = 0; i < 6; i++) {
            const spark = document.createElement('div');
            spark.className = "spark";
            // Posición base (centro del bloque)
            spark.style.left = x + 'px';
            // Arriba del último bloque apilado
            spark.style.top = (window.innerHeight - 80) - (ui.score * 40) + this.cameraY + 'px';
            // Trayectoria aleatoria de explosión hacia arriba y los lados
            spark.style.setProperty('--dx', (Math.random() * 100 - 50) + 'px');
            spark.style.setProperty('--dy', (Math.random() * -60 - 20) + 'px');
            document.getElementById('game-world').appendChild(spark);
            setTimeout(() => spark.remove(), 600);
        }
    },

    land(falling, x, color) {
        const offset = physics.calculateOffset(x, this.width, ui.floors, this.balance);
        const relativeToPrevious = ui.floors === 0 ? offset : (offset - this.lastOffset);
        const absRelative = Math.abs(relativeToPrevious);

        // Umbral de colisión: la suma de los medios anchos (margen del 10% para que se vea que tocan)
        const overlapThreshold = ((this.width + this.lastWidth) / 2) * 0.9;
        const isPerfect = absRelative < 10;

        if (absRelative < overlapThreshold) {
            this.lastOffset = offset;
            this.lastWidth = this.width;
            falling.remove();

            // SONIDO DE ÉXITO basado en la precisión
            let dropQuality = 'bad';
            if (isPerfect) dropQuality = 'perfect';
            else if (absRelative < overlapThreshold * 0.4) dropQuality = 'good';

            gameAudio.success(dropQuality);

            // SQUASH & SHAKE JUICE 
            const gameWorld = document.getElementById('game-world');
            gameWorld.classList.remove('shake-perfect', 'shake-heavy');
            void gameWorld.offsetWidth; // trigger reflow to reset animation

            if (isPerfect) {
                // Sparks effect instead of flash
                this.createSparks(x + (this.width / 2));

                this.comboCount++;
                this.showText(x + (this.width / 2), `PERFECTO x${this.comboCount}`);
                gameWorld.classList.add('shake-perfect');
            } else {
                this.comboCount = 0;
                gameWorld.classList.add('shake-heavy');
            }

            this.createCrumbs(x + (this.width / 2), color);

            // BALANCEO:
            // Si es perfecto, ¡recompensa! Reducimos el balance (la torre recupera estabilidad hacia el centro)
            // Si no, el balance aumenta según el offset (peor encastre -> más inclinación y riesgo)
            const balanceDivisor = 12 + ui.floors * 0.5; // floors 0→÷12, floors 20→÷22, floors 50→÷37

            if (isPerfect) {
                // Reduce la inclinación actual un 20% (multiplica por 0.8) o en un par de grados para premiar
                this.balance = this.balance * 0.7; // La torre se endereza bastante (gana estabilidad)
            } else {
                this.balance += (offset / balanceDivisor);
            }

            const baseContainer = document.getElementById('base-container');
            baseContainer.style.transform = `translateX(-50%) rotate(${this.balance}deg)`;

            const stacked = document.createElement('div');
            stacked.className = "cake squash" + (isPerfect ? " perfect" : "");
            Object.assign(stacked.style, { position: 'relative', width: this.width + 'px', left: offset + 'px', margin: '0 auto', backgroundColor: color });
            document.getElementById('tower').appendChild(stacked);

            ui.floors++;
            const multiplier = 1 + this.comboCount;
            // Base score per block is 10, times combo multiplier
            ui.score += (10 * multiplier);

            const scoreEl = document.getElementById('score');
            const floorsEl = document.getElementById('floors-display');
            const badge = document.getElementById('multiplier-badge');

            scoreEl.innerText = ui.score;
            floorsEl.innerText = ui.floors;

            if (this.comboCount > 0) {
                badge.innerText = `x${multiplier} 🔥`;
                badge.style.opacity = '1';
                badge.style.transform = 'scale(1.1)';
                setTimeout(() => badge.style.transform = 'scale(1)', 150);
            } else {
                badge.innerText = `x1 🔥`;
                badge.style.opacity = '0.3';
            }

            // Animación de rebote (pop) en el HUD
            scoreEl.classList.remove('score-pop');
            floorsEl.classList.remove('score-pop');
            void scoreEl.offsetWidth; // trigger reflow
            scoreEl.classList.add('score-pop');
            floorsEl.classList.add('score-pop');

            atmosphere.update(ui.floors);

            if (Math.abs(this.balance) > 15) { this.gameOverFall(); return; }

            // Si la torre se ha salido completamente de la pantalla, game over
            const baseRect = baseContainer.getBoundingClientRect();
            if (baseRect.right < -60 || baseRect.left > window.innerWidth + 60) {
                this.gameOverFall();
                return;
            }
            if (ui.floors > 4) {
                const cameraSystem = document.getElementById('camera-system');
                this.cameraY = (ui.floors - 4) * 40;
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
        setTimeout(() => ui.showGameOver(ui.floors), 1000);
    }
};
