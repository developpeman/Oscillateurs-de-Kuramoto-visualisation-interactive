/**
 * Kuramoto Oscillator Simulator
 * 
 * Model: dθᵢ/dt = ωᵢ + (K/2)[sin(θᵢ₊₁ - θᵢ) + sin(θᵢ₋₁ - θᵢ)]
 * Ring topology with periodic boundary conditions
 */

export class KuramotoSimulator {
    constructor(N = 16) {
        this.N = N;
        this.phases = new Float64Array(N);      // θᵢ
        this.frequencies = new Float64Array(N);  // ωᵢ
        this.dPhases = new Float64Array(N);      // dθᵢ/dt (for integration)
        
        this.K = 1.0;  // Coupling strength
        
        // Initialize with identical frequencies and random phases
        this.setFrequencies('identical');
        this.setInitialPhases('random');
    }
    
    /**
     * Set natural frequencies
     * @param {string} type - 'identical', 'random', 'twoGroups'
     */
    setFrequencies(type) {
        const N = this.N;
        switch(type) {
            case 'identical':
                this.frequencies.fill(1.0);
                break;
            case 'random':
                for (let i = 0; i < N; i++) {
                    this.frequencies[i] = 0.8 + Math.random() * 0.4; // ω ∈ [0.8, 1.2]
                }
                break;
            case 'twoGroups':
                for (let i = 0; i < N; i++) {
                    this.frequencies[i] = (i < N/2) ? 0.8 : 1.2;
                }
                break;
        }
    }
    
    /**
     * Set initial phases
     * @param {string} type - 'random', 'quasiSync', 'twisted1', 'twisted2'
     */
    setInitialPhases(type) {
        const N = this.N;
        const TWO_PI = 2 * Math.PI;
        
        switch(type) {
            case 'random':
                for (let i = 0; i < N; i++) {
                    this.phases[i] = Math.random() * TWO_PI;
                }
                break;
            case 'quasiSync':
                const center = Math.random() * TWO_PI;
                for (let i = 0; i < N; i++) {
                    this.phases[i] = center + (Math.random() - 0.5) * 0.3;
                }
                break;
            case 'twisted1':
                // q = 1: phases increase by 2π/N around the ring
                for (let i = 0; i < N; i++) {
                    this.phases[i] = (TWO_PI * i) / N;
                }
                break;
            case 'twisted2':
                // q = 2: phases increase by 4π/N around the ring
                for (let i = 0; i < N; i++) {
                    this.phases[i] = (4 * Math.PI * i) / N;
                }
                break;
        }
        this.normalizePhases();
    }
    
    /**
     * Add random perturbation to phases
     * @param {number} intensity - Perturbation amplitude
     */
    perturb(intensity = 0.1) {
        for (let i = 0; i < this.N; i++) {
            this.phases[i] += (Math.random() - 0.5) * 2 * intensity * Math.PI;
        }
        this.normalizePhases();
    }
    
    /**
     * Normalize phases to [0, 2π)
     */
    normalizePhases() {
        const TWO_PI = 2 * Math.PI;
        for (let i = 0; i < this.N; i++) {
            this.phases[i] = ((this.phases[i] % TWO_PI) + TWO_PI) % TWO_PI;
        }
    }
    
    /**
     * Compute derivatives dθᵢ/dt
     */
    computeDerivatives() {
        const N = this.N;
        const K = this.K;
        const halfK = K / 2;
        
        for (let i = 0; i < N; i++) {
            const iPrev = (i - 1 + N) % N;
            const iNext = (i + 1) % N;
            
            const coupling = halfK * (
                Math.sin(this.phases[iNext] - this.phases[i]) +
                Math.sin(this.phases[iPrev] - this.phases[i])
            );
            
            this.dPhases[i] = this.frequencies[i] + coupling;
        }
    }
    
    /**
     * Integration step using Euler method
     * @param {number} dt - Time step
     */
    step(dt) {
        this.computeDerivatives();
        
        for (let i = 0; i < this.N; i++) {
            this.phases[i] += this.dPhases[i] * dt;
        }
        
        this.normalizePhases();
    }
    
