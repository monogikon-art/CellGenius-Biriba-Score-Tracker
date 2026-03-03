/**
 * Biriba (Μπιρίμπα) Score Tracker
 * Main Application Logic
 */

// ===== BIRIBA SCORING CONSTANTS =====
const BIRIBA_BONUSES = {
    cleanRunPlain:     { label: 'Clean Run (plain)',      labelGr: 'Καθαρή Σειρά',          points: 200,  icon: '🟢' },
    dirtyRunPlain:     { label: 'Dirty Run (plain)',      labelGr: 'Βρώμικη Σειρά',         points: 100,  icon: '🟡' },
    cleanSet:          { label: 'Clean Set (7+ cards)',   labelGr: 'Καθαρό Κουτί',          points: 300,  icon: '🔵' },
    dirtySet:          { label: 'Dirty Set (7+ cards)',   labelGr: 'Βρώμικο Κουτί',         points: 150,  icon: '🟠' },
    cleanRunBonus:     { label: 'Clean Run (bonus suit)', labelGr: 'Καθαρή Σειρά (κόζι)',   points: 400,  icon: '💎' },
    dirtyRunBonus:     { label: 'Dirty Run (bonus suit)', labelGr: 'Βρώμικη Σειρά (κόζι)',  points: 200,  icon: '🔶' },
    cleanFullPlain:    { label: 'Full Biriba (13, plain)',labelGr: 'Πλήρης Μπιρίμπα',       points: 1000, icon: '⭐' },
    dirtyFullPlain:    { label: 'Full Biriba (13, dirty)',labelGr: 'Πλήρης Μπιρίμπα (βρ.)', points: 500,  icon: '🌟' },
    cleanFullBonus:    { label: 'Full Biriba (13, bonus)',labelGr: 'Πλήρης Μπιρίμπα (κόζι)',points: 2000, icon: '👑' },
    dirtyFullBonus:    { label: 'Full Biriba (13, bonus dirty)', labelGr: 'Πλήρης Μπιρίμπα (κόζι βρ.)', points: 1000, icon: '🏆' },
};

