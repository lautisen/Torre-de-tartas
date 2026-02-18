const gameMain = {
    speed: 0.02, angle: 0, width: 160, cameraY: 0, isInitialized: false,

    start() {
        this.width = 160; ui.score = 0; this.cameraY = 0;
        document.getElementById('tower').innerHTML = "";
        this.spawnCake();
        if (!this.isInitialized) {
            this.loop();
            window.addEventListener('mousedown', () => { if(ui.gameActive) this.drop(); });
            window.addEventListener('touchstart', (e) => { if(ui.gameActive) { e.preventDefault(); this.drop(); } }, {passive: false});
            this.isInitialized = true;
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
        const currentWidth = this.width;
        const color = window.getComputedStyle(cake).backgroundColor;
        cake.remove();

        const falling = document.createElement('div');
        falling.className = "cake";
        Object.assign(falling.style, { position: 'fixed', left: rect.left + 'px', top: rect.top + 'px', width: currentWidth + 'px', backgroundColor: color, zIndex: '1000' });
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
            const stacked = document.createElement('div');
            stacked.className = "cake";
            Object.assign(stacked.style, { position: 'relative', width: this.width + 'px', left: offset + 'px', margin: '0 auto', backgroundColor: color });
            document.getElementById('tower').appendChild(stacked);
            ui.score++;
            document.getElementById('score').innerText = ui.score;
            this.impactEffect();
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

    impactEffect() {
        const base = document.getElementById('base-container');
        base.style.transform = `translateX(-50%) translateY(10px)`;
        setTimeout(() => { base.style.transform = `translateX(-50%) translateY(0)`; }, 100);
    }
};
