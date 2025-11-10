/**
 * DOM manipulation helper
 */
export default class DomHelper {
    static blurActiveElement() {
        document.activeElement.blur();
    }

    static clearKillMessagesDivText() {
        this.setKillMessagesDivText('');
    }

    static createElement(elementName) {
        return document.createElement(elementName);
    }

    static getBackgroundImageUploadElement() {
        return document.getElementById('background-image-upload');
    }

    static getAdminControlsButton() {
        return document.getElementById('admin-controls-button');
    }

    static getAdminControlsModal() {
        return document.getElementById('admin-controls-modal');
    }

    static getAdminControlsCloseButton() {
        return document.getElementById('admin-controls-close-button');
    }

    static getAdminControlsBackdrop() {
        return document.getElementById('admin-controls-backdrop');
    }

    static getAdminControlsUnlockButton() {
        return document.getElementById('admin-controls-unlock-button');
    }

    static getAdminControlsPasswordInput() {
        return document.getElementById('admin-controls-password');
    }

    static getAdminControlsPasswordFeedback() {
        return document.getElementById('admin-controls-password-feedback');
    }

    static getAdminControlsLock() {
        return document.getElementById('admin-controls-lock');
    }

    static getAdminControlsContent() {
        return document.getElementById('admin-controls-content');
    }

    static getAdminControlsNavLinks() {
        return document.querySelectorAll('#admin-controls-modal .player-settings__nav-link');
    }

    static getAdminControlButtons() {
        return document.querySelectorAll('#admin-controls-content [data-admin-control]');
    }

    static getBody() {
        return document.body;
    }

    static isFullScreen() {
        return Boolean(document.fullscreenElement ||
            document.mozFullScreenElement ||
            document.webkitFullscreenElement ||
            document.msFullscreenElement ||
            document.fullScreenElement ||
            document.mozFullScreen ||
            document.webkitIsFullScreen);
    }

    static getClearUploadedBackgroundImageButton() {
        return document.getElementById('clearUploadedBackgroundImageButton');
    }

    static getClearUploadedImageButton() {
        return document.getElementById('clearUploadedImageButton');
    }

    static getChangeColorButton() {
        return document.getElementById('changePlayerColorButton');
    }

    static getChangeNameButton() {
        return document.getElementById('changePlayerNameButton');
    }

    static getDecreaseBotsButton() {
        return document.getElementById('decreaseBotsButton');
    }

    static getDecreaseFoodButton() {
        return document.getElementById('decreaseFoodButton');
    }

    static getDecreaseSpeedButton() {
        return document.getElementById('decreaseSpeedButton');
    }

    static getDecreaseStartLengthButton() {
        return document.getElementById('decreaseStartLengthButton');
    }

    static getFullScreenButton() {
        return document.getElementById('full-screen-button');
    }

    static getGameBoardDiv() {
        return document.getElementById('game-board');
    }

    static getImageUploadElement() {
        return document.getElementById('image-upload');
    }

    static getIncreaseBotsButton() {
        return document.getElementById('increaseBotsButton');
    }

    static getIncreaseFoodButton() {
        return document.getElementById('increaseFoodButton');
    }

    static getIncreaseSpeedButton() {
        return document.getElementById('increaseSpeedButton');
    }

    static getIncreaseStartLengthButton() {
        return document.getElementById('increaseStartLengthButton');
    }

    static getNotificationsDiv() {
        return document.getElementById('notifications');
    }

    static getPresetSkinListElement() {
        return document.getElementById('preset-skin-list');
    }

    static getPlayerNameElement() {
        return document.getElementById('player-name');
    }

    static getPlayerSettingsButton() {
        return document.getElementById('player-settings-button');
    }

    static getPlayerSettingsModal() {
        return document.getElementById('player-settings-modal');
    }

    static getPlayerSettingsCloseButton() {
        return document.getElementById('player-settings-close-button');
    }

    static getPlayerSettingsBackdrop() {
        return document.getElementById('player-settings-backdrop');
    }

    static getPlayOrWatchButton() {
        return document.getElementById('play-or-watch-button');
    }

    static getResetBotsButton() {
        return document.getElementById('resetBotsButton');
    }

    static getResetFoodButton() {
        return document.getElementById('resetFoodButton');
    }

    static getResetSpeedButton() {
        return document.getElementById('resetSpeedButton');
    }

    static getResetStartLengthButton() {
        return document.getElementById('resetStartLengthButton');
    }

    static getToggleGridLinesButton() {
        return document.getElementById('toggleGridLinesButton');
    }

    static getToggleSoundButton() {
        return document.getElementById('toggleSoundButton');
    }

    static getVolumeSlider() {
        return document.getElementById('volumeSlider');
    }

    static hideInvalidPlayerNameLabel() {
        document.getElementById('invalid-player-name-label').style.display = 'none';
    }

    static setChangeNameButtonText(text) {
        this.getChangeNameButton().innerHTML = text;
    }

    static setAdminControlsPasswordValue(value) {
        const input = this.getAdminControlsPasswordInput();
        if (input) {
            input.value = value;
        }
    }

