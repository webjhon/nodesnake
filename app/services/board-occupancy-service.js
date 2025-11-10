'use strict';
const Board = require('../configs/board');
const Coordinate = require('../models/coordinate');
const CoordinateAttribute = require('../models/coordinate-attribute');
const FoodConsumed = require('../models/food-consumed');
const KillReport = require('../models/kill-report');

const FOOD_TYPE = 'food';
const HEAD_TYPE = 'head';
const TAIL_TYPE = 'tail';
const WALL_TYPE = 'wall';

/**
 * Keeps track of where everything is located on an expanding board.
 */
class BoardOccupancyService {
    constructor() {
        this.initialHalfWidth = Math.floor(Board.HORIZONTAL_SQUARES / 2);
        this.initialHalfHeight = Math.floor(Board.VERTICAL_SQUARES / 2);
        this.initializeBoard();
    }

    initializeBoard() {
        this.board = new Map();
        this.minColumn = -this.initialHalfWidth;
        this.maxColumn = this.initialHalfWidth;
        this.minRow = -this.initialHalfHeight;
        this.maxRow = this.initialHalfHeight;
    }

    addFoodOccupancy(foodId, foodCoordinate) {
        this._ensureBoundsIncludeCoordinate(foodCoordinate);
        this._addOccupancy(foodId, foodCoordinate, FOOD_TYPE);
    }

    addPlayerOccupancy(playerId, playerCoordinates) {
        if (!playerCoordinates || playerCoordinates.length === 0) {
            return;
        }
        for (const coordinate of playerCoordinates) {
            this._ensureBoundsIncludeCoordinate(coordinate);
        }
        this._addOccupancy(playerId, playerCoordinates[0], HEAD_TYPE);
        for (let i = 1; i < playerCoordinates.length; i++) {
            this._addOccupancy(playerId, playerCoordinates[i], TAIL_TYPE);
        }
    }

    addWall(coordinate) {
        this._ensureBoundsIncludeCoordinate(coordinate);
        this._addOccupancy(null, coordinate, WALL_TYPE);
    }

    getFoodsConsumed() {
        const foodsConsumed = [];
        for (const coordinateAttribute of this._iterAttributes()) {
            if (coordinateAttribute.attribute.isOccupiedByFoodAndPlayer()) {
                foodsConsumed.push(new FoodConsumed(coordinateAttribute.attribute.foodId,
                    coordinateAttribute.attribute.getPlayerIdsWithHead()[0]));
            }
        }
        return foodsConsumed;
    }

    getKillReports() {
        const killReports = [];
        for (const coordinateAttribute of this._iterAttributes()) {
            const attribute = coordinateAttribute.attribute;
            if (attribute.isOccupiedByMultiplePlayers()) {
                const killerId = attribute.playerIdWithTail;
                if (killerId) {
                    for (const playerIdWithHead of attribute.getPlayerIdsWithHead()) {
                        killReports.push(new KillReport(killerId, playerIdWithHead));
                    }
                } else {
                    killReports.push(new KillReport(null, null, attribute.getPlayerIdsWithHead()));
                }
            }
        }
        return killReports;
    }

    getRandomUnoccupiedCoordinate() {
        const attempts = 200;
        for (let attempt = 0; attempt < attempts; attempt++) {
            const randomCoordinate = this._getRandomCoordinateWithinBounds();
            const attribute = this._getCoordinateAttribute(randomCoordinate.x, randomCoordinate.y);
            if (!attribute.isOccupied()) {
                return randomCoordinate;
            }
        }

        for (let column = this.minColumn; column <= this.maxColumn; column++) {
            for (let row = this.minRow; row <= this.maxRow; row++) {
                const attribute = this._getCoordinateAttribute(column, row);
                if (!attribute.isOccupied()) {
                    return new Coordinate(column, row);
                }
            }
        }
        return false;
    }

    getUnoccupiedHorizontalCoordinatesFromTopLeft(requiredFreeLength) {
        for (let row = this.minRow; row <= this.maxRow; row++) {
            let unoccupiedCoordinates = [];
            for (let column = this.minColumn; column <= this.maxColumn; column++) {
                const attribute = this._getCoordinateAttribute(column, row);
                if (attribute.isOccupied()) {
                    unoccupiedCoordinates = [];
                } else {
                    unoccupiedCoordinates.push(new Coordinate(column, row));
                    if (unoccupiedCoordinates.length === requiredFreeLength) {
                        return unoccupiedCoordinates;
                    }
                }
            }
        }
        return [];
    }

