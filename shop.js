const shop = {
    coins: 0,
    currentTheme: 'classic',
    inventory: ['classic'], // themes user owns

    items: [
        { id: 'classic', name: 'Pastelería', price: 0, description: 'Estilo clásico con tartas y glaseado.', icon: '🎂' },
        { id: 'cyberpunk', name: 'Neon Cyberpunk', price: 150, description: 'Cristal, neón y chispas eléctricas.', icon: '🌃' },
        { id: 'construction', name: 'Constructora', price: 150, description: 'Cemento, ladrillo y acero pesado.', icon: '🏗️' },
        { id: 'nature', name: 'Zen Botánico', price: 200, description: 'Madera, musgo y mucha paz verde.', icon: '🌿' },
        { id: 'retro', name: 'Arcade 8-Bit', price: 250, description: 'Bloques pixelados colores sólidos.', icon: '🕹️' }
    ],

    boosters: [
        { id: 'slowMotion', name: 'Cuerda Lenta', price: 20, description: 'La grúa reduce su velocidad base al hacer un Perfecto.', icon: '🐢', count: 0 },
        { id: 'magnet', name: 'Base Magnética', price: 30, description: 'Mejora ligeramente la tracción de los bloques para que no resbalen (Próximamente).', icon: '🧲', count: 0 },
        { id: 'extraLife', name: 'Pegamento Extra', price: 50, description: 'Previene 1 caída inminente por partida (Próximamente).', icon: '🧴', count: 0 }
    ],

    currentTab: 'skins', // 'skins' or 'boosters'

    init() {
        this.loadData();
        this.applyTheme(this.currentTheme);

        const shopBtn = document.getElementById('shop-btn');
        if (shopBtn) shopBtn.onclick = () => this.openShop();

        const closeBtn = document.getElementById('close-shop-btn');
        if (closeBtn) closeBtn.onclick = () => this.closeShop();
    },

    loadData(username = null) {
        // If a username is provided, we use a distinct key. Otherwise we default to a local anonymous key.
        this.userKey = username ? `_${username.toLowerCase()}` : '';

        this.coins = parseInt(localStorage.getItem(`tdt_coins${this.userKey}`) || '0', 10);
        this.currentTheme = localStorage.getItem(`tdt_theme${this.userKey}`) || 'classic';
        const inv = localStorage.getItem(`tdt_inventory${this.userKey}`);
        if (inv) {
            try { this.inventory = JSON.parse(inv); }
            catch (e) { this.inventory = ['classic']; }
        } else {
            this.inventory = ['classic'];
        }

        const boost = localStorage.getItem(`tdt_boosters${this.userKey}`);
        if (boost) {
            try {
                const savedBoosters = JSON.parse(boost);
                this.boosters.forEach(b => {
                    if (savedBoosters[b.id] !== undefined) b.count = savedBoosters[b.id];
                });
            } catch (e) { console.error("Error loading boosters", e); }
        }

        // After loading a different user's data, we must instantly apply their theme and update top bar
        this.applyTheme(this.currentTheme);
        this.updateUI();
    },

    saveData() {
        const key = this.userKey || '';
        localStorage.setItem(`tdt_coins${key}`, this.coins);
        localStorage.setItem(`tdt_theme${key}`, this.currentTheme);
        localStorage.setItem(`tdt_inventory${key}`, JSON.stringify(this.inventory));

        const boostData = {};
        this.boosters.forEach(b => boostData[b.id] = b.count);
        localStorage.setItem(`tdt_boosters${key}`, JSON.stringify(boostData));

        this.updateUI();
    },

    addCoins(amount) {
        this.coins += amount;
        this.saveData();
    },

    updateUI() {
        const coinDisplay = document.getElementById('shop-coins-display');
        if (coinDisplay) coinDisplay.innerText = this.coins;
    },

    openShop() {
        if (typeof gameAudio !== 'undefined') gameAudio.uiClick();

        // Si no hay perfil en UI porque no le dio jugar aún, le pedimos un nombre para tener datos fijos
        if (typeof ui !== 'undefined' && !ui.currentUser) {
            const nameInput = document.getElementById('username');
            const name = nameInput ? nameInput.value.trim() : '';
            if (name) {
                ui.currentUser = name;
                document.getElementById('user-display').innerText = name;
                this.loadData(name); // Cargar datos de este usuario antes de abrir
            }
        }

        this.updateUI();
        // Set default tab when opening
        this.switchTab('skins');

        document.getElementById('user-screen').classList.add('hidden');
        const shopScreen = document.getElementById('shop-screen');
        shopScreen.classList.remove('hidden');
        shopScreen.style.position = 'fixed';
        shopScreen.style.inset = '0';
        shopScreen.style.background = 'rgba(0,0,0,0.8)';
        shopScreen.style.zIndex = '2100';
        shopScreen.style.display = 'flex';
        shopScreen.style.justifyContent = 'center';
        shopScreen.style.alignItems = 'center';
    },

    closeShop() {
        if (typeof gameAudio !== 'undefined') gameAudio.uiClick();
        document.getElementById('shop-screen').classList.add('hidden');
        document.getElementById('user-screen').classList.remove('hidden');
    },

    switchTab(tab) {
        if (typeof gameAudio !== 'undefined') gameAudio.uiClick();
        this.currentTab = tab;

        const tabSkins = document.getElementById('shop-tab-skins');
        const tabBoosters = document.getElementById('shop-tab-boosters');

        if (tabSkins && tabBoosters) {
            if (tab === 'skins') {
                tabSkins.className = 'btn-blue';
                tabBoosters.className = 'btn-gray';
            } else {
                tabBoosters.className = 'btn-blue';
                tabSkins.className = 'btn-gray';
            }
        }

        this.renderShopItems();
    },

    renderShopItems() {
        const container = document.getElementById('shop-items');
        container.innerHTML = '';

        if (this.currentTab === 'skins') {
            this.items.forEach(item => {
                const isOwned = this.inventory.includes(item.id);
                const isActive = this.currentTheme === item.id;

                const div = document.createElement('div');
                div.className = `shop-item-card`;
                div.style.border = isActive ? '3px solid #4caf50' : '2px solid #ccc';
                div.style.borderRadius = '10px';
                div.style.padding = '10px';
                div.style.textAlign = 'center';
                div.style.backgroundColor = isActive ? '#f1f8e9' : '#fff';

                div.innerHTML = `
                    <div style="font-size: 2.5em; margin-bottom: 5px;">${item.icon}</div>
                    <h4 style="margin: 0 0 5px 0;">${item.name}</h4>
                    <p style="font-size: 0.8em; color: #666; margin: 0 0 10px 0; min-height: 48px;">${item.description}</p>
                    ${isOwned
                        ? `<button id="btn-equip-${item.id}" class="${isActive ? 'btn-gray' : 'btn-blue'}" style="width:100%; padding:8px; font-size:0.9em;">${isActive ? 'Equipado' : 'Equipar'}</button>`
                        : `<button id="btn-buy-${item.id}" class="btn-yellow" style="width:100%; padding:8px; font-size:0.9em;">${item.price} 🪙</button>`
                    }
                `;

                container.appendChild(div);

                if (isOwned && !isActive) {
                    document.getElementById(`btn-equip-${item.id}`).onclick = () => this.equipItem(item.id);
                } else if (!isOwned) {
                    document.getElementById(`btn-buy-${item.id}`).onclick = () => this.buyItem(item.id);
                }
            });
        } else {
            // BOOSTERS TAB
            this.boosters.forEach(b => {
                const div = document.createElement('div');
                div.className = `shop-item-card`;
                div.style.border = '2px solid #b39ddb';
                div.style.borderRadius = '10px';
                div.style.padding = '10px';
                div.style.textAlign = 'center';
                div.style.backgroundColor = '#f3e5f5';

                div.innerHTML = `
                    <div style="font-size: 2.5em; margin-bottom: 5px;">${b.icon}</div>
                    <h4 style="margin: 0 0 5px 0;">${b.name} <span style="font-size:0.8em; padding:2px 6px; background:#d1c4e9; border-radius:10px;">x${b.count}</span></h4>
                    <p style="font-size: 0.8em; color: #666; margin: 0 0 10px 0; min-height: 48px;">${b.description}</p>
                    <button id="btn-buy-boost-${b.id}" class="btn-yellow" style="width:100%; padding:8px; font-size:0.9em;">${b.price} 🪙</button>
                `;

                container.appendChild(div);
                document.getElementById(`btn-buy-boost-${b.id}`).onclick = () => this.buyBooster(b.id);
            });
        }
    },

    buyItem(id) {
        if (typeof gameAudio !== 'undefined') gameAudio.uiClick();
        const item = this.items.find(i => i.id === id);
        if (this.coins >= item.price) {
            this.coins -= item.price;
            this.inventory.push(id);
            this.equipItem(id);
            this.saveData();
        } else {
            alert('¡No tienes suficientes monedas! 🪙 Juega para ganar más.');
        }
    },

    buyBooster(id) {
        if (typeof gameAudio !== 'undefined') gameAudio.uiClick();
        const b = this.boosters.find(i => i.id === id);
        if (this.coins >= b.price) {
            this.coins -= b.price;
            b.count++;
            this.saveData();
            this.renderShopItems(); // Refresh counts
        } else {
            alert('¡No tienes suficientes monedas! 🪙 Juega para ganar más.');
        }
    },

    equipItem(id) {
        if (typeof gameAudio !== 'undefined') gameAudio.uiClick();
        this.currentTheme = id;
        this.applyTheme(id);
        this.saveData();
        this.renderShopItems();
    },

    applyTheme(id) {
        document.documentElement.setAttribute('data-theme', id);
    },

    consumeBooster(id) {
        const b = this.boosters.find(i => i.id === id);
        if (b && b.count > 0) {
            b.count--;
            this.saveData();
            return true;
        }
        return false;
    }
};

window.addEventListener('DOMContentLoaded', () => {
    shop.init();
});
