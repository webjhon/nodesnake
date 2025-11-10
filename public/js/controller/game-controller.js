import ClientConfig from '../config/client-config.js';
import AudioController from './audio-controller.js';
import TextToDraw from '../model/text-to-draw.js';
import CanvasFactory from '../view/canvas-factory.js';
import GameView from '../view/game-view.js';

/**
 * Controls all game logic
 */
export default class GameController {
    constructor() {
        this.gameView = new GameView(this.backgroundImageUploadCallback.bind(this),
                                     this.botChangeCallback.bind(this),
                                     this.foodChangeCallback.bind(this),
                                     this.imageUploadCallback.bind(this),
                                     this.joinGameCallback.bind(this),
                                     this.keyDownCallback.bind(this),
                                     this.muteAudioCallback.bind(this),
                                     this.playerColorChangeCallback.bind(this),
                                     this.playerNameUpdatedCallback.bind(this),
                                     this.spectateGameCallback.bind(this),
                                     this.speedChangeCallback.bind(this),
                                     this.startLengthChangeCallback.bind(this),
                                     this.toggleGridLinesCallback.bind(this),
                                     this.handleFullScreenChange.bind(this)
                                     );
        this.audioController = new AudioController();
        this.players = [];
        this.food = {};
        this.textsToDraw = [];
        this.walls = [];
        this.worldBounds = null;
        this.isFullScreen = false;
        this.localPlayerSpawnHighlightEndTime = 0;
        this.localPlayerLastMoveCounter = null;
        this.lastCameraCenter = { x: 0, y: 0 };
        this.lastCameraZoom = 1;
    }

    connect(io) {
        this.socket = io();
        this._initializeSocketIoHandlers();
        const storedName = localStorage.getItem(ClientConfig.LOCAL_STORAGE.PLAYER_NAME);
        const storedBase64Image = localStorage.getItem(ClientConfig.LOCAL_STORAGE.PLAYER_IMAGE);
        this.socket.emit(ClientConfig.IO.OUTGOING.NEW_PLAYER, storedName, storedBase64Image);
    }

    renderGame() {
        if (!this.canvasView) {
            return;
        }

        const localPlayer = this._getLocalPlayer();
        const cameraSettings = this._calculateCameraSettings(localPlayer);
        this.canvasView.setCamera(cameraSettings.center, cameraSettings.zoom);
        this.lastCameraCenter = cameraSettings.center;
        this.lastCameraZoom = cameraSettings.zoom;

        this.canvasView.clear();
        for (const foodId of Object.keys(this.food)) {
            if ({}.hasOwnProperty.call(this.food, foodId)) {
                const food = this.food[foodId];
                if (food.base64Image) {
                    this.canvasView.drawImage(food.coordinate, food.base64Image);
                } else if (food.appearanceId) {
                    this.canvasView.drawFood(food.coordinate, food.appearanceId, food.color);
                } else {
                    this.canvasView.drawSquare(food.coordinate, food.color);
                }
            }
        }

        this.canvasView.drawSquares(this.walls, ClientConfig.WALL_COLOR);

        for (const player of this.players) {
            if (player.segments.length === 0) {
                continue;
            }
            const isLocalPlayer = this._isLocalPlayerId(player.id);
            if (isLocalPlayer) {
                if (this.localPlayerLastMoveCounter === null ||
                        player.moveCounter < this.localPlayerLastMoveCounter ||
                        (player.moveCounter === 0 && Date.now() > this.localPlayerSpawnHighlightEndTime)) {
                    this.localPlayerSpawnHighlightEndTime = Date.now() + ClientConfig.SPAWN_HIGHLIGHT_DURATION_MS;
                }

                const remainingHighlightTime = this.localPlayerSpawnHighlightEndTime - Date.now();
                if (remainingHighlightTime > 0) {
                    this.canvasView.drawSpawnHighlight(
                        player.segments[0],
                        remainingHighlightTime,
                        ClientConfig.SPAWN_HIGHLIGHT_DURATION_MS);
                }

                this.localPlayerLastMoveCounter = player.moveCounter;
            }

            if (player.base64Image) {
                this.canvasView.drawImages(player.segments, player.base64Image);
            } else {
                this.canvasView.drawSquares(player.segments, player.color);
            }
        }

        for (let i = this.textsToDraw.length - 1; i >= 0; i--) {
            const textToDraw = this.textsToDraw[i];
            if (textToDraw.counter === ClientConfig.TURNS_TO_SHOW_FOOD_TEXT) {
                this.textsToDraw.splice(i, 1);
            } else {
                this.canvasView.drawFadingText(textToDraw, ClientConfig.TURNS_TO_SHOW_FOOD_TEXT);
                textToDraw.incrementCounter();
            }
        }

        const self = this;
        // Run in a loop
        setTimeout(() => {
            requestAnimationFrame(self.renderGame.bind(self));
        }, 1000 / ClientConfig.FPS);
    }

