/* Shipneer courier booking for the hosted API (12 Nov 2026). The hosted twin of app/shipping.py: keep the two in step.
   The API key is a function secret (SHIPNEER_API_KEY) and never reaches a browser: Shipneer's own label and tracking
   links carry the key in their query string, so labels are fetched here and served to the signed-in administrator,
   and customers see our own tracking timeline.
   Flow (staff-driven): ship_quote sends the order and returns couriers and prices; ship_book books the chosen one;
   then the label, ship_track, ship_cancel and ship_restock. Every change to an order is one locked database routine
   (bcc_ship_action, supabase/migrations/202611120002_shipping.sql); this file only talks to Shipneer. */
export const SHIPNEER_BASE = 'https://shipneer.com/apiv2/';
// Vebe life care, Plot 6,7,8, Por Industrial Park Phase 2, Por, Vadodara 391243 (chosen by the owner, 12 Nov 2026).
export const DEFAULT_PICKUP_ID = '3c87da04d17a04279e35ebfbf6cf44455f4aa3', DEFAULT_PICKUP_PIN = '391243';
// Standard parcels until real packed sizes are measured; staff can change them per order.
export const SMALL_BOX = {length: 15, width: 10, height: 8}, BOX = {length: 20, width: 15, height: 10}, BASE_GRAMS = 100, GRAMS_PER_UNIT = 150;
export const SHIP_ACTIONS = ['ship_quote', 'ship_book', 'ship_track', 'ship_cancel', 'ship_restock'];
export const CHECK_TTL = 24 * 3600, CHECK_LIMIT = 30, TRACK_EVERY = 3600;

const STATES = {AN: 'Andaman and Nicobar Islands', AP: 'Andhra Pradesh', AR: 'Arunachal Pradesh', AS: 'Assam', BR: 'Bihar', CH: 'Chandigarh', DN: 'Dadra and Nagar Haveli', DD: 'Daman and Diu', DL: 'Delhi', GA: 'Goa', GJ: 'Gujarat', HR: 'Haryana', HP: 'Himachal Pradesh', JK: 'Jammu and Kashmir', KA: 'Karnataka', KL: 'Kerala', LD: 'Lakshadweep', MP: 'Madhya Pradesh', MH: 'Maharashtra', MN: 'Manipur', ML: 'Meghalaya', MZ: 'Mizoram', NL: 'Nagaland', OR: 'Odisha', PY: 'Puducherry', PB: 'Punjab', RJ: 'Rajasthan', SK: 'Sikkim', TN: 'Tamil Nadu', TR: 'Tripura', UP: 'Uttar Pradesh', WB: 'West Bengal', TS: 'Telangana', JH: 'Jharkhand', UK: 'Uttarakhand', CG: 'Chhattisgarh', LA: 'Ladakh'};
const ALIASES = {orissa: 'OR', pondicherry: 'PY', uttaranchal: 'UK', chattisgarh: 'CG', 'new delhi': 'DL', 'nct of delhi': 'DL', 'jammu & kashmir': 'JK', 'andaman & nicobar islands': 'AN', telengana: 'TS', 'dadra and nagar haveli and daman and diu': 'DN', 'the dadra and nagar haveli and daman and diu': 'DN', 'j&k': 'JK', 'delhi ncr': 'DL'};
const BY_NAME = {...Object.fromEntries(Object.entries(STATES).map(([k, v]) => [v.toLowerCase(), k])), ...ALIASES};
const DELIVERED = new Set(['delivered']), RETURNED = new Set(['rto delivered', 'rto', 'returned', 'return to origin', 'rto in transit', 'rto initiated']);

const NAMES = {AN: 'Andaman and Nicobar Islands', DN: 'Dadra and Nagar Haveli and Daman and Diu', DD: 'Dadra and Nagar Haveli and Daman and Diu'};
/* The canonical state name for an order address, or an error asking the customer to choose from the list. */
export function stateName(value, fail) { let code; try { code = stateCode(value, fail); } catch { throw fail('Choose your state from the list.', 400, {field: 'state'}); } return NAMES[code] || STATES[code]; }
/* Exact names (any case), two-letter codes and a few official alternatives. Nothing is guessed. */
export function stateCode(name, fail) {
  const s = String(name || '').trim().replace(/^[.,]+|[.,]+$/g, '').replace(/\s+/g, ' '), low = s.toLowerCase();
  if (STATES[s.toUpperCase()]) return s.toUpperCase();
  const code = BY_NAME[low.replace(/ & /g, ' and ')] || BY_NAME[low];
  if (!code) throw fail(`Shipneer needs a recognised Indian state; “${s}” is not one. Correct the order address first.`, 400);
  return code;
}

