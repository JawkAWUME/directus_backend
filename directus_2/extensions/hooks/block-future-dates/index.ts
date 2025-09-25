// extensions/hooks/block-future-dates/index.ts
import { defineHook } from '@directus/extensions-sdk';

export default defineHook(({ filter }) => {
  filter('items.create', async (input, { collection }) => {
    if (collection === 'titres_fonciers') {
      const { date_delivrance } = input;
      if (date_delivrance && new Date(date_delivrance) > new Date()) {
        throw new Error("⛔ La date de délivrance ne peut pas être dans le futur.");
      }
    }
    return input;
  });

  filter('items.update', async (input, { collection }) => {
    if (collection === 'titres_fonciers') {
      const { date_delivrance } = input;
      if (date_delivrance && new Date(date_delivrance) > new Date()) {
        throw new Error("⛔ La date de délivrance ne peut pas être dans le futur.");
      }
    }
    return input;
  });
});
