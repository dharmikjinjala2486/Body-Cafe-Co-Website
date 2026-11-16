/* MSG91 for the hosted API (16 Nov 2026): order messages by SMS, WhatsApp and email, and Supabase Auth's text-message
   codes through a Send SMS hook. Same templates, variables and rules as app/msg91.py; keep the two in step. Every
   template and setting is listed in MSG91-TEMPLATES.md.
   MSG91_AUTHKEY is a function secret and never leaves this function. Each message is sent only when its template
   setting is filled in. Order messages are recorded on the order (data.notices) so each event is sent once; a failure
   is recorded there and never shown to the customer. WhatsApp goes only to orders whose contact asked for it
   (contact.whatsapp_updates). */
export const MSG91_BASE = 'https://control.msg91.com/api/v5/';
export const EVENTS = ['order_paid', 'order_shipped', 'order_delivered', 'order_cancelled'];
// Variables each order message fills, in order. SMS uses them by name (##order##), WhatsApp by position ({{1}}).
export const SMS_VARS = {order_paid: ['amount', 'order', 'link'], order_shipped: ['order', 'courier', 'awb', 'link'], order_delivered: ['order', 'link'], order_cancelled: ['order', 'link']};
export const WA_VARS = {order_paid: ['name', 'order', 'amount', 'link'], order_shipped: ['name', 'order', 'courier', 'awb', 'link'], order_delivered: ['name', 'order', 'link'], order_cancelled: ['name', 'order', 'link']};
export const EMAIL_VARS = {order_paid: ['name', 'order', 'amount', 'items', 'link'], order_shipped: ['name', 'order', 'courier', 'awb', 'link'], order_delivered: ['name', 'order', 'link'], order_cancelled: ['name', 'order', 'link']};
const EMAIL_SHAPE = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,24}$/;

export class Msg91Error extends Error {}

/* 1299 -> '1,299'; 123456 -> '1,23,456' (Indian grouping). */
export function inr(n) {
  const s = String(Math.round(Number(n) || 0));
  if (s.length <= 3) return s;
  return s.slice(0, -3).replace(/(\d)(?=(\d\d)+$)/g, '$1,') + ',' + s.slice(-3);
}
// WhatsApp rejects variables with new lines, tabs or more than four spaces in a row; nothing here needs them.
const clean = (v, limit = 120) => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, limit);

export function orderValues(id, d, origin) {
  const contact = d.contact || {}, sn = d.shipneer || {};
  const items = (d.items || []).map(x => clean(x.name, 60) + ' × ' + (parseInt(x.quantity, 10) || 0)).join(', ');
  return {name: clean(contact.name).split(' ')[0].slice(0, 30) || 'there', order: id, amount: inr(d.total), items: clean(items, 600),
    courier: clean(sn.courier || d.provider) || 'our courier', awb: clean(sn.awb || d.tracking) || 'to follow', link: origin + '/account/orders'};
}

/* settings: {key, otpTemplate, sms:{event:id}, waNumber, waLang, wa:{event:name}, emailDomain, emailFrom, emailFromName,
   email:{event:name}, hookSecret, origin}. fetcher is replaceable in tests. */
