import PanelComponent from './panel.vue';

export default {
    id: 'articles-total-metric',
    name: 'Articles Total Metric',
    icon: 'bar_chart',
    description: 'Affiche le nombre total d\'articles publiés sous forme de métrique',
    component: PanelComponent,
    options: [{
        field: 'apiEndpoint',
        name: 'API Endpoint',
        type: 'string',
        meta: {
            interface: 'input',
            width: 'full',
            note: "Exemple: /articles-count",
        },
        schema: { default_value: '/articles-count' },
    }, ],
    minWidth: 12,
    minHeight: 8,
};