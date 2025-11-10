'use strict';
const ValidationService = require('../services/validation-service');

/**
 * Image-related actions
 */
class ImageService {

    constructor(playerContainer, playerStatBoard, notificationService) {
        this.playerContainer = playerContainer;
        this.playerStatBoard = playerStatBoard;
        this.notificationService = notificationService;
        this.backgroundImage = false;
    }

    clearBackgroundImage(playerId) {
        if (this.backgroundImage) {
            const player = this.playerContainer.getPlayer(playerId);
            this.backgroundImage = false;
            this.notificationService.broadcastClearBackgroundImage();
            this.notificationService.broadcastNotification(`${player.name} removeu a imagem de fundo.`, player.color);
        }
    }

    clearPlayerImage(playerId) {
        const player = this.playerContainer.getPlayer(playerId);
        delete player.base64Image;
        this.playerStatBoard.clearPlayerImage(player.id);
        this.notificationService.broadcastNotification(`${player.name} removeu sua imagem.`, player.color);
    }

    updateBackgroundImage(playerId, base64Image) {
        const player = this.playerContainer.getPlayer(playerId);
        if (!ValidationService.isValidBase64DataURI(base64Image)) {
            console.log(`${player.name} tentou enviar uma imagem de fundo inválida`);
            return;
        }
        this.backgroundImage = base64Image;
        this.notificationService.broadcastNewBackgroundImage(this.backgroundImage);
        this.notificationService.broadcastNotification(`${player.name} atualizou a imagem de fundo.`, player.color);
    }

    updatePlayerImage(playerId, base64Image) {
        const player = this.playerContainer.getPlayer(playerId);
        if (!ValidationService.isValidBase64DataURI(base64Image)) {
            console.log(`${player.name} tentou enviar uma imagem inválida do jogador`);
            return;
        }
        player.setBase64Image(base64Image);
        this.playerStatBoard.setBase64Image(player.id, base64Image);
        this.notificationService.broadcastNotification(`${player.name} enviou uma nova imagem.`, player.color);
    }

    getBackgroundImage() {
        return this.backgroundImage;
    }

    resetBackgroundImage() {
        this.backgroundImage = false;
    }
}

module.exports = ImageService;
