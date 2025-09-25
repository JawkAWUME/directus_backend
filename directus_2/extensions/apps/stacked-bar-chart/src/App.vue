<template>
  <div>
    <h1>Stacked Bar Chart</h1>
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script>
import { Bar } from 'vue-chartjs';
import axios from 'axios';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

export default {
    name:'StackedBarChart',
   async mounted() {
    try {
      const { data } = await axios.get('/stacked-bar/'); // note le slash final
      const labels = data.map(item => item.user);
      const etats = ['Brouillon', 'Publié', 'Archivé'];

      const datasets = etats.map(etat => ({
        label: etat,
        data: data.map(item => item[etat] || 0),
        backgroundColor: this.getColor(etat),
      }));

      const ctx = this.$refs.chartCanvas.getContext('2d');
      new ChartJS(ctx, {
        type: 'bar',
        data: { labels, datasets },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'top' },
            title: { display: true, text: 'Stacked Bar Chart' }
          },
          scales: {
            x: { stacked: true },
            y: { stacked: true }
          }
        }
      });
    } catch (err) {
      console.error('Erreur chargement chart:', err);
    }
  },
        const ctx = this.$refs.chartCanvas.getContext('2d');
        new ChartJS(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'top' },
                    title: { display: true, text: 'Stacked Bar Chart' }
                },
                scales: {
                    x: { stacked: true },
                    y: { stacked: true }
                }
            }
        });
    },
    methods: {
        getColor(etat) {
            switch (etat) {
                case 'Brouillon': return 'rgba(255, 99, 132, 0.5)';
                case 'Publié': return 'rgba(54, 162, 235, 0.5)';
                case 'Archivé': return 'rgba(75, 192, 192, 0.5)';
                default: return 'rgba(201, 203, 207, 0.5)';
            }
        }
    }
