import { createHandler } from './core.js';
// Public catalogue reads and cookie-authenticated admin requests share this API.
// The platform service key is never sent to the browser or checked into source.
const handler = createHandler({
  release: '20261118-razorpay-webhook-2',
  url: Deno.env.get('SUPABASE_URL'),
  serviceKey: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
  // Store assistant (chat.js): the Anthropic API key is a function secret. Without it /api/chat answers 503.
  anthropicKey: Deno.env.get('ANTHROPIC_API_KEY'),
  // Courier booking (shipping.js): the Shipneer API key is a function secret. Without it couriers are booked by hand
  // and the pincode check answers "unknown". The pickup address and pincode default to the Vadodara warehouse.
  shipneerKey: Deno.env.get('SHIPNEER_API_KEY'),
  shipneerPickupId: Deno.env.get('SHIPNEER_PICKUP_ID'),
  shipneerPickupPin: Deno.env.get('SHIPNEER_PICKUP_PIN'),
  // Online payment (razorpay.js): function secrets. RAZORPAY_MODE "live" uses the live pair (real money); anything else
  // the test pair (rzp_test_…, no money). Without the chosen pair the payment step answers 503 and nothing is charged.
  // The webhook (…/api/razorpay/webhook) checks RAZORPAY_WEBHOOK_SECRET, the secret entered in Razorpay's dashboard.
  razorpayMode: Deno.env.get('RAZORPAY_MODE'),
  razorpayKey: Deno.env.get('RAZORPAY_KEY_ID'),
  razorpaySecret: Deno.env.get('RAZORPAY_KEY_SECRET'),
  razorpayLiveKey: Deno.env.get('RAZORPAY_LIVE_KEY_ID'),
  razorpayLiveSecret: Deno.env.get('RAZORPAY_LIVE_KEY_SECRET'),
  razorpayWebhookSecret: Deno.env.get('RAZORPAY_WEBHOOK_SECRET'),
  // Messages (msg91.js): order messages by SMS, WhatsApp and email, and Supabase Auth's text-message codes through the
  // Send SMS hook. All function secrets; see MSG91-TEMPLATES.md. A message whose template is not set is not sent.
  msg91: {
    key: Deno.env.get('MSG91_AUTHKEY'),
    otpTemplate: Deno.env.get('MSG91_OTP_TEMPLATE'),
    hookSecret: Deno.env.get('SEND_SMS_HOOK_SECRET'),
    sms: {order_paid: Deno.env.get('MSG91_SMS_ORDER_PAID'), order_shipped: Deno.env.get('MSG91_SMS_ORDER_SHIPPED'), order_delivered: Deno.env.get('MSG91_SMS_ORDER_DELIVERED'), order_cancelled: Deno.env.get('MSG91_SMS_ORDER_CANCELLED')},
    waNumber: Deno.env.get('MSG91_WA_NUMBER'),
    waLang: Deno.env.get('MSG91_WA_LANG'),
    wa: {order_paid: Deno.env.get('MSG91_WA_ORDER_PAID'), order_shipped: Deno.env.get('MSG91_WA_ORDER_SHIPPED'), order_delivered: Deno.env.get('MSG91_WA_ORDER_DELIVERED'), order_cancelled: Deno.env.get('MSG91_WA_ORDER_CANCELLED')},
    emailDomain: Deno.env.get('MSG91_EMAIL_DOMAIN'),
    emailFrom: Deno.env.get('MSG91_EMAIL_FROM'),
    emailFromName: Deno.env.get('MSG91_EMAIL_FROM_NAME'),
    email: {order_paid: Deno.env.get('MSG91_EMAIL_ORDER_PAID'), order_shipped: Deno.env.get('MSG91_EMAIL_ORDER_SHIPPED'), order_delivered: Deno.env.get('MSG91_EMAIL_ORDER_DELIVERED'), order_cancelled: Deno.env.get('MSG91_EMAIL_ORDER_CANCELLED')},
  },
  // Links in messages point here (the customer's orders page).
  publicOrigin: Deno.env.get('BCC_PUBLIC_ORIGIN') || 'https://body-cafe-co-website.vercel.app',
  bundles: [{"id": "daily-edit", "name": "The daily edit", "description": "An example collection of D3 + K2 and Omega-3.", "items": ["vitamin-d3-k2", "omega-3-fish-oil"]}, {"id": "curious-edit", "name": "The curious edit", "description": "An example collection of L-Theanine and Creatine Chews.", "items": ["l-theanine", "creatine-chews"]}],
  // The Vercel storefront always works, whatever BCC_PUBLIC_ORIGIN is set to; the Netlify address stays for older links.
  origin: [Deno.env.get('BCC_PUBLIC_ORIGIN'), 'https://body-cafe-co-website.vercel.app', 'https://body-cafe-co-website.netlify.app'].filter(Boolean).join(','),
  previewOrigin: /^https:\/\/body-cafe-co-website-[a-z0-9-]+-dharmik123\.vercel\.app$/,
});
Deno.serve(handler);
