<template>
  <div class="p-3 w-full h-full flex flex-col">
    <div class="flex items-center justify-between mb-2">
      <h3 class="text-lg font-semibold">Tags Word Cloud</h3>
      <div class="text-sm text-gray-500">Top {{ words.length }} tags</div>
    </div>

    <div ref="container" class="flex-1 relative" style="min-height: 280px;">
      <svg ref="svg" class="w-full h-full"></svg>

      <div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
        <div class="text-gray-500">Chargement...</div>
      </div>
      <div v-else-if="error" class="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
        <div class="text-red-500">{{ error }}</div>
      </div>
    </div>

    <div class="mt-2 text-xs text-gray-500">
      Tip: hover a word to see count. Click to filter (not implemented).
    </div>
  </div>
</template>

<script>
import * as d3 from "d3";
import cloud from "d3-cloud";

export default {
  props: {
    apiEndpoint: { type: String, default: "/articles-tags-usage" },
    maxTags: { type: Number, default: 100 },
    minFont: { type: Number, default: 12 },
  },

  data() {
    return {
      loading: true,
      error: null,
      words: [],
      width: 600,
      height: 400,
    };
  },

  mounted() {
    this.resizeObserver = new ResizeObserver(() => this.onResize());
    if (this.$refs.container) {
      this.resizeObserver.observe(this.$refs.container);
    }

    this.$nextTick(() => {
      this.onResize();
      this.fetchAndRender();
    });
  },

  beforeUnmount() {
    if (this.resizeObserver && this.$refs.container) {
      this.resizeObserver.unobserve(this.$refs.container);
    }
    if (this.layout) this.layout.stop();
  },

  methods: {
    onResize() {
      const rect = this.$refs.container.getBoundingClientRect();
      this.width = Math.max(200, Math.floor(rect.width));
      this.height = Math.max(200, Math.floor(rect.height));
      if (this.words && this.words.length) {
        this.renderCloud();
      }
    },

    async fetchAndRender() {
      this.loading = true;
      this.error = null;
      let data = null;

      try {
        const host = window.location.origin;
        const url = `${host}${this.apiEndpoint}`;
        const response = await fetch(url, { credentials: "include" });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        data = await response.json();
      } catch (err) {
        console.error("Error fetching or processing data:", err);
        this.error = "Error loading data";
      } finally {
        this.loading = false;
      }

      if (!Array.isArray(data)) {
        this.error = "Invalid data format";
        return;
      }

      const mapped = data
        .map((d) => ({
          text: d.tag ?? d.name ?? d.label ?? String(d.tag || d.name || ""),
          value: Number(d.count ?? d.value ?? 0),
        }))
        .filter((d) => d.text && d.value > 0)
        .sort((a, b) => b.value - a.value)
        .slice(0, this.maxTags);

      this.words = mapped;
      this.$nextTick(() => this.renderCloud());
    },

    renderCloud() {
      if (!this.words || !this.words.length) {
        d3.select(this.$refs.svg).selectAll("*").remove();
        return;
      }

      const values = this.words.map((d) => d.value);
      const min = d3.min(values);
      const max = d3.max(values);

      const fontScale = d3.scaleSqrt()
        .domain([min, max])
        .range([this.minFont, this.minFont + 40]);

      const color = d3.scaleSequential(d3.interpolateWarm).domain([min, max]);

      if (this.layout) this.layout.stop();

      this.layout = cloud()
        .size([this.width, this.height])
        .words(this.words.map((d) => ({
          text: d.text,
          size: fontScale(d.value),
          value: d.value,
        })))
        .padding(5)
        .rotate(() => (Math.random() < 0.8 ? 0 : 90))
        .font("Impact")
        .fontSize((d) => d.size)
        .on("end", (words) => this.draw(words, color))
        .start();
    },

    draw(words, colorScale) {
      const svg = d3.select(this.$refs.svg);
      svg.selectAll("*").remove();

      // bounding box
      const bounds = d3.extent(words.flatMap(d => [d.x - d.width/2, d.y - d.height/2, d.x + d.width/2, d.y + d.height/2]));

      // Ajustement dans le viewport
      const xExtent = d3.extent(words, d => d.x);
      const yExtent = d3.extent(words, d => d.y);
      const scale = Math.min(
        this.width / (xExtent[1] - xExtent[0] + 40),
        this.height / (yExtent[1] - yExtent[0] + 40)
      );

      const g = svg
        .attr("viewBox", `${-this.width/2} ${-this.height/2} ${this.width} ${this.height}`)
        .append("g")
        .attr("transform", `scale(${scale})`);

      const node = g.selectAll("text")
        .data(words)
        .enter()
        .append("text")
        .style("font-family", "Impact, Arial")
        .style("fill", (d) => colorScale(d.value))
        .style("font-size", (d) => `${d.size}px`)
        .attr("text-anchor", "middle")
        .attr("transform", (d) => `translate(${d.x},${d.y}) rotate(${d.rotate})`)
        .text((d) => d.text)
        .style("cursor", "pointer");

      // Tooltip
      node.on("mouseenter", (event, d) => {
        d3.select(event.currentTarget)
          .transition().duration(100)
          .style("opacity", 0.8)
          .style("font-weight", "700");

        const div = d3.select(this.$el).selectAll(".wc-tooltip").data([d]);
        div.enter().append("div")
          .classed("wc-tooltip", true)
          .style("position", "absolute")
          .style("pointer-events", "none")
          .style("background", "#11827")
          .style("color", "#fff")
          .style("padding", "6px 8px")
          .style("border-radius", "6px")
          .style("font-size", "12px")
          .style("box-shadow", "0 2px 10px rgba(0,0,0,0.15)")
          .merge(div)
          .html(`${d.text} — ${d.value}`)
          .style("left", event.layerX + 10 + "px")
          .style("top", event.layerY + 10 + "px");
      });

      node.on("mousemove", (event) => {
        d3.select(this.$el).select(".wc-tooltip")
          .style("left", event.layerX + 10 + "px")
          .style("top", event.layerY + 10 + "px");
      });

      node.on("mouseleave", (event) => {
        d3.select(event.currentTarget)
          .transition().duration(100)
          .style("opacity", 1)
          .style("font-weight", "normal");
        d3.select(this.$el).selectAll(".wc-tooltip").remove();
      });

      node.on("click", (event, d) => {
        this.$emit("tag-click", d.text);
      });
    },
  },
};
</script>

<style scoped>
.wc-tooltip { z-index: 9999; }
</style>