export function msg91(settings = {}, {fetcher = fetch, base = MSG91_BASE} = {}) {
  const st = {...settings};
  const key = String(st.key || '').trim(), origin = String(st.origin || '').replace(/\/$/, '');
  const pick = o => Object.fromEntries(EVENTS.map(e => [e, String(o?.[e] || '').trim()]));
  const sms = pick(st.sms), wa = pick(st.wa), email = pick(st.email);
  const waNumber = String(st.waNumber || '').replace(/\D/g, ''), waLang = String(st.waLang || '').trim() || 'en';
  const emailDomain = String(st.emailDomain || '').trim(), emailFrom = String(st.emailFrom || '').trim(), emailFromName = String(st.emailFromName || '').trim() || 'Body Cafe Co.';
  const configured = !!key;

  async function call(method, path, body, query) {
    if (!configured) throw new Msg91Error('MSG91 is not connected. Add MSG91_AUTHKEY to the function secrets.');
    let r, text;
    try {
      r = await fetcher(base + path + (query ? '?' + new URLSearchParams(query) : ''), {method, headers: {authkey: key, 'Content-Type': 'application/json', Accept: 'application/json'}, body: body === undefined ? undefined : JSON.stringify(body), signal: AbortSignal.timeout(15000)});
      text = await r.text();
    } catch { throw new Msg91Error('MSG91 did not respond.'); }
    let out; try { out = JSON.parse(text || '{}'); } catch { throw new Msg91Error('MSG91 sent an unreadable answer.'); }
    const why = () => { const m = out?.message || out?.msg || out?.errors || ''; return (typeof m === 'string' ? m : JSON.stringify(m)).slice(0, 200); };
    if (!r.ok) throw new Msg91Error(`MSG91 refused the request (HTTP ${r.status}). ${why()}`);
    // MSG91 often answers a refusal with HTTP 200 and type/status 'error', so both are checked.
    if (out && (out.type === 'error' || out.status === 'error' || out.status === 'fail' || out.hasError === true)) throw new Msg91Error('MSG91 refused the request. ' + why());
    return out;
  }

  function sendEmail(to, name, template, variables) {
    if (!(emailDomain && emailFrom)) throw new Msg91Error('MSG91_EMAIL_DOMAIN and MSG91_EMAIL_FROM are not set.');
    return call('POST', 'email/send', {recipients: [{to: [{email: to, ...(name ? {name} : {})}], variables}], from: {email: emailFrom, name: emailFromName}, domain: emailDomain, template_id: template});
  }

  /* A sign-in code we made (or Supabase made) for a 10- or 12-digit Indian mobile. The template must contain ##OTP##. */
  function sendCode(mobile, code) {
    const digits = String(mobile || '').replace(/\D/g, ''), ten = digits.length === 12 && digits.startsWith('91') ? digits.slice(2) : digits;
    if (!/^[6-9][0-9]{9}$/.test(ten)) throw new Msg91Error('Not an Indian mobile number.');
    if (!st.otpTemplate) throw new Msg91Error('MSG91_OTP_TEMPLATE is not set.');
    return call('POST', 'otp', {}, {template_id: st.otpTemplate, mobile: '91' + ten, otp: String(code), otp_length: String(String(code).length)});
  }

  /* The messages one event would send for one order: [[channel, send]] plus {channel: reason} for those skipped. */
  function orderMessages(event, id, d) {
    const v = orderValues(id, d, origin), contact = d.contact || {};
    const mobile = String(contact.mobile || '').replace(/\D/g, '').slice(-10), to = String(contact.email || '').trim();
    const out = [], skipped = {};
    if (!sms[event]) skipped.sms = 'no template';
    else if (!/^[6-9][0-9]{9}$/.test(mobile)) skipped.sms = 'no mobile';
    else { const body = {template_id: sms[event], short_url: '0', recipients: [{mobiles: '91' + mobile, ...Object.fromEntries(SMS_VARS[event].map(k => [k, v[k]]))}]}; out.push(['sms', () => call('POST', 'flow', body)]); }
    if (!(wa[event] && waNumber)) skipped.whatsapp = 'no template';
    else if (contact.whatsapp_updates !== true) skipped.whatsapp = 'not asked for';
    else if (!/^[6-9][0-9]{9}$/.test(mobile)) skipped.whatsapp = 'no mobile';
    else {
      const components = Object.fromEntries(WA_VARS[event].map((k, i) => ['body_' + (i + 1), {type: 'text', value: v[k]}]));
      const body = {integrated_number: waNumber, content_type: 'template', payload: {messaging_product: 'whatsapp', type: 'template', template: {name: wa[event], language: {code: waLang, policy: 'deterministic'}, to_and_components: [{to: ['91' + mobile], components}]}}};
      out.push(['whatsapp', () => call('POST', 'whatsapp/whatsapp-outbound-message/bulk/', body)]);
    }
    if (!email[event]) skipped.email = 'no template';
    else if (!EMAIL_SHAPE.test(to)) skipped.email = 'no email';
    else { const variables = Object.fromEntries(EMAIL_VARS[event].map(k => [k, v[k]])); out.push(['email', () => sendEmail(to, v.name, email[event], variables)]); }
    return [out, skipped];
  }

  /* Send every message for one event. Returns {channel: 'sent' | 'skipped: …' | 'failed: …'}; never throws. */
  async function deliver(event, id, d) {
    let messages, skipped;
    try { [messages, skipped] = orderMessages(event, id, d || {}); } catch (e) { return {all: 'failed: ' + (e?.name || 'Error')}; }
    const result = Object.fromEntries(Object.entries(skipped).map(([k, why]) => [k, 'skipped: ' + why]));
    for (const [channel, send] of messages) {
      try { await send(); result[channel] = 'sent'; } catch (e) { result[channel] = 'failed: ' + String(e?.message || e).slice(0, 240); }
    }
    return result;
  }

  /* Supabase Auth "Send SMS" hook (Standard Webhooks). Supabase makes and checks the code; MSG91 only delivers it.
     The secret is the hook's "v1,whsec_…" value (SEND_SMS_HOOK_SECRET). */
  async function smsHook(req) {
    const reply = (status, message) => new Response(JSON.stringify(status === 200 ? {} : {error: {http_code: status, message}}), {status, headers: {'Content-Type': 'application/json'}});
    const raw = await req.text();
    if (!await hookSigned(req.headers, raw, st.hookSecret)) return reply(401, 'Invalid signature.');
    let payload; try { payload = JSON.parse(raw); } catch { return reply(400, 'Invalid payload.'); }
    const phone = payload?.user?.phone, code = String(payload?.sms?.otp || '');
    if (!/^[0-9]{4,9}$/.test(code)) return reply(400, 'Invalid payload.');
    try { await sendCode(phone, code); } catch (e) { console.log('MSG91 code not sent:', String(e?.message || e).slice(0, 200)); return reply(503, 'We couldn’t send your code just now. Try again in a minute.'); }
    return reply(200);
  }

  return {configured, call, sendCode, orderMessages, deliver, smsHook};
}

