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
 * Keeps track of where everything is located on a board
 */
class BoardOccupancyService {
    constructor() {
        this.boundsChangedCallback = null;
        this.initializeBoard();
    }

    initializeBoard() {
        this.minColumn = 0;
        this.maxColumn = Board.HORIZONTAL_SQUARES - 1;
        this.minRow = 0;
        this.maxRow = Board.VERTICAL_SQUARES - 1;
        this.board = [];
        this._buildBoard();
        this._notifyBoundsChanged();
    }

    setBoundsChangedCallback(callback) {
        this.boundsChangedCallback = callback;
    }

    getBoardInfo() {
        return {
            SQUARE_SIZE_IN_PIXELS: Board.SQUARE_SIZE_IN_PIXELS,
            HORIZONTAL_SQUARES: this.getWidth(),
            VERTICAL_SQUARES: this.getHeight(),
            OFFSET_X: this.minColumn,
            OFFSET_Y: this.minRow,
        };
    }

    getWidth() {
        return this.maxColumn - this.minColumn + 1;
    }

    getHeight() {
        return this.maxRow - this.minRow + 1;
    }

    ensureCoordinateWithinBounds(coordinate) {
        let expanded = false;
        while (coordinate.x < this.minColumn) {
            this._expandLeft();
            expanded = true;
        }
        while (coordinate.x > this.maxColumn) {
            this._expandRight();
            expanded = true;
        }
        while (coordinate.y < this.minRow) {
            this._expandUp();
            expanded = true;
        }
        while (coordinate.y > this.maxRow) {
            this._expandDown();
            expanded = true;
        }
        if (expanded) {
            this._notifyBoundsChanged();
        }
        return expanded;
    }

    containsCoordinate(coordinate) {
        return coordinate.x >= this.minColumn && coordinate.x <= this.maxColumn &&
            coordinate.y >= this.minRow && coordinate.y <= this.maxRow;
    }

    addFoodOccupancy(foodId, foodCoordinate) {
        this._addOccupancy(foodId, foodCoordinate, FOOD_TYPE);
    }

    addPlayerOccupancy(playerId, playerCoordinates) {
        this._addOccupancy(playerId, playerCoordinates[0], HEAD_TYPE);
        for (let i = 1; i < playerCoordinates.length; i++) {
            this._addOccupancy(playerId, playerCoordinates[i], TAIL_TYPE);
        }
    }

    addWall(coordinate) {
        this._addOccupancy(null, coordinate, WALL_TYPE);
    }

    getFoodsConsumed() {
        const foodsConsumed = [];
        for (let columnIndex = 0; columnIndex < this.board.length; columnIndex++) {
            const boardColumn = this.board[columnIndex];
            for (let rowIndex = 0; rowIndex < boardColumn.length; rowIndex++) {
                const coordinateAttribute = boardColumn[rowIndex];
                if (coordinateAttribute.isOccupiedByFoodAndPlayer()) {
                    foodsConsumed.push(new FoodConsumed(coordinateAttribute.foodId,
                        coordinateAttribute.getPlayerIdsWithHead()[0]));
                }
            }
        }
        return foodsConsumed;
    }

    getKillReports() {
        const killReports = [];
        for (let columnIndex = 0; columnIndex < this.board.length; columnIndex++) {
            const boardColumn = this.board[columnIndex];
            for (let rowIndex = 0; rowIndex < boardColumn.length; rowIndex++) {
                const coordinateAttribute = boardColumn[rowIndex];
                if (!coordinateAttribute.isOccupiedByMultiplePlayers()) {
                    continue;
                }
                const killerId = coordinateAttribute.playerIdWithTail;
                if (killerId) {
                    for (const playerIdWithHead of coordinateAttribute.getPlayerIdsWithHead()) {
                        killReports.push(new KillReport(killerId, playerIdWithHead));
                    }
                } else {
                    killReports.push(new KillReport(null, null, coordinateAttribute.getPlayerIdsWithHead()));
                }
            }
        }
        return killReports;
    }

    getRandomUnoccupiedCoordinate() {
        const unoccupiedCoordinates = [];
        for (let columnIndex = 0; columnIndex < this.board.length; columnIndex++) {
            const boardColumn = this.board[columnIndex];
            for (let rowIndex = 0; rowIndex < boardColumn.length; rowIndex++) {
                const coordinateAttribute = boardColumn[rowIndex];
                if (!coordinateAttribute.isOccupied()) {
                    const column = this.minColumn + columnIndex;
                    const row = this.minRow + rowIndex;
                    unoccupiedCoordinates.push(new Coordinate(column, row));
                }
            }
        }
        if (unoccupiedCoordinates.length === 0) {
            return false;
        }
        return unoccupiedCoordinates[Math.floor(Math.random() * unoccupiedCoordinates.length)];
    }

