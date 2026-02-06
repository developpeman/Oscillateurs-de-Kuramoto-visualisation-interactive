/**
 * Ring View Visualization
 * Displays oscillators arranged on a spatial circle
 * with HSV color coding and phase indicator needles
 */

export class RingView {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        // Get actual canvas size
        this.width = canvas.width;
        this.height = canvas.height;
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;

        // Ring parameters
        this.ringRadius = Math.min(this.width, this.height) * 0.35;
        this.nodeRadius = 18;
        this.needleLength = 14;
    }

    /**
     * Convert phase to HSV color (hue wheel)
     * @param {number} phase - Phase in radians [0, 2π]
     * @returns {string} - CSS color string
     */
    phaseToColor(phase) {
        // Normalize to [0, 1]
        const hue = (phase / (2 * Math.PI)) * 360;
        return `hsl(${hue}, 85%, 55%)`;
    }

    /**
     * Render the ring view
     * @param {Float64Array} phases - Array of oscillator phases
     */
    render(phases) {
        const ctx = this.ctx;
        const N = phases.length;

        // Clear canvas
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, 0, this.width, this.height);

        // Draw ring outline
        ctx.beginPath();
        ctx.arc(this.centerX, this.centerY, this.ringRadius, 0, 2 * Math.PI);
        ctx.strokeStyle = 'rgba(100, 100, 150, 0.3)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw connections between neighbors
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.2)';
        ctx.lineWidth = 1;

        for (let i = 0; i < N; i++) {
            const angle1 = (2 * Math.PI * i) / N - Math.PI / 2;
            const angle2 = (2 * Math.PI * ((i + 1) % N)) / N - Math.PI / 2;

            const x1 = this.centerX + this.ringRadius * Math.cos(angle1);
            const y1 = this.centerY + this.ringRadius * Math.sin(angle1);
            const x2 = this.centerX + this.ringRadius * Math.cos(angle2);
            const y2 = this.centerY + this.ringRadius * Math.sin(angle2);

            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
        }
        ctx.stroke();

        // Draw oscillators
        for (let i = 0; i < N; i++) {
            const spatialAngle = (2 * Math.PI * i) / N - Math.PI / 2;
            const x = this.centerX + this.ringRadius * Math.cos(spatialAngle);
            const y = this.centerY + this.ringRadius * Math.sin(spatialAngle);

            const phase = phases[i];
            const color = this.phaseToColor(phase);

            // Draw node
            ctx.beginPath();
            ctx.arc(x, y, this.nodeRadius, 0, 2 * Math.PI);
            ctx.fillStyle = color;
            ctx.fill();

            // Draw border
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Draw phase needle (like a clock hand)
            const needleAngle = phase - Math.PI / 2; // Adjust so 0 points up
            const needleX = x + this.needleLength * Math.cos(needleAngle);
            const needleY = y + this.needleLength * Math.sin(needleAngle);

            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(needleX, needleY);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.stroke();

            // Draw small circle at needle tip
            ctx.beginPath();
            ctx.arc(needleX, needleY, 3, 0, 2 * Math.PI);
            ctx.fillStyle = 'white';
            ctx.fill();
        }

        // Draw center label
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.font = '12px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`N = ${N}`, this.centerX, this.centerY + 5);
    }

    /**
     * Clear the canvas
     */
    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }
}
