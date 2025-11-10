import ClientConfig from '../config/client-config.js';

/**
 * Handles all requests related to the canvas
 */
export default class CanvasView {
    constructor(canvas, squareSizeInPixels, imageUploadCanvas, canvasClickHandler) {
        this.height = canvas.height;
        this.width = canvas.width;
        this.context = canvas.getContext('2d');
        this.canvas = canvas;
        this.defaultDisplayWidth = canvas.style.width;
        this.defaultDisplayHeight = canvas.style.height;
        this.squareSizeInPixels = squareSizeInPixels;
        this.backgroundImageUploadCanvas = canvas;
        this.imageUploadCanvas = imageUploadCanvas;
        this.showGridLines = false;
        this.boundResizeHandler = null;
        this.playerImageCache = new Map();
        this._initializeClickListeners(canvas, canvasClickHandler);
    }

    clear() {
        this.context.fillStyle = 'black';
        this.context.globalAlpha = 1;
        this.context.fillRect(0, 0, this.width, this.height);

        if (this.backgroundImage) {
            this.context.drawImage(this.backgroundImage, 0, 0);
        }

        if (this.showGridLines) {
            this.context.strokeStyle = '#2a2a2a';
            this.context.lineWidth = 0.5;
            for (let i = this.squareSizeInPixels / 2; i < this.width || i < this.height; i += this.squareSizeInPixels) {
                // draw horizontal lines
                this.context.moveTo(i, 0);
                this.context.lineTo(i, this.height);
                // draw vertical lines
                this.context.moveTo(0, i);
                this.context.lineTo(this.width, i);
            }
            this.context.stroke();
        }
    }

    drawImages(coordinates, base64Image) {
        for (const coordinate of coordinates) {
            this.drawImage(coordinate, base64Image);
        }
    }

    drawImage(coordinate, base64Image) {
        const x = coordinate.x * this.squareSizeInPixels;
        const y = coordinate.y * this.squareSizeInPixels;
        let image = this.playerImageCache.get(base64Image);
        if (!image) {
            image = new Image();
            image.src = base64Image;
            this.playerImageCache.set(base64Image, image);
        }

        const draw = () => {
            this.context.drawImage(image, x - (this.squareSizeInPixels / 2), y - (this.squareSizeInPixels / 2),
                this.squareSizeInPixels, this.squareSizeInPixels);
        };

        if (image.complete && image.naturalWidth) {
            draw();
        } else {
            image.addEventListener('load', draw, { once: true });
        }
    }

    drawSquares(coordinates, color) {
        for (const coordinate of coordinates) {
            this.drawSquare(coordinate, color);
        }
    }

    drawSquare(coordinate, color) {
        const x = coordinate.x * this.squareSizeInPixels;
        const y = coordinate.y * this.squareSizeInPixels;
        this.context.fillStyle = color;
        this.context.beginPath();
        this.context.moveTo(x - (this.squareSizeInPixels / 2), y - (this.squareSizeInPixels / 2));
        this.context.lineTo(x + (this.squareSizeInPixels / 2), y - (this.squareSizeInPixels / 2));
        this.context.lineTo(x + (this.squareSizeInPixels / 2), y + (this.squareSizeInPixels / 2));
        this.context.lineTo(x - (this.squareSizeInPixels / 2), y + (this.squareSizeInPixels / 2));
        this.context.closePath();
        this.context.fill();
    }

    drawSquareAround(coordinate, color) {
        const x = coordinate.x * this.squareSizeInPixels;
        const y = coordinate.y * this.squareSizeInPixels;
        const lengthAroundSquare = this.squareSizeInPixels * 2;
        this.context.lineWidth = this.squareSizeInPixels;
        this.context.strokeStyle = color;
        this.context.beginPath();
        this.context.moveTo(x - lengthAroundSquare, y - lengthAroundSquare);
        this.context.lineTo(x + lengthAroundSquare, y - lengthAroundSquare);
        this.context.lineTo(x + lengthAroundSquare, y + lengthAroundSquare);
        this.context.lineTo(x - lengthAroundSquare, y + lengthAroundSquare);
        this.context.closePath();
        this.context.stroke();
    }

