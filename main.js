const gameMain = {
    speed: 0.02,
    angle: 0,
    width: 160,
    cameraY: 0,
    balance: 0,
    isInitialized: false,

    start() {
        this.width = 160;
        ui.score = 0;
        this.cameraY = 0;
        this.balance = 0;
        
        document.getElementById('tower').innerHTML = "";
        const base = document.getElementById('base-container');
        if (base) {
            base.style.transform = `translateX(-50%) rotate(0deg)`;
            base.style.transition = "transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
        }
        
        this.spawnCake();
        if (!this.isInitialized) {
            this.setupControls();
            this.loop();
            this.isInitialized = true;
        }
    },

    setupControls() {
        // Función única de disparo
        const triggerDrop = (e) => {
            if (ui.gameActive) {
                // Evitamos que el espacio haga scroll o que el tap haga zoom
                if (e) e.preventDefault(); 
                this.drop();
            }
        };

        // 1. Mouse para PC
        window.addEventListener('mousedown', triggerDrop);

        // 2. Touch para Móviles
        window.addEventListener('touchstart', triggerDrop, { passive: false });

        // 3. Teclado (Espacio) para PC
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                triggerDrop(e);
            }
        });
    },

    spawnCake() {
        const container = document.getElementById('active-cake-container');
        this.width = Math.max(60, this.width * 0.98);
        if (container) {
            container.style.width = this.width + "px";
            container.innerHTML = `<div class="cake f-${Math.floor(Math.random()*3)+1}" style="width:100%"></div>`;
        }
    },

    loop() {
        if (ui.gameActive) {
            this.angle += this.speed;
            const oscillation = Math.sin(this.angle) * 35;
            const crane = document.getElementById('crane');
            if (crane) {
                crane.style.transform = `translateX(-50%) rotate(${oscillation}deg)`;
            }
        }
        requestAnimationFrame(() => this.loop());
    },

    drop() {
        const cake = document.querySelector('#active-cake-container .cake');
        if (!cake) return;
        
        const rect = cake.getBoundingClientRect();
        const currentWidth = this.width;
        const color = window.getComputedStyle(cake).backgroundColor;
        cake.remove();

        const falling = document.createElement('div');
        falling.className = "cake";
        Object.assign(falling.style, {
            position: 'fixed',
            left: rect.left + 'px',
            top: rect.top + 'px',
            width: currentWidth + 'px',
            backgroundColor: color,
            zIndex: '1000'
        });
        document.body.appendChild(falling);

        let pY = rect.top;
        const targetY = (window.innerHeight - 80) - (ui.score * 40) + this.cameraY;

        const fall = () => {
            pY += 9;
            falling.style.top = pY + 'px';
            if (pY < targetY) {
                requestAnimationFrame(fall);
            } else {
                this.land(falling, rect.left, color);
            }
        };
        requestAnimationFrame(fall);
    },

    land(falling, x, color) {
        const offset = physics.calculateOffset(x, this.width);
        
        if (Math.abs(offset) < this.width * 0.8) {
            falling.remove();

            // Aplicamos la inclinación según donde caiga
            this.balance += (offset / 18); 
            const base = document.getElementById('base-container');
            if (base) base.style.transform = `translateX(-50%) rotate(${this.balance}deg)`;

            const stacked = document.createElement('div');
            stacked.className = "cake";
            Object.assign(stacked.style, {
                position: 'relative',
                width: this.width + 'px',
                left: offset + 'px',
                margin: '0 auto',
                backgroundColor: color
            });
            document.getElementById('tower').appendChild(stacked);
            
            ui.score++;
            const scoreDisp = document.getElementById('score');
            if (scoreDisp) scoreDisp.innerText = ui.score;

            // Si la torre se inclina más de 15 grados, se cae
            if (Math.abs(this.balance) > 15) {
                this.gameOverFall();
                return;
            }

            if (ui.score > 4) {
                this.cameraY = (ui.score - 4) * 40;
                const world = document.getElementById('game-world');
                if (world) world.style.transform = `translateY(${this.cameraY}px)`;
            }
            this.speed += 0.001;
            this.spawnCake();
        } else {
            ui.showGameOver(ui.score);
        }
    },

    gameOverFall() {
        ui.gameActive = false;
        const base = document.getElementById('base-container');
        if (base) {
            base.style.transition = "transform 1s ease-in";
            base.style.transform = `translateX(-50%) rotate(${this.balance > 0 ? 90 : -90}deg) translateY(600px)`;
        }
        setTimeout(() => {
            ui.showGameOver(ui.score);
        }, 800);
    }
};