    getUnoccupiedHorizontalCoordinatesFromTopRight(requiredFreeLength) {
        for (let row = this.minRow; row <= this.maxRow; row++) {
            let unoccupiedCoordinates = [];
            for (let column = this.maxColumn; column >= this.minColumn; column--) {
                const attribute = this._getCoordinateAttribute(column, row);
                if (attribute.isOccupied()) {
                    unoccupiedCoordinates = [];
                } else {
                    unoccupiedCoordinates.push(new Coordinate(column, row));
                    if (unoccupiedCoordinates.length === requiredFreeLength) {
                        return unoccupiedCoordinates;
                    }
                }
            }
        }
        return [];
    }

    getUnoccupiedHorizontalCoordinatesFromBottomRight(requiredFreeLength) {
        for (let row = this.maxRow; row >= this.minRow; row--) {
            let unoccupiedCoordinates = [];
            for (let column = this.maxColumn; column >= this.minColumn; column--) {
                const attribute = this._getCoordinateAttribute(column, row);
                if (attribute.isOccupied()) {
                    unoccupiedCoordinates = [];
                } else {
                    unoccupiedCoordinates.push(new Coordinate(column, row));
                    if (unoccupiedCoordinates.length === requiredFreeLength) {
                        return unoccupiedCoordinates;
                    }
                }
            }
        }
        return [];
    }

    getUnoccupiedHorizontalCoordinatesFromBottomLeft(requiredFreeLength) {
        for (let row = this.maxRow; row >= this.minRow; row--) {
            let unoccupiedCoordinates = [];
            for (let column = this.minColumn; column <= this.maxColumn; column++) {
                const attribute = this._getCoordinateAttribute(column, row);
                if (attribute.isOccupied()) {
                    unoccupiedCoordinates = [];
                } else {
                    unoccupiedCoordinates.push(new Coordinate(column, row));
                    if (unoccupiedCoordinates.length === requiredFreeLength) {
                        return unoccupiedCoordinates;
                    }
                }
            }
        }
        return [];
    }

    getUnoccupiedVerticalCoordinatesFromTopLeft(requiredFreeLength) {
        for (let column = this.minColumn; column <= this.maxColumn; column++) {
            let unoccupiedCoordinates = [];
            for (let row = this.minRow; row <= this.maxRow; row++) {
                const attribute = this._getCoordinateAttribute(column, row);
                if (attribute.isOccupied()) {
                    unoccupiedCoordinates = [];
                } else {
                    unoccupiedCoordinates.push(new Coordinate(column, row));
                    if (unoccupiedCoordinates.length === requiredFreeLength) {
                        return unoccupiedCoordinates;
                    }
                }
            }
        }
        return [];
    }

    getUnoccupiedVerticalCoordinatesFromTopRight(requiredFreeLength) {
        for (let column = this.maxColumn; column >= this.minColumn; column--) {
            let unoccupiedCoordinates = [];
            for (let row = this.minRow; row <= this.maxRow; row++) {
                const attribute = this._getCoordinateAttribute(column, row);
                if (attribute.isOccupied()) {
                    unoccupiedCoordinates = [];
                } else {
                    unoccupiedCoordinates.push(new Coordinate(column, row));
                    if (unoccupiedCoordinates.length === requiredFreeLength) {
                        return unoccupiedCoordinates;
                    }
                }
            }
        }
        return [];
    }

    getUnoccupiedVerticalCoordinatesFromBottomRight(requiredFreeLength) {
        for (let column = this.maxColumn; column >= this.minColumn; column--) {
            let unoccupiedCoordinates = [];
            for (let row = this.maxRow; row >= this.minRow; row--) {
                const attribute = this._getCoordinateAttribute(column, row);
                if (attribute.isOccupied()) {
                    unoccupiedCoordinates = [];
                } else {
                    unoccupiedCoordinates.push(new Coordinate(column, row));
                    if (unoccupiedCoordinates.length === requiredFreeLength) {
                        return unoccupiedCoordinates;
                    }
                }
            }
        }
        return [];
    }

    getUnoccupiedVerticalCoordinatesFromBottomLeft(requiredFreeLength) {
        for (let column = this.minColumn; column <= this.maxColumn; column++) {
            let unoccupiedCoordinates = [];
            for (let row = this.maxRow; row >= this.minRow; row--) {
                const attribute = this._getCoordinateAttribute(column, row);
                if (attribute.isOccupied()) {
                    unoccupiedCoordinates = [];
                } else {
                    unoccupiedCoordinates.push(new Coordinate(column, row));
                    if (unoccupiedCoordinates.length === requiredFreeLength) {
                        return unoccupiedCoordinates;
                    }
                }
            }
        }
        return [];
    }

    getWallCoordinates() {
        const wallCoordinates = [];
        for (const coordinateAttribute of this._iterAttributes()) {
            if (coordinateAttribute.attribute.isWall()) {
                wallCoordinates.push(new Coordinate(coordinateAttribute.x, coordinateAttribute.y));
            }
        }
        return wallCoordinates;
    }

