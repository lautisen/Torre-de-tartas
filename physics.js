const physics = {
    calculateOffset(x, width) {
        const screenCenter = window.innerWidth / 2;
        const cakeCenter = x + (width / 2);
        return cakeCenter - screenCenter;
    }
};
