/**
 * main.js - Versión 1.1.2
 * Incluye: Viento suavizado, Nubes de tormenta y Sistema de apilado estable.
 */

const gameMain = {
    speed: 0.02, 
    angle: 0, 
    width: 160, 
    cameraY: 0, 
    balance: 0, 
    comboCount: 0, 
    isInitialized: false,
    
    // Variables de Viento y Suavizado
    windForce: 0,      // Fuerza actual aplicada
    targetWind: 0,     // Fuerza a la que queremos llegar
    nextWindChange: 0, // Tiempo para el próximo cambio

    start() {
        this.width = 160; 
        this.cameraY = 0; 
        this.balance = 0; 
        this.comboCount = 0;
        this.windForce = 0;
        this.targetWind = 0;
        ui.score = 0;
        
        document.getElementById('tower').innerHTML = "";
        document.getElementById('base-container').style.transform = `translateX(-50%) rotate(0deg)`;
        document.getElementById('game-world').style.transform = `translateY(0px)`;
        
        this.createClouds();
        this.spawnCake();
        
        if (!this.isInitialized) {
            this.setupControls();
            this.loop();
            this.isInitialized = true;
        }
    },

    setupControls() {
        const trigger = (e) => { 
            if(ui.gameActive) { 
                if(e.type === 'keydown' && e.code !== 'Space') return;
                e.preventDefault(); 
                this.drop(); 
            } 
        };
        window.addEventListener('mousedown', trigger);
        window.addEventListener('touchstart', trigger, {passive: false});
        window.addEventListener('keydown', trigger);
    },

    createClouds() {
        document.querySelectorAll('.cloud').forEach(n => n.remove());
        for (let i = 0; i < 5; i++) {
            const cloud = document.createElement('div');
            cloud.className = 'cloud';
            cloud.style.top = (Math.random() * 50) + '%';
            cloud.style.animationDelay = (Math.random() * 15) + 's';
            cloud.style.animationDuration = (Math.random() * 10 + 20) + 's';
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
            const currentScore = parseInt(ui.score);

            // LÓGICA DE VIENTO Y TORMENTA (Piso 10+)
            if (currentScore >= 10) {
                const windAlert = document.getElementById('wind-alert');
                if (windAlert) windAlert.style.display = 'block';

                // Cambiar nubes a modo tormenta
                document.querySelectorAll('.cloud').forEach(cloud => {
                    cloud.classList.add('stormy');
                });

                // Decidir nueva dirección de ráfaga cada 2.5 segundos
                if (Date.now() > this.nextWindChange) {
                    this.targetWind = (Math.random() - 0.5) * 50; 
                    this.nextWindChange = Date.now() + 2500;
                }

                // INTERPOLACIÓN: Suaviza el movimiento del viento (Lerp)
                this.windForce += (this.targetWind - this.windForce) * 0.05;

            } else {
                const windAlert = document.getElementById('wind-alert');
                if (windAlert) windAlert.style.display = 'none';
                
                document.querySelectorAll('.cloud').forEach(cloud => {
                    cloud.classList.remove('stormy');
                });
                this.windForce = 0;
                this.targetWind = 0;
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
        const targetY = (window.innerHeight - 80) - (ui.score * 40) + this.cameraY;

        const fall = () => {
            pY += 10;
            falling.style.top = pY + 'px';
            if (pY < targetY) requestAnimationFrame(fall);
            else this.land(falling, rect.left, color);
        };
        fall();
    },

    land(falling, x, color) {
        const offset = physics.calculateOffset(x, this.width, ui.score, this.balance);
        const absOffset = Math.abs(offset);
        const isPerfect = absOffset < 7;

        if (absOffset < this.width * 0.8) {
            falling.remove();
            
            if (typeof gameAudio !== 'undefined') gameAudio.success();

            if (isPerfect) {
                this.comboCount++;
                this.showText(x + (this.width / 2), `PERFECTO x${this.comboCount}`);
            } else {
                this.comboCount = 0;
            }

            this.createCrumbs(x + (this.width / 2), color);

            // BALANCEO DE LA TORRE
            this.balance += (offset / 12); 
            document.getElementById('base-container').style.transform = `translateX(-50%) rotate(${this.balance}deg)`;

            const stacked = document.createElement('div');
            stacked.className = "cake" + (isPerfect ? " perfect" : "");
            Object.assign(stacked.style, { 
                position: 'relative', width: this.width + 'px', 
                left: offset + 'px', margin: '0 auto', backgroundColor: color 
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

    createCrumbs(x, color) {
        for (let i = 0; i < 8; i++) {
            const crumb = document.createElement('div');
            crumb.className = "crumb";
            crumb.style.backgroundColor = color;
            crumb.style.left = x + 'px';
            crumb.style.top = (window.innerHeight - 100) + 'px';
            crumb.style.setProperty('--dx', `${(Math.random() - 0.5) * 100}px`);
            document.body.appendChild(crumb);
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
        if (typeof gameAudio !== 'undefined') gameAudio.gameOver();
        const base = document.getElementById('base-container');
        base.style.transition = "transform 1s ease-in";
        base.style.transform = `translateX(-50%) rotate(${this.balance > 0 ? 90 : -90}deg) translateY(800px)`;
        setTimeout(() => ui.showGameOver(ui.score), 1000);
    }
};
