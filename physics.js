const physics = {
    /**
     * Calcula la distancia entre el centro de la tarta y el centro de la base.
     * @param {number} x - Posición X (left) de la tarta al caer.
     * @param {number} width - Ancho actual de la tarta.
     * @returns {number} El offset relativo para posicionar la pieza en la torre.
     */
    calculateOffset(x, width) {
        // 1. Encontramos el centro exacto de la pantalla (donde está la base)
        const screenCenter = window.innerWidth / 2;
        
        // 2. Encontramos el centro de la tarta que acaba de caer
        const cakeCenter = x + (width / 2);
        
        // 3. La diferencia es el offset. 
        // Si es 0, cayó perfecto. Si es positivo, cayó a la derecha.
        return (cakeCenter - screenCenter);
    }
};
