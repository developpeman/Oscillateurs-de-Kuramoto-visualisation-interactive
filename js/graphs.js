/**
 * Graph Visualizations
 * r(t) time series and r(K) hysteresis plots
 */

export class Graphs {
    constructor(rGraphCanvas, hysteresisCanvas) {
        this.rCanvas = rGraphCanvas;
        this.rCtx = rGraphCanvas.getContext('2d');
        this.hCanvas = hysteresisCanvas;
        this.hCtx = hysteresisCanvas.getContext('2d');

        this.padding = { top: 20, right: 20, bottom: 30, left: 45 };
    }

    renderRGraph(rHistory) {
        const ctx = this.rCtx;
        const w = this.rCanvas.width;
        const h = this.rCanvas.height;
        const p = this.padding;

        ctx.fillStyle = '#0a0a0f';
        ctx.fillRect(0, 0, w, h);

        const plotW = w - p.left - p.right;
        const plotH = h - p.top - p.bottom;

        // Axes
        ctx.strokeStyle = 'rgba(100, 100, 150, 0.5)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(p.left, p.top);
        ctx.lineTo(p.left, h - p.bottom);
        ctx.lineTo(w - p.right, h - p.bottom);
        ctx.stroke();

        // Y-axis labels
        ctx.fillStyle = 'rgba(160, 160, 176, 0.8)';
        ctx.font = '11px monospace';
        ctx.textAlign = 'right';
        ctx.fillText('1.0', p.left - 5, p.top + 5);
        ctx.fillText('0.5', p.left - 5, p.top + plotH / 2 + 3);
        ctx.fillText('0.0', p.left - 5, h - p.bottom + 3);

        // Grid lines
        ctx.strokeStyle = 'rgba(100, 100, 150, 0.2)';
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(p.left, p.top + plotH / 2);
        ctx.lineTo(w - p.right, p.top + plotH / 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Plot r(t)
        if (rHistory.length > 1) {
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(6, 182, 212, 0.9)';
            ctx.lineWidth = 2;

            for (let i = 0; i < rHistory.length; i++) {
                const x = p.left + (i / (rHistory.length - 1)) * plotW;
                const y = h - p.bottom - rHistory[i] * plotH;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
        }

        // X label
        ctx.fillStyle = 'rgba(160, 160, 176, 0.6)';
        ctx.textAlign = 'center';
        ctx.fillText('temps →', w / 2, h - 5);
    }

    renderHysteresis(upData, downData) {
        const ctx = this.hCtx;
        const w = this.hCanvas.width;
        const h = this.hCanvas.height;
        const p = this.padding;

        ctx.fillStyle = '#0a0a0f';
        ctx.fillRect(0, 0, w, h);

        const plotW = w - p.left - p.right;
        const plotH = h - p.top - p.bottom;

        // Axes
        ctx.strokeStyle = 'rgba(100, 100, 150, 0.5)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(p.left, p.top);
        ctx.lineTo(p.left, h - p.bottom);
        ctx.lineTo(w - p.right, h - p.bottom);
        ctx.stroke();

        // Labels
        ctx.fillStyle = 'rgba(160, 160, 176, 0.8)';
        ctx.font = '11px monospace';
        ctx.textAlign = 'right';
        ctx.fillText('1.0', p.left - 5, p.top + 5);
        ctx.fillText('0.0', p.left - 5, h - p.bottom + 3);
        ctx.textAlign = 'center';
        ctx.fillText('0', p.left, h - 8);
        ctx.fillText('5', w - p.right, h - 8);
        ctx.fillText('K', w / 2, h - 5);

        // Plot up sweep (cyan)
        this.plotCurve(ctx, upData, plotW, plotH, p, 'rgba(6, 182, 212, 0.9)', w, h);

        // Plot down sweep (magenta)
        this.plotCurve(ctx, downData, plotW, plotH, p, 'rgba(236, 72, 153, 0.9)', w, h);

        // Legend
        if (upData.length > 0 || downData.length > 0) {
            ctx.font = '10px sans-serif';
            ctx.fillStyle = 'rgba(6, 182, 212, 0.9)';
            ctx.fillText('▲ K↑', w - 40, p.top + 10);
            ctx.fillStyle = 'rgba(236, 72, 153, 0.9)';
            ctx.fillText('▼ K↓', w - 40, p.top + 22);
        }
    }

    plotCurve(ctx, data, plotW, plotH, p, color, w, h) {
        if (data.length < 2) return;

        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;

        for (let i = 0; i < data.length; i++) {
            const x = p.left + (data[i].K / 5) * plotW;
            const y = h - p.bottom - data[i].r * plotH;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
    }
}
