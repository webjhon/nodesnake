'use strict';
const ServerConfig = require('../configs/server-config');

/**
 * Admin-specific functionality
 */
class AdminService {

    constructor(playerContainer, foodService, nameService, notificationService, playerService) {
        this.playerContainer = playerContainer;
        this.foodService = foodService;
        this.nameService = nameService;
        this.notificationService = notificationService;
        this.playerService = playerService;

        this.playerStartLength = ServerConfig.PLAYER_STARTING_LENGTH;
        this.currentFPS = ServerConfig.STARTING_FPS;
        this.botIds = [];
    }

    changeBots(playerId, botOption) {
        const player = this.playerContainer.getPlayer(playerId);
        if (botOption === ServerConfig.INCREMENT_CHANGE.INCREASE) {
            this._addBot(player);
        } else if (botOption === ServerConfig.INCREMENT_CHANGE.DECREASE) {
            this._removeBot(player);
        } else if (botOption === ServerConfig.INCREMENT_CHANGE.RESET) {
            this._resetBots(player);
        }
    }

    changeFood(playerId, foodOption) {
        const player = this.playerContainer.getPlayer(playerId);
        let notification = player.name;
        if (foodOption === ServerConfig.INCREMENT_CHANGE.INCREASE) {
            this.foodService.generateSingleFood();
            notification += ' adicionou comida.';
        } else if (foodOption === ServerConfig.INCREMENT_CHANGE.DECREASE) {
            if (this.foodService.getFoodAmount() > 0) {
                this._removeLastFood();
                notification += ' removeu comida.';
            } else {
                notification += ' não conseguiu remover comida.';
            }
        } else if (foodOption === ServerConfig.INCREMENT_CHANGE.RESET) {
            this._resetFood();
            notification += ' redefiniu a quantidade de comida.';
        }
        this.notificationService.broadcastNotification(notification, player.color);
    }

    changeSpeed(playerId, speedOption) {
        const player = this.playerContainer.getPlayer(playerId);
        let notification = player.name;
        if (speedOption === ServerConfig.INCREMENT_CHANGE.INCREASE) {
            if (this.currentFPS < ServerConfig.MAX_FPS) {
                notification += ' aumentou a velocidade do jogo.';
                this.currentFPS++;
            } else {
                notification += ' tentou aumentar a velocidade do jogo além do limite.';
            }
        } else if (speedOption === ServerConfig.INCREMENT_CHANGE.DECREASE) {
            if (this.currentFPS > ServerConfig.MIN_FPS) {
                notification += ' diminuiu a velocidade do jogo.';
                this.currentFPS--;
            } else {
                notification += ' tentou diminuir a velocidade do jogo além do limite.';
            }
        } else if (speedOption === ServerConfig.INCREMENT_CHANGE.RESET) {
            this._resetSpeed();
            notification += ' redefiniu a velocidade do jogo.';
        }
        this.notificationService.broadcastNotification(notification, player.color);
    }

    changeStartLength(playerId, lengthOption) {
        const player = this.playerContainer.getPlayer(playerId);
        let notification = player.name;
        if (lengthOption === ServerConfig.INCREMENT_CHANGE.INCREASE) {
            notification += ' aumentou o tamanho inicial dos jogadores.';
            this.playerStartLength++;
        } else if (lengthOption === ServerConfig.INCREMENT_CHANGE.DECREASE) {
            if (this.playerStartLength > 1) {
                notification += ' diminuiu o tamanho inicial dos jogadores.';
                this.playerStartLength--;
            } else {
                notification += ' tentou diminuir o tamanho inicial dos jogadores além do limite.';
            }
        } else if (lengthOption === ServerConfig.INCREMENT_CHANGE.RESET) {
            this._resetPlayerStartLength();
            notification += ' redefiniu o tamanho inicial dos jogadores.';
        }
        this.notificationService.broadcastNotification(notification, player.color);
    }

    getBotIds() {
        return this.botIds;
    }

    getGameSpeed() {
        return this.currentFPS;
    }

    getPlayerStartLength() {
        return this.playerStartLength;
    }

    resetGame() {
        this._resetBots();
        this._resetFood();
        this._resetSpeed();
        this._resetPlayerStartLength();
    }

    _addBot(playerRequestingAddition) {
        if (this.botIds.length >= ServerConfig.MAX_BOTS) {
            this.notificationService.broadcastNotification(
                `${playerRequestingAddition.name} tentou adicionar um bot além do limite.`, playerRequestingAddition.color);
            return;
        }
        const newBotId = this.nameService.getBotId();
        const newBot = this.playerService.createPlayer(newBotId, newBotId);
        this.notificationService.broadcastNotification(`${newBot.name} entrou no jogo!`, newBot.color);
        this.botIds.push(newBot.id);
    }

    _removeBot(playerRequestingRemoval) {
        if (this.botIds.length > 0) {
            this.playerService.disconnectPlayer(this.botIds.pop());
        } else {
            this.notificationService.broadcastNotification(
                `${playerRequestingRemoval.name} tentou remover um bot que não existe.`, playerRequestingRemoval.color);
        }
    }

    _resetBots(player) {
        while (this.botIds.length > ServerConfig.DEFAULT_STARTING_BOTS) {
            this._removeBot(player);
        }
    }

    _removeLastFood() {
        this.foodService.removeFood(this.foodService.getLastFoodIdSpawned());
    }

    _resetFood() {
        while (this.foodService.getFoodAmount() > ServerConfig.FOOD.DEFAULT_AMOUNT) {
            this._removeLastFood();
        }
        while (this.foodService.getFoodAmount() < ServerConfig.FOOD.DEFAULT_AMOUNT) {
            this.foodService.generateSingleFood();
        }
    }

    _resetPlayerStartLength() {
        this.playerStartLength = ServerConfig.PLAYER_STARTING_LENGTH;
    }

    _resetSpeed() {
        this.currentFPS = ServerConfig.STARTING_FPS;
    }
}

module.exports = AdminService;
