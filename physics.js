const physics = {
    calculateOffset(x, width) {
        // Centro de pantalla - Centro de tarta
        return (x + (width / 2)) - (window.innerWidth / 2);
    }
};