    /*******************
     *  View Callbacks *
     *******************/

    botChangeCallback(option) {
        this.socket.emit(ClientConfig.IO.OUTGOING.BOT_CHANGE, option);
    }

    foodChangeCallback(option) {
        this.socket.emit(ClientConfig.IO.OUTGOING.FOOD_CHANGE, option);
    }

    backgroundImageUploadCallback(image, imageType) {
        if (!(image && imageType)) {
            this.socket.emit(ClientConfig.IO.OUTGOING.CLEAR_UPLOADED_BACKGROUND_IMAGE);
            return;
        }
        const resizedBase64Image = this.canvasView.resizeUploadedBackgroundImageAndBase64(image, imageType);
        this.socket.emit(ClientConfig.IO.OUTGOING.BACKGROUND_IMAGE_UPLOAD, resizedBase64Image);
    }

    canvasClicked(x, y) {
        this.socket.emit(ClientConfig.IO.OUTGOING.CANVAS_CLICKED, x, y);
    }

    // optional resizedBase64Image
    imageUploadCallback(image, imageType, resizedBase64Image) {
        if (!(image && imageType) && !resizedBase64Image) {
            this.socket.emit(ClientConfig.IO.OUTGOING.CLEAR_UPLOADED_IMAGE);
            localStorage.removeItem(ClientConfig.LOCAL_STORAGE.PLAYER_IMAGE);
            return;
        }
        let newResizedBase64Image;
        if (resizedBase64Image) {
            newResizedBase64Image = resizedBase64Image;
        } else {
            newResizedBase64Image = this.canvasView.resizeUploadedImageAndBase64(image, imageType);
        }
        this.socket.emit(ClientConfig.IO.OUTGOING.IMAGE_UPLOAD, newResizedBase64Image);
        localStorage.setItem(ClientConfig.LOCAL_STORAGE.PLAYER_IMAGE, newResizedBase64Image);
    }

    joinGameCallback() {
        this.socket.emit(ClientConfig.IO.OUTGOING.JOIN_GAME);
    }

    keyDownCallback(keyCode) {
        this.socket.emit(ClientConfig.IO.OUTGOING.KEY_DOWN, keyCode);
    }

    muteAudioCallback() {
        this.audioController.toggleMute();
        this.gameView.setMuteStatus(this.audioController.isMuted);
    }

    playerColorChangeCallback() {
        this.socket.emit(ClientConfig.IO.OUTGOING.COLOR_CHANGE);
    }

    playerNameUpdatedCallback(name) {
        this.socket.emit(ClientConfig.IO.OUTGOING.NAME_CHANGE, name);
        localStorage.setItem(ClientConfig.LOCAL_STORAGE.PLAYER_NAME, name);
    }

    spectateGameCallback() {
        this.socket.emit(ClientConfig.IO.OUTGOING.SPECTATE_GAME);
    }

    speedChangeCallback(option) {
        this.socket.emit(ClientConfig.IO.OUTGOING.SPEED_CHANGE, option);
    }

    startLengthChangeCallback(option) {
        this.socket.emit(ClientConfig.IO.OUTGOING.START_LENGTH_CHANGE, option);
    }

    toggleGridLinesCallback() {
        this.canvasView.toggleGridLines();
    }

    handleFullScreenChange(isFullScreen) {
        this.isFullScreen = isFullScreen;
        if (this.canvasView) {
            this.canvasView.updateDisplaySize(isFullScreen);
        }
    }

    /*******************************
     *  socket.io handling methods *
     *******************************/

    _createBoard(board) {
        this.canvasView =
            CanvasFactory.createCanvasView(
                board.SQUARE_SIZE_IN_PIXELS, board.HORIZONTAL_SQUARES, board.VERTICAL_SQUARES, this.canvasClicked.bind(this));
        this.canvasView.clear();
        this.canvasView.updateDisplaySize(this.isFullScreen);
        this.gameView.ready();
        this.renderGame();
    }

    _handleBackgroundImage(backgroundImage) {
        if (backgroundImage) {
            this.canvasView.setBackgroundImage(backgroundImage);
        } else {
            this.canvasView.clearBackgroundImage();
        }
    }

    _handleFoodCollected(text, coordinate, color, isSwap) {
        this.textsToDraw.unshift(new TextToDraw(text, coordinate, color));
        if (isSwap) {
            this.audioController.playSwapSound();
        } else {
            this.audioController.playFoodCollectedSound();
        }
    }

