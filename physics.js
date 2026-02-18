const physics = {
    calculateOffset(x, width, score, balance) {
        const screenCenter = window.innerWidth / 2;
        const cakeCenterGlobal = x + (width / 2);
        const towerHeight = score * 40;
        const tiltRadians = balance * (Math.PI / 180);
        
        const horizontalShift = towerHeight * Math.sin(tiltRadians);
        const realTowerCenter = screenCenter + horizontalShift;
        
        return (cakeCenterGlobal - realTowerCenter) / Math.cos(tiltRadians);
    }
};
