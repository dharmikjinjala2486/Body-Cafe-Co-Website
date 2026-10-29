import { createHandler } from './core.js';
// Public catalogue reads and cookie-authenticated admin requests share this API.
// The platform service key is never sent to the browser or checked into source.
const handler = createHandler({
  release: '20261029-supabase-v1',
  url: Deno.env.get('SUPABASE_URL'),
  serviceKey: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
  bundles: [{"id": "daily-edit", "name": "The daily edit", "description": "An example collection of D3 + K2 and Omega-3.", "items": ["vitamin-d3-k2", "omega-3-fish-oil"]}, {"id": "curious-edit", "name": "The curious edit", "description": "An example collection of L-Theanine and Creatine Chews.", "items": ["l-theanine", "creatine-chews"]}],
  origin: Deno.env.get('BCC_PUBLIC_ORIGIN') || 'https://body-cafe-co-website.netlify.app',
});
Deno.serve(handler);