const b64 = bytes => btoa(String.fromCharCode(...new Uint8Array(bytes)));
function sameText(a, b) { if (a.length !== b.length) return false; let x = 0; for (let i = 0; i < a.length; i++) x |= a.charCodeAt(i) ^ b.charCodeAt(i); return x === 0; }

/* Standard Webhooks signature: base64 HMAC-SHA256 of "<id>.<timestamp>.<body>", sent as "v1,<sig>" (space-separated
   when there are several). The timestamp must be within five minutes. */
export async function hookSigned(headers, raw, secret, nowSeconds = Date.now() / 1000) {
  const id = headers.get('webhook-id'), ts = headers.get('webhook-timestamp'), sigs = headers.get('webhook-signature') || '';
  secret = String(secret || '').trim().replace(/^v1,/, '').replace(/^whsec_/, '');
  if (!secret || !id || !/^[0-9]{1,12}$/.test(ts || '') || Math.abs(nowSeconds - Number(ts)) > 300) return false;
  let keyBytes; try { keyBytes = Uint8Array.from(atob(secret), c => c.charCodeAt(0)); } catch { return false; }
  const k = await crypto.subtle.importKey('raw', keyBytes, {name: 'HMAC', hash: 'SHA-256'}, false, ['sign']);
  const want = b64(await crypto.subtle.sign('HMAC', k, new TextEncoder().encode(`${id}.${ts}.${raw}`)));
  return sigs.split(' ').some(s => { const [v, sig] = s.split(','); return v === 'v1' && !!sig && sameText(sig, want); });
}
