const gameMain = {
    speed: 0.02, angle: 0, width: 160, cameraY: 0, balance: 0, comboCount: 0,
    isInitialized: false, windForce: 0, nextWindChange: 0,

    start() {
        this.width = 160; this.cameraY = 0; this.balance = 0; this.comboCount = 0; this.windForce = 0;
        ui.score = 0;
        document.getElementById('tower').innerHTML = "";
        document.getElementById('base-container').style.transform = `translateX(0) rotate(0deg)`;
        document.getElementById('game-world').style.transform = `translateY(0)`;
        this.createClouds();
        this.spawnCake();
        if (!this.isInitialized) { this.setupControls(); this.loop(); this.isInitialized = true; }
    },

    setupControls() {
        const trigger = (e) => { 
            if(ui.gameActive) { 
                if(e.type === 'keydown' && e.code !== 'Space') return;
                e.preventDefault(); this.drop(); 
            } 
        };
        window.addEventListener('mousedown', trigger);
        window.addEventListener('touchstart', trigger, {passive: false});
        window.addEventListener('keydown', trigger);
    },

    createClouds() {
        document.querySelectorAll('.cloud').forEach(n => n.remove());
        for (let i = 0; i < 6; i++) {
            const cloud = document.createElement('div');
            cloud.className = 'cloud';
            cloud.style.top = (Math.random() * 60) + '%';
            cloud.style.animationDuration = (Math.random() * 15 + 20) + 's';
            document.body.appendChild(cloud);
        }
    },

    spawnCake() {
        const container = document.getElementById('active-cake-container');
        this.width = Math.max(60, this.width * 0.98);
        container.style.width = this.width + "px";
        container.innerHTML = `<div class="cake f-${Math.floor(Math.random()*3)+1}" style="width:100%"></div>`;
    },

    loop() {
        if (ui.gameActive) {
            // LÓGICA DE VIENTO
            if (ui.score >= 10) {
                document.getElementById('wind-alert').style.display = 'block';
                if (Date.now() > this.nextWindChange) {
                    this.windForce = (Math.random() - 0.5) * 40;
                    this.nextWindChange = Date.now() + 2500;
                }
            } else {
                document.getElementById('wind-alert').style.display = 'none';
                this.windForce = 0;
            }

            this.angle += this.speed;
            const oscillation = (Math.sin(this.angle) * 35) + this.windForce;
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
        Object.assign(falling.style, { 
            position: 'fixed', left: rect.left + 'px', top: rect.top + 'px', 
            width: this.width + 'px', backgroundColor: color, zIndex: '1000' 
        });
        document.body.appendChild(falling);

        let pY = rect.top;
        // Calculamos dónde debe frenar: Base - (Altura tartas ya puestas) + Cámara
        const targetY = (window.innerHeight - 80) - (ui.score * 40) + this.cameraY;

        const fall = () => {
            pY += 12;
            falling.style.top = pY + 'px';
            if (pY < targetY) requestAnimationFrame(fall);
            else this.land(falling, rect.left, color);
        };
        requestAnimationFrame(fall);
    },

    land(falling, x, color) {
        const offset = physics.calculateOffset(x, this.width, ui.score, this.balance);
        const absOffset = Math.abs(offset);
        const isPerfect = absOffset < 8;

        if (absOffset < this.width * 0.8) {
            falling.remove();
            if (typeof gameAudio !== 'undefined') gameAudio.success();

            this.balance += (offset / 12); 
            document.getElementById('base-container').style.transform = `rotate(${this.balance}deg)`;

            const stacked = document.createElement('div');
            stacked.className = "cake" + (isPerfect ? " perfect" : "");
            // IMPORTANTE: 'relative' para que el flexbox column-reverse lo apile arriba
            Object.assign(stacked.style, { 
                position: 'relative', width: this.width + 'px', 
                left: offset + 'px', backgroundColor: color 
            });
            document.getElementById('tower').appendChild(stacked);
            
            ui.score++;
            document.getElementById('score').innerText = ui.score;

            if (Math.abs(this.balance) > 15) { this.gameOverFall(); return; }
            
            if (ui.score > 4) {
                this.cameraY = (ui.score - 4) * 40;
                document.getElementById('game-world').style.transform = `translateY(${this.cameraY}px)`;
            }
            this.speed += 0.001;
            this.spawnCake();
        } else {
            this.gameOverFall();
        }
    },

    gameOverFall() {
        ui.gameActive = false;
        if (typeof gameAudio !== 'undefined') gameAudio.gameOver();
        const base = document.getElementById('base-container');
        base.style.transition = "transform 1s ease-in";
        base.style.transform = `rotate(${this.balance > 0 ? 90 : -90}deg) translateY(800px)`;
        setTimeout(() => ui.showGameOver(ui.score), 1000);
    }
};
