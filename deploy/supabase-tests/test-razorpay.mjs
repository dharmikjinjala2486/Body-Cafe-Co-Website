/* Razorpay on the hosted API (supabase/functions/operations/razorpay.js and the pay routes in core.js). The handler
   runs against a real in-memory Postgres with every migration applied; only Razorpay itself is a stand-in, so no
   request leaves this machine. Run: node deploy/supabase-tests/test-razorpay.mjs */
import {PGlite} from '@electric-sql/pglite';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {createHmac} from 'node:crypto';
import {createHandler} from '../../supabase/functions/operations/core.js';
let checks = 0;

const db = new PGlite();
await db.exec('create role anon;create role authenticated;create role service_role;');
for (const f of (await fs.readdir(new URL('../../supabase/migrations/', import.meta.url))).filter(f => f.endsWith('.sql')).sort()) await db.exec(await fs.readFile(new URL('../../supabase/migrations/' + f, import.meta.url), 'utf8'));
const one = async (sql, args = []) => (await db.query(sql, args)).rows[0];
const future = Math.floor(Date.now() / 1000) + 86400 * 90;
await db.query('insert into bcc_products(id,data) values($1,$2)', ['test-product', {id: 'test-product', name: 'Test product', sku: 'TEST-1', price: 899, published: true}]);
await db.query("insert into bcc_batches(id,product,expiry,available,state,proof) values('LOT1','test-product',$1,40,'released',true)", [future]);
await db.query("update bcc_settings set data=jsonb_set(data,'{checkout_enabled}','true') where id='flags'");

// PostgREST and Razorpay stand-ins.
const KEY = 'rzp_test_STANDIN0000001', SECRET = 'stand-in-secret-000000', HOOK = 'stand-in-webhook-secret-0000';
const LIVE_KEY = 'rzp_live_STANDIN0000001', LIVE_SECRET = 'live-stand-in-secret-0000';
const rzp = {orders: [], payments: [], calls: [], down: false, lag: false, n: 0};
const sign = (order, payment, secret = SECRET) => createHmac('sha256', secret).update(order + '|' + payment).digest('hex');
const payAt = (order, status = 'captured') => { const o = rzp.orders.find(x => x.id === order), p = {id: 'pay_STANDIN' + String(++rzp.n).padStart(6, '0'), order_id: order, amount: o.amount, status}; rzp.payments.push(p); o.status = status === 'captured' ? 'paid' : 'attempted'; return p.id; };
const fetchStub = async (url, opts = {}) => {
  const u = new URL(url), name = u.pathname.split('/').pop(), reply = (x, status = 200) => new Response(JSON.stringify(x), {status, headers: {'Content-Type': 'application/json'}});
  if (u.hostname === 'api.razorpay.com') {
    if (rzp.down) throw new TypeError('network down');
    if (![KEY + ':' + SECRET, LIVE_KEY + ':' + LIVE_SECRET].some(k => opts.headers.Authorization === 'Basic ' + btoa(k))) return reply({error: {description: 'Authentication failed'}}, 401);
    const path = u.pathname.replace('/v1/', ''), body = opts.body ? JSON.parse(opts.body) : null; rzp.calls.push([opts.method, path]);
    if (opts.method === 'POST' && path === 'orders') { const o = {id: 'order_STANDIN' + String(++rzp.n).padStart(6, '0'), ...body, status: 'created'}; rzp.orders.push(o); return reply(o); }
    if (path === 'orders') return reply({items: rzp.lag ? [] : rzp.orders.filter(o => o.receipt === u.searchParams.get('receipt'))}); // the real search trails new orders by ~30 s
    if (/^orders\/[^/]+\/payments$/.test(path)) return reply({items: rzp.payments.filter(p => p.order_id === path.split('/')[1])});
    if (path.startsWith('orders/')) { const o = rzp.orders.find(o => o.id === name); return o ? reply(o) : reply({error: {description: 'not found'}}, 400); }
    if (path.startsWith('payments/')) { const p = rzp.payments.find(p => p.id === name); return p ? reply(p) : reply({error: {description: 'not found'}}, 400); }
  }
  if (u.pathname.startsWith('/rest/v1/rpc/')) {
    const args = JSON.parse(opts.body || '{}'), keys = Object.keys(args);
    try { const r = await db.query(`select public.${name}(${keys.map((k, i) => `${k} => $${i + 1}`).join(',')}) r`, keys.map(k => args[k])); return reply(r.rows[0].r ?? null); }
    catch (e) { return reply({message: e.message}, 400); }
  }
  if (u.pathname.startsWith('/rest/v1/bcc_')) {
    const where = [], vals = [];
    for (const [k, v] of u.searchParams) if (v.startsWith('eq.')) { vals.push(v.slice(3)); where.push(`${k}::text=$${vals.length}`); }
    if (opts.method === 'PATCH') { const body = JSON.parse(opts.body), cols = Object.keys(body); await db.query(`update public.${name} set ${cols.map((c, i) => `${c}=$${vals.length + i + 1}`).join(',')} where ${where.join(' and ')}`, [...vals, ...cols.map(c => body[c])]); return new Response(null, {status: 204}); }
    return reply((await db.query(`select * from public.${name}${where.length ? ' where ' + where.join(' and ') : ''}`, vals)).rows);
  }
  return reply([]);
};
const make = (razorpayKey, razorpaySecret, more = {razorpayWebhookSecret: HOOK}) => createHandler({url: 'https://test.supabase.co', serviceKey: 'test-service-secret', origin: 'https://body-cafe-co-website.vercel.app', razorpayKey, razorpaySecret, ...more, fetch: fetchStub, wait: async () => {}});
const fn = make(KEY, SECRET), off = make('', '');
const call = (handler, path, opts = {}) => handler(new Request('https://test.supabase.co/functions/v1/operations/api' + path, opts));
const session = async () => { const r = await call(fn, '/session'); return {csrf: (await r.json()).csrf, cookies: r.headers.getSetCookie().map(c => c.split(';')[0]).join('; ')}; };
const guest = await session(), other = await session();
let seen = '';
const post = async (path, body, who = guest, handler = fn) => { const r = await call(handler, path, {method: 'POST', headers: {Cookie: who.cookies, 'Content-Type': 'application/json', 'X-CSRF-Token': who.csrf, Origin: 'https://body-cafe-co-website.vercel.app'}, body: JSON.stringify(body)}), t = await r.text(); seen += t; return [r.status, JSON.parse(t)]; };
const contact = {name: 'Test Customer', mobile: '9825012345', address: '123 Sample Street', city: 'Surat', state: 'Gujarat', pincode: '395001'};
let orderN = 0;
const place = async (quantity = 1) => { const [s, o] = await post('/orders', {adult: true, idempotency_key: 'razorpay-test-key-' + (++orderN), items: [{id: 'test-product', quantity}], contact}); assert.equal(s, 200, JSON.stringify(o)); return o; };
const row = id => one('select o.state,o.data,p.status,p.captured from bcc_orders o join bcc_payments p on p.order_id=o.id where o.id=$1', [id]);
let s, j;