    getUnoccupiedHorizontalCoordinatesFromTopLeft(requiredFreeLength) {
        for (let rowIndex = 0; rowIndex < this.getHeight(); rowIndex++) {
            let unoccupiedCoordinates = [];
            for (let columnIndex = 0; columnIndex < this.getWidth(); columnIndex++) {
                const coordinateAttribute = this.board[columnIndex][rowIndex];
                if (coordinateAttribute.isOccupied()) {
                    unoccupiedCoordinates = [];
                } else {
                    const column = this.minColumn + columnIndex;
                    const row = this.minRow + rowIndex;
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
        for (let rowIndex = 0; rowIndex < this.getHeight(); rowIndex++) {
            let unoccupiedCoordinates = [];
            for (let columnIndex = this.getWidth() - 1; columnIndex >= 0; columnIndex--) {
                const coordinateAttribute = this.board[columnIndex][rowIndex];
                if (coordinateAttribute.isOccupied()) {
                    unoccupiedCoordinates = [];
                } else {
                    const column = this.minColumn + columnIndex;
                    const row = this.minRow + rowIndex;
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
        for (let rowIndex = this.getHeight() - 1; rowIndex >= 0; rowIndex--) {
            let unoccupiedCoordinates = [];
            for (let columnIndex = this.getWidth() - 1; columnIndex >= 0; columnIndex--) {
                const coordinateAttribute = this.board[columnIndex][rowIndex];
                if (coordinateAttribute.isOccupied()) {
                    unoccupiedCoordinates = [];
                } else {
                    const column = this.minColumn + columnIndex;
                    const row = this.minRow + rowIndex;
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
        for (let rowIndex = this.getHeight() - 1; rowIndex >= 0; rowIndex--) {
            let unoccupiedCoordinates = [];
            for (let columnIndex = 0; columnIndex < this.getWidth(); columnIndex++) {
                const coordinateAttribute = this.board[columnIndex][rowIndex];
                if (coordinateAttribute.isOccupied()) {
                    unoccupiedCoordinates = [];
                } else {
                    const column = this.minColumn + columnIndex;
                    const row = this.minRow + rowIndex;
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
        for (let columnIndex = 0; columnIndex < this.getWidth(); columnIndex++) {
            let unoccupiedCoordinates = [];
            for (let rowIndex = 0; rowIndex < this.getHeight(); rowIndex++) {
                const coordinateAttribute = this.board[columnIndex][rowIndex];
                if (coordinateAttribute.isOccupied()) {
                    unoccupiedCoordinates = [];
                } else {
                    const column = this.minColumn + columnIndex;
                    const row = this.minRow + rowIndex;
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
        for (let columnIndex = this.getWidth() - 1; columnIndex >= 0; columnIndex--) {
            let unoccupiedCoordinates = [];
            for (let rowIndex = 0; rowIndex < this.getHeight(); rowIndex++) {
                const coordinateAttribute = this.board[columnIndex][rowIndex];
                if (coordinateAttribute.isOccupied()) {
                    unoccupiedCoordinates = [];
                } else {
                    const column = this.minColumn + columnIndex;
                    const row = this.minRow + rowIndex;
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
        for (let columnIndex = this.getWidth() - 1; columnIndex >= 0; columnIndex--) {
            let unoccupiedCoordinates = [];
            for (let rowIndex = this.getHeight() - 1; rowIndex >= 0; rowIndex--) {
                const coordinateAttribute = this.board[columnIndex][rowIndex];
                if (coordinateAttribute.isOccupied()) {
                    unoccupiedCoordinates = [];
                } else {
                    const column = this.minColumn + columnIndex;
                    const row = this.minRow + rowIndex;
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
        for (let columnIndex = 0; columnIndex < this.getWidth(); columnIndex++) {
            let unoccupiedCoordinates = [];
            for (let rowIndex = this.getHeight() - 1; rowIndex >= 0; rowIndex--) {
                const coordinateAttribute = this.board[columnIndex][rowIndex];
                if (coordinateAttribute.isOccupied()) {
                    unoccupiedCoordinates = [];
                } else {
                    const column = this.minColumn + columnIndex;
                    const row = this.minRow + rowIndex;
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
        for (let columnIndex = 0; columnIndex < this.board.length; columnIndex++) {
            const boardColumn = this.board[columnIndex];
            for (let rowIndex = 0; rowIndex < boardColumn.length; rowIndex++) {
                const coordinateAttribute = boardColumn[rowIndex];
                if (coordinateAttribute.isWall()) {
                    const column = this.minColumn + columnIndex;
                    const row = this.minRow + rowIndex;
                    wallCoordinates.push(new Coordinate(column, row));
                }
            }
        }
        return wallCoordinates;
    }

    isOutOfBounds(coordinate) {
        return !this.containsCoordinate(coordinate);
    }

    isSafe(coordinate) {
        if (!this.containsCoordinate(coordinate)) {
            return true;
        }
        return this._getCoordinateAttribute(coordinate).isSafe();
    }

    isPermanentWall(coordinate) {
        if (!this.containsCoordinate(coordinate)) {
            return false;
        }
        return this._getCoordinateAttribute(coordinate).isPermanentWall();
    }

    isWall(coordinate) {
        if (!this.containsCoordinate(coordinate)) {
            return false;
        }
        return this._getCoordinateAttribute(coordinate).isWall();
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
        this.ensureCoordinateWithinBounds(coordinate);
        const coordinateAttribute = this._getCoordinateAttribute(coordinate);
        if (type === FOOD_TYPE) {
            coordinateAttribute.setFoodId(id);
        } else if (type === HEAD_TYPE) {
            coordinateAttribute.addPlayerIdWithHead(id);
        } else if (type === TAIL_TYPE) {
            coordinateAttribute.setPlayerIdWithTail(id);
        } else if (type === WALL_TYPE) {
            coordinateAttribute.setWall(true);
        }
    }

    _removeOccupancy(id, coordinate, type) {
        if (!this.containsCoordinate(coordinate)) {
            return;
        }
        const coordinateAttribute = this._getCoordinateAttribute(coordinate);
        if (type === FOOD_TYPE) {
            coordinateAttribute.setFoodId(false);
        } else if (type === HEAD_TYPE) {
            coordinateAttribute.removePlayerIdWithHead(id);
        } else if (type === TAIL_TYPE) {
            coordinateAttribute.setPlayerIdWithTail(false);
        } else if (type === WALL_TYPE) {
            coordinateAttribute.setWall(false);
        }
    }

    _buildBoard() {
        const width = this.getWidth();
        const height = this.getHeight();
        for (let columnIndex = 0; columnIndex < width; columnIndex++) {
            this.board[columnIndex] = new Array(height);
            for (let rowIndex = 0; rowIndex < height; rowIndex++) {
                this.board[columnIndex][rowIndex] = new CoordinateAttribute();
            }
        }
    }

    _expandDown() {
        this._addRowsBottom(Board.EXPANSION_SIZE);
    }

    _expandLeft() {
        this._addColumnsLeft(Board.EXPANSION_SIZE);
    }

    _expandRight() {
        this._addColumnsRight(Board.EXPANSION_SIZE);
    }

    _expandUp() {
        this._addRowsTop(Board.EXPANSION_SIZE);
    }

    _addColumnsLeft(count) {
        const rows = this.getHeight();
        for (let i = 0; i < count; i++) {
            const column = new Array(rows);
            for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
                column[rowIndex] = new CoordinateAttribute();
            }
            this.board.unshift(column);
        }
        this.minColumn -= count;
    }

    _addColumnsRight(count) {
        const rows = this.getHeight();
        for (let i = 0; i < count; i++) {
            const column = new Array(rows);
            for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
                column[rowIndex] = new CoordinateAttribute();
            }
            this.board.push(column);
        }
        this.maxColumn += count;
    }

    _addRowsBottom(count) {
        const width = this.getWidth();
        for (let columnIndex = 0; columnIndex < width; columnIndex++) {
            const column = this.board[columnIndex];
            for (let i = 0; i < count; i++) {
                column.push(new CoordinateAttribute());
            }
        }
        this.maxRow += count;
    }

    _addRowsTop(count) {
        const width = this.getWidth();
        for (let columnIndex = 0; columnIndex < width; columnIndex++) {
            const column = this.board[columnIndex];
            for (let i = 0; i < count; i++) {
                column.unshift(new CoordinateAttribute());
            }
        }
        this.minRow -= count;
    }

    _getCoordinateAttribute(coordinate) {
        const columnIndex = coordinate.x - this.minColumn;
        const rowIndex = coordinate.y - this.minRow;
        return this.board[columnIndex][rowIndex];
    }

    _notifyBoundsChanged() {
        if (this.boundsChangedCallback) {
            this.boundsChangedCallback(this.getBoardInfo());
        }
    }
}

module.exports = BoardOccupancyService;
