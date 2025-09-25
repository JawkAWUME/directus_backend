import PanelComponent from './panel.vue';

export default {
    id: 'articles-category-panel',
    name: 'Articles by Category',
    icon: 'bar-chart',
    description: 'Affiche un graphique des articles par catégorie',
    component: PanelComponent,

    // Options de configuration (affichées quand tu ajoutes le panel au dashboard)
    options: [{
            field: 'chartType',
            name: 'Chart Type',
            type: 'string',
            meta: {
                interface: 'select-dropdown',
                options: {
                    choices: [
                        { text: 'Bar', value: 'bar' },
                        { text: 'Pie', value: 'pie' },
                        { text: 'Doughnut', value: 'doughnut' },
                    ],
                },
                width: 'half',
            },
            schema: {
                default_value: 'bar',
            },
        },
        {
            field: 'apiEndpoint',
            name: 'API Endpoint',
            type: 'string',
            meta: {
                interface: 'input',
                width: 'full',
            },
            schema: {
                default_value: '/articles-by-category',
            },
        },
    ],

    // Contraintes du panneau
    minWidth: 12,
    minHeight: 8,
};