/* Shipneer on the hosted API (supabase/functions/operations/shipping.js, the ship_* routes in core.js and
   supabase/migrations/202611120002_shipping.sql). The handler runs against a real in-memory Postgres with every
   migration applied; only Shipneer itself and sign-in are stand-ins. Run: node deploy/supabase-tests/test-shipping.mjs */
import {PGlite} from '@electric-sql/pglite';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {createHandler} from '../../supabase/functions/operations/core.js';
import {stateCode, stateName, istEpoch, defaultParcel, deliveryDays, orderPayload} from '../../supabase/functions/operations/shipping.js';
let checks = 0;
const fail = (m, s) => Object.assign(new Error(m), {status: s});

// Pure helpers agree with app/shipping.py.
assert.equal(stateCode('gujarat', fail), 'GJ'); assert.equal(stateCode('Jammu & Kashmir', fail), 'JK'); assert.equal(stateCode('MH', fail), 'MH'); assert.equal(stateCode(' New Delhi. ', fail), 'DL');
assert.throws(() => stateCode('Atlantis', fail), /recognised Indian state/); assert.throws(() => stateName('Atlantis', fail), /Choose your state/); assert.equal(stateName('dd', fail), 'Dadra and Nagar Haveli and Daman and Diu'); checks++;
assert.equal(istEpoch('04/11/26 19:29:00'), Date.UTC(2026, 10, 4, 13, 59, 0) / 1000); assert.equal(istEpoch('2026-11-04 19:29:00'), istEpoch('04-11-2026 19:29:00')); assert.equal(istEpoch('soon'), null); checks++;
assert.deepEqual(defaultParcel([{quantity: 2}]), {weight_g: 400, length: 15, width: 10, height: 8}); assert.deepEqual(defaultParcel([{quantity: 3}]), {weight_g: 550, length: 20, width: 15, height: 10}); checks++;
assert.deepEqual(deliveryDays('395001'), [2, 3]); assert.deepEqual(deliveryDays('400001'), [3, 5]); assert.deepEqual(deliveryDays('744101'), [5, 8]); assert.deepEqual(deliveryDays('110001'), [4, 6]); checks++;
const long = orderPayload('BCC-1', {contact: {name: 'A', mobile: '9876543210', address: 'Flat 12, Sunrise Residency, Near the old water tank and the municipal garden, Opposite the State Bank branch, Ring Road, Adajan', city: 'Surat', state: 'Gujarat', pincode: '395009'}, items: [{id: 'p', name: 'P', quantity: 2, unit_price: 500}], total: 1000}, {weight_g: 400, length: 15, width: 10, height: 8}, 1793000000, 4242, 'PICK', fail);
assert.ok(long.delivery.address_line1.length <= 100 && long.delivery.address_line2.length > 0); assert.equal(long.order.order_id, 4242); assert.equal(long.order.order_number, 'BCC-1'); assert.equal(long.items[0].weight, 0.2); assert.match(long.order.date, /^\d{4}-\d\d-\d\d \d\d:\d\d:\d\d$/); checks++;

// A real database with every migration.
const db = new PGlite();
await db.exec('create role anon;create role authenticated;create role service_role;');
for (const f of (await fs.readdir(new URL('../../supabase/migrations/', import.meta.url))).filter(f => f.endsWith('.sql')).sort()) await db.exec(await fs.readFile(new URL('../../supabase/migrations/' + f, import.meta.url), 'utf8'));
await db.exec(await fs.readFile(new URL('../../supabase/migrations/202611120002_shipping.sql', import.meta.url), 'utf8')); checks++; // repeatable
const one = async (sql, args = []) => (await db.query(sql, args)).rows[0];
const future = Math.floor(Date.now() / 1000) + 86400 * 90;
await db.query('insert into bcc_products(id,data) values($1,$2)', ['test-product', {id: 'test-product', name: 'Test product', sku: 'TEST-1', price: 899, published: true}]);
await db.query("insert into bcc_batches(id,product,expiry,available,state,proof) values('LOT1','test-product',$1,40,'released',true)", [future]);
await db.query("update bcc_settings set data=jsonb_set(data,'{checkout_enabled}','true') where id='flags'");

