const gameMain = {
    speed: 0.02,
    angle: 0,
    balance: 0,
    width: 160,
    isInitialized: false,

    start() {
        this.score = 0;
        this.balance = 0;
        this.width = 160;
        this.spawnCake();
        if (!this.isInitialized) {
            this.loop();
            this.setupControls();
            this.isInitialized = true;
        }
    },

    setupControls() {
        const dropAction = (e) => { if(ui.gameActive) this.drop(); };
        window.addEventListener('mousedown', dropAction);
        window.addEventListener('keydown', (e) => { if(e.code === 'Space') { e.preventDefault(); dropAction(); } });
        window.addEventListener('touchstart', (e) => { e.preventDefault(); dropAction(); }, {passive: false});
    },

    spawnCake() {
        const container = document.getElementById('active-cake-container');
        this.width = Math.max(50, this.width * 0.98);
        container.style.width = this.width + "px";
        container.innerHTML = `<div class="cake f-${Math.floor(Math.random()*3)+1}" style="width:100%"></div>`;
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
        const currentWidth = this.width;
        cake.remove();

        const falling = document.createElement('div');
        falling.className = "cake";
        Object.assign(falling.style, {
            position: 'fixed', 
            left: rect.left + 'px', 
            top: rect.top + 'px',
            width: currentWidth + 'px', 
            backgroundColor: color, 
            zIndex: '300', 
            border: '3px solid #6d4c41', 
            borderRadius: '6px'
        });
        document.body.appendChild(falling);

        let pX = rect.left; // La posición X se queda fija aquí
        let pY = rect.top;
        let vY = 0;
        const gravity = 0.8;
        
        // Calculamos el destino ajustado a la cámara
        const targetY = (window.innerHeight - 80) - (ui.score * 40) + this.cameraY;

        const fall = () => {
            vY += gravity;
            pY += vY;
            
            // Solo actualizamos la posición vertical (Top)
            falling.style.top = pY + 'px';

            if (pY < targetY) {
                requestAnimationFrame(fall);
            } else {
                // Al aterrizar, enviamos el pX original (caída recta)
                this.land(falling, pX, currentWidth, color);
            }
        };
        fall();
    },

    land(falling, x, w) {
        const offset = physics.calculateOffset(x, w, ui.score, this.balance);
        if (Math.abs(offset) < w / 2 + 10) {
            falling.remove();
            const stacked = document.createElement('div');
            stacked.className = "cake";
            Object.assign(stacked.style, {
                position: 'relative', width: w + 'px', left: offset + 'px',
                margin: '0 auto', backgroundColor: falling.style.backgroundColor
            });
            document.getElementById('tower').appendChild(stacked);
            ui.score++;
            document.getElementById('score').innerText = ui.score;
            this.balance += (offset / 30);
            document.getElementById('game-world').style.transform = `translateY(${ui.score > 3 ? (ui.score-3)*40 : 0}px)`;
            this.speed += 0.001;
            this.spawnCake();
        } else {
            ui.gameActive = false;
            ui.saveScore(ui.score);
            alert("¡Game Over! Pisos: " + ui.score);
            location.reload();
        }
    }
};
