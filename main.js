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
        const lateralVelocity = Math.cos(this.angle) * this.speed * 300;
        const currentWidth = this.width;
        const color = window.getComputedStyle(cake).backgroundColor;
        cake.remove();

        const falling = document.createElement('div');
        falling.className = "cake";
        Object.assign(falling.style, {
            position: 'fixed', left: rect.left + 'px', top: rect.top + 'px',
            width: currentWidth + 'px', backgroundColor: color, zIndex: '300'
        });
        document.body.appendChild(falling);

        let pX = rect.left, pY = rect.top, vX = lateralVelocity, vY = 0;
        const targetY = window.innerHeight - (ui.score * 40) - 80;

        const fall = () => {
            vY += 0.7; pX += vX; pY += vY;
            falling.style.left = pX + 'px'; falling.style.top = pY + 'px';
            if (pY < targetY) requestAnimationFrame(fall);
            else this.land(falling, pX, currentWidth);
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