// PostgREST, sign-in and Shipneer stand-ins.
const KEY = 'shipneer-secret-key-000', uid = '00000000-0000-4000-8000-000000000001';
let shipCalls = [], shipReply = {}, down = false;
const courierList = [{courier_name: ' Delhivery 0.5Kg', courier_code: 'DL5', rate: {price: 50, gst: 9, rate: 59}}, {courier_name: 'Xpressbees 0.5Kg', courier_code: 'XB5', rate: {price: 40, gst: 7.2, rate: 47.2}}, {courier_name: 'No code'}];
const fetchStub = async (url, opts = {}) => {
  const u = new URL(url), name = u.pathname.split('/').pop(), reply = (x, status = 200) => new Response(JSON.stringify(x), {status, headers: {'Content-Type': 'application/json'}});
  if (u.hostname === 'shipneer.com') {
    assert.equal(opts.headers['X-API-KEY'], KEY);
    const body = opts.body ? JSON.parse(opts.body) : null; shipCalls.push({endpoint: name, body, query: Object.fromEntries(u.searchParams)});
    if (down) throw new TypeError('network down');
    const r = shipReply[name]; return typeof r === 'function' ? r(body, u) : reply(r);
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
    return reply((await db.query(`select * from public.${name}${where.length ? ' where ' + where.join(' and ') : ''}`, vals)).rows);
  }
  return reply([]);
};
const make = shipneerKey => createHandler({url: 'https://test.supabase.co', serviceKey: 'test-service-secret', origin: 'https://body-cafe-co-website.vercel.app', shipneerKey, fetch: fetchStub, wait: async () => {}});
const fn = make(KEY), off = make('');
const call = (handler, path, opts = {}) => handler(new Request('https://test.supabase.co/functions/v1/operations/api' + path, opts));

// Sessions: a shopper (guest) and the administrator.
const guestRes = await call(fn, '/session'), guest = await guestRes.json(), guestCookies = guestRes.headers.getSetCookie().map(c => c.split(';')[0]).join('; ');
const signedPart = Buffer.from(JSON.stringify({token: 'good-admin', version: 0, expires: Math.floor(Date.now() / 1000) + 3600})).toString('base64url');
const signing = await crypto.subtle.importKey('raw', new TextEncoder().encode('test-service-secret'), {name: 'HMAC', hash: 'SHA-256'}, false, ['sign']);
const adminCookie = 'bcc_admin=' + signedPart + '.' + Buffer.from(await crypto.subtle.sign('HMAC', signing, new TextEncoder().encode(signedPart))).toString('hex');
const adminRes = await call(fn, '/admin/session', {headers: {Cookie: adminCookie}}), adminSession = await adminRes.json();
assert.equal(adminSession.user.role, 'admin');
const adminCookies = [adminCookie, ...adminRes.headers.getSetCookie().map(c => c.split(';')[0])].join('; ');
const get = (path, cookies = guestCookies, handler = fn) => call(handler, path, {headers: {Cookie: cookies}});
const post = (path, body, cookies = adminCookies, csrf = adminSession.csrf, handler = fn) => call(handler, path, {method: 'POST', headers: {Cookie: cookies, 'Content-Type': 'application/json', 'X-CSRF-Token': csrf, Origin: 'https://body-cafe-co-website.vercel.app'}, body: JSON.stringify(body)});
let seen = '';
const read = async r => { const t = await r.text(); seen += t; try { return JSON.parse(t); } catch { return t; } };

