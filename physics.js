const physics = {
    calculateOffset(x, width, score, balance) {
        const screenCenter = window.innerWidth / 2;
        const cakeCenterGlobal = x + (width / 2);
        
        // Calculamos cuánto se ha desplazado el centro de la cima de la torre
        // debido a la inclinación acumulada (trigonometría básica)
        const towerHeight = score * 40;
        const tiltRadians = balance * (Math.PI / 180);
        const horizontalShift = towerHeight * Math.sin(tiltRadians);
        
        const realTowerCenter = screenCenter + horizontalShift;
        
        // El offset ahora es relativo a la posición real de la cima inclinada
        return cakeCenterGlobal - realTowerCenter;
    }
};
