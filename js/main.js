/**
 * Kuramoto Oscillator Visualization - Main Application
 */

import { KuramotoSimulator } from './kuramoto.js';
import { appState } from './state.js';
import { RingView } from './ringView.js';
import { PhaseCircle } from './phaseCircle.js';
import { Graphs } from './graphs.js';
import { Controls } from './controls.js';
import { Experiments } from './experiments.js';

class App {
    constructor() {
        // Initialize simulator
        this.simulator = new KuramotoSimulator(16);

        // Initialize visualizations
        this.ringView = new RingView(document.getElementById('ringCanvas'));
        this.phaseCircle = new PhaseCircle(document.getElementById('phaseCanvas'));
        this.graphs = new Graphs(
            document.getElementById('rGraphCanvas'),
            document.getElementById('hysteresisCanvas')
        );

        // Initialize controls
        this.controls = new Controls(this.simulator, () => this.updateVisuals());

        // Initialize experiments
        this.experiments = new Experiments();

        // Setup experiment button
        document.getElementById('runExperimentBtn').addEventListener('click', () => {
            const numSims = parseInt(document.getElementById('numSimsInput').value) || 50;
            this.experiments.run(numSims, appState.K, 16, 2000);
        });

        // Initial render
        this.updateVisuals();

        // Start animation loop
        this.lastTime = 0;
        this.animate = this.animate.bind(this);
        requestAnimationFrame(this.animate);

        console.log('Kuramoto Oscillator Visualization initialized');
    }

    animate(currentTime) {
        requestAnimationFrame(this.animate);

        if (appState.running) {
            // Update simulation
            const dt = appState.getEffectiveDt();
            this.simulator.step(dt);
            appState.time += dt;

            // Handle K sweep
            if (appState.sweeping) {
                appState.updateSweep();
                this.simulator.setCoupling(appState.K);
            }

            // Update visuals
            this.updateVisuals();
        }
    }

    updateVisuals() {
        const phases = this.simulator.getPhases();
        const orderParam = this.simulator.getOrderParameter();
        const q = this.simulator.getWindingNumber();
        const variance = this.simulator.getPhaseVariance();

        // Add to history
        appState.addToHistory(orderParam.r, appState.K);

        // Render visualizations
        this.ringView.render(phases);
        this.phaseCircle.render(phases, orderParam);
        this.graphs.renderRGraph(appState.rHistory);
        this.graphs.renderHysteresis(appState.hysteresisUp, appState.hysteresisDown);

        // Update numeric displays
        this.controls.updateDisplays(orderParam.r, q, variance);
    }
}

// Start application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