// ---------- Pincode check
shipReply.rate_calculator = {status: 'success', courier_list: courierList};
let r = await get('/delivery?pincode=395001', guestCookies, off), j = await read(r);
assert.equal(j.status, 'unknown'); assert.equal(j.fee, 75); assert.equal(j.free_from, 1499); assert.equal(shipCalls.length, 0); checks++;
r = await get('/delivery?pincode=012345'); j = await read(r); assert.equal(r.status, 400); assert.equal(j.field, 'pincode'); checks++;
r = await get('/delivery?pincode=395001'); j = await read(r);
assert.equal(r.status, 200); assert.equal(j.status, 'yes'); assert.deepEqual(j.days, [2, 3]); assert.equal(j.fee, 75);
assert.deepEqual(shipCalls[0].body, {pickup_pin: '391243', destination_pin: '395001', weight: 250, length: 15, width: 10, height: 8, shipment_type: 'P', shipment_value: 1000}); checks++;
r = await get('/delivery?pincode=395001'); j = await read(r); assert.equal(j.status, 'yes'); assert.equal(shipCalls.length, 1); checks++; // answered from the cache
shipReply.rate_calculator = () => new Response(JSON.stringify({status: 'error', message: 'destination_pin is not serviceable'}), {status: 400});
j = await read(await get('/delivery?pincode=999999')); assert.equal(j.status, 'no'); assert.ok(!('days' in j)); checks++;
down = true; j = await read(await get('/delivery?pincode=560001')); assert.equal(j.status, 'unknown'); down = false;
shipReply.rate_calculator = {status: 'success', courier_list: courierList};
j = await read(await get('/delivery?pincode=560001')); assert.equal(j.status, 'yes'); checks++; // an outage is not remembered
await db.query("update bcc_chat_usage set count=30 where scope=$1", ['d:' + guest.user.id]);
r = await get('/delivery?pincode=600001'); assert.equal(r.status, 429); await read(r);
j = await read(await get('/delivery?pincode=395001')); assert.equal(j.status, 'yes'); checks++; // cached answers stay free

// ---------- Orders: placed by the shopper, paid, then booked by staff.
const contact = {name: 'Test Buyer', mobile: '9876543210', email: 'buyer@example.com', address: 'Test address 123', city: 'Surat', state: 'Gujarat', pincode: '395001'};
let n = 0;
const order = async (qty = 2) => { const o = (await one('select bcc_checkout($1,$2,$3,$4) r', [guest.user.id, 'checkout-key-' + String(++n).padStart(2, '0'), [{id: 'test-product', quantity: qty}], contact])).r; await db.query('select bcc_order_transition($1,$2,$3,$4)', [o.id, 'paid', 'store-owner', 'Payment received (test)']); return o.id; };
const row = async id => one('select state,data from bcc_orders where id=$1', [id]);
const A = await order(2);
shipReply.add_order = {status: 'success', chargeable_weight: 0.5, courier_list: courierList};

r = await post('/admin/ship_quote', {id: A}, guestCookies, guest.csrf); assert.equal(r.status, 403); await read(r); checks++;
r = await post('/admin/ship_quote', {id: A}, adminCookies, adminSession.csrf, off); assert.equal(r.status, 503); await read(r); checks++;
r = await post('/admin/ship_quote', {id: A, weight_g: 5}); assert.equal(r.status, 400); await read(r); checks++;
shipCalls = [];
r = await post('/admin/ship_quote', {id: A, weight_g: 420, length: 16, width: 11, height: 9}); j = await read(r);
assert.equal(r.status, 200); assert.deepEqual(j.couriers.map(c => c.code), ['XB5', 'DL5']); assert.equal(j.couriers[1].name, 'Delhivery 0.5Kg');
let sent = shipCalls[0].body, saved = (await row(A)).data.shipneer;
assert.equal(shipCalls[0].endpoint, 'add_order'); assert.equal(typeof sent.order.order_id, 'number'); assert.equal(sent.order.order_number, A); assert.equal(sent.delivery.state, 'GJ'); assert.equal(sent.delivery.phone, '919876543210');
assert.equal(sent.weight, 0.42); assert.equal(sent.pickup_id, '3c87da04d17a04279e35ebfbf6cf44455f4aa3'); assert.equal(sent.items[0].qty, 2); assert.equal(sent.order.cod_collect, 0);
assert.equal(saved.ship_id, sent.order.order_id); assert.equal(saved.couriers.length, 2); assert.equal(saved.parcel.weight_g, 420); assert.ok(saved.quoted > 0); checks++;
r = await post('/admin/ship_quote', {id: A}); await read(r); assert.ok(shipCalls[1].body.order.order_id > sent.order.order_id); checks++; // every price request gets a fresh number

