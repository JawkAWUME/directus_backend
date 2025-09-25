import PanelComponent from './panel.vue';

export default {
    id: 'tags-wordcloud',
    name: 'Tags Word Cloud',
    icon: 'tag',
    description: 'Displays a word cloud of most used tags in articles',
    component: PanelComponent,
    options: [{
            field: 'apiEndpoint',
            name: 'API Endpoint',
            type: 'string',
            meta: {
                interface: 'input',
                width: 'full',
                note: "Example: /articles-tags-usage",
            },
            schema: { default_value: '/articles-tags-usage' },
        },
        {
            field: 'maxTags',
            name: 'Max Tags',
            type: 'integer',
            meta: { interface: 'numeric', width: 'half' },
            schema: { default_value: 100, minimum: 1 },
        },
        {
            field: 'minFontSize',
            name: 'Min Font Size',
            type: 'integer',
            meta: { interface: 'numeric', width: 'half' },
            schema: { default_value: 12, minimum: 1 },
        }
    ],
    minWidth: 12,
    minHeight: 8,
};