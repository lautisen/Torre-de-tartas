const gameMain = {
    speed: 0.03,
    angle: 0,
    width: 150,
    isInitialized: false,

    start() {
        ui.score = 0;
        this.width = 150;
        this.spawnCake();
        if (!this.isInitialized) {
            this.loop();
            this.setupControls();
            this.isInitialized = true;
        }
    },

    setupControls() {
        const dropAction = () => { if(ui.gameActive) this.drop(); };
        window.addEventListener('mousedown', dropAction);
        window.addEventListener('touchstart', (e) => { dropAction(); }, {passive: false});
    },

    spawnCake() {
        const container = document.getElementById('active-cake-container');
        container.style.width = this.width + "px";
        container.innerHTML = `<div class="cake" style="width:100%; background: #f06292;"></div>`;
    },

    loop() {
        if (ui.gameActive) {
            this.angle += this.speed;
            const oscillation = Math.sin(this.angle) * 40; 
            document.getElementById('crane').style.transform = `translateX(-50%) rotate(${oscillation}deg)`;
        }
        requestAnimationFrame(() => this.loop());
    },

    drop() {
        const cake = document.querySelector('#active-cake-container .cake');
        if (!cake) return;
        const rect = cake.getBoundingClientRect();
        cake.remove();

        const falling = document.createElement('div');
        falling.className = "cake";
        Object.assign(falling.style, {
            position: 'fixed', left: rect.left + 'px', top: rect.top + 'px',
            width: this.width + 'px', zIndex: '300', background: '#f06292'
        });
        document.body.appendChild(falling);

        let pY = rect.top;
        const targetY = window.innerHeight - 100 - (ui.score * 40);

        const fall = () => {
            pY += 10; // Velocidad de caída constante
            falling.style.top = pY + 'px';

            if (pY < targetY) {
                requestAnimationFrame(fall);
            } else {
                this.land(falling, rect.left);
            }
        };
        fall();
    },

    land(falling, x) {
        const offset = physics.calculateOffset(x, this.width);
        
        if (Math.abs(offset) < this.width) { // Si toca la base
            falling.remove();
            const stacked = document.createElement('div');
            stacked.className = "cake";
            Object.assign(stacked.style, {
                position: 'relative', width: this.width + 'px', left: offset + 'px', 
                margin: '0 auto', background: '#f06292', height: '40px'
            });
            document.getElementById('tower').appendChild(stacked);
            ui.score++;
            document.getElementById('score').innerText = ui.score;
            this.spawnCake();
        } else {
            ui.gameActive = false;
            document.getElementById('final-score').innerText = ui.score;
            document.getElementById('game-over-screen').classList.remove('hidden');
        }
    }
};
