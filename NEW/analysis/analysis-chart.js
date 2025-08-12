// ===================================================================================
//  ANALYSIS-CHART.JS
//  Manages the creation and rendering of the evaluation graph.
// ===================================================================================

const AnalysisChart = {
    chart: null,
    canvas: $('#ar-eval-chart'),

    draw(reviewData) {
        if (!this.canvas.length) return;
        if (this.chart) this.chart.destroy();

        const labels = ['Start'];
        const data = [20];

        reviewData.forEach((item, index) => {
            if (!item) return;
            const moveNum = Math.floor(index / 2) + 1;
            const isWhite = index % 2 === 0;
            labels.push(`${moveNum}${isWhite ? '.' : '...'} ${item.move}`);
            data.push(item.score);
        });

        const ctx = this.canvas[0].getContext('2d');
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'Position Evaluation',
                    data,
                    borderColor: 'rgba(200, 200, 200, 0.8)',
                    borderWidth: 2,
                    pointRadius: 1,
                    pointHoverRadius: 4,
                    tension: 0.1,
                    fill: {
                        target: 'origin',
                        above: 'rgba(255, 255, 255, 0.1)',
                        below: 'rgba(0, 0, 0, 0.1)'
                    }
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        suggestedMin: -500,
                        suggestedMax: 500,
                        grid: { color: 'rgba(255,255,255,0.1)', zeroLineColor: 'rgba(255,255,255,0.4)' },
                        ticks: { color: 'var(--text-dark)', callback: (v) => (v / 100).toFixed(1) }
                    },
                    x: { display: false }
                },
                plugins: {
                    legend: { display: false },
                    tooltip: { mode: 'index', intersect: false, backgroundColor: 'rgba(0,0,0,0.8)', titleColor: 'white', bodyColor: 'white' }
                },
                interaction: { mode: 'index', intersect: false }
            }
        });
    },

    destroy() {
        if (this.chart) {
            this.chart.destroy();
            this.chart = null;
        }
    }
};