// Not connected: the payment step says so and nothing changes.
const a = await place();
[s, j] = await post('/orders/' + a.id + '/pay', {}, guest, off); assert.equal(s, 503); assert.match(j.error, /isn’t connected/); checks++;
[s, j] = await post('/orders/' + a.id + '/pay/verify', {razorpay_order_id: 'order_ABCDEF123', razorpay_payment_id: 'pay_ABCDEF123', razorpay_signature: 'x'}, guest, off); assert.equal(s, 503); checks++;

// Start: a Razorpay order for the order's total in paise, with our order number as its receipt. Asking again reuses it.
[s, j] = await post('/orders/' + a.id + '/pay', {}); assert.equal(s, 200, JSON.stringify(j));
assert.equal(j.gateway, 'razorpay'); assert.equal(j.key, KEY); assert.equal(j.amount, a.total * 100); assert.equal(j.currency, 'INR'); assert.equal(j.test, true); assert.equal(j.prefill.contact, '+919825012345'); assert.ok(j.timeout > 600 && j.timeout <= 872);
assert.deepEqual(rzp.orders.map(o => [o.receipt, o.amount]), [[a.id, a.total * 100]]); checks++;
const first = j.rzp_order; assert.equal((await row(a.id)).data.rzp_order, first);
rzp.lag = true; [s, j] = await post('/orders/' + a.id + '/pay', {}); assert.equal(j.rzp_order, first); assert.equal(rzp.orders.length, 1); rzp.lag = false; checks++; // reused from the recorded id even while the receipt search is behind
[s, j] = await post('/orders/' + a.id + '/pay', {}, other); assert.equal(s, 404); checks++; // someone else's order

