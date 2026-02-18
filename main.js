/**
 * Marta's Heavy Cake - Pro 
 * Versión Final: Grúa Larga, Cámara Infinita y Caída Estable
 */

const gameMain = {
    speed: 0.02,
    angle: 0,
    balance: 0,
    width: 160,
    cameraY: 0, // Rastreador del desplazamiento vertical
    isInitialized: false,

    start() {
        this.width = 160;
        this.balance = 0;
        this.angle = 0;
        this.cameraY = 0;
        
        // Reset visual del mundo
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
            // Evita comportamientos extraños en móviles
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
        // Reducción gradual del 2% por nivel
        this.width = Math.max(50, this.width * 0.98); 
        
        container.style.width = this.width + "px";
        container.innerHTML = `<div class="cake f-${Math.floor(Math.random()*3)+1}" style="width:100%"></div>`;
    },

    loop() {
        if (ui.gameActive) {
            this.angle += this.speed;
            // Amplitud de 35 grados (puedes subirlo a 45 si quieres más reto)
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

        // Crear la tarta que cae
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
        
        // PUNTO DE ATERRIZAJE CRÍTICO:
        // Se calcula restando la altura de la torre acumulada y compensando la cámara.
        const targetY = (window.innerHeight - 80) - (ui.score * 40) + this.cameraY;

        const fall = () => {
            vY += gravity;
            pY += vY;
            falling.style.top = pY + 'px';

            if (pY < targetY) {
                requestAnimationFrame(fall);
            } else {
                // Caída vertical pura (pX no varía)
                this.land(falling, pX, currentWidth, color);
            }
        };
        requestAnimationFrame(fall);
    },

    land(falling, x, w, color) {
        // Obtenemos el offset real respecto al centro de la torre
        const offset = physics.calculateOffset(x, w, ui.score, this.balance);
        
        // Margen de error permisivo (70% del ancho)
        const tolerance = w * 0.7;

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
            
            // Inclinación de la torre según el error de puntería
            this.balance += (offset / 45); 

            // GESTIÓN DE CÁMARA:
            // Sube el mundo del juego para que la torre no se salga por arriba
            if (ui.score > 3) {
                this.cameraY = (ui.score - 3) * 40;
                document.getElementById('game-world').style.transform = `translateY(${this.cameraY}px)`;
            }
            
            // Efecto de impacto visual en la base
            const base = document.getElementById('base-container');
            if (base) {
                base.style.transform = `translateX(-50%) rotate(${this.balance}deg) translateY(5px)`;
                setTimeout(() => {
                    base.style.transform = `translateX(-50%) rotate(${this.balance}deg)`;
                }, 100);
            }

            this.speed += 0.001; // Dificultad progresiva
            this.spawnCake();
        } else {
            // GAME OVER
            ui.gameActive = false;
            ui.saveScore(ui.score);
            
            // Animación de caída al vacío
            falling.style.transition = 'transform 0.6s ease-in';
            falling.style.transform = 'translateY(100vh)';
            
            setTimeout(() => {
                alert("¡GAME OVER!\nPisos cocinados: " + ui.score);
                location.reload();
            }, 600);
        }
    }
};