    drawSpawnHighlight(coordinate, remainingTimeInMs, totalDurationInMs) {
        if (!coordinate || remainingTimeInMs <= 0 || totalDurationInMs <= 0) {
            return;
        }

        const x = coordinate.x * this.squareSizeInPixels;
        const y = coordinate.y * this.squareSizeInPixels;
        const clampedRemaining = Math.max(Math.min(remainingTimeInMs, totalDurationInMs), 0);
        const elapsed = totalDurationInMs - clampedRemaining;
        const progress = elapsed / totalDurationInMs;
        const pulse = 0.5 + 0.5 * Math.sin(progress * Math.PI * 6);

        const maxRadius = this.squareSizeInPixels * 2.8;
        const minRadius = this.squareSizeInPixels * 1.2;
        const outerRadius = minRadius + (maxRadius - minRadius) * (0.4 + 0.6 * pulse);
        const innerRadius = outerRadius * (0.45 + 0.2 * pulse);
        const opacity = 0.85 - (progress * 0.6);
        const accentColor = ClientConfig.SPAWN_FLASH_COLOR;

        this.context.save();
        this.context.translate(x, y);
        this.context.globalCompositeOperation = 'lighter';

        const gradient = this.context.createRadialGradient(0, 0, innerRadius * 0.2, 0, 0, outerRadius);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        gradient.addColorStop(0.45, 'rgba(255, 243, 120, 0.75)');
        gradient.addColorStop(1, 'rgba(255, 152, 0, 0)');

        this.context.fillStyle = gradient;
        this.context.beginPath();
        this.context.arc(0, 0, outerRadius, 0, Math.PI * 2);
        this.context.fill();

        this.context.lineWidth = this.squareSizeInPixels * (0.55 + 0.35 * pulse);
        this.context.globalAlpha = opacity;
        this.context.strokeStyle = accentColor;
        this.context.shadowColor = accentColor;
        this.context.shadowBlur = this.squareSizeInPixels * 1.5;
        this.context.beginPath();
        this.context.arc(0, 0, innerRadius, 0, Math.PI * 2);
        this.context.stroke();

        const rays = 10;
        const rayLength = outerRadius * (1.25 + 0.1 * pulse);
        const rayFade = Math.max(0, 0.65 - progress * 0.5);
        if (rayFade > 0) {
            this.context.lineWidth = this.squareSizeInPixels * 0.18;
            this.context.globalAlpha = rayFade;
            this.context.strokeStyle = 'rgba(255, 236, 179, 1)';
            for (let i = 0; i < rays; i++) {
                const angle = (Math.PI * 2 / rays) * i + progress * Math.PI * 1.5;
                const innerPoint = innerRadius * 0.5;
                this.context.beginPath();
                this.context.moveTo(Math.cos(angle) * innerPoint, Math.sin(angle) * innerPoint);
                this.context.lineTo(Math.cos(angle) * rayLength, Math.sin(angle) * rayLength);
                this.context.stroke();
            }
        }

        this.context.restore();
    }

    drawFadingText(textToDraw, turnsToShow) {
        this.context.save();
        this.context.globalAlpha = this._getOpacityFromCounter(textToDraw.counter, turnsToShow);
        this.context.lineWidth = 1;
        this.context.strokeStyle = 'black';
        this.context.fillStyle = textToDraw.color;
        this.context.font = ClientConfig.CANVAS_TEXT_STYLE;

        const textWidth = this.context.measureText(textToDraw.text).width;
        const textHeight = 24;
        let x = textToDraw.coordinate.x * this.squareSizeInPixels - textWidth / 2;
        let y = textToDraw.coordinate.y * this.squareSizeInPixels + textHeight / 2;
        if (x < 0) {
            x = 0;
        } else if (x > (this.width - textWidth)) {
            x = this.width - textWidth;
        }
        if (y < textHeight) {
            y = textHeight;
        } else if (y > this.height) {
            y = this.height;
        }
        // Draw text specifying the bottom left corner
        this.context.strokeText(textToDraw.text, x, y);
        this.context.fillText(textToDraw.text, x, y);
        this.context.restore();
    }

    clearBackgroundImage() {
        delete this.backgroundImage;
    }