// Booking: a wrong code, a Shipneer refusal that frees the order, a claim in progress, then the booking itself.
shipCalls = [];
r = await post('/admin/ship_book', {id: A, code: 'NOPE'}); j = await read(r); assert.equal(r.status, 400); assert.match(j.error, /Choose a courier/); assert.equal(shipCalls.length, 0); checks++;
shipReply.book_parcel = () => new Response(JSON.stringify({status: 'error', message: 'Insufficient wallet balance'}), {status: 400});
r = await post('/admin/ship_book', {id: A, code: 'XB5'}); j = await read(r); assert.equal(r.status, 502); assert.match(j.error, /Insufficient wallet balance/);
assert.equal((await row(A)).state, 'paid'); assert.ok(!('booking' in (await row(A)).data.shipneer)); checks++;
await db.query("update bcc_orders set data=jsonb_set(data,'{shipneer,booking}',to_jsonb(extract(epoch from now())::bigint)) where id=$1", [A]);
r = await post('/admin/ship_book', {id: A, code: 'XB5'}); j = await read(r); assert.match(j.error, /already in progress/); checks++;
await db.query("update bcc_orders set data=data #- '{shipneer,booking}' where id=$1", [A]);
shipReply.book_parcel = {status: 'success', awb_number: 14344000111, courier_name: 'Xpressbees ', shipneer_ordref: 'ORDREF-A', courier_charge: 47.2};
shipCalls = []; const latestShipId = (await row(A)).data.shipneer.ship_id;
r = await post('/admin/ship_book', {id: A, code: 'XB5'}); j = await read(r);
assert.equal(r.status, 200); assert.deepEqual(j, {ok: true, awb: '14344000111', courier: 'Xpressbees'}); assert.deepEqual(shipCalls[0].body, {order_id: latestShipId, book_code: 'XB5'});
let a = await row(A);
assert.equal(a.state, 'shipped'); assert.equal(a.data.provider, 'Xpressbees'); assert.equal(a.data.tracking, '14344000111'); assert.equal(a.data.tracking_status, 'Booked');
assert.equal(a.data.shipneer.ordref, 'ORDREF-A'); assert.ok(!('couriers' in a.data.shipneer) && !('booking' in a.data.shipneer)); assert.equal(a.data.shipneer.rate, 47.2);
assert.equal(a.data.history.at(-1).state, 'shipped'); assert.match(a.data.internal_notes.at(-1).text, /Shipneer booking ORDREF-A/); checks++;
r = await post('/admin/ship_book', {id: A, code: 'XB5'}); j = await read(r); assert.equal(r.status, 400); assert.match(j.error, /Only paid or packing|already booked/); assert.equal(shipCalls.length, 1); checks++;
r = await post('/admin/ship_quote', {id: A}); await read(r); assert.equal(r.status, 400); checks++;
r = await post('/admin/order_update', {id: A, state: 'cancelled', remarks: 'Cancel by hand'}); j = await read(r); assert.equal(r.status, 409); assert.match(j.error, /Cancel the booking first/); checks++;

// The shopper sees tracking, never the Shipneer record or staff notes.
j = await read(await get('/orders/' + A + '/status'));
assert.equal(j.state, 'shipped'); assert.equal(j.tracking, '14344000111'); assert.ok(!('shipneer' in j) && !('internal_notes' in j)); checks++;
j = await read(await get('/account')); assert.ok(JSON.stringify(j).includes(A)); assert.ok(!JSON.stringify(j).includes('ORDREF-A')); checks++;

