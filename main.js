

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
        const cake = document.querySelector('#active-cake-