    /**
     * Integration step using RK4 method (more accurate)
     * @param {number} dt - Time step
     */
    stepRK4(dt) {
        const N = this.N;
        const k1 = new Float64Array(N);
        const k2 = new Float64Array(N);
        const k3 = new Float64Array(N);
        const k4 = new Float64Array(N);
        const temp = new Float64Array(N);
        
        // k1
        this.computeDerivatives();
        k1.set(this.dPhases);
        
        // k2
        for (let i = 0; i < N; i++) {
            temp[i] = this.phases[i] + 0.5 * dt * k1[i];
        }
        this.computeDerivativesFor(temp, k2);
        
        // k3
        for (let i = 0; i < N; i++) {
            temp[i] = this.phases[i] + 0.5 * dt * k2[i];
        }
        this.computeDerivativesFor(temp, k3);
        
        // k4
        for (let i = 0; i < N; i++) {
            temp[i] = this.phases[i] + dt * k3[i];
        }
        this.computeDerivativesFor(temp, k4);
        
        // Combine
        for (let i = 0; i < N; i++) {
            this.phases[i] += (dt / 6) * (k1[i] + 2*k2[i] + 2*k3[i] + k4[i]);
        }
        
        this.normalizePhases();
    }
    
    /**
     * Compute derivatives for arbitrary phase array
     */
    computeDerivativesFor(phases, output) {
        const N = this.N;
        const halfK = this.K / 2;
        
        for (let i = 0; i < N; i++) {
            const iPrev = (i - 1 + N) % N;
            const iNext = (i + 1) % N;
            
            const coupling = halfK * (
                Math.sin(phases[iNext] - phases[i]) +
                Math.sin(phases[iPrev] - phases[i])
            );
            
            output[i] = this.frequencies[i] + coupling;
        }
    }
    
    /**
     * Calculate order parameter r and mean phase ψ
     * r·e^(iψ) = (1/N) Σ e^(iθⱼ)
     * @returns {{r: number, psi: number}}
     */
    getOrderParameter() {
        let sumCos = 0;
        let sumSin = 0;
        
        for (let i = 0; i < this.N; i++) {
            sumCos += Math.cos(this.phases[i]);
            sumSin += Math.sin(this.phases[i]);
        }
        
        sumCos /= this.N;
        sumSin /= this.N;
        
        const r = Math.sqrt(sumCos * sumCos + sumSin * sumSin);
        const psi = Math.atan2(sumSin, sumCos);
        
        return { r, psi };
    }
    
    /**
     * Calculate winding number q
     * q = (1/2π) Σ (θᵢ₊₁ - θᵢ) wrapped to [-π, π]
     * @returns {number}
     */
    getWindingNumber() {
        let totalWinding = 0;
        const TWO_PI = 2 * Math.PI;
        
        for (let i = 0; i < this.N; i++) {
            const iNext = (i + 1) % this.N;
            let diff = this.phases[iNext] - this.phases[i];
            
            // Wrap to [-π, π]
            while (diff > Math.PI) diff -= TWO_PI;
            while (diff < -Math.PI) diff += TWO_PI;
            
            totalWinding += diff;
        }
        
        return Math.round(totalWinding / TWO_PI);
    }
    
    /**
     * Calculate phase variance (circular variance)
     * @returns {number}
     */
    getPhaseVariance() {
        const { r } = this.getOrderParameter();
        // Circular variance: V = 1 - r
        return 1 - r;
    }
    
    /**
     * Classify current state
     * @returns {string}
     */
    classifyState() {
        const { r } = this.getOrderParameter();
        const q = this.getWindingNumber();
        
        if (r > 0.9) {
            return 'Synchronisé (q=0)';
        } else if (Math.abs(q) === 1 && r < 0.5) {
            return `Twisted (q=${q})`;
        } else if (Math.abs(q) === 2 && r < 0.3) {
            return `Twisted (q=${q})`;
        } else if (r < 0.3) {
            return 'Désynchronisé';
        } else {
            return `Partiel (r=${r.toFixed(2)}, q=${q})`;
        }
    }
    
    /**
     * Get phases array (copy)
     * @returns {Float64Array}
     */
    getPhases() {
        return new Float64Array(this.phases);
    }
    
    /**
     * Set coupling strength
     * @param {number} K
     */
    setCoupling(K) {
        this.K = Math.max(0, K);
    }
}