// Verify refuses: a bad signature, a signature made with another secret, an unpaid order, and another order's payment.
[s, j] = await post('/orders/' + a.id + '/pay/verify', {razorpay_order_id: first, razorpay_payment_id: 'pay_FORGED0000001', razorpay_signature: 'f'.repeat(64)}); assert.equal(s, 400); assert.equal(j.reason, 'signature'); checks++;
[s, j] = await post('/orders/' + a.id + '/pay/verify', {razorpay_order_id: first, razorpay_payment_id: 'pay_FORGED0000001', razorpay_signature: sign(first, 'pay_FORGED0000001', 'wrong-secret')}); assert.equal(s, 400); checks++;
const failed = payAt(first, 'failed');
[s, j] = await post('/orders/' + a.id + '/pay/verify', {razorpay_order_id: first, razorpay_payment_id: failed, razorpay_signature: sign(first, failed)}); assert.equal(s, 409); assert.equal(j.reason, 'not_paid'); checks++;
const b = await place(2); [s, j] = await post('/orders/' + b.id + '/pay', {}); const second = j.rzp_order, bPay = payAt(second);
[s, j] = await post('/orders/' + a.id + '/pay/verify', {razorpay_order_id: second, razorpay_payment_id: bPay, razorpay_signature: sign(second, bPay)}); assert.equal(s, 400); assert.equal(j.reason, 'mismatch'); checks++;
assert.equal((await row(a.id)).state, 'pending'); assert.equal((await row(a.id)).status, 'pending'); checks++;

// A real payment: verified, the order is paid, the payment captured, the stock consumed, the Razorpay ids recorded.
const good = payAt(first);
[s, j] = await post('/orders/' + a.id + '/pay/verify', {razorpay_order_id: first, razorpay_payment_id: good, razorpay_signature: sign(first, good)}); assert.equal(s, 200, JSON.stringify(j)); assert.equal(j.state, 'paid'); assert.equal(j.payment, 'captured');
let r = await row(a.id); assert.equal(r.state, 'paid'); assert.equal(r.status, 'captured'); assert.ok(r.captured); assert.deepEqual([r.data.razorpay.order, r.data.razorpay.payment], [first, good]);
assert.equal((await one("select state from bcc_reservations where order_id=$1", [a.id])).state, 'consumed'); checks++;
[s, j] = await post('/orders/' + a.id + '/pay/verify', {razorpay_order_id: first, razorpay_payment_id: good, razorpay_signature: sign(first, good)}); assert.equal(s, 200); assert.equal(j.idempotent, true); checks++;
[s, j] = await post('/orders/' + a.id + '/pay', {}); assert.equal(j.state, 'paid'); assert.equal(j.idempotent, true); checks++;

// Paid, but the page was lost before verify: opening the payment step again recognises the payment (order b above).
[s, j] = await post('/orders/' + b.id + '/pay', {}); assert.equal(s, 200, JSON.stringify(j)); assert.equal(j.state, 'paid'); r = await row(b.id); assert.equal(r.state, 'paid'); assert.equal(r.data.razorpay.payment, bPay); checks++;

// Authorised but not yet captured when the callback arrives: a signed, authorised payment is a successful payment.
const c = await place(); [s, j] = await post('/orders/' + c.id + '/pay', {}); const third = j.rzp_order, cPay = payAt(third, 'authorized');
[s, j] = await post('/orders/' + c.id + '/pay/verify', {razorpay_order_id: third, razorpay_payment_id: cPay, razorpay_signature: sign(third, cPay)}); assert.equal(s, 200, JSON.stringify(j)); assert.equal((await row(c.id)).state, 'paid'); checks++;

// The hold ended: no new payment can start; a payment that still arrives is recorded for a person and never marks the order paid.
const d = await place(); [s, j] = await post('/orders/' + d.id + '/pay', {}); const fourth = j.rzp_order;
await db.query("update bcc_reservations set expires=1 where order_id=$1", [d.id]); await db.query("update bcc_orders set created=created-1000 where id=$1", [d.id]);
[s, j] = await post('/orders/' + d.id + '/pay', {}); assert.equal(s, 409); assert.equal(j.reason, 'inactive'); assert.equal((await row(d.id)).state, 'expired'); checks++;
const late = payAt(fourth);
[s, j] = await post('/orders/' + d.id + '/pay/verify', {razorpay_order_id: fourth, razorpay_payment_id: late, razorpay_signature: sign(fourth, late)}); assert.equal(s, 409); assert.equal(j.reason, 'paid_after_hold');
r = await row(d.id); assert.equal(r.state, 'expired'); assert.equal(r.status, 'pending'); assert.equal(r.data.payment_after_hold, true); assert.equal(r.data.razorpay.payment, late); checks++;

