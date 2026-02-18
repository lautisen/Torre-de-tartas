const gameMain = {
    speed: 0.02,
    angle: 0,
    balance: 0,
    width: 160,
    cameraY: 0, 
    isInitialized: false,

    start() {
        this.width = 160;
        this.balance = 0;
        this.angle = 0;
        this.cameraY = 0;
        ui.score = 0; // Resetear puntuación en ui
        
        const tower = document.getElementById('tower');
        if (tower) tower.innerHTML = ""; // Limpiar torre visualmente
        
        const world = document.getElementById('game-world');
        if (world) world.style.transform = `translateY(0px)`;
        
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
            if (e.target.tagName !== 'INPUT') e.preventDefault(); 
            dropAction(); 
        }, {passive: false});

        window.addEventListener('keydown', (e) => { 
            if(e.code === 'Space') { 
                e.preventDefault(); 
                dropAction(); 
            } 
        });
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

        let pX = rect.left; 
        let pY = rect.top;
        let vY = 0;
        const gravity = 0.8;
        
        const targetY = (window.innerHeight - 80) - (ui.score * 40) + this.cameraY;

        const fall = () => {
            vY += gravity;
            pY += vY;
            falling.style.top = pY + 'px';

            if (pY < targetY) {
                requestAnimationFrame(fall);
            } else {
                this.land(falling, pX, currentWidth, color);
            }
        };
        requestAnimationFrame(fall);
    },

    land(falling, x, w, color) {
        // LLAMADA CORREGIDA: Ahora solo pasamos x y w como pide tu physics.js
        const offset = physics.calculateOffset(x, w);
        
        // Tolerancia: si el centro de la tarta está a más de 70px del centro, cae.
        const tolerance = 70; 

        if (Math.abs(offset) < tolerance) {
            falling.remove();
            
            const stacked = document.createElement('div');
            stacked.className = "cake";
            Object.assign(stacked.style, {
                position: 'relative', 
                width: w + 'px', 
                left: offset + 'px', 
                margin: '0 auto', 
                backgroundColor: color, 
                height: '40px', 
                border: '3px solid #6d4c41', 
                borderRadius: '6px'
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
            ui.gameActive = false;
            ui.saveScore(ui.score);
            
            falling.style.transition = 'transform 0.6s ease-in';
            falling.style.transform = 'translateY(100vh)';
            
            setTimeout(() => {
                alert("¡GAME OVER!\nPisos: " + ui.score);
                location.reload();
            }, 600);
        }
    }
};