    _handleNewGameData(gameData) {
        this.players = gameData.players;
        this.food = gameData.food;
        this.walls = gameData.walls;
        this.worldBounds = gameData.bounds;
        this.gameView.showFoodAmount(Object.keys(gameData.food).length);
        this.gameView.showSpeed(gameData.speed);
        this.gameView.showStartLength(gameData.startLength);
        this.gameView.showNumberOfBots(gameData.numberOfBots);
        this.gameView.showPlayerStats(gameData.playerStats);
    }


    _calculateCameraSettings(localPlayer) {
        let center = this.lastCameraCenter || { x: 0, y: 0 };
        let zoom = this.lastCameraZoom || 1;

        if (localPlayer && localPlayer.segments && localPlayer.segments.length > 0) {
            center = localPlayer.segments[0];
            zoom = this._calculateZoomForPlayer(localPlayer.segments.length);
        } else if (this.worldBounds && this.canvasView) {
            center = this._getWorldCenter();
            const widthSquares = this.worldBounds.maxX - this.worldBounds.minX + 1;
            const heightSquares = this.worldBounds.maxY - this.worldBounds.minY + 1;
            const fitZoom = this.canvasView.getZoomToFitSquares(widthSquares, heightSquares);
            zoom = this.canvasView.clampZoom(fitZoom * 0.9);
        }

        return { center, zoom };
    }

    _calculateZoomForPlayer(length) {
        if (!this.canvasView) {
            return 1;
        }
        const normalizedLength = Math.max(length, 1);
        const growthFactor = Math.log(normalizedLength);
        const zoomReduction = growthFactor * 0.2;
        const targetZoom = this.canvasView.maxZoom - zoomReduction;
        return this.canvasView.clampZoom(targetZoom);
    }

    _getLocalPlayer() {
        if (!this.socket) {
            return null;
        }
        return this.players.find(player => this._isLocalPlayerId(player.id)) || null;
    }

    _getWorldCenter() {
        if (!this.worldBounds) {
            return this.lastCameraCenter || { x: 0, y: 0 };
        }
        return {
            x: (this.worldBounds.minX + this.worldBounds.maxX) / 2,
            y: (this.worldBounds.minY + this.worldBounds.maxY) / 2,
        };
    }


    _initializeSocketIoHandlers() {
        this.socket.on(ClientConfig.IO.INCOMING.NEW_PLAYER_INFO, this.gameView.updatePlayerName);
        this.socket.on(ClientConfig.IO.INCOMING.BOARD_INFO, this._createBoard.bind(this));
        this.socket.on(ClientConfig.IO.INCOMING.NEW_STATE, this._handleNewGameData.bind(this));
        this.socket.on(ClientConfig.IO.INCOMING.NEW_BACKGROUND_IMAGE, this._handleBackgroundImage.bind(this));
        this.socket.on(ClientConfig.IO.INCOMING.NOTIFICATION.FOOD_COLLECTED, this._handleFoodCollected.bind(this));
        this.socket.on(ClientConfig.IO.INCOMING.NOTIFICATION.GENERAL, this.gameView.showNotification);
        this.socket.on(ClientConfig.IO.INCOMING.NOTIFICATION.KILL, this.gameView.showKillMessage.bind(this.gameView));
        this.socket.on(ClientConfig.IO.INCOMING.NOTIFICATION.KILLED_EACH_OTHER,
            this.gameView.showKilledEachOtherMessage.bind(this.gameView));
        this.socket.on(ClientConfig.IO.INCOMING.NOTIFICATION.RAN_INTO_WALL,
            this.gameView.showRanIntoWallMessage.bind(this.gameView));
        this.socket.on(ClientConfig.IO.INCOMING.NOTIFICATION.SUICIDE, this.gameView.showSuicideMessage.bind(this.gameView));
        this.socket.on(ClientConfig.IO.INCOMING.NOTIFICATION.YOU_DIED,
            this.audioController.playDeathSound.bind(this.audioController));
        this.socket.on(ClientConfig.IO.INCOMING.NOTIFICATION.YOU_MADE_A_KILL,
            this.audioController.playKillSound.bind(this.audioController));
    }

    _isLocalPlayerId(playerId) {
        if (!this.socket || !playerId) {
            return false;
        }
        const socketId = this.socket.id;
        if (!socketId) {
            return false;
        }
        if (playerId === socketId) {
            return true;
        }
        const namespacedSocketId = `/#${socketId}`;
        if (playerId === namespacedSocketId) {
            return true;
        }
        return socketId === `/#${playerId}`;
    }
}
