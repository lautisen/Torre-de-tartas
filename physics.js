/**
 * physics.js - Motor de física para Torre de Tartas
 * Gestiona el cálculo de colisiones y el desplazamiento lateral.
 */

const physics = {
    /**
     * Calcula la distancia entre el centro de la tarta y el centro de la pantalla.
     * @param {number} x - Posición X (left) de la tarta al momento de aterrizar.
     * @param {number} width - El ancho actual de la tarta.
     * @returns {number} El desplazamiento (offset) respecto al eje central.
     */
    calculateOffset(x, width) {
        // 1. Calculamos el centro exacto de la pantalla (donde está la base)
        const screenCenter = window.innerWidth / 2;
        
        // 2. Calculamos el centro de la tarta que acaba de caer
        const cakeCenter = x + (width / 2);
        
        // 3. La diferencia es el offset:
        // Valor positivo: cayó hacia la derecha.
        // Valor negativo: cayó hacia la izquierda.
        const offset = cakeCenter - screenCenter;

        return offset;
    },

    /**
     * Opcional: Función para normalizar el impacto en el balance.
     * Ayuda a que el peso de la torre se sienta más realista.
     * @param {number} offset - El desplazamiento calculado.
     * @param {number} currentBalance - El ángulo actual de la torre.
     * @returns {number} El incremento de ángulo a aplicar.
     */
    calculateBalanceIncrement(offset, currentBalance) {
        // Dividimos por un factor de sensibilidad (18-20) 
        // para que la torre no se caiga de un solo golpe.
        const sensitivity = 18;
        return offset / sensitivity;
    }
};
