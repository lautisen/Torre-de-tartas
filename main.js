const gameMain = {
    speed: 0.02, angle: 0, width: 160, cameraY: 0, balance: 0,
    comboCount: 0,
    isInitialized: false,

    start() {
        this.width = 160; ui.score = 0; this.cameraY = 0; this.balance = 0; this.comboCount = 0;
        document.getElementById('tower').innerHTML = "";
        document.getElementById('base-container').style.transform = `translateX(-50%) rotate(0deg)`;
        this.spawnCake();
        if (!this.isInitialized) {
            this.setupControls();
            this.loop();
            this.isInitialized = true;
        }
    },

    setupControls() {
        const trigger = (e) => { if(ui.gameActive) { e.preventDefault(); this.drop(); } };
        window.addEventListener('mousedown', trigger);
        window.addEventListener('touchstart', trigger, {passive: false});
        window.addEventListener('keydown', (e) => { if(e.code === 'Space') trigger(e); });
    },

    spawnCake() {
        const container = document.getElementById('active-cake-container');
        this.width = Math.max(60, this.width * 0.98);
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
        cake.remove();

        const falling = document.createElement('div');
        falling.className = "cake";
        Object.assign(falling.style, { position: 'fixed', left: rect.left + 'px', top: rect.top + 'px', width: this.width + 'px', backgroundColor: color, zIndex: '1000' });
        document.body.appendChild(falling);

        let pY = rect.top;
        const targetY = (window.innerHeight - 80) - (ui.score * 40) + this.cameraY;

        const fall = () => {
            pY += 9;
            falling.style.top = pY + 'px';
            if (pY < targetY) requestAnimationFrame(fall);
            else this.land(falling, rect.left, color);
        };
        fall();
    },

    land(falling, x, color) {
        const offset = physics.calculateOffset(x, this.width);
        if (Math.abs(offset) < this.width * 0.8) {
            falling.remove();
            
            // Lógica de Perfecto y Partículas
            const isPerfect = Math.abs(offset) < 10;
            if (isPerfect) { this.comboCount++; this.showText(x, `¡PERFECTO x${this.comboCount}!`); } 
            else { this.comboCount = 0; }
            
            this.createCrumbs(x + (this.width/2), color);

            this.balance += (offset / 18); 
            document.getElementById('base-container').style.transform = `translateX(-50%) rotate(${this.balance}deg)`;

            const stacked = document.createElement('div');
            stacked.className = "cake" + (isPerfect ? " perfect" : "");
            Object.assign(stacked.style, { position: 'relative', width: this.width + 'px', left: offset + 'px', margin: '0 auto', backgroundColor: color });
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
            ui.showGameOver(ui.score);
        }
    },

    createCrumbs(x, color) {
        for (let i = 0; i < 8; i++) {
            const crumb = document.createElement('div');
            crumb.className = "crumb";
            crumb.style.backgroundColor = color;
            crumb.style.left = x + 'px';
            crumb.style.top = (window.innerHeight - 100) + 'px';
            document.body.appendChild(crumb);
            // Animación simple de migas
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
        const base = document.getElementById('base-container');
        base.style.transition = "transform 1s ease-in";
        base.style.transform = `translateX(-50%) rotate(${this.balance > 0 ? 90 : -90}deg) translateY(600px)`;
        setTimeout(() => ui.showGameOver(ui.score), 800);
    }
};
