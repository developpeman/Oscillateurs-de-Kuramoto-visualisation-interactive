/**
 * UI Controls Handler
 * Manages all user interface interactions
 */

import { appState } from './state.js';

export class Controls {
    constructor(simulator, onUpdate) {
        this.simulator = simulator;
        this.onUpdate = onUpdate;
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Mode buttons
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                appState.setMode(parseInt(btn.dataset.mode));
                document.getElementById('modeDescription').innerHTML = appState.getModeDescription();

                // Show/hide experiment panel
                const expPanel = document.getElementById('experimentPanel');
                expPanel.style.display = appState.mode === 4 ? 'block' : 'none';
            });
        });

        // K slider
        const kSlider = document.getElementById('kSlider');
        kSlider.addEventListener('input', () => {
            appState.setK(parseFloat(kSlider.value));
            this.simulator.setCoupling(appState.K);
            document.getElementById('kValue').textContent = appState.K.toFixed(2);
        });

        // Sweep buttons
        document.getElementById('sweepUpBtn').addEventListener('click', () => {
            appState.startSweep(1);
            appState.setRunning(true);
        });

        document.getElementById('sweepDownBtn').addEventListener('click', () => {
            appState.startSweep(-1);
            appState.setRunning(true);
        });

        document.getElementById('stopSweepBtn').addEventListener('click', () => {
            appState.stopSweep();
        });

        // Frequency presets
        document.querySelectorAll('.preset-btn[data-freq]').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.preset-btn[data-freq]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.simulator.setFrequencies(btn.dataset.freq);
                appState.setFrequencyType(btn.dataset.freq);
            });
        });

        // Phase initialization
        document.querySelectorAll('.init-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.simulator.setInitialPhases(btn.dataset.init);
                appState.clearHistory();
                this.onUpdate();
            });
        });

        // Perturbation
        const perturbSlider = document.getElementById('perturbSlider');
        perturbSlider.addEventListener('input', () => {
            document.getElementById('perturbValue').textContent = parseFloat(perturbSlider.value).toFixed(2);
        });

        document.getElementById('perturbBtn').addEventListener('click', () => {
            const intensity = parseFloat(perturbSlider.value);
            this.simulator.perturb(intensity);
            this.onUpdate();
        });

        // Speed slider
        const speedSlider = document.getElementById('speedSlider');
        speedSlider.addEventListener('input', () => {
            appState.setSpeed(parseFloat(speedSlider.value));
            document.getElementById('speedValue').textContent = `×${appState.speedMultiplier.toFixed(2)}`;
        });

        // Simulation controls
        document.getElementById('playPauseBtn').addEventListener('click', () => {
            const running = appState.toggleRunning();
            document.getElementById('playPauseBtn').textContent = running ? '⏸ Pause' : '▶ Play';
            document.body.classList.toggle('running', running);
        });

        document.getElementById('stepBtn').addEventListener('click', () => {
            this.simulator.step(appState.getEffectiveDt());
            this.onUpdate();
        });

        document.getElementById('resetBtn').addEventListener('click', () => {
            appState.reset();
            this.simulator.setCoupling(1.0);
            this.simulator.setInitialPhases('random');
            kSlider.value = 1.0;
            document.getElementById('kValue').textContent = '1.00';
            document.getElementById('playPauseBtn').textContent = '▶ Play';
            document.body.classList.remove('running');
            this.onUpdate();
        });
    }

    updateDisplays(r, q, variance) {
        document.getElementById('rValue').textContent = r.toFixed(3);
        document.getElementById('qValue').textContent = q;
        document.getElementById('varValue').textContent = variance.toFixed(3);
        document.getElementById('kValue').textContent = appState.K.toFixed(2);
        document.getElementById('kSlider').value = appState.K;
        document.getElementById('stateLabel').textContent = `État : ${this.simulator.classifyState()}`;
    }
}
