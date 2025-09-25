<template>
  <div class="p-4 w-full h-full flex flex-col">
   
    <div v-if="loading" class="text-gray-500">Chargement...</div>
    <div v-else class="flex-1">
      <canvas ref="chartCanvas"></canvas>
    </div>
  </div>
</template>

<script>
import {
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

Chart.register(
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

export default {
  props: {
    chartType: { type: String, default: "bar" },
    apiEndpoint: { type: String, default: "/articles-by-category" }
  },
  data() {
    return {
      loading: true,
      chart: null,
      categories: [],
      counts: []
    };
  },
  methods: {
    async fetchData() {
      let data = [];
      try {
        const host = window.location.origin;
        const url = `${host}${this.apiEndpoint}`;
        const res = await fetch(url, { credentials: "include" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        data = await res.json();
      } catch (err) {
        console.error("❌ Erreur API, fallback données mock:", err);
        data = [
          { category: "archivé", count: 6 },
          { category: "brouillon", count: 7 },
          { category: "prévisualisé", count: 6 },
          { category: "publié", count: 6 }
        ];
      }

      this.categories = data.map((item) => item.category);
      this.counts = data.map((item) => item.count);

      this.loading = false;
      this.$nextTick(() => this.renderChart(this.$refs.chartCanvas));
    },
    renderChart(canvas) {
      if (this.chart) this.chart.destroy();
      const ctx = canvas.getContext("2d");

      this.chart = new Chart(ctx, {
        type: "bar",
        data: {
          labels: this.categories,
          datasets: [
            {
              label: "Nombre d'articles",
              data: this.counts,
              backgroundColor: "#8b5cf6", // violet
              borderRadius: 6
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            title: {
              display: false
            },
            datalabels: {
              color: "#fff",
              font: {
                weight: "bold",
                size: 14
              },
              anchor: "center",
              align: "center"
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1
              }
            }
          }
        }
      });
    }
  },
  mounted() {
    this.fetchData();
  }
};
</script>

<style scoped>
canvas {
  max-height: 400px;
}
</style>
