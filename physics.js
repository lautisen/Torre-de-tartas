const physics = {
    calculateOffset(x, width, score, balance) {
        const screenCenter = window.innerWidth / 2;
        const cakeCenterGlobal = x + (width / 2);

        // Cada piso (incluyendo la base) tiene altura proporcional
        const floorH = (typeof gameMain !== 'undefined' && gameMain.floorH) ? gameMain.floorH : 40;

        // Altura a la que debemos medir el centro asumiendo inclinación
        const towerHeight = (score + 1) * floorH;
        const tiltRadians = balance * (Math.PI / 180);
        const horizontalShift = towerHeight * Math.sin(tiltRadians);

        const realTowerCenter = screenCenter + horizontalShift;

        // El offset ahora es relativo a la posición real de la cima inclinada
        return cakeCenterGlobal - realTowerCenter;
    }
};
