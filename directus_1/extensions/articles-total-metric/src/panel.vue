<template>
	<div class="flex flex-col items-center justify-center p-6 bg-white shadow-xl 
	rounded-2xl w-full h-full transition hover:shadow-2xl">
		<h3 class="text-lg font-semibold text-gray-600 mb-2">Nombre total d'articles</h3>
		<div class="flex items-center justify-center h-24">
			<span class="animate-pulse text-2xl font-bold text-gray-400">⏳</span>
		</div>
		<transition name="fade">
			<div v-if="!loading" class="text-5xl md:text-6xl font-extrabold text-indigo-600">
				{{ total }}
			</div>
		</transition>
		<p class="mt-3 text-sm text-gray-400 italic">
			Mis à jour le {{ lastUpdated }}
		</p>
	</div>
</template>

<script>
export default {
	props: {
		apiEndpoint: { type: String, default: "/articles-by-user/count" }
	},
	data() {
		return {
			loading: true,
			total: 0,
			lastUpdated: null,
		};
	},
	methods: {
		async fetchData() {
			try {
				const host = window.location.origin;
				const url = `${host}${this.apiEndpoint}`;
				const response = await fetch(url, { credentials: "include" });
				if (!response.ok) throw new Error(`HTTP ${response.status}`);
				const data = await response.json();
				this.total = data.total || 0;
				this.lastUpdated = new Date().toLocaleString();
			} catch (error) {
				console.error("Error fetching data:", error);
				this.total = 0;
				this.lastUpdated = "Erreur API";
			} finally {
				this.loading = false;
			}

		}
	},
	mounted() {
		this.fetchData();	
	}
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
	transition: opacity 0.6s ease;
}
.fade-enter-from, .fade-leave-to {
	opacity: 0;
}
</style>
