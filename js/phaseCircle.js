/**
 * Phase Circle Visualization (Torus View)
 */

export class PhaseCircle {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;
        this.circleRadius = Math.min(this.width, this.height) * 0.38;
        this.pointRadius = 8;
    }

    phaseToColor(phase) {
        const hue = (phase / (2 * Math.PI)) * 360;
        return `hsl(${hue}, 85%, 55%)`;
    }

    render(phases, orderParam) {
        const ctx = this.ctx;
        const N = phases.length;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, 0, this.width, this.height);

        // Unit circle
        ctx.beginPath();
        ctx.arc(this.centerX, this.centerY, this.circleRadius, 0, 2 * Math.PI);
        ctx.strokeStyle = 'rgba(100, 100, 150, 0.4)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Angle markers
        for (let i = 0; i < 8; i++) {
            const angle = (2 * Math.PI * i) / 8;
            ctx.beginPath();
            ctx.moveTo(this.centerX + (this.circleRadius - 8) * Math.cos(angle),
                this.centerY + (this.circleRadius - 8) * Math.sin(angle));
            ctx.lineTo(this.centerX + (this.circleRadius + 8) * Math.cos(angle),
                this.centerY + (this.circleRadius + 8) * Math.sin(angle));
            ctx.strokeStyle = 'rgba(100, 100, 150, 0.3)';
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        // Oscillator points
        for (let i = 0; i < N; i++) {
            const phase = phases[i];
            const x = this.centerX + this.circleRadius * Math.cos(phase);
            const y = this.centerY + this.circleRadius * Math.sin(phase);
            const color = this.phaseToColor(phase);

            ctx.beginPath();
            ctx.arc(x, y, this.pointRadius, 0, 2 * Math.PI);
            ctx.fillStyle = color;
            ctx.fill();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.lineWidth = 1.5;
            ctx.stroke();
        }

        // Order parameter arrow
        if (orderParam) {
            const { r, psi } = orderParam;
            const arrowLength = r * this.circleRadius;
            const arrowX = this.centerX + arrowLength * Math.cos(psi);
            const arrowY = this.centerY + arrowLength * Math.sin(psi);

            ctx.beginPath();
            ctx.moveTo(this.centerX, this.centerY);
            ctx.lineTo(arrowX, arrowY);
            ctx.strokeStyle = 'rgba(16, 185, 129, 1)';
            ctx.lineWidth = 4;
            ctx.lineCap = 'round';
            ctx.stroke();

            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.font = 'bold 14px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(`r=${r.toFixed(2)}`, this.centerX + (arrowLength + 25) * Math.cos(psi),
                this.centerY + (arrowLength + 25) * Math.sin(psi));
        }

        ctx.beginPath();
        ctx.arc(this.centerX, this.centerY, 4, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(99, 102, 241, 0.8)';
        ctx.fill();
    }

    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }
}