// Label: staff only, fetched here so the key stays on the server.
shipReply.print_label = () => new Response(new Uint8Array([37, 80, 68, 70, 45]), {headers: {'Content-Type': 'application/pdf; charset=binary'}});
r = await get('/admin/shipping-label/' + A); assert.equal(r.status, 403); await read(r);
shipCalls = []; r = await get('/admin/shipping-label/' + A, adminCookies);
assert.equal(r.status, 200); assert.equal(r.headers.get('Content-Type'), 'application/pdf'); assert.deepEqual([...new Uint8Array(await r.arrayBuffer())], [37, 80, 68, 70, 45]); assert.deepEqual(shipCalls[0].query, {u: KEY, ord: 'ORDREF-A'}); checks++;
const B = await order(1);
r = await get('/admin/shipping-label/' + B, adminCookies); assert.equal(r.status, 404); await read(r); checks++;

// Tracking: in transit, then delivered (the order closes itself).
const tracking = (status, events) => ({status: 'success', data: {awb: '14344000111', courier: 'Xpressbees', status, tracking: events}});
shipReply.track_parcel = tracking('In Transit', [{datetime: '11/11/26 09:00:00', location: 'SURAT HUB', notes: 'In Transit'}, {datetime: '10/11/26 18:00:00', location: 'vadodara', notes: 'Picked Up'}, {datetime: '', notes: ''}]);
r = await post('/admin/ship_track', {id: A}); j = await read(r);
assert.equal(j.state, 'shipped'); assert.equal(j.status, 'In Transit'); assert.equal(j.events.length, 2); assert.equal(j.events[0].location, 'Surat Hub'); assert.ok(j.events[0].at > j.events[1].at); checks++;
shipReply.track_parcel = tracking('Delivered', [{datetime: '12/11/26 13:15:00', location: 'Surat', notes: 'Delivered'}, {datetime: '11/11/26 09:00:00', location: 'Surat Hub', notes: 'In Transit'}]);
r = await post('/admin/ship_track', {id: A}); j = await read(r); a = await row(A);
assert.equal(j.state, 'delivered'); assert.equal(a.state, 'delivered'); assert.equal(a.data.history.at(-1).at, istEpoch('12/11/26 13:15:00')); assert.ok(a.data.shipneer.tracking_checked > 0); checks++;
r = await post('/admin/ship_track', {id: B}); assert.equal(r.status, 409); await read(r); checks++;

// Cancelling a booking puts the order back in packing and clears the courier.
const book = async (id, ordref) => { await read(await post('/admin/ship_quote', {id})); shipReply.book_parcel = {status: 'success', awb_number: 'AWB-' + ordref, courier_name: 'Delhivery', shipneer_ordref: ordref, courier_charge: 59}; const res = await post('/admin/ship_book', {id, code: 'DL5'}); await read(res); assert.equal(res.status, 200); };
await book(B, 'ORDREF-B');
shipReply.cancel_shipment = {status: 'success'};
r = await post('/admin/ship_cancel', {id: B, remarks: 'no'}); assert.equal(r.status, 400); await read(r);
shipCalls = []; r = await post('/admin/ship_cancel', {id: B, remarks: 'Customer changed the address'}); j = await read(r); let b = await row(B);
assert.equal(r.status, 200); assert.deepEqual(shipCalls[0].body, {cancel_order: 'ORDREF-B'}); assert.equal(b.state, 'packing'); assert.equal(b.data.tracking, null); assert.equal(b.data.provider, null);
assert.ok(!('ordref' in b.data.shipneer)); assert.equal(b.data.shipneer.cancelled.ordref, 'ORDREF-B'); checks++;
await book(B, 'ORDREF-B2'); assert.equal((await row(B)).data.shipneer.ordref, 'ORDREF-B2'); checks++; // and it can be booked again