// Razorpay unreachable: a clear answer, nothing changed.
const e = await place(); rzp.down = true; [s, j] = await post('/orders/' + e.id + '/pay', {}); assert.equal(s, 503); assert.equal(j.reason, 'unavailable'); rzp.down = false; assert.equal((await row(e.id)).state, 'pending'); checks++;

// Webhook (18 Nov 2026): Razorpay's own server reports the payment. No cookie, no CSRF token: its signature is the check.
const hookBody = (kind, ro, pay) => JSON.stringify({event: kind, payload: {payment: {entity: rzp.payments.find(p => p.id === pay) || {id: pay, order_id: ro}}, order: {entity: {id: ro}}}});
const hook = async (body, secret = HOOK, handler = fn) => { const r = await call(handler, '/razorpay/webhook', {method: 'POST', headers: {'Content-Type': 'application/json', 'X-Razorpay-Signature': createHmac('sha256', secret).update(body).digest('hex')}, body}), t = await r.text(); seen += t; return [r.status, JSON.parse(t)]; };
const notes = async id => (await row(id)).data.internal_notes?.length || 0;

// Paid, and the page was closed before verify: the webhook marks it paid, once, however often Razorpay sends it.
const f = await place(); [s, j] = await post('/orders/' + f.id + '/pay', {}); const fifth = j.rzp_order, fPay = payAt(fifth);
[s, j] = await hook(hookBody('payment.captured', fifth, fPay)); assert.equal(s, 200, JSON.stringify(j)); assert.equal(j.state, 'paid');
r = await row(f.id); assert.equal(r.state, 'paid'); assert.equal(r.status, 'captured'); assert.deepEqual([r.data.razorpay.order, r.data.razorpay.payment], [fifth, fPay]);
assert.equal(r.data.internal_notes.at(-1).actor, 'razorpay-webhook'); checks++;
const fNotes = await notes(f.id);
[s, j] = await hook(hookBody('order.paid', fifth, fPay)); assert.equal(s, 200); assert.equal(j.idempotent, true);
[s, j] = await post('/orders/' + f.id + '/pay/verify', {razorpay_order_id: fifth, razorpay_payment_id: fPay, razorpay_signature: sign(fifth, fPay)}); assert.equal(j.idempotent, true);
assert.equal(await notes(f.id), fNotes); checks++;
const g = await place(); [s, j] = await post('/orders/' + g.id + '/pay', {}); const sixth = j.rzp_order, gPay = payAt(sixth, 'authorized');
[s, j] = await hook(hookBody('payment.authorized', sixth, gPay)); assert.equal(j.state, 'paid'); assert.equal((await row(g.id)).state, 'paid'); checks++;

// Refused: unsigned, signed with another secret or with the API secret, and not JSON.
const h = await place(); [s, j] = await post('/orders/' + h.id + '/pay', {}); const seventh = j.rzp_order, hPay = payAt(seventh);
for (const secret of ['wrong-secret', SECRET]) { [s, j] = await hook(hookBody('payment.captured', seventh, hPay), secret); assert.equal(s, 400); assert.equal(j.reason, 'signature'); }
{ const r = await call(fn, '/razorpay/webhook', {method: 'POST', body: hookBody('payment.captured', seventh, hPay)}); assert.equal(r.status, 400); }
[s, j] = await hook('not json'); assert.equal(s, 400);
assert.equal((await row(h.id)).state, 'pending'); checks++;

// Ignored (200, so Razorpay doesn't retry): other events, other Razorpay orders, a wrong total, and a payment Razorpay says failed.
[s, j] = await hook(hookBody('refund.processed', seventh, hPay)); assert.equal(j.ignored, 'refund.processed');
[s, j] = await hook(JSON.stringify({event: 'payment.captured', payload: {payment: {entity: {id: hPay, order_id: 'not-an-id'}}}})); assert.equal(j.ignored, 'no_order');
[s, j] = await hook(JSON.stringify({event: 'order.paid', payload: {order: 'x', payment: []}})); assert.equal(j.ignored, 'no_order');
rzp.orders.push({id: 'order_ELSEWHERE01', amount: 100, currency: 'INR', receipt: 'payment-link-7', status: 'paid'}); [s, j] = await hook(hookBody('order.paid', 'order_ELSEWHERE01')); assert.equal(j.ignored, 'not_ours');
rzp.orders.push({id: 'order_NOSUCHORDER', amount: 100, currency: 'INR', receipt: 'BCC-00000000', status: 'paid'}); [s, j] = await hook(hookBody('order.paid', 'order_NOSUCHORDER')); assert.equal(j.ignored, 'unknown_order');
rzp.orders.push({id: 'order_WRONGTOTAL1', amount: 100, currency: 'INR', receipt: h.id, status: 'paid'}); [s, j] = await hook(hookBody('order.paid', 'order_WRONGTOTAL1')); assert.equal(j.ignored, 'mismatch');
const k = await place(); [s, j] = await post('/orders/' + k.id + '/pay', {}); const eighth = j.rzp_order, kFail = payAt(eighth, 'failed');
[s, j] = await hook(hookBody('payment.captured', eighth, kFail)); assert.equal(j.ignored, 'not_paid'); assert.equal((await row(k.id)).state, 'pending');
assert.equal((await row(h.id)).state, 'pending'); checks++;

