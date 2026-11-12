import { createHandler } from './core.js';
// Public catalogue reads and cookie-authenticated admin requests share this API.
// The platform service key is never sent to the browser or checked into source.
const handler = createHandler({
  release: '20261112-store-assistant',
  url: Deno.env.get('SUPABASE_URL'),
  serviceKey: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
  // Store assistant (chat.js): the Anthropic API key is a function secret. Without it /api/chat answers 503.
  anthropicKey: Deno.env.get('ANTHROPIC_API_KEY'),
  bundles: [{"id": "daily-edit", "name": "The daily edit", "description": "An example collection of D3 + K2 and Omega-3.", "items": ["vitamin-d3-k2", "omega-3-fish-oil"]}, {"id": "curious-edit", "name": "The curious edit", "description": "An example collection of L-Theanine and Creatine Chews.", "items": ["l-theanine", "creatine-chews"]}],
  // The Vercel storefront always works, whatever BCC_PUBLIC_ORIGIN is set to; the Netlify address stays for older links.
  origin: [Deno.env.get('BCC_PUBLIC_ORIGIN'), 'https://body-cafe-co-website.vercel.app', 'https://body-cafe-co-website.netlify.app'].filter(Boolean).join(','),
  previewOrigin: /^https:\/\/body-cafe-co-website-[a-z0-9-]+-dharmik123\.vercel\.app$/,
});
Deno.serve(handler);