// ===== APP STATE =====
const App = {
    currentGame: null,
    settings: { theme: 'dark', lang: 'en' },

    init() {
        this.loadSettings();
        this.applyTheme();
        this.bindEvents();
        this.checkForActiveGame();
    },

    // ===== INITIALIZATION =====

    loadSettings() {
        this.settings = StorageManager.getSettings();
    },

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.settings.theme);
        // Update settings UI
        document.querySelectorAll('[name="theme"]').forEach(r => {
            const card = r.closest('.radio-card');
            if (r.value === this.settings.theme) {
                card.classList.add('active');
                r.checked = true;
            } else {
                card.classList.remove('active');
            }
        });
        document.querySelectorAll('[name="lang"]').forEach(r => {
            const card = r.closest('.radio-card');
            if (r.value === this.settings.lang) {
                card.classList.add('active');
                r.checked = true;
            } else {
                card.classList.remove('active');
            }
        });
    },

    checkForActiveGame() {
        const saved = StorageManager.getCurrentGame();
        if (saved && !saved.completed) {
            this.currentGame = saved;
            const continueBtn = document.getElementById('btn-continue-game');
            continueBtn.style.display = 'inline-flex';
        }
        this.renderRecentGames();
    },

    // ===== EVENT BINDING =====

    bindEvents() {
        // Welcome screen
        document.getElementById('btn-new-game').addEventListener('click', () => this.showScreen('screen-setup'));
        document.getElementById('btn-continue-game').addEventListener('click', () => {
            this.showScreen('screen-game');
            this.renderGame();
        });
        document.getElementById('btn-back-welcome').addEventListener('click', () => this.showScreen('screen-welcome'));

        // Game mode toggle
        document.querySelectorAll('[name="gameMode"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                document.querySelectorAll('.radio-group .radio-card').forEach(c => {
                    if (c.querySelector('[name="gameMode"]')) {
                        c.classList.toggle('active', c.querySelector('[name="gameMode"]').checked);
                    }
                });
                const isTeams = e.target.value === 'teams';
                document.getElementById('teams-setup').style.display = isTeams ? 'block' : 'none';
                document.getElementById('individual-setup').style.display = isTeams ? 'none' : 'block';
            });
        });

        // Player count
        document.querySelectorAll('.count-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.count-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.updatePlayerInputs(parseInt(btn.dataset.count));
            });
        });

        // Target score
        document.querySelectorAll('.target-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.target-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                document.getElementById('custom-target').value = '';
            });
        });

        document.getElementById('custom-target').addEventListener('focus', () => {
            document.querySelectorAll('.target-btn').forEach(b => b.classList.remove('active'));
        });

        // Game setup form
        document.getElementById('game-setup-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.createGame();
        });

        // Game actions
        document.getElementById('btn-add-round').addEventListener('click', () => this.openRoundModal());
        document.getElementById('btn-undo-round').addEventListener('click', () => this.undoLastRound());
        document.getElementById('btn-end-game').addEventListener('click', () => this.endGame());

        // Round modal
        document.getElementById('btn-close-round').addEventListener('click', () => this.closeModal('modal-round'));
        document.getElementById('btn-cancel-round').addEventListener('click', () => this.closeModal('modal-round'));
        document.getElementById('btn-save-round').addEventListener('click', () => this.saveRound());

        // Rules modal
        document.getElementById('btn-rules').addEventListener('click', () => this.openModal('modal-rules'));
        document.getElementById('btn-close-rules').addEventListener('click', () => this.closeModal('modal-rules'));

        // Settings modal
        document.getElementById('btn-settings').addEventListener('click', () => this.openModal('modal-settings'));
        document.getElementById('btn-close-settings').addEventListener('click', () => this.closeModal('modal-settings'));

        // History modal
        document.getElementById('btn-history').addEventListener('click', () => {
            this.renderHistory();
            this.openModal('modal-history');
        });
        document.getElementById('btn-close-history').addEventListener('click', () => this.closeModal('modal-history'));

        // Theme/language toggle
        document.querySelectorAll('[name="theme"]').forEach(r => {
            r.addEventListener('change', (e) => {
                this.settings.theme = e.target.value;
                StorageManager.saveSettings(this.settings);
                this.applyTheme();
            });
        });

        document.querySelectorAll('[name="lang"]').forEach(r => {
            r.addEventListener('change', (e) => {
                document.querySelectorAll('[name="lang"]').forEach(radio => {
                    radio.closest('.radio-card').classList.toggle('active', radio.checked);
                });
                this.settings.lang = e.target.value;
                StorageManager.saveSettings(this.settings);
                if (this.currentGame) this.renderGame();
            });
        });

        // Clear data
        document.getElementById('btn-clear-all-data').addEventListener('click', () => {
            if (confirm('Are you sure you want to delete ALL game data? This cannot be undone.')) {
                StorageManager.clearAllData();
                this.currentGame = null;
                this.showScreen('screen-welcome');
                document.getElementById('btn-continue-game').style.display = 'none';
                this.renderRecentGames();
                this.closeModal('modal-settings');
                this.showToast('All data cleared', 'info');
            }
        });

        // Close modals on overlay click
        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) this.closeModal(overlay.id);
            });
        });

        // Keyboard shortcut
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal-overlay.active').forEach(m => this.closeModal(m.id));
            }
        });
    },

    // ===== SCREEN MANAGEMENT =====

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(screenId).classList.add('active');
    },

    openModal(modalId) {
        document.getElementById(modalId).classList.add('active');
        document.body.style.overflow = 'hidden';
    },

    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
        // Check if any modal still open
        const anyOpen = document.querySelector('.modal-overlay.active');
        if (!anyOpen) document.body.style.overflow = '';
    },

    // ===== GAME SETUP =====

    updatePlayerInputs(count) {
        const container = document.getElementById('player-names');
        container.innerHTML = '';
        for (let i = 1; i <= count; i++) {
            container.innerHTML += `
                <div class="form-group">
                    <label>Player ${i}</label>
                    <input type="text" class="form-input player-name" placeholder="Player ${i} name" maxlength="20">
                </div>
            `;
        }
    },

    createGame() {
        const mode = document.querySelector('[name="gameMode"]:checked').value;
        let players = [];

        if (mode === 'teams') {
            const t1 = document.getElementById('team1-name').value.trim() || 'Team 1';
            const t2 = document.getElementById('team2-name').value.trim() || 'Team 2';
            players = [t1, t2];
        } else {
            const inputs = document.querySelectorAll('.player-name');
            inputs.forEach((input, i) => {
                players.push(input.value.trim() || `Player ${i + 1}`);
            });
        }

        // Get target score
        let target = 5000;
        const activeTarget = document.querySelector('.target-btn.active');
        if (activeTarget) {
            target = parseInt(activeTarget.dataset.target);
        }
        const customTarget = document.getElementById('custom-target').value;
        if (customTarget) {
            target = parseInt(customTarget);
        }

        if (target < 500) target = 500;

        this.currentGame = {
            id: StorageManager.generateId(),
            mode,
            players,
            targetScore: target,
            rounds: [],
            scores: players.map(() => 0),
            completed: false,
            createdAt: new Date().toISOString(),
        };

        StorageManager.saveCurrentGame(this.currentGame);
        this.showScreen('screen-game');
        this.renderGame();
        this.showToast('Game started!', 'success');
    },

    // ===== GAME RENDERING =====

    renderGame() {
        if (!this.currentGame) return;
        this.renderScoreboard();
        this.renderProgressBars();
        this.renderRoundsTable();
        this.updateGameActions();
    },

    renderScoreboard() {
        const board = document.getElementById('scoreboard');
        const players = this.currentGame.players;
        const scores = this.currentGame.scores;
        const maxScore = Math.max(...scores);

        board.className = 'scoreboard' + (players.length === 3 ? ' three-players' : '');
        board.innerHTML = players.map((name, i) => `
            <div class="score-card ${scores[i] === maxScore && scores[i] > 0 ? 'leading' : ''}">
                <div class="team-name">${this.escapeHtml(name)}</div>
                <div class="team-score ${scores[i] < 0 ? 'negative' : ''}">${this.formatNumber(scores[i])}</div>
            </div>
        `).join('');
    },

    renderProgressBars() {
        const container = document.getElementById('target-progress');
        const { players, scores, targetScore } = this.currentGame;

        container.className = 'target-progress' + (players.length === 3 ? ' three-players' : '');
        container.innerHTML = players.map((name, i) => {
            const pct = Math.max(0, Math.min(100, (scores[i] / targetScore) * 100));
            const fillClass = pct > 90 ? 'warning' : pct < 0 ? 'danger' : '';
            return `
                <div class="progress-bar-container">
                    <div class="progress-label">
                        <span>${this.escapeHtml(name)}</span>
                        <span>${Math.round(pct)}% of ${this.formatNumber(targetScore)}</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill ${fillClass}" style="width: ${Math.max(0, pct)}%"></div>
                    </div>
                </div>
            `;
        }).join('');
    },

    renderRoundsTable() {
        const { players, rounds } = this.currentGame;
        const thead = document.getElementById('rounds-thead');
        const tbody = document.getElementById('rounds-tbody');
        const tfoot = document.getElementById('rounds-tfoot');
        const emptyMsg = document.getElementById('empty-rounds');

        if (rounds.length === 0) {
            thead.innerHTML = '';
            tbody.innerHTML = '';
            tfoot.innerHTML = '';
            emptyMsg.style.display = 'block';
            return;
        }

        emptyMsg.style.display = 'none';

        // Header
        thead.innerHTML = `<tr>
            <th>Round</th>
            ${players.map(p => `<th>${this.escapeHtml(p)}</th>`).join('')}
        </tr>`;

        // Body - each round
        let runningTotals = players.map(() => 0);
        tbody.innerHTML = rounds.map((round, rIdx) => {
            return `<tr>
                <td class="round-number">#${rIdx + 1}</td>
                ${round.scores.map((s, pIdx) => {
                    runningTotals[pIdx] += s;
                    return `<td class="${s >= 0 ? 'positive' : 'negative'}">
                        ${s >= 0 ? '+' : ''}${this.formatNumber(s)}
                        <div style="font-size:0.65rem;color:var(--text-muted)">${this.formatNumber(runningTotals[pIdx])}</div>
                    </td>`;
                }).join('')}
            </tr>`;
        }).join('');

        // Footer - totals
        tfoot.innerHTML = `<tr>
            <td>Total</td>
            ${this.currentGame.scores.map(s => `<td>${this.formatNumber(s)}</td>`).join('')}
        </tr>`;
    },

    updateGameActions() {
        const undoBtn = document.getElementById('btn-undo-round');
        undoBtn.disabled = this.currentGame.rounds.length === 0;
    },

    // ===== ROUND MANAGEMENT =====

    openRoundModal() {
        const roundNum = this.currentGame.rounds.length + 1;
        document.getElementById('round-number').textContent = `#${roundNum}`;

        const container = document.getElementById('round-form-container');
        const isGr = this.settings.lang === 'gr';

        container.innerHTML = this.currentGame.players.map((name, pIdx) => {
            return `
                <div class="round-team-section" data-player-index="${pIdx}">
                    <h4>${this.escapeHtml(name)}</h4>

                    <div class="score-input-group">
                        <label>${isGr ? 'Πόντοι τραπεζιού' : 'Melded cards points'}
                            <span class="info-icon" title="Sum of card values from melds on the table">ℹ️</span>
                        </label>
                        <input type="number" class="meld-points" value="0" min="0" step="5">
                    </div>

                    <div class="score-input-group">
                        <label>${isGr ? 'Πόντοι χεριού (αφαιρούνται)' : 'Cards in hand (subtracted)'}
                            <span class="info-icon" title="Sum of card values remaining in hand - counted as negative">ℹ️</span>
                        </label>
                        <input type="number" class="hand-points" value="0" min="0" step="5">
                    </div>

                    <div class="checkbox-group">
                        <input type="checkbox" id="went-out-${pIdx}" class="went-out">
                        <label for="went-out-${pIdx}">${isGr ? 'Έκλεισε (+100)' : 'Went out (+100)'}</label>
                    </div>

                    <div class="checkbox-group">
                        <input type="checkbox" id="no-biribaki-${pIdx}" class="no-biribaki">
                        <label for="no-biribaki-${pIdx}">${isGr ? 'Δεν πήρε μπιριμπάκι (−100)' : 'Didn\'t pick up biribaki (−100)'}</label>
                    </div>

                    <div class="biriba-section">
                        <h5>${isGr ? 'Μπιρίμπες' : 'Biribas'}</h5>
                        ${Object.entries(BIRIBA_BONUSES).map(([key, val]) => `
                            <div class="biriba-counter" data-key="${key}" data-points="${val.points}">
                                <div>
                                    <span class="biriba-label">${val.icon} ${isGr ? val.labelGr : val.label}</span>
                                    <span class="biriba-points">(${val.points} pts)</span>
                                </div>
                                <div class="counter-controls">
                                    <button type="button" class="counter-btn counter-minus">−</button>
                                    <span class="counter-value">0</span>
                                    <button type="button" class="counter-btn counter-plus">+</button>
                                </div>
                            </div>
                        `).join('')}
                    </div>

                    <div class="round-subtotal">
                        <label>${isGr ? 'Σύνολο γύρου' : 'Round subtotal'}</label>
                        <span class="subtotal-value">0</span>
                    </div>
                </div>
            `;
        }).join('');

        // Bind counter buttons and recalculate
        container.querySelectorAll('.counter-minus').forEach(btn => {
            btn.addEventListener('click', () => {
                const valEl = btn.parentElement.querySelector('.counter-value');
                const val = parseInt(valEl.textContent);
                if (val > 0) {
                    valEl.textContent = val - 1;
                    this.recalcRoundSubtotal(btn.closest('.round-team-section'));
                }
            });
        });

        container.querySelectorAll('.counter-plus').forEach(btn => {
            btn.addEventListener('click', () => {
                const valEl = btn.parentElement.querySelector('.counter-value');
                valEl.textContent = parseInt(valEl.textContent) + 1;
                this.recalcRoundSubtotal(btn.closest('.round-team-section'));
            });
        });

        // Bind inputs for recalc
        container.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', () => {
                this.recalcRoundSubtotal(input.closest('.round-team-section'));
            });
            input.addEventListener('change', () => {
                this.recalcRoundSubtotal(input.closest('.round-team-section'));
            });
        });

        this.openModal('modal-round');
    },

    recalcRoundSubtotal(section) {
        const meld = parseInt(section.querySelector('.meld-points').value) || 0;
        const hand = parseInt(section.querySelector('.hand-points').value) || 0;
        const wentOut = section.querySelector('.went-out').checked ? 100 : 0;
        const noBiribaki = section.querySelector('.no-biribaki').checked ? -100 : 0;

        let biribaTotal = 0;
        section.querySelectorAll('.biriba-counter').forEach(counter => {
            const count = parseInt(counter.querySelector('.counter-value').textContent);
            const pts = parseInt(counter.dataset.points);
            biribaTotal += count * pts;
        });

        const total = meld - hand + wentOut + noBiribaki + biribaTotal;
        const subtotalEl = section.querySelector('.subtotal-value');
        subtotalEl.textContent = this.formatNumber(total);
        subtotalEl.className = 'subtotal-value' + (total < 0 ? ' negative' : '');
    },

    saveRound() {
        const sections = document.querySelectorAll('.round-team-section');
        const roundScores = [];
        const roundDetails = [];

        sections.forEach((section, pIdx) => {
            const meld = parseInt(section.querySelector('.meld-points').value) || 0;
            const hand = parseInt(section.querySelector('.hand-points').value) || 0;
            const wentOut = section.querySelector('.went-out').checked;
            const noBiribaki = section.querySelector('.no-biribaki').checked;

            const biribas = {};
            let biribaTotal = 0;
            section.querySelectorAll('.biriba-counter').forEach(counter => {
                const key = counter.dataset.key;
                const count = parseInt(counter.querySelector('.counter-value').textContent);
                if (count > 0) {
                    biribas[key] = count;
                    biribaTotal += count * parseInt(counter.dataset.points);
                }
            });

            const total = meld - hand + (wentOut ? 100 : 0) + (noBiribaki ? -100 : 0) + biribaTotal;
            roundScores.push(total);
            roundDetails.push({ meld, hand, wentOut, noBiribaki, biribas, biribaTotal, total });
        });

        // Add round
        this.currentGame.rounds.push({
            scores: roundScores,
            details: roundDetails,
            timestamp: new Date().toISOString(),
        });

        // Update totals
        this.currentGame.scores = this.currentGame.scores.map((s, i) => s + roundScores[i]);

        // Save
        StorageManager.saveCurrentGame(this.currentGame);

        this.closeModal('modal-round');
        this.renderGame();
        this.showToast(`Round #${this.currentGame.rounds.length} saved!`, 'success');

        // Check for game over
        this.checkGameOver();
    },

    undoLastRound() {
        if (this.currentGame.rounds.length === 0) return;
        if (!confirm('Undo the last round?')) return;

        const lastRound = this.currentGame.rounds.pop();
        this.currentGame.scores = this.currentGame.scores.map((s, i) => s - lastRound.scores[i]);

        StorageManager.saveCurrentGame(this.currentGame);
        this.renderGame();
        this.showToast('Last round undone', 'info');
    },

    checkGameOver() {
        const { scores, targetScore, players } = this.currentGame;
        const qualifiers = scores.filter(s => s > targetScore);

        if (qualifiers.length > 0) {
            // Game is over
            const maxScore = Math.max(...scores);
            const winnerIdx = scores.indexOf(maxScore);
            this.currentGame.completed = true;
            this.currentGame.winner = players[winnerIdx];
            this.currentGame.winnerScore = maxScore;

            StorageManager.saveCurrentGame(this.currentGame);
            StorageManager.saveGameToHistory(this.currentGame);
            StorageManager.clearCurrentGame();

            this.renderGameOver(winnerIdx);
        }
    },

    renderGameOver(winnerIdx) {
        const { players, scores, targetScore, winner, winnerScore, rounds } = this.currentGame;
        const content = document.getElementById('gameover-content');

        content.innerHTML = `
            <div class="trophy">🏆</div>
            <h2>Game Over!</h2>
            <div class="winner-name">${this.escapeHtml(winner)} wins!</div>
            <div class="winner-score">${this.formatNumber(winnerScore)} points</div>
            <p style="color: var(--text-muted); margin-bottom: 24px;">${rounds.length} rounds played • Target: ${this.formatNumber(targetScore)}</p>
            <div class="final-scores">
                ${players.map((name, i) => `
                    <div class="final-score-item ${i === winnerIdx ? 'winner' : ''}">
                        <div class="fs-name">${i === winnerIdx ? '👑 ' : ''}${this.escapeHtml(name)}</div>
                        <div class="fs-score">${this.formatNumber(scores[i])}</div>
                    </div>
                `).join('')}
            </div>
            <div class="gameover-actions">
                <button class="btn btn-primary btn-lg" onclick="App.newGameFromOver()">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    New Game
                </button>
                <button class="btn btn-secondary btn-lg" onclick="App.rematchFromOver()">
                    🔄 Rematch
                </button>
                <button class="btn btn-ghost" onclick="App.showScreen('screen-welcome')">Home</button>
            </div>
        `;

        this.showScreen('screen-gameover');
    },

    newGameFromOver() {
        this.currentGame = null;
        document.getElementById('btn-continue-game').style.display = 'none';
        this.showScreen('screen-setup');
    },

    rematchFromOver() {
        // Start a new game with same players and settings
        const { mode, players, targetScore } = this.currentGame;
        this.currentGame = {
            id: StorageManager.generateId(),
            mode,
            players: [...players],
            targetScore,
            rounds: [],
            scores: players.map(() => 0),
            completed: false,
            createdAt: new Date().toISOString(),
        };
        StorageManager.saveCurrentGame(this.currentGame);
        this.showScreen('screen-game');
        this.renderGame();
        this.showToast('Rematch started!', 'success');
    },

    endGame() {
        if (!confirm('End the current game? It will be saved to history.')) return;
        
        this.currentGame.completed = true;
        const maxScore = Math.max(...this.currentGame.scores);
        const winnerIdx = this.currentGame.scores.indexOf(maxScore);
        this.currentGame.winner = this.currentGame.players[winnerIdx];
        this.currentGame.winnerScore = maxScore;

        StorageManager.saveGameToHistory(this.currentGame);
        StorageManager.clearCurrentGame();

        this.renderGameOver(winnerIdx);
    },

    // ===== HISTORY =====

    renderRecentGames() {
        const history = StorageManager.getGameHistory();
        const listContainer = document.getElementById('recent-games-list');
        const list = listContainer.querySelector('.games-list');

        if (history.length === 0) {
            listContainer.style.display = 'none';
            return;
        }

        listContainer.style.display = 'block';
        list.innerHTML = history.slice(0, 5).map(game => {
            const dateStr = new Date(game.completedAt || game.createdAt).toLocaleDateString();
            const teamsStr = game.players.join(' vs ');
            const scoreStr = game.scores.join(' - ');
            return `
                <div class="game-history-item">
                    <div class="game-info">
                        <div class="game-teams">${this.escapeHtml(teamsStr)}</div>
                        <div class="game-date">${dateStr} • ${game.rounds.length} rounds</div>
                    </div>
                    <div class="game-score">${scoreStr}</div>
                </div>
            `;
        }).join('');
    },

    renderHistory() {
        const history = StorageManager.getGameHistory();
        const content = document.getElementById('history-content');

        if (history.length === 0) {
            content.innerHTML = '<div class="history-empty"><p>No games played yet.</p></div>';
            return;
        }

        content.innerHTML = history.map(game => {
            const dateStr = new Date(game.completedAt || game.createdAt).toLocaleString();
            const teamsStr = game.players.join(' vs ');
            const scoreStr = game.scores.join(' - ');
            const winnerStr = game.winner ? `🏆 ${game.winner}` : '';
            const statusStr = game.completed ? '' : '<span class="hi-status">In Progress</span>';

            return `
                <div class="history-item">
                    <div class="hi-info">
                        <div class="hi-teams">${this.escapeHtml(teamsStr)}</div>
                        <div class="hi-date">${dateStr} • ${game.rounds.length} rounds</div>
                    </div>
                    <div class="hi-result">
                        <div class="hi-score">${scoreStr}</div>
                        <div class="hi-winner">${winnerStr}</div>
                        ${statusStr}
                    </div>
                    <div class="history-actions">
                        <button class="btn btn-icon btn-sm" title="Delete" onclick="App.deleteHistoryGame('${game.id}')">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-danger)" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    },

    deleteHistoryGame(gameId) {
        if (!confirm('Delete this game from history?')) return;
        StorageManager.deleteGameFromHistory(gameId);
        this.renderHistory();
        this.renderRecentGames();
        this.showToast('Game deleted', 'info');
    },

    // ===== UTILITIES =====

    formatNumber(num) {
        return num.toLocaleString();
    },

    escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        const icons = { success: '✓', error: '✗', info: 'ℹ' };
        toast.innerHTML = `<span>${icons[type] || ''}</span> ${message}`;
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },
};

// ===== INITIALIZE =====
document.addEventListener('DOMContentLoaded', () => App.init());
