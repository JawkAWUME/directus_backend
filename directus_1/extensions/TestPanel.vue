<template>
  <div class="p-4 w-full h-full flex flex-col">
    <h3 class="text-lg font-bold mb-4">Articles by Category (Test)</h3>

    <div v-if="loading" class="text-gray-500">Loading...</div>
    <div v-else class="flex-1">
      <canvas ref="chartCanvas"></canvas>
    </div>
  </div>
</template>

<script>
import { Chart, BarController, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend, ArcElement } from 'chart.js';

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend, ArcElement);

export default {
  props: {
    chartType: {
      type: String,
      default: 'bar', // par défaut
    },
    apiEndpoint: {
      type: String,
      default: '/articles-by-category', // tu peux le surcharger
    },
    mockData: {
      type: Array,
      default: () => [
        { category: "Immobilier", count: 5 },
        { category: "Tech", count: 8 },
        { category: "Sans catégorie", count: 2 },
      ],
    },
  },
  data() {
    return {
      loading: true,
      chart: null,
      categories: [],
      counts: [],
    };
  },
  methods: {
    async fetchData() {
      try {
        let data = [];
        if (this.apiEndpoint) {
          // Essaie d'appeler l'API
          const res = await fetch(this.apiEndpoint);
          data = await res.json();
        } else {
          // Sinon utilise les mock data
          data = this.mockData;
        }

        this.categories = data.map(item => item.category);
        this.counts = data.map(item => item.count);

        this.renderChart();
      } catch (err) {
        console.error("❌ Error fetching API, using mock data:", err);
        this.categories = this.mockData.map(item => item.category);
        this.counts = this.mockData.map(item => item.count);
        this.renderChart();
      } finally {
        this.loading = false;
      }
    },
    renderChart() {
      if (this.chart) this.chart.destroy();

      const ctx = this.$refs.chartCanvas.getContext("2d");
      this.chart = new Chart(ctx, {
        type: this.chartType,
        data: {
          labels: this.categories,
          datasets: [
            {
              label: "Articles",
              data: this.counts,
              backgroundColor: ["#3b82f6","#10b981","#f59e0b","#ef4444","#8b5cf6"],
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: this.chartType !== "bar" },
            title: { display: false },
          },
          scales: this.chartType === 'bar' ? { y: { beginAtZero: true } } : {},
        },
      });
    },
  },
  mounted() {
    this.fetchData();
  },
};
</script>

<style scoped>
canvas {
  width: 100% !important;
  height: 100% !important;
}
</style>
