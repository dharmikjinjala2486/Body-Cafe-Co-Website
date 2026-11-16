# MSG91 templates to register

Drafted 16 November 2026 for approval. Nothing here is registered yet. The website fills each template's variables
itself, so **keep the variable names and their order exactly as written**. If DLT or Meta asks for a wording change,
change the words, keep the variables, and tell the developer if one has to move.

Every message is a service message about something the customer did (a sign-in or an order). None advertises, none
names the manufacturer, none makes a health claim, and none suggests buying more.

After each template is approved, put its ID or name in `.env` (local) and the Supabase function secrets (live site),
under the setting named in the table. A message whose setting is empty is simply not sent.

## 1. Text messages (SMS)

**Before you start (India):** register on a DLT portal (Jio, Airtel, Vi, BSNL or Videocon) as the principal entity,
register a 6-character sender ID (header), for example `BDCAFE`, and register each template below under the
**Service Implicit** category. If the links in these messages are to work, whitelist the site's domain on the DLT
portal too. Then add each template in MSG91 (SMS → Templates for order messages, OTP → Templates for the sign-in code)
with its DLT template ID.

DLT writes a variable as `{#var#}`. MSG91 writes it as `##name##`. Register the DLT column on the portal and paste the
MSG91 column into MSG91.

| Message | Setting | Text in MSG91 | Text on the DLT portal |
|---|---|---|---|
| Sign-in code | `MSG91_OTP_TEMPLATE` | `##OTP## is your Body Cafe Co. sign-in code. It expires in 5 minutes. Never share it with anyone.` | `{#var#} is your Body Cafe Co. sign-in code. It expires in 5 minutes. Never share it with anyone.` |
| Order paid | `MSG91_SMS_ORDER_PAID` | `Body Cafe Co.: we have received Rs.##amount## for order ##order##. We will text you when it ships. ##link##` | `Body Cafe Co.: we have received Rs.{#var#} for order {#var#}. We will text you when it ships. {#var#}` |
| Order shipped | `MSG91_SMS_ORDER_SHIPPED` | `Body Cafe Co.: order ##order## has shipped with ##courier##, tracking number ##awb##. ##link##` | `Body Cafe Co.: order {#var#} has shipped with {#var#}, tracking number {#var#}. {#var#}` |
| Order delivered | `MSG91_SMS_ORDER_DELIVERED` | `Body Cafe Co.: order ##order## has been delivered. Anything not right? Tell us: ##link##` | `Body Cafe Co.: order {#var#} has been delivered. Anything not right? Tell us: {#var#}` |
| Order cancelled | `MSG91_SMS_ORDER_CANCELLED` | `Body Cafe Co.: order ##order## has been cancelled. Your refund follows to the way you paid. ##link##` | `Body Cafe Co.: order {#var#} has been cancelled. Your refund follows to the way you paid. {#var#}` |

The sign-in code's template in MSG91 must contain `##OTP##` (MSG91's own name for the code). The site sends its own
6-digit code into it and checks the code itself.

For the order messages, the setting holds the template's ID from MSG91 (SMS → Templates), not the DLT ID.

## 2. WhatsApp

**Before you start:** connect a WhatsApp Business number in MSG91 (WhatsApp → Numbers). This needs Meta business
verification. Put the number, with country code and no `+`, in `MSG91_WA_NUMBER`, for example `919274248974`.

Create each template in MSG91 → WhatsApp → Templates, category **Utility**, language **English** (`en`; if you choose
another, set `MSG91_WA_LANG`). The setting holds the template's **name**. WhatsApp writes variables as `{{1}}`, `{{2}}`…;
the site fills them in the order listed.

WhatsApp messages go only to customers who asked for order updates on WhatsApp (see the note at the end).

**`bcc_order_paid`** → `MSG91_WA_ORDER_PAID`
> Hi {{1}}, thank you for your order {{2}}. We've received your payment of ₹{{3}}. We'll message you here when it ships.
>
> Your orders: {{4}}

Variables: 1 first name · 2 order number · 3 amount · 4 link to the customer's orders

**`bcc_order_shipped`** → `MSG91_WA_ORDER_SHIPPED`
> Hi {{1}}, your order {{2}} is on its way with {{3}}. Tracking number: {{4}}.
>
> Your orders: {{5}}