    static setCurrentFoodAmountLabelText(text) {
        document.getElementById('currentFoodAmount').innerHTML = text;
    }

    static setCurrentNumberOfBotsLabelText(text) {
        document.getElementById('currentNumberOfBots').innerHTML = text;
    }

    static setCurrentSpeedLabelText(text) {
        document.getElementById('currentSpeed').innerHTML = text;
    }


    static setCurrentStartLengthLabelText(text) {
        document.getElementById('currentStartLength').innerHTML = text;
    }

    static setKillMessagesDivText(text) {
        document.getElementById('kill-messages').innerHTML = text;
    }

    static setPlayerNameElementColor(color) {
        this.getPlayerNameElement().style.color = color;
    }

    static setPlayerNameElementReadOnly(readOnly) {
        this.getPlayerNameElement().readOnly = readOnly;
    }

    static setPlayerNameElementValue(value) {
        this.getPlayerNameElement().value = value;
    }

    static setPlayerStatsDivText(text) {
        document.getElementById('player-stats').innerHTML = text;
    }

    static setToggleSoundButtonText(text) {
        this.getToggleSoundButton().textContent = text;
    }

    static setPlayOrWatchButtonText(text) {
        this.getPlayOrWatchButton().textContent = text;
    }

    static showAllContent() {
        document.getElementById('cover').style.visibility = 'visible';
    }

    static showInvalidPlayerNameLabel() {
        document.getElementById('invalid-player-name-label').style.display = 'inline';
    }

    static showPlayerSettingsModal() {
        const modal = this.getPlayerSettingsModal();
        if (!modal) {
            return;
        }
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        this.getBody().classList.add('modal-open');
    }

    static hidePlayerSettingsModal() {
        const modal = this.getPlayerSettingsModal();
        if (!modal) {
            return;
        }
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        this.getBody().classList.remove('modal-open');
    }

    static showAdminControlsModal() {
        const modal = this.getAdminControlsModal();
        if (!modal) {
            return;
        }
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        this.getBody().classList.add('modal-open');
    }

    static hideAdminControlsModal() {
        const modal = this.getAdminControlsModal();
        if (!modal) {
            return;
        }
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        this.getBody().classList.remove('modal-open');
    }

    static hideAdminControlsPasswordFeedback() {
        const feedback = this.getAdminControlsPasswordFeedback();
        if (feedback) {
            feedback.style.display = 'none';
        }
    }

    static showAdminControlsPasswordFeedback() {
        const feedback = this.getAdminControlsPasswordFeedback();
        if (feedback) {
            feedback.style.display = 'inline';
        }
    }

    static showAdminControlsLock() {
        const lock = this.getAdminControlsLock();
        if (lock) {
            lock.hidden = false;
        }
    }

    static hideAdminControlsLock() {
        const lock = this.getAdminControlsLock();
        if (lock) {
            lock.hidden = true;
        }
    }

    static setAdminControlsInteractive(isEnabled) {
        const navLinks = this.getAdminControlsNavLinks();
        for (const link of navLinks) {
            if (isEnabled) {
                link.classList.remove('is-disabled');
                link.setAttribute('tabindex', '0');
                link.setAttribute('aria-disabled', 'false');
            } else {
                link.classList.add('is-disabled');
                link.setAttribute('tabindex', '-1');
                link.setAttribute('aria-disabled', 'true');
            }
        }

        const buttons = this.getAdminControlButtons();
        for (const control of buttons) {
            if (control instanceof HTMLButtonElement) {
                control.disabled = !isEnabled;
                control.setAttribute('aria-disabled', String(!isEnabled));
            } else {
                control.setAttribute('aria-disabled', String(!isEnabled));
            }
        }

        const content = this.getAdminControlsContent();
        if (content) {
            if (isEnabled) {
                content.removeAttribute('aria-hidden');
            } else {
                content.setAttribute('aria-hidden', 'true');
            }
        }
    }

    static registerFullScreenChangeHandler(callback) {
        this.fullScreenChangeCallback = callback;
        if (!this.fullScreenChangeHandler) {
            const handler = () => {
                const isFullScreen = this.isFullScreen();
                this.getBody().classList.toggle('is-fullscreen', isFullScreen);
                if (this.fullScreenChangeCallback) {
                    this.fullScreenChangeCallback(isFullScreen);
                }
            };
            ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange']
                .forEach(eventName => {
                    document.addEventListener(eventName, handler);
                });
            this.fullScreenChangeHandler = handler;
        }

        if (this.fullScreenChangeHandler) {
            this.fullScreenChangeHandler();
        }
    }

    static toggleFullScreenMode() {
        if (!this.isFullScreen()) {
            const element = document.documentElement;
            if (element.requestFullscreen) {
                element.requestFullscreen();
            } else if (element.mozRequestFullScreen) {
                element.mozRequestFullScreen();
            } else if (element.webkitRequestFullScreen) {
                element.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
            } else if (element.msRequestFullscreen) {
                element.msRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.cancelFullScreen) {
                document.cancelFullScreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitCancelFullScreen) {
                document.webkitCancelFullScreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }
    }
}

DomHelper.fullScreenChangeHandler = null;
DomHelper.fullScreenChangeCallback = null;