    getWorldBounds() {
        return {
            minX: this.minColumn,
            maxX: this.maxColumn,
            minY: this.minRow,
            maxY: this.maxRow,
        };
    }

    isOutOfBounds(coordinate) {
        this._ensureBoundsIncludeCoordinate(coordinate);
        return false;
    }

    isSafe(coordinate) {
        this._ensureBoundsIncludeCoordinate(coordinate);
        const attribute = this._getCoordinateAttribute(coordinate.x, coordinate.y);
        return attribute.isSafe();
    }

    isPermanentWall(coordinate) {
        this._ensureBoundsIncludeCoordinate(coordinate);
        const attribute = this._getCoordinateAttribute(coordinate.x, coordinate.y);
        return attribute.isPermanentWall();
    }

    isWall(coordinate) {
        this._ensureBoundsIncludeCoordinate(coordinate);
        const attribute = this._getCoordinateAttribute(coordinate.x, coordinate.y);
        return attribute.isWall();
    }

    removeFoodOccupancy(foodId, foodCoordinate) {
        this._removeOccupancy(foodId, foodCoordinate, FOOD_TYPE);
    }

    removePlayerOccupancy(playerId, playerCoordinates) {
        if (!playerCoordinates || playerCoordinates.length === 0) {
            return;
        }
        this._removeOccupancy(playerId, playerCoordinates[0], HEAD_TYPE);
        for (let i = 1; i < playerCoordinates.length; i++) {
            this._removeOccupancy(playerId, playerCoordinates[i], TAIL_TYPE);
        }
    }

    removeWall(coordinate) {
        this._removeOccupancy(null, coordinate, WALL_TYPE);
    }

    _addOccupancy(id, coordinate, type) {
        const attribute = this._getCoordinateAttribute(coordinate.x, coordinate.y);
        if (type === FOOD_TYPE) {
            attribute.setFoodId(id);
        } else if (type === HEAD_TYPE) {
            attribute.addPlayerIdWithHead(id);
        } else if (type === TAIL_TYPE) {
            attribute.setPlayerIdWithTail(id);
        } else if (type === WALL_TYPE) {
            attribute.setWall(true);
        }
    }

    _coordinateKey(x, y) {
        return `${x},${y}`;
    }

    _ensureBoundsIncludeCoordinate(coordinate) {
        const buffer = Number.isFinite(Board.OPEN_WORLD_BUFFER) ? Board.OPEN_WORLD_BUFFER : 0;
        let chunk = Number.isFinite(Board.OPEN_WORLD_CHUNK) ? Board.OPEN_WORLD_CHUNK : 10;
        if (chunk <= 0) {
            chunk = 10;
        }

        while (coordinate.x < this.minColumn + buffer) {
            this.minColumn -= chunk;
        }
        while (coordinate.x > this.maxColumn - buffer) {
            this.maxColumn += chunk;
        }
        while (coordinate.y < this.minRow + buffer) {
            this.minRow -= chunk;
        }
        while (coordinate.y > this.maxRow - buffer) {
            this.maxRow += chunk;
        }
    }

    _getCoordinateAttribute(x, y) {
        const key = this._coordinateKey(x, y);
        let attribute = this.board.get(key);
        if (!attribute) {
            attribute = new CoordinateAttribute();
            this.board.set(key, attribute);
        }
        return attribute;
    }

    _getRandomCoordinateWithinBounds() {
        const x = Math.floor(Math.random() * (this.maxColumn - this.minColumn + 1)) + this.minColumn;
        const y = Math.floor(Math.random() * (this.maxRow - this.minRow + 1)) + this.minRow;
        return new Coordinate(x, y);
    }

    *_iterAttributes() {
        const entries = [];
        for (const [key, attribute] of this.board.entries()) {
            const coordinates = key.split(',').map(number => parseInt(number, 10));
            entries.push({
                x: coordinates[0],
                y: coordinates[1],
                attribute,
            });
        }
        entries.sort((a, b) => {
            if (a.x === b.x) {
                return a.y - b.y;
            }
            return a.x - b.x;
        });
        for (const entry of entries) {
            yield entry;
        }
    }

    _removeOccupancy(id, coordinate, type) {
        const attribute = this._getCoordinateAttribute(coordinate.x, coordinate.y);
        if (type === FOOD_TYPE) {
            attribute.setFoodId(false);
        } else if (type === HEAD_TYPE) {
            attribute.removePlayerIdWithHead(id);
        } else if (type === TAIL_TYPE) {
            attribute.setPlayerIdWithTail(false);
        } else if (type === WALL_TYPE) {
            attribute.setWall(false);
        }
    }
}

module.exports = BoardOccupancyService;
