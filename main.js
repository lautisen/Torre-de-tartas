/**
 * main.js - Motor del Juego Pro
 */

const gameMain = {
    speed: 0.02,
    angle: 0,
    width: 160,
    cameraY: 0,
    balance: 0,
    comboCount: 0,
    isInitialized: false,
    
    // Variables de viento
    windForce: 0,
    nextWindChange: 0,

    start() {
        this.width = 160; 
        this.cameraY = 0; 
        this.balance = 0; 
        this.comboCount = 0;
        this.windForce = 0;
        ui.score = 0;
        
        document.getElementById('tower').innerHTML = "";
        document.getElementById('base-container').style.transform = `translateX(-50%) rotate(0deg)`;
        
        // Limpiar y crear nubes decorativas
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
        // Eliminar nubes viejas si existen
        document.querySelectorAll('.cloud').forEach(n => n.remove());
        
        for (let i = 0; i < 6; i++) {
            const cloud = document.createElement('div');
            cloud.className = 'cloud';
            cloud.style.top = (Math.random() * 70) + '%';
            cloud.style.animationDuration = (Math.random() * 15 + 15) + 's';
            cloud.style.animationDelay = (Math.random() * 10) + 's';
            // Escala aleatoria para variedad
            const scale = 0.5 + Math.random();
            cloud.style.transform = `scale(${scale})`;
            document.body.appendChild(cloud);
        }
    },

    spawnCake() {
        const container = document.getElementById('active-cake-container');
        // Reducción de ancho progresiva
        this.width = Math.max(60, this.width * 0.98);
        container.style.width = this.width + "px";
        container.innerHTML = `<div class="cake f-${Math.floor(Math.random()*3)+1}" style="width:100%"></div>`;
    },

    loop() {
        if (ui.gameActive) {
            // LÓGICA DE VIENTO (Dificultad Progresiva)
            if (ui.score >= 10) {
                const windAlert = document.getElementById('wind-alert');
                if (windAlert) windAlert.style.display = 'block';

                // Cambiar dirección/fuerza del viento cada 3 segundos
                if (Date.now() > this.nextWindChange) {
                    this.windForce = (Math.random() - 0.5) * 18; // Desvío aleatorio
                    this.nextWindChange = Date.now() + 3000;
                }
            } else {
                const windAlert = document.getElementById('wind-alert');
                if (windAlert) windAlert.style.display = 'none';
            }

            this.angle += this.speed;
            // Oscilación normal + la influencia del viento
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
            pY += 11; // Un poco más rápido para compensar el viento
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

            // Balanceo realista
            this.balance += (offset / 12); 
            document.getElementById('base-container').style.transform = `translateX(-50%) rotate(${this.balance}deg)`;

            const stacked = document.createElement('div');
            stacked.className = "cake" + (isPerfect ? " perfect" : "");
            Object.assign(stacked.style, { 
                position: 'relative', width: this.width + 'px', left: offset + 'px', 
                margin: '0 auto', backgroundColor: color 
            });
            document.getElementById('tower').appendChild(stacked);
            
            ui.score++;
            document.getElementById('score').innerText = ui.score;

            // Derrota por equilibrio
            if (Math.abs(this.balance) > 15) { this.gameOverFall(); return; }
            
            // Movimiento de cámara
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
            crumb.style.setProperty('--dx', `${(Math.random() - 0.5) * 120}px`);
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
