import CanvasView from './canvas-view.js';
import DomHelper from './dom-helper.js';

/**
 * Constructs CanvasView
 */
export default class CanvasFactory {
    static createCanvasView(squareSizeInPixels, horizontalSquares, verticalSquares, offsetX, offsetY, canvasClickHandler) {
        const canvas = DomHelper.createElement('canvas');
        const width = horizontalSquares * squareSizeInPixels;
        const height = verticalSquares * squareSizeInPixels;
        canvas.width = width;
        canvas.height = height;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        const gameBoardDiv = DomHelper.getGameBoardDiv();
        gameBoardDiv.innerHTML = '';
        gameBoardDiv.appendChild(canvas);
        const imageUploadCanvas = this._createImageUploadCanvas(squareSizeInPixels);
        return new CanvasView(canvas, squareSizeInPixels, offsetX, offsetY, imageUploadCanvas, canvasClickHandler);
    }

    static _createImageUploadCanvas(squareSizeInPixels) {
        const canvas = document.createElement('canvas');
        const roundedSize = Math.floor(squareSizeInPixels);
        canvas.width = roundedSize;
        canvas.height = roundedSize;
        return canvas;
    }
}
