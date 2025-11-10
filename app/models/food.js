'use strict';

class Food {
    constructor(id, coordinate, type, color, appearanceId = null, points = null, growth = null,
            base64Image = null) {
        this.id = id;
        this.coordinate = coordinate;
        this.type = type;
        this.color = color;
        this.appearanceId = appearanceId;
        this.points = points;
        this.growth = growth;
        this.base64Image = base64Image;
    }

    setCoordinate(coordinate) {
        this.coordinate = coordinate;
    }

    setBase64Image(base64Image) {
        this.base64Image = base64Image;
    }
}

module.exports = Food;
