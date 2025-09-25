<template>
	<div class="p-4">
		<h3 class="text-lg font-bold mb-2">Top Auteurs</h3>
		<canvas ref="chartCanvas"></canvas>
	</div>
</template>

<script>
import { Chart, plugins, registerables } from 'chart.js';
Chart.register(...registerables);
export default {
	name: 'TopAuthorsPanel',
	data() {
		return {
			chart: null,
		}
	},
	mounted() {
		this.loadData();
	},

	methods: {
		async loadData() {
			try {
				const host = window.location.origin;
				const url = `${host}/articles-by-user`;
				const response = await fetch(url);
				const data = await response.json();
				console.log('Fetched data:', data);
				const authors = data.map(item => item.author);
				const counts = data.map(item => item.count);

				if (this.chart) {
					this.chart.destroy();
				}

				this.chart = new Chart(this.$refs.chartCanvas, {
					type: 'bar',
					data: {
						labels: authors,
						datasets: [{
							label: 'Nombre d\'articles',
							data: counts,
							backgroundColor: 'rgba(54, 162, 235, 0.6)',
							borderColor: 'rgba(54, 162, 235, 1)',
							borderWidth: 1
						}]
					},
					options: {
						indexAxis: "y",
						responsive: true,
						plugins: {
							legend: {
								display: false,
							},
							tooltip: {
								callbacks: {
									label: function(tooltipItem) {
										return `${tooltipItem.dataset.label}: ${tooltipItem.raw}`;
									}
								}
							}
						},
						scales: {
							x: {
								beginAtZero: true,
								ticks: { stepSize: 1 }
							}	,
							y: { beginAtZero: true }
						}
					}
				});
			} catch (error) {
				console.error('Error fetching data:', error);
			}
		}
	}
};
</script>

<style scoped>
.text {
	padding: 12px;
}

.text.has-header {
	padding: 0 12px;
}
</style>
