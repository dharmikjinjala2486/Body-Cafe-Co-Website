/* MSG91 on the hosted API (supabase/functions/operations/msg91.js and its uses in core.js). The handler runs against a
   real in-memory Postgres with every migration applied; Razorpay and MSG91 are stand-ins, so no message leaves this
   machine. Run: node deploy/supabase-tests/test-msg91.mjs */
import {PGlite} from '@electric-sql/pglite';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {createHmac} from 'node:crypto';
import {createHandler} from '../../supabase/functions/operations/core.js';
import {msg91, inr, hookSigned} from '../../supabase/functions/operations/msg91.js';
let checks = 0;

const db = new PGlite();
await db.exec('create role anon;create role authenticated;create role service_role;');
for (const f of (await fs.readdir(new URL('../../supabase/migrations/', import.meta.url))).filter(f => f.endsWith('.sql')).sort()) await db.exec(await fs.readFile(new URL('../../supabase/migrations/' + f, import.meta.url), 'utf8'));
const one = async (sql, args = []) => (await db.query(sql, args)).rows[0];
const future = Math.floor(Date.now() / 1000) + 86400 * 90;
await db.query('insert into bcc_products(id,data) values($1,$2)', ['test-product', {id: 'test-product', name: 'Test product', sku: 'TEST-1', price: 899, published: true}]);
await db.query("insert into bcc_batches(id,product,expiry,available,state,proof) values('LOT1','test-product',$1,40,'released',true)", [future]);
await db.query("update bcc_settings set data=jsonb_set(data,'{checkout_enabled}','true') where id='flags'");
await db.query("insert into bcc_admin(auth_user_id,username) values('00000000-0000-4000-8000-000000000001','bodycafe.com')");

