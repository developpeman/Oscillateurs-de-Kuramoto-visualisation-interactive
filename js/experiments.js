/**
 * Statistical Experiments Module
 * Runs multiple simulations to analyze basins of attraction
 */

import { KuramotoSimulator } from './kuramoto.js';

export class Experiments {
    constructor() {
        this.results = null;
    }

    /**
     * Run statistical experiment
     * @param {number} numSims - Number of simulations
     * @param {number} K - Coupling strength
     * @param {number} N - Number of oscillators
     * @param {number} steps - Integration steps per simulation
     */
    async run(numSims, K, N = 16, steps = 2000) {
        const results = {
            sync: 0,
            twisted1: 0,
            twisted2: 0,
            other: 0,
            total: numSims
        };

        const resultsDiv = document.getElementById('experimentResults');
        resultsDiv.innerHTML = '<p style="color: var(--accent-tertiary);">Simulation en cours...</p>';

        for (let i = 0; i < numSims; i++) {
            const sim = new KuramotoSimulator(N);
            sim.setCoupling(K);
            sim.setFrequencies('identical');
            sim.setInitialPhases('random');

            // Run simulation
            for (let s = 0; s < steps; s++) {
                sim.step(0.02);
            }

            // Classify result
            const { r } = sim.getOrderParameter();
            const q = sim.getWindingNumber();

            if (r > 0.85) {
                results.sync++;
            } else if (Math.abs(q) === 1) {
                results.twisted1++;
            } else if (Math.abs(q) === 2) {
                results.twisted2++;
            } else {
                results.other++;
            }

            // Progress update
            if (i % 10 === 0) {
                resultsDiv.innerHTML = `<p style="color: var(--accent-tertiary);">Simulation ${i + 1}/${numSims}...</p>`;
                await new Promise(r => setTimeout(r, 0));
            }
        }

        this.results = results;
        this.displayResults(results, K);
        return results;
    }

    displayResults(results, K) {
        const div = document.getElementById('experimentResults');
        const total = results.total;

        const syncPct = ((results.sync / total) * 100).toFixed(1);
        const t1Pct = ((results.twisted1 / total) * 100).toFixed(1);
        const t2Pct = ((results.twisted2 / total) * 100).toFixed(1);
        const otherPct = ((results.other / total) * 100).toFixed(1);

        div.innerHTML = `
            <div style="margin-bottom: 10px; font-size: 12px; color: var(--text-secondary);">
                K = ${K.toFixed(2)}, N = ${total} simulations
            </div>
            <div class="bar-chart">
                ${this.createBar('Synchro (q=0)', syncPct, '#10b981')}
                ${this.createBar('Twisted q=1', t1Pct, '#6366f1')}
                ${this.createBar('Twisted q=2', t2Pct, '#8b5cf6')}
                ${this.createBar('Autre', otherPct, '#64748b')}
            </div>
        `;
    }

    createBar(label, pct, color) {
        return `
            <div style="margin-bottom: 8px;">
                <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 3px;">
                    <span>${label}</span>
                    <span style="color: ${color};">${pct}%</span>
                </div>
                <div style="background: rgba(0,0,0,0.3); border-radius: 4px; height: 16px; overflow: hidden;">
                    <div style="width: ${pct}%; height: 100%; background: ${color}; border-radius: 4px; transition: width 0.5s;"></div>
                </div>
            </div>
        `;
    }
}