// A parcel that comes back: flagged by tracking, restocked by staff, order cancelled with a refund to make.
const before = (await one("select available from bcc_batches where id='LOT1'")).available;
r = await post('/admin/ship_restock', {id: B, remarks: 'Box intact, seal unbroken'}); j = await read(r); assert.match(j.error, /hasn’t reported/); checks++;
shipReply.track_parcel = tracking('RTO Initiated', [{datetime: '12/11/26 10:00:00', location: 'Surat', notes: 'RTO Initiated'}]);
j = await read(await post('/admin/ship_track', {id: B})); b = await row(B);
assert.equal(b.state, 'shipped'); assert.ok(b.data.shipneer.returned > 0); assert.match(b.data.internal_notes.at(-1).text, /return to origin/); checks++;
shipReply.track_parcel = tracking('Delivered', [{datetime: '12/11/26 15:00:00', location: 'Vadodara', notes: 'Delivered'}]);
await read(await post('/admin/ship_track', {id: B})); assert.equal((await row(B)).state, 'shipped'); checks++; // "delivered" back to us is not a delivery
r = await post('/admin/ship_restock', {id: B, remarks: 'Box intact, seal unbroken'}); j = await read(r); b = await row(B);
assert.equal(r.status, 200); assert.equal(b.state, 'cancelled'); assert.equal(b.data.refund, 'pending_refund'); assert.ok(b.data.shipneer.restocked > 0);
assert.equal((await one("select available from bcc_batches where id='LOT1'")).available, before + 1);
assert.equal((await one("select count(*)::integer n from bcc_reservations where order_id=$1 and state='consumed'", [B])).n, 0);
assert.equal((await one("select kind,quantity from bcc_stock_moves order by id desc limit 1")).kind, 'return'); checks++;

// Lots that can no longer be sold stop a booking before Shipneer is asked.
const C = await order(1);
await db.query("update bcc_batches set state='quarantined' where id='LOT1'");
shipCalls = []; r = await post('/admin/ship_quote', {id: C}); j = await read(r); assert.match(j.error, /quarantined, expired or unreleased/); assert.equal(shipCalls.length, 0); checks++;
await db.query("update bcc_batches set state='released' where id='LOT1'");

// Opening the portal checks booked parcels that have not been checked for an hour, and shows Shipping as connected.
await book(C, 'ORDREF-C');
shipReply.track_parcel = tracking('Out For Delivery', [{datetime: '12/11/26 08:00:00', location: 'Surat', notes: 'Out For Delivery'}]);
shipCalls = []; r = await get('/admin', adminCookies); j = await read(r);
assert.equal(r.status, 200); assert.equal(j.integrations.find(i => i.id === 'shipping').state, 'connected'); assert.ok(j.orders.find(o => o.id === C).shipneer.ordref);
for (let i = 0; i < 50 && (await row(C)).data.tracking_status !== 'Out For Delivery'; i++) await new Promise(res => setTimeout(res, 20));
assert.equal((await row(C)).data.tracking_status, 'Out For Delivery'); assert.deepEqual(shipCalls.map(c => c.query.ord), ['ORDREF-C']); checks++;
shipCalls = []; await read(await get('/admin', adminCookies)); await new Promise(res => setTimeout(res, 60)); assert.equal(shipCalls.length, 0); checks++; // not again within the hour
j = await read(await get('/admin', adminCookies, off)); assert.equal(j.integrations.find(i => i.id === 'shipping').state, 'not_connected'); checks++;

// Checkout stores a real state name, so every order can be booked later.
r = await post('/orders', {adult: true, request_id: 'order-request-0001', items: [{id: 'test-product', quantity: 1}], contact: {...contact, state: 'Atlantis'}}, guestCookies, guest.csrf); j = await read(r);
assert.equal(r.status, 400); assert.equal(j.field, 'state'); checks++;

assert.ok(!seen.includes(KEY)); checks++; // the key never appears in anything the API returned
console.log(checks + ' hosted Shipneer checks passed.');