    setBackgroundImage(backgroundImage) {
        this.backgroundImage = new Image();
        this.backgroundImage.src = backgroundImage;
    }

    resizeUploadedBackgroundImageAndBase64(image, imageType) {
        const imageToDraw = image;
        const maxImageWidth = this.backgroundImageUploadCanvas.width;
        const maxImageHeight = this.backgroundImageUploadCanvas.height;
        if (imageToDraw.width > maxImageWidth) {
            imageToDraw.width = maxImageWidth;
        }
        if (imageToDraw.height > maxImageHeight) {
            imageToDraw.height = maxImageHeight;
        }
        const imageUploadCanvasContext = this.backgroundImageUploadCanvas.getContext('2d');
        imageUploadCanvasContext.clearRect(0, 0, maxImageWidth, maxImageHeight);
        imageUploadCanvasContext.drawImage(imageToDraw, 0, 0, imageToDraw.width, imageToDraw.height);

        return this.backgroundImageUploadCanvas.toDataURL(imageType);
    }

    resizeUploadedImageAndBase64(image, imageType) {
        const imageToDraw = image;
        const maxImageWidth = this.imageUploadCanvas.width;
        const maxImageHeight = this.imageUploadCanvas.height;
        if (imageToDraw.width > maxImageWidth) {
            imageToDraw.width = maxImageWidth;
        }
        if (imageToDraw.height > maxImageHeight) {
            imageToDraw.height = maxImageHeight;
        }
        const imageUploadCanvasContext = this.imageUploadCanvas.getContext('2d');
        imageUploadCanvasContext.clearRect(0, 0, maxImageWidth, maxImageHeight);
        imageUploadCanvasContext.drawImage(imageToDraw, 0, 0, imageToDraw.width, imageToDraw.height);

        return this.imageUploadCanvas.toDataURL(imageType);
    }

    toggleGridLines() {
        this.showGridLines = !this.showGridLines;
    }

    updateDisplaySize(isFullScreen) {
        if (isFullScreen) {
            if (!this.boundResizeHandler) {
                this.boundResizeHandler = this._scaleCanvasToWindow.bind(this);
            }
            this._scaleCanvasToWindow();
            window.addEventListener('resize', this.boundResizeHandler);
        } else {
            if (this.boundResizeHandler) {
                window.removeEventListener('resize', this.boundResizeHandler);
            }
            this.boundResizeHandler = null;
            this._resetCanvasDisplaySize();
        }
    }

    // Gets a fade-in/fade-out opacity
    _getOpacityFromCounter(counter, turnsToShow) {
        if (counter < turnsToShow * 0.1 || counter > turnsToShow * 0.9) {
            return 0.33;
        } else if (counter < turnsToShow * 0.2 || counter > turnsToShow * 0.8) {
            return 0.66;
        }
        return 1;
    }

    _initializeClickListeners(canvas, canvasClickHandler) {
        const self = this;
        canvas.addEventListener('click', event => {
            const rect = canvas.getBoundingClientRect();
            const scaleX = rect.width ? canvas.width / rect.width : 1;
            const scaleY = rect.height ? canvas.height / rect.height : 1;
            const x = (event.clientX - rect.left) * scaleX;
            const y = (event.clientY - rect.top) * scaleY;
            const xCoord = Math.round(x / self.squareSizeInPixels);
            const yCoord = Math.round(y / self.squareSizeInPixels);
            canvasClickHandler(xCoord, yCoord);
        }, false);
    }

    _resetCanvasDisplaySize() {
        if (!this.canvas) {
            return;
        }
        this.canvas.style.width = this.defaultDisplayWidth;
        this.canvas.style.height = this.defaultDisplayHeight;
    }

    _scaleCanvasToWindow() {
        if (!this.canvas) {
            return;
        }
        const widthScale = window.innerWidth / this.width;
        const heightScale = window.innerHeight / this.height;
        const scale = Math.min(widthScale, heightScale);
        const scaledWidth = this.width * scale;
        const scaledHeight = this.height * scale;
        this.canvas.style.width = `${scaledWidth}px`;
        this.canvas.style.height = `${scaledHeight}px`;
    }
}
