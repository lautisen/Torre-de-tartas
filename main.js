const gameMain = {
    speed: 0.02,
    angle: 0,
    width: 160,
    cameraY: 0,
    isInitialized: false,

    init() {
        this.spawnCake();
        if (!this.isInitialized) {
            this.loop();
            window.addEventListener('click', () => { if(ui.gameActive) this.drop(); });
            this.isInitialized = true;
        }
    },

    spawnCake() {
        const container = document.getElementById('active-cake-container');
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
        cake.remove();

        const falling = document.createElement('div');
        falling.className = "cake f-1";
        Object.assign(falling.style, {
            position: 'fixed', left: rect.left + 'px', top: rect.top + 'px',
            width: currentWidth + 'px', zIndex: '1000'
        });
        document.body.appendChild(falling);

        let pY = rect.top;
        const targetY = window.innerHeight - 80 - (ui.score * 40) + this.cameraY;

        const fall = () => {
            pY += 8;
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
        
        if (Math.abs(offset) < this.width * 0.8) {
            falling.remove();
            const stacked = document.createElement('div');
            stacked.className = "cake f-1";
            Object.assign(stacked.style, {
                position: 'relative', width: this.width + 'px', left: offset + 'px', 
                margin: '0 auto', height: '40px'
            });
            document.getElementById('tower').appendChild(stacked);
            ui.score++;
            document.getElementById('score').innerText = ui.score;
            
            if (ui.score > 4) {
                this.cameraY = (ui.score - 4) * 40;
                document.getElementById('game-world').style.transform = `translateY(${this.cameraY}px)`;
            }
            this.width = Math.max(60, this.width - 5);
            this.spawnCake();
        } else {
            ui.showGameOver(ui.score);
        }
    }
};
