const gameMain = {
    speed: 0.02,
    angle: 0,
    width: 160,
    cameraY: 0, 
    isInitialized: false,

    start() {
        this.width = 160;
        this.angle = 0;
        this.cameraY = 0;
        ui.score = 0;
        document.getElementById('tower').innerHTML = "";
        document.getElementById('game-world').style.transform = `translateY(0px)`;
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
        window.addEventListener('touchstart', (e) => { 
            if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'BUTTON') e.preventDefault(); 
            dropAction(); 
        }, {passive: false});
        window.addEventListener('keydown', (e) => { if(e.code === 'Space') dropAction(); });
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
            position: 'fixed', left: rect.left + 'px', top: rect.top + 'px',
            width: currentWidth + 'px', backgroundColor: color, zIndex: '300'
        });
        document.body.appendChild(falling);

        let pY = rect.top;
        let vY = 0;
        // Calculamos el suelo dinámicamente según la altura de la torre
        const targetY = (window.innerHeight - 80) - (ui.score * 40) + this.cameraY;

        const fall = () => {
            vY += 0.8;
            pY += vY;
            falling.style.top = pY + 'px';
            if (pY < targetY) {
                requestAnimationFrame(fall);
            } else {
                this.land(falling, rect.left, currentWidth, color);
            }
        };
        requestAnimationFrame(fall);
    },

    land(falling, x, w, color) {
        const offset = physics.calculateOffset(x, w);
        const tolerance = w * 0.8; 

        if (Math.abs(offset) < tolerance) {
            falling.remove();
            const stacked = document.createElement('div');
            stacked.className = "cake";
            Object.assign(stacked.style, {
                position: 'relative', width: w + 'px', left: offset + 'px', 
                margin: '0 auto', backgroundColor: color, height: '40px'
            });
            document.getElementById('tower').appendChild(stacked);
            ui.score++;
            document.getElementById('score').innerText = ui.score;
            if (ui.score > 3) {
                this.cameraY = (ui.score - 3) * 40;
                document.getElementById('game-world').style.transform = `translateY(${this.cameraY}px)`;
            }
            this.speed += 0.001; 
            this.spawnCake();
        } else {
            this.gameOver(falling);
        }
    },

    gameOver(falling) {
        ui.gameActive = false;
        ui.saveScore(ui.score);
        
        // Animación de caída
        falling.style.transition = 'transform 0.8s ease-in, opacity 0.8s';
        falling.style.transform = 'translateY(100vh) rotate(45deg)';
        falling.style.opacity = '0';

        setTimeout(() => {
            document.getElementById('final-score').innerText = ui.score;
            document.getElementById('game-over-screen').classList.remove('hidden');
        }, 500);
    }
};
