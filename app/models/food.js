'use strict';

class Food {
    constructor(id, coordinate, type, color, appearanceId = null) {
        this.id = id;
        this.coordinate = coordinate;
        this.type = type;
        this.color = color;
        this.appearanceId = appearanceId;
    }

    setCoordinate(coordinate) {
        this.coordinate = coordinate;
    }
}

module.exports = Food;