const RKEY = 'rzp_test_STANDIN0000001', RSECRET = 'stand-in-secret-000000', AUTH = 'msg91-stand-in-key-0001', uid = '00000000-0000-4000-8000-000000000001';
const HOOK_KEY = Buffer.from('a-stand-in-hook-secret-32-bytes!').toString('base64'), HOOK = 'v1,whsec_' + HOOK_KEY;
const rzp = {orders: [], payments: [], n: 0}, sent = [];
let refuse = '';
const sign = (order, payment) => createHmac('sha256', RSECRET).update(order + '|' + payment).digest('hex');
const payAt = order => { const o = rzp.orders.find(x => x.id === order), p = {id: 'pay_STANDIN' + String(++rzp.n).padStart(6, '0'), order_id: order, amount: o.amount, status: 'captured'}; rzp.payments.push(p); o.status = 'paid'; return p.id; };
const fetchStub = async (url, opts = {}) => {
  const u = new URL(url), name = u.pathname.split('/').pop(), reply = (x, status = 200) => new Response(JSON.stringify(x), {status, headers: {'Content-Type': 'application/json'}});
  if (u.hostname === 'control.msg91.com') {
    assert.equal(opts.headers.authkey, AUTH);
    sent.push({path: u.pathname.replace('/api/v5/', ''), query: Object.fromEntries(u.searchParams), body: opts.body ? JSON.parse(opts.body) : null});
    return reply(refuse ? {type: 'error', message: refuse} : {type: 'success', request_id: 'r1'});
  }
  if (u.hostname === 'api.razorpay.com') {
    const path = u.pathname.replace('/v1/', ''), body = opts.body ? JSON.parse(opts.body) : null;
    if (opts.method === 'POST' && path === 'orders') { const o = {id: 'order_STANDIN' + String(++rzp.n).padStart(6, '0'), ...body, status: 'created'}; rzp.orders.push(o); return reply(o); }
    if (path === 'orders') return reply({items: rzp.orders.filter(o => o.receipt === u.searchParams.get('receipt'))});
    if (/^orders\/[^/]+\/payments$/.test(path)) return reply({items: rzp.payments.filter(p => p.order_id === path.split('/')[1])});
    if (path.startsWith('orders/')) return reply(rzp.orders.find(o => o.id === name));
  }
  if (u.pathname === '/auth/v1/user') return reply({id: uid, user_metadata: {}});
  if (u.pathname.startsWith('/auth/v1/admin/users/')) return reply({id: uid, email: 'admin@example.test'});
  if (name === 'bcc_admin') return reply([{auth_user_id: uid, username: 'bodycafe.com'}]);
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
const SETTINGS = {key: AUTH, otpTemplate: 'otp-tpl', hookSecret: HOOK, sms: {order_paid: 'sms-paid', order_shipped: 'sms-shipped', order_cancelled: 'sms-cancelled'}, waNumber: '919274248974', wa: {order_paid: 'bcc_order_paid'}, emailDomain: 'mail.example.com', emailFrom: 'orders@mail.example.com', email: {order_paid: 'bcc-order-paid'}};
const make = settings => createHandler({url: 'https://test.supabase.co', serviceKey: 'test-service-secret', origin: 'https://body-cafe-co-website.vercel.app', publicOrigin: 'https://shop.example.com', razorpayKey: RKEY, razorpaySecret: RSECRET, msg91: settings, fetch: fetchStub, wait: async () => {}});
const fn = make(SETTINGS), quiet = make({});
const call = (handler, path, opts = {}) => handler(new Request('https://test.supabase.co/functions/v1/operations/api' + path, opts));
const guestRes = await call(fn, '/session'), guest = {csrf: (await guestRes.json()).csrf, cookies: guestRes.headers.getSetCookie().map(c => c.split(';')[0]).join('; ')};
const signedPart = Buffer.from(JSON.stringify({token: 'good-admin', version: 0, expires: Math.floor(Date.now() / 1000) + 3600})).toString('base64url');
const signing = await crypto.subtle.importKey('raw', new TextEncoder().encode('test-service-secret'), {name: 'HMAC', hash: 'SHA-256'}, false, ['sign']);
const adminCookie = 'bcc_admin=' + signedPart + '.' + Buffer.from(await crypto.subtle.sign('HMAC', signing, new TextEncoder().encode(signedPart))).toString('hex');
const adminRes = await call(fn, '/admin/session', {headers: {Cookie: adminCookie}}), adminSession = await adminRes.json();
const admin = {csrf: adminSession.csrf, cookies: [adminCookie, ...adminRes.headers.getSetCookie().map(c => c.split(';')[0])].join('; ')};
const post = async (path, body, who = guest, handler = fn) => { const r = await call(handler, path, {method: 'POST', headers: {Cookie: who.cookies, 'Content-Type': 'application/json', 'X-CSRF-Token': who.csrf, Origin: 'https://body-cafe-co-website.vercel.app'}, body: JSON.stringify(body)}); return [r.status, await r.json()]; };
const contact = {name: 'Asha Patel', mobile: '9825012345', email: 'asha@example.com', address: '123 Sample Street', city: 'Surat', state: 'Gujarat', pincode: '395001'};
let n = 0;
const place = async (extra = {}) => { const [s, o] = await post('/orders', {adult: true, idempotency_key: 'msg91-test-key-' + (++n), items: [{id: 'test-product', quantity: 2}], contact: {...contact, ...extra}}); assert.equal(s, 200, JSON.stringify(o)); return o; };
const verify = (o, ro, p, handler = fn) => post('/orders/' + o.id + '/pay/verify', {razorpay_order_id: ro, razorpay_payment_id: p, razorpay_signature: sign(ro, p)}, guest, handler);
const pay = async (o, handler = fn) => { const [, j] = await post('/orders/' + o.id + '/pay', {}, guest, handler), p = payAt(j.rzp_order); o.paid = [j.rzp_order, p]; return verify(o, j.rzp_order, p, handler); };
const notices = async id => (await one('select data from bcc_orders where id=$1', [id])).data.notices || {};
const to = path => sent.filter(x => x.path === path);
let s, j;

// Rupees in Indian grouping.
assert.deepEqual([0, 75, 1299, 123456, 12345678].map(inr), ['0', '75', '1,299', '1,23,456', '1,23,45,678']); checks++;

// A paid order: one SMS and one email with the agreed variables; WhatsApp only when asked for. Paying again sends nothing.
const a = await place();
[s, j] = await pay(a); assert.equal(s, 200, JSON.stringify(j));
let sms = to('flow'); assert.equal(sms.length, 1);
assert.deepEqual(sms[0].body, {template_id: 'sms-paid', short_url: '0', recipients: [{mobiles: '919825012345', amount: inr(a.total), order: a.id, link: 'https://shop.example.com/account/orders'}]});
const mail = to('email/send')[0].body;
assert.deepEqual([mail.template_id, mail.domain, mail.from.email, mail.recipients[0].to[0].email, mail.recipients[0].variables.name], ['bcc-order-paid', 'mail.example.com', 'orders@mail.example.com', 'asha@example.com', 'Asha']);
assert.match(mail.recipients[0].variables.items, /Test product × 2/);
let rec = (await notices(a.id)).order_paid; assert.deepEqual([rec.sms, rec.email, rec.whatsapp], ['sent', 'sent', 'skipped: not asked for']); checks++;
[s, j] = await verify(a, ...a.paid); assert.equal(j.idempotent, true); assert.equal(to('flow').length, 1); checks++;

const b = await place({whatsapp_updates: true});
await pay(b);
const wa = to('whatsapp/whatsapp-outbound-message/bulk/'); assert.equal(wa.length, 1);
const t = wa[0].body.payload.template;
assert.deepEqual([wa[0].body.integrated_number, t.name, t.language.code, t.to_and_components[0].to[0]], ['919274248974', 'bcc_order_paid', 'en', '919825012345']);
assert.deepEqual(Object.values(t.to_and_components[0].components).map(c => c.value), ['Asha', b.id, inr(b.total), 'https://shop.example.com/account/orders']);
assert.equal((await one('select data from bcc_orders where id=$1', [b.id])).data.contact.whatsapp_updates, true); checks++;

// Staff mark an order shipped: the shipped SMS carries the courier and tracking number. An unpaid cancelled order gets nothing.
[s, j] = await post('/admin/order_update', {id: a.id, state: 'shipped', provider: 'Delhivery', tracking: 'AWB123456', remarks: 'Packed and handed over'}, admin); assert.equal(s, 200, JSON.stringify(j));
sms = to('flow').at(-1).body; assert.equal(sms.template_id, 'sms-shipped');
assert.deepEqual([sms.recipients[0].order, sms.recipients[0].courier, sms.recipients[0].awb], [a.id, 'Delhivery', 'AWB123456']); checks++;
const c = await place(), before = sent.length;
[s, j] = await post('/admin/order_update', {id: c.id, state: 'cancelled', remarks: 'Customer asked by phone'}, admin); assert.equal(s, 200, JSON.stringify(j));
assert.equal(sent.length, before); assert.equal((await notices(c.id)).order_cancelled, undefined); checks++;
const d = await place(); await pay(d);
[s, j] = await post('/admin/order_update', {id: d.id, state: 'cancelled', remarks: 'Customer asked by phone'}, admin); assert.equal(s, 200, JSON.stringify(j));
assert.equal(to('flow').at(-1).body.template_id, 'sms-cancelled'); checks++;

// A refusal (MSG91 answers HTTP 200 with type "error") is recorded on the order; the payment still succeeds.
refuse = 'Insufficient balance';
const e = await place(); [s, j] = await pay(e); assert.equal(s, 200); assert.equal(j.state, 'paid');
assert.match((await notices(e.id)).order_paid.sms, /^failed: MSG91 refused the request\. Insufficient balance/); refuse = ''; checks++;

// Without the key nothing is sent and nothing is recorded.
const q = await place(), quietBefore = sent.length; await pay(q, quiet);
assert.equal(sent.length, quietBefore); assert.deepEqual(await notices(q.id), {}); checks++;

// Supabase's Send SMS hook: a signed request delivers Supabase's code through SendOTP; anything unsigned is refused.
const hookReq = (body, {secret = HOOK_KEY, ts = Math.floor(Date.now() / 1000), id = 'msg_1'} = {}) => {
  const raw = JSON.stringify(body), sig = createHmac('sha256', Buffer.from(secret, 'base64')).update(`${id}.${ts}.${raw}`).digest('base64');
  return new Request('https://test.supabase.co/functions/v1/operations/hooks/send-sms', {method: 'POST', headers: {'webhook-id': id, 'webhook-timestamp': String(ts), 'webhook-signature': 'v1,' + sig, 'Content-Type': 'application/json'}, body: raw});
};
const payload = {user: {id: uid, phone: '919825012345'}, sms: {otp: '482913'}};
let r = await fn(hookReq(payload)); assert.equal(r.status, 200); assert.deepEqual(await r.json(), {});
const otp = to('otp').at(-1); assert.deepEqual([otp.query.template_id, otp.query.mobile, otp.query.otp, otp.query.otp_length], ['otp-tpl', '919825012345', '482913', '6']); checks++;
const otpBefore = to('otp').length;
r = await fn(hookReq(payload, {secret: Buffer.from('some-other-secret-of-32-bytes!!!').toString('base64')})); assert.equal(r.status, 401); checks++;
r = await fn(hookReq(payload, {ts: Math.floor(Date.now() / 1000) - 3600})); assert.equal(r.status, 401); checks++;
r = await fn(new Request('https://test.supabase.co/functions/v1/operations/hooks/send-sms', {method: 'POST', body: JSON.stringify(payload)})); assert.equal(r.status, 401); checks++;
assert.equal(to('otp').length, otpBefore);
refuse = 'The provided flow ID or template ID is invalid.';
r = await fn(hookReq(payload)); assert.equal(r.status, 503); assert.equal((await r.json()).error.http_code, 503); refuse = ''; checks++;
assert.equal(await hookSigned(new Headers({'webhook-id': 'x', 'webhook-timestamp': '1', 'webhook-signature': 'v1,abc'}), '{}', ''), false); checks++;

// The key never appears in anything the API returns or records.
assert.ok(!JSON.stringify(await db.query('select data from bcc_orders')).includes(AUTH)); checks++;
assert.equal(msg91({}).configured, false); checks++;

console.log(`MSG91 hosted tests passed: ${checks} checks.`);
