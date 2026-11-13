import { createHandler } from './core.js';
// Public catalogue reads and cookie-authenticated admin requests share this API.
// The platform service key is never sent to the browser or checked into source.
const handler = createHandler({
  release: '20261113-razorpay-2',
  url: Deno.env.get('SUPABASE_URL'),
  serviceKey: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
  // Store assistant (chat.js): the Anthropic API key is a function secret. Without it /api/chat answers 503.
  anthropicKey: Deno.env.get('ANTHROPIC_API_KEY'),
  // Courier booking (shipping.js): the Shipneer API key is a function secret. Without it couriers are booked by hand
  // and the pincode check answers "unknown". The pickup address and pincode default to the Vadodara warehouse.
  shipneerKey: Deno.env.get('SHIPNEER_API_KEY'),
  shipneerPickupId: Deno.env.get('SHIPNEER_PICKUP_ID'),
  shipneerPickupPin: Deno.env.get('SHIPNEER_PICKUP_PIN'),
  // Online payment (razorpay.js): the Razorpay key id and secret are function secrets. Test keys (rzp_test_…) take no
  // money. Without them the payment step answers 503 and nothing is charged.
  razorpayKey: Deno.env.get('RAZORPAY_KEY_ID'),
  razorpaySecret: Deno.env.get('RAZORPAY_KEY_SECRET'),
  bundles: [{"id": "daily-edit", "name": "The daily edit", "description": "An example collection of D3 + K2 and Omega-3.", "items": ["vitamin-d3-k2", "omega-3-fish-oil"]}, {"id": "curious-edit", "name": "The curious edit", "description": "An example collection of L-Theanine and Creatine Chews.", "items": ["l-theanine", "creatine-chews"]}],
  // The Vercel storefront always works, whatever BCC_PUBLIC_ORIGIN is set to; the Netlify address stays for older links.
  origin: [Deno.env.get('BCC_PUBLIC_ORIGIN'), 'https://body-cafe-co-website.vercel.app', 'https://body-cafe-co-website.netlify.app'].filter(Boolean).join(','),
  previewOrigin: /^https:\/\/body-cafe-co-website-[a-z0-9-]+-dharmik123\.vercel\.app$/,
});
Deno.serve(handler);