// Not set up, or Razorpay unreachable: 5xx, so Razorpay tries again later.
[s, j] = await hook(hookBody('payment.captured', seventh, hPay), HOOK, make(KEY, SECRET, {})); assert.equal(s, 503);
rzp.down = true; [s, j] = await hook(hookBody('payment.captured', seventh, hPay)); assert.equal(s, 503); rzp.down = false; checks++;

// After the hold: recorded for a person once, however many events arrive, and never marked paid.
const m = await place(); [s, j] = await post('/orders/' + m.id + '/pay', {}); const ninth = j.rzp_order;
await db.query("update bcc_reservations set expires=1 where order_id=$1", [m.id]); await db.query("update bcc_orders set created=created-1000 where id=$1", [m.id]);
await post('/orders/' + m.id + '/pay', {}); const mPay = payAt(ninth);
[s, j] = await hook(hookBody('payment.captured', ninth, mPay)); assert.equal(s, 200); assert.equal(j.state, 'paid_after_hold');
const mNotes = await notes(m.id);
[s, j] = await hook(hookBody('order.paid', ninth, mPay)); assert.equal(j.state, 'paid_after_hold');
[s, j] = await post('/orders/' + m.id + '/pay/verify', {razorpay_order_id: ninth, razorpay_payment_id: mPay, razorpay_signature: sign(ninth, mPay)}); assert.equal(j.reason, 'paid_after_hold');
r = await row(m.id); assert.equal(r.state, 'expired'); assert.equal(r.data.payment_after_hold, true); assert.equal(await notes(m.id), mNotes); checks++;

// An order whose recorded Razorpay order belongs to the other mode (made before a test/live switch) gets a new one at Pay.
const q = await place(); [s, j] = await post('/orders/' + q.id + '/pay', {}); const before = j.rzp_order;
rzp.orders = rzp.orders.filter(o => o.id !== before);
[s, j] = await post('/orders/' + q.id + '/pay', {}); assert.equal(s, 200, JSON.stringify(j)); assert.notEqual(j.rzp_order, before); assert.equal((await row(q.id)).data.rzp_order, j.rzp_order); checks++;

// RAZORPAY_MODE: live uses the live pair; neither mode runs on the other kind of key; live never borrows the test pair.
const live = make(KEY, SECRET, {razorpayMode: 'live', razorpayLiveKey: LIVE_KEY, razorpayLiveSecret: LIVE_SECRET});
const n = await place(); [s, j] = await post('/orders/' + n.id + '/pay', {}, guest, live); assert.equal(s, 200, JSON.stringify(j)); assert.equal(j.key, LIVE_KEY); assert.equal(j.test, false); checks++;
[s, j] = await post('/orders/' + n.id + '/pay', {}, guest, make(KEY, SECRET, {razorpayMode: 'live', razorpayLiveKey: KEY, razorpayLiveSecret: SECRET})); assert.equal(s, 503); assert.match(j.error, /RAZORPAY_MODE/);
[s, j] = await post('/orders/' + n.id + '/pay', {}, guest, make(LIVE_KEY, LIVE_SECRET)); assert.equal(s, 503); assert.match(j.error, /RAZORPAY_MODE/);
[s, j] = await post('/orders/' + n.id + '/pay', {}, guest, make(KEY, SECRET, {razorpayMode: 'live'})); assert.equal(s, 503); assert.match(j.error, /isn’t connected/); checks++;

assert.ok(!seen.includes(SECRET) && !seen.includes(HOOK) && !seen.includes(LIVE_SECRET)); checks++; // no secret appears in anything the API returned
console.log(checks + ' hosted Razorpay checks passed.');
