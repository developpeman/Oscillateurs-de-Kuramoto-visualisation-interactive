/**
 * Application State Manager
 * Centralized state management for the Kuramoto visualization
 */

export class AppState {
    constructor() {
        // Simulation parameters
        this.N = 16;              // Number of oscillators
        this.K = 1.0;             // Coupling strength
        this.dt = 0.02;           // Base time step
        this.speedMultiplier = 1.0;

        // Animation state
        this.running = false;
        this.time = 0;

        // Current mode (1-4)
        this.mode = 1;

        // Frequency type
        this.frequencyType = 'identical';

        // K sweep state
        this.sweeping = false;
        this.sweepDirection = 0;  // 1 = up, -1 = down
        this.sweepSpeed = 0.005;

        // History for graphs
        this.rHistory = [];          // r(t) values
        this.maxHistoryLength = 500;

        // Hysteresis data
        this.hysteresisUp = [];      // {K, r} pairs for K increasing
        this.hysteresisDown = [];    // {K, r} pairs for K decreasing

        // Experiment results
        this.experimentResults = null;

        // Callbacks
        this.onStateChange = null;
    }

    /**
     * Set running state
     */
    setRunning(running) {
        this.running = running;
        this.notifyChange('running');
    }

    /**
     * Toggle running state
     */
    toggleRunning() {
        this.running = !this.running;
        this.notifyChange('running');
        return this.running;
    }

    /**
     * Set coupling K
     */
    setK(K) {
        this.K = Math.max(0, Math.min(5, K));
        this.notifyChange('K');
    }

    /**
     * Set mode (1-4)
     */
    setMode(mode) {
        this.mode = mode;
        this.notifyChange('mode');
    }

    /**
     * Set frequency type
     */
    setFrequencyType(type) {
        this.frequencyType = type;
        this.notifyChange('frequencyType');
    }

    /**
     * Set speed multiplier
     */
    setSpeed(multiplier) {
        this.speedMultiplier = Math.max(0.25, Math.min(4, multiplier));
        this.notifyChange('speed');
    }

    /**
     * Start K sweep
     */
    startSweep(direction) {
        this.sweeping = true;
        this.sweepDirection = direction;

        // Clear appropriate hysteresis array
        if (direction > 0) {
            this.hysteresisUp = [];
        } else {
            this.hysteresisDown = [];
        }

        this.notifyChange('sweep');
    }

    /**
     * Stop K sweep
     */
    stopSweep() {
        this.sweeping = false;
        this.sweepDirection = 0;
        this.notifyChange('sweep');
    }

    /**
     * Update K during sweep
     */
    updateSweep() {
        if (!this.sweeping) return false;

        this.K += this.sweepDirection * this.sweepSpeed;

        // Check bounds
        if (this.K <= 0) {
            this.K = 0;
            this.stopSweep();
        } else if (this.K >= 5) {
            this.K = 5;
            this.stopSweep();
        }

        return this.sweeping;
    }

    /**
     * Add r value to history
     */
    addToHistory(r, K) {
        this.rHistory.push(r);
        if (this.rHistory.length > this.maxHistoryLength) {
            this.rHistory.shift();
        }

        // Add to hysteresis data if sweeping
        if (this.sweeping) {
            const point = { K: this.K, r };
            if (this.sweepDirection > 0) {
                this.hysteresisUp.push(point);
            } else {
                this.hysteresisDown.push(point);
            }
        }
    }

    /**
     * Clear history
     */
    clearHistory() {
        this.rHistory = [];
        this.time = 0;
    }

    /**
     * Clear hysteresis data
     */
    clearHysteresis() {
        this.hysteresisUp = [];
        this.hysteresisDown = [];
    }

    /**
     * Reset to defaults
     */
    reset() {
        this.K = 1.0;
        this.running = false;
        this.time = 0;
        this.sweeping = false;
        this.sweepDirection = 0;
        this.clearHistory();
        this.notifyChange('reset');
    }

    /**
     * Full reset including hysteresis
     */
    fullReset() {
        this.reset();
        this.clearHysteresis();
        this.experimentResults = null;
        this.notifyChange('fullReset');
    }

    /**
     * Get effective dt
     */
    getEffectiveDt() {
        return this.dt * this.speedMultiplier;
    }

    /**
     * Notify state change
     */
    notifyChange(property) {
        if (this.onStateChange) {
            this.onStateChange(property, this);
        }
    }

    /**
     * Get mode description
     */
    getModeDescription() {
        const descriptions = {
            1: `<strong>Mode 1 : Transition vers la synchronisation</strong><br>
                J'augmente K progressivement pour observer l'émergence de la synchronisation. 
                Le paramètre d'ordre r passe de ~0 (désordre) à ~1 (ordre parfait).`,
            2: `<strong>Mode 2 : Bistabilité synchro / twisted</strong><br>
                Avec le même K, différentes conditions initiales mènent à différents attracteurs. 
                Je compare "Quasi-sync" et "Twisted q=1".`,
            3: `<strong>Mode 3 : Hystérèse</strong><br>
                J'utilise les balayages K↑ et K↓ pour observer que les seuils de transition 
                diffèrent selon le sens de variation : c'est l'hystérèse.`,
            4: `<strong>Mode 4 : Expérience statistique</strong><br>
                Je lance plusieurs simulations avec des conditions aléatoires pour estimer 
                la taille des bassins d'attraction de chaque état.`
        };
        return descriptions[this.mode] || '';
    }
}

// Create singleton instance
export const appState = new AppState();
