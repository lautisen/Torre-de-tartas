const physics = {
    calculateOffset(cakeX, cakeWidth, score, balance) {
        // Centro de la pantalla (donde está la base inicialmente)
        const screenCenter = window.innerWidth / 2;
        
        // Centro real del pastel que cae
        const cakeCenter = cakeX + (cakeWidth / 2);
        
        // Desplazamiento de la torre por inclinación (si existe)
        const towerHeight = score * 40;
        const tiltRadians = balance * (Math.PI / 180);
        const horizontalShift = towerHeight * Math.sin(tiltRadians);
        
        const targetCenter = screenCenter + horizontalShift;

        // Retornamos la diferencia
        return (cakeCenter - targetCenter);
    }
};
