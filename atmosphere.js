// ==========================================
//   ATMOSPHERIC ZONE PROGRESSION SYSTEM
//   Torre de Tartas
// ==========================================

const atmosphere = {
    currentZone: null,
    spawnTimers: [],

    zones: [
        { name: 'ground', floor: 0, label: '🌿 Tierra', bodyClass: 'zone-ground' },
        { name: 'lowsky', floor: 5, label: '☁️ Nubes', bodyClass: 'zone-lowsky' },
        { name: 'highsky', floor: 13, label: '✈️ Cielo Alto', bodyClass: 'zone-highsky' },
        { name: 'stratosphere', floor: 22, label: '🌙 Estratosfera', bodyClass: 'zone-stratosphere' },
        { name: 'space', floor: 32, label: '🌌 Espacio', bodyClass: 'zone-space' },
        { name: 'deepspace', floor: 48, label: '🪐 Espacio Prof.', bodyClass: 'zone-deepspace' },
        { name: 'galaxy', floor: 66, label: '🌌 Galaxia', bodyClass: 'zone-galaxy' },
    ],

    update(score) {
        // Find highest zone unlocked
        let targetZone = this.zones[0];
        for (const zone of this.zones) {
            if (score >= zone.floor) targetZone = zone;
        }

        this.updateBackground(score);
        if (typeof gameAudio !== 'undefined') gameAudio.updateBgmState(score);

        if (targetZone.name !== this.currentZone) {
            this.setZone(targetZone);
        }
    },

    // Smooth background scroll via background-position-y (div always covers full viewport).
    // Gradient: galaxy at 0% (top), earth at 100% (bottom).
    // posY=100% → shows earth (score 0). posY=0% → shows galaxy (max score).
    updateBackground(score) {
        const bg = document.getElementById('bg-scroll');
        if (!bg) return;
        const maxScore = 80;
        const progress = Math.min(score / maxScore, 1);
        const posY = (1 - progress) * 100;
        bg.style.backgroundPositionY = posY + '%';
    },

    setZone(zone) {
        // Only play fanfare if we are actively playing (not on first load when score is 0)
        if (this.currentZone && typeof gameAudio !== 'undefined') {
            gameAudio.zoneFanfare();
        }

        this.currentZone = zone.name;
        // Clear old elements and spawn new ones
        this.clearElements();
        this.spawnElements(zone.name);
        // Show zone label
        this.showZoneLabel(zone.label);
    },

    clearElements() {
        // Clear timers
        this.spawnTimers.forEach(t => clearTimeout(t));
        this.spawnTimers = [];

        // Remove all background elements
        document.querySelectorAll('.atm-element').forEach(el => el.remove());
    },

    spawnElements(zoneName) {
        switch (zoneName) {
            case 'ground':
                this._startSpawnLoop(() => this._spawnBird(), 3000, 1500);
                break;
            case 'lowsky':
                this._startSpawnLoop(() => this._spawnBird(), 4000, 2000);
                this._startSpawnLoop(() => this._spawnCloud(), 7000, 3000);
                break;
            case 'highsky':
                this._startSpawnLoop(() => this._spawnCloud(), 9000, 4000);
                this._startSpawnLoop(() => this._spawnPlane(), 10000, 3000);
                break;
            case 'stratosphere':
                this._spawnMoon();
                this._startSpawnLoop(() => this._spawnCloud(), 14000, 6000);
                break;
            case 'space':
                this._spawnStarfield(40);
                this._startSpawnLoop(() => this._spawnSatellite(), 8000, 2000);
                this._startSpawnLoop(() => this._spawnAsteroid(), 6000, 3000);
                break;
            case 'deepspace':
                this._spawnStarfield(70);
                this._spawnPlanet('saturn');
                this._startSpawnLoop(() => this._spawnAsteroid(), 4500, 2000);
                this._startSpawnLoop(() => this._spawnSatellite(), 9000, 4000);
                break;
            case 'galaxy':
                this._spawnStarfield(100);
                this._spawnGalaxyCore();
                this._spawnPlanet('jupiter');
                this._startSpawnLoop(() => this._spawnShootingStar(), 3000, 1200);
                this._startSpawnLoop(() => this._spawnAsteroid(), 3500, 1500);
                break;
        }
    },

    // ---- Spawn loop helper ----
    _startSpawnLoop(spawnFn, interval, initialDelay) {
        const first = setTimeout(() => {
            spawnFn();
            const loop = setInterval(() => {
                if (!ui.gameActive) { clearInterval(loop); return; }
                spawnFn();
            }, interval);
            this.spawnTimers.push(loop);
        }, initialDelay);
        this.spawnTimers.push(first);
    },

    // ---- Zone label ----
    showZoneLabel(text) {
        // Enlazar etiquetas antiguas de la pantalla y desvanecerlas suavemente
        const oldLabels = document.querySelectorAll('.zone-label');
        oldLabels.forEach(old => {
            old.classList.remove('show'); // Triggers the CSS transition down to 0 opacity
            setTimeout(() => old.remove(), 2500); // Remove from DOM after fade-out completes
        });

        // Generar la nueva marca de agua (fade-in)
        const el = document.createElement('div');
        el.className = 'zone-label';
        el.innerText = text;

        // Append BEFORE #game-world so it's clearly underneath
        const uiLayer = document.getElementById('ui');
        document.body.insertBefore(el, uiLayer);

        // Trigger reflow and show
        void el.offsetWidth;
        el.classList.add('show');
    },

    // ---- Element creators ----

    _spawnBird() {
        if (typeof gameAudio !== 'undefined') gameAudio.playBird();

        const bird = document.createElement('div');
        bird.className = 'atm-element bird';
        bird.style.top = (Math.random() * 40 + 5) + '%';
        bird.style.animationDuration = (Math.random() * 4 + 5) + 's';
        bird.style.animationDelay = '0s';
        bird.innerHTML = `<svg class="bird-svg" viewBox="0 0 70 35" xmlns="http://www.w3.org/2000/svg">
            <!-- ala izquierda -->
            <path d="M5,18 Q20,5 35,18" stroke="#333" stroke-width="2.5" fill="none" stroke-linecap="round"/>
            <!-- ala derecha -->
            <path d="M35,18 Q50,5 65,18" stroke="#333" stroke-width="2.5" fill="none" stroke-linecap="round"/>
            <!-- cuerpo pequeño -->
            <ellipse cx="35" cy="19" rx="4" ry="2.5" fill="#444"/>
        </svg>`;
        document.body.appendChild(bird);
        bird.addEventListener('animationend', () => bird.remove());
    },

    _spawnCloud() {
        if (typeof gameAudio !== 'undefined') gameAudio.playThunder();

        const cloud = document.createElement('div');
        cloud.className = 'atm-element cloud-atm';
        const size = Math.random() * 80 + 80;
        cloud.style.width = size + 'px';
        cloud.style.height = (size * 0.38) + 'px';
        cloud.style.top = (Math.random() * 45 + 5) + '%';
        cloud.style.animationDuration = (Math.random() * 15 + 18) + 's';
        document.body.appendChild(cloud);
        cloud.addEventListener('animationend', () => cloud.remove());
    },

    _spawnPlane() {
        if (typeof gameAudio !== 'undefined') gameAudio.playPlane();

        const plane = document.createElement('div');
        plane.className = 'atm-element plane';
        plane.style.top = (Math.random() * 30 + 10) + '%';
        plane.style.animationDuration = (Math.random() * 4 + 6) + 's';
        plane.innerHTML = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="airplane-svg">
            <path d="M20,50 Q20,45 80,45 L85,50 L80,55 Q20,55 20,50" fill="#3498db" />
            <path d="M50,48 L40,25 L55,25 L65,48 Z" fill="#2980b9" />
            <path d="M50,52 L40,75 L55,75 L65,52 Z" fill="#1c5980" />
            <path d="M25,46 L15,30 L25,30 L30,46 Z" fill="#2980b9" />
            <circle cx="70" cy="50" r="1.5" fill="white" />
            <circle cx="63" cy="50" r="1.5" fill="white" />
            <circle cx="56" cy="50" r="1.5" fill="white" />
        </svg>`;
        document.body.appendChild(plane);
        plane.addEventListener('animationend', () => plane.remove());
    },

    _spawnMoon() {
        if (document.querySelector('.moon')) return;
        const moon = document.createElement('div');
        moon.className = 'atm-element moon';
        document.body.appendChild(moon);
    },

    _spawnStarfield(count) {
        for (let i = 0; i < count; i++) {
            const star = document.createElement('div');
            star.className = 'atm-element star';
            star.style.left = (Math.random() * 100) + '%';
            star.style.top = (Math.random() * 100) + '%';
            star.style.animationDelay = (Math.random() * 3) + 's';
            star.style.animationDuration = (Math.random() * 2 + 2) + 's';
            const size = Math.random() * 3 + 1;
            star.style.width = size + 'px';
            star.style.height = size + 'px';
            document.body.appendChild(star);
        }
    },

    _spawnSatellite() {
        if (typeof gameAudio !== 'undefined') gameAudio.playSatellite();

        const sat = document.createElement('div');
        sat.className = 'atm-element satellite';
        sat.style.top = (Math.random() * 60 + 5) + '%';
        sat.style.animationDuration = (Math.random() * 8 + 8) + 's';
        sat.innerHTML = `<svg class="satellite-svg" viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg">
            <!-- cuerpo central -->
            <rect x="38" y="18" width="24" height="14" rx="3" fill="#bdc3c7" stroke="#7f8c8d" stroke-width="1.5"/>
            <!-- panel solar izquierdo -->
            <rect x="4" y="20" width="30" height="10" rx="2" fill="#2980b9" stroke="#1a5276" stroke-width="1"/>
            <!-- panel solar derecho -->
            <rect x="66" y="20" width="30" height="10" rx="2" fill="#2980b9" stroke="#1a5276" stroke-width="1"/>
            <!-- brazo izquierdo -->
            <line x1="34" y1="25" x2="38" y2="25" stroke="#7f8c8d" stroke-width="2"/>
            <!-- brazo derecho -->
            <line x1="62" y1="25" x2="66" y2="25" stroke="#7f8c8d" stroke-width="2"/>
            <!-- antena -->
            <line x1="50" y1="18" x2="50" y2="10" stroke="#95a5a6" stroke-width="1.5"/>
            <circle cx="50" cy="9" r="2" fill="#ecf0f1"/>
            <!-- detalle ventana -->
            <circle cx="50" cy="25" r="4" fill="#3498db" stroke="#1a5276" stroke-width="1"/>
        </svg>`;
        document.body.appendChild(sat);
        sat.addEventListener('animationend', () => sat.remove());
    },

    _spawnAsteroid() {
        if (typeof gameAudio !== 'undefined') gameAudio.playAsteroid();

        const asteroid = document.createElement('div');
        asteroid.className = 'atm-element asteroid';
        asteroid.style.top = (Math.random() * 70 + 5) + '%';
        asteroid.style.animationDuration = (Math.random() * 4 + 3) + 's';
        asteroid.innerHTML = `<svg class="asteroid-svg" viewBox="0 0 55 48" xmlns="http://www.w3.org/2000/svg">
            <!-- cuerpo irregular tipo roca -->
            <polygon points="27,2 45,8 53,22 48,38 34,46 16,44 4,32 6,14 18,4"
                fill="#7f6952" stroke="#5a4a39" stroke-width="1.5"/>
            <!-- cráteres -->
            <circle cx="22" cy="18" r="5" fill="#6b5846" stroke="#5a4a39" stroke-width="1"/>
            <circle cx="36" cy="30" r="4" fill="#6b5846" stroke="#5a4a39" stroke-width="1"/>
            <circle cx="18" cy="33" r="3" fill="#6b5846" stroke="#5a4a39" stroke-width="1"/>
            <!-- brillo sutil -->
            <ellipse cx="18" cy="14" rx="5" ry="3" fill="rgba(255,255,255,0.12)" transform="rotate(-20 18 14)"/>
        </svg>`;
        document.body.appendChild(asteroid);
        asteroid.addEventListener('animationend', () => asteroid.remove());
    },

    _spawnPlanet(type) {
        if (document.querySelector(`.planet-${type}`)) return;
        const planet = document.createElement('div');
        planet.className = `atm-element planet planet-${type}`;
        document.body.appendChild(planet);
    },

    _spawnGalaxyCore() {
        if (document.querySelector('.galaxy-core')) return;
        const galaxy = document.createElement('div');
        galaxy.className = 'atm-element galaxy-core';
        document.body.appendChild(galaxy);
    },

    _spawnShootingStar() {
        if (typeof gameAudio !== 'undefined') gameAudio.playShootingStar();

        const star = document.createElement('div');
        star.className = 'atm-element shooting-star';
        star.style.top = (Math.random() * 50 + 5) + '%';
        star.style.left = (Math.random() * 60 + 20) + '%';
        star.style.animationDuration = (Math.random() * 0.8 + 0.6) + 's';
        document.body.appendChild(star);
        setTimeout(() => star.remove(), 2000);
    },

    reset() {
        const bg = document.getElementById('bg-scroll');
        if (bg) {
            // Instant snap back to ground (no transition)
            bg.style.transition = 'none';
            bg.style.backgroundPositionY = '100%';
            // Re-enable smooth transition after snap
            setTimeout(() => { bg.style.transition = ''; }, 50);
        }

        this.clearElements();
        this.currentZone = null;
        this.update(0);
    }
};
