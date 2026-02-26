const physics = {
    calculateOffset(x, width, score, balance) {
        const screenCenter = window.innerWidth / 2;
        const cakeCenterGlobal = x + (width / 2);

        // Cada piso (incluyendo la base) tiene altura 40. 
        // El pastel que estamos colocando (score) se apila sobre la base + los pasteles anteriores.
        // Altura = (pasteles anteriores + base) * 40
        const towerHeight = (score + 1) * 40;
        const tiltRadians = balance * (Math.PI / 180);
        const horizontalShift = towerHeight * Math.sin(tiltRadians);

        const realTowerCenter = screenCenter + horizontalShift;

        // El offset ahora es relativo a la posición real de la cima inclinada
        return cakeCenterGlobal - realTowerCenter;
    }
};