Variables: 1 first name · 2 order number · 3 courier · 4 tracking number · 5 link

**`bcc_order_delivered`** → `MSG91_WA_ORDER_DELIVERED`
> Hi {{1}}, your order {{2}} has been delivered. If anything isn't right, tell us from your orders page and we'll put it right.
>
> {{3}}

Variables: 1 first name · 2 order number · 3 link

**`bcc_order_cancelled`** → `MSG91_WA_ORDER_CANCELLED`
> Hi {{1}}, your order {{2}} has been cancelled. Your refund follows to the way you paid.
>
> Your orders: {{3}}

Variables: 1 first name · 2 order number · 3 link

## 3. Email

**Before you start:** choose an email plan in MSG91, add the sending domain (for example `bodycafe.co`) under Email →
Domains, and add the DNS records it gives you. Then set `MSG91_EMAIL_DOMAIN` (the domain) and `MSG91_EMAIL_FROM` (the
sender address on that domain, for example `orders@bodycafe.co`). `MSG91_EMAIL_FROM_NAME` defaults to `Body Cafe Co.`.

Create each template in MSG91 → Email → Templates. The setting holds the template's **name** (MSG91 calls it the
template ID). Write variables as `{{name}}`. Each template can use any of the variables listed for it.

| Template name | Setting | Subject | Variables |
|---|---|---|---|
| `bcc-sign-in-code` | `MSG91_EMAIL_CODE` | `{{code}} is your Body Cafe Co. code` | `code`, `minutes` |
| `bcc-order-paid` | `MSG91_EMAIL_ORDER_PAID` | `Order {{order}}: payment received` | `name`, `order`, `amount`, `items`, `link` |
| `bcc-order-shipped` | `MSG91_EMAIL_ORDER_SHIPPED` | `Order {{order}} has shipped` | `name`, `order`, `courier`, `awb`, `link` |
| `bcc-order-delivered` | `MSG91_EMAIL_ORDER_DELIVERED` | `Order {{order}} has been delivered` | `name`, `order`, `link` |
| `bcc-order-cancelled` | `MSG91_EMAIL_ORDER_CANCELLED` | `Order {{order}} has been cancelled` | `name`, `order`, `link` |

Suggested bodies (keep them plain; one short paragraph and a button to `{{link}}`):

- **Sign-in code:** "Your code is **{{code}}**. It expires in {{minutes}} minutes. If you didn't ask for it, you can
  ignore this email: nobody can sign in without the code."
- **Order paid:** "Hi {{name}}, thank you. We've received ₹{{amount}} for order {{order}}: {{items}}. We'll email you
  when it ships." Button: *Your orders*.
- **Order shipped:** "Hi {{name}}, order {{order}} is on its way with {{courier}}. Tracking number: {{awb}}." Button:
  *Track your order*.
- **Order delivered:** "Hi {{name}}, order {{order}} has been delivered. If anything isn't right, tell us from your
  orders page and we'll put it right." Button: *Your orders*.
- **Order cancelled:** "Hi {{name}}, order {{order}} has been cancelled. Your refund follows to the way you paid."
  Button: *Your orders*.

Order emails go to the email address given at checkout, when there is one. The sign-in code email is used by the
local preview; the live site's email codes are still sent by Supabase.

## 4. Variable values the site sends

| Variable | Example | Notes |
|---|---|---|
| name | `Asha` | First word of the delivery name, at most 30 characters |
| order | `BCC-1A2B3C4D` | |
| amount | `1,299` | Rupees, Indian digit grouping, no symbol (the template carries `Rs.` or `₹`) |
| items | `Vitamin D3 + K2 × 2, Omega-3 × 1` | Email only |
| courier | `Delhivery` | |
| awb | `1234567890123` | Tracking number |
| link | `https://…/account/orders` | The customer's orders page |
| code | `482913` | 6 digits |
| minutes | `5` | |

## 5. Note on WhatsApp consent

Meta allows order messages only to people who agreed to get them on WhatsApp. The site sends a WhatsApp order message
only when the order says the customer asked for it (`contact.whatsapp_updates`, from a "Send order updates on
WhatsApp" box at checkout). The account's WhatsApp preference is labelled as optional marketing, so it does not count.
The checkout box is not on the page yet, so no WhatsApp order message is sent until it is added.
