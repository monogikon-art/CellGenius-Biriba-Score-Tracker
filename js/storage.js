/**
 * Biriba Score Tracker - Local Storage Manager
 * Persists game data in the browser's localStorage
 */

const StorageManager = {
    KEYS: {
        CURRENT_GAME: 'biriba_current_game',
        GAME_HISTORY: 'biriba_game_history',
        SETTINGS: 'biriba_settings',
    },

    // ===== Current Game =====

    saveCurrentGame(game) {
        try {
            localStorage.setItem(this.KEYS.CURRENT_GAME, JSON.stringify(game));
            return true;
        } catch (e) {
            console.error('Failed to save current game:', e);
            return false;
        }
    },

    getCurrentGame() {
        try {
            const data = localStorage.getItem(this.KEYS.CURRENT_GAME);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Failed to load current game:', e);
            return null;
        }
    },

    clearCurrentGame() {
        localStorage.removeItem(this.KEYS.CURRENT_GAME);
    },

    // ===== Game History =====

    getGameHistory() {
        try {
            const data = localStorage.getItem(this.KEYS.GAME_HISTORY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('Failed to load game history:', e);
            return [];
        }
    },

    saveGameToHistory(game) {
        try {
            const history = this.getGameHistory();
            // Add timestamp and unique ID
            const completedGame = {
                ...game,
                id: game.id || this.generateId(),
                completedAt: new Date().toISOString(),
            };
            history.unshift(completedGame); // Most recent first
            // Keep only last 50 games
            if (history.length > 50) history.length = 50;
            localStorage.setItem(this.KEYS.GAME_HISTORY, JSON.stringify(history));
            return true;
        } catch (e) {
            console.error('Failed to save game history:', e);
            return false;
        }
    },

    deleteGameFromHistory(gameId) {
        try {
            let history = this.getGameHistory();
            history = history.filter(g => g.id !== gameId);
            localStorage.setItem(this.KEYS.GAME_HISTORY, JSON.stringify(history));
            return true;
        } catch (e) {
            console.error('Failed to delete game from history:', e);
            return false;
        }
    },

    // ===== Settings =====

    getSettings() {
        try {
            const data = localStorage.getItem(this.KEYS.SETTINGS);
            return data ? JSON.parse(data) : { theme: 'dark', lang: 'en' };
        } catch (e) {
            return { theme: 'dark', lang: 'en' };
        }
    },

    saveSettings(settings) {
        try {
            localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(settings));
            return true;
        } catch (e) {
            return false;
        }
    },

    // ===== Utilities =====

    clearAllData() {
        Object.values(this.KEYS).forEach(key => localStorage.removeItem(key));
    },

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    },

    // Export all data as JSON
    exportData() {
        return JSON.stringify({
            currentGame: this.getCurrentGame(),
            history: this.getGameHistory(),
            settings: this.getSettings(),
            exportedAt: new Date().toISOString(),
        }, null, 2);
    },

    // Import data from JSON
    importData(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            if (data.currentGame) this.saveCurrentGame(data.currentGame);
            if (data.history) {
                localStorage.setItem(this.KEYS.GAME_HISTORY, JSON.stringify(data.history));
            }
            if (data.settings) this.saveSettings(data.settings);
            return true;
        } catch (e) {
            console.error('Failed to import data:', e);
            return false;
        }
    }
};
