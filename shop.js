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

        // After loading a different user's data, we must instantly apply their theme and update top bar
        this.applyTheme(this.currentTheme);
        this.updateUI();
    },

    saveData() {
        const key = this.userKey || '';
        localStorage.setItem(`tdt_coins${key}`, this.coins);
        localStorage.setItem(`tdt_theme${key}`, this.currentTheme);
        localStorage.setItem(`tdt_inventory${key}`, JSON.stringify(this.inventory));
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
        this.renderShopItems();

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

    renderShopItems() {
        const container = document.getElementById('shop-items');
        container.innerHTML = '';

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
                    ? `<button id="btn-equip-${item.id}" style="width:100%; padding:8px; font-size:0.9em; background: ${isActive ? '#888' : '#2196f3'}">${isActive ? 'Equipado' : 'Equipar'}</button>`
                    : `<button id="btn-buy-${item.id}" style="width:100%; padding:8px; font-size:0.9em; background: #fbc02d; color:#000;">${item.price} 🪙</button>`
                }
            `;

            container.appendChild(div);

            if (isOwned && !isActive) {
                document.getElementById(`btn-equip-${item.id}`).onclick = () => this.equipItem(item.id);
            } else if (!isOwned) {
                document.getElementById(`btn-buy-${item.id}`).onclick = () => this.buyItem(item.id);
            }
        });
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

    equipItem(id) {
        if (typeof gameAudio !== 'undefined') gameAudio.uiClick();
        this.currentTheme = id;
        this.applyTheme(id);
        this.saveData();
        this.renderShopItems();
    },

    applyTheme(id) {
        document.documentElement.setAttribute('data-theme', id);
    }
};

window.addEventListener('DOMContentLoaded', () => {
    shop.init();
});
