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

        if (targetZone.name !== this.currentZone) {
            this.setZone(targetZone);
        }
    },

    setZone(zone) {
        const body = document.body;

        // Remove all zone classes
        this.zones.forEach(z => body.classList.remove(z.bodyClass));

        // Add new zone class (triggers CSS gradient transition)
        body.classList.add(zone.bodyClass);

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
        const old = document.getElementById('zone-label');
        if (old) old.remove();
        const el = document.createElement('div');
        el.id = 'zone-label';
        el.innerText = text;
        document.body.appendChild(el);
        setTimeout(() => el.classList.add('show'), 50);
        setTimeout(() => {
            el.classList.remove('show');
            setTimeout(() => el.remove(), 600);
        }, 2500);
    },

    // ---- Element creators ----

    _spawnBird() {
        const bird = document.createElement('div');
        bird.className = 'atm-element bird';
        bird.style.top = (Math.random() * 40 + 5) + '%';
        bird.style.animationDuration = (Math.random() * 4 + 5) + 's';
        bird.style.animationDelay = '0s';
        document.body.appendChild(bird);
        setTimeout(() => bird.remove(), 10000);
    },

    _spawnCloud() {
        const cloud = document.createElement('div');
        cloud.className = 'atm-element cloud-atm';
        const size = Math.random() * 80 + 80;
        cloud.style.width = size + 'px';
        cloud.style.height = (size * 0.38) + 'px';
        cloud.style.top = (Math.random() * 45 + 5) + '%';
        cloud.style.animationDuration = (Math.random() * 15 + 18) + 's';
        document.body.appendChild(cloud);
        setTimeout(() => cloud.remove(), 35000);
    },

    _spawnPlane() {
        const plane = document.createElement('div');
        plane.className = 'atm-element plane';
        plane.style.top = (Math.random() * 30 + 10) + '%';
        plane.style.animationDuration = (Math.random() * 4 + 6) + 's';
        document.body.appendChild(plane);
        setTimeout(() => plane.remove(), 12000);
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
        const sat = document.createElement('div');
        sat.className = 'atm-element satellite';
        sat.innerHTML = '🛰️';
        sat.style.top = (Math.random() * 60 + 5) + '%';
        sat.style.animationDuration = (Math.random() * 8 + 8) + 's';
        document.body.appendChild(sat);
        setTimeout(() => sat.remove(), 18000);
    },

    _spawnAsteroid() {
        const asteroid = document.createElement('div');
        asteroid.className = 'atm-element asteroid';
        asteroid.innerHTML = '☄️';
        asteroid.style.top = (Math.random() * 70 + 5) + '%';
        asteroid.style.animationDuration = (Math.random() * 4 + 3) + 's';
        document.body.appendChild(asteroid);
        setTimeout(() => asteroid.remove(), 9000);
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
        const star = document.createElement('div');
        star.className = 'atm-element shooting-star';
        star.style.top = (Math.random() * 50 + 5) + '%';
        star.style.left = (Math.random() * 60 + 20) + '%';
        star.style.animationDuration = (Math.random() * 0.5 + 0.5) + 's';
        document.body.appendChild(star);
        setTimeout(() => star.remove(), 2000);
    },

    reset() {
        this.clearElements();
        this.currentZone = null;
        this.zones.forEach(z => document.body.classList.remove(z.bodyClass));
        document.body.classList.add('zone-ground');
        this.currentZone = 'ground';
        this.spawnElements('ground');
    }
};