export function defaultParcel(items) {
  const units = (items || []).reduce((a, i) => a + (parseInt(i.quantity, 10) || 0), 0);
  return {weight_g: BASE_GRAMS + GRAMS_PER_UNIT * Math.max(units, 1), ...(units <= 2 ? SMALL_BOX : BOX)};
}
export function cleanParcel(data, items, fail) {
  const d = defaultParcel(items), out = {};
  for (const [k, lo, hi] of [['weight_g', 10, 30000], ['length', 1, 150], ['width', 1, 150], ['height', 1, 150]]) {
    let v = data[k] ?? d[k];
    if (typeof v === 'string' && /^\d+$/.test(v.trim())) v = Number(v);
    if (typeof v !== 'number' || !Number.isFinite(v) || v < lo || v > hi) throw fail('Enter the parcel weight in grams and its size in cm.', 400);
    out[k] = Math.round(v);
  }
  return out;
}

const pad = n => String(n).padStart(2, '0');
// Shipneer reads dates as India time (UTC+5:30).
const istStamp = epoch => { const t = new Date((epoch + 19800) * 1000); return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())} ${pad(t.getUTCHours())}:${pad(t.getUTCMinutes())}:${pad(t.getUTCSeconds())}`; };
/* Shipneer times look like 04/11/26 19:29:00 (day/month/year, India time). */
export function istEpoch(text) {
  const s = String(text ?? '').trim();
  let m = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2}|\d{4}) (\d{1,2}):(\d{2}):(\d{2})$/), y, mo, d;
  if (m) { d = +m[1]; mo = +m[2]; y = +m[3]; if (y < 100) y += 2000; }
  else { m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2}) (\d{1,2}):(\d{2}):(\d{2})$/); if (!m) return null; y = +m[1]; mo = +m[2]; d = +m[3]; }
  const ms = Date.UTC(y, mo - 1, d, +m[4], +m[5], +m[6]);
  return Number.isFinite(ms) && mo >= 1 && mo <= 12 && d >= 1 && d <= 31 ? Math.floor(ms / 1000) - 19800 : null;
}

export function orderPayload(oid, order, parcel, created, shipId, pickupId, fail) {
  const c = order.contact || {}, address = String(c.address || '').replace(/\s+/g, ' ').trim();
  let line1 = address, line2 = '';
  if (address.length > 100) { // split long single-line addresses at a comma near the middle
    let cut = address.lastIndexOf(',', 99); cut = cut > 20 ? cut : 100;
    line1 = address.slice(0, cut).replace(/^[ ,]+|[ ,]+$/g, ''); line2 = address.slice(cut).replace(/^[ ,]+|[ ,]+$/g, '');
  }
  const items = order.items || [], units = items.reduce((a, i) => a + i.quantity, 0) || 1, perUnit = Math.round(parcel.weight_g / units) / 1000;
  return {
    order: {order_id: shipId ?? oid, order_number: oid, date: istStamp(created), shipment_type: 'P', shipment_value: Math.trunc(order.total), cod_collect: 0},
    delivery: {name: c.name, phone: '91' + String(c.mobile), email: c.email || '', address_line1: line1, address_line2: line2 || c.city || '', city: c.city, state: stateCode(c.state, fail), pincode: String(c.pincode), country: 'IN'},
    pickup_id: pickupId,
    weight: Math.round(parcel.weight_g) / 1000, length: parcel.length, width: parcel.width, height: parcel.height,
    items: items.map(i => ({sku: i.sku || i.id, name: i.name, qty: i.quantity, price: i.unit_price, weight: perUnit})),
  };
}

export function deliveryDays(pincode) {
  const p = String(pincode), two = p.slice(0, 2);
  if (['36', '37', '38', '39'].includes(two)) return [2, 3];                               // Gujarat, Daman and Diu
  if (['744', '737'].includes(p.slice(0, 3)) || p.slice(0, 4) === '6825' || ['18', '19', '78', '79'].includes(two)) return [5, 8]; // islands, J&K, Ladakh, the North East, Sikkim
  if (['30', '31', '32', '33', '34', '40', '41', '42', '43', '44', '45', '46', '47', '48', '49'].includes(two)) return [3, 5];   // Rajasthan, Maharashtra, MP, Chhattisgarh, Goa
  return [4, 6];
}

const couriers = body => (body.courier_list || []).filter(x => x && x.courier_code).map(x => { const r = x.rate || {}; return {name: String(x.courier_name || '').trim(), code: String(x.courier_code), price: r.price ?? null, gst: r.gst ?? null, rate: r.rate ?? null}; })
  .sort((a, b) => (a.rate === null) - (b.rate === null) || (a.rate || 0) - (b.rate || 0));
const ok = body => !!body && typeof body === 'object' && (body.status === 'success' || body.success === true);

/* The client. fail(message, status) builds the API's own error; fetcher is replaceable in tests. */
export function shipneer({key, pickupId = DEFAULT_PICKUP_ID, pickupPin = DEFAULT_PICKUP_PIN, fetcher = fetch, fail, base = SHIPNEER_BASE, wait = ms => new Promise(r => setTimeout(r, ms))}) {
  const refuse = (body, fallback) => { let msg = body && typeof body === 'object' ? body.message || body.error || body.msg : null; if (msg && typeof msg === 'object') msg = JSON.stringify(msg); throw fail('Shipneer: ' + (msg ? String(msg).slice(0, 300) : fallback), 502); };
  async function request(method, endpoint, {payload, query, raw = false, timeout = 30000} = {}) {
    if (!key) throw fail('Shipneer is not connected. Add SHIPNEER_API_KEY to the server settings.', 503);
    let url = base + endpoint, r, bytes;
    if (query) url += '?' + new URLSearchParams({u: key, ...query});
    try {
      r = await fetcher(url, {method, headers: {'X-API-KEY': key, 'Content-Type': 'application/json', Accept: '*/*', 'User-Agent': 'BodyCafeCo-Operations/1.0'}, body: payload === undefined ? undefined : JSON.stringify(payload), signal: AbortSignal.timeout(timeout)});
      bytes = new Uint8Array(await r.arrayBuffer());
    } catch { throw fail('Shipneer could not be reached. Try again in a minute.', 502); }
    const ctype = r.headers.get('Content-Type') || '', parse = () => JSON.parse(new TextDecoder().decode(bytes));
    if (!r.ok) { let body; try { body = parse(); } catch { throw fail(`Shipneer: request failed (${r.status}).`, 502); } refuse(body, `request failed (${r.status}).`); }
    if (raw) return {bytes, ctype};
    try { return parse(); } catch { throw fail('Shipneer sent an unexpected reply. Try again, or check the order in the Shipneer dashboard.', 502); }
  }
  return {
    configured: !!key, pickupId, pickupPin,
    async addOrder(payload) { const body = await request('POST', 'add_order', {payload}); if (!ok(body)) refuse(body, 'the order could not be sent.'); const list = couriers(body); if (!list.length) throw fail('Shipneer returned no couriers for this pincode and parcel.', 502); return {chargeable_weight: body.chargeable_weight ?? null, couriers: list}; },
    async rates(pin, weightG, box, value) { const body = await request('POST', 'rate_calculator', {payload: {pickup_pin: pickupPin, destination_pin: String(pin), weight: weightG, ...box, shipment_type: 'P', shipment_value: value}, timeout: 15000}); if (!ok(body)) refuse(body, 'rates are unavailable.'); return couriers(body); },
    async book(shipId, code) { const body = await request('POST', 'book_parcel', {payload: {order_id: shipId, book_code: code}}); if (!ok(body) || !body.shipneer_ordref) refuse(body, 'the courier could not be booked.'); return {awb: String(body.awb_number || ''), courier: String(body.courier_name || '').trim(), ordref: String(body.shipneer_ordref), charge: body.courier_charge ?? null}; },
    async cancel(ordref) { const body = await request('POST', 'cancel_shipment', {payload: {cancel_order: ordref}}); if (!ok(body)) refuse(body, 'the shipment could not be cancelled.'); return true; },
    /* Tries twice: Shipneer sometimes needs a moment after booking before the label exists. */
    async label(ordref) {
      let got = null, last = null;
      for (let attempt = 0; attempt < 2; attempt++) {
        try { got = await request('GET', 'print_label', {query: {ord: ordref}, raw: true}); if (got.bytes.length) break; } catch (e) { last = e; }
        if (attempt === 0) await wait(2000);
      }
      if (!got || !got.bytes.length) { if (last && !String(last.message).includes('request failed')) throw last; throw fail('Shipneer couldn’t produce the label just now. Try again in a minute, or print it from the Shipneer dashboard.', 502); }
      if (got.ctype.includes('json')) { let body = null; try { body = JSON.parse(new TextDecoder().decode(got.bytes)); } catch { /* not JSON after all: serve it */ } if (body) refuse(body, 'the label is unavailable.'); }
      return {mime: got.ctype.split(';')[0].trim() || 'application/octet-stream', bytes: got.bytes};
    },
    async track(ordref, timeout = 30000) {
      const body = await request('GET', 'track_parcel', {query: {ord: ordref}, timeout}); if (!ok(body)) refuse(body, 'tracking is unavailable.');
      const d = body.data || {}, events = [];
      for (const e of d.tracking || []) { const note = String(e.notes || '').trim(); if (note) events.push({at: istEpoch(e.datetime), text: String(e.datetime || ''), location: String(e.location || '').trim().toLowerCase().replace(/\b[a-z]/g, c => c.toUpperCase()), note}); }
      events.sort((a, b) => (b.at || 0) - (a.at || 0));
      const status = String(d.status || (events[0] ? events[0].note : '')).trim(), low = status.toLowerCase();
      const outcome = DELIVERED.has(low) ? 'delivered' : RETURNED.has(low) || low.startsWith('rto') ? 'returned' : null;
      const delivered = events.find(e => e.note.toLowerCase() === 'delivered' && e.at);
      return {awb: String(d.awb || ''), courier: String(d.courier || ''), status, outcome, events: events.slice(0, 60), delivered_at: delivered ? delivered.at : null};
    },
  };
}